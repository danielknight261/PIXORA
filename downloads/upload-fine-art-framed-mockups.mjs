/**
 * Map Gelato Fine Art Framed Poster mockups (Simple first).
 * Prefer black wood folders over aluminum when both exist.
 * One known gap: Dark wood / Vertical / 16x24 (no mockup folder).
 */
import fs from "node:fs";
import path from "node:path";
import os from "os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const PRODUCT_ID = "gid://shopify/Product/15937938129240";
const MOCKUP_ROOT =
  "c:\\Users\\HughesHub\\Downloads\\accd335d-26eb-4ed9-ae12-c7823bc3c29a";
const IMAGE_ORDER = [
  "Simple.webp",
  "Close-Up-Industrial-Kitchen-White-0.webp",
  "Home-Office-Scandinavian-White-2.webp",
  "Bedroom-Creative-Green-0.webp",
];
const REPORT_PATH = "downloads/fine-art-framed-gallery-upload-report.json";
const VARIANT_PATH = "downloads/fine-art-framed-variants-classed.json";
const SNIPPET_PATH = path.join(
  "apps",
  "shopify-theme",
  "snippets",
  "fine-art-framed-poster-gallery-data.liquid"
);
const GALLERY_JSON = "downloads/fine-art-framed-variant-gallery.json";

const FOLDER_RE =
  /^framed_fine_arts_poster_mounted_geo_simplified_product_12-0_([^_]+)_(wood|aluminum)_.+_(hor|ver)_(.+?)_\4_200-gsm-80lb-enhanced-uncoated$/i;

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
  const m = name.match(FOLDER_RE);
  if (!m) return null;
  const color = m[1].toLowerCase();
  const material = m[2].toLowerCase();
  const hor = m[3].toLowerCase() === "hor";
  const sizeKey = m[4].toLowerCase();
  const inchM = sizeKey.match(/(\d+)x(\d+)-inch/);
  const mmM = sizeKey.match(/^(\d+)x(\d+)-mm/);
  const aM = sizeKey.match(/^a([0-4])(?:-|_|$)/);
  const inch = inchM ? `${inchM[1]}x${inchM[2]}` : null;
  const mm = mmM ? `${mmM[1]}x${mmM[2]}` : null;
  const square =
    (inch && inch.split("x")[0] === inch.split("x")[1]) ||
    (mm && mm.split("x")[0] === mm.split("x")[1]);
  let orient = "portrait";
  if (square) orient = "square";
  else if (hor) orient = "landscape";
  return {
    folder: name,
    color,
    material,
    frame: color,
    orient,
    sizeKey,
    inch,
    mm,
    a: aM ? `a${aM[1]}` : null,
    xl: /\bxl\b/.test(sizeKey),
    fiveR: /\b5r\b/.test(sizeKey),
    square,
  };
}

function shopifyInch(size) {
  const m = String(size).match(/(\d+)\s*[x×]\s*(\d+)\s*(?:″|"|in)/i);
  return m ? `${m[1]}x${m[2]}` : null;
}

function shopifyCm(size) {
  const m = String(size).match(
    /(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*cm/i
  );
  return m ? `${m[1]}x${m[2]}` : null;
}

function sizeBlob(size) {
  return String(size)
    .toLowerCase()
    .replace(/[″"']/g, "")
    .replace(/\s+/g, "");
}

function sizeMatches(meta, variant) {
  const size = sizeBlob(variant.size);
  const inch = shopifyInch(variant.size);
  const cm = shopifyCm(variant.size);
  if (meta.fiveR) return size.includes("5x7") || size.includes("13x18");
  if (meta.xl) return size.includes("11x17") || /\bxl\b/.test(size);
  if (meta.a === "a4") return size.includes("8x12") || size.includes("21x29.7");
  if (meta.a) return size.includes(meta.a);
  // Prefer explicit inch / cm equality so 30x40 cm ≠ 30x40 inch
  if (meta.inch && inch && inch === meta.inch) return true;
  if (meta.mm && cm) {
    const [w, h] = meta.mm.split("x").map((n) => Number(n) / 10);
    if (cm === `${w}x${h}`) return true;
  }
  return false;
}

function matches(meta, variant) {
  if (meta.frame !== variant.frame) return false;
  if (meta.orient !== variant.orient) return false;
  return sizeMatches(meta, variant);
}

function buildJobs() {
  const variants = JSON.parse(fs.readFileSync(VARIANT_PATH, "utf8"));
  const folders = fs
    .readdirSync(MOCKUP_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const metas = [];
  const unmatched = [];
  for (const folder of folders) {
    const meta = parseFolder(folder);
    if (!meta) unmatched.push({ folder, reason: "parse" });
    else metas.push(meta);
  }
  // Prefer wood over aluminum for black (and generally)
  metas.sort((a, b) => {
    if (a.material === b.material) return 0;
    if (a.material === "wood") return -1;
    if (b.material === "wood") return 1;
    return 0;
  });

  const used = new Set();
  const jobs = [];
  for (const meta of metas) {
    const hit = variants.find((v) => !used.has(v.id) && matches(meta, v));
    if (!hit) {
      unmatched.push({ folder: meta.folder, reason: "no-variant", meta });
      continue;
    }
    used.add(hit.id);
    const files = IMAGE_ORDER.map((name) => ({
      name,
      path: path.join(MOCKUP_ROOT, meta.folder, name),
    }));
    const missing = files.filter((f) => !fs.existsSync(f.path)).map((f) => f.name);
    jobs.push({
      folder: meta.folder,
      material: meta.material,
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
  const leftover = variants
    .filter((v) => !used.has(v.id))
    .map((v) => ({ title: v.title, frame: v.frame, orient: v.orient, size: v.size }));
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
  const allowIncomplete = process.argv.includes("--allow-incomplete");
  const { jobs, unmatched, leftover } = buildJobs();
  console.log({
    jobs: jobs.length,
    unmatched: unmatched.length,
    leftover: leftover.length,
    missingFiles: jobs.filter((j) => j.missing.length).length,
    blackWood: jobs.filter((j) => j.frame === "black" && j.material === "wood")
      .length,
    blackAlum: jobs.filter(
      (j) => j.frame === "black" && j.material === "aluminum"
    ).length,
  });
  if (unmatched.length) console.log("unmatched", unmatched.slice(0, 10));
  if (leftover.length) console.log("leftover variants", leftover);
  if (dry) {
    console.log(
      "sample",
      jobs.slice(0, 8).map((j) => ({
        title: j.title,
        material: j.material,
        frame: j.frame,
        missing: j.missing,
      }))
    );
    return;
  }
  if ((unmatched.length || leftover.length) && !allowIncomplete) {
    throw new Error("Map is incomplete; fix matching or pass --allow-incomplete");
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
  report.ok = report.ok.filter((row) => (row.urls || []).length >= IMAGE_ORDER.length);
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
        leftover,
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
