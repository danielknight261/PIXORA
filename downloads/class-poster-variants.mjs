import fs from "node:fs";
import path from "node:path";
import os from "os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const PRODUCT_ID = "gid://shopify/Product/15933333274968";

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
  return account.applications[shopKey].accessToken;
}

function classify(title) {
  const t = String(title).toLowerCase();
  const size = (title.split(" / ").slice(1).join(" / ") || title).trim();
  const m = size.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
  const square = m && Number(m[1]) === Number(m[2]);
  let orient = "portrait";
  if (t.includes("horiz") || t.includes("land")) orient = "landscape";
  else if (t.includes("square")) orient = "square";
  else if (t.includes("vert") || t.includes("port")) orient = "portrait";
  if (square) orient = "square";
  return { orient, size };
}

const token = loadToken();
const variants = [];
let cursor = null;
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
          variants(first: 50, after: $cursor) {
            pageInfo { hasNextPage endCursor }
            nodes {
              id
              title
              selectedOptions { name value }
              media(first: 5) {
                nodes { ... on MediaImage { id alt image { url width height } } }
              }
            }
          }
        }
      }`,
      variables: { id: PRODUCT_ID, cursor },
    }),
  });
  const json = await res.json();
  variants.push(...json.data.product.variants.nodes);
  if (!json.data.product.variants.pageInfo.hasNextPage) break;
  cursor = json.data.product.variants.pageInfo.endCursor;
}

const rows = variants.map((v) => {
  const c = classify(v.title);
  const img = v.media.nodes[0]?.image;
  return {
    id: v.id.split("/").pop(),
    title: v.title,
    options: v.selectedOptions,
    ...c,
    file: img?.url?.split("/").pop()?.split("?")[0],
    url: img?.url,
  };
});

const byOrient = {};
for (const r of rows) {
  byOrient[r.orient] = (byOrient[r.orient] || 0) + 1;
}
console.log({ total: rows.length, byOrient });
console.log(
  "samples",
  ["portrait", "landscape", "square"].map((o) =>
    rows.find((r) => r.orient === o)
  )
);
fs.writeFileSync(
  "downloads/poster-variants-classed.json",
  JSON.stringify(rows, null, 2)
);
