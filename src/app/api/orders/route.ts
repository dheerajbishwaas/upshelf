import { NextResponse } from 'next/server';
import sequelize from '@/lib/db';
import Order from '@/lib/models/order.model';
import Store from '@/lib/models/store.model';

async function fetchOrders(shop: string, access_token: string) {
  const response = await fetch(`https://${shop}/admin/api/2023-07/orders.json?status=any`, {
    headers: {
      'X-Shopify-Access-Token': access_token,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }

  const data = await response.json();
  return data.orders as Record<string, unknown>[];
}

async function saveOrders(shop: string, orders: Record<string, unknown>[]) {
  for (const o of orders) {
    // Safer access with type assertion + optional chaining
    const id = o.id as number | undefined;
    const totalPrice = parseFloat((o.total_price as string) ?? '0');
    const createdAtStr = o.created_at as string | undefined;

    if (!id || !createdAtStr) continue; // skip invalid entries

    await Order.upsert({
      externalOrderId: id,
      store: shop,
      totalPrice,
      createdAt: new Date(createdAtStr),
    });
  }
}

export async function POST(req: Request) {
  try {
    const { shop } = (await req.json()) as { shop: string };

    await sequelize.authenticate();
    await Order.sync();

    const store = await Store.findOne({ where: { shop } });
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const orders = await fetchOrders(shop, store.access_token);
    await saveOrders(shop, orders);

    return NextResponse.json({ message: 'Orders synced successfully' }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
