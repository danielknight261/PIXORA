/**
 * Upload Gelato mockup WebPs and assign to Personalized Canvas Print variants.
 */
import fs from "fs";
import path from "path";
import os from "os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const PRODUCT_ID = "gid://shopify/Product/15928489378136";
const MOCKUP_ROOT =
  "c:\\Users\\HughesHub\\Downloads\\f11cc67c-da2f-4e8e-a35c-7bede4bbe9fd\\96379a8a-3182-4a48-8c20-bbb297ad0293";
const IMAGE_NAME = "Close-Up-Plain-Gray-0.webp"; // shows wrap depth + size
const FALLBACK_IMAGE = "Simple.webp";

function getToken() {
  const cfgPath = path.join(
    os.homedir(),
    "AppData/Roaming/shopify-cli-store-nodejs/Config/config.json"
  );
  const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
  const storeKey = Object.keys(cfg).find((k) => k.includes(SHOP));
  if (!storeKey) throw new Error("No store auth for " + SHOP);
  const sessions = cfg[storeKey].sessionsByUserId || {};
  for (const sess of Object.values(sessions)) {
    if (sess?.accessToken) return sess.accessToken;
  }
  throw new Error("No accessToken in store auth for " + SHOP);
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
    throw new Error(JSON.stringify(json.errors));
  }
  return json.data;
}

function parseFolder(name) {
  // canvas_200x300-mm-8x12-inch_canvas_wood-fsc-slim_4-0_hor
  const m = name.match(
    /^canvas_\d+x\d+-mm-(\d+)x(\d+)-inch_canvas_wood-fsc-(slim|thick)_4-0_(hor|ver)$/i
  );
  if (!m) return null;
  const inchA = m[1];
  const inchB = m[2];
  const thickness = m[3].toLowerCase() === "thick" ? "Thick" : "Slim";
  const orientation = m[4].toLowerCase() === "hor" ? "Horizontal" : "Vertical";
  return { inchA, inchB, inchKey: `${inchA}x${inchB}`, thickness, orientation };
}

function inchFromShopifySize(size) {
  const m = String(size).match(/(\d+)\s*[x×]\s*(\d+)\s*(?:″|"|in)/i);
  return m ? `${m[1]}x${m[2]}` : null;
}

function sizeMatches(shopifySize, inchKey) {
  return inchFromShopifySize(shopifySize) === inchKey;
}

function pickImage(dir) {
  const preferred = path.join(dir, IMAGE_NAME);
  if (fs.existsSync(preferred)) return preferred;
  const fallback = path.join(dir, FALLBACK_IMAGE);
  if (fs.existsSync(fallback)) return fallback;
  const any = fs
    .readdirSync(dir)
    .find((f) => /\.(webp|png|jpe?g)$/i.test(f));
  return any ? path.join(dir, any) : null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function stagedUpload(token, filePath) {
  const filename = path.basename(filePath);
  const fileSize = fs.statSync(filePath).size;
  const mime = filename.endsWith(".png")
    ? "image/png"
    : filename.endsWith(".jpg") || filename.endsWith(".jpeg")
      ? "image/jpeg"
      : "image/webp";

  const data = await gql(
    token,
    `mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { field message }
      }
    }`,
    {
      input: [
        {
          filename,
          mimeType: mime,
          httpMethod: "POST",
          resource: "IMAGE",
          fileSize: String(fileSize),
        },
      ],
    }
  );

  const errs = data.stagedUploadsCreate.userErrors || [];
  if (errs.length) throw new Error("stagedUploadsCreate: " + JSON.stringify(errs));
  const target = data.stagedUploadsCreate.stagedTargets[0];

  const form = new FormData();
  for (const p of target.parameters) form.append(p.name, p.value);
  const buf = fs.readFileSync(filePath);
  form.append("file", new Blob([buf], { type: mime }), filename);

  const up = await fetch(target.url, { method: "POST", body: form });
  if (!up.ok) {
    const text = await up.text();
    throw new Error(`Upload failed ${up.status}: ${text.slice(0, 300)}`);
  }
  return target.resourceUrl;
}

async function createMedia(token, resourceUrl, alt) {
  const data = await gql(
    token,
    `mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media {
          ... on MediaImage { id status alt }
        }
        mediaUserErrors { field message code }
      }
    }`,
    {
      productId: PRODUCT_ID,
      media: [
        {
          originalSource: resourceUrl,
          mediaContentType: "IMAGE",
          alt,
        },
      ],
    }
  );
  const errs = data.productCreateMedia.mediaUserErrors || [];
  if (errs.length) throw new Error("productCreateMedia: " + JSON.stringify(errs));
  const media = data.productCreateMedia.media[0];
  if (!media?.id) throw new Error("No media id returned");
  return media;
}

async function waitReady(token, mediaId, tries = 30) {
  for (let i = 0; i < tries; i++) {
    const data = await gql(
      token,
      `query ($id: ID!) {
        node(id: $id) {
          ... on MediaImage { id status }
        }
      }`,
      { id: mediaId }
    );
    const status = data.node?.status;
    if (status === "READY") return;
    if (status === "FAILED") throw new Error("Media failed: " + mediaId);
    await sleep(1000);
  }
  throw new Error("Media not READY in time: " + mediaId);
}

async function assignVariants(token, pairs) {
  // pairs: [{ id, mediaId }]
  const chunk = 25;
  for (let i = 0; i < pairs.length; i += chunk) {
    const batch = pairs.slice(i, i + chunk);
    const data = await gql(
      token,
      `mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          productVariants { id }
          userErrors { field message }
        }
      }`,
      {
        productId: PRODUCT_ID,
        variants: batch.map((p) => ({ id: p.id, mediaId: p.mediaId })),
      }
    );
    const errs = data.productVariantsBulkUpdate.userErrors || [];
    if (errs.length) {
      throw new Error("productVariantsBulkUpdate: " + JSON.stringify(errs));
    }
    console.log(`Assigned ${Math.min(i + chunk, pairs.length)}/${pairs.length}`);
    await sleep(400);
  }
}

async function main() {
  const token = getToken();
  // sanity check auth
  const shop = await gql(token, `{ shop { name } }`);
  console.log("Authed as shop:", shop.shop.name);

  const mapped = JSON.parse(
    fs.readFileSync(path.join("downloads", "canvas-mockup-jobs.json"), "utf8")
  );
  const uniqueJobs = mapped.jobs;
  console.log("jobs", uniqueJobs.length);
  if (!uniqueJobs.length) process.exit(1);

  const pairs = [];
  const failures = [];
  let i = 0;
  for (const job of uniqueJobs) {
    i++;
    process.stdout.write(`[${i}/${uniqueJobs.length}] ${job.title} ... `);
    try {
      const resourceUrl = await stagedUpload(token, job.img);
      const media = await createMedia(token, resourceUrl, job.alt);
      await waitReady(token, media.id);
      pairs.push({ id: job.variantId, mediaId: media.id, title: job.title });
      console.log("ok", media.id.split("/").pop());
    } catch (e) {
      console.log("FAIL", e.message);
      failures.push({ title: job.title, error: e.message });
    }
    await sleep(250);
  }

  console.log("Assigning", pairs.length, "variants...");
  if (pairs.length) await assignVariants(token, pairs);

  fs.writeFileSync(
    path.join("downloads", "canvas-mockup-upload-report.json"),
    JSON.stringify({ assigned: pairs.length, failures, pairs }, null, 2)
  );
  console.log("Done. Report: downloads/canvas-mockup-upload-report.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
