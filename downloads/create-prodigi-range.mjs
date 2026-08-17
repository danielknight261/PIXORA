/**
 * Create Prodigi-only products that are not in the Gelato catalogue.
 * Tattoos, magnets, photo tiles, cushions, acrylic prisms, jigsaws.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const ONLINE = "gid://shopify/Publication/333315113304";

const PRODUCTS = [
  {
    title: "Temporary tattoos",
    handle: "temporary-tattoos",
    productType: "Temporary tattoos",
    tags: ["prodigi", "tattoos", "gifts"],
    collection: {
      title: "Temporary tattoos",
      handle: "tattoos",
      descriptionHtml:
        "<p>Skin-safe waterslide tattoos in five sizes — personalise with your photo or design.</p>",
    },
    join: ["home-gifts"],
    hero: "https://www.prodigi.com/img/products/hero/temporary-tattoos.webp",
    descriptionHtml: `<p>Personalised temporary tattoos printed on skin-safe waterslide film. Easy to apply, lasts up to a week, and removes with baby oil.</p>
<ul>
<li>Five sizes from 5×7.5 cm to 30×30 cm</li>
<li>Certified for toys and cosmetics in the UK, EU, US, Canada and Australia</li>
<li>Not recommended for children under 3</li>
</ul>
<p>Use Personalize design to upload a JPG or PNG. We’ll print from your artwork — not the stock photo.</p>`,
    productOptions: [{ name: "Size", values: [
      { name: "Small — 5×7.5 cm (2×3″)" },
      { name: "Medium — 7.5×10 cm (3×4″)" },
      { name: "Large — 10×15 cm (4×6″)" },
      { name: "Extra large — 20×20 cm (8×8″)" },
      { name: "XXL — 30×30 cm (12×12″)" },
    ] }],
    variants: [
      { sku: "GLOBAL-TATT-S", price: "5.95", options: ["Small — 5×7.5 cm (2×3″)"] },
      { sku: "GLOBAL-TATT-M", price: "7.95", options: ["Medium — 7.5×10 cm (3×4″)"] },
      { sku: "GLOBAL-TATT-L", price: "9.95", options: ["Large — 10×15 cm (4×6″)"] },
      { sku: "GLOBAL-TATT-XL", price: "14.95", options: ["Extra large — 20×20 cm (8×8″)"] },
      { sku: "GLOBAL-TATT-XXL", price: "19.95", options: ["XXL — 30×30 cm (12×12″)"] },
    ],
  },
  {
    title: "Fridge magnets",
    handle: "fridge-magnets",
    productType: "Magnets",
    tags: ["prodigi", "magnets", "gifts"],
    collection: {
      title: "Magnets",
      handle: "magnets",
      descriptionHtml:
        "<p>Silver halide photo fridge magnets — a single photo on a strong magnetic backing.</p>",
    },
    join: ["home-gifts"],
    hero: "https://www.prodigi.com/img/products/hero/magnets.webp",
    descriptionHtml: `<p>Personalised fridge magnets printed with silver halide and sealed onto a powerful magnetic substrate.</p>
<ul>
<li>Single-image magnets in 10×10 cm and 15×15 cm</li>
<li>0.6 mm thick magnetic backing</li>
<li>Ideal everyday gift</li>
</ul>
<p>Use Personalize design to upload a JPG or PNG. We’ll print from your artwork — not the stock photo.</p>`,
    productOptions: [{ name: "Size", values: [
      { name: "Square — 10×10 cm (4×4″)" },
      { name: "Square — 15×15 cm (6×6″)" },
    ] }],
    variants: [
      { sku: "MAG-1-10X10", price: "5.95", options: ["Square — 10×10 cm (4×4″)"] },
      { sku: "MAG-1-15X15", price: "7.95", options: ["Square — 15×15 cm (6×6″)"] },
    ],
  },
  {
    title: "Framed photo tiles",
    handle: "framed-photo-tiles",
    productType: "Photo tiles",
    tags: ["prodigi", "photo-tiles", "wall-art"],
    collection: {
      title: "Photo tiles",
      handle: "photo-tiles",
      descriptionHtml:
        "<p>Lightweight restickable framed photo tiles — hang without tools, move up to five times.</p>",
    },
    join: ["home-gifts", "wall-art"],
    hero: "https://www.prodigi.com/img/products/hero/framed-photo-tiles.jpg",
    descriptionHtml: `<p>Super-lightweight stick-on photo tiles with a recycled-content plastic frame. Reposition up to five times with no wall residue.</p>
<ul>
<li>Three sizes: 13×18 cm, 20×20 cm and 20×25 cm</li>
<li>Black or white frame</li>
<li>Giclée photographic print · 1.7 cm frame depth</li>
</ul>
<p>Use Personalize design to upload a JPG or PNG. We’ll print from your artwork — not the stock photo.</p>`,
    productOptions: [
      { name: "Size", values: [
        { name: "5×7″ (13×18 cm)" },
        { name: "8×8″ (20×20 cm)" },
        { name: "8×10″ (20×25 cm)" },
      ] },
      { name: "Frame", values: [{ name: "White" }, { name: "Black" }] },
    ],
    variants: [
      { sku: "PHOTIL-FRA-0507-WHT", price: "11.95", options: ["5×7″ (13×18 cm)", "White"] },
      { sku: "PHOTIL-FRA-0507-BLK", price: "11.95", options: ["5×7″ (13×18 cm)", "Black"] },
      { sku: "PHOTIL-FRA-0808-WHT", price: "14.95", options: ["8×8″ (20×20 cm)", "White"] },
      { sku: "PHOTIL-FRA-0808-BLK", price: "14.95", options: ["8×8″ (20×20 cm)", "Black"] },
      { sku: "PHOTIL-FRA-0810-WHT", price: "16.95", options: ["8×10″ (20×25 cm)", "White"] },
      { sku: "PHOTIL-FRA-0810-BLK", price: "16.95", options: ["8×10″ (20×25 cm)", "Black"] },
    ],
  },
  {
    title: "Photo cushions",
    handle: "photo-cushions",
    productType: "Cushions",
    tags: ["prodigi", "cushions", "gifts"],
    collection: {
      title: "Cushions",
      handle: "cushions",
      descriptionHtml:
        "<p>Faux suede throw cushions with a single-sided photo print and fibre fill.</p>",
    },
    join: ["home-gifts"],
    hero: "https://www.prodigi.com/img/products/hero/cushions.webp",
    descriptionHtml: `<p>Personalised faux suede cushions, printed with dye sublimation and finished with a zip cover and fibre fill.</p>
<ul>
<li>Square sizes from 30×30 cm to 61×61 cm</li>
<li>Single-sided print, stone reverse</li>
<li>Wash cover at 30°C</li>
</ul>
<p>Use Personalize design to upload a JPG or PNG. We’ll print from your artwork — not the stock photo.</p>`,
    productOptions: [{ name: "Size", values: [
      { name: "12×12″ (30×30 cm)" },
      { name: "16×16″ (41×41 cm)" },
      { name: "18×18″ (46×46 cm)" },
      { name: "24×24″ (61×61 cm)" },
    ] }],
    variants: [
      { sku: "GLOBAL-CUSH-12X12-SUE", price: "19.95", options: ["12×12″ (30×30 cm)"] },
      { sku: "GLOBAL-CUSH-16X16-SUE", price: "24.95", options: ["16×16″ (41×41 cm)"] },
      { sku: "GLOBAL-CUSH-18X18-SUE", price: "27.95", options: ["18×18″ (46×46 cm)"] },
      { sku: "GLOBAL-CUSH-24X24-SUE", price: "32.95", options: ["24×24″ (61×61 cm)"] },
    ],
  },
  {
    title: "Acrylic photo prism",
    handle: "acrylic-photo-prism",
    productType: "Acrylic prism",
    tags: ["prodigi", "acrylic-prism", "gifts"],
    collection: {
      title: "Acrylic prisms",
      handle: "acrylic-prisms",
      descriptionHtml:
        "<p>Freestanding acrylic photo blocks for desk or shelf — back mount or transparent background.</p>",
    },
    join: ["home-gifts"],
    hero: "https://www.prodigi.com/img/products/hero/acrylic-prism.jpg",
    descriptionHtml: `<p>Personalised freestanding acrylic prism — one-inch thick with diamond-polished edges. Perfect for desks and shelves.</p>
<ul>
<li>Back mount or transparent background</li>
<li>Square and rectangular sizes</li>
<li>Giclée print · ships in protective packaging</li>
</ul>
<p>Upload a JPG or PNG. For transparent prisms, use PNG — white areas will not show. We’ll mock up and confirm before dispatch.</p>`,
    productOptions: [{ name: "Format", values: [
      { name: "Back mount · 4×6″ (10×15 cm)" },
      { name: "Back mount · 6×6″ (15×15 cm)" },
      { name: "Back mount · 8×8″ (20×20 cm)" },
      { name: "Transparent · 5×5″ (13×13 cm)" },
      { name: "Transparent · 5×7″ (13×18 cm)" },
      { name: "Transparent · 6×8″ (15×20 cm)" },
    ] }],
    variants: [
      { sku: "GLOBAL-MOU-PRISM-4X6", price: "12.95", options: ["Back mount · 4×6″ (10×15 cm)"] },
      { sku: "GLOBAL-MOU-PRISM-6X6", price: "14.95", options: ["Back mount · 6×6″ (15×15 cm)"] },
      { sku: "GLOBAL-MOU-PRISM-8X8", price: "19.95", options: ["Back mount · 8×8″ (20×20 cm)"] },
      { sku: "GLOBAL-MOU-PRISM-5X5-TRANS", price: "12.95", options: ["Transparent · 5×5″ (13×13 cm)"] },
      { sku: "GLOBAL-MOU-PRISM-5X7-TRANS", price: "14.95", options: ["Transparent · 5×7″ (13×18 cm)"] },
      { sku: "GLOBAL-MOU-PRISM-6X8-TRANS", price: "16.95", options: ["Transparent · 6×8″ (15×20 cm)"] },
    ],
  },
  {
    title: "Jigsaw puzzles",
    handle: "jigsaw-puzzles",
    productType: "Jigsaws",
    tags: ["prodigi", "jigsaws", "gifts"],
    collection: {
      title: "Jigsaws",
      handle: "jigsaws",
      descriptionHtml:
        "<p>Dye-sublimation jigsaws in a metal tin — 30 to 1000 pieces, with your photo on the puzzle and the lid.</p>",
    },
    join: ["home-gifts"],
    hero: "https://www.prodigi.com/img/products/hero/jigsaw-puzzles.webp",
    descriptionHtml: `<p>Personalised jigsaw puzzles in a metal tin. Your photo is printed on the puzzle and on the tin lid.</p>
<ul>
<li>30, 110, 252, 500 or 1000 pieces</li>
<li>Dye sublimation print</li>
<li>Ships in a keepsake tin</li>
</ul>
<p>Use Personalize design to upload a JPG or PNG. We’ll print from your artwork — not the stock photo.</p>`,
    productOptions: [{ name: "Size", values: [
      { name: "30 pieces — 25×20 cm" },
      { name: "110 pieces — 25×20 cm" },
      { name: "252 pieces — 37.5×28.5 cm" },
      { name: "500 pieces — 53×39 cm" },
      { name: "1000 pieces — 76.5×52.5 cm" },
    ] }],
    variants: [
      { sku: "JIGSAW-PUZZLE-30", price: "19.95", options: ["30 pieces — 25×20 cm"] },
      { sku: "JIGSAW-PUZZLE-110", price: "24.95", options: ["110 pieces — 25×20 cm"] },
      { sku: "JIGSAW-PUZZLE-252", price: "29.95", options: ["252 pieces — 37.5×28.5 cm"] },
      { sku: "JIGSAW-PUZZLE-500", price: "34.95", options: ["500 pieces — 53×39 cm"] },
      { sku: "JIGSAW-PUZZLE-1000", price: "39.95", options: ["1000 pieces — 76.5×52.5 cm"] },
    ],
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
