/**
 * Map Gelato framed-canvas mockups (Simple first) onto Framed Canvas.
 */
import fs from "node:fs";
import path from "node:path";
import os from "os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const PRODUCT_ID = "gid://shopify/Product/15938102231384";
const MOCKUP_ROOT =
  "c:\\Users\\HughesHub\\Downloads\\f93b4302-63cf-4f1d-bc79-f8ad4fdb2ede";
const IMAGE_ORDER = [
  "Simple.webp",
  "Kitchen-Japanese-White-1.webp",
  "Bedroom-Kids-White-1.webp",
];
const REPORT_PATH = "downloads/framed-canvas-gallery-upload-report.json";
const VARIANT_PATH = "downloads/framed-canvas-variants-classed.json";
const SNIPPET_PATH = path.join(
  "apps",
  "shopify-theme",
  "snippets",
  "framed-canvas-variant-gallery-data.liquid"
);
const GALLERY_JSON = "downloads/framed-canvas-variant-gallery.json";

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
  const token = account.applications[shopKey]?.accessToken;
  if (!token) throw new Error("No shop token");
  return token;
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
      await sleep(2500);
      return gql(token, query, variables);
    }
    throw new Error(msg);
  }
  return json.data;
}

function parseFolder(name) {
  const m = name.match(
    /^framed_canvas_geo_simplified_\d+x\d+-mm-(\d+)x(\d+)-inch_(black|dark-wood|natural-wood)_.+_(hor|ver)_wood_w14xt42-mm_canvas_4-0$/i
  );
  if (!m) return null;
  return {
    folder: name,
    inchKey: `${m[1]}x${m[2]}`,
    frame: m[3].toLowerCase(),
    orientation: m[4].toLowerCase() === "hor" ? "Horizontal" : "Vertical",
    square: m[1] === m[2],
  };
}

function matches(meta, variant) {
  if (variant.inch !== meta.inchKey) return false;
  if (variant.frame !== meta.frame) return false;
  if (variant.square) return true;
  const want = meta.orientation === "Horizontal" ? "landscape" : "portrait";
  return variant.orient === want;
}

function buildJobs() {
  const variants = JSON.parse(fs.readFileSync(VARIANT_PATH, "utf8"));
  const folders = fs
    .readdirSync(MOCKUP_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  const used = new Set();
  const jobs = [];
  const unmatched = [];
  for (const folder of folders) {
    const meta = parseFolder(folder);
    if (!meta) {
      unmatched.push({ folder, reason: "parse" });
      continue;
    }
    const hit = variants.find((v) => !used.has(v.id) && matches(meta, v));
    if (!hit) {
      unmatched.push({ folder, reason: "no-variant", meta });
      continue;
    }
    used.add(hit.id);
    const files = IMAGE_ORDER.map((name) => ({
      name,
      path: path.join(MOCKUP_ROOT, folder, name),
    }));
    const missing = files.filter((f) => !fs.existsSync(f.path)).map((f) => f.name);
    jobs.push({
      folder,
      variantId: hit.id,
      gid: `gid://shopify/ProductVariant/${hit.id}`,
      title: hit.title,
      orient: hit.orient,
      size: hit.size,
      frame: hit.frame,
      files,
      missing,
    });
  }
  const leftover = variants.filter((v) => !used.has(v.id)).map((v) => v.title);
  return { jobs, unmatched, leftover };
}

async function stagedUpload(token, filePath, filename) {
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
          resource: "FILE",
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

async function createShopFiles(token, items) {
  const data = await gql(
    token,
    `mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          id
          fileStatus
          ... on MediaImage { id status image { url } }
          ... on GenericFile { id url }
        }
        userErrors { field message }
      }
    }`,
    {
      files: items.map((item) => ({
        originalSource: item.resourceUrl,
        contentType: "IMAGE",
        alt: item.alt,
        filename: item.filename,
      })),
    }
  );
  const errs = data.fileCreate.userErrors || [];
  if (errs.length) throw new Error(JSON.stringify(errs));
  return data.fileCreate.files;
}

async function createProductMedia(token, items) {
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
      media: items.map((item) => ({
        originalSource: item.originalSource,
        mediaContentType: "IMAGE",
        alt: item.alt,
      })),
    }
  );
  const errs = data.productCreateMedia.mediaUserErrors || [];
  if (errs.length) throw new Error(JSON.stringify(errs));
  return data.productCreateMedia.media;
}

