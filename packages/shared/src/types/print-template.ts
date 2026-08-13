export type MockupPrintArea = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};

export type PrintTemplate = {
  id: string;
  productId: string;
  name: string;
  surfaceKey: string;
  widthPx: number;
  heightPx: number;
  dpi: number;
  bleedPx: number;
  safeZoneInsetPx: number;
  mockupImageUrl: string | null;
  mockupPrintArea: MockupPrintArea | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type ProductVariant = {
  id: string;
  productId: string;
  printTemplateId: string;
  slug: string;
  name: string;
  priceDelta: number;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FulfillmentProvider = "gelato" | "prodigi" | "printful";

export type FulfillmentMapping = {
  id: string;
  variantId: string;
  provider: FulfillmentProvider;
  providerProductId: string;
  providerVariantId: string;
  printAreaKey: string;
  rawPayload: Record<string, unknown>;
  syncedAt: string;
  createdAt: string;
  updatedAt: string;
};

import type { Product } from "./product";

export type ProductWithTemplate = {
  product: Product;
  printTemplate: PrintTemplate | null;
  variants: ProductVariant[];
  defaultVariant: ProductVariant | null;
};
