import type { FulfillmentMapping, FulfillmentProvider } from "@pixora/shared";
import type { Database } from "../types/database";

export type FulfillmentMappingRow =
  Database["public"]["Tables"]["fulfillment_mappings"]["Row"];

export function mapFulfillmentMapping(
  row: FulfillmentMappingRow,
): FulfillmentMapping {
  return {
    id: row.id,
    variantId: row.variant_id,
    provider: row.provider as FulfillmentProvider,
    providerProductId: row.provider_product_id,
    providerVariantId: row.provider_variant_id,
    printAreaKey: row.print_area_key,
    rawPayload:
      typeof row.raw_payload === "object" && row.raw_payload !== null
        ? (row.raw_payload as Record<string, unknown>)
        : {},
    syncedAt: row.synced_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
