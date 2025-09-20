'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

type AnalyticsData = {
  products: {
    total: number;
    published: number;
    draft: number;
    totalVariants: number;
    totalInventory: number;
  };
  orders: {
    total: number;
    totalRevenue: number;
    avgOrderValue: number;
    fulfillmentStatusCounts: Record<string, number>;
  };
  topProducts: {
    productId: number | string;
    title: string;
    quantitySold: number;
    revenue: number;
  }[];
  lowStockProducts: {
    productId: number | string;
    title: string;
    lowStockVariants: {
      variantId: number | string;
      title: string;
      inventory: number;
    }[];
  }[];
};

export default function Page({ shop }: { shop?: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});

  shop = searchParams.get('shop') || shop || '';

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics?shop=${shop}`);
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const json = await res.json();
        setData(json);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError('Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (shop) fetchAnalytics();
  }, [shop]);

  const toggleProduct = (productId: string | number) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!data) return <p>No data available.</p>;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Store Analytics</h2>

      {/* Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow rounded p-4">
          <h3 className="font-semibold text-lg mb-2">Products</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>Total Products: {data.products.total}</li>
            <li>Published: {data.products.published}</li>
            <li>Draft: {data.products.draft}</li>
            <li>Total Variants: {data.products.totalVariants}</li>
            <li>Total Inventory: {data.products.totalInventory}</li>
          </ul>
        </div>

        {/* Orders Summary */}
        <div className="bg-white shadow rounded p-4">
          <h3 className="font-semibold text-lg mb-2">Orders</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>Total Orders: {data.orders.total}</li>
            <li>Total Revenue: ${Number(data.orders.totalRevenue) || 0}</li>
            <li>Average Order Value: ${data.orders.avgOrderValue || 0}</li>
            <li>
              Fulfillment Status:
              <ul className="list-disc ml-5 mt-1">
                {Object.entries(data.orders.fulfillmentStatusCounts).map(([status, count]) => (
                  <li key={status}>
                    {status}: {count}
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white shadow rounded p-4">
        <h3 className="font-semibold text-lg mb-2">Top Selling Products</h3>
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2 text-left">Title</th>
              <th className="border p-2 text-left">Quantity Sold</th>
              <th className="border p-2 text-left">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.topProducts.map((p) => (
              <tr key={p.productId}>
                <td className="border p-2">{p.title}</td>
                <td className="border p-2">{p.quantitySold}</td>
                <td className="border p-2">${p.revenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Low Stock Products */}
      <div className="bg-white shadow rounded p-4">
        <h3 className="font-semibold text-lg mb-2">Low Stock Products</h3>
        {data.lowStockProducts.length === 0 ? (
          <p>All products have sufficient stock.</p>
        ) : (
          <ul className="space-y-2">
            {data.lowStockProducts.map((product) => (
              <li key={product.productId} className="border rounded p-2">
                <button
                  className="flex items-center justify-between w-full font-semibold"
                  onClick={() => toggleProduct(product.productId)}
                >
                  <span>{product.title}</span>
                  {expandedProducts[product.productId] ? (
                    <ChevronDownIcon className="w-5 h-5" />
                  ) : (
                    <ChevronRightIcon className="w-5 h-5" />
                  )}
                </button>
                {expandedProducts[product.productId] && (
                  <ul className="ml-5 mt-2 list-disc space-y-1">
                    {product.lowStockVariants.map((v) => (
                      <li
                        key={v.variantId}
                        className={v.inventory <= 0 ? 'text-red-600 font-bold' : ''}
                      >
                        {v.title} — {v.inventory} left
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
