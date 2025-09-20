/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/track-view/route.ts
import { NextResponse } from "next/server";
// import ProductView from "@/lib/models/productView.model"; // you’ll need to create this

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, shop } = body;

    if (!productId || !shop) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    // await ProductView.create({
    //   shop,
    //   productId,
    //   viewedAt: new Date(),
    // });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("TrackView error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Replace: (view: any) => ...
// With:    (view: { /* expected properties */ }) => ...
// Example: (view: { productId: string }) => ...
