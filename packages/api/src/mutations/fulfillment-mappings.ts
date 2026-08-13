import type { FulfillmentMapping } from "@pixora/shared";
import { mapFulfillmentMapping } from "../mappers/fulfillment";
import type { PixoraSupabaseClient } from "../types/client";
import type { Database } from "../types/database";

type UpsertFulfillmentMappingInput = {
  variantId: string;
  provider: Database["public"]["Tables"]["fulfillment_mappings"]["Insert"]["provider"];
  providerProductId: string;
  providerVariantId: string;
  printAreaKey?: string;
  rawPayload?: Record<string, unknown>;
};

export async function upsertFulfillmentMapping(
  supabase: PixoraSupabaseClient,
  input: UpsertFulfillmentMappingInput,
): Promise<FulfillmentMapping> {
  const { data, error } = await supabase
    .from("fulfillment_mappings")
    .upsert(
      {
        variant_id: input.variantId,
        provider: input.provider,
        provider_product_id: input.providerProductId,
        provider_variant_id: input.providerVariantId,
        print_area_key: input.printAreaKey ?? "default",
        raw_payload: input.rawPayload ?? {},
        synced_at: new Date().toISOString(),
      },
      { onConflict: "variant_id,provider,print_area_key" },
    )
    .select(
      `
      id,
      variant_id,
      provider,
      provider_product_id,
      provider_variant_id,
      print_area_key,
      raw_payload,
      synced_at,
      created_at,
      updated_at
    `,
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapFulfillmentMapping(data);
}
