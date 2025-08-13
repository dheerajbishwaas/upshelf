'use client';

import { useEffect, useState } from 'react';
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

    const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || '';

    createApp({
      apiKey,
      host,
      forceRedirect: true,
    });
  }, [shop, host, router]); 

  return <div>Shop: {shop} <br /> Host: {host}</div>;
}
