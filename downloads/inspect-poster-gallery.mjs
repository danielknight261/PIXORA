import fs from "node:fs";
import path from "node:path";
import os from "os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const PRODUCT_ID = "gid://shopify/Product/15933333274968";

function loadToken() {
  const kit = JSON.parse(
    fs.readFileSync(
      path.join(
        os.homedir(),
        "AppData/Roaming/shopify-cli-kit-nodejs/Config/config.json"
      ),
      "utf8"
    )
  );
  const account = Object.values(
    JSON.parse(kit.sessionStore)["accounts.shopify.com"]
  )[0];
  const shopKey = Object.keys(account.applications).find((k) =>
    k.startsWith(SHOP)
  );
  return account.applications[shopKey].accessToken;
}

async function gql(token, query, variables) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

async function fetchAll(token) {
  const media = [];
  let cursor = null;
  for (;;) {
    const data = await gql(
      token,
      `query ($id: ID!, $cursor: String) {
        product(id: $id) {
          media(first: 100, after: $cursor) {
            pageInfo { hasNextPage endCursor }
            nodes {
              ... on MediaImage {
                id
                alt
                image { url }
              }
            }
          }
        }
      }`,
      { id: PRODUCT_ID, cursor }
    );
    media.push(...data.product.media.nodes);
    if (!data.product.media.pageInfo.hasNextPage) break;
    cursor = data.product.media.pageInfo.endCursor;
  }

  const variants = [];
  cursor = null;
  for (;;) {
    const data = await gql(
      token,
      `query ($id: ID!, $cursor: String) {
        product(id: $id) {
          variants(first: 50, after: $cursor) {
            pageInfo { hasNextPage endCursor }
            nodes {
              id
              title
              sku
              media(first: 10) {
                nodes {
                  ... on MediaImage { id alt image { url } }
                }
              }
            }
          }
        }
      }`,
      { id: PRODUCT_ID, cursor }
    );
    variants.push(...data.product.variants.nodes);
    if (!data.product.variants.pageInfo.hasNextPage) break;
    cursor = data.product.variants.pageInfo.endCursor;
  }
  return { media, variants };
}

const token = loadToken();
const { media, variants } = await fetchAll(token);
const used = new Set();
const counts = {};
for (const v of variants) {
  const n = v.media.nodes.length;
  counts[n] = (counts[n] || 0) + 1;
  for (const m of v.media.nodes) used.add(m.id);
}
const unassigned = media.filter((m) => !used.has(m.id));
console.log({
  media: media.length,
  variants: variants.length,
  mediaPerVariant: counts,
  unassigned: unassigned.length,
});
console.log(
  "sample variants",
  variants.slice(0, 3).map((v) => ({
    title: v.title,
    media: v.media.nodes.map((m) => ({
      alt: m.alt,
      file: (m.image?.url || "").split("/").pop()?.slice(0, 50),
    })),
  }))
);
console.log(
  "unassigned",
  unassigned.map((m) => ({
    alt: m.alt,
    file: (m.image?.url || "").split("/").pop()?.slice(0, 70),
  }))
);
console.log(
  "all alts sample",
  [...new Set(media.map((m) => m.alt))].slice(0, 15)
);
