import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const PRODUCT_ID = "gid://shopify/Product/15937938129240";

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

function frameKey(raw) {
  const v = String(raw || "").toLowerCase();
  if (v.includes("dark")) return "dark-wood";
  if (v.includes("white")) return "white";
  if (v.includes("black")) return "black";
  if (v.includes("natural") || v.includes("wood") || v.includes("oak"))
    return "natural-wood";
  return v.replace(/\s+/g, "-");
}

function sizeBlob(size) {
  return String(size)
    .toLowerCase()
    .replace(/[″"']/g, "")
    .replace(/\s+/g, "");
}

function inchKey(size) {
  const m = String(size).match(/(\d+)\s*[x×]\s*(\d+)\s*(?:″|"|in)/i);
  return m ? `${m[1]}x${m[2]}` : null;
}

function classify(v) {
  const opts = Object.fromEntries(
    (v.selectedOptions || []).map((o) => [o.name, o.value])
  );
  const size = opts.Size || "";
  const blob = sizeBlob(size);
  const inch = inchKey(size);
  const square = Boolean(inch && inch.split("x")[0] === inch.split("x")[1]);
  const orientRaw = String(opts.Orientation || v.title || "").toLowerCase();
  let orient = "portrait";
  if (square) {
    orient = "square";
  } else if (orientRaw.includes("horiz") || orientRaw.includes("land")) {
    orient = "landscape";
  } else if (orientRaw.includes("vert") || orientRaw.includes("port")) {
    orient = "portrait";
  }
  const aM = blob.match(/\ba([0-4])\b/);
  return {
    orient,
    size,
    sizeBlob: blob,
    inch,
    square,
    a: aM ? `a${aM[1]}` : null,
    xl: blob.includes("xl") || blob.includes("11x17"),
    fiveR: blob.includes("5x7") || blob.includes("13x18") || blob.includes("5r"),
    frame: frameKey(opts.Frame),
    orientationOpt: opts.Orientation || "",
    frameOpt: opts.Frame || "",
    allOpts: opts,
  };
}

const token = loadToken();
const variants = [];
let cursor = null;
let product = null;
for (;;) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `query ($id: ID!, $cursor: String) {
        product(id: $id) {
          id title handle vendor status descriptionHtml
          options { name values }
          collections(first: 10) { nodes { handle } }
          variants(first: 50, after: $cursor) {
            pageInfo { hasNextPage endCursor }
            nodes {
              id title sku price
              selectedOptions { name value }
            }
          }
        }
      }`,
      variables: { id: PRODUCT_ID, cursor },
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  product = json.data.product;
  variants.push(...product.variants.nodes);
  if (!product.variants.pageInfo.hasNextPage) break;
  cursor = product.variants.pageInfo.endCursor;
}

const rows = variants.map((v) => {
  const c = classify(v);
  return {
    id: v.id.split("/").pop(),
    gid: v.id,
    title: v.title,
    sku: v.sku,
    price: v.price,
    options: v.selectedOptions,
    ...c,
  };
});

const byOrient = {};
const byFrame = {};
for (const r of rows) {
  byOrient[r.orient] = (byOrient[r.orient] || 0) + 1;
  byFrame[r.frame] = (byFrame[r.frame] || 0) + 1;
}
console.log({
  handle: product.handle,
  variants: rows.length,
  byOrient,
  byFrame,
  sample: rows[0],
});
fs.writeFileSync(
  "downloads/fine-art-framed-variants-classed.json",
  JSON.stringify(rows, null, 2)
);
fs.writeFileSync(
  "downloads/fine-art-framed-product-meta.json",
  JSON.stringify(
    {
      id: product.id,
      handle: product.handle,
      vendor: product.vendor,
      options: product.options,
      descriptionHtml: product.descriptionHtml,
    },
    null,
    2
  )
);
