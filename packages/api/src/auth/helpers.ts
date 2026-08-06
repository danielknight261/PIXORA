import type { User } from "@supabase/supabase-js";
import type { PixoraSupabaseClient } from "../types/client";

export async function getAuthUser(
  supabase: PixoraSupabaseClient,
): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}

export async function signOut(supabase: PixoraSupabaseClient) {
  return supabase.auth.signOut();
}

export async function updateProfile(
  supabase: PixoraSupabaseClient,
  userId: string,
  updates: { fullName?: string; avatarUrl?: string },
) {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: updates.fullName,
      avatar_url: updates.avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
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
