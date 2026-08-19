/**
 * Printful towel products (not in Gelato or Prodigi catalogues).
 *
 * Map these SKUs in the Printful Shopify app:
 *   PF-259-8874   beach 30″ × 60″  (variant 8874)
 *   PF-259-22610  beach 36″ × 72″  (variant 22610)
 *   PF-883-22792  hand 28″ × 16″   (variant 22792)
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const ONLINE = "gid://shopify/Publication/333315113304";

const TOWELS_COLLECTION = {
  title: "Towels",
  handle: "towels",
  descriptionHtml:
    "<p>Personalised sublimation towels — beach and hand sizes. Print your photo on a soft cotton-poly blend.</p>",
};

const PRODUCTS = [
  {
    title: "Beach towel",
    handle: "beach-towel",
    productType: "Towel",
    tags: ["printful", "towels", "gifts"],
    collection: TOWELS_COLLECTION,
    join: ["home-gifts"],
    hero: "https://files.cdn.printful.com/o/products/259/product_1606198364.jpg",
    descriptionHtml: `<p>A personalised beach towel with your photo printed edge-to-edge on one side. The reverse is terry fabric so it stays absorbent.</p>
<ul>
<li>Two sizes: 30″ × 60″ (76 × 152 cm) and 36″ × 72″ (91 × 183 cm)</li>
<li>Cotton-poly blend · sublimation print</li>
<li>Soft printed face, absorbent terry reverse</li>
</ul>
<p>Upload a JPG or PNG. We’ll mock up and confirm before dispatch — we won’t print the stock photo.</p>`,
    productOptions: [
      {
        name: "Size",
        values: [{ name: "30″ × 60″ (76 × 152 cm)" }, { name: "36″ × 72″ (91 × 183 cm)" }],
      },
    ],
    variants: [
      { sku: "PF-259-8874", price: "39.95", options: ["30″ × 60″ (76 × 152 cm)"] },
      { sku: "PF-259-22610", price: "44.95", options: ["36″ × 72″ (91 × 183 cm)"] },
    ],
  },
  {
    title: "Hand towel",
    handle: "hand-towel",
    productType: "Towel",
    tags: ["printful", "towels", "gifts"],
    collection: TOWELS_COLLECTION,
    join: ["home-gifts"],
    hero: "https://files.cdn.printful.com/o/upload/product-catalog-img/8d/8de2e4f34ac87cfcb72dcea526c572fe_l",
    descriptionHtml: `<p>A personalised hand towel with a vibrant sublimation print on the front and soft absorbent cotton on the back.</p>
<ul>
<li>One size: 28″ × 16″ (71 × 41 cm)</li>
<li>52% polyester, 48% cotton · 400 g/m²</li>
<li>Machine wash cold — do not bleach, iron, dry clean or tumble dry hot</li>
</ul>
<p>Upload a JPG or PNG. We’ll mock up and confirm before dispatch — we won’t print the stock photo.</p>`,
    productOptions: [
      {
        name: "Size",
        values: [{ name: "28″ × 16″ (71 × 41 cm)" }],
      },
    ],
    variants: [{ sku: "PF-883-22792", price: "14.95", options: ["28″ × 16″ (71 × 41 cm)"] }],
  },
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

function toSetVariants(spec) {
  const optionNames = spec.productOptions.map((o) => o.name);
  return spec.variants.map((v) => ({
    optionValues: v.options.map((name, i) => ({
      optionName: optionNames[i],
      name,
    })),
    price: v.price,
    sku: v.sku,
    inventoryPolicy: "CONTINUE",
  }));
}

async function publish(token, id) {
  await gql(
    token,
    `mutation ($id: ID!) {
      publishablePublish(id: $id, input: [{publicationId: "${ONLINE}"}]) {
        userErrors { message }
      }
    }`,
    { id }
  );
}

async function collectionId(token, handle) {
  const data = await gql(
    token,
    `query ($h: String!) { collectionByHandle(handle: $h) { id handle } }`,
    { h: handle }
  );
  return data.collectionByHandle?.id || null;
}

async function ensureProduct(token, spec) {
  const existing = await gql(
    token,
    `query ($h: String!) { productByHandle(handle: $h) { id handle status } }`,
    { h: spec.handle }
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
          title: spec.title,
          handle: spec.handle,
          descriptionHtml: spec.descriptionHtml,
          productType: spec.productType,
          vendor: "Pixora",
          status: "ACTIVE",
          tags: spec.tags,
          productOptions: spec.productOptions,
          variants: toSetVariants(spec),
        },
      }
    );
    if (created.productSet.userErrors?.length) {
      throw new Error(`${spec.handle}: ${JSON.stringify(created.productSet.userErrors, null, 2)}`);
    }
    product = created.productSet.product;
    console.log("Created product", spec.handle, product.id);
  } else {
    console.log("Product exists", spec.handle, product.id);
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
  await publish(token, product.id);

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
            originalSource: spec.hero,
            alt: spec.title,
            mediaContentType: "IMAGE",
          },
        ],
      }
    );
    console.log("Media", spec.handle, JSON.stringify(uploaded.productCreateMedia, null, 2));
  }

  let coll = (
    await gql(
      token,
      `query ($h: String!) { collectionByHandle(handle: $h) { id handle } }`,
      { h: spec.collection.handle }
    )
  ).collectionByHandle;

  if (!coll) {
    const createdColl = await gql(
      token,
      `mutation ($input: CollectionInput!) {
        collectionCreate(input: $input) {
          collection { id handle }
          userErrors { message }
        }
      }`,
      {
        input: {
          title: spec.collection.title,
          handle: spec.collection.handle,
          descriptionHtml: spec.collection.descriptionHtml,
          products: [product.id],
        },
      }
    );
    if (createdColl.collectionCreate.userErrors?.length) {
      throw new Error(JSON.stringify(createdColl.collectionCreate.userErrors, null, 2));
    }
    coll = createdColl.collectionCreate.collection;
    console.log("Created collection", coll.handle, coll.id);
  } else {
    console.log("Collection exists", coll.handle, coll.id);
    await gql(
      token,
      `mutation ($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          userErrors { message }
        }
      }`,
      {
        input: {
          id: coll.id,
          descriptionHtml: spec.collection.descriptionHtml,
        },
      }
    );
  }
  await publish(token, coll.id);

  const joinIds = [coll.id];
  for (const h of spec.join) {
    const id = await collectionId(token, h);
    if (!id) throw new Error(`Missing collection ${h}`);
    joinIds.push(id);
  }

  const joined = await gql(
    token,
    `mutation ($id: ID!, $join: [ID!]!) {
      productUpdate(product: { id: $id, collectionsToJoin: $join }) {
        product { handle collections(first: 16) { nodes { handle } } }
        userErrors { message }
      }
    }`,
    { id: product.id, join: joinIds }
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

async function main() {
  const token = loadToken();
  for (const spec of PRODUCTS) {
    await ensureProduct(token, spec);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
