import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Store from '@/lib/models/store.model';

function verifyHmac(params: URLSearchParams, secret: string) {
  const paramsObj: Record<string, string> = {};
  params.forEach((value, key) => {
    if (key !== 'hmac' && key !== 'signature') paramsObj[key] = value;
  });

  const message = Object.keys(paramsObj)
    .sort()
    .map(key => `${key}=${paramsObj[key]}`)
    .join('&');

  const generatedHmac = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  const hmac = params.get('hmac')!;
  return generatedHmac === hmac;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    const shop = params.get('shop');
    const code = params.get('code');
    const hmac = params.get('hmac');

    if (!shop || !code || !hmac) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // HMAC Verify
    if (!verifyHmac(params, process.env.SHOPIFY_API_SECRET!)) {
      return NextResponse.json({ error: 'Invalid HMAC' }, { status: 400 });
    }

    // Exchange code for access token
    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      }),
    });

    // Debug: raw text response (remove in production)
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("Error parsing JSON:", err);
      return NextResponse.json({ error: 'Invalid JSON response from Shopify', raw: text }, { status: 500 });
    }

    if (data.access_token) {
      // Save or update the store in DB

      await Store.upsert({
        shop,
        access_token: data.access_token,
        refresh_token: data.refresh_token || null,
        scope: data.scope || null,
        expires_at: data.expires_in || null,
        updatedAt: new Date(),
      });
      const redirectUrl = `https://${shop}/admin/apps/upshelf`;
      // const redirectUrl = `${process.env.APP_URL}/?shop=${shop}`;
      return NextResponse.redirect(redirectUrl);
    } else {
      return NextResponse.json({ error: 'Failed to get token', details: data }, { status: 400 });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
