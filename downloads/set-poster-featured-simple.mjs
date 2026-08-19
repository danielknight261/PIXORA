import fs from "node:fs";
import path from "node:path";
import os from "os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const PRODUCT_ID = "gid://shopify/Product/15933333274968";

function getToken() {
  const kit = JSON.parse(
    fs.readFileSync(
      path.join(
        os.homedir(),
        "AppData/Roaming/shopify-cli-kit-nodejs/Config/config.json"
      ),
      "utf8"
    )
  );
  const account = Object.values(
    JSON.parse(kit.sessionStore)["accounts.shopify.com"]
  )[0];
  const shopKey = Object.keys(account.applications).find((k) =>
    k.startsWith(SHOP)
  );
  return account.applications[shopKey].accessToken;
}

async function gql(token, query, variables) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

const report = JSON.parse(
  fs.readFileSync("downloads/poster-mockup-upload-report.json", "utf8")
);
const token = getToken();
for (let i = 0; i < report.ok.length; i += 25) {
  const batch = report.ok.slice(i, i + 25);
  const data = await gql(
    token,
    `mutation ($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        userErrors { message }
      }
    }`,
    {
      productId: PRODUCT_ID,
      variants: batch.map((p) => ({
        id: `gid://shopify/ProductVariant/${p.variantId}`,
        mediaId: p.mediaIds[0],
      })),
    }
  );
  const errs = data.productVariantsBulkUpdate.userErrors || [];
  if (errs.length) throw new Error(JSON.stringify(errs));
  console.log("featured", Math.min(i + 25, report.ok.length));
}
console.log("done", report.ok.length);
