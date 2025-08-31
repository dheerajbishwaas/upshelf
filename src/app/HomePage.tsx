'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import createApp from '@shopify/app-bridge';

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const shop = searchParams.get('shop');
  const host = searchParams.get('host');

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!shop) {
      router.replace('/error?message=Missing shop parameter');
      return;
    }

    if (!host) {
      router.replace('/error?message=Missing host parameter');
      return;
    }

    createApp({
      apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY!,
      host,
      forceRedirect: true,
    });

    (async () => {
      const res = await fetch(`/api/check-install?shop=${shop}`);
      const data = await res.json();
      console.log('Check install response:', data);
      if (!data.installed) {
        window.location.href = `/api/install?shop=${shop}`;
      }
    })();
  }, [shop, host, router]);

  async function handleImportProducts() {
    if (!shop) return;

    setLoadingProducts(true);
    setMessage('');

    try {
      const res = await fetch(`/api/products?shop=${shop}`, { method: 'POST' });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Expected JSON but got: ${text.substring(0, 200)}`);
      }

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Products imported successfully: ${data.count} products`);
      } else {
        setMessage(`❌ Error importing products: ${data.error || 'Unknown error'}`);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      setMessage(`Error: ${err.message || 'Unknown error'}`);
    } finally {
      setLoadingProducts(false);
    }
  }

  async function handleSyncOrders() {
    if (!shop) return;

    setLoadingOrders(true);
    setMessage('');

    try {
      const res = await fetch(`/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Orders synced successfully`);
      } else {
        setMessage(`❌ Error syncing orders: ${data.error || 'Unknown error'}`);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      setMessage(`Error: ${err.message || 'Unknown error'}`);
    } finally {
      setLoadingOrders(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-semibold text-gray-900 mb-6">Welcome to UpShelf</h1>

      <div className="mb-8 space-y-2">
        <p className="text-lg text-gray-700">
          <span className="font-medium">Shop:</span> {shop}
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-medium">Host:</span> {host}
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={handleImportProducts}
          disabled={loadingProducts}
          className={`px-5 py-3 rounded-md text-white font-semibold transition ${loadingProducts ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
        >
          {loadingProducts ? 'Importing Products...' : 'Import Products'}
        </button>

        <button
          onClick={handleSyncOrders}
          disabled={loadingOrders}
          className={`px-5 py-3 rounded-md text-white font-semibold transition ${loadingOrders ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {loadingOrders ? 'Syncing Orders...' : 'Sync Orders'}
        </button>

        <button
          onClick={() => router.push(`/analytics?shop=${shop}`)}
          className="px-5 py-3 rounded-md text-white font-semibold transition bg-purple-600 hover:bg-purple-700"
        >
          View Product Analytics
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md text-sm font-medium ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          role="alert"
        >
          {message}
        </div>
      )}
    </div>
  );
}
