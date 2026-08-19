import fs from "node:fs";
import path from "node:path";
import os from "os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const MOCKUP_ROOT =
  "c:\\Users\\HughesHub\\Downloads\\156e90ff-19df-4a3c-8621-a58f29a5b565\\9134c01c-c325-437c-add7-f78926e9243f";

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
  return account.applications[shopKey].accessToken;
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
      products(first: 20, query: "title:'Classic Semi-Glossy Paper Poster'") {
        nodes {
          id title handle vendor status
          variants(first: 1) { nodes { title media(first: 3) { nodes { ... on MediaImage { id } } } } }
          media(first: 5) { nodes { ... on MediaImage { id } } }
        }
      }
      byHandle: productByHandle(handle: "classic-semi-glossy-paper-poster") {
        id title handle vendor status
      }
      byHandle1: productByHandle(handle: "classic-semi-glossy-paper-poster-1") {
        id title handle vendor status
      }
    }`,
  }),
});
const json = await res.json();
if (json.errors) throw new Error(JSON.stringify(json.errors));
console.log(JSON.stringify(json.data, null, 2));

const dirs = fs
  .readdirSync(MOCKUP_ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);
console.log("folders", dirs.length);
const sample = dirs[0];
console.log("sample", sample, fs.readdirSync(path.join(MOCKUP_ROOT, sample)));
