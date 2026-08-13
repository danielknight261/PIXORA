import type { FulfillmentMapping } from "@pixora/shared";
import { mapFulfillmentMapping } from "../mappers/fulfillment";
import type { PixoraSupabaseClient } from "../types/client";

const fulfillmentSelect = `
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
`;

export async function getFulfillmentMappingsByVariantId(
  supabase: PixoraSupabaseClient,
  variantId: string,
): Promise<FulfillmentMapping[]> {
  const { data, error } = await supabase
    .from("fulfillment_mappings")
    .select(fulfillmentSelect)
    .eq("variant_id", variantId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapFulfillmentMapping);
}

export async function getGelatoMappingByVariantId(
  supabase: PixoraSupabaseClient,
  variantId: string,
): Promise<FulfillmentMapping | null> {
  const { data, error } = await supabase
    .from("fulfillment_mappings")
    .select(fulfillmentSelect)
    .eq("variant_id", variantId)
    .eq("provider", "gelato")
    .eq("print_area_key", "default")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapFulfillmentMapping(data) : null;
}

export async function listGelatoFulfillmentMappings(
  supabase: PixoraSupabaseClient,
) {
  const { data, error } = await supabase
    .from("fulfillment_mappings")
    .select(
      `
      ${fulfillmentSelect},
      product_variants!inner (
        slug,
        name,
        products!inner ( slug, name )
      )
    `,
    )
    .eq("provider", "gelato")
    .order("synced_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const variantRaw = row.product_variants;
    const variant = (Array.isArray(variantRaw) ? variantRaw[0] : variantRaw) as {
      slug: string;
      name: string;
      products: { slug: string; name: string } | { slug: string; name: string }[];
    };
    const productRaw = variant.products;
    const product = Array.isArray(productRaw) ? productRaw[0]! : productRaw;

    return {
      mapping: mapFulfillmentMapping(row),
      productSlug: product.slug,
      productName: product.name,
      variantSlug: variant.slug,
      variantName: variant.name,
    };
  });
}
