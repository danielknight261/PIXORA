import fs from "node:fs";
import path from "node:path";
import os from "os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const PRODUCT_ID = "gid://shopify/Product/15933348086104";

function loadToken() {
  const kit = JSON.parse(
    fs.readFileSync(
      path.join(
        os.homedir(),
        "AppData/Roaming/shopify-cli-kit-nodejs/Config/config.json"
      ),
      "utf8"
    )
  );
  const account = Object.values(
    JSON.parse(kit.sessionStore)["accounts.shopify.com"]
  )[0];
  const shopKey = Object.keys(account.applications).find((k) =>
    k.startsWith(SHOP)
  );
  return account.applications[shopKey].accessToken;
}

function classify(title) {
  const t = String(title).toLowerCase();
  const size = (title.split(" / ").slice(1).join(" / ") || title).trim();
  const m = size.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
  const square = m && Number(m[1]) === Number(m[2]);
  let orient = "portrait";
  if (t.includes("horiz") || t.includes("land")) orient = "landscape";
  else if (t.includes("square")) orient = "square";
  else if (t.includes("vert") || t.includes("port")) orient = "portrait";
  if (square) orient = "square";
  return { orient, size };
}

const token = loadToken();
const variants = [];
let cursor = null;
let product = null;
for (;;) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `query ($id: ID!, $cursor: String) {
        product(id: $id) {
          id title handle vendor status descriptionHtml
          collections(first: 10) { nodes { handle } }
          variants(first: 50, after: $cursor) {
            pageInfo { hasNextPage endCursor }
            nodes {
              id title sku price
              selectedOptions { name value }
              media(first: 5) {
                nodes { ... on MediaImage { id image { url } } }
              }
            }
          }
        }
      }`,
      variables: { id: PRODUCT_ID, cursor },
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  product = json.data.product;
  variants.push(...product.variants.nodes);
  if (!product.variants.pageInfo.hasNextPage) break;
  cursor = product.variants.pageInfo.endCursor;
}

const rows = variants.map((v) => {
  const c = classify(v.title);
  return {
    id: v.id.split("/").pop(),
    gid: v.id,
    title: v.title,
    sku: v.sku,
    price: v.price,
    options: v.selectedOptions,
    ...c,
  };
});

const byOrient = {};
for (const r of rows) byOrient[r.orient] = (byOrient[r.orient] || 0) + 1;
console.log({
  handle: product.handle,
  vendor: product.vendor,
  status: product.status,
  collections: product.collections.nodes.map((c) => c.handle),
  variants: rows.length,
  byOrient,
  descHasGelato: String(product.descriptionHtml || "").includes(
    "data-gelato-customization"
  ),
  samplePrice: rows[0],
});
fs.writeFileSync(
  "downloads/fine-art-variants-classed.json",
  JSON.stringify(rows, null, 2)
);
fs.writeFileSync(
  "downloads/fine-art-product-meta.json",
  JSON.stringify(
    {
      id: product.id,
      handle: product.handle,
      vendor: product.vendor,
      descriptionHtml: product.descriptionHtml,
    },
    null,
    2
  )
);
