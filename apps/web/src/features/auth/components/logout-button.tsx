"use client";

import { useTransition } from "react";
import { Button } from "@pixora/ui/components/ui/button";
import { logoutAction } from "../actions";

type LogoutButtonProps = {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
};

export function LogoutButton({
  variant = "outline",
  size = "default",
}: LogoutButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={pending}
      onClick={() => startTransition(() => logoutAction())}
    >
      {pending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
