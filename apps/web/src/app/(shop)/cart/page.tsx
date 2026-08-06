import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@pixora/ui/components/ui/button";
import { EmptyState } from "@pixora/ui/components/empty-state";
import { Breadcrumbs } from "@pixora/ui/components/breadcrumbs";

export default function CartPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cart" },
        ]}
        className="mb-8"
      />
      <h1 className="text-title">Your cart</h1>
      <p className="text-body mt-2 text-muted-foreground">
        Review your personalised products before checkout.
      </p>
      <div className="mt-10">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse our products and start personalising — your designs will appear here ready to checkout."
          action={
            <Link href="/products">
              <Button variant="premium">Continue shopping</Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
