/**
 * Assign the contact template to /pages/contact and translate the title.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { LOCALES, translateValue } from "./i18n-map.mjs";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const PAGE_ID = "gid://shopify/Page/165073125720";

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
  if (json.errors?.length) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

async function main() {
  const token = loadToken();

  const shop = await gql(
    token,
    `query {
      shop { name email contactEmail }
      page(id: "${PAGE_ID}") { id title handle templateSuffix }
    }`
  );
  console.log("shop", shop.shop);
  console.log("page before", shop.page);

  const updated = await gql(
    token,
    `mutation ($id: ID!, $page: PageUpdateInput!) {
      pageUpdate(id: $id, page: $page) {
        page { id title handle templateSuffix }
        userErrors { field message }
      }
    }`,
    {
      id: PAGE_ID,
      page: {
        title: "Contact",
        templateSuffix: "contact",
        isPublished: true,
      },
    }
  );
  console.log("pageUpdate", JSON.stringify(updated.pageUpdate, null, 2));

  const trans = await gql(
    token,
    `query {
      translatableResource(resourceId: "${PAGE_ID}") {
        resourceId
        translatableContent { key value digest locale }
      }
    }`
  );
  const fields = trans.translatableResource?.translatableContent || [];
  const translations = [];
  for (const field of fields) {
    if (field.key !== "title" || !field.value) continue;
    for (const locale of LOCALES) {
      const value = translateValue(field.value, locale);
      if (!value || value === field.value) continue;
      translations.push({
        locale,
        key: field.key,
        value,
        translatableContentDigest: field.digest,
      });
    }
  }
  if (translations.length) {
    const registered = await gql(
      token,
      `mutation ($id: ID!, $translations: [TranslationInput!]!) {
        translationsRegister(resourceId: $id, translations: $translations) {
          userErrors { field message }
          translations { key locale value }
        }
      }`,
      { id: PAGE_ID, translations }
    );
    console.log("translations", JSON.stringify(registered.translationsRegister, null, 2));
  }

  try {
    const apps = await gql(
      token,
      `query {
        appInstallations(first: 50) {
          nodes { app { title handle } }
        }
      }`
    );
    const names = (apps.appInstallations?.nodes || []).map((n) => n.app?.title || n.app?.handle);
    console.log("apps", names);
    const inbox = names.find((n) => /inbox|shopify chat/i.test(n || ""));
    console.log("inboxInstalled", Boolean(inbox), inbox || null);
  } catch (err) {
    console.log("apps query skipped", String(err.message).slice(0, 240));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
