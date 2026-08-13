/**
 * Build curated Pixora canvas TEMPLATE variants — slim + thick wrap.
 * Usage: node --env-file=apps/admin/.env.local scripts/gelato-canvas-template-plan.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const apiKey = process.env.GELATO_API_KEY;
if (!apiKey) {
  console.error("Set GELATO_API_KEY");
  process.exit(1);
}

const PREFERRED_INCH = new Set([
  "8x10",
  "8x12",
  "11x14",
  "12x12",
  "12x16",
  "12x18",
  "14x14",
  "16x16",
  "16x20",
  "18x24",
  "20x20",
  "20x30",
  "24x24",
  "24x36",
]);

const THICKNESS = {
  "wood-fsc-slim": "Slim",
  "wood-fsc-thick": "Thick",
};

function csvEscape(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

async function searchAll(catalogUid) {
  const products = [];
  let offset = 0;
  for (;;) {
    const response = await fetch(
      `https://product.gelatoapis.com/v3/catalogs/${catalogUid}/products:search`,
      {
        method: "POST",
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ limit: 100, offset }),
      },
    );
    const json = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(json));
    const batch = json.products ?? [];
    products.push(...batch);
    if (batch.length < 100) break;
    offset += 100;
  }
  return products;
}

function parseUnified(format) {
  const m = format.match(
    /^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)-inch-(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)-mm$/i,
  );
  if (!m) return null;
  return {
    inchKey: `${m[1]}x${m[2]}`,
    label: `${m[1]}x${m[2]} in`,
    widthMm: Number(m[3]),
    heightMm: Number(m[4]),
  };
}

async function main() {
  const outDir = resolve("gelato-bulk/wall-art/canvas-template");
  await mkdir(outDir, { recursive: true });

  const products = await searchAll("canvas");
  const rows = [];

  for (const product of products) {
    const a = product.attributes ?? {};
    const thicknessKey = String(a.CanvasThicknessType ?? "");
    const thicknessLabel = THICKNESS[thicknessKey];
    if (!thicknessLabel) continue;
    if (a.Orientation !== "hor" && a.Orientation !== "ver") continue;

    const unified = String(a.UnifiedCanvasFormat ?? "");
    const parsed = parseUnified(unified);
    if (!parsed) continue;
    if (!PREFERRED_INCH.has(parsed.inchKey)) continue;

    const orientation =
      a.Orientation === "hor" ? "Landscape" : "Portrait";

    // Square: one orientation only
    if (parsed.widthMm === parsed.heightMm && a.Orientation === "ver") {
      continue;
    }

    rows.push({
      variantName: `${parsed.label} - ${orientation} - ${thicknessLabel}`,
      size: parsed.label,
      orientation,
      thickness: thicknessLabel,
      thicknessUid: thicknessKey,
      productUid: product.productUid,
      unifiedFormat: unified,
    });
  }

  rows.sort((a, b) => {
    const [aw, ah] = a.size.replace(" in", "").split("x").map(Number);
    const [bw, bh] = b.size.replace(" in", "").split("x").map(Number);
    return (
      aw * ah - bw * bh ||
      a.orientation.localeCompare(b.orientation) ||
      a.thickness.localeCompare(b.thickness)
    );
  });

  const header = [
    "Variant Name",
    "Size",
    "Orientation",
    "Thickness",
    "Product UID",
    "Unified Format",
    "Thickness UID",
    "Shopify Option 1",
    "Shopify Option 1 Value",
    "Shopify Option 2",
    "Shopify Option 2 Value",
    "Shopify Option 3",
    "Shopify Option 3 Value",
  ];

  const csv = [
    header.join(","),
    ...rows.map((r) =>
      [
        r.variantName,
        r.size,
        r.orientation,
        r.thickness,
        r.productUid,
        r.unifiedFormat,
        r.thicknessUid,
        "Size",
        r.size,
        "Orientation",
        r.orientation,
        "Thickness",
        r.thickness,
      ]
        .map(csvEscape)
        .join(","),
    ),
  ].join("\n");

  await writeFile(resolve(outDir, "canvas-slim-thick-variants.csv"), csv + "\n");
  // Keep legacy filename as alias of full pack
  await writeFile(resolve(outDir, "canvas-slim-variants.csv"), csv + "\n");

  const slimCount = rows.filter((r) => r.thickness === "Slim").length;
  const thickCount = rows.filter((r) => r.thickness === "Thick").length;

  const guide = `# Pixora canvas template — Slim + Thick

Gelato has **no API to create Personalization templates**. Build this in the
Gelato Shopify app using the variant list below.

## Spec

| Attribute | Value |
|-----------|--------|
| Product | Canvas |
| Thickness | **Slim** (\`wood-fsc-slim\`) **and** **Thick** (\`wood-fsc-thick\`) |
| Variants | **${rows.length}** (${slimCount} slim + ${thickCount} thick) |
| Shopify options | Size · Orientation · Thickness |

## File

\`canvas-slim-thick-variants.csv\` — Size, Orientation, Thickness, Product UID

## Build in Gelato (pixora-3393)

1. Apps → **Gelato** → Create product → **Canvas**
2. Enable **Slim** and **Thick** frame depths
3. Add sizes from the CSV (prefer unified inch/mm formats)
4. For each size add Landscape / Portrait (squares: one only)
5. Personalization Studio → **In-page** → personalized **Image** layer ON
6. Title: **Personalized Canvas Print**
7. Publish to Shopify → collections \`canvas-prints\` + \`wall-art\`

## Preferred sizes

${[...PREFERRED_INCH].map((s) => `- ${s} in`).join("\n")}

## Note

Your Gelato API key may be linked to other Shopify stores — create this product
in the **pixora-3393** Gelato app UI, not via API, until that store is connected
to the same Gelato account.
`;

  await writeFile(resolve(outDir, "README.md"), guide);
  console.log(
    `Wrote ${rows.length} variants (${slimCount} slim, ${thickCount} thick) → ${outDir}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
