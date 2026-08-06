import type { Design } from "@pixora/shared";
import type { PixoraSupabaseClient } from "../types/client";

export async function getDesigns(
  supabase: PixoraSupabaseClient,
  userId: string,
): Promise<Design[]> {
  const { data, error } = await supabase
    .from("designs")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    name: row.name,
    canvasData: (row.canvas_data as Record<string, unknown>) ?? {},
    previewUrl: row.preview_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getDesignById(
  supabase: PixoraSupabaseClient,
  designId: string,
): Promise<Design | null> {
  const { data, error } = await supabase
    .from("designs")
    .select("*")
    .eq("id", designId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return {
    id: data.id,
    userId: data.user_id,
    productId: data.product_id,
    name: data.name,
    canvasData: (data.canvas_data as Record<string, unknown>) ?? {},
    previewUrl: data.preview_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
