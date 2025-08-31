// app/api/auth/callback/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import Store from "@/lib/models/store.model";

// HMAC verification helper
function verifyHmac(params: URLSearchParams, secret: string) {
  const paramsObj: Record<string, string> = {};
  params.forEach((value, key) => {
    if (key !== "hmac" && key !== "signature") paramsObj[key] = value;
  });

  const message = Object.keys(paramsObj)
    .sort()
    .map((key) => `${key}=${paramsObj[key]}`)
    .join("&");

  const generatedHmac = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("hex");

  const hmac = params.get("hmac")!;
  return generatedHmac === hmac;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    const shop = params.get("shop");
    const code = params.get("code");
    const hmac = params.get("hmac");

    if (!shop || !code || !hmac) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Verify HMAC
    if (!verifyHmac(params, process.env.SHOPIFY_API_SECRET!)) {
      return NextResponse.json({ error: "Invalid HMAC" }, { status: 400 });
    }

    // Exchange code for access token
    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("Error parsing JSON:", err);
      return NextResponse.json(
        { error: "Invalid JSON response from Shopify", raw: text },
        { status: 500 }
      );
    }

    if (data.access_token) {
      // Save or update store in DB
      await Store.upsert({
        shop,
        access_token: data.access_token,
        refresh_token: data.refresh_token || null,
        scope: data.scope || null,
        expires_at: data.expires_in || null,
        updatedAt: new Date(),
      });

      // Add ScriptTag (prevent duplicates)
      const apiVersion = process.env.SHOPIFY_API_VERSION;
      const scriptUrl = `${process.env.APP_URL}/api/product-view.js`;

      const existingTagsRes = await fetch(
        `https://${shop}/admin/api/${apiVersion}/script_tags.json`,
        {
          method: "GET",
          headers: {
            "X-Shopify-Access-Token": data.access_token,
            "Content-Type": "application/json",
          },
        }
      );

      const existingTags = await existingTagsRes.json();
      const alreadyExists = existingTags?.script_tags?.some(
        (tag: any) => tag.src === scriptUrl
      );

      if (!alreadyExists) {
        await fetch(
          `https://${shop}/admin/api/${apiVersion}/script_tags.json`,
          {
            method: "POST",
            headers: {
              "X-Shopify-Access-Token": data.access_token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              script_tag: {
                event: "onload",
                src: scriptUrl,
              },
            }),
          }
        );
      }

      const redirectUrl = `https://${shop}/admin/apps/upshelf-1`;
      return NextResponse.redirect(redirectUrl);
    } else {
      return NextResponse.json(
        { error: "Failed to get token", details: data },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
