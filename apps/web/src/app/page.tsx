import { env } from "@/env";

export default function HomePage() {
  const storeUrl = env.NEXT_PUBLIC_SHOPIFY_STORE_URL;

  return (
    <main className="moved">
      <h1>SnapzDaddy has moved</h1>
      <p>
        Our shop and personalization experience now live on Shopify with Gelato
        product mockups.
      </p>
      <p>
        <a href={storeUrl}>Continue to the store</a>
      </p>
    </main>
  );
}
