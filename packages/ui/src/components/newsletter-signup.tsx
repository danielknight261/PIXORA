"use client";

import { useState } from "react";
import { Button } from "@pixora/ui/components/ui/button";
import { Input } from "@pixora/ui/components/ui/input";
import { cn } from "@pixora/ui/lib/utils";

export type NewsletterSignupProps = {
  title?: string;
  description?: string;
  onSubmit?: (email: string) => void | Promise<void>;
  className?: string;
};

export function NewsletterSignup({
  title = "Get inspired",
  description = "Occasion ideas, new products, and exclusive offers — straight to your inbox.",
  onSubmit,
  className,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email) return;
    await onSubmit?.(email);
    setStatus("success");
    setEmail("");
  }

  return (
    <div
      className={cn(
        "rounded-3xl border bg-gradient-to-br from-primary/10 via-art-violet/10 to-art-rose/10 p-8 ring-1 ring-art-violet/20 md:p-10",
        className,
      )}
    >
      <h3 className="font-heading text-xl font-semibold">{title}</h3>
      <p className="text-body mt-2 text-muted-foreground">{description}</p>
      {status === "success" ? (
        <p className="mt-6 text-sm font-medium text-success">
          Thanks — you&apos;re on the list.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
        >
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 bg-background"
          />
          <Button type="submit" variant="premium">
            Subscribe
          </Button>
        </form>
      )}
    </div>
  );
}
