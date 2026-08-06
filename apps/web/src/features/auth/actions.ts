"use server";

import { redirect } from "next/navigation";
import {
  createServerClient,
  isSupabaseConfigured,
} from "@pixora/api";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  validate,
} from "@pixora/shared";
import { env } from "@/env";

export type AuthActionState = {
  error?: string;
  success?: string;
};

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: "Authentication is not configured." };
  }

  const parsed = validate(loginSchema, {
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const firstError = Object.values(parsed.errors)[0]?.[0];
    return { error: firstError ?? "Invalid form data." };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  const redirectTo = formData.get("redirectTo");
  redirect(typeof redirectTo === "string" && redirectTo ? redirectTo : "/");
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: "Authentication is not configured." };
  }

  const parsed = validate(registerSchema, {
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    fullName: formData.get("fullName"),
  });

  if (!parsed.success) {
    const firstError = Object.values(parsed.errors)[0]?.[0];
    return { error: firstError ?? "Invalid form data." };
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
      emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    redirect("/");
  }

  return {
    success:
      "Account created. Check your email to confirm your address, then sign in.",
  };
}

export async function forgotPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: "Authentication is not configured." };
  }

  const parsed = validate(forgotPasswordSchema, {
    email: formData.get("email"),
  });

  if (!parsed.success) {
    const firstError = Object.values(parsed.errors)[0]?.[0];
    return { error: firstError ?? "Invalid form data." };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/login`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: "If an account exists for that email, a reset link has been sent.",
  };
}

export async function logoutAction() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
