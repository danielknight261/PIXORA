/**
 * Copy featured photos onto live hanger + framed products that have no media.
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

async function copyFirstImages(token, fromId, toId, count, label) {
  const data = await gql(
    token,
    `query ($id: ID!) {
      product(id: $id) {
        media(first: 10) {
          nodes {
            ... on MediaImage { alt image { url } }
          }
        }
      }
    }`,
    { id: fromId }
  );
  const urls = (data.product.media.nodes || [])
    .filter((n) => n.image?.url)
    .slice(0, count)
    .map((n) => ({ url: n.image.url.split("?")[0], alt: n.alt || label }));
  if (!urls.length) {
    console.log("NO SOURCE IMAGES", label);
    return;
  }
  const result = await gql(
    token,
    `mutation ($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media { id alt mediaContentType status }
        mediaUserErrors { field message }
      }
    }`,
    {
      productId: toId,
      media: urls.map((u) => ({
        originalSource: u.url,
        alt: u.alt,
        mediaContentType: "IMAGE",
      })),
    }
  );
  console.log(label, JSON.stringify(result.productCreateMedia, null, 2));
}

const token = loadToken();
await copyFirstImages(
  token,
  "gid://shopify/Product/15942723928408",
  "gid://shopify/Product/15942721503576",
  2,
  "hanger"
);
await copyFirstImages(
  token,
  "gid://shopify/Product/15937953300824",
  "gid://shopify/Product/15938140602712",
  1,
  "framed-classic"
);
