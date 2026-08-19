/**
 * Join all mug products into mugs + home-gifts; keep bottle in water-bottles.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const ONLINE = "gid://shopify/Publication/333315113304";

const MUG_HANDLES = [
  "white-11oz-ceramic-mug",
  "white-15oz-ceramic-mug",
  "white-11oz-ceramic-mug-with-color-inside",
  "11oz-ceramic-mug",
  "white-12oz-enamel-mug",
  "white-latte-17oz-ceramic-mug",
  "magic-11oz-ceramic-mug",
  "white-10oz-porcelain-slim-mug",
  "white-15oz-stainless-steel-travel-mug",
];

const BOTTLE_HANDLES = ["white-17oz-stainless-steel-water-bottle"];

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

async function productByHandle(token, handle) {
  const data = await gql(
    token,
    `query ($h: String!) {
      productByHandle(handle: $h) { id handle title status }
    }`,
    { h: handle }
  );
  return data.productByHandle;
}

async function collectionByHandle(token, handle) {
  const data = await gql(
    token,
    `query ($h: String!) {
      collectionByHandle(handle: $h) { id handle }
    }`,
    { h: handle }
  );
  return data.collectionByHandle;
}

async function ensureActivePublished(token, product) {
  if (product.status !== "ACTIVE") {
    await gql(
      token,
      `mutation ($id: ID!) {
        productChangeStatus(productId: $id, status: ACTIVE) {
          userErrors { message }
        }
      }`,
      { id: product.id }
    );
  }
  await gql(
    token,
    `mutation ($id: ID!) {
      publishablePublish(id: $id, input: [{publicationId: "${ONLINE}"}]) {
        userErrors { message }
      }
    }`,
    { id: product.id }
  );
}

async function join(token, productId, collectionIds) {
  const data = await gql(
    token,
    `mutation ($id: ID!, $join: [ID!]!) {
      productUpdate(product: { id: $id, collectionsToJoin: $join }) {
        product { handle collections(first: 12) { nodes { handle } } }
        userErrors { message }
      }
    }`,
    { id: productId, join: collectionIds }
  );
  if (data.productUpdate.userErrors?.length) {
    throw new Error(JSON.stringify(data.productUpdate.userErrors));
  }
  return data.productUpdate.product;
}

async function main() {
  const token = loadToken();
  const mugs = await collectionByHandle(token, "mugs");
  const bottles = await collectionByHandle(token, "water-bottles");
  const gifts = await collectionByHandle(token, "home-gifts");
  if (!mugs || !bottles || !gifts) {
    throw new Error("Missing collections — run organise-mugs first");
  }
  console.log({ mugs: mugs.id, bottles: bottles.id, gifts: gifts.id });

  for (const handle of MUG_HANDLES) {
    const p = await productByHandle(token, handle);
    if (!p) {
      console.warn("MISSING", handle);
      continue;
    }
    await ensureActivePublished(token, p);
    const updated = await join(token, p.id, [mugs.id, gifts.id]);
    console.log(
      "mug",
      updated.handle,
      "→",
      updated.collections.nodes.map((n) => n.handle).join(", ")
    );
  }

  for (const handle of BOTTLE_HANDLES) {
    const p = await productByHandle(token, handle);
    if (!p) {
      console.warn("MISSING", handle);
      continue;
    }
    await ensureActivePublished(token, p);
    const updated = await join(token, p.id, [bottles.id, gifts.id]);
    console.log(
      "bottle",
      updated.handle,
      "→",
      updated.collections.nodes.map((n) => n.handle).join(", ")
    );
  }

  console.log("Done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
