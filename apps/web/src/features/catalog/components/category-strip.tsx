import Link from "next/link";
import type { Category } from "@pixora/shared";
import { CategoryCard } from "@pixora/ui/components/category-card";
import { cn } from "@pixora/ui/lib/utils";

export type CategoryStripProps = {
  categories: Category[];
  activeSlug?: string;
  className?: string;
};

export function CategoryStrip({
  categories,
  activeSlug,
  className,
}: CategoryStripProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        className,
      )}
    >
      <Link
        href="/products"
        className={cn(
          "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
          !activeSlug
            ? "bg-brand-nav text-white"
            : "bg-muted text-foreground hover:bg-muted/80",
        )}
      >
        All products
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/products/${category.slug}`}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            activeSlug === category.slug
              ? "bg-brand-nav text-white"
              : "bg-muted text-foreground hover:bg-muted/80",
          )}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
