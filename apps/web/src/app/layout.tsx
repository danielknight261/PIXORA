import type { Metadata } from "next";
import { env } from "@/env";
import "./globals.css";

export const metadata: Metadata = {
  title: "SnapzDaddy has moved",
  description: "Shop SnapzDaddy on Shopify with Gelato personalization.",
  robots: { index: false, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const storeUrl = env.NEXT_PUBLIC_SHOPIFY_STORE_URL;

  return (
    <html lang="en">
      <head>
        <meta httpEquiv="refresh" content={`0;url=${storeUrl}`} />
        <link rel="canonical" href={storeUrl} />
      </head>
      <body>{children}</body>
    </html>
  );
}
