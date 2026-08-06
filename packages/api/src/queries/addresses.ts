import type { Address } from "@pixora/shared";
import { mapAddress } from "../mappers/rows";
import type { PixoraSupabaseClient } from "../types/client";

export async function getAddresses(
  supabase: PixoraSupabaseClient,
  userId: string,
): Promise<Address[]> {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapAddress(row));
}

export async function getDefaultAddress(
  supabase: PixoraSupabaseClient,
  userId: string,
): Promise<Address | null> {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapAddress(data) : null;
}
