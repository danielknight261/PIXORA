/**
 * Reorder poster gallery so Simple is first, then set Simple as featured media.
 */
import fs from "node:fs";
import path from "node:path";
import os from "os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const PRODUCT_ID = "gid://shopify/Product/15933333274968";
const REPORT_PATH = "downloads/poster-mockup-upload-report.json";

function loadToken() {
  const storePath = path.join(
    os.homedir(),
    "AppData/Roaming/shopify-cli-store-nodejs/Config/config.json"
  );
  if (fs.existsSync(storePath)) {
    const cfg = JSON.parse(fs.readFileSync(storePath, "utf8"));
    const storeKey = Object.keys(cfg).find((k) => k.includes(SHOP));
    for (const sess of Object.values(cfg[storeKey]?.sessionsByUserId || {})) {
      if (sess?.accessToken) return sess.accessToken;
    }
  }
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
      "X-Shopify-Access-Token": token,
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

function reorderUrls(urls) {
  const simple = urls.find((u) => /-Simple\.webp/i.test(u));
  const close = urls.find((u) => /Close-Up/i.test(u));
  const kitchen = urls.find((u) => /Kitchen/i.test(u));
  return [simple, close, kitchen].filter(Boolean);
}

function reorderMediaIds(urls, mediaIds) {
  const byKind = {};
  urls.forEach((url, i) => {
    if (/-Simple\.webp/i.test(url)) byKind.simple = mediaIds[i];
    else if (/Close-Up/i.test(url)) byKind.close = mediaIds[i];
    else if (/Kitchen/i.test(url)) byKind.kitchen = mediaIds[i];
  });
  return [byKind.simple, byKind.close, byKind.kitchen].filter(Boolean);
}

async function setFeatured(token, pairs) {
  for (let i = 0; i < pairs.length; i += 25) {
    const batch = pairs.slice(i, i + 25);
    const data = await gql(
      token,
      `mutation ($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          userErrors { message }
        }
      }`,
      {
        productId: PRODUCT_ID,
        variants: batch.map((p) => ({
          id: `gid://shopify/ProductVariant/${p.variantId}`,
          mediaId: p.simpleMediaId,
        })),
      }
    );
    const errs = data.productVariantsBulkUpdate.userErrors || [];
    if (errs.length) throw new Error(JSON.stringify(errs));
    console.log("featured", Math.min(i + 25, pairs.length), "/", pairs.length);
    await sleep(300);
  }
}

const report = JSON.parse(fs.readFileSync(REPORT_PATH, "utf8"));
const gallery = {};
const featured = [];

for (const row of report.ok) {
  const urls = reorderUrls(row.urls);
  const mediaIds = reorderMediaIds(row.urls, row.mediaIds);
  row.urls = urls;
  row.mediaIds = mediaIds;
  gallery[row.variantId] = urls;
  featured.push({
    variantId: row.variantId,
    simpleMediaId: mediaIds[0],
  });
}

fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
fs.writeFileSync(
  path.join(
    "apps",
    "shopify-theme",
    "snippets",
    "matte-poster-gallery-data.liquid"
  ),
  JSON.stringify(gallery)
);
fs.writeFileSync(
  "downloads/matte-poster-gallery.json",
  JSON.stringify({ counts: { 3: report.ok.length }, gallery }, null, 2)
);

const token = loadToken();
await setFeatured(token, featured);
console.log("Done — Simple first for", report.ok.length, "variants");
