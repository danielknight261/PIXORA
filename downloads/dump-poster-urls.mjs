import fs from "node:fs";
import path from "node:path";
import os from "os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const PRODUCT_ID = "gid://shopify/Product/15933333274968";

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
    query: `query ($id: ID!) {
      product(id: $id) {
        media(first: 100) {
          nodes { ... on MediaImage { id alt image { url width height } } }
        }
        variants(first: 8) {
          nodes {
            id
            title
            media(first: 5) {
              nodes { ... on MediaImage { id alt image { url width height } } }
            }
          }
        }
      }
    }`,
    variables: { id: PRODUCT_ID },
  }),
});
const json = await res.json();
const media = json.data.product.media.nodes;
const used = new Set();
for (const v of json.data.product.variants.nodes) {
  for (const m of v.media.nodes) used.add(m.id);
}
const unassigned = media.filter((m) => !used.has(m.id));
fs.writeFileSync(
  "downloads/poster-gallery-inspect.json",
  JSON.stringify(
    {
      assignedSample: json.data.product.variants.nodes,
      unassigned,
    },
    null,
    2
  )
);
console.log("wrote downloads/poster-gallery-inspect.json");
console.log("unassigned count", unassigned.length);
for (const m of unassigned) {
  console.log(m.alt, m.image.width, m.image.height, m.image.url);
}
