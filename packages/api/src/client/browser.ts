import { createBrowserClient as createClient } from "@supabase/ssr";
import type { Database } from "../types/database";
import type { PixoraSupabaseClient } from "../types/client";
import { env, isSupabaseConfigured } from "../env";

export function createBrowserClient(): PixoraSupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  ) as unknown as PixoraSupabaseClient;
}
