// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { NextResponse } from 'next/server';
import sequelize from '@/lib/db';
import Product from '@/lib/models/product.model';
import Variant from '@/lib/models/variant.model';
import ProductImage from '@/lib/models/image.model';
import Store from '@/lib/models/store.model';
import { createShopWebhooks } from '@/app/workers/webhookWorker';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');
  if (!shop) return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });

  try {
    await sequelize.authenticate();
    await Product.sync();
    await Variant.sync();
    await ProductImage.sync();

    const store = await Store.findOne({ where: { shop } });
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    //Queue me webhook creation
    // await publishToQueue('create-webhook', { shop, access_token: store.access_token });
    await createShopWebhooks(shop, store.access_token);

    const apiVersion = process.env.SHOPIFY_API_VERSION;

    let hasNextPage = true;
    let endCursor: string | null = null;
    let count = 0;
    let query = '';
    while (hasNextPage) {
      query = `
      {
        products(first: 50 ${endCursor ? `, after: "${endCursor}"` : ''}) {
          edges {
            cursor
            node {
              id
              title
              handle
              vendor
              productType
              status
              tags
              descriptionHtml
              variants(first: 50) {
                edges {
                  node {
                    id
                    title
                    sku
                    price
                    compareAtPrice
                    barcode
                    inventoryQuantity
                    inventoryPolicy
                    taxable
                    selectedOptions {
                      name
                      value
                    }
                    image {
                      id
                      url
                    }
                  }
                }
              }
              images(first: 50) {
                edges {
                  node {
                    id
                    url
                    altText
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }`;

      const response = await fetch(`https://${shop}/admin/api/${apiVersion}/graphql.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': store.access_token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) return NextResponse.json({ error: 'Failed to fetch products from Shopify' }, { status: 500 });

      const result = await response.json();
      const products = result.data.products.edges.map((e: any) => e.node);

      for (const p of products) {
        const [product] = await Product.upsert({
          externalProductId: p.id.split('/').pop(),
          store_id: store.id,
          title: p.title,
          handle: p.handle,
          vendor: p.vendor,
          body_html: p.descriptionHtml,
          product_category: p.productType,
          type: p.productType,
          tags: p.tags?.join(', '),
          published: p.status === 'ACTIVE',
          status: p.status,
        }, { returning: true });

        // Images
        for (const imgEdge of p.images.edges) {
          const img = imgEdge.node;
          await ProductImage.upsert({
            product_id: product.id,
            externalImageId: img.id.split('/').pop(),
            url: img.url,
            alt_text: img.altText || null,
          });
        }

        // Variants
        for (const vEdge of p.variants.edges) {
          const v = vEdge.node;
          await Variant.upsert({
            externalVariantId: v.id.split('/').pop(),
            product_id: product.id,
            sku: v.sku,
            price: parseFloat(v.price) || 0,
            compare_at_price: parseFloat(v.compareAtPrice) || null,
            inventory_qty: v.inventoryQuantity || 0,
            inventory_policy: v.inventoryPolicy || null,
            taxable: v.taxable || false,
            requires_shipping: false,
            option1: v.selectedOptions[0]?.value || null,
            option2: v.selectedOptions[1]?.value || null,
            option3: v.selectedOptions[2]?.value || null,
            barcode: v.barcode || null,
            variant_image_url: v.image?.url || null,
          }, { returning: true });
        }

        count++;
      }

      hasNextPage = result.data.products.pageInfo.hasNextPage;
      endCursor = result.data.products.pageInfo.endCursor;
    }

    return NextResponse.json({ count }, { status: 200 });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 });
  }
}
