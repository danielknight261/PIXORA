/**
 * Create shipping page and register FR/DE/ES/IT/NL translations.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  LOCALES,
  translateValue,
  SHIPPING_TITLE,
  SHIPPING_HTML,
} from "./i18n-map.mjs";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const TYPES = (
  process.argv[2] ||
  "PRODUCT,COLLECTION,PAGE,PRODUCT_OPTION,PRODUCT_OPTION_VALUE,MENU,LINK,DELIVERY_METHOD_DEFINITION"
).split(",");

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
  if (json.errors?.length) {
    const msg = JSON.stringify(json.errors);
    if (msg.includes("THROTTLED") || msg.includes("429")) {
      await sleep(2000);
      return gql(token, query, variables);
    }
    throw new Error(msg);
  }
  return json.data;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function skipField(key, value) {
  if (!value || key === "handle") return true;
  if (key === "body_html" && value.includes("pc--optOutFormContainer")) return true;
  if (key === "body_html" && value.includes("data-gelato-customization") && value.length < 80) return true;
  return false;
}

function skipOptionValue(value) {
  if (!value) return true;
  if (/iphone|galaxy|samsung|pixel/i.test(value)) return true;
  if (/default title/i.test(value)) return true;
  if (/^\d/.test(value) && /\d/.test(value) && !/vertical|horizontal|frame/i.test(value)) return true;
  if (/cm\s*\/|x\d|×\d|A[0-3]\b/i.test(value) && !/vertical|horizontal/i.test(value)) return true;
  return false;
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
  while (guard++ < 400) {
    const data = await gql(token, query, { cursor });
    const conn = data.translatableResources;
    for (const edge of conn.edges) nodes.push(edge.node);
    if (!conn.pageInfo.hasNextPage) break;
    cursor = conn.pageInfo.endCursor;
  }
  return nodes;
}

async function ensureShippingPage(token) {
  const found = await gql(
    token,
    `query {
      pages(first: 20, query: "handle:shipping") {
        nodes { id title handle }
      }
    }`
  );
  const existing = found.pages?.nodes?.[0];
  if (existing) {
    console.log("shipping page exists", existing.id);
    await gql(
      token,
      `mutation ($id: ID!, $page: PageUpdateInput!) {
        pageUpdate(id: $id, page: $page) {
          page { id title handle }
          userErrors { field message }
        }
      }`,
      {
        id: existing.id,
        page: { title: SHIPPING_TITLE, body: SHIPPING_HTML.en, isPublished: true },
      }
    );
    return existing.id;
  }
  const created = await gql(
    token,
    `mutation ($page: PageCreateInput!) {
      pageCreate(page: $page) {
        page { id title handle }
        userErrors { field message }
      }
    }`,
    {
      page: {
        title: SHIPPING_TITLE,
        handle: "shipping",
        body: SHIPPING_HTML.en,
        isPublished: true,
      },
    }
  );
  const errs = created.pageCreate.userErrors;
  if (errs?.length) throw new Error("pageCreate " + JSON.stringify(errs));
  console.log("created shipping page", created.pageCreate.page.id);
  return created.pageCreate.page.id;
}

async function register(token, resourceId, translations) {
  if (!translations.length) return { ok: 0, errors: 0 };
  const data = await gql(
    token,
    `mutation ($id: ID!, $translations: [TranslationInput!]!) {
      translationsRegister(resourceId: $id, translations: $translations) {
        userErrors { field message }
        translations { key locale }
      }
    }`,
    { id: resourceId, translations }
  );
  const errs = data.translationsRegister.userErrors || [];
  if (errs.length) {
    console.log("err", resourceId, JSON.stringify(errs).slice(0, 240));
    return { ok: 0, errors: 1 };
  }
  return { ok: data.translationsRegister.translations.length, errors: 0 };
}

function buildTranslations(fields, type) {
  const translations = [];
  for (const field of fields) {
    if (skipField(field.key, field.value)) continue;
    if (type === "PRODUCT_OPTION_VALUE" && skipOptionValue(field.value)) continue;
    for (const locale of LOCALES) {
      let value;
      if (field.value === SHIPPING_TITLE) value = translateValue(SHIPPING_TITLE, locale);
      else if (field.value === SHIPPING_HTML.en) value = SHIPPING_HTML[locale];
      else value = translateValue(field.value, locale);
      if (!value || value === field.value) continue;
      translations.push({
        locale,
        key: field.key,
        value,
        translatableContentDigest: field.digest,
      });
    }
  }
  return translations;
}

async function main() {
  const token = loadToken();
  await ensureShippingPage(token);

  let ok = 0;
  let skipped = 0;
  let errors = 0;
  for (const type of TYPES) {
    const nodes = await dumpType(token, type);
    console.log("type", type, nodes.length);
    for (const node of nodes) {
      const translations = buildTranslations(node.translatableContent || [], type);
      if (!translations.length) {
        skipped++;
        continue;
      }
      const chunkSize = 50;
      for (let i = 0; i < translations.length; i += chunkSize) {
        const chunk = translations.slice(i, i + chunkSize);
        const result = await register(token, node.resourceId, chunk);
        ok += result.ok;
        errors += result.errors;
      }
    }
  }
  console.log(JSON.stringify({ registered: ok, skipped, errors }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
