import type { CatalogProduct, CatalogQuery, ProductSortOption } from "../types/catalog";

export function filterCatalogProducts(
  products: CatalogProduct[],
  query: Pick<CatalogQuery, "q" | "category">,
): CatalogProduct[] {
  let result = products;

  if (query.category) {
    result = result.filter((p) => p.categorySlug === query.category);
  }

  if (query.q?.trim()) {
    const term = query.q.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term),
    );
  }

  return result;
}

export function sortCatalogProducts(
  products: CatalogProduct[],
  sort: ProductSortOption = "featured",
): CatalogProduct[] {
  const copy = [...products];

  switch (sort) {
    case "name-asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return copy.sort((a, b) => b.name.localeCompare(a.name));
    case "price-asc":
      return copy.sort((a, b) => a.basePrice - b.basePrice);
    case "price-desc":
      return copy.sort((a, b) => b.basePrice - a.basePrice);
    case "newest":
      return copy.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "featured":
    default:
      return copy.sort((a, b) => {
        const aFeatured = a.featured ? 1 : 0;
        const bFeatured = b.featured ? 1 : 0;
        if (bFeatured !== aFeatured) return bFeatured - aFeatured;
        return a.name.localeCompare(b.name);
      });
  }
}

export function queryCatalogProducts(
  products: CatalogProduct[],
  query: CatalogQuery,
): CatalogProduct[] {
  const filtered = filterCatalogProducts(products, query);
  return sortCatalogProducts(filtered, query.sort ?? "featured");
}

export function productPagePath(product: CatalogProduct): string {
  return `/products/${product.categorySlug}/${product.slug}`;
}
