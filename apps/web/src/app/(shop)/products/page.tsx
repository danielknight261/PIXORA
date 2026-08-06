import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@pixora/ui/components/breadcrumbs";
import { Skeleton } from "@pixora/ui/components/ui/skeleton";
import { CatalogToolbar } from "@/features/catalog/components/catalog-toolbar";
import { CategoryStrip } from "@/features/catalog/components/category-strip";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { getCatalogCategories, queryCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Products | Pixora",
  description:
    "Browse personalised photo products — canvas prints, mugs, calendars, photo books and more. Filter, sort and search our full catalog.",
  openGraph: {
    title: "Products | Pixora",
    description:
      "Browse personalised photo products — canvas prints, mugs, calendars and more.",
  },
};

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    category?: string;
  }>;
};

function ToolbarSkeleton() {
  return <Skeleton className="h-36 w-full rounded-2xl" />;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const categories = await getCatalogCategories();
  const { products, total } = await queryCatalog({
    q: params.q,
    sort: params.sort as Parameters<typeof queryCatalog>[0]["sort"],
    category: params.category,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Products" }]}
        className="mb-6"
      />

      <div className="mb-8 space-y-3">
        <h1 className="text-title">All products</h1>
        <p className="text-body max-w-2xl text-muted-foreground">
          Personalise canvas prints, mugs, calendars and more with your own
          photos. Use search and filters to find the perfect product.
        </p>
      </div>

      <CategoryStrip categories={categories} className="mb-8" />

      <Suspense fallback={<ToolbarSkeleton />}>
        <CatalogToolbar
          categories={categories.map((c) => ({
            slug: c.slug,
            name: c.name,
          }))}
          className="mb-8"
        />
      </Suspense>

      <p className="mb-6 text-sm text-muted-foreground">
        {total} {total === 1 ? "product" : "products"}
        {params.q ? ` matching “${params.q}”` : ""}
        {params.category
          ? ` in ${categories.find((c) => c.slug === params.category)?.name ?? params.category}`
          : ""}
      </p>

      <ProductGrid products={products} />
    </div>
  );
}
