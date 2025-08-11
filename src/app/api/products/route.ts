import { NextResponse } from 'next/server';
import Product from '@/lib/models/product.model';
import sequelize from '@/lib/db';

export async function GET() {
  try {
    await sequelize.authenticate();
    await Product.sync(); // First time table create

    const products = await Product.findAll();
    return NextResponse.json(products);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await sequelize.authenticate();
    await Product.sync();

    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
