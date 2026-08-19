import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;

function loadToken() {
  const cfgPath = path.join(
    os.homedir(),
    "AppData/Roaming/shopify-cli-store-nodejs/Config/config.json"
  );
  const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
  const key = Object.keys(cfg).find((k) => k.includes("hxbghe"));
  const sess = Object.values(cfg[key]?.sessionsByUserId || {})[0];
  if (!sess?.accessToken) throw new Error("No token");
  return sess.accessToken;
}

async function gql(token, query, variables) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data;
}

const token = loadToken();
const d = await gql(
  token,
  `query {
    products(first: 80, query: "mug OR bottle OR latte OR enamel OR porcelain OR travel") {
      nodes {
        id title handle status
        options { name values }
        variantsCount { count }
        priceRangeV2 { minVariantPrice { amount currencyCode } }
        collections(first: 10) { nodes { handle } }
      }
    }
  }`
);

for (const p of d.products.nodes) {
  console.log(
    JSON.stringify({
      handle: p.handle,
      title: p.title,
      status: p.status,
      vars: p.variantsCount.count,
      from: p.priceRangeV2.minVariantPrice.amount,
      opts: p.options.map((o) => `${o.name}(${o.values.length})`),
      cols: p.collections.nodes.map((c) => c.handle),
    })
  );
}
