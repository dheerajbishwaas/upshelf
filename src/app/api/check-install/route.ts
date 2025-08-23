import { NextResponse } from 'next/server';
import Store from '@/lib/models/store.model'; // tumhare model ka path

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get('shop');

  if (!shop) {
    return NextResponse.json(
      { error: 'Missing shop parameter' },
      { status: 400 }
    );
  }

  try {
    // DB me check karo ki store already install hai ya nahi
    const existingStore = await Store.findOne({ where: { shop } });

    if (existingStore) {
      return NextResponse.json({
        installed: true,
        shop: existingStore.shop,
        installed_at: existingStore.installed_at,
      });
    } else {
      return NextResponse.json({ installed: false });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
