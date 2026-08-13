import type { GelatoClient } from "@pixora/providers";
import {
  importGelatoCanvasAndMugs,
  type GelatoImportResult,
} from "./gelato-catalog-import";
import type { PixoraSupabaseClient } from "../types/client";

export type GelatoSyncError = {
  productSlug: string;
  variantSlug: string;
  message: string;
};

export type GelatoSyncMapping = {
  productSlug: string;
  variantSlug: string;
  productUid: string;
  catalogUid: string;
};

export type GelatoSyncResult = {
  synced: number;
  skipped: number;
  errors: GelatoSyncError[];
  mappings: GelatoSyncMapping[];
  catalogsListed?: number;
  canvasVariants?: number;
  mugVariants?: number;
};

/**
 * Full catalog import for canvas (slim wrap) + all mugs.
 * Creates print templates, variants, and fulfillment mappings.
 */
export async function syncGelatoCatalog(
  supabase: PixoraSupabaseClient,
  gelato: GelatoClient,
  _options?: { productSlugs?: string[] },
): Promise<GelatoSyncResult> {
  const catalogs = await gelato.catalog.listCatalogs();
  const imported: GelatoImportResult = await importGelatoCanvasAndMugs(
    supabase,
    gelato,
  );

  const { data: mappingRows } = await supabase
    .from("fulfillment_mappings")
    .select(
      `
      provider_product_id,
      product_variants!inner (
        slug,
        products!inner ( slug )
      )
    `,
    )
    .eq("provider", "gelato");

  const mappings: GelatoSyncMapping[] = (mappingRows ?? []).flatMap((row) => {
    const variantRaw = row.product_variants;
    const variant = Array.isArray(variantRaw) ? variantRaw[0] : variantRaw;
    if (!variant) return [];

    const productRaw = variant.products;
    const product = Array.isArray(productRaw) ? productRaw[0] : productRaw;
    if (!product) return [];

    const productSlug = product.slug as string;
    const catalogUid =
      productSlug === "mugs-standard"
        ? "mugs"
        : productSlug === "canvas-prints-standard"
          ? "canvas"
          : "unknown";

    return [
      {
        productSlug,
        variantSlug: variant.slug as string,
        productUid: row.provider_product_id as string,
        catalogUid,
      },
    ];
  });

  return {
    synced: imported.synced,
    skipped: 0,
    errors: imported.errors.map((error) => ({
      productSlug: error.catalog === "mugs" ? "mugs-standard" : "canvas-prints-standard",
      variantSlug: error.variantSlug,
      message: error.message,
    })),
    mappings,
    catalogsListed: catalogs.length,
    canvasVariants: imported.canvasVariants,
    mugVariants: imported.mugVariants,
  };
}

export async function listGelatoCatalogs(gelato: GelatoClient) {
  return gelato.catalog.listCatalogs();
}
