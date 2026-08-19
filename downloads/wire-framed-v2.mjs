/**
 * Build full variant JSON for framed products that exceed Shopify's 250 Liquid limit.
 * Also joins new products into framed-prints / wall-art and leaves the old ones.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const FRAMED = "gid://shopify/Collection/687480537432";
const WALL = "gid://shopify/Collection/687165833560";

const PRODUCTS = [
  {
    id: "gid://shopify/Product/15938229141848",
    handle: "premium-semi-glossy-paper-wooden-framed-poster-premium-1",
    asset: "framed-premium-variants.json",
  },
  {
    id: "gid://shopify/Product/15938140602712",
    handle: "classic-semi-glossy-paper-wooden-framed-poster-bestseller-1",
    asset: "framed-classic-variants.json",
  },
];

const OLD_PRODUCTS = [
  "gid://shopify/Product/15938013233496", // old premium
  "gid://shopify/Product/15937953300824", // old classic
];

function loadToken() {
  const cfgPath = path.join(
    os.homedir(),
    "AppData/Roaming/shopify-cli-store-nodejs/Config/config.json"
  );
  const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
  const key = Object.keys(cfg).find((k) => k.includes("hxbghe"));
  const sessions = cfg[key]?.sessionsByUserId || {};
  const sess = Object.values(sessions)[0];
  if (!sess?.accessToken) throw new Error("No store access token");
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
  if (json.errors?.length) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

function moneyGBP(amount) {
  const n = Number(amount);
  return (
    "£" +
    n.toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

async function fetchAllVariants(token, productId) {
  let cursor = null;
  const out = [];
  for (;;) {
    const data = await gql(
      token,
      `query ($id: ID!, $cursor: String) {
        product(id: $id) {
          options { name }
          variants(first: 100, after: $cursor) {
            pageInfo { hasNextPage endCursor }
            nodes {
              id
              title
              availableForSale
              price
              image { url }
              selectedOptions { name value }
            }
          }
        }
      }`,
      { id: productId, cursor }
    );
    const product = data.product;
    if (!product) throw new Error("Product not found " + productId);
    for (const v of product.variants.nodes) {
      const opts = product.options.map((opt) => {
        const found = v.selectedOptions.find((o) => o.name === opt.name);
        return found ? found.value : "";
      });
      const numericId = Number(String(v.id).split("/").pop());
      out.push({
        id: numericId,
        available: v.availableForSale,
        price: Math.round(Number(v.price) * 100),
        priceFormatted: moneyGBP(v.price),
        title: v.title,
        options: opts,
        featuredImage: v.image?.url
          ? v.image.url.includes("?")
            ? `${v.image.url}&width=1100`
            : `${v.image.url}?width=1100`
          : null,
      });
    }
    if (!product.variants.pageInfo.hasNextPage) break;
    cursor = product.variants.pageInfo.endCursor;
  }
  return out;
}

async function main() {
  const token = loadToken();
  const themeAssets = path.resolve("apps/shopify-theme/assets");

  for (const p of PRODUCTS) {
    console.log("Fetching variants for", p.handle);
    const variants = await fetchAllVariants(token, p.id);
    console.log("  ->", variants.length, "variants");
    const payload = {
      handle: p.handle,
      productId: p.id,
      generatedAt: new Date().toISOString(),
      variants,
    };
    fs.writeFileSync(
      path.join(themeAssets, p.asset),
      JSON.stringify(payload),
      "utf8"
    );
  }

  // Join new products
  for (const p of PRODUCTS) {
    const data = await gql(
      token,
      `mutation ($id: ID!) {
        productUpdate(product: {
          id: $id
          collectionsToJoin: ["${FRAMED}", "${WALL}"]
        }) {
          product { handle collections(first: 8) { nodes { handle } } }
          userErrors { message }
        }
      }`,
      { id: p.id }
    );
    console.log(
      "Joined",
      p.handle,
      data.productUpdate.product.collections.nodes.map((n) => n.handle)
    );
  }

  // Leave old products from framed-prints (keep wall-art optional — leave framed only)
  for (const id of OLD_PRODUCTS) {
    const data = await gql(
      token,
      `mutation ($id: ID!) {
        productUpdate(product: {
          id: $id
          collectionsToLeave: ["${FRAMED}"]
        }) {
          product { handle collections(first: 8) { nodes { handle } } }
          userErrors { message }
        }
      }`,
      { id }
    );
    console.log(
      "Left framed-prints:",
      data.productUpdate.product?.handle,
      data.productUpdate.userErrors
    );
  }

  console.log("Done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
