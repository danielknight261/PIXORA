/**
 * Rename customer-facing copy from Pixora to HappySnaps.
 * Strips partner brand names from visible text. Keeps data-gelato-customization.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const LOCALES = ["fr", "de", "es", "it", "nl"];
const VENDOR = "HappySnaps";
const TRANS_TYPES = [
  "PRODUCT",
  "COLLECTION",
  "PAGE",
  "MENU",
  "LINK",
  "SHOP_POLICY",
  "ONLINE_STORE_THEME",
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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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

const HOOK = "___GELATO_HOOK___";

export function rebrand(text) {
  if (!text) return text;
  let out = String(text).replace(/data-gelato-customization/g, HOOK);
  out = out.replace(/Pixora/g, "HappySnaps");
  out = out.replace(/PIXORA/g, "HappySnaps");
  out = out.replace(/https?:\/\/[^\s<"']*gelato\.com[^\s<"']*/gi, "");
  out = out.replace(/\bGelato\b/g, "");
  out = out.replace(/\bPrintful\b/g, "");
  out = out.replace(/\bProdigi\b/g, "");
  out = out.replace(/[ \t]{2,}/g, " ");
  return out.replace(new RegExp(HOOK, "g"), "data-gelato-customization");
}

function dirty(text) {
  if (!text) return false;
  const probe = String(text).replace(/data-gelato-customization/g, "");
  return /Pixora|PIXORA|\bGelato\b|\bPrintful\b|\bProdigi\b|gelato\.com/i.test(probe);
}

function dirtyVendor(vendor) {
  return /pixora|gelato|printful|prodigi|my store/i.test(vendor || "");
}

async function paginate(token, buildQuery, pick) {
  const nodes = [];
  let cursor = null;
  for (let i = 0; i < 40; i++) {
    const data = await gql(token, buildQuery, { cursor });
    const conn = pick(data);
    nodes.push(...conn.nodes);
    if (!conn.pageInfo.hasNextPage) break;
    cursor = conn.pageInfo.endCursor;
  }
  return nodes;
}

async function updateProducts(token) {
  const products = await paginate(
    token,
    `query ($cursor: String) {
      products(first: 50, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes { id handle vendor descriptionHtml seo { title description } }
      }
    }`,
    (d) => d.products
  );
  let updated = 0;
  for (const p of products) {
    const nextHtml = rebrand(p.descriptionHtml);
    const nextSeoTitle = rebrand(p.seo?.title || "");
    const nextSeoDesc = rebrand(p.seo?.description || "");
    const vendorDirty = dirtyVendor(p.vendor);
    const htmlDirty = nextHtml !== (p.descriptionHtml || "");
    const seoDirty = nextSeoTitle !== (p.seo?.title || "") || nextSeoDesc !== (p.seo?.description || "");
    if (!vendorDirty && !htmlDirty && !seoDirty) continue;
    const input = { id: p.id };
    if (vendorDirty) input.vendor = VENDOR;
    if (htmlDirty) input.descriptionHtml = nextHtml;
    if (seoDirty) input.seo = { title: nextSeoTitle, description: nextSeoDesc };
    const result = await gql(
      token,
      `mutation ($input: ProductInput!) {
        productUpdate(input: $input) {
          userErrors { field message }
        }
      }`,
      { input }
    );
    const errs = result.productUpdate.userErrors || [];
    if (errs.length) console.log("product err", p.handle, JSON.stringify(errs));
    else {
      updated++;
      console.log("product", p.handle);
    }
    await sleep(150);
  }
  return { scanned: products.length, updated };
}

async function updateCollections(token) {
  const collections = await paginate(
    token,
    `query ($cursor: String) {
      collections(first: 50, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes { id handle descriptionHtml seo { title description } }
      }
    }`,
    (d) => d.collections
  );
  let updated = 0;
  for (const c of collections) {
    const nextHtml = rebrand(c.descriptionHtml);
    const nextSeoTitle = rebrand(c.seo?.title || "");
    const nextSeoDesc = rebrand(c.seo?.description || "");
    if (
      nextHtml === (c.descriptionHtml || "") &&
      nextSeoTitle === (c.seo?.title || "") &&
      nextSeoDesc === (c.seo?.description || "")
    ) {
      continue;
    }
    const result = await gql(
      token,
      `mutation ($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          userErrors { field message }
        }
      }`,
      {
        input: {
          id: c.id,
          descriptionHtml: nextHtml,
          seo: { title: nextSeoTitle, description: nextSeoDesc },
        },
      }
    );
    const errs = result.collectionUpdate.userErrors || [];
    if (errs.length) console.log("collection err", c.handle, JSON.stringify(errs));
    else {
      updated++;
      console.log("collection", c.handle);
    }
    await sleep(150);
  }
  return { scanned: collections.length, updated };
}

