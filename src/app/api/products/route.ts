import { NextResponse } from 'next/server';
import sequelize from '@/lib/db';
import Product from '@/lib/models/product.model';
import Store from '@/lib/models/store.model';

export async function GET() {
  try {
    await sequelize.authenticate();
    await Product.sync();

    const products = await Product.findAll();
    return NextResponse.json(products);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { shop } = await req.json();

    await sequelize.authenticate();
    await Product.sync();

    const store = await Store.findOne({ where: { shop } });
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const response = await fetch(`https://${shop}/admin/api/2023-07/products.json`, {
      headers: {
        'X-Shopify-Access-Token': store.accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch products from Shopify' }, { status: 500 });
    }

    const data = await response.json();

    for (const p of data.products) {
      await Product.upsert({
        externalProductId: p.id,
        store: shop,
        name: p.title,
        price: parseFloat(p.variants[0]?.price) || 0,
      });
    }

    return NextResponse.json({ message: 'Products synced successfully' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
