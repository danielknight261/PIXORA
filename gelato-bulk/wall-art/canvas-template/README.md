# Pixora canvas template — Slim + Thick

Gelato has **no API to create Personalization templates**. Build this in the
Gelato Shopify app using the variant list below.

## Spec

| Attribute | Value |
|-----------|--------|
| Product | Canvas |
| Thickness | **Slim** (`wood-fsc-slim`) **and** **Thick** (`wood-fsc-thick`) |
| Variants | **44** (22 slim + 22 thick) |
| Shopify options | Size · Orientation · Thickness |

## File

`canvas-slim-thick-variants.csv` — Size, Orientation, Thickness, Product UID

## Build in Gelato (pixora-3393)

1. Apps → **Gelato** → Create product → **Canvas**
2. Enable **Slim** and **Thick** frame depths
3. Add sizes from the CSV (prefer unified inch/mm formats)
4. For each size add Landscape / Portrait (squares: one only)
5. Personalization Studio → **In-page** → personalized **Image** layer ON
6. Title: **Personalized Canvas Print**
7. Publish to Shopify → collections `canvas-prints` + `wall-art`

## Preferred sizes

- 8x10 in
- 8x12 in
- 11x14 in
- 12x12 in
- 12x16 in
- 12x18 in
- 14x14 in
- 16x16 in
- 16x20 in
- 18x24 in
- 20x20 in
- 20x30 in
- 24x24 in
- 24x36 in

## Note

Your Gelato API key may be linked to other Shopify stores — create this product
in the **pixora-3393** Gelato app UI, not via API, until that store is connected
to the same Gelato account.
