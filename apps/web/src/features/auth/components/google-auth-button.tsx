"use client";

import { useState } from "react";
import { createBrowserClient } from "@pixora/api/client/browser";
import { Button } from "@pixora/ui/components/ui/button";

type GoogleAuthButtonProps = {
  redirectTo?: string;
};

export function GoogleAuthButton({ redirectTo = "/" }: GoogleAuthButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setPending(true);
    setError(null);

    try {
      const supabase = createBrowserClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setPending(false);
      }
    } catch {
      setError("Google sign-in is unavailable. Check Supabase configuration.");
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={pending}
      >
        {pending ? "Redirecting..." : "Continue with Google"}
      </Button>
      {error ? (
        <p className="text-center text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
