import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const PRODUCT_ID = "gid://shopify/Product/15942741885272";

function loadToken() {
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
  const token = account.applications[shopKey]?.accessToken;
  if (!token) throw new Error("No shop token");
  return token;
}

const token = loadToken();
const res = await fetch(API, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    query: `query ($id: ID!) {
      product(id: $id) {
        id title handle vendor status
        options { name values }
        variants(first: 5) {
          nodes { id title selectedOptions { name value } }
        }
        media(first: 20) {
          nodes {
            id
            ... on MediaImage { image { url } alt }
          }
        }
      }
    }`,
    variables: { id: PRODUCT_ID },
  }),
});
const json = await res.json();
console.log(JSON.stringify(json.data?.product || json, null, 2));
