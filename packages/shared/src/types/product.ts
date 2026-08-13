import type { ProductCategory } from "../constants/products";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  categoryId: string;
  category: ProductCategory | string;
  categorySlug?: string | null;
  basePrice: number;
  imageUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Design = {
  id: string;
  userId: string;
  productId: string;
  name: string;
  canvasData: Record<string, unknown>;
  previewUrl: string | null;
  uploadId: string | null;
  createdAt: string;
  updatedAt: string;
};
