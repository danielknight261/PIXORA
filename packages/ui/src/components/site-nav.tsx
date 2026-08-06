"use client";

import * as React from "react";
import {
  ChevronDown,
  HelpCircle,
  Search,
  ShoppingCart,
  User,
} from "lucide-react";
import { Button } from "@pixora/ui/components/ui/button";
import { NavSearch } from "@pixora/ui/components/nav-search";
import { cn } from "@pixora/ui/lib/utils";

export type SiteNavLink = {
  href: string;
  label: string;
};

export type SiteNavMenuItem = {
  label: string;
  href: string;
  description?: string;
};

export type SiteNavGroup = {
  label: string;
  href: string;
  pillClassName?: string;
  items?: SiteNavMenuItem[];
};

export type SiteNavProps = {
  logo?: React.ReactNode;
  /** @deprecated use navGroups */
  links?: SiteNavLink[];
  /** @deprecated use navGroups */
  categoryLinks?: SiteNavCategoryLink[];
  navGroups?: SiteNavGroup[];
  utilityLinks?: SiteNavLink[];
  actions?: React.ReactNode;
  accountHref?: string;
  accountLabel?: string;
  cartHref?: string;
  cartCount?: number;
  helpHref?: string;
  className?: string;
};

/** @deprecated */
export type SiteNavCategoryLink = {
  href: string;
  label: string;
  pillClassName?: string;
};

function NavDivider() {
  return (
    <span
      aria-hidden
      className="mx-1 hidden h-5 w-px bg-border sm:mx-2 sm:block"
    />
  );
}

function UtilityLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1.5 whitespace-nowrap px-2 py-2 text-sm font-medium text-brand-nav transition-colors hover:text-brand-nav-hover sm:px-3"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}

function CategoryDropdown({ group }: { group: SiteNavGroup }) {
  const hasMenu = Boolean(group.items?.length);

  if (!hasMenu) {
    return (
      <a
        href={group.href}
        className="inline-flex shrink-0 items-center px-3 py-3.5 text-sm font-semibold text-foreground transition-colors hover:text-brand-nav sm:px-4 sm:text-[15px]"
      >
        {group.label}
      </a>
    );
  }

  return (
    <div className="group relative shrink-0">
      <a
        href={group.href}
        className="inline-flex items-center gap-1 px-3 py-3.5 text-sm font-semibold text-foreground transition-colors hover:text-brand-nav sm:gap-1.5 sm:px-4 sm:text-[15px]"
      >
        {group.label}
        <ChevronDown className="h-3.5 w-3.5 opacity-70 transition-transform group-hover:rotate-180" />
      </a>
      <div className="invisible absolute left-0 top-full z-50 pt-0 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
        <div className="min-w-[260px] rounded-lg border bg-popover py-2 shadow-card-hover">
          {group.items!.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block px-4 py-2.5 transition-colors hover:bg-muted"
            >
              <span className="text-sm font-medium text-foreground">
                {item.label}
              </span>
              {item.description ? (
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {item.description}
                </span>
              ) : null}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SiteNav({
  logo,
  links = [],
  categoryLinks = [],
  navGroups = [],
  utilityLinks = [],
  actions,
  accountHref = "/login",
  accountLabel = "My account",
  cartHref = "/cart",
  cartCount,
  helpHref = "/#how-it-works",
  className,
}: SiteNavProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);

  const groups: SiteNavGroup[] =
    navGroups.length > 0
      ? navGroups
      : categoryLinks.map((c) => ({
          label: c.label,
          href: c.href,
          pillClassName: c.pillClassName,
        }));

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-white",
        className,
      )}
    >
      {/* Row 1 — Photobox-style utility bar: logo left, account/help/basket right */}
      <div className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-[60px] sm:px-6">
          <div className="shrink-0">{logo}</div>

          <div className="flex items-center">
            {utilityLinks.map((link, i) => (
              <React.Fragment key={link.href}>
                {i > 0 ? <NavDivider /> : null}
                <UtilityLink href={link.href} label={link.label} />
              </React.Fragment>
            ))}

            {utilityLinks.length > 0 ? <NavDivider /> : null}

            <UtilityLink
              href={helpHref}
              label="Customer service"
              icon={
                <HelpCircle className="h-[18px] w-[18px] shrink-0 sm:hidden" />
              }
            />

            <NavDivider />

            <UtilityLink
              href={accountHref}
              label={accountLabel}
              icon={<User className="h-[18px] w-[18px] shrink-0 sm:hidden" />}
            />

            <NavDivider />

            <a
              href={cartHref}
              className="relative inline-flex items-center gap-1.5 whitespace-nowrap px-2 py-2 text-sm font-medium text-brand-nav transition-colors hover:text-brand-nav-hover sm:px-3"
            >
              <ShoppingCart className="h-[18px] w-[18px] shrink-0" />
              <span className="hidden sm:inline">My basket</span>
              {cartCount && cartCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-nav px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              ) : null}
            </a>

            <Button
              variant="ghost"
              size="icon"
              className="ml-1 text-brand-nav lg:hidden"
              aria-label="Search"
              onClick={() => setMobileSearchOpen((v) => !v)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {actions ? (
              <div className="ml-2 hidden items-center gap-2 border-l pl-3 md:flex">
                {actions}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile search */}
      {mobileSearchOpen ? (
        <div className="border-b border-border px-4 py-3 lg:hidden">
          <NavSearch />
        </div>
      ) : null}

      {/* Row 2 — category navigation with dropdown chevrons */}
      {groups.length > 0 ? (
        <div className="hidden lg:block">
          <nav
            aria-label="Shop categories"
            className="mx-auto flex max-w-7xl items-center overflow-x-auto px-6 scrollbar-none"
          >
            {groups.map((group) => (
              <CategoryDropdown key={group.href} group={group} />
            ))}
          </nav>
        </div>
      ) : null}

      {/* Mobile / tablet — scrollable category links (text, not pills) */}
      {groups.length > 0 ? (
        <div className="border-t border-border lg:hidden">
          <nav
            aria-label="Shop categories"
            className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-1 scrollbar-none sm:px-6"
          >
            <a
              href="/products"
              className="shrink-0 px-3 py-2.5 text-sm font-semibold text-brand-nav"
            >
              All products
            </a>
            {groups.map((group) => (
              <a
                key={group.href}
                href={group.href}
                className="inline-flex shrink-0 items-center gap-0.5 px-3 py-2.5 text-sm font-semibold text-foreground"
              >
                {group.label}
                {group.items?.length ? (
                  <ChevronDown className="h-3 w-3 opacity-60" />
                ) : null}
              </a>
            ))}
          </nav>
        </div>
      ) : null}

      {/* Legacy links fallback */}
      {links.length > 0 && groups.length === 0 ? (
        <div className="border-t border-border lg:hidden">
          <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 scrollbar-none">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="shrink-0 px-3 py-2 text-sm font-medium text-muted-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
