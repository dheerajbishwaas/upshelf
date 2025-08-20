async function createWebhook(shop: string, access_token: string) {
  const webhookEvents = [
    { topic: 'products/create', address: `${process.env.APP_URL}/api/webhooks/products/create` },
    { topic: 'products/update', address: `${process.env.APP_URL}/api/webhooks/products/update` },
    { topic: 'products/delete', address: `${process.env.APP_URL}/api/webhooks/products/delete` },
    // { topic: 'orders/create', address: `${process.env.APP_URL}/api/webhooks/orders/create` }
  ];

  for (const webhook of webhookEvents) {
    try {
      const res = await fetch(`https://${shop}/admin/api/2025-01/webhooks.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': access_token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          webhook: {
            topic: webhook.topic,
            address: webhook.address,
            format: 'json'
          }
        })
      });

      if (!res.ok) {
        console.error(`❌ Failed to create webhook for ${shop} - ${webhook.topic}`, await res.text());
      }
    } catch (err) {
      console.error(`⚠️ Error creating webhook for ${shop} - ${webhook.topic}`, err);
    }
  }

  console.log(`✅ Webhooks created for ${shop}`);
}

export async function createShopWebhooks(shop: string, access_token: string) {
  createWebhook(shop, access_token)
    .then(() => console.log(`Background webhook creation started for ${shop}`))
    .catch(err => console.error(`Webhook creation failed for ${shop}`, err));
}
