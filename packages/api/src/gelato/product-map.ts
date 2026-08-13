/**
 * Legacy pinned Gelato UIDs (starter set).
 * Prefer `importGelatoCanvasAndMugs` / admin "Import canvas & mugs" which
 * pulls the full slim-wrap canvas + mug catalogs into DB mappings.
 */
export type GelatoVariantMapEntry = {
  catalogUid: string;
  productUid: string;
  printFileType?: string;
};

/** Key format: `{productSlug}:{variantSlug}` */
export const GELATO_VARIANT_MAP: Record<string, GelatoVariantMapEntry> = {
  // Canvas — wood slim wrap, horizontal
  "canvas-prints-standard:12x12": {
    catalogUid: "canvas",
    productUid:
      "canvas_12x12-inch-300x300-mm_canvas_wood-fsc-slim_4-0_hor",
  },
  "canvas-prints-standard:11x14": {
    catalogUid: "canvas",
    productUid:
      "canvas_11x14-inch-270x350-mm_canvas_wood-fsc-slim_4-0_hor",
  },
  "canvas-prints-standard:16x20": {
    catalogUid: "canvas",
    productUid:
      "canvas_16x20-inch-400x500-mm_canvas_wood-fsc-slim_4-0_hor",
  },

  // Mugs — full-wrap ceramic
  "mugs-standard:11oz-white": {
    catalogUid: "mugs",
    productUid: "mug_product_msz_11-oz_mmat_ceramic-white_cl_4-0",
  },
  "mugs-standard:15oz-white": {
    catalogUid: "mugs",
    productUid: "mug_product_msz_15-oz_mmat_ceramic-white_cl_4-0",
  },
  "mugs-standard:11oz-black": {
    catalogUid: "mugs",
    productUid: "mug_product_msz_11-oz_mmat_ceramic-black_cl_4-0",
  },

  // Photo prints — coated silk, horizontal (Gelato posters catalog)
  "photo-prints-standard:5x7": {
    catalogUid: "posters",
    productUid:
      "cards_pf_140x180-mm_pt_130-lb-cover-coated-silk_cl_4-0_hor",
  },
  "photo-prints-standard:8x10": {
    catalogUid: "posters",
    productUid:
      "cards_pf_210x279-mm_pt_250-gsm-coated-silk_cl_4-0_hor",
  },
};

export const GELATO_PRODUCT_SLUGS = [
  "canvas-prints-standard",
  "mugs-standard",
  "photo-prints-standard",
] as const;

export function getGelatoMapKey(productSlug: string, variantSlug: string) {
  return `${productSlug}:${variantSlug}`;
}

export function getGelatoMapForVariant(
  productSlug: string,
  variantSlug: string,
): GelatoVariantMapEntry | null {
  return GELATO_VARIANT_MAP[getGelatoMapKey(productSlug, variantSlug)] ?? null;
}

export function isGelatoMappedProduct(productSlug: string) {
  return GELATO_PRODUCT_SLUGS.includes(
    productSlug as (typeof GELATO_PRODUCT_SLUGS)[number],
  );
}

/** @deprecated Use getGelatoMapForVariant — kept for admin display */
export const GELATO_PRODUCT_MAP = Object.fromEntries(
  GELATO_PRODUCT_SLUGS.map((slug) => [slug, { catalogUid: "see variants" }]),
);

export function getGelatoMapForProduct(productSlug: string) {
  return isGelatoMappedProduct(productSlug) ? { catalogUid: "variants" } : null;
}

export type GelatoProductMapEntry = GelatoVariantMapEntry;
