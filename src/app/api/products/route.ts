import { NextResponse } from 'next/server';
import sequelize from '@/lib/db';
import { createShopWebhooks } from '@/app/workers/webhookWorker';
import Product from '@/lib/models/product.model';
import Store from '@/lib/models/store.model';

export async function GET() {
  try {
    await sequelize.authenticate();
    await Product.sync();

    const products = await Product.findAll();
    return NextResponse.json(products);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  try {
    await sequelize.authenticate();
    await Product.sync();

    const store = await Store.findOne({ where: { shop } });
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    //Queue me webhook creation
    // await publishToQueue('create-webhook', { shop, access_token: store.access_token });
    await createShopWebhooks(shop, store.access_token);

    const response = await fetch(`https://${shop}/admin/api/2023-07/products.json`, {
      headers: {
        'X-Shopify-Access-Token': store.access_token,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch products from Shopify' }, { status: 500 });
    }

    const data = await response.json();

    let count = 0;
    for (const p of data.products) {
      // For variants, usually array; take first variant as main or aggregate data as needed
      const firstVariant = p.variants[0] || {};

      // Sum inventory quantity from all variants
      const totalInventory = p.variants.reduce((acc, v) => acc + (v.inventory_quantity || 0), 0);

      await Product.upsert({
        externalProductId: p.id,
        store_id: store.id,
        name: p.title,
        price: parseFloat(firstVariant.price) || 0,

        // New fields from Shopify product object:
        handle: p.handle || null,
        title: p.title || null,
        body_html: p.body_html || null,
        vendor: p.vendor || null,
        product_category: p.product_type || null,  // Shopify calls it product_type
        type: p.product_type || null,
        tags: p.tags || null,
        published: p.status === 'active',  // Shopify product status can be active/draft/archived

        // Options (assuming max 3)
        option1_name: p.options[0]?.name || null,
        option1_value: firstVariant.option1 || null,
        option2_name: p.options[1]?.name || null,
        option2_value: firstVariant.option2 || null,
        option3_name: p.options[2]?.name || null,
        option3_value: firstVariant.option3 || null,

        // Variant details
        variant_sku: firstVariant.sku || null,
        variant_grams: firstVariant.grams || null,
        variant_inventory_tracker: firstVariant.inventory_management || null,
        variant_inventory_qty: totalInventory,
        variant_inventory_policy: firstVariant.inventory_policy || null,
        variant_fulfillment_service: firstVariant.fulfillment_service || null,
        variant_price: parseFloat(firstVariant.price) || 0,
        variant_compare_at_price: parseFloat(firstVariant.compare_at_price) || null,
        variant_requires_shipping: firstVariant.requires_shipping || false,
        variant_taxable: firstVariant.taxable || false,
        variant_barcode: firstVariant.barcode || null,

        // Images
        image_src: p.images[0]?.src || null,
        image_position: p.images[0]?.position || null,
        image_alt_text: p.images[0]?.alt || null,
        variant_image: firstVariant.image_id ? p.images.find(img => img.id === firstVariant.image_id)?.src : null,

        // Gift card flag
        gift_card: p.tags?.toLowerCase().includes('gift card') || false,

        // SEO
        seo_title: p.title || null,
        seo_description: p.body_html || null,

        // Google Shopping fields: (if you have metafields or tags for these, map accordingly)
        google_shopping_product_category: null,
        google_shopping_gender: null,
        google_shopping_age_group: null,
        google_shopping_mpn: null,
        google_shopping_condition: null,
        google_shopping_custom_product: null,

        variant_weight_unit: firstVariant.weight_unit || null,
        variant_tax_code: firstVariant.tax_code || null,
        cost_per_item: firstVariant.cost || null,

        // Pricing US and International - if you have multi-currency or custom logic, add here
        included_united_states: null,
        price_united_states: null,
        compare_at_price_united_states: null,
        included_international: null,
        price_international: null,
        compare_at_price_international: null,

        status: p.status || null,
      });
      count++;
    }

    return NextResponse.json({ count }, { status: 200 });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 });
  }
}
