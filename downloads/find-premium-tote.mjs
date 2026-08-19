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
const queries = [
  "title:tote",
  "title:Premium",
  "title:*Tote*",
  "handle:premium*",
  "status:draft",
  "status:active tote",
];

for (const q of queries) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `query($q:String!){ products(first:20, query:$q){ nodes{ id title handle status } } }`,
      variables: { q },
    }),
  });
  const json = await res.json();
  console.log("\nQUERY:", q);
  for (const p of json.data?.products?.nodes || []) {
    console.log(" ", p.status, p.handle, "|", p.title);
  }
}
