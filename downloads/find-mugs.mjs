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
const queries = [
  "title:*mug*",
  "title:*bottle*",
  "title:*Mug*",
  "title:*Bottle*",
];
const seen = new Set();
for (const q of queries) {
  const d = await gql(
    token,
    `query($q:String!){
      products(first:50, query:$q){
        nodes{
          id title handle status
          options{name values}
          variantsCount{count}
          priceRangeV2{minVariantPrice{amount currencyCode}}
          collections(first:10){nodes{handle title}}
        }
      }
    }`,
    { q }
  );
  for (const p of d.products.nodes) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    console.log(
      JSON.stringify(
        {
          handle: p.handle,
          title: p.title,
          status: p.status,
          vars: p.variantsCount.count,
          from: p.priceRangeV2.minVariantPrice,
          opts: p.options.map((o) => `${o.name}=[${o.values.join(",")}]`),
          cols: p.collections.nodes.map((c) => c.handle),
        },
        null,
        0
      )
    );
  }
}

const cols = await gql(
  token,
  `{
    collections(first:30, query:"title:*mug* OR title:*gift* OR title:*bottle* OR handle:home-gifts OR handle:mugs"){
      nodes{id handle title productsCount{count}}
    }
  }`
);
console.log("\nCOLLECTIONS:");
for (const c of cols.collections.nodes) {
  console.log(c.handle, c.title, c.productsCount?.count, c.id);
}
