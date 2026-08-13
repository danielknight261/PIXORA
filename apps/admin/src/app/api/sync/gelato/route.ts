import { NextResponse } from "next/server";

/** @deprecated Use Gelato Shopify app — Pixora custom sync is retired. */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Pixora Gelato catalog sync is retired. Publish via the Gelato Shopify app. See docs/shopify-gelato-migration.md",
    },
    { status: 410 },
  );
}
