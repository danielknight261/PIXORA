/**
 * Map Gelato poster mockup folders to Shopify variants, upload all 3
 * images per size/orientation, and write the theme gallery JSON.
 */
import fs from "node:fs";
import path from "node:path";
import os from "os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const PRODUCT_ID = "gid://shopify/Product/15933333274968";
const MOCKUP_ROOT =
  "c:\\Users\\HughesHub\\Downloads\\39b68734-9f26-48c4-9fcc-ff51058f4a0b\\e4764484-703d-4b6f-9c8b-099bc3cf63d4";
const IMAGE_ORDER = [
  "Simple.webp",
  "Close-Up-Living-Room-Green-0.webp",
  "Kitchen-Parisian-White-1.webp",
];
const REPORT_PATH = "downloads/poster-mockup-upload-report.json";

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
  const m = name.match(/^flat_(.+)_200-gsm-80lb-uncoated_4-0_(hor|ver)$/i);
  if (!m) return null;
  const key = m[1].toLowerCase();
  const hor = m[2].toLowerCase() === "hor";
  const inchM = key.match(/(\d+)x(\d+)-inch/);
  const mmM = key.match(/^(\d+)x(\d+)-mm/);
  const aM = key.match(/^a([0-4])(?:-|_|$)/);
  const inch = inchM ? `${inchM[1]}x${inchM[2]}` : null;
  const mm = mmM ? `${mmM[1]}x${mmM[2]}` : null;
  const square =
    (inch && inch.split("x")[0] === inch.split("x")[1]) ||
    (mm && mm.split("x")[0] === mm.split("x")[1]);
  let orient = "portrait";
  if (hor) orient = "landscape";
  else if (square) orient = "square";
  return {
    folder: name,
    key,
    orient,
    inch,
    mm,
    a: aM ? `a${aM[1]}` : null,
    xl: /\bxl\b/.test(key),
    fiveR: /\b5r\b/.test(key),
  };
}

function sizeBlob(size) {
  return String(size)
    .toLowerCase()
    .replace(/[″"']/g, "")
    .replace(/\s+/g, "");
}

function matches(meta, variant) {
  if (meta.orient !== variant.orient) return false;
  const size = sizeBlob(variant.size);
  if (meta.fiveR) return size.includes("5x7") || size.includes("13x18");
  if (meta.xl) return size.includes("11x17") || size.includes("xl");
  if (meta.a === "a4") return size.includes("8x12") || size.includes("21x29.7");
  if (meta.a) return size.includes(meta.a);
  if (meta.inch && size.includes(meta.inch)) return true;
  if (meta.mm) {
    const [w, h] = meta.mm.split("x").map((n) => Number(n) / 10);
    const cm = `${w}x${h}`;
    if (size.includes(cm)) return true;
  }
  return false;
}

function buildJobs() {
  const variants = JSON.parse(
    fs.readFileSync("downloads/poster-variants-classed.json", "utf8")
  );
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

async function createMedia(token, items) {
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
        originalSource: item.resourceUrl,
        mediaContentType: "IMAGE",
        alt: item.alt,
      })),
    }
  );
  const errs = data.productCreateMedia.mediaUserErrors || [];
  if (errs.length) throw new Error(JSON.stringify(errs));
  return data.productCreateMedia.media;
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
              status
              image { url }
            }
          }
        }`,
        { id }
      );
      const status = data.node?.status;
      if (status === "FAILED") throw new Error("FAILED " + id);
      if (status === "READY" && data.node?.image?.url) {
        url = data.node.image.url.split("?")[0] + "?width=1100";
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
      jobs.slice(0, 3).map((j) => ({ title: j.title, folder: j.folder }))
    );
    return;
  }
  if (unmatched.length || leftover.length) {
    throw new Error("Map is incomplete; fix matching before upload");
  }

  const token = loadToken();
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
          alt: `${job.title} · ${kind}`,
        });
        await sleep(120);
      }
      const media = await createMedia(token, items);
      const ids = media.map((m) => m.id);
      const urls = await waitUrls(token, ids);
      report.ok.push({
        variantId: job.variantId,
        title: job.title,
        orient: job.orient,
        urls,
        mediaIds: ids,
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
  const snippetPath = path.join(
    "apps",
    "shopify-theme",
    "snippets",
    "matte-poster-gallery-data.liquid"
  );
  fs.writeFileSync(snippetPath, JSON.stringify(gallery));
  fs.writeFileSync(
    "downloads/matte-poster-gallery.json",
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
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
