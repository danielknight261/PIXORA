# Publish Snapp Daddy products via Gelato → Shopify

Use this after the store is connected and the Snapp Daddy theme is pushed.

## Collections (create in Shopify Admin)

Create these collections (handles match theme header / homepage). Assign each Gelato product to its subtype **and** the parent where noted.

**Parents:** `wall-art`, `home-gifts`, `photo-printing`, `occasions`

**Wall art:** `canvas-prints`, `framed-canvas`, `framed-prints`, `aluminum-prints`, `acrylic-prints`, `posters`, `posters-with-hangers`, `foam-prints`, `wood-prints`

**Photo printing:** `photo-prints`, `photo-enlargements` (+ posters)

**Home & gifts:** `mugs`, `cushions`, `photo-blocks`, `magnets`, `jigsaws`

**Occasions:** `cards`, `calendars`, `photo-books`

## Smoke-test SKUs (create first)

| Product | Gelato catalog | Personalization |
|---|---|---|
| Slim canvas (e.g. 12×12 or 16×20) | `canvas` / wood-fsc-slim | Image layer + live mockup |
| Ceramic mug (e.g. 11oz white) | `mugs` | Image layer + live mockup |

Steps:

1. Shopify Admin → Apps → **Gelato**
2. Create product → enable personalization (image upload)
3. Publish to Shopify
4. Add to the matching collection
5. Open the storefront product page → Personalize → upload photo → confirm Gelato mockup
6. Test checkout

## Expand

Publish remaining slim-wrap canvas sizes/orientations and all mug size/colour variants from Gelato (same catalog previously imported into Pixora’s DB). Do **not** use `scripts/import-gelato-canvas-mugs.mjs` or admin “Import canvas & mugs” for the Shopify storefront.

## Bulk CSV (wall art)

Generated Gelato **Create products from template** CSVs live in [`gelato-bulk/wall-art/`](../gelato-bulk/wall-art/README.md).

Regenerate:

```bash
node --env-file=apps/admin/.env.local scripts/gelato-wall-art-bulk-csv.mjs
```

Upload **one CSV per product type** against a matching Gelato template (Personalization ON). Start with `wall-art-master-one-per-type.csv` or `canvas-prints-create-from-template.csv`.

### Canvas template (manual in Gelato app)

Gelato has **no API to create Personalization templates**. Follow
[`gelato-bulk/wall-art/canvas-template/README.md`](../gelato-bulk/wall-art/canvas-template/README.md)
and use \`canvas-slim-thick-variants.csv\` for Size + Orientation + Thickness (slim & thick) + Product UIDs.

```bash
node --env-file=apps/admin/.env.local scripts/gelato-canvas-template-plan.mjs
```

Ensure the Gelato account is connected to **pixora-3393** (API key currently lists other Shopify stores).
