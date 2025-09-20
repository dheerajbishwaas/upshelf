import { NextResponse } from 'next/server';
import sequelize from '@/lib/db';
import Order from '@/lib/models/order.model';
import Store from '@/lib/models/store.model';
import OrderLineItem from '@/lib/models/orderLineItem.model';
import OrderFulfillment from '@/lib/models/orderFulfillment.model';
import OrderTaxLine from '@/lib/models/orderTaxLine.model';

async function fetchOrders(shop: string, access_token: string) {
  const apiVersion = process.env.SHOPIFY_API_VERSION;
  const response = await fetch(
    `https://${shop}/admin/api/${apiVersion}/orders.json?status=any`,
    {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch orders: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return data.orders as unknown[];
}

async function saveOrders(shop: string, orders: unknown[]) {

    const store = await Store.findOne({ where: { shop } });
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });


  for (const o of orders) {
    try {
      const orderId = o.id;
      if (!orderId) continue;

      // ✅ Save/Update order
      await Order.upsert({
        id: orderId,
        shopDomain: shop,
        storeId: store.id,
        orderNumber: o.order_number,
        name: o.name,
        confirmationNumber: o.confirmation_number,
        email: o.email,
        financialStatus: o.financial_status,
        fulfillmentStatus: o.fulfillment_status,
        currency: o.currency,
        subtotalPrice: parseFloat(o.subtotal_price ?? '0'),
        totalPrice: parseFloat(o.total_price ?? '0'),
        totalTax: parseFloat(o.total_tax ?? '0'),
        totalDiscounts: parseFloat(o.total_discounts ?? '0'),
        totalWeight: o.total_weight,
        processedAt: o.processed_at ? new Date(o.processed_at) : null,
        createdAt: o.created_at ? new Date(o.created_at) : null,
        updatedAt: o.updated_at ? new Date(o.updated_at) : null,
        closedAt: o.closed_at ? new Date(o.closed_at) : null,
        customerId: o.customer?.id ?? null,
        locationId: o.location_id,
        tags: o.tags ?? '',
        rawJson: o, // keep full order JSON
      });

      // ✅ Save line items
      if (Array.isArray(o.line_items)) {
        for (const li of o.line_items) {
          await OrderLineItem.upsert({
            id: li.id,
            orderId,
            shopDomain: shop,
            storeId: store.id,
            productId: li.product_id,
            variantId: li.variant_id,
            sku: li.sku,
            title: li.title,
            variantTitle: li.variant_title,
            vendor: li.vendor,
            quantity: li.quantity,
            price: parseFloat(li.price ?? '0'),
            grams: li.grams,
            fulfillmentStatus: li.fulfillment_status,
            giftCard: li.gift_card,
            taxable: li.taxable,
            totalDiscount: parseFloat(li.total_discount ?? '0'),
          });
        }
      }

      // ✅ Save fulfillments
      if (Array.isArray(o.fulfillments)) {
        for (const f of o.fulfillments) {
          await OrderFulfillment.upsert({
            id: f.id,
            orderId,
            shopDomain: shop,
            storeId: store.id,
            status: f.status,
            service: f.service,
            createdAt: f.created_at ? new Date(f.created_at) : null,
            updatedAt: f.updated_at ? new Date(f.updated_at) : null,
            trackingCompany: f.tracking_company,
            trackingNumber: f.tracking_number,
            trackingUrl: f.tracking_url,
          });
        }
      }

      // ✅ Save tax lines
      if (Array.isArray(o.tax_lines)) {
        for (const t of o.tax_lines) {
          await OrderTaxLine.upsert({
            orderId,
            shopDomain: shop,
            storeId: store.id,
            title: t.title,
            rate: parseFloat(t.rate ?? '0'),
            price: parseFloat(t.price ?? '0'),
          });
        }
      }
    } catch (err) {
      console.error(`Failed saving order ${o.id}:`, err);
    }
  }
}

export async function POST(req: Request) {
  try {
    const { shop } = (await req.json()) as { shop: string };

    await sequelize.authenticate();
    await Promise.all([
      Order.sync(),
      OrderLineItem.sync(),
      OrderFulfillment.sync(),
      OrderTaxLine.sync(),
    ]);

    const store = await Store.findOne({ where: { shop } });
    if (!store)
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const orders = await fetchOrders(shop, store.access_token);
    await saveOrders(shop, orders);

    return NextResponse.json(
      { message: 'Orders synced successfully' },
      { status: 200 }
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
