// app/api/product-view.js/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const js = `
    document.addEventListener("DOMContentLoaded", () => {
      const productMeta = window?.meta?.product;
      if (productMeta?.id) {
        fetch("${process.env.APP_URL}/api/track-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: productMeta.id,
            shop: Shopify.shop,
          }),
        });
      }
    });
  `;
  return new NextResponse(js, {
    headers: { "Content-Type": "application/javascript" },
  });
}