async function updatePages(token) {
  const pages = await paginate(
    token,
    `query ($cursor: String) {
      pages(first: 50, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes { id handle title body }
      }
    }`,
    (d) => d.pages
  );
  let updated = 0;
  for (const page of pages) {
    const title = rebrand(page.title);
    const body = rebrand(page.body);
    if (title === page.title && body === (page.body || "")) continue;
    const result = await gql(
      token,
      `mutation ($id: ID!, $page: PageUpdateInput!) {
        pageUpdate(id: $id, page: $page) {
          userErrors { field message }
        }
      }`,
      { id: page.id, page: { title, body } }
    );
    const errs = result.pageUpdate.userErrors || [];
    if (errs.length) console.log("page err", page.handle, JSON.stringify(errs));
    else {
      updated++;
      console.log("page", page.handle);
    }
  }
  return { scanned: pages.length, updated };
}

async function dumpType(token, resourceType) {
  const nodes = [];
  let cursor = null;
  for (let i = 0; i < 80; i++) {
    const data = await gql(
      token,
      `query ($cursor: String) {
        translatableResources(first: 50, resourceType: ${resourceType}, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          edges {
            node {
              resourceId
              translatableContent { key value digest }
            }
          }
        }
      }`,
      { cursor }
    );
    const conn = data.translatableResources;
    for (const edge of conn.edges) nodes.push(edge.node);
    if (!conn.pageInfo.hasNextPage) break;
    cursor = conn.pageInfo.endCursor;
  }
  return nodes;
}

async function localeBundle(token, id) {
  return gql(
    token,
    `query ($id: ID!) {
      translatableResource(resourceId: $id) {
        translatableContent { key value digest }
        fr: translations(locale: "fr") { key value }
        de: translations(locale: "de") { key value }
        es: translations(locale: "es") { key value }
        it: translations(locale: "it") { key value }
        nl: translations(locale: "nl") { key value }
      }
    }`,
    { id }
  );
}

async function rebrandTranslations(token) {
  let updated = 0;
  for (const type of TRANS_TYPES) {
    const nodes = await dumpType(token, type);
    console.log("trans type", type, nodes.length);
    for (const node of nodes) {
      const englishDirty = (node.translatableContent || []).some((f) => dirty(f.value));
      if (type === "ONLINE_STORE_THEME" && !englishDirty) continue;
      const bundle = await localeBundle(token, node.resourceId);
      const res = bundle.translatableResource;
      if (!res) continue;
      const digests = Object.fromEntries(
        (res.translatableContent || []).map((f) => [f.key, f.digest])
      );
      const translations = [];
      for (const locale of LOCALES) {
        for (const row of res[locale] || []) {
          if (!dirty(row.value) || !digests[row.key]) continue;
          translations.push({
            locale,
            key: row.key,
            value: rebrand(row.value),
            translatableContentDigest: digests[row.key],
          });
        }
      }
      if (!translations.length) continue;
      const registered = await gql(
        token,
        `mutation ($id: ID!, $translations: [TranslationInput!]!) {
          translationsRegister(resourceId: $id, translations: $translations) {
            userErrors { field message }
            translations { locale key }
          }
        }`,
        { id: node.resourceId, translations }
      );
      const errs = registered.translationsRegister.userErrors || [];
      if (errs.length) console.log("trans err", type, JSON.stringify(errs).slice(0, 200));
      else updated += registered.translationsRegister.translations.length;
      await sleep(80);
    }
  }
  return updated;
}

async function tryRenameShop(token) {
  const rest = await fetch(`https://${SHOP}/admin/api/2025-01/shop.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ shop: { name: VENDOR } }),
  });
  const before = await gql(token, `{ shop { name } }`);
  return { status: rest.status, shopName: before.shop?.name };
}

async function main() {
  const token = loadToken();
  const shop = await tryRenameShop(token);
  console.log("shop rename", shop);
  const products = await updateProducts(token);
  const collections = await updateCollections(token);
  const pages = await updatePages(token);
  const translations = await rebrandTranslations(token);
  console.log(JSON.stringify({ shop, products, collections, pages, translations }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
