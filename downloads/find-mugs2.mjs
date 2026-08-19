import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const ONLINE = "gid://shopify/Publication/333315113304";

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

// Broader search including drafts
const d = await gql(
  token,
  `query {
    products(first: 50, query: "mug OR bottle OR ceramic") {
      nodes {
        id title handle status
        options { name values }
        variantsCount { count }
        priceRangeV2 { minVariantPrice { amount currencyCode } }
      }
    }
  }`
);
console.log("ALL mug/bottle/ceramic:");
for (const p of d.products.nodes) {
  console.log(
    p.status,
    p.handle,
    "|",
    p.title,
    "|",
    p.variantsCount.count,
    "|",
    p.priceRangeV2.minVariantPrice.amount
  );
}

// Also try exact titles
for (const title of [
  "White 11oz Ceramic Mug",
  "White 15oz Ceramic Mug",
  "White 11oz Ceramic Mug with Color Inside",
  "White 17oz Stainless Steel Water Bottle",
]) {
  const r = await gql(
    token,
    `query($q:String!){ products(first:5, query:$q){ nodes{ id handle title status } } }`,
    { q: `title:'${title}'` }
  );
  console.log("TITLE", title, "=>", r.products.nodes.map((n) => `${n.handle}/${n.status}`));
}
