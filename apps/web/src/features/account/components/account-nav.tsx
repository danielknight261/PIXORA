"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@pixora/ui/lib/utils";

const tabs = [
  { href: "/uploads", label: "Uploads" },
  { href: "/orders", label: "Orders" },
  { href: "/designs", label: "Designs" },
  { href: "/account", label: "Account" },
] as const;

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account"
      className="border-b border-border bg-muted/30"
    >
      <div className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-4 sm:px-6">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
                isActive
                  ? "border-brand-nav text-brand-nav"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
