import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;

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
    query: `query {
      byHandle: productByHandle(handle: "fine-art-framed-poster") {
        id title handle vendor status
        options { name values }
        variantsCount { count }
      }
      byId: product(id: "gid://shopify/Product/15937938129240") {
        id title handle vendor status
        options { name values }
        variantsCount { count }
      }
    }`,
  }),
});
const json = await res.json();
if (json.errors?.length) throw new Error(JSON.stringify(json.errors));
console.log(JSON.stringify(json.data, null, 2));
