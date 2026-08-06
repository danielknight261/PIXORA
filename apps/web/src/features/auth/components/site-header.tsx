import Link from "next/link";
import {
  createServerClient,
  getAuthUser,
  isSupabaseConfigured,
} from "@pixora/api";
import { categoryArtColors, productCategories } from "@pixora/shared";
import { SiteNav, type SiteNavGroup } from "@pixora/ui/components/site-nav";
import { LogoutButton } from "@/features/auth/components/logout-button";

const navGroups: SiteNavGroup[] = productCategories.map((name) => {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const colors = categoryArtColors[slug];
  return {
    label: name,
    href: `/products/${slug}`,
    pillClassName: colors?.pill,
    items: [
      {
        label: `Browse ${name.toLowerCase()}`,
        href: `/products/${slug}`,
        description: "See sizes, prices and options",
      },
      {
        label: "Start designing",
        href: `/products/${slug}`,
        description: "Upload your photo and personalise",
      },
    ],
  };
});

const guestUtilityLinks = [{ href: "/#how-it-works", label: "How it works" }];

const signedInUtilityLinks = [
  { href: "/uploads", label: "My uploads" },
  { href: "/#how-it-works", label: "How it works" },
];

export async function SiteHeader() {
  let accountLabel = "My account";
  let accountHref = "/login";
  let isAuthenticated = false;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerClient();
      const user = await getAuthUser(supabase);
      if (user) {
        isAuthenticated = true;
        accountHref = "/account";
      }
    } catch {
      // keep defaults
    }
  }

  return (
    <SiteNav
      logo={
        <Link href="/" className="group flex items-center">
          <span className="font-heading text-[1.35rem] font-bold uppercase tracking-[0.12em] text-brand-nav transition-colors group-hover:text-brand-nav-hover sm:text-[1.5rem]">
            Pixora
          </span>
        </Link>
      }
      navGroups={navGroups}
      utilityLinks={
        isAuthenticated ? signedInUtilityLinks : guestUtilityLinks
      }
      accountHref={accountHref}
      accountLabel={accountLabel}
      cartHref="/cart"
      helpHref="/#how-it-works"
      actions={isAuthenticated ? <LogoutButton variant="ghost" size="sm" /> : undefined}
    />
  );
}
