/**
 * Publish Pixora legal policies and register FR/DE/ES/IT/NL translations.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { POLICIES } from "./shop-policies-content.mjs";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const LOCALES = ["fr", "de", "es", "it", "nl"];
const TYPES = Object.keys(POLICIES);

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

async function updatePolicy(token, type) {
  const data = await gql(
    token,
    `mutation ($shopPolicy: ShopPolicyInput!) {
      shopPolicyUpdate(shopPolicy: $shopPolicy) {
        shopPolicy { id type title url }
        userErrors { field message }
      }
    }`,
    { shopPolicy: { type, body: POLICIES[type].en } }
  );
  const errs = data.shopPolicyUpdate.userErrors || [];
  if (errs.length) {
    const msg = JSON.stringify(errs);
    if (msg.includes("Automatic management")) {
      console.log("skip auto-managed", type);
      return null;
    }
    throw new Error(type + " " + msg);
  }
  const p = data.shopPolicyUpdate.shopPolicy;
  console.log("updated", p.type, p.id);
  return p;
}

async function dumpPolicies(token) {
  const query = `query ($cursor: String) {
    translatableResources(first: 20, resourceType: SHOP_POLICY, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          resourceId
          translatableContent { key value digest }
        }
      }
    }
  }`;
  const nodes = [];
  let cursor = null;
  for (let i = 0; i < 10; i++) {
    const data = await gql(token, query, { cursor });
    const conn = data.translatableResources;
    for (const edge of conn.edges) nodes.push(edge.node);
    if (!conn.pageInfo.hasNextPage) break;
    cursor = conn.pageInfo.endCursor;
  }
  return nodes;
}

function matchType(englishBody) {
  for (const type of TYPES) {
    if (POLICIES[type].en === englishBody) return type;
  }
  return null;
}

async function register(token, resourceId, translations) {
  const data = await gql(
    token,
    `mutation ($id: ID!, $translations: [TranslationInput!]!) {
      translationsRegister(resourceId: $id, translations: $translations) {
        userErrors { field message }
        translations { locale key }
      }
    }`,
    { id: resourceId, translations }
  );
  const errs = data.translationsRegister.userErrors || [];
  if (errs.length) {
    console.log("translate err", resourceId, JSON.stringify(errs));
    return 0;
  }
  return data.translationsRegister.translations.length;
}

async function main() {
  const token = loadToken();
  for (const type of TYPES) {
    await updatePolicy(token, type);
  }
  const nodes = await dumpPolicies(token);
  let count = 0;
  for (const node of nodes) {
    const body = (node.translatableContent || []).find((c) => c.key === "body");
    if (!body) continue;
    const type = matchType(body.value);
    if (!type) {
      console.log("unmatched policy", node.resourceId, body.value.slice(0, 80));
      continue;
    }
    const translations = LOCALES.map((locale) => ({
      locale,
      key: "body",
      value: POLICIES[type][locale],
      translatableContentDigest: body.digest,
    }));
    count += await register(token, node.resourceId, translations);
  }
  const listed = await gql(
    token,
    `query {
      shop {
        shopPolicies { type title url }
      }
    }`
  );
  console.log(JSON.stringify({ registered: count, policies: listed.shop.shopPolicies }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
