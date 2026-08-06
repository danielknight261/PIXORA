"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import type { ProductSortOption } from "@pixora/shared";
import { productSortOptions } from "@pixora/shared";
import { Input } from "@pixora/ui/components/ui/input";
import { Label } from "@pixora/ui/components/ui/label";
import { cn } from "@pixora/ui/lib/utils";

export type CatalogToolbarProps = {
  categories?: { slug: string; name: string }[];
  showCategoryFilter?: boolean;
  lockedCategory?: string;
  className?: string;
};

const sortLabels: Record<ProductSortOption, string> = {
  featured: "Featured",
  "name-asc": "Name (A–Z)",
  "name-desc": "Name (Z–A)",
  "price-asc": "Price (low to high)",
  "price-desc": "Price (high to low)",
  newest: "Newest",
};

export function CatalogToolbar({
  categories = [],
  showCategoryFilter = true,
  lockedCategory,
  className,
}: CatalogToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const sort = (searchParams.get("sort") as ProductSortOption) ?? "featured";
  const category = lockedCategory ?? searchParams.get("category") ?? "";

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  return (
    <form
      className={cn(
        "grid gap-4 rounded-2xl border bg-card p-4 shadow-card sm:grid-cols-2 lg:grid-cols-4",
        isPending && "opacity-70",
        className,
      )}
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        updateParams({
          q: String(form.get("q") ?? ""),
          sort: String(form.get("sort") ?? "featured"),
          category: lockedCategory
            ? ""
            : String(form.get("category") ?? ""),
        });
      }}
    >
      <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
        <Label htmlFor="catalog-search">Search</Label>
        <Input
          id="catalog-search"
          name="q"
          type="search"
          placeholder="Search products…"
          defaultValue={q}
          key={`q-${q}`}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="catalog-sort">Sort by</Label>
        <select
          id="catalog-sort"
          name="sort"
          defaultValue={sort}
          className="focus-ring h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm"
          onChange={(e) => updateParams({ sort: e.target.value })}
        >
          {productSortOptions.map((option) => (
            <option key={option} value={option}>
              {sortLabels[option]}
            </option>
          ))}
        </select>
      </div>

      {showCategoryFilter && !lockedCategory ? (
        <div className="space-y-1.5">
          <Label htmlFor="catalog-category">Category</Label>
          <select
            id="catalog-category"
            name="category"
            defaultValue={category}
            className="focus-ring h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm"
            onChange={(e) => updateParams({ category: e.target.value })}
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="flex items-end sm:col-span-2 lg:col-span-4">
        <button
          type="submit"
          className="focus-ring inline-flex h-11 items-center rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Apply filters
        </button>
      </div>
    </form>
  );
}
