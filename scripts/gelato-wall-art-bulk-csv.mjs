/**
 * Build Gelato "Create products from template" CSVs for Pixora wall-art catalogues.
 * Usage: node --env-file=apps/admin/.env.local scripts/gelato-wall-art-bulk-csv.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const apiKey = process.env.GELATO_API_KEY;
if (!apiKey) {
  console.error("Set GELATO_API_KEY (e.g. --env-file=apps/admin/.env.local)");
  process.exit(1);
}

/** Wall-art dropdown → Gelato catalogUid */
const WALL_ART = [
  {
    handle: "canvas-prints",
    title: "Canvas prints",
    catalogUid: "canvas",
    filter: (uid, attrs) =>
      String(uid).includes("wood-fsc-slim") ||
      String(attrs?.CanvasThicknessType ?? "").toLowerCase().includes("slim"),
  },
  {
    handle: "framed-canvas",
    title: "Framed canvas",
    catalogUid: "framed-canvas",
  },
  {
    handle: "framed-prints",
    title: "Framed prints",
    catalogUid: "framed-posters",
  },
  {
    handle: "aluminum-prints",
    title: "Metal / aluminium prints",
    catalogUid: "metallic",
  },
  {
    handle: "acrylic-prints",
    title: "Acrylic prints",
    catalogUid: "acrylic",
  },
  {
    handle: "posters",
    title: "Posters",
    catalogUid: "posters",
  },
  {
    handle: "posters-with-hangers",
    title: "Posters with hangers",
    catalogUid: "poster-hangers",
  },
  {
    handle: "foam-prints",
    title: "Foam prints",
    catalogUid: "foam-print-product",
  },
  {
    handle: "wood-prints",
    title: "Wood prints",
    catalogUid: "wood-prints",
  },
];

/** Blank placeholder for personalization layers — replace with your own hosted blank if Gelato rejects it */
const BLANK_PRINT_URL =
  "https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png";

const outDir = resolve("gelato-bulk/wall-art");

function csvEscape(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

function row(fields) {
  return fields.map(csvEscape).join(",");
}

async function searchAll(catalogUid) {
  const products = [];
  let offset = 0;
  const limit = 100;

  for (;;) {
    const response = await fetch(
      `https://product.gelatoapis.com/v3/catalogs/${encodeURIComponent(catalogUid)}/products:search`,
      {
        method: "POST",
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ limit, offset }),
      },
    );
    const json = await response.json();
    if (!response.ok) {
      throw new Error(
        `${catalogUid}: ${json.message ?? JSON.stringify(json).slice(0, 200)}`,
      );
    }
    const batch = json.products ?? json.data?.products ?? [];
    products.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
    if (offset > 5000) break;
  }

  return products;
}

function humanTitle(baseTitle, product) {
  const attrs = product.attributes ?? {};
  const format =
    attrs.UnifiedCanvasFormat ||
    attrs.PaperFormat ||
    attrs.Size ||
    attrs.Dimension ||
    "";
  const orient = attrs.Orientation || attrs.PrintOrientation || "";
  const bits = [baseTitle];
  if (format) bits.push(String(format).replaceAll("_", " "));
  if (orient) bits.push(String(orient));
  return bits.join(" — ");
}

function description(baseTitle) {
  return [
    `Personalised ${baseTitle.toLowerCase()} from Pixora.`,
    "Upload your photo, preview on a live product mockup, and we print and ship premium quality to your door.",
    "Ideal for home décor or gifting.",
  ].join(" ");
}

