import Link from "next/link";
import type { CatalogProduct } from "@pixora/shared";
import { productPagePath } from "@pixora/shared";
import { EmptyState } from "@pixora/ui/components/empty-state";
import { Button } from "@pixora/ui/components/ui/button";
import { ProductCard } from "@pixora/ui/components/product-card";

export type ProductGridProps = {
  products: CatalogProduct[];
  emptyTitle?: string;
  emptyDescription?: string;
};

export function ProductGrid({
  products,
  emptyTitle = "No products found",
  emptyDescription = "Try adjusting your search or filters.",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={
          <Link href="/products">
            <Button variant="soft">View all products</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          name={product.name}
          description={product.description}
          price={product.basePrice}
          href={productPagePath(product)}
          imageUrl={product.imageUrl}
          category={
            typeof product.category === "string" ? product.category : undefined
          }
        />
      ))}
    </div>
  );
}
