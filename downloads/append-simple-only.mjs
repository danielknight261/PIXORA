import fs from "fs";
import path from "path";
import os from "os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const PRODUCT_ID = "gid://shopify/Product/15928489378136";

function getToken() {
  const cfg = JSON.parse(
    fs.readFileSync(
      path.join(
        os.homedir(),
        "AppData/Roaming/shopify-cli-store-nodejs/Config/config.json"
      ),
      "utf8"
    )
  );
  const storeKey = Object.keys(cfg).find((k) => k.includes(SHOP));
  for (const sess of Object.values(cfg[storeKey].sessionsByUserId || {})) {
    if (sess?.accessToken) return sess.accessToken;
  }
  throw new Error("No token");
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
  if (json.errors?.length) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchAllMedia(token) {
  const nodes = [];
  let cursor = null;
  for (;;) {
    const data = await gql(
      token,
      `query ($id: ID!, $cursor: String) {
        product(id: $id) {
          media(first: 100, after: $cursor) {
            pageInfo { hasNextPage endCursor }
            nodes {
              ... on MediaImage { id alt image { url } }
            }
          }
        }
      }`,
      { id: PRODUCT_ID, cursor }
    );
    nodes.push(...data.product.media.nodes);
    if (!data.product.media.pageInfo.hasNextPage) break;
    cursor = data.product.media.pageInfo.endCursor;
  }
  return nodes;
}

async function main() {
  const token = getToken();
  const report = JSON.parse(
    fs.readFileSync("downloads/canvas-simple-upload-report.json", "utf8")
  );
  const jobs = JSON.parse(
    fs.readFileSync("downloads/canvas-mockup-jobs.json", "utf8")
  ).jobs;

  // Build alt -> simple media id
  const media = await fetchAllMedia(token);
  const simpleByAlt = {};
  const closeByAlt = {};
  for (const m of media) {
    const alt = (m.alt || "").trim();
    if (alt.includes("· simple")) {
      simpleByAlt[alt.replace(/\s*·\s*simple\s*$/i, "").trim()] = {
        id: m.id,
        url: m.image.url,
      };
    } else if (alt) {
      closeByAlt[alt] = { id: m.id, url: m.image.url };
    }
  }

  const gallery = {};
  let ok = 0;
  let fail = 0;
  for (const job of jobs) {
    const simple = simpleByAlt[job.alt];
    const close = closeByAlt[job.alt];
    const numericId = job.variantId.split("/").pop();
    const images = [];
    if (close?.url) images.push(close.url.split("?")[0] + "?width=1400");
    if (simple?.url) images.push(simple.url.split("?")[0] + "?width=1400");

    if (simple?.id) {
      try {
        const data = await gql(
          token,
          `mutation ($productId: ID!, $variantMedia: [ProductVariantAppendMediaInput!]!) {
            productVariantAppendMedia(productId: $productId, variantMedia: $variantMedia) {
              userErrors { message }
            }
          }`,
          {
            productId: PRODUCT_ID,
            variantMedia: [
              { variantId: job.variantId, mediaIds: [simple.id] },
            ],
          }
        );
        const errs = data.productVariantAppendMedia.userErrors || [];
        if (errs.length) {
          console.log("append fail", job.title, errs[0].message);
          fail++;
        } else {
          ok++;
          if (ok % 20 === 0) console.log("appended", ok);
        }
      } catch (e) {
        console.log("err", job.title, e.message);
        fail++;
      }
      await sleep(120);
    }

    if (images.length) gallery[numericId] = images;
    // also key by title for safety
    gallery[job.title] = images;
  }

  // Prefer Shopify CDN URLs from media with proper host - rewrite
  for (const [k, urls] of Object.entries(gallery)) {
    gallery[k] = urls.map((u) => {
      if (u.startsWith("//")) return "https:" + u;
      return u.replace(/&width=1400/, "").replace(/\?width=1400/, "") + (u.includes("?") ? "&width=1400" : "?width=1400");
    });
  }

  const outPath = path.join(
    "apps",
    "shopify-theme",
    "assets",
    "canvas-variant-gallery.json"
  );
  fs.writeFileSync(outPath, JSON.stringify(gallery));
  fs.writeFileSync(
    "downloads/canvas-variant-gallery.json",
    JSON.stringify(gallery, null, 2)
  );

  // verify one variant media count
  const check = await gql(
    token,
    `query {
      product(id: "${PRODUCT_ID}") {
        variantBySelectedOptions(selectedOptions: [
          {name: "Orientation", value: "Horizontal"},
          {name: "Thickness", value: "Slim"},
          {name: "Size", value: "20x30 cm / 8x12″"}
        ]) {
          title
          media(first: 5) {
            nodes { ... on MediaImage { alt } }
          }
        }
      }
    }`
  );
  console.log({
    appendedOk: ok,
    fail,
    galleryKeys: Object.keys(gallery).length,
    sample: check.product.variantBySelectedOptions,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
