import { NextResponse } from 'next/server';
import sequelize from '@/lib/db';
import Product from '@/lib/models/product.model';
import Variant from '@/lib/models/variant.model';
import Order from '@/lib/models/order.model';
import OrderLineItem from '@/lib/models/orderLineItem.model';
import Store from '@/lib/models/store.model';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get('shop');

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  try {
    await sequelize.authenticate();

    const store = await Store.findOne({ where: { shop } });
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    // Products
    const products = await Product.findAll({
      where: { store_id: store.id },
      include: [{ model: Variant, as: 'variants' }],
    }) as ProductWithVariants[];

    type ProductWithVariants = Product & { 
      variants?: Variant[];
      published?: boolean; // Add this line
      title?: string;      // Add if you use title below
      externalProductId?: number; // Add if you use externalProductId below
    };

    const totalProducts = products.length;
    const totalVariants = products.reduce(
      (acc, p) => acc + (p.variants?.length || 0),
      0
    );
    const totalInventory = products.reduce(
      (acc, p) => acc + (p.variants?.reduce((vAcc, v) => vAcc + (v.inventory_qty || 0), 0) || 0),
      0
    );

    const publishedProducts = products.filter((p) => p.published).length;
    const draftProducts = totalProducts - publishedProducts;

    // Orders
    const orders = await Order.findAll({ where: { storeId: store.id } });
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

    // Fulfillment status breakdown
    const fulfillmentStatusCounts: Record<string, number> = {};
    for (const o of orders) {
      const status = o.fulfillmentStatus || 'unfulfilled';
      fulfillmentStatusCounts[status] = (fulfillmentStatusCounts[status] || 0) + 1;
    }

    // Top-selling products by quantity
    const lineItems = await OrderLineItem.findAll({ where: { storeId: store.id } });
    const productSalesMap: Record<number, { quantity: number; revenue: number }> = {};
    for (const li of lineItems) {
      const pid = li.productId!;
      productSalesMap[pid] = productSalesMap[pid] || { quantity: 0, revenue: 0 };
      productSalesMap[pid].quantity += li.quantity || 0;
      productSalesMap[pid].revenue += (li.price || 0) * (li.quantity || 0);
    }

    const topProducts = Object.entries(productSalesMap)
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 10)
      .map(([pid, stats]) => {
        const p = products.find((pr) => pr.externalProductId === parseInt(pid));
        return {
          productId: pid,
          title: p?.title,
          quantitySold: stats.quantity,
          revenue: stats.revenue,
        };
      });

    // Low stock products
    const lowStockProducts = products
      .filter((p) => p.variants?.some((v) => v.inventory_qty !== null && v.inventory_qty <= 5))
      .map((p) => ({
        productId: p.externalProductId,
        title: p.title,
        lowStockVariants: p.variants?.filter((v) => v.inventory_qty !== null && v.inventory_qty <= 5).map((v) => ({
          variantId: v.externalVariantId,
          title: v.sku,
          inventory: v.inventory_qty,
        })),
      }));

    return NextResponse.json({
      products: {
        total: totalProducts,
        published: publishedProducts,
        draft: draftProducts,
        totalVariants,
        totalInventory,
      },
      orders: {
        total: totalOrders,
        totalRevenue,
        avgOrderValue,
        fulfillmentStatusCounts,
      },
      topProducts,
      lowStockProducts,
    });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 });
  }
}
