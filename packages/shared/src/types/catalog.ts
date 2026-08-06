import type { Product } from "./product";

/** Product with category slug for SEO-friendly URLs (/products/{categorySlug}/{productSlug}) */
export type CatalogProduct = Product & {
  categorySlug: string;
  featured?: boolean;
};

export const productSortOptions = [
  "featured",
  "name-asc",
  "name-desc",
  "price-asc",
  "price-desc",
  "newest",
] as const;

export type ProductSortOption = (typeof productSortOptions)[number];

export type CatalogQuery = {
  q?: string;
  category?: string;
  sort?: ProductSortOption;
};
