import Link from "next/link";
import { Button } from "@pixora/ui/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of Snapp Daddy orders, products, and users.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        {[
          { label: "Orders", href: "/orders", value: "—" },
          { label: "Products", href: "/products", value: "7" },
          { label: "Users", href: "/users", value: "—" },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-3xl border bg-card p-6"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold">{stat.value}</p>
          </Link>
        ))}
      </div>
      <Link href="/orders">
        <Button>View all orders</Button>
      </Link>
    </div>
  );
}
