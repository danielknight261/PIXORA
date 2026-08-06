import {
  createServerClient,
  getCategories,
  getCategoryBySlug,
  getProducts,
  getProductsByCategorySlug,
} from "@pixora/api";
import {
  getMockBestSellers,
  mockCategories,
  mockProducts,
  productCategories,
  queryCatalogProducts,
  type CatalogProduct,
  type CatalogQuery,
  type Category,
  type Product,
} from "@pixora/shared";

const now = new Date().toISOString();

function fallbackCategories(): Category[] {
  return mockCategories.length > 0
    ? mockCategories
    : productCategories.map((name, index) => ({
        id: `fallback-${index}`,
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        description: null,
        imageUrl: null,
        sortOrder: index + 1,
        active: true,
        createdAt: now,
        updatedAt: now,
      }));
}

function slugifyCategory(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function toCatalogProduct(
  product: Product,
  categorySlug?: string,
): CatalogProduct {
  const resolvedSlug =
    categorySlug ??
    slugifyCategory(typeof product.category === "string" ? product.category : "");

  return {
    ...product,
    categorySlug: resolvedSlug,
  };
}

/** Use rich mock catalog until Supabase has a full product set */
function shouldUseMockCatalog(supabaseCount: number): boolean {
  return supabaseCount < mockProducts.length;
}

export async function getCatalogCategories(): Promise<Category[]> {
  try {
    const supabase = await createServerClient();
    const categories = await getCategories(supabase);
    if (categories.length > 0) {
      return categories;
    }
  } catch {
    // Database not migrated yet — fall back to mock catalog.
  }

  return fallbackCategories();
}

export async function getCatalogCategory(slug: string): Promise<Category | null> {
  try {
    const supabase = await createServerClient();
    const category = await getCategoryBySlug(supabase, slug);
    if (category) {
      return category;
    }
  } catch {
    // Database not migrated yet.
  }

  return fallbackCategories().find((category) => category.slug === slug) ?? null;
}

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  try {
    const supabase = await createServerClient();
    const products = await getProducts(supabase);
    if (products.length > 0 && !shouldUseMockCatalog(products.length)) {
      return products.map((p) => toCatalogProduct(p));
    }
  } catch {
    // Use mock catalog.
  }

  return mockProducts;
}

export async function getCatalogProductsForCategory(
  slug: string,
): Promise<CatalogProduct[]> {
  try {
    const supabase = await createServerClient();
    const products = await getProductsByCategorySlug(supabase, slug);
    if (products.length > 0 && !shouldUseMockCatalog(products.length)) {
      return products.map((p) => toCatalogProduct(p, slug));
    }
  } catch {
    // Use mock catalog.
  }

  return mockProducts.filter((p) => p.categorySlug === slug);
}

export async function getCatalogProduct(
  categorySlug: string,
  productSlug: string,
): Promise<CatalogProduct | null> {
  const products = await getCatalogProducts();
  return (
    products.find(
      (p) => p.categorySlug === categorySlug && p.slug === productSlug,
    ) ?? null
  );
}

export async function queryCatalog(
  query: CatalogQuery,
  options?: { categorySlug?: string },
): Promise<{
  products: CatalogProduct[];
  total: number;
}> {
  const allProducts = options?.categorySlug
    ? await getCatalogProductsForCategory(options.categorySlug)
    : await getCatalogProducts();

  const products = queryCatalogProducts(allProducts, {
    ...query,
    category: options?.categorySlug ?? query.category,
  });

  return { products, total: products.length };
}

export async function getCatalogBestSellers(limit = 6): Promise<CatalogProduct[]> {
  try {
    const supabase = await createServerClient();
    const products = await getProducts(supabase);
    if (products.length > 0 && !shouldUseMockCatalog(products.length)) {
      return products.slice(0, limit).map((p) => toCatalogProduct(p));
    }
  } catch {
    // Use mock catalog.
  }

  return getMockBestSellers(limit);
}

export async function getRelatedProducts(
  product: CatalogProduct,
  limit = 4,
): Promise<CatalogProduct[]> {
  const categoryProducts = await getCatalogProductsForCategory(
    product.categorySlug,
  );
  return categoryProducts.filter((p) => p.id !== product.id).slice(0, limit);
}
