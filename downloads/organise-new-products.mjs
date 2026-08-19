/**
 * Organise new wall-art products into collections and publish.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const WALL = "gid://shopify/Collection/687165833560";
const FRAMED = "gid://shopify/Collection/687480537432";
const ONLINE = "gid://shopify/Publication/333315113304";

const GROUPS = [
  {
    title: "Acrylic prints",
    handle: "acrylic-prints",
    descriptionHtml:
      "<p>Glossy acrylic wall prints — choose orientation and size, then personalize.</p>",
    productHandles: ["acrylic-print"],
  },
  {
    title: "Metal / aluminium prints",
    handle: "aluminum-prints",
    descriptionHtml:
      "<p>Aluminum and brushed aluminum prints — vivid metal wall art.</p>",
    productHandles: ["aluminum-print", "brushed-aluminum-print"],
  },
  {
    title: "Wood prints",
    handle: "wood-prints",
    descriptionHtml:
      "<p>Natural wood grain prints — choose thickness, orientation and size.</p>",
    productHandles: ["wood-prints"],
  },
  {
    title: "Foam prints",
    handle: "foam-prints",
    descriptionHtml:
      "<p>Lightweight foam board prints — portrait, landscape or square.</p>",
    productHandles: ["foam-portrait", "foam-landscape", "foam-square"],
  },
  {
    title: "Posters with hangers",
    handle: "posters-with-hangers",
    descriptionHtml:
      "<p>Posters with wood hangers — pick hanger colour, orientation and size.</p>",
    productHandles: ["premium-matte-paper-poster-with-hanger"],
  },
];

const ALSO_JOIN = {
  "classic-semi-glossy-paper-metal-framed-poster": [FRAMED, WALL],
};

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

async function ensureCollection(token, group, productIds) {
  let coll = await collectionByHandle(token, group.handle);
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
          title: group.title,
          handle: group.handle,
          descriptionHtml: group.descriptionHtml,
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
    for (const id of productIds) {
      await gql(
        token,
        `mutation ($id: ID!, $join: [ID!]!) {
          productUpdate(product: { id: $id, collectionsToJoin: $join }) {
            userErrors { message }
          }
        }`,
        { id, join: [coll.id, WALL] }
      );
    }
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

  // Ensure wall-art join
  for (const id of productIds) {
    await gql(
      token,
      `mutation ($id: ID!) {
        productUpdate(product: { id: $id, collectionsToJoin: ["${WALL}", "${coll.id}"] }) {
          product { handle collections(first: 8) { nodes { handle } } }
          userErrors { message }
        }
      }`,
      { id }
    );
  }

  return coll;
}

async function main() {
  const token = loadToken();

  for (const group of GROUPS) {
    const ids = [];
    for (const handle of group.productHandles) {
      const p = await productByHandle(token, handle);
      if (!p) {
        console.warn("MISSING product", handle);
        continue;
      }
      console.log("Product", p.handle, p.status, p.id);
      ids.push(p.id);
    }
    if (!ids.length) continue;
    await ensureCollection(token, group, ids);
  }

  for (const [handle, joins] of Object.entries(ALSO_JOIN)) {
    const p = await productByHandle(token, handle);
    if (!p) {
      console.warn("MISSING", handle);
      continue;
    }
    const data = await gql(
      token,
      `mutation ($id: ID!, $join: [ID!]!) {
        productUpdate(product: { id: $id, collectionsToJoin: $join }) {
          product { handle collections(first: 10) { nodes { handle } } }
          userErrors { message }
        }
      }`,
      { id: p.id, join: joins }
    );
    console.log(
      "Joined",
      handle,
      data.productUpdate.product.collections.nodes.map((n) => n.handle)
    );
  }

  console.log("Done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
