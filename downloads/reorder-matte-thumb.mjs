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
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

const token = loadToken();
const data = await gql(
  token,
  `query ($id: ID!) {
    product(id: $id) {
      variants(first: 20) {
        nodes {
          title
          media(first: 1) {
            nodes { ... on MediaImage { id } }
          }
        }
      }
    }
  }`,
  { id: PRODUCT_ID }
);
const want = data.product.variants.nodes.find((v) =>
  /30x40 cm \/ 12x16/i.test(v.title)
);
const mediaId = want?.media?.nodes?.[0]?.id;
console.log("thumb variant", want?.title, mediaId);
if (!mediaId) throw new Error("no 12x16 media");
const result = await gql(
  token,
  `mutation ($id: ID!, $moves: [MoveInput!]!) {
    productReorderMedia(id: $id, moves: $moves) {
      job { id done }
      mediaUserErrors { message }
    }
  }`,
  { id: PRODUCT_ID, moves: [{ id: mediaId, newPosition: "0" }] }
);
console.log(JSON.stringify(result.productReorderMedia, null, 2));
