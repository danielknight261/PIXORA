/**
 * Upload Simple.webp for each canvas variant and append Close-Up + Simple to variant media.
 */
import fs from "fs";
import path from "path";
import os from "os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const PRODUCT_ID = "gid://shopify/Product/15928489378136";
const MOCKUP_ROOT =
  "c:\\Users\\HughesHub\\Downloads\\f11cc67c-da2f-4e8e-a35c-7bede4bbe9fd\\96379a8a-3182-4a48-8c20-bbb297ad0293";

function getToken() {
  const cfgPath = path.join(
    os.homedir(),
    "AppData/Roaming/shopify-cli-store-nodejs/Config/config.json"
  );
  const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
  const storeKey = Object.keys(cfg).find((k) => k.includes(SHOP));
  const sessions = cfg[storeKey].sessionsByUserId || {};
  for (const sess of Object.values(sessions)) {
    if (sess?.accessToken) return sess.accessToken;
  }
  throw new Error("No store token");
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

async function stagedUpload(token, filePath) {
  const filename = path.basename(filePath);
  const fileSize = fs.statSync(filePath).size;
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
          mimeType: "image/webp",
          httpMethod: "POST",
          resource: "IMAGE",
          fileSize: String(fileSize),
        },
      ],
    }
  );
  const errs = data.stagedUploadsCreate.userErrors || [];
  if (errs.length) throw new Error(JSON.stringify(errs));
  const target = data.stagedUploadsCreate.stagedTargets[0];
  const form = new FormData();
  for (const p of target.parameters) form.append(p.name, p.value);
  form.append(
    "file",
    new Blob([fs.readFileSync(filePath)], { type: "image/webp" }),
    filename
  );
  const up = await fetch(target.url, { method: "POST", body: form });
  if (!up.ok) throw new Error(`upload ${up.status}`);
  return target.resourceUrl;
}

async function createMedia(token, resourceUrl, alt) {
  const data = await gql(
    token,
    `mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media { ... on MediaImage { id status } }
        mediaUserErrors { message }
      }
    }`,
    {
      productId: PRODUCT_ID,
      media: [
        { originalSource: resourceUrl, mediaContentType: "IMAGE", alt },
      ],
    }
  );
  const errs = data.productCreateMedia.mediaUserErrors || [];
  if (errs.length) throw new Error(JSON.stringify(errs));
  return data.productCreateMedia.media[0];
}

async function waitReady(token, mediaId) {
  for (let i = 0; i < 30; i++) {
    const data = await gql(
      token,
      `query ($id: ID!) { node(id: $id) { ... on MediaImage { status } } }`,
      { id: mediaId }
    );
    if (data.node?.status === "READY") return;
    if (data.node?.status === "FAILED") throw new Error("FAILED " + mediaId);
    await sleep(800);
  }
  throw new Error("timeout " + mediaId);
}

async function appendMedia(token, variantMedia) {
  // batch up to 20
  const chunk = 20;
  for (let i = 0; i < variantMedia.length; i += chunk) {
    const batch = variantMedia.slice(i, i + chunk);
    const data = await gql(
      token,
      `mutation productVariantAppendMedia($productId: ID!, $variantMedia: [ProductVariantAppendMediaInput!]!) {
        productVariantAppendMedia(productId: $productId, variantMedia: $variantMedia) {
          userErrors { field message }
        }
      }`,
      { productId: PRODUCT_ID, variantMedia: batch }
    );
    const errs = data.productVariantAppendMedia.userErrors || [];
    if (errs.length) throw new Error(JSON.stringify(errs));
    console.log(`Appended media batch ${Math.min(i + chunk, variantMedia.length)}/${variantMedia.length}`);
    await sleep(400);
  }
}

async function setFeatured(token, pairs) {
  const chunk = 25;
  for (let i = 0; i < pairs.length; i += chunk) {
    const batch = pairs.slice(i, i + chunk);
    const data = await gql(
      token,
      `mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          userErrors { message }
        }
      }`,
      {
        productId: PRODUCT_ID,
        variants: batch.map((p) => ({ id: p.id, mediaId: p.mediaId })),
      }
    );
    const errs = data.productVariantsBulkUpdate.userErrors || [];
    if (errs.length) throw new Error(JSON.stringify(errs));
    await sleep(300);
  }
}

async function main() {
  const token = getToken();
  const shop = await gql(token, `{ shop { name } }`);
  console.log("Shop", shop.shop.name);

  const jobs = JSON.parse(
    fs.readFileSync("downloads/canvas-mockup-jobs.json", "utf8")
  ).jobs;
  const closeUps = Object.fromEntries(
    JSON.parse(
      fs.readFileSync("downloads/canvas-mockup-upload-report.json", "utf8")
    ).pairs.map((p) => [p.id, p.mediaId])
  );

  const simplePairs = [];
  const failures = [];
  let i = 0;
  for (const job of jobs) {
    i++;
    const simplePath = path.join(MOCKUP_ROOT, job.folder, "Simple.webp");
    process.stdout.write(`[${i}/${jobs.length}] ${job.title} ... `);
    if (!fs.existsSync(simplePath)) {
      console.log("SKIP no Simple.webp");
      failures.push({ title: job.title, error: "missing Simple.webp" });
      continue;
    }
    if (!closeUps[job.variantId]) {
      console.log("SKIP no close-up id");
      failures.push({ title: job.title, error: "missing close-up media" });
      continue;
    }
    try {
      const resourceUrl = await stagedUpload(token, simplePath);
      const media = await createMedia(
        token,
        resourceUrl,
        `${job.alt} · simple`
      );
      await waitReady(token, media.id);
      simplePairs.push({
        id: job.variantId,
        simpleId: media.id,
        closeUpId: closeUps[job.variantId],
        title: job.title,
      });
      console.log("ok", media.id.split("/").pop());
    } catch (e) {
      console.log("FAIL", e.message);
      failures.push({ title: job.title, error: e.message });
    }
    await sleep(200);
  }

  console.log("Appending 2 media to", simplePairs.length, "variants...");
  await appendMedia(
    token,
    simplePairs.map((p) => ({
      variantId: p.id,
      mediaIds: [p.closeUpId, p.simpleId],
    }))
  );

  // Keep Close-Up as featured (first gallery image)
  console.log("Setting featured = Close-Up...");
  await setFeatured(
    token,
    simplePairs.map((p) => ({ id: p.id, mediaId: p.closeUpId }))
  );

  fs.writeFileSync(
    "downloads/canvas-simple-upload-report.json",
    JSON.stringify({ assigned: simplePairs.length, failures, simplePairs }, null, 2)
  );
  console.log("Done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
