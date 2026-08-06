"use client";

import { useState } from "react";
import { PromoBanner } from "@pixora/ui/components/promo-banner";

export function PromoBannerShell() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <PromoBanner
      message="Free delivery on orders over £35 this month."
      href="/products"
      linkLabel="Browse products"
      dismissible
      onDismiss={() => setVisible(false)}
    />
  );
}
