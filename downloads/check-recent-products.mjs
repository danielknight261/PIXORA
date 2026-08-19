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
  return sess.accessToken;
}

const token = loadToken();
const res = await fetch(API, {
  method: "POST",
  headers: {
    "X-Shopify-Access-Token": token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    query: `{
      products(first: 50, sortKey: CREATED_AT, reverse: true) {
        nodes { title handle status createdAt }
      }
      collectionByHandle(handle: "tote-bags") {
        productsCount { count }
        products(first: 10) { nodes { title handle } }
      }
    }`,
  }),
});
const json = await res.json();
console.log("TOTE COLLECTION:", json.data.collectionByHandle);
console.log("\nNEWEST PRODUCTS:");
for (const p of json.data.products.nodes.slice(0, 25)) {
  console.log(p.createdAt.slice(0, 16), p.status, p.handle, "|", p.title);
}
