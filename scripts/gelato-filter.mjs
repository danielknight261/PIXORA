const apiKey = process.env.GELATO_API_KEY;
const catalogUid = process.argv[2] ?? "posters";
const hint = process.argv[3] ?? "";

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
const products = json.products ?? [];

const filtered = hint
  ? products.filter((p) =>
      p.productUid.toLowerCase().includes(hint.toLowerCase()),
    )
  : products;

console.log(`Found ${filtered.length} matching "${hint}" in ${catalogUid}`);
for (const product of filtered.slice(0, 30)) {
  console.log(product.productUid);
}
