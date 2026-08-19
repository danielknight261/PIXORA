/**
 * Organise mugs + water bottle into collections and publish.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const ONLINE = "gid://shopify/Publication/333315113304";

const MUG_HANDLES = [
  "white-11oz-ceramic-mug", // may be missing until Gelato publishes
  "white-15oz-ceramic-mug",
  "white-11oz-ceramic-mug-with-color-inside",
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
    const act = await gql(
      token,
      `mutation ($id: ID!) {
        productChangeStatus(productId: $id, status: ACTIVE) {
          product { status }
          userErrors { message }
        }
      }`,
      { id: product.id }
    );
    console.log("  activate", product.handle, act.productChangeStatus);
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

async function ensureCollection(token, { title, handle, descriptionHtml }, productIds) {
  let coll = await collectionByHandle(token, handle);
  if (!coll) {
    const data = await gql(
      token,
      `mutation ($input: CollectionInput!) {
        collectionCreate(input: $input) {
          collection { id handle }
          userErrors { message }
        }
      }`,
      {
        input: {
          title,
          handle,
          descriptionHtml,
          products: productIds,
        },
      }
    );
    if (data.collectionCreate.userErrors?.length) {
      throw new Error(JSON.stringify(data.collectionCreate.userErrors));
    }
    coll = data.collectionCreate.collection;
    console.log("Created", coll.handle, coll.id);
  } else {
    console.log("Exists", coll.handle, coll.id);
  }

  await gql(
    token,
    `mutation ($id: ID!) {
      publishablePublish(id: $id, input: [{publicationId: "${ONLINE}"}]) {
        userErrors { message }
      }
    }`,
    { id: coll.id }
  );

  for (const id of productIds) {
    await gql(
      token,
      `mutation ($id: ID!, $join: [ID!]!) {
        productUpdate(product: { id: $id, collectionsToJoin: $join }) {
          product { handle collections(first: 12) { nodes { handle } } }
          userErrors { message }
        }
      }`,
      { id, join: [coll.id] }
    );
  }

  return coll;
}

async function resolveProducts(token, handles) {
  const products = [];
  for (const handle of handles) {
    const p = await productByHandle(token, handle);
    if (!p) {
      console.warn("MISSING", handle);
      continue;
    }
    console.log("Product", p.handle, p.status);
    await ensureActivePublished(token, p);
    products.push(p);
  }
  return products;
}

async function main() {
  const token = loadToken();

  const mugs = await resolveProducts(token, MUG_HANDLES);
  const bottles = await resolveProducts(token, BOTTLE_HANDLES);
  const all = [...mugs, ...bottles];

  const mugsColl = await ensureCollection(
    token,
    {
      title: "Mugs",
      handle: "mugs",
      descriptionHtml:
        "<p>Personalised ceramic mugs — classic white or colour-inside styles.</p>",
    },
    mugs.map((p) => p.id)
  );

  const bottlesColl = await ensureCollection(
    token,
    {
      title: "Water bottles",
      handle: "water-bottles",
      descriptionHtml:
        "<p>Personalised stainless steel water bottles — print your photo or design.</p>",
    },
    bottles.map((p) => p.id)
  );

  const giftsColl = await ensureCollection(
    token,
    {
      title: "Home & gifts",
      handle: "home-gifts",
      descriptionHtml:
        "<p>Personalised mugs, bottles and more — gifts they’ll use every day.</p>",
    },
    all.map((p) => p.id)
  );

  console.log("Done", {
    mugs: mugsColl.handle,
    bottles: bottlesColl.handle,
    gifts: giftsColl.handle,
    products: all.map((p) => p.handle),
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
