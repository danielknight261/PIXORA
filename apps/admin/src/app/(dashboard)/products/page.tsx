import { productCategories } from "@pixora/shared";

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Products</h1>
      <div className="grid gap-4">
        {productCategories.map((category) => (
          <div
            key={category}
            className="flex items-center justify-between rounded-3xl border bg-card p-6"
          >
            <div>
              <p className="font-medium">{category}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