async function fetchAllProductMedia(token) {
  const nodes = [];
  let cursor = null;
  for (;;) {
    const data = await gql(
      token,
      `query ($id: ID!, $cursor: String) {
        product(id: $id) {
          media(first: 100, after: $cursor) {
            pageInfo { hasNextPage endCursor }
            nodes { id }
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

async function deleteProductMedia(token, mediaIds) {
  for (let i = 0; i < mediaIds.length; i += 20) {
    const batch = mediaIds.slice(i, i + 20);
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
    console.log(`Deleted ${Math.min(i + 20, mediaIds.length)}/${mediaIds.length}`);
    await sleep(400);
  }
}

async function waitUrls(token, mediaIds) {
  const urls = [];
  for (const id of mediaIds) {
    let url = null;
    for (let i = 0; i < 40; i++) {
      const data = await gql(
        token,
        `query ($id: ID!) {
          node(id: $id) {
            ... on MediaImage {
              fileStatus
              status
              image { url }
            }
            ... on GenericFile {
              fileStatus
              url
            }
          }
        }`,
        { id }
      );
      const node = data.node || {};
      const status = node.status || node.fileStatus;
      const raw = node.image?.url || node.url;
      if (status === "FAILED") throw new Error("FAILED " + id);
      if ((status === "READY" || status === "UPLOADED") && raw) {
        url = raw.split("?")[0] + "?width=1100";
        break;
      }
      await sleep(700);
    }
    if (!url) throw new Error("timeout " + id);
    urls.push(url);
  }
  return urls;
}

function withWidth(url) {
  if (!url) return url;
  return url.split("?")[0] + "?width=1100";
}

async function main() {
  const dry = process.argv.includes("--dry-run");
  const skipFeatured = process.argv.includes("--skip-featured");
  const { jobs, unmatched, leftover } = buildJobs();
  console.log({
    jobs: jobs.length,
    unmatched: unmatched.length,
    leftover: leftover.length,
    missingFiles: jobs.filter((j) => j.missing.length).length,
  });
  if (unmatched.length) console.log("unmatched", unmatched);
  if (leftover.length) console.log("leftover variants", leftover);
  if (dry) {
    console.log(
      "sample",
      jobs.slice(0, 6).map((j) => ({
        title: j.title,
        folder: j.folder,
        frame: j.frame,
        missing: j.missing,
      }))
    );
    return;
  }
  if (unmatched.length || leftover.length) {
    throw new Error("Map is incomplete; fix matching before upload");
  }
  const missingAny = jobs.filter((j) => j.missing.length);
  if (missingAny.length) {
    throw new Error("Missing mockup files: " + missingAny[0].title);
  }

  const token = loadToken();
  await gql(
    token,
    `mutation ($product: ProductUpdateInput!) {
      productUpdate(product: $product) {
        product { vendor }
        userErrors { message }
      }
    }`,
    { product: { id: PRODUCT_ID, vendor: "Snapp Daddy" } }
  );
  console.log("Updated vendor");

  let report = { ok: [], fail: [] };
  if (fs.existsSync(REPORT_PATH)) {
    try {
      report = JSON.parse(fs.readFileSync(REPORT_PATH, "utf8"));
      if (!Array.isArray(report.ok)) report.ok = [];
      if (!Array.isArray(report.fail)) report.fail = [];
    } catch {
      report = { ok: [], fail: [] };
    }
  }
  report.ok = report.ok.filter((row) => (row.urls || []).length >= 3);
  report.fail = [];
  const done = new Set(report.ok.map((r) => r.variantId));

  let i = 0;
  for (const job of jobs) {
    i++;
    if (done.has(job.variantId)) {
      console.log(`[${i}/${jobs.length}] skip ${job.title}`);
      continue;
    }
    process.stdout.write(`[${i}/${jobs.length}] ${job.title} ... `);
    try {
      const items = [];
      for (const file of job.files) {
        const filename = `${job.variantId}-${file.name}`;
        const resourceUrl = await stagedUpload(token, file.path, filename);
        const kind = file.name.replace(/\.webp$/i, "").toLowerCase();
        items.push({
          resourceUrl,
          filename,
          alt: `${job.title} · ${kind}`,
        });
        await sleep(120);
      }
      const files = await createShopFiles(token, items);
      const ids = files.map((f) => f.id);
      const urls = await waitUrls(token, ids);
      report.ok.push({
        variantId: job.variantId,
        title: job.title,
        orient: job.orient,
        frame: job.frame,
        urls,
      });
      done.add(job.variantId);
      fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
      console.log("ok");
    } catch (e) {
      console.log("FAIL", e.message);
      report.fail.push({ title: job.title, error: e.message });
      fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    }
    await sleep(200);
  }

  const gallery = {};
  for (const row of report.ok) {
    gallery[row.variantId] = (row.urls || []).map(withWidth);
  }
  fs.writeFileSync(SNIPPET_PATH, JSON.stringify(gallery));
  fs.writeFileSync(
    GALLERY_JSON,
    JSON.stringify(
      {
        counts: Object.values(gallery).reduce((acc, urls) => {
          acc[urls.length] = (acc[urls.length] || 0) + 1;
          return acc;
        }, {}),
        gallery,
      },
      null,
      2
    )
  );
  console.log({
    uploaded: report.ok.length,
    failed: report.fail.length,
    galleryVariants: Object.keys(gallery).length,
  });
  if (report.fail.length) {
    throw new Error("Some uploads failed; re-run to resume");
  }
  if (skipFeatured) return;

  const existingMedia = await fetchAllProductMedia(token);
  console.log("existing product media", existingMedia.length);
  if (existingMedia.length) {
    await deleteProductMedia(
      token,
      existingMedia.map((m) => m.id)
    );
  }

  const featuredRows = [];
  let fi = 0;
  for (const row of report.ok) {
    fi++;
    const simpleUrl = (row.urls || [])[0];
    if (!simpleUrl) continue;
    process.stdout.write(`featured ${fi}/${report.ok.length} ${row.title} ... `);
    const media = await createProductMedia(token, [
      {
        originalSource: simpleUrl.split("?")[0],
        alt: `${row.title} · simple`,
      },
    ]);
    const mediaId = media[0]?.id;
    if (mediaId) {
      featuredRows.push({
        id: `gid://shopify/ProductVariant/${row.variantId}`,
        mediaId,
      });
    }
    console.log("ok");
    await sleep(120);
  }
  for (let n = 0; n < featuredRows.length; n += 25) {
    const batch = featuredRows.slice(n, n + 25);
    const data = await gql(
      token,
      `mutation ($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          userErrors { message }
        }
      }`,
      { productId: PRODUCT_ID, variants: batch }
    );
    const errs = data.productVariantsBulkUpdate.userErrors || [];
    if (errs.length) console.warn("featured errs", errs);
    console.log(
      "linked featured",
      Math.min(n + 25, featuredRows.length),
      "/",
      featuredRows.length
    );
    await sleep(300);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
