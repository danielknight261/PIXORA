/**
 * Replace White 17oz Stainless Steel Water Bottle media with Gelato personalization mockups.
 * Order: front (featured), left, right, scenes. Skips default.webp (duplicate of left).
 */
import fs from "node:fs";
import path from "node:path";
import os from "os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const PRODUCT_ID = "gid://shopify/Product/15942741885272";
const VARIANT_ID = "57983191974232";
const MOCKUP_DIR =
  "c:\\Users\\HughesHub\\Downloads\\f18bc8da-8458-4cd2-843a-2a86db29d151\\bottle_product_bsz_17-oz_bmat_stainless-steel-white_cl_4-0";
const IMAGE_ORDER = [
  "front.webp",
  "left.webp",
  "right.webp",
  "scene01.webp",
  "scene02.webp",
  "scene03.webp",
];
const REPORT_PATH = "downloads/water-bottle-gallery-upload-report.json";
const SNIPPET_PATH = path.join(
  "apps",
  "shopify-theme",
  "snippets",
  "water-bottle-gallery-data.liquid"
);
const GALLERY_JSON = "downloads/water-bottle-variant-gallery.json";

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
    console.log(
      `Deleted ${Math.min(i + 20, mediaIds.length)}/${mediaIds.length}`
    );
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
  const files = IMAGE_ORDER.map((name) => ({
    name,
    path: path.join(MOCKUP_DIR, name),
  }));
  const missing = files.filter((f) => !fs.existsSync(f.path)).map((f) => f.name);
  console.log({
    product: PRODUCT_ID,
    variant: VARIANT_ID,
    images: files.length,
    missing,
  });
  if (missing.length) throw new Error("Missing: " + missing.join(", "));
  if (dry) return;

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

  const items = [];
  for (const file of files) {
    const filename = `${VARIANT_ID}-${file.name}`;
    process.stdout.write(`upload ${file.name} ... `);
    const resourceUrl = await stagedUpload(token, file.path, filename);
    const kind = file.name.replace(/\.webp$/i, "").toLowerCase();
    items.push({
      resourceUrl,
      filename,
      alt: `White 17oz Stainless Steel Water Bottle · ${kind}`,
      originalSource: null,
    });
    console.log("ok");
    await sleep(120);
  }

  const shopFiles = await createShopFiles(
    token,
    items.map(({ resourceUrl, filename, alt }) => ({
      resourceUrl,
      filename,
      alt,
    }))
  );
  const fileIds = shopFiles.map((f) => f.id);
  const urls = await waitUrls(token, fileIds);
  console.log("files ready", urls.length);

  const gallery = { [VARIANT_ID]: urls.map(withWidth) };
  fs.writeFileSync(SNIPPET_PATH, JSON.stringify(gallery));
  fs.writeFileSync(
    GALLERY_JSON,
    JSON.stringify({ counts: { [urls.length]: 1 }, gallery }, null, 2)
  );
  fs.writeFileSync(
    REPORT_PATH,
    JSON.stringify(
      {
        ok: [
          {
            variantId: VARIANT_ID,
            variantIds: [VARIANT_ID],
            title: "Default Title",
            urls,
          },
        ],
        fail: [],
      },
      null,
      2
    )
  );

  const existingMedia = await fetchAllProductMedia(token);
  console.log("existing product media", existingMedia.length);
  if (existingMedia.length) {
    await deleteProductMedia(
      token,
      existingMedia.map((m) => m.id)
    );
  }

  const media = await createProductMedia(
    token,
    urls.map((url, i) => ({
      originalSource: url.split("?")[0],
      alt: items[i].alt,
    }))
  );
  console.log("created product media", media.length);

  // Wait for product media READY then link featured to first (front)
  let featuredMediaId = null;
  for (let i = 0; i < 40; i++) {
    const data = await gql(
      token,
      `query ($id: ID!) {
        product(id: $id) {
          media(first: 10) {
            nodes {
              id
              ... on MediaImage { status image { url } }
            }
          }
        }
      }`,
      { id: PRODUCT_ID }
    );
    const nodes = data.product.media.nodes || [];
    const ready = nodes.filter((n) => n.status === "READY" && n.image?.url);
    if (ready.length >= urls.length) {
      featuredMediaId = ready[0].id;
      break;
    }
    await sleep(700);
  }
  if (!featuredMediaId) {
    featuredMediaId = media[0]?.id;
  }
  if (featuredMediaId) {
    const data = await gql(
      token,
      `mutation ($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          userErrors { message }
        }
      }`,
      {
        productId: PRODUCT_ID,
        variants: [
          {
            id: `gid://shopify/ProductVariant/${VARIANT_ID}`,
            mediaId: featuredMediaId,
          },
        ],
      }
    );
    const errs = data.productVariantsBulkUpdate.userErrors || [];
    if (errs.length) console.warn("featured errs", errs);
    else console.log("linked featured to front");
  }

  console.log({
    uploaded: urls.length,
    galleryVariants: 1,
    featured: Boolean(featuredMediaId),
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
