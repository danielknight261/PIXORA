import type { Product } from "@pixora/shared";
import { mapProduct } from "../mappers/rows";
import type { PixoraSupabaseClient } from "../types/client";

const productSelect = `
  id,
  category_id,
  slug,
  name,
  description,
  base_price,
  image_url,
  active,
  created_at,
  updated_at,
  categories ( name, slug )
`;

export async function getProducts(
  supabase: PixoraSupabaseClient,
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("active", true)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapProduct(row));
}

export async function getProductBySlug(
  supabase: PixoraSupabaseClient,
  slug: string,
): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return mapProduct(data);
}

export async function getProductsByCategorySlug(
  supabase: PixoraSupabaseClient,
  categorySlug: string,
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`${productSelect}, categories!inner ( slug )`)
    .eq("active", true)
    .eq("categories.slug", categorySlug)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapProduct(row));
}
