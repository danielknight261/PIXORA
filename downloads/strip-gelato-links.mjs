/**
 * Remove customer-visible Gelato support links from product descriptions.
 * Keeps the hidden data-gelato-customization hook for the designer.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const LOCALES = ["fr", "de", "es", "it", "nl"];

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

export function stripGelato(html) {
  if (!html) return html;
  let out = html;
  out = out.replace(/<p[^>]*>[\s\S]*?gelato\.com[\s\S]*?<\/p>/gi, "");
  out = out.replace(/<a[^>]*gelato\.com[^>]*>[\s\S]*?<\/a>/gi, "");
  out = out.replace(/https?:\/\/[^\s<"']*gelato\.com[^\s<"']*/gi, "");
  out = out.replace(/\n{3,}/g, "\n\n");
  return out.trim();
}

function hasGelatoLink(html) {
  return /gelato\.com/i.test(html || "");
}

async function allProducts(token) {
  const nodes = [];
  let cursor = null;
  for (let i = 0; i < 40; i++) {
    const data = await gql(
      token,
      `query ($cursor: String) {
        products(first: 50, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes { id title handle descriptionHtml }
        }
      }`,
      { cursor }
    );
    nodes.push(...data.products.nodes);
    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }
  return nodes;
}

async function main() {
  const token = loadToken();
  const products = await allProducts(token);
  const dirty = products.filter((p) => hasGelatoLink(p.descriptionHtml));
  console.log("products", products.length, "with gelato links", dirty.length);

  let updated = 0;
  let translationOk = 0;
  for (const product of dirty) {
    const next = stripGelato(product.descriptionHtml);
    if (next === product.descriptionHtml) continue;
    const result = await gql(
      token,
      `mutation ($input: ProductInput!) {
        productUpdate(input: $input) {
          product { id handle }
          userErrors { field message }
        }
      }`,
      { input: { id: product.id, descriptionHtml: next } }
    );
    const errs = result.productUpdate.userErrors || [];
    if (errs.length) {
      console.log("err", product.handle, JSON.stringify(errs));
      continue;
    }
    updated++;
    console.log("updated", product.handle);

    const trans = await gql(
      token,
      `query ($id: ID!) {
        translatableResource(resourceId: $id) {
          translatableContent { key value digest locale }
        }
      }`,
      { id: product.id }
    );
    const fields = trans.translatableResource?.translatableContent || [];
    const body = fields.find((f) => f.key === "body_html");
    if (!body?.digest) continue;

    const translations = [];
    for (const locale of LOCALES) {
      const existing = await gql(
        token,
        `query ($id: ID!, $locale: String!) {
          translatableResource(resourceId: $id) {
            translations(locale: $locale) { key value }
          }
        }`,
        { id: product.id, locale }
      );
      const current = (existing.translatableResource?.translations || []).find(
        (t) => t.key === "body_html"
      );
      const source = current?.value || "";
      if (!hasGelatoLink(source)) continue;
      translations.push({
        locale,
        key: "body_html",
        value: stripGelato(source),
        translatableContentDigest: body.digest,
      });
    }
    if (translations.length) {
      const registered = await gql(
        token,
        `mutation ($id: ID!, $translations: [TranslationInput!]!) {
          translationsRegister(resourceId: $id, translations: $translations) {
            userErrors { field message }
            translations { locale key }
          }
        }`,
        { id: product.id, translations }
      );
      const tErrs = registered.translationsRegister.userErrors || [];
      if (tErrs.length) console.log("trans err", product.handle, JSON.stringify(tErrs).slice(0, 200));
      else translationOk += registered.translationsRegister.translations.length;
    }
    await sleep(250);
  }
  console.log(JSON.stringify({ updated, translationOk }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
