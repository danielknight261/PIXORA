/**
 * Dump Shopify translatable content (titles/descriptions) for Pixora.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const TYPES = [
  "PRODUCT",
  "COLLECTION",
  "PAGE",
  "SHOP_POLICY",
  "PRODUCT_OPTION",
  "PRODUCT_OPTION_VALUE",
  "MENU",
  "LINK",
  "DELIVERY_METHOD_DEFINITION",
  "SHOP",
];

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

function summarize(nodes) {
  return nodes.map((n) => ({
    resourceId: n.resourceId,
    fields: (n.translatableContent || [])
      .filter((c) => c.value && c.key !== "handle")
      .map((c) => ({
        key: c.key,
        digest: c.digest,
        chars: c.value.length,
        preview: c.value.replace(/\s+/g, " ").slice(0, 160),
      })),
  }));
}

async function main() {
  const token = loadToken();
  const out = {};
  for (const type of TYPES) {
    try {
      const nodes = await dumpType(token, type);
      out[type] = summarize(nodes);
      console.log(type, nodes.length, "resources");
    } catch (err) {
      console.log("FAIL", type, err.message.slice(0, 200));
      out[type] = { error: err.message };
    }
  }
  const dest = path.join("downloads", "translatable-dump.json");
  fs.writeFileSync(dest, JSON.stringify(out, null, 2));
  console.log("wrote", dest);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
