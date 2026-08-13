# Gelato wall-art bulk CSVs

Generated for Pixora header Wall art dropdown. Maps to Gelato catalogs.

## Important

Gelato **Create multiple products at once** uses **one saved template per upload**.
Upload each `*-create-from-template.csv` against a template of the **same product type**
(e.g. canvas CSV → canvas template with Personalization image layer ON).

Do **not** upload all types in one go from a single canvas template.

## Files

| File | Use |
|------|-----|
| `wall-art-master-one-per-type.csv` | 9 rows — one Shopify product per wall-art type (still upload per matching template) |
| `{handle}-create-from-template.csv` | All Gelato UIDs for that type as separate products (large) |
| `{handle}-uids-reference.csv` | Reference: UID + attributes for pricing / collection mapping |

## Columns (Gelato create-from-template)

Product Title, Product Description, Product UID, Print File URL, Should Publish Images?

`Print File URL` is a blank placeholder for personalization. Replace with your own hosted blank PNG if Gelato rejects the Wikimedia 1×1.

## After upload

1. Select **Publish products to external store** (Shopify).
2. In Shopify, assign products to collections matching the handle (`canvas-prints`, `framed-canvas`, …) and parent `wall-art`.

## Catalogue map

- **Canvas prints** → collection `canvas-prints` → Gelato `canvas`
- **Framed canvas** → collection `framed-canvas` → Gelato `framed-canvas`
- **Framed prints** → collection `framed-prints` → Gelato `framed-posters`
- **Metal / aluminium prints** → collection `aluminum-prints` → Gelato `metallic`
- **Acrylic prints** → collection `acrylic-prints` → Gelato `acrylic`
- **Posters** → collection `posters` → Gelato `posters`
- **Posters with hangers** → collection `posters-with-hangers` → Gelato `poster-hangers`
- **Foam prints** → collection `foam-prints` → Gelato `foam-print-product`
- **Wood prints** → collection `wood-prints` → Gelato `wood-prints`
