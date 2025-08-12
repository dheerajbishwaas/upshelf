'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import createApp from '@shopify/app-bridge';

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const shop = searchParams.get('shop');
  const host = searchParams.get('host');

  useEffect(() => {
    if (!shop) {
      router.replace('/error?message=Missing shop parameter');
      return;
    }

    if (!host) {
      router.replace('/error?message=Missing host parameter');
      return;
    }

    // Shopify App Bridge init
    const app = createApp({
      apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY!,
      shopOrigin: shop,
      host: host,
      forceRedirect: true,
    });

    (async () => {
      const res = await fetch(`/api/check-install?shop=${shop}`);
      const data = await res.json();

      if (!data.installed) {
        window.location.href = `/api/install?shop=${shop}`;
      }
    })();

  }, [shop, host, router]);

  return (
    <div>
      <h1>Welcome to UpShelf</h1>
      <p>Shop: {shop}</p>
      <p>Host: {host}</p>
    </div>
  );
}
