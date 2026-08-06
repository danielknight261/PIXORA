import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@pixora/ui/components/breadcrumbs";
import { Skeleton } from "@pixora/ui/components/ui/skeleton";
import { CatalogToolbar } from "@/features/catalog/components/catalog-toolbar";
import { CategoryStrip } from "@/features/catalog/components/category-strip";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import {
  getCatalogCategories,
  getCatalogCategory,
  queryCatalog,
} from "@/lib/catalog";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; sort?: string }>;
};

export async function generateStaticParams() {
  const categories = await getCatalogCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCatalogCategory(slug);

  if (!category) {
    return { title: "Category not found | Pixora" };
  }

  return {
    title: `${category.name} | Pixora`,
    description:
      category.description ??
      `Browse ${category.name.toLowerCase()} — personalise with your photos on Pixora.`,
    openGraph: {
      title: `${category.name} | Pixora`,
      description:
        category.description ??
        `Personalised ${category.name.toLowerCase()} from Pixora.`,
    },
  };
}

function ToolbarSkeleton() {
  return <Skeleton className="h-36 w-full rounded-2xl" />;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const category = await getCatalogCategory(slug);

  if (!category) {
    notFound();
  }

  const categories = await getCatalogCategories();
  const { products, total } = await queryCatalog(
    {
      q: query.q,
      sort: query.sort as Parameters<typeof queryCatalog>[0]["sort"],
    },
    { categorySlug: slug },
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: category.name },
        ]}
        className="mb-6"
      />

      <div className="mb-8 space-y-3">
        <h1 className="text-title">{category.name}</h1>
        {category.description ? (
          <p className="text-body max-w-2xl text-muted-foreground">
            {category.description}
          </p>
        ) : null}
      </div>

      <CategoryStrip
        categories={categories}
        activeSlug={slug}
        className="mb-8"
      />

      <Suspense fallback={<ToolbarSkeleton />}>
        <CatalogToolbar
          showCategoryFilter={false}
          lockedCategory={slug}
          className="mb-8"
        />
      </Suspense>

      <p className="mb-6 text-sm text-muted-foreground">
        {total} {total === 1 ? "product" : "products"}
        {query.q ? ` matching “${query.q}”` : ""}
      </p>

      <ProductGrid
        products={products}
        emptyTitle={`No ${category.name.toLowerCase()} found`}
        emptyDescription="Try a different search term or browse all products."
      />
    </div>
  );
}
