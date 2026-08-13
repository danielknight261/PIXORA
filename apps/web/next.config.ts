import type { NextConfig } from "next";

const shopifyStoreUrl =
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL ?? "https://pixora.myshopify.com";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        destination: shopifyStoreUrl,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
