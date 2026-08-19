import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const ONLINE = "gid://shopify/Publication/333315113304";

const handles = [
  "acrylic-print",
  "foam-square",
  "aluminum-print",
  "foam-landscape",
  "wood-prints",
  "foam-portrait",
  "premium-matte-paper-poster-with-hanger",
  "brushed-aluminum-print",
  "classic-semi-glossy-paper-metal-framed-poster",
];

function loadToken() {
  const cfgPath = path.join(
    os.homedir(),
    "AppData/Roaming/shopify-cli-store-nodejs/Config/config.json"
  );
  const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
  const key = Object.keys(cfg).find((k) => k.includes("hxbghe"));
  const sess = Object.values(cfg[key]?.sessionsByUserId || {})[0];
  if (!sess?.accessToken) throw new Error("No token");
  return sess.accessToken;
}

async function gql(token, query, variables) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data;
}

const token = loadToken();
for (const h of handles) {
  const d = await gql(
    token,
    `query($q:String!){ products(first:1, query:$q){ nodes{ id title handle status options{name} variantsCount{count} } } }`,
    { q: `handle:${h}` }
  );
  const p = d.products.nodes[0];
  if (!p) {
    console.log("MISSING", h);
    continue;
  }
  console.log(
    p.handle,
    p.status,
    p.variantsCount.count,
    "opts:",
    p.options.map((o) => o.name).join(" | ")
  );
  if (p.status !== "ACTIVE") {
    const act = await gql(
      token,
      `mutation($id:ID!){ productChangeStatus(productId:$id, status:ACTIVE){ product{status} userErrors{message} } }`,
      { id: p.id }
    );
    console.log("  activate:", act.productChangeStatus);
  }
  const pub = await gql(
    token,
    `mutation($id:ID!,$pub:ID!){ publishablePublish(id:$id, input:[{publicationId:$pub}]){ userErrors{message} } }`,
    { id: p.id, pub: ONLINE }
  );
  if (pub.publishablePublish.userErrors?.length) {
    console.log("  publish errs:", pub.publishablePublish.userErrors);
  } else {
    console.log("  published OK");
  }
}
