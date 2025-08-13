import { NextResponse } from "next/server";
import sequelize from "@/lib/db";
import Product from "@/lib/models/product.model";
import Store from "@/lib/models/store.model";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const p = JSON.parse(rawBody);
    const shop = req.headers.get("x-shopify-shop-domain");

    await sequelize.authenticate();
    await Product.sync();

    const store = await Store.findOne({ where: { shop } });

    const firstVariant = p.variants?.[0] || {};
    const totalInventory = p.variants?.reduce(
      (acc: number, v: Record<string, unknown>) =>
        acc + (typeof v.inventory_quantity === 'number' ? v.inventory_quantity : 0),
      0
    );

    await Product.upsert({
      externalProductId: p.id,
      store_id: store?.id || null,
      name: p.title,
      price: parseFloat(firstVariant.price) || 0,

      handle: p.handle || null,
      title: p.title || null,
      body_html: p.body_html || null,
      vendor: p.vendor || null,
      product_category: p.product_type || null,
      type: p.product_type || null,
      tags: p.tags || null,
      published: p.status === "active",

      option1_name: p.options?.[0]?.name || null,
      option1_value: firstVariant.option1 || null,
      option2_name: p.options?.[1]?.name || null,
      option2_value: firstVariant.option2 || null,
      option3_name: p.options?.[2]?.name || null,
      option3_value: firstVariant.option3 || null,

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

      image_src: p.images?.[0]?.src || null,
      image_position: p.images?.[0]?.position || null,
      image_alt_text: p.images?.[0]?.alt || null,
      variant_image : firstVariant.image_id
        ? p.images?.find(
          (img: { id: number; src: string }) => img.id === firstVariant.image_id
        )?.src
        : null,

      gift_card: p.tags?.toLowerCase().includes("gift card") || false,

      seo_title: p.title || null,
      seo_description: p.body_html || null,

      variant_weight_unit: firstVariant.weight_unit || null,
      variant_tax_code: firstVariant.tax_code || null,
      cost_per_item: firstVariant.cost || null,

      status: p.status || null,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const e = error as { message?: string };
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 });
  }
}
