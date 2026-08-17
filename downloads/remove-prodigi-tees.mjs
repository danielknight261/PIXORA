/**
 * Remove Prodigi t-shirt product + collection from Shopify.
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
  const json = await res.json();
  if (json.errors?.length) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data;
}

async function removeByHandle(token, type, handle) {
  const field = type === "product" ? "productByHandle" : "collectionByHandle";
  const data = await gql(
    token,
    `query ($h: String!) { ${field}(handle: $h) { id handle } }`,
    { h: handle }
  );
  const node = data[field];
  if (!node) {
    console.log(`No ${type} ${handle}`);
    return;
  }
  const mutation =
    type === "product"
      ? `mutation ($id: ID!) {
          productDelete(input: { id: $id }) {
            deletedProductId
            userErrors { message }
          }
        }`
      : `mutation ($id: ID!) {
          collectionDelete(input: { id: $id }) {
            deletedCollectionId
            userErrors { message }
          }
        }`;
  const result = await gql(token, mutation, { id: node.id });
  const payload = type === "product" ? result.productDelete : result.collectionDelete;
  if (payload.userErrors?.length) {
    throw new Error(JSON.stringify(payload.userErrors, null, 2));
  }
  console.log(`Deleted ${type}`, handle, node.id);
}

async function main() {
  const token = loadToken();
  await removeByHandle(token, "product", "unisex-classic-tee");
  await removeByHandle(token, "collection", "t-shirts");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
