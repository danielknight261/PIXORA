import type Stripe from "stripe";
import { env } from "../env";

export function verifyStripeWebhook(
  stripe: Stripe,
  payload: string | Buffer,
  signature: string,
): Stripe.Event | null {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return null;
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    env.STRIPE_WEBHOOK_SECRET,
  );
}
