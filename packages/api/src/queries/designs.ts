import type { Design } from "@pixora/shared";
import { mapDesign } from "../mappers/print-templates";
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

  return (data ?? []).map((row) => mapDesign(row));
}

export async function getDesignById(
  supabase: PixoraSupabaseClient,
  designId: string,
  userId?: string,
): Promise<Design | null> {
  let query = supabase.from("designs").select("*").eq("id", designId);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return mapDesign(data);
}

export async function getDesignByIdForUser(
  supabase: PixoraSupabaseClient,
  designId: string,
  userId: string,
): Promise<Design | null> {
  return getDesignById(supabase, designId, userId);
}

