/**
 * Create /pages/faq and register FR/DE/ES/IT/NL translations.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { LOCALES, FAQ_TITLE, FAQ_HTML, translateValue } from "./i18n-map.mjs";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const ONLINE = "gid://shopify/Publication/333315113304";

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

async function ensureFaqPage(token) {
  const found = await gql(
    token,
    `query {
      pages(first: 20, query: "handle:faq") {
        nodes { id title handle }
      }
    }`
  );
  const existing = found.pages?.nodes?.[0];
  const pageInput = {
    title: FAQ_TITLE,
    body: FAQ_HTML.en,
    isPublished: true,
  };
  if (existing) {
    const updated = await gql(
      token,
      `mutation ($id: ID!, $page: PageUpdateInput!) {
        pageUpdate(id: $id, page: $page) {
          page { id title handle }
          userErrors { field message }
        }
      }`,
      { id: existing.id, page: pageInput }
    );
    const errs = updated.pageUpdate.userErrors || [];
    if (errs.length) throw new Error("pageUpdate " + JSON.stringify(errs));
    console.log("faq page updated", existing.id);
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
    { page: { ...pageInput, handle: "faq" } }
  );
  const errs = created.pageCreate.userErrors || [];
  if (errs.length) throw new Error("pageCreate " + JSON.stringify(errs));
  console.log("faq page created", created.pageCreate.page.id);
    return created.pageCreate.page.id;
}

async function publishPage(token, id) {
  try {
    const published = await gql(
      token,
      `mutation ($id: ID!, $publicationId: ID!) {
        publishablePublish(id: $id, input: [{publicationId: $publicationId}]) {
          userErrors { field message }
        }
      }`,
      { id, publicationId: ONLINE }
    );
    const errs = published.publishablePublish.userErrors || [];
    if (errs.length) console.log("publish", JSON.stringify(errs));
    else console.log("published to online store");
  } catch (err) {
    console.log("publish skipped (pages use isPublished)", String(err.message).slice(0, 120));
  }
}

async function main() {
  const token = loadToken();
  const id = await ensureFaqPage(token);
  await publishPage(token, id);
  const trans = await gql(
    token,
    `query {
      translatableResource(resourceId: "${id}") {
        translatableContent { key value digest }
      }
    }`
  );
  const fields = trans.translatableResource?.translatableContent || [];
  const translations = [];
  for (const field of fields) {
    for (const locale of LOCALES) {
      let value;
      if (field.key === "title") value = translateValue(FAQ_TITLE, locale) || FAQ_TITLE;
      else if (field.key === "body_html") value = FAQ_HTML[locale];
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
          translations { key locale }
        }
      }`,
      { id, translations }
    );
    console.log("translations", JSON.stringify(registered.translationsRegister, null, 2));
  }

  const emailProbe = await gql(
    token,
    `{ __type(name: "Mutation") { fields { name } } }`
  );
  const emailMutations = (emailProbe.__type?.fields || [])
    .map((f) => f.name)
    .filter((n) => /email|notification|template/i.test(n));
  console.log("email mutations", emailMutations);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
