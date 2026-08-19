/**
 * Dump full translatable field values (not previews).
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const TYPES = ["PRODUCT", "COLLECTION", "PAGE", "PRODUCT_OPTION", "MENU", "LINK", "SHOP"];

function loadToken() {
  const cfg = JSON.parse(
    fs.readFileSync(
      path.join(os.homedir(), "AppData/Roaming/shopify-cli-store-nodejs/Config/config.json"),
      "utf8"
    )
  );
  const key = Object.keys(cfg).find((k) => k.includes("hxbghe"));
  const sess = Object.values(cfg[key]?.sessionsByUserId || {})[0];
  if (!sess?.accessToken) throw new Error("No token");
  return sess.accessToken;
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
  if (json.errors?.length) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data;
}

async function dumpType(token, resourceType) {
  const query = `query ($cursor: String) {
    translatableResources(first: 50, resourceType: ${resourceType}, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          resourceId
          translatableContent { key value digest locale }
        }
      }
    }
  }`;
  const nodes = [];
  let cursor = null;
  let guard = 0;
  while (guard++ < 200) {
    const data = await gql(token, query, { cursor });
    const conn = data.translatableResources;
    for (const edge of conn.edges) nodes.push(edge.node);
    if (!conn.pageInfo.hasNextPage) break;
    cursor = conn.pageInfo.endCursor;
  }
  return nodes;
}

async function main() {
  const token = loadToken();
  const unique = new Map();
  const resources = [];
  for (const type of TYPES) {
    const nodes = await dumpType(token, type);
    console.log(type, nodes.length);
    for (const n of nodes) {
      const fields = [];
      for (const c of n.translatableContent || []) {
        if (!c.value || c.key === "handle") continue;
        fields.push(c);
        if (!unique.has(c.value)) unique.set(c.value, { key: c.key, count: 0, sample: c.value });
        unique.get(c.value).count++;
      }
      if (fields.length) resources.push({ type, resourceId: n.resourceId, fields });
    }
  }
  fs.writeFileSync(
    "downloads/translatable-full.json",
    JSON.stringify({ resources, uniqueCount: unique.size }, null, 2)
  );
  const strings = [...unique.entries()].map(([value, meta]) => ({
    key: meta.key,
    count: meta.count,
    chars: value.length,
    value,
  }));
  strings.sort((a, b) => a.chars - b.chars);
  fs.writeFileSync("downloads/translatable-strings.json", JSON.stringify(strings, null, 2));
  console.log("unique strings", unique.size);
  console.log("resources", resources.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
