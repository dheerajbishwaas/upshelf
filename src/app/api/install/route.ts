import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  const clientId = process.env.SHOPIFY_API_KEY;
  const scopes = 'read_products,read_orders,read_customers';
  const redirectUri = `${process.env.APP_URL}/api/auth/callback`;

  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}&response_type=code`;
  console.log(`Redirecting to install URL: ${installUrl}`);
  return NextResponse.redirect(installUrl);
}
