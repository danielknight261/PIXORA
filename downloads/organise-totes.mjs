/**
 * Join tote bags into tote-bags + home-gifts.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const ONLINE = "gid://shopify/Publication/333315113304";

const TOTE_HANDLES = ["classic-tote-bag", "premium-tote-bag"];

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
  return coll;
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
  const products = [];
  for (const handle of TOTE_HANDLES) {
    const p = await productByHandle(token, handle);
    if (!p) {
      console.warn("MISSING (not synced yet)", handle);
      continue;
    }
    console.log("Product", p.handle, p.status);
    await ensureActivePublished(token, p);
    products.push(p);
  }
  if (!products.length) throw new Error("No tote products found");

  const totes = await ensureCollection(
    token,
    {
      title: "Tote bags",
      handle: "tote-bags",
      descriptionHtml:
        "<p>Personalised tote bags — classic and premium styles with colour options.</p>",
    },
    products.map((p) => p.id)
  );

  const gifts = await collectionByHandle(token, "home-gifts");
  if (!gifts) throw new Error("home-gifts missing");

  for (const p of products) {
    const updated = await join(token, p.id, [totes.id, gifts.id]);
    console.log(
      "joined",
      updated.handle,
      "→",
      updated.collections.nodes.map((n) => n.handle).join(", ")
    );
  }

  console.log("Done", { totes: totes.id, count: products.length });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
