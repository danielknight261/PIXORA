import { NextResponse } from "next/server";
import { createServerClient, upsertUserProfile } from "@pixora/api";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      try {
        await upsertUserProfile(
          supabase,
          data.user.id,
          data.user.email ?? "",
          (data.user.user_metadata?.full_name as string | undefined) ??
            (data.user.user_metadata?.name as string | undefined),
        );
      } catch {
        // Profile is created by handle_new_user trigger; upsert is best-effort sync.
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
