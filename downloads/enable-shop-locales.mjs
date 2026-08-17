/**
 * Enable and publish Shopify storefront languages for UK/US/CA/EU.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const LOCALES = ["en-US", "en-CA", "fr", "de", "es", "it", "nl"];

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

function printLocales(list) {
  for (const l of list) {
    console.log(`${l.primary ? "*" : " "}${l.published ? "P" : "U"}  ${l.locale}  ${l.name}`);
  }
}

async function main() {
  const token = loadToken();
  const before = await gql(token, `{ shopLocales { locale name primary published } }`);
  console.log("Before:");
  printLocales(before.shopLocales);

  for (const locale of LOCALES) {
    const enabled = await gql(
      token,
      `mutation ($locale: String!) {
        shopLocaleEnable(locale: $locale) {
          shopLocale { locale name published }
          userErrors { field message }
        }
      }`,
      { locale }
    );
    if (enabled.shopLocaleEnable.userErrors?.length) {
      console.log("enable", locale, JSON.stringify(enabled.shopLocaleEnable.userErrors));
    } else {
      console.log("enabled", enabled.shopLocaleEnable.shopLocale.locale);
    }

    const updated = await gql(
      token,
      `mutation ($locale: String!, $shopLocale: ShopLocaleInput!) {
        shopLocaleUpdate(locale: $locale, shopLocale: $shopLocale) {
          shopLocale { locale name published }
          userErrors { field message }
        }
      }`,
      { locale, shopLocale: { published: true } }
    );
    if (updated.shopLocaleUpdate.userErrors?.length) {
      console.log("publish", locale, JSON.stringify(updated.shopLocaleUpdate.userErrors));
    } else {
      console.log("published", updated.shopLocaleUpdate.shopLocale.locale, updated.shopLocaleUpdate.shopLocale.name);
    }
  }

  const after = await gql(token, `{ shopLocales { locale name primary published } }`);
  console.log("After:");
  printLocales(after.shopLocales);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
