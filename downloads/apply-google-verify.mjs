/**
 * Host Google Search Console HTML-file verification on Shopify.
 * Same-domain redirect: /google1a4c9afa70d61477.html → /pages/google1a4c9afa70d61477
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const HANDLE = "google1a4c9afa70d61477";
const FROM = "/google1a4c9afa70d61477.html";
const TO = `/pages/${HANDLE}`;

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

async function ensurePage(token) {
  const found = await gql(
    token,
    `query {
      pages(first: 5, query: "handle:${HANDLE}") {
        nodes { id handle templateSuffix }
      }
    }`
  );
  const existing = found.pages?.nodes?.[0];
  const page = {
    title: "Google site verification",
    handle: HANDLE,
    body: "google-site-verification: google1a4c9afa70d61477.html",
    isPublished: true,
    templateSuffix: "google-verify",
  };
  if (existing) {
    const updated = await gql(
      token,
      `mutation ($id: ID!, $page: PageUpdateInput!) {
        pageUpdate(id: $id, page: $page) {
          page { id handle templateSuffix }
          userErrors { field message }
        }
      }`,
      { id: existing.id, page }
    );
    const errs = updated.pageUpdate.userErrors || [];
    if (errs.length) throw new Error("pageUpdate " + JSON.stringify(errs));
    console.log("page", updated.pageUpdate.page);
    return existing.id;
  }
  const created = await gql(
    token,
    `mutation ($page: PageCreateInput!) {
      pageCreate(page: $page) {
        page { id handle templateSuffix }
        userErrors { field message }
      }
    }`,
    { page }
  );
  const errs = created.pageCreate.userErrors || [];
  if (errs.length) throw new Error("pageCreate " + JSON.stringify(errs));
  console.log("page", created.pageCreate.page);
  return created.pageCreate.page.id;
}

async function ensureRedirect(token) {
  const found = await gql(
    token,
    `query {
      urlRedirects(first: 5, query: "path:${FROM}") {
        nodes { id path target }
      }
    }`
  );
  const existing = found.urlRedirects?.nodes?.[0];
  if (existing) {
    console.log("redirect exists", existing);
    return;
  }
  const created = await gql(
    token,
    `mutation ($urlRedirect: UrlRedirectInput!) {
      urlRedirectCreate(urlRedirect: $urlRedirect) {
        urlRedirect { id path target }
        userErrors { field message }
      }
    }`,
    { urlRedirect: { path: FROM, target: TO } }
  );
  const errs = created.urlRedirectCreate.userErrors || [];
  if (errs.length) throw new Error("urlRedirectCreate " + JSON.stringify(errs));
  console.log("redirect", created.urlRedirectCreate.urlRedirect);
}

const token = loadToken();
await ensurePage(token);
await ensureRedirect(token);
