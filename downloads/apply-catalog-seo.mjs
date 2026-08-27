/**
 * Write unique collection + product SEO and the shop meta description.
 * Uses the Shopify CLI session for hxbghe-6d.myshopify.com.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const BRAND = "Snapp Daddy";

const SHOP_DESCRIPTION =
  "Turn your favourite photos into canvas prints, framed wall art, mugs and gifts. Preview your design, then we print to order.";

const COLLECTIONS = {
  frontpage: {
    seoTitle: "Personalised photo gifts and wall art | Snapp Daddy",
    seoDescription: SHOP_DESCRIPTION,
    body: "",
  },
  "wall-art": {
    seoTitle: "Personalised wall art | Snapp Daddy",
    seoDescription:
      "Canvas, framed prints, metal, acrylic and posters made from your photos. Preview on the product, then we print to order.",
    body: "<p>Canvas, framed prints, metal, acrylic, posters and more — pick a finish, then personalise with your photo.</p>",
  },
  "canvas-prints": {
    seoTitle: "Personalised canvas prints | Snapp Daddy",
    seoDescription:
      "Gallery-wrap canvas in portrait, landscape or square. Choose slim or thick wrap, preview your photo, then we print to order.",
    body: "<p>Personalised canvas prints made for your photos. Pick portrait, landscape or square, choose slim or thick wrap, then pick a size.</p>",
  },
  posters: {
    seoTitle: "Personalised photo posters | Snapp Daddy",
    seoDescription:
      "Matte, fine art and semi-glossy posters from your photos. Pick a paper finish, then size, and preview before we print.",
    body: "<p>Paper posters in multiple finishes. Pick a finish, then choose size and personalise with your photo.</p>",
  },
  "framed-prints": {
    seoTitle: "Personalised framed prints | Snapp Daddy",
    seoDescription:
      "Wooden or metal framed photo prints. Choose frame colour, size and orientation, preview your photo, then we print to order.",
    body: "<p>Personalised framed prints — choose frame colour, size and orientation, then upload your photo.</p>",
  },
  "framed-canvas": {
    seoTitle: "Personalised framed canvas | Snapp Daddy",
    seoDescription:
      "Canvas in a tray frame. Choose frame colour, orientation and size, preview your photo, then we print to order.",
    body: "<p>Canvas prints in a tray frame — choose frame colour, orientation and size, then personalise with your photo.</p>",
  },
  "acrylic-prints": {
    seoTitle: "Personalised acrylic prints | Snapp Daddy",
    seoDescription:
      "Glossy acrylic wall prints that float on standoffs. Choose orientation and size, preview your photo, then we print.",
    body: "<p>Glossy acrylic wall prints — choose orientation and size, then personalise with your photo.</p>",
  },
  "aluminum-prints": {
    seoTitle: "Personalised metal prints | Snapp Daddy",
    seoDescription:
      "Smooth and brushed aluminium photo prints. Choose a finish, orientation and size, then preview before we print.",
    body: "<p>Aluminium and brushed aluminium prints — vivid metal wall art from your photo.</p>",
  },
  "wood-prints": {
    seoTitle: "Personalised wood prints | Snapp Daddy",
    seoDescription:
      "Photo prints on natural wood grain. Choose thickness, orientation and size, preview your photo, then we print to order.",
    body: "<p>Natural wood grain prints — choose thickness, orientation and size, then personalise with your photo.</p>",
  },
  "foam-prints": {
    seoTitle: "Personalised foam prints | Snapp Daddy",
    seoDescription:
      "Lightweight foam board photo prints. Portrait, landscape or square, with optional edge colour. Preview, then we print.",
    body: "<p>Lightweight foam board prints — portrait, landscape or square, with optional edge colour.</p>",
  },
  "posters-with-hangers": {
    seoTitle: "Posters with hangers | Snapp Daddy",
    seoDescription:
      "Matte posters with magnetic wood hangers. Pick hanger colour, orientation and size, preview your photo, then we print.",
    body: "<p>Posters with wood hangers — pick hanger colour, orientation and size, then personalise with your photo.</p>",
  },
  "home-gifts": {
    seoTitle: "Personalised photo gifts | Snapp Daddy",
    seoDescription:
      "Mugs, bottles, phone cases, totes and more printed with your photo. Everyday gifts they’ll actually use.",
    body: "<p>Personalised mugs, bottles, phone cases, tote bags and more — gifts they’ll use every day.</p>",
  },
  mugs: {
    seoTitle: "Personalised photo mugs | Snapp Daddy",
    seoDescription:
      "Ceramic, enamel, magic and travel mugs printed with your photo. Pick a style, preview the design, then we print to order.",
    body: "<p>Personalised ceramic mugs — classic white or colour-inside styles, plus enamel, magic and travel mugs.</p>",
  },
  "water-bottles": {
    seoTitle: "Personalised water bottles | Snapp Daddy",
    seoDescription:
      "Stainless steel water bottles printed with your photo. Preview the design, then we print to order.",
    body: "<p>Personalised stainless steel water bottles — print your photo or design.</p>",
  },
  "phone-cases": {
    seoTitle: "Personalised phone cases | Snapp Daddy",
    seoDescription:
      "Apple and Samsung cases printed with your photo. Pick a style and model, preview, then we print to order.",
    body: "<p>Personalised phone cases for Apple and Samsung — pick a style and model, then personalise.</p>",
  },
  "tote-bags": {
    seoTitle: "Personalised tote bags | Snapp Daddy",
    seoDescription:
      "Classic and premium totes printed with your photo. Pick a colour, preview the design, then we print to order.",
    body: "<p>Personalised tote bags — classic and premium styles with colour options.</p>",
  },
  stickers: {
    seoTitle: "Personalised stickers | Snapp Daddy",
    seoDescription:
      "Kiss-cut vinyl stickers from your photo or design. Matt or gloss, four sizes, printed to order.",
    body: "<p>Personalised kiss-cut vinyl stickers — cut to your design, matt or gloss, four sizes.</p>",
  },
  tattoos: {
    seoTitle: "Personalised temporary tattoos | Snapp Daddy",
    seoDescription:
      "Skin-safe waterslide tattoos in five sizes. Personalise with your photo or design, then we print to order.",
    body: "<p>Skin-safe waterslide tattoos in five sizes — personalise with your photo or design.</p>",
  },
  magnets: {
    seoTitle: "Personalised photo magnets | Snapp Daddy",
    seoDescription:
      "Silver halide fridge magnets with your photo on a strong magnetic backing. Preview, then we print to order.",
    body: "<p>Silver halide photo fridge magnets — a single photo on a strong magnetic backing.</p>",
  },
  "photo-tiles": {
    seoTitle: "Personalised photo tiles | Snapp Daddy",
    seoDescription:
      "Restickable framed photo tiles. Hang without tools, move up to five times. Preview your photo, then we print.",
    body: "<p>Lightweight restickable framed photo tiles — hang without tools, move up to five times.</p>",
  },
  cushions: {
    seoTitle: "Personalised photo cushions | Snapp Daddy",
    seoDescription:
      "Faux suede throw cushions with a single-sided photo print. Preview your design, then we print to order.",
    body: "<p>Faux suede throw cushions with a single-sided photo print and fibre fill.</p>",
  },
  jigsaws: {
    seoTitle: "Personalised jigsaw puzzles | Snapp Daddy",
    seoDescription:
      "Photo jigsaws in a metal tin, 30 to 1000 pieces. Your photo on the puzzle and the lid.",
    body: "<p>Dye-sublimation jigsaws in a metal tin — 30 to 1000 pieces, with your photo on the puzzle and the lid.</p>",
  },
  "acrylic-prisms": {
    seoTitle: "Personalised acrylic photo blocks | Snapp Daddy",
    seoDescription:
      "Freestanding acrylic photo blocks for desk or shelf. Preview your photo, then we print to order.",
    body: "<p>Freestanding acrylic photo blocks for desk or shelf — back mount or transparent background.</p>",
  },
  towels: {
    seoTitle: "Personalised photo towels | Snapp Daddy",
    seoDescription:
      "Beach and hand towels printed with your photo. Soft cotton-poly blend, printed to order.",
    body: "<p>Personalised sublimation towels — beach and hand sizes. Print your photo on a soft cotton-poly blend.</p>",
  },
};

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
  const text = await res.text();
  if (!text) throw new Error("empty GraphQL response " + res.status);
  const json = JSON.parse(text);
  if (json.errors?.length) {
    const msg = JSON.stringify(json.errors);
    if (msg.includes("THROTTLED") || msg.includes("429")) {
      await sleep(2000);
      return gql(token, query, variables);
    }
    throw new Error(msg);
  }
  return json.data;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function clip(text, max) {
  const t = String(text || "").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + "…";
}

function productSeoTitle(title) {
  const clean = String(title || "")
    .replace(/\s+Bestseller$/i, "")
    .replace(/\s+Premium$/i, "")
    .replace(/\s+-\d+$/, "")
    .trim();
  const suffix = ` | ${BRAND}`;
  return clip(clean, 70 - suffix.length) + suffix;
}

function productSeoDescription(title) {
  return clip(
    `Personalise ${title} with your photo. Preview it on the product, then Snapp Daddy prints to order.`,
    160
  );
}

async function paginate(token, root, query) {
  const nodes = [];
  let cursor = null;
  for (;;) {
    const data = await gql(token, query, { c: cursor });
    const conn = data[root];
    for (const e of conn.edges) nodes.push(e.node);
    if (!conn.pageInfo.hasNextPage) break;
    cursor = conn.pageInfo.endCursor;
  }
  return nodes;
}

async function updateShopDescription(token) {
  const res = await fetch(`https://${SHOP}/admin/api/2025-01/shop.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ shop: { description: SHOP_DESCRIPTION } }),
  });
  const text = await res.text();
  if (!text) {
    console.log("shop REST empty", res.status);
    return false;
  }
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.log("shop REST not json", res.status, text.slice(0, 200));
    return false;
  }
  if (!res.ok) {
    console.log("shop REST", res.status, JSON.stringify(json).slice(0, 400));
    return false;
  }
  console.log("shop description", json.shop?.description ? "ok" : JSON.stringify(json).slice(0, 200));
  return true;
}

async function main() {
  const token = loadToken();
  await updateShopDescription(token);

  const collections = await paginate(
    token,
    "collections",
    `query ($c: String) {
      collections(first: 50, after: $c) {
        pageInfo { hasNextPage endCursor }
        edges { node { id handle title } }
      }
    }`
  );

  for (const col of collections) {
    const copy = COLLECTIONS[col.handle];
    if (!copy) {
      console.log("skip collection", col.handle);
      continue;
    }
    const input = {
      id: col.id,
      seo: { title: copy.seoTitle, description: copy.seoDescription },
    };
    if (copy.body) input.descriptionHtml = copy.body;
    const data = await gql(
      token,
      `mutation ($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          userErrors { field message }
          collection { handle seo { title } }
        }
      }`,
      { input }
    );
    const errs = data.collectionUpdate.userErrors || [];
    if (errs.length) console.log("collection error", col.handle, JSON.stringify(errs));
    else console.log("collection", col.handle);
    await sleep(200);
  }

  const products = await paginate(
    token,
    "products",
    `query ($c: String) {
      products(first: 50, after: $c) {
        pageInfo { hasNextPage endCursor }
        edges { node { id handle title status } }
      }
    }`
  );

  for (const p of products) {
    if (p.status === "ARCHIVED") {
      console.log("skip archived", p.handle);
      continue;
    }
    const data = await gql(
      token,
      `mutation ($input: ProductInput!) {
        productUpdate(input: $input) {
          userErrors { field message }
          product { handle seo { title } }
        }
      }`,
      {
        input: {
          id: p.id,
          seo: {
            title: productSeoTitle(p.title),
            description: productSeoDescription(p.title),
          },
        },
      }
    );
    const errs = data.productUpdate.userErrors || [];
    if (errs.length) console.log("product error", p.handle, JSON.stringify(errs));
    else console.log("product", p.handle);
    await sleep(200);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
