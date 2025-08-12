import { NextResponse } from "next/server";
import sequelize from "@/lib/db";
import Product from "@/lib/models/product.model";
import Store from "@/lib/models/store.model";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    if (!rawBody) {
      return NextResponse.json({ success: false, message: "Empty body" }, { status: 400 });
    }

    let p;
    try {
      p = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
    }

    const shop = req.headers.get("x-shopify-shop-domain");
    if (!shop) {
      return NextResponse.json({ success: false, message: "Shop header missing" }, { status: 400 });
    }

    await sequelize.authenticate();

    const store = await Store.findOne({ where: { shop } });
    if (!store) {
      return NextResponse.json({ success: false, message: "Store not found" }, { status: 404 });
    }

    // Soft delete product (deletedAt set hoga)
    await Product.update(
    { is_deleted: 1 },
    { where: { externalProductId: p.id, store_id: store.id } }
    );
    const deletedCount = await Product.destroy({
      where: {
        externalProductId: p.id,
        store_id: store.id
      }
    });

    console.log(`🗑️ Soft deleted ${deletedCount} product(s) for store: ${shop}`);

    return NextResponse.json({ success: true, deletedCount }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Product delete webhook failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
