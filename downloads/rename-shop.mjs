/**
 * Rename the shop from "My Store" to Pixora (customer-accounts login uses shop.name).
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;

function loadToken() {
  const cfg = JSON.parse(
    fs.readFileSync(
      path.join(os.homedir(), "AppData/Roaming/shopify-cli-store-nodejs/Config/config.json"),
      "utf8"
    )
  );
  const key = Object.keys(cfg).find((k) => k.includes("hxbghe"));
  const sess = Object.values(cfg[key]?.sessionsByUserId || {})[0];
  if (!sess?.accessToken) throw new Error("No token");
  return sess.accessToken;
}

async function gql(token, query, variables) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

async function main() {
  const token = loadToken();
  const before = await gql(token, `{ shop { name } }`);
  console.log("before", JSON.stringify(before, null, 2));

  const introspect = await gql(
    token,
    `{ __type(name: "Mutation") { fields { name } } }`
  );
  const names = (introspect.data?.__type?.fields || [])
    .map((f) => f.name)
    .filter((n) => /shop|brand|store/i.test(n));
  console.log("mutations", names);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
