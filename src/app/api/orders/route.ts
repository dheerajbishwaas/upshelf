// src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import sequelize from '@/lib/db';
import Order from '@/lib/models/order.model';
import Store from '@/lib/models/store.model';

async function fetchOrders(shop: string, accessToken: string) {
  const response = await fetch(`https://${shop}/admin/api/2023-07/orders.json?status=any`, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }

  const data = await response.json();
  return data.orders;
}

// async function saveOrders(shop: string, orders: any[]) {
//   for (const o of orders) {
//     await Order.upsert({
//       externalOrderId: o.id,
//       store: shop,
//       totalPrice: parseFloat(o.total_price) || 0,
//       createdAt: new Date(o.created_at),
//     });
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const { shop } = await req.json();

//     await sequelize.authenticate();
//     await Order.sync();

//     const store = await Store.findOne({ where: { shop } });
//     if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

//     const orders = await fetchOrders(shop, store.accessToken);
//     await saveOrders(shop, orders);

//     return NextResponse.json({ message: 'Orders synced successfully' }, { status: 200 });
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
