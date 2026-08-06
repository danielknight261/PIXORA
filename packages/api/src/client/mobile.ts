import { createClient } from "@supabase/supabase-js";

export type MobileSupabaseConfig = {
  url: string;
  anonKey: string;
};

export function createMobileClient(config: MobileSupabaseConfig) {
  return createClient(config.url, config.anonKey, {
    auth: {
      storage: undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}
