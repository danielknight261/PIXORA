import { NextResponse } from "next/server";
import { createStripeClient, verifyStripeWebhook } from "@pixora/providers";

export async function POST(request: Request) {
  const stripe = createStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();
  const event = verifyStripeWebhook(stripe, payload, signature);

  if (!event) {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  return NextResponse.json({ received: true, type: event.type });
}
