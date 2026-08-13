"use server";

/**
 * @deprecated Pixora custom-store Gelato sync is retired.
 * Publish products via the Gelato Shopify app instead.
 * See docs/shopify-gelato-migration.md
 */
export async function syncGelatoCatalogAction() {
  throw new Error(
    "Pixora Gelato catalog sync is retired. Publish products with the Gelato Shopify app. See docs/shopify-gelato-migration.md",
  );
}

export async function getGelatoSyncStatus() {
  return {
    gelatoConfigured: false,
    retired: true as const,
    message:
      "Use Shopify + Gelato Personalization Studio. See docs/shopify-gelato-migration.md",
    mappings: [] as Array<{
      productSlug: string;
      productName: string;
      variantSlug: string;
      productUid: string;
      syncedAt: string;
    }>,
  };
}
