/**
 * Attach leftover Gelato lifestyle mockups to every Premium Matte Paper Poster
 * variant, then write a theme gallery map keyed by variant id.
 */
import fs from "node:fs";
import path from "node:path";
import os from "os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const PRODUCT_ID = "gid://shopify/Product/15933333274968";
const EXTRA_MEDIA = [
  "gid://shopify/MediaImage/73239620288856",
  "gid://shopify/MediaImage/73239620321624",
];

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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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
  if (json.errors?.length) {
    const msg = JSON.stringify(json.errors);
    if (msg.includes("THROTTLED") || msg.includes("429")) {
      await sleep(2000);
      return gql(token, query, variables);
    }
    throw new Error(msg);
  }
  return json.data;
}

async function fetchVariants(token) {
  const variants = [];
  let cursor = null;
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
              media(first: 10) {
                nodes { ... on MediaImage { id image { url } } }
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
  return variants;
}

function withWidth(url) {
  if (!url) return url;
  const base = url.split("?")[0];
  return `${base}?width=1100`;
}

async function main() {
  const token = loadToken();
  let variants = await fetchVariants(token);
  const extraSet = new Set(EXTRA_MEDIA);
  const toAppend = variants.filter((v) => {
    const ids = new Set(v.media.nodes.map((m) => m.id));
    return EXTRA_MEDIA.some((id) => !ids.has(id));
  });

  let ok = 0;
  let fail = 0;
  const batchSize = 10;
  for (const mediaId of EXTRA_MEDIA) {
    const needing = variants.filter((v) => !v.media.nodes.some((m) => m.id === mediaId));
    for (let i = 0; i < needing.length; i += batchSize) {
      const batch = needing.slice(i, i + batchSize);
      const variantMedia = batch.map((v) => ({
        variantId: v.id,
        mediaIds: [mediaId],
      }));
      try {
        const data = await gql(
          token,
          `mutation ($productId: ID!, $variantMedia: [ProductVariantAppendMediaInput!]!) {
            productVariantAppendMedia(productId: $productId, variantMedia: $variantMedia) {
              userErrors { field message }
            }
          }`,
          { productId: PRODUCT_ID, variantMedia }
        );
        const errs = data.productVariantAppendMedia.userErrors || [];
        if (errs.length) {
          console.log("batch fail", mediaId.slice(-8), errs[0]);
          fail += variantMedia.length;
        } else {
          ok += variantMedia.length;
          console.log("appended", ok, mediaId.slice(-8));
        }
      } catch (e) {
        console.log("err", e.message);
        fail += variantMedia.length;
      }
      await sleep(250);
    }
  }

  variants = await fetchVariants(token);
  const extraUrls = [
    "https://cdn.shopify.com/s/files/1/1006/7256/9688/files/bafc3f33-ea69-4a09-a32a-cc27f99f98c5.webp?width=1100",
    "https://cdn.shopify.com/s/files/1/1006/7256/9688/files/de81b7c5-44dd-488a-9625-248f0cf72c7b.webp?width=1100",
  ];
  const gallery = {};
  const counts = {};
  for (const v of variants) {
    const numericId = v.id.split("/").pop();
    const urls = [];
    const seen = new Set();
    for (const m of v.media.nodes) {
      const url = withWidth(m.image?.url);
      if (!url || seen.has(url.split("?")[0])) continue;
      seen.add(url.split("?")[0]);
      urls.push(url);
    }
    for (const extra of extraUrls) {
      const key = extra.split("?")[0];
      if (seen.has(key)) continue;
      seen.add(key);
      urls.push(extra);
    }
    gallery[numericId] = urls;
    const n = urls.length;
    counts[n] = (counts[n] || 0) + 1;
  }

  const snippetPath = path.join(
    "apps",
    "shopify-theme",
    "snippets",
    "matte-poster-gallery-data.liquid"
  );
  fs.writeFileSync(snippetPath, JSON.stringify(gallery));
  fs.writeFileSync(
    "downloads/matte-poster-gallery.json",
    JSON.stringify({ extraMedia: EXTRA_MEDIA, counts, gallery }, null, 2)
  );
  console.log({
    appendedOk: ok,
    fail,
    extraSetSize: extraSet.size,
    mediaPerVariant: counts,
    sample: variants[0]?.title,
    sampleImages: gallery[variants[0]?.id.split("/").pop()],
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
