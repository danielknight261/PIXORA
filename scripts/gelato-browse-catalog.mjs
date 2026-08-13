const apiKey = process.env.GELATO_API_KEY;
if (!apiKey) {
  console.error("Set GELATO_API_KEY");
  process.exit(1);
}

const catalogs = ["canvas", "mugs", "posters"];

for (const catalogUid of catalogs) {
  const response = await fetch(
    `https://product.gelatoapis.com/v3/catalogs/${catalogUid}/products:search`,
    {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ limit: 100, offset: 0 }),
    },
  );

  const json = await response.json();
  if (!response.ok) {
    console.error(catalogUid, json);
    continue;
  }

  const products = json.products ?? json.data?.products ?? [];
  console.log(`\n=== ${catalogUid} (${products.length} products) ===`);
  for (const product of products.slice(0, 40)) {
    const attrs = JSON.stringify(product.attributes ?? {});
    console.log(product.productUid);
    console.log(`  ${attrs.slice(0, 120)}`);
  }
}
