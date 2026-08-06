import type { UserProfile } from "@pixora/shared";
import type { PixoraSupabaseClient } from "../types/client";

export async function getUserProfile(
  supabase: PixoraSupabaseClient,
  userId: string,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
  };
}

export async function upsertUserProfile(
  supabase: PixoraSupabaseClient,
  userId: string,
  email: string,
  fullName?: string | null,
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        email,
        full_name: fullName ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    .select("id, email, full_name, avatar_url")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
  };
}
