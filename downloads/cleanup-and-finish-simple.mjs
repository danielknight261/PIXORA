/**
 * 1) Delete old Gelato placeholder media (not Close-Up / Simple)
 * 2) Upload remaining Simple.webp
 * 3) Append Simple media to each variant (one id per call)
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
    nodes.push(...data.product.media.nodes);
    if (!data.product.media.pageInfo.hasNextPage) break;
    cursor = data.product.media.pageInfo.endCursor;
  }
  return nodes;
}

async function deleteMedia(token, mediaIds) {
  const chunk = 20;
  for (let i = 0; i < mediaIds.length; i += chunk) {
    const batch = mediaIds.slice(i, i + chunk);
    const data = await gql(
      token,
      `mutation productDeleteMedia($productId: ID!, $mediaIds: [ID!]!) {
        productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
          deletedMediaIds
          mediaUserErrors { message }
        }
      }`,
      { productId: PRODUCT_ID, mediaIds: batch }
    );
    const errs = data.productDeleteMedia.mediaUserErrors || [];
    if (errs.length) console.warn("delete errs", errs);
    console.log(
      `Deleted ${Math.min(i + chunk, mediaIds.length)}/${mediaIds.length}`
    );
    await sleep(500);
  }
}

async function stagedUpload(token, filePath) {
  const filename = path.basename(filePath);
  const fileSize = fs.statSync(filePath).size;
  const data = await gql(
    token,
    `mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { message }
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
  if (data.stagedUploadsCreate.userErrors?.length) {
    throw new Error(JSON.stringify(data.stagedUploadsCreate.userErrors));
  }
  const target = data.stagedUploadsCreate.stagedTargets[0];
  const form = new FormData();
  for (const p of target.parameters) form.append(p.name, p.value);
  form.append(
    "file",
    new Blob([fs.readFileSync(filePath)], { type: "image/webp" }),
    filename
  );
  const up = await fetch(target.url, { method: "POST", body: form });
  if (!up.ok) throw new Error("upload " + up.status);
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
  if (data.productCreateMedia.mediaUserErrors?.length) {
    throw new Error(JSON.stringify(data.productCreateMedia.mediaUserErrors));
  }
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
    if (data.node?.status === "FAILED") throw new Error("FAILED");
    await sleep(700);
  }
  throw new Error("timeout");
}

async function appendOne(token, variantId, mediaId) {
  const data = await gql(
    token,
    `mutation productVariantAppendMedia($productId: ID!, $variantMedia: [ProductVariantAppendMediaInput!]!) {
      productVariantAppendMedia(productId: $productId, variantMedia: $variantMedia) {
        userErrors { message }
      }
    }`,
    {
      productId: PRODUCT_ID,
      variantMedia: [{ variantId, mediaIds: [mediaId] }],
    }
  );
  const errs = data.productVariantAppendMedia.userErrors || [];
  if (errs.length) throw new Error(JSON.stringify(errs));
}

async function main() {
  const token = getToken();
  const closeUpIds = new Set(
    JSON.parse(
      fs.readFileSync("downloads/canvas-mockup-upload-report.json", "utf8")
    ).pairs.map((p) => p.mediaId)
  );

  let existingSimple = {};
  try {
    const prev = JSON.parse(
      fs.readFileSync("downloads/canvas-simple-upload-report.json", "utf8")
    );
    // partial file may not exist if script crashed before write
    if (prev.simplePairs) {
      existingSimple = Object.fromEntries(
        prev.simplePairs.map((p) => [p.id, p.simpleId])
      );
    }
  } catch {}

  // Also recover simple ids from product media alts ending with · simple
  console.log("Fetching media...");
  const media = await fetchAllMedia(token);
  console.log("Total media", media.length);

  const keep = new Set(closeUpIds);
  for (const m of media) {
    if ((m.alt || "").includes("· simple") || (m.alt || "").includes("simple")) {
      keep.add(m.id);
    }
    if ((m.image?.url || "").includes("Close-Up-Plain-Gray")) keep.add(m.id);
    if ((m.image?.url || "").includes("Simple_")) keep.add(m.id);
    if ((m.image?.url || "").includes("/Simple.webp") || (m.image?.url || "").includes("Simple-"))
      keep.add(m.id);
  }
  // keep by filename pattern from CDN
  for (const m of media) {
    const url = m.image?.url || "";
    if (url.includes("Close-Up-Plain-Gray-0_")) keep.add(m.id);
    if (/Simple_[a-f0-9-]{36}/i.test(url) || url.includes("Simple_")) keep.add(m.id);
  }

  const toDelete = media.filter((m) => !keep.has(m.id)).map((m) => m.id);
  console.log({ keep: keep.size, toDelete: toDelete.length });
  if (toDelete.length) await deleteMedia(token, toDelete);

  const jobs = JSON.parse(
    fs.readFileSync("downloads/canvas-mockup-jobs.json", "utf8")
  ).jobs;
  const closeUps = Object.fromEntries(
    JSON.parse(
      fs.readFileSync("downloads/canvas-mockup-upload-report.json", "utf8")
    ).pairs.map((p) => [p.id, p.mediaId])
  );

  // map existing simple from media alts
  const simpleByAlt = {};
  const mediaAfter = await fetchAllMedia(token);
  for (const m of mediaAfter) {
    const alt = m.alt || "";
    if (alt.includes("· simple")) {
      const base = alt.replace(/\s*·\s*simple\s*$/i, "").trim();
      simpleByAlt[base] = m.id;
    }
  }

  const simplePairs = [];
  const failures = [];
  let i = 0;
  for (const job of jobs) {
    i++;
    let simpleId = existingSimple[job.variantId] || simpleByAlt[job.alt];
    if (simpleId) {
      simplePairs.push({
        id: job.variantId,
        simpleId,
        closeUpId: closeUps[job.variantId],
        title: job.title,
      });
      continue;
    }
    const simplePath = path.join(MOCKUP_ROOT, job.folder, "Simple.webp");
    process.stdout.write(`[${i}/${jobs.length}] upload ${job.title} ... `);
    if (!fs.existsSync(simplePath)) {
      console.log("SKIP");
      failures.push({ title: job.title, error: "missing file" });
      continue;
    }
    try {
      const resourceUrl = await stagedUpload(token, simplePath);
      const created = await createMedia(token, resourceUrl, `${job.alt} · simple`);
      await waitReady(token, created.id);
      simpleId = created.id;
      simplePairs.push({
        id: job.variantId,
        simpleId,
        closeUpId: closeUps[job.variantId],
        title: job.title,
      });
      console.log("ok");
    } catch (e) {
      console.log("FAIL", e.message);
      failures.push({ title: job.title, error: e.message });
    }
    await sleep(200);
  }

  console.log("Appending Simple to variants...", simplePairs.length);
  let appended = 0;
  for (const p of simplePairs) {
    if (!p.simpleId || !p.closeUpId) continue;
    try {
      // featured already close-up; append simple as second
      await appendOne(token, p.id, p.simpleId);
      appended++;
      if (appended % 10 === 0) console.log(`Appended ${appended}/${simplePairs.length}`);
    } catch (e) {
      // already attached is ok
      if (!/already/i.test(e.message)) {
        failures.push({ title: p.title, error: "append " + e.message });
      }
    }
    await sleep(150);
  }

  // Ensure featured stays Close-Up
  const chunk = 25;
  for (let j = 0; j < simplePairs.length; j += chunk) {
    const batch = simplePairs.slice(j, j + chunk).filter((p) => p.closeUpId);
    await gql(
      token,
      `mutation ($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          userErrors { message }
        }
      }`,
      {
        productId: PRODUCT_ID,
        variants: batch.map((p) => ({ id: p.id, mediaId: p.closeUpId })),
      }
    );
    await sleep(300);
  }

  fs.writeFileSync(
    "downloads/canvas-simple-upload-report.json",
    JSON.stringify({ assigned: simplePairs.length, appended, failures, simplePairs }, null, 2)
  );
  const finalMedia = await fetchAllMedia(token);
  console.log("Done. Media count:", finalMedia.length, "simple pairs:", simplePairs.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
