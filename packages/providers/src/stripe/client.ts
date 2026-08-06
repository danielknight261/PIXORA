import Stripe from "stripe";
import { env } from "../env";

export function createStripeClient(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) {
    return null;
  }

  return new Stripe(env.STRIPE_SECRET_KEY, {
    typescript: true,
  });
}

export function getStripePublishableKey(): string | null {
  return env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null;
}
