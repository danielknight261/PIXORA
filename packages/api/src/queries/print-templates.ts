import type { ProductWithTemplate } from "@pixora/shared";
import { mapProduct } from "../mappers/rows";
import {
  mapPrintTemplate,
  mapProductVariant,
  type PrintTemplateRow,
  type ProductVariantRow,
} from "../mappers/print-templates";
import { getProductBySlug } from "./products";
import type { PixoraSupabaseClient } from "../types/client";

const printTemplateSelect = `
  id,
  product_id,
  name,
  surface_key,
  width_px,
  height_px,
  dpi,
  bleed_px,
  safe_zone_inset_px,
  mockup_image_url,
  mockup_print_area,
  metadata,
  created_at,
  updated_at
`;

const variantSelect = `
  id,
  product_id,
  print_template_id,
  slug,
  name,
  price_delta,
  sort_order,
  active,
  created_at,
  updated_at
`;

export async function getPrintTemplateById(
  supabase: PixoraSupabaseClient,
  templateId: string,
) {
  const { data, error } = await supabase
    .from("print_templates")
    .select(printTemplateSelect)
    .eq("id", templateId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapPrintTemplate(data as PrintTemplateRow) : null;
}

export async function getPrintTemplateByProductId(
  supabase: PixoraSupabaseClient,
  productId: string,
  surfaceKey = "front",
) {
  const { data, error } = await supabase
    .from("print_templates")
    .select(printTemplateSelect)
    .eq("product_id", productId)
    .eq("surface_key", surfaceKey)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapPrintTemplate(data as PrintTemplateRow) : null;
}

export async function getProductVariantsByProductId(
  supabase: PixoraSupabaseClient,
  productId: string,
) {
  const { data, error } = await supabase
    .from("product_variants")
    .select(variantSelect)
    .eq("product_id", productId)
    .eq("active", true)
    .order("sort_order")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) =>
    mapProductVariant(row as ProductVariantRow),
  );
}

export async function getProductWithTemplateBySlug(
  supabase: PixoraSupabaseClient,
  slug: string,
  variantSlug?: string,
): Promise<ProductWithTemplate | null> {
  const product = await getProductBySlug(supabase, slug);
  if (!product) {
    return null;
  }

  const variants = await getProductVariantsByProductId(supabase, product.id);
  const defaultVariant = variants[0] ?? null;
  const selectedVariant =
    (variantSlug
      ? variants.find((variant) => variant.slug === variantSlug)
      : null) ?? defaultVariant;

  const printTemplate = selectedVariant
    ? await getPrintTemplateById(supabase, selectedVariant.printTemplateId)
    : await getPrintTemplateByProductId(supabase, product.id);

  return {
    product,
    printTemplate,
    variants,
    defaultVariant: selectedVariant,
  };
}

export async function getPrintTemplateByProductSlug(
  supabase: PixoraSupabaseClient,
  productSlug: string,
) {
  const product = await getProductBySlug(supabase, productSlug);
  if (!product) {
    return null;
  }

  return getPrintTemplateByProductId(supabase, product.id);
}
