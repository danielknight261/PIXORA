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

async function main() {
  const token = getToken();
  const nodes = [];
  let cursor = null;
  for (;;) {
    const data = await gql(
      token,
      `query ($id: ID!, $cursor: String) {
        product(id: $id) {
          media(first: 100, after: $cursor) {
            pageInfo { hasNextPage endCursor }
            nodes { ... on MediaImage { alt image { url } } }
          }
        }
      }`,
      { id: PRODUCT_ID, cursor }
    );
    nodes.push(...data.product.media.nodes);
    if (!data.product.media.pageInfo.hasNextPage) break;
    cursor = data.product.media.pageInfo.endCursor;
  }

  const simpleByAlt = {};
  const closeByAlt = {};
  for (const m of nodes) {
    const alt = (m.alt || "").trim();
    const url = m.image.url;
    if (alt.includes("· simple")) {
      simpleByAlt[alt.replace(/\s*·\s*simple\s*$/i, "").trim()] = url;
    } else if (alt) {
      closeByAlt[alt] = url;
    }
  }

  const withWidth = (u) => u.split("?")[0] + "?width=1400";
  const jobs = JSON.parse(
    fs.readFileSync("downloads/canvas-mockup-jobs.json", "utf8")
  ).jobs;
  const gallery = {};
  let both = 0;
  for (const job of jobs) {
    const imgs = [];
    if (closeByAlt[job.alt]) imgs.push(withWidth(closeByAlt[job.alt]));
    if (simpleByAlt[job.alt]) imgs.push(withWidth(simpleByAlt[job.alt]));
    if (imgs.length === 2) both++;
    gallery[job.variantId.split("/").pop()] = imgs;
  }

  fs.writeFileSync(
    "apps/shopify-theme/assets/canvas-variant-gallery.json",
    JSON.stringify(gallery)
  );
  fs.writeFileSync(
    "downloads/canvas-variant-gallery.json",
    JSON.stringify(gallery, null, 2)
  );
  console.log({
    variants: jobs.length,
    withTwo: both,
    sample: gallery["57945652265304"],
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
