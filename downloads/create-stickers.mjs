/**
 * Create Prodigi kiss-cut stickers product + collection (not Gelato).
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const ONLINE = "gid://shopify/Publication/333315113304";
const HERO =
  "https://www.prodigi.com/img/products/hero/kiss-cut-stickers.jpg";

const SIZES = [
  { name: "Small — 8×10 cm (3×4″)", sku: "3X4", price: "3.95" },
  { name: "Medium — 14×14 cm (5.5×5.5″)", sku: "5_5X5_5", price: "5.95" },
  { name: "Large — 22×22 cm (8.5×8.5″)", sku: "8_5X8_5", price: "8.95" },
  { name: "Extra large — 36×36 cm (14×14″)", sku: "14X14", price: "14.95" },
];
const FINISHES = [
  { name: "Matt", code: "MATT" },
  { name: "Gloss", code: "GLOSS" },
];

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

function variants() {
  const out = [];
  for (const size of SIZES) {
    for (const finish of FINISHES) {
      out.push({
        optionValues: [
          { optionName: "Size", name: size.name },
          { optionName: "Finish", name: finish.name },
        ],
        price: size.price,
        sku: `GLOBAL-STI-${size.sku}-${finish.code}`,
        inventoryPolicy: "CONTINUE",
      });
    }
  }
  return out;
}

async function main() {
  const token = loadToken();

  const existing = await gql(
    token,
    `query { productByHandle(handle: "kiss-cut-stickers") { id handle status } }`
  );
  let product = existing.productByHandle;

  if (!product) {
    const created = await gql(
      token,
      `mutation ($input: ProductSetInput!) {
        productSet(input: $input) {
          product { id handle status }
          userErrors { field message }
        }
      }`,
      {
        input: {
          title: "Kiss-cut stickers",
          handle: "kiss-cut-stickers",
          descriptionHtml: `<p>Personalised kiss-cut vinyl stickers — cut to the shape of your design. Waterproof, removable, and available in matt or gloss.</p>
<ul>
<li>Premium white vinyl</li>
<li>Indoor or outdoor (up to 18 months)</li>
<li>Four sizes from 8×10 cm to 36×36 cm</li>
<li>Matt or gloss finish</li>
</ul>
<p>Upload your photo or artwork after checkout. Printed on demand and shipped in plain packaging.</p>`,
          productType: "Stickers",
          vendor: "Pixora",
          status: "ACTIVE",
          tags: ["prodigi", "stickers", "gifts"],
          productOptions: [
            {
              name: "Size",
              values: SIZES.map((s) => ({ name: s.name })),
            },
            {
              name: "Finish",
              values: FINISHES.map((f) => ({ name: f.name })),
            },
          ],
          variants: variants(),
        },
      }
    );
    if (created.productSet.userErrors?.length) {
      throw new Error(JSON.stringify(created.productSet.userErrors, null, 2));
    }
    product = created.productSet.product;
    console.log("Created product", product.id);
  } else {
    console.log("Product exists", product.id);
  }

  const media = await gql(
    token,
    `query ($id: ID!) {
      product(id: $id) { featuredImage { url } media(first: 1) { nodes { id } } }
    }`,
    { id: product.id }
  );
  if (!media.product.featuredImage && !media.product.media.nodes.length) {
    const uploaded = await gql(
      token,
      `mutation ($productId: ID!, $media: [CreateMediaInput!]!) {
        productCreateMedia(productId: $productId, media: $media) {
          media { id status }
          mediaUserErrors { message }
        }
      }`,
      {
        productId: product.id,
        media: [
          {
            originalSource: HERO,
            alt: "Kiss-cut stickers",
            mediaContentType: "IMAGE",
          },
        ],
      }
    );
    console.log("Media", JSON.stringify(uploaded.productCreateMedia, null, 2));
  }

  await gql(
    token,
    `mutation ($id: ID!) {
      productChangeStatus(productId: $id, status: ACTIVE) {
        userErrors { message }
      }
    }`,
    { id: product.id }
  );
  await gql(
    token,
    `mutation ($id: ID!) {
      publishablePublish(id: $id, input: [{publicationId: "${ONLINE}"}]) {
        userErrors { message }
      }
    }`,
    { id: product.id }
  );

  let stickers = (
    await gql(
      token,
      `query { collectionByHandle(handle: "stickers") { id handle } }`
    )
  ).collectionByHandle;

  if (!stickers) {
    const coll = await gql(
      token,
      `mutation ($input: CollectionInput!) {
        collectionCreate(input: $input) {
          collection { id handle }
          userErrors { message }
        }
      }`,
      {
        input: {
          title: "Stickers",
          handle: "stickers",
          descriptionHtml:
            "<p>Personalised kiss-cut vinyl stickers — cut to your design, matt or gloss, four sizes.</p>",
          products: [product.id],
        },
      }
    );
    if (coll.collectionCreate.userErrors?.length) {
      throw new Error(JSON.stringify(coll.collectionCreate.userErrors, null, 2));
    }
    stickers = coll.collectionCreate.collection;
    console.log("Created collection", stickers.id);
  } else {
    console.log("Collection exists", stickers.id);
  }

  await gql(
    token,
    `mutation ($id: ID!) {
      publishablePublish(id: $id, input: [{publicationId: "${ONLINE}"}]) {
        userErrors { message }
      }
    }`,
    { id: stickers.id }
  );

  const gifts = (
    await gql(
      token,
      `query { collectionByHandle(handle: "home-gifts") { id handle } }`
    )
  ).collectionByHandle;
  if (!gifts) throw new Error("home-gifts missing");

  const joined = await gql(
    token,
    `mutation ($id: ID!, $join: [ID!]!) {
      productUpdate(product: { id: $id, collectionsToJoin: $join }) {
        product { handle collections(first: 12) { nodes { handle } } }
        userErrors { message }
      }
    }`,
    { id: product.id, join: [stickers.id, gifts.id] }
  );
  if (joined.productUpdate.userErrors?.length) {
    throw new Error(JSON.stringify(joined.productUpdate.userErrors, null, 2));
  }
  console.log(
    "joined",
    joined.productUpdate.product.handle,
    "→",
    joined.productUpdate.product.collections.nodes.map((n) => n.handle).join(", ")
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