async function main() {
  await mkdir(outDir, { recursive: true });

  const summary = [];
  const masterCreateRows = [
    row([
      "Product Title",
      "Product Description",
      "Product UID",
      "Print File URL",
      "Should Publish Images?",
      "Collection Handle",
      "Gelato Catalog",
    ]),
  ];

  for (const cat of WALL_ART) {
    process.stdout.write(`Fetching ${cat.catalogUid}… `);
    let products;
    try {
      products = await searchAll(cat.catalogUid);
    } catch (err) {
      console.log("FAILED");
      console.error(`  ${err.message}`);
      summary.push({ handle: cat.handle, catalogUid: cat.catalogUid, count: 0, error: err.message });
      continue;
    }

    let filtered = products;
    if (cat.filter) {
      filtered = products.filter((p) =>
        cat.filter(p.productUid, p.attributes ?? {}),
      );
      if (filtered.length === 0) filtered = products;
    }

    console.log(`${products.length} products (${filtered.length} used)`);

    const refHeader = row([
      "productUid",
      "title",
      "collectionHandle",
      "catalogUid",
      "attributesJson",
    ]);
    const refRows = [refHeader];

    const createHeader = row([
      "Product Title",
      "Product Description",
      "Product UID",
      "Print File URL",
      "Should Publish Images?",
    ]);
    const createRows = [createHeader];

    for (const product of filtered) {
      const title = humanTitle(cat.title, product);
      const attrs = JSON.stringify(product.attributes ?? {});
      refRows.push(
        row([
          product.productUid,
          title,
          cat.handle,
          cat.catalogUid,
          attrs,
        ]),
      );
      createRows.push(
        row([
          title,
          description(cat.title),
          product.productUid,
          BLANK_PRINT_URL,
          "Yes",
        ]),
      );
    }

    // One “hero” product row for master index (first UID) — upload against matching template
    if (filtered[0]) {
      masterCreateRows.push(
        row([
          `Pixora ${cat.title}`,
          description(cat.title),
          filtered[0].productUid,
          BLANK_PRINT_URL,
          "Yes",
          cat.handle,
          cat.catalogUid,
        ]),
      );
    }

    await writeFile(
      resolve(outDir, `${cat.handle}-uids-reference.csv`),
      refRows.join("\n") + "\n",
      "utf8",
    );
    await writeFile(
      resolve(outDir, `${cat.handle}-create-from-template.csv`),
      createRows.join("\n") + "\n",
      "utf8",
    );

    summary.push({
      handle: cat.handle,
      catalogUid: cat.catalogUid,
      total: products.length,
      used: filtered.length,
    });
  }

  await writeFile(
    resolve(outDir, "wall-art-master-one-per-type.csv"),
    masterCreateRows.join("\n") + "\n",
    "utf8",
  );

  await writeFile(
    resolve(outDir, "README.md"),
    `# Gelato wall-art bulk CSVs

Generated for Pixora header Wall art dropdown. Maps to Gelato catalogs.

## Important

Gelato **Create multiple products at once** uses **one saved template per upload**.
Upload each \`*-create-from-template.csv\` against a template of the **same product type**
(e.g. canvas CSV → canvas template with Personalization image layer ON).

Do **not** upload all types in one go from a single canvas template.

## Files

| File | Use |
|------|-----|
| \`wall-art-master-one-per-type.csv\` | 9 rows — one Shopify product per wall-art type (still upload per matching template) |
| \`{handle}-create-from-template.csv\` | All Gelato UIDs for that type as separate products (large) |
| \`{handle}-uids-reference.csv\` | Reference: UID + attributes for pricing / collection mapping |

## Columns (Gelato create-from-template)

Product Title, Product Description, Product UID, Print File URL, Should Publish Images?

\`Print File URL\` is a blank placeholder for personalization. Replace with your own hosted blank PNG if Gelato rejects the Wikimedia 1×1.

## After upload

1. Select **Publish products to external store** (Shopify).
2. In Shopify, assign products to collections matching the handle (\`canvas-prints\`, \`framed-canvas\`, …) and parent \`wall-art\`.

## Catalogue map

${WALL_ART.map((c) => `- **${c.title}** → collection \`${c.handle}\` → Gelato \`${c.catalogUid}\``).join("\n")}
`,
    "utf8",
  );

  await writeFile(
    resolve(outDir, "summary.json"),
    JSON.stringify(summary, null, 2),
    "utf8",
  );

  console.log("\nWrote CSVs to", outDir);
  console.table(summary);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
