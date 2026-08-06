import Link from "next/link";
import { Button } from "@pixora/ui/components/ui/button";

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-title">Your orders</h1>
      <p className="text-body mt-2 text-muted-foreground">
        Track the status of your Pixora orders.
      </p>
      <div className="mt-10 rounded-3xl border bg-card p-8 text-center">
        <p className="text-muted-foreground">No orders yet.</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/uploads">
            <Button variant="premium">Upload photos</Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">Browse products</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
