/**
 * Promote the personalized Premium Matte Paper Poster (-1) to the live handle.
 * Copies retail prices from the canonical product, then unpublishes the old listing.
 */
import fs from "node:fs";
import path from "node:path";
import os from "os";

const SHOP = "hxbghe-6d.myshopify.com";
const API = `https://${SHOP}/admin/api/2025-01/graphql.json`;
const LIVE_ID = "gid://shopify/Product/15933319512408";
const SOURCE_ID = "gid://shopify/Product/15933333274968";
const ONLINE = "gid://shopify/Publication/333315113304";
const VENDOR = "Snapp Daddy";
const DESCRIPTION = `<p>Personalised premium matte paper posters from Snapp Daddy. Upload your photo, preview it on a live product mockup, and we print and ship to your door.</p>
<ul>
<li><strong>Paper finishing:</strong> Matte, smooth, non-reflective surface.</li>
<li><strong>Paper weight:</strong> 200 gsm (80 lb), thickness 0.26 mm (10.3 mils).</li>
<li><strong>Sustainable paper:</strong> FSC-certified or equivalent.</li>
<li><strong>Sizes:</strong> 29 sizes in portrait, landscape and square.</li>
</ul>
<p>No minimum orders. Printed and shipped on demand.</p>
<div data-gelato-customization="1"></div>`;

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
  const store = JSON.parse(kit.sessionStore);
  const account = Object.values(store["accounts.shopify.com"] || {})[0];
  const apps = account?.applications || {};
  const shopKey = Object.keys(apps).find((k) => k.startsWith(SHOP));
  const token = apps[shopKey]?.accessToken;
  if (!token) throw new Error("No shop token in CLI kit session");
  return token;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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

async function fetchProduct(token, id) {
  const variants = [];
  let cursor = null;
  let product = null;
  for (;;) {
    const data = await gql(
      token,
      `query ($id: ID!, $cursor: String) {
        product(id: $id) {
          id title handle vendor status
          descriptionHtml
          collections(first: 20) { nodes { id handle title } }
          variants(first: 100, after: $cursor) {
            pageInfo { hasNextPage endCursor }
            nodes {
              id sku title price
              selectedOptions { name value }
              media(first: 3) {
                nodes { ... on MediaImage { id image { url } } }
              }
            }
          }
        }
      }`,
      { id, cursor }
    );
    product = data.product;
    variants.push(...data.product.variants.nodes);
    if (!data.product.variants.pageInfo.hasNextPage) break;
    cursor = data.product.variants.pageInfo.endCursor;
  }
  return { ...product, variants };
}

async function collectionByHandle(token, handle) {
  const data = await gql(
    token,
    `query ($h: String!) {
      collectionByHandle(handle: $h) { id handle }
    }`,
    { h: handle }
  );
  return data.collectionByHandle;
}

async function main() {
  const token = loadToken();
  const live = await fetchProduct(token, LIVE_ID);
  const source = await fetchProduct(token, SOURCE_ID);
  console.log("LIVE", live.handle, live.vendor, live.variants.length, "variants");
  console.log(
    "SOURCE",
    source.handle,
    source.vendor,
    source.variants.length,
    "variants",
    "with media",
    source.variants.filter((v) => v.media.nodes.length).length
  );

  const priceBySku = Object.fromEntries(
    live.variants.filter((v) => v.sku).map((v) => [v.sku, v.price])
  );
  const priceUpdates = source.variants
    .filter((v) => priceBySku[v.sku] && priceBySku[v.sku] !== v.price)
    .map((v) => ({ id: v.id, price: priceBySku[v.sku] }));
  console.log("Price updates", priceUpdates.length);

  for (let i = 0; i < priceUpdates.length; i += 25) {
    const batch = priceUpdates.slice(i, i + 25);
    const data = await gql(
      token,
      `mutation ($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          userErrors { field message }
        }
      }`,
      { productId: SOURCE_ID, variants: batch }
    );
    const errs = data.productVariantsBulkUpdate.userErrors || [];
    if (errs.length) console.warn("price errs", errs);
    console.log(
      `Priced ${Math.min(i + 25, priceUpdates.length)}/${priceUpdates.length}`
    );
    await sleep(300);
  }

  const posters = await collectionByHandle(token, "posters");
  const wall = await collectionByHandle(token, "wall-art");
  const join = [posters?.id, wall?.id].filter(Boolean);
  console.log("Join collections", join);

  const updated = await gql(
    token,
    `mutation ($product: ProductUpdateInput!) {
      productUpdate(product: $product) {
        product { id handle vendor status }
        userErrors { field message }
      }
    }`,
    {
      product: {
        id: SOURCE_ID,
        vendor: VENDOR,
        descriptionHtml: DESCRIPTION,
        tags: [
          "wall art",
          "posters",
          "matte poster",
          "personalised",
          "FSC-certified poster",
        ],
        seo: {
          title: "Premium Matte Paper Poster",
          description:
            "Personalised premium matte paper posters. Upload your photo, preview a live mockup, then we print and ship.",
        },
        ...(join.length ? { collectionsToJoin: join } : {}),
      },
    }
  );
  if (updated.productUpdate.userErrors?.length) {
    throw new Error(JSON.stringify(updated.productUpdate.userErrors));
  }
  console.log("Updated source metadata", updated.productUpdate.product);

  try {
    await gql(
      token,
      `mutation ($id: ID!, $pub: ID!) {
        publishablePublish(id: $id, input: [{ publicationId: $pub }]) {
          userErrors { message }
        }
      }`,
      { id: SOURCE_ID, pub: ONLINE }
    );
  } catch (e) {
    console.warn("publish skipped:", String(e.message).slice(0, 180));
  }

  const renameOld = await gql(
    token,
    `mutation ($product: ProductUpdateInput!) {
      productUpdate(product: $product) {
        product { handle }
        userErrors { field message }
      }
    }`,
    {
      product: {
        id: LIVE_ID,
        handle: "premium-matte-paper-poster-legacy",
        status: "ARCHIVED",
      },
    }
  );
  console.log("Renamed old", renameOld.productUpdate);

  const renameNew = await gql(
    token,
    `mutation ($product: ProductUpdateInput!) {
      productUpdate(product: $product) {
        product { handle vendor status }
        userErrors { field message }
      }
    }`,
    {
      product: {
        id: SOURCE_ID,
        handle: "premium-matte-paper-poster",
      },
    }
  );
  console.log("Promoted source", renameNew.productUpdate);

  try {
    await gql(
      token,
      `mutation ($id: ID!, $pub: ID!) {
        publishableUnpublish(id: $id, input: [{ publicationId: $pub }]) {
          userErrors { message }
        }
      }`,
      { id: LIVE_ID, pub: ONLINE }
    );
  } catch (e) {
    console.warn("unpublish skipped:", String(e.message).slice(0, 180));
  }

  const check = await fetchProduct(token, SOURCE_ID);
  const old = await fetchProduct(token, LIVE_ID);
  const sample = check.variants.slice(0, 3).map((v) => ({
    title: v.title,
    price: v.price,
    media: v.media.nodes.length,
  }));
  console.log(
    JSON.stringify(
      {
        liveNow: {
          handle: check.handle,
          vendor: check.vendor,
          status: check.status,
          variants: check.variants.length,
          withMedia: check.variants.filter((v) => v.media.nodes.length).length,
          collections: check.collections.nodes.map((c) => c.handle),
          sample,
        },
        archived: {
          handle: old.handle,
          status: old.status,
        },
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
