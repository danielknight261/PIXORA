import { brand } from "@pixora/shared";
import { cn } from "@pixora/ui/lib/utils";

export type SiteFooterLink = {
  href: string;
  label: string;
};

export type SiteFooterProps = {
  shopLinks?: SiteFooterLink[];
  accountLinks?: SiteFooterLink[];
  legalLinks?: SiteFooterLink[];
  className?: string;
};

const defaultShopLinks: SiteFooterLink[] = [
  { href: "/products", label: "All products" },
  { href: "/products/canvas-prints", label: "Canvas prints" },
  { href: "/products/photo-prints", label: "Photo prints" },
  { href: "/products/mugs", label: "Mugs" },
];

const defaultAccountLinks: SiteFooterLink[] = [
  { href: "/login", label: "Sign in" },
  { href: "/register", label: "Create account" },
  { href: "/orders", label: "My orders" },
];

const defaultLegalLinks: SiteFooterLink[] = [
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of service" },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: SiteFooterLink[];
}) {
  return (
    <div>
      <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
        {title}
      </h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter({
  shopLinks = defaultShopLinks,
  accountLinks = defaultAccountLinks,
  legalLinks = defaultLegalLinks,
  className,
}: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn("border-t bg-card", className)}>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <p className="font-heading text-2xl font-semibold tracking-tight">
              {brand.name}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {brand.tagline}. Create personalised photo products with live
              preview and premium print quality.
            </p>
          </div>
          <FooterColumn title="Shop" links={shopLinks} />
          <FooterColumn title="Account" links={accountLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>
        <div className="mt-12 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {year} {brand.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
