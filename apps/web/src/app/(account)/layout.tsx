import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createServerClient,
  getAuthUser,
  isSupabaseConfigured,
} from "@pixora/api";
import { categoryArtColors, productCategories } from "@pixora/shared";
import { SiteNav, type SiteNavGroup } from "@pixora/ui/components/site-nav";
import { SiteFooter } from "@pixora/ui/components/site-footer";
import { AccountNav } from "@/features/account/components/account-nav";
import { LogoutButton } from "@/features/auth/components/logout-button";

export const dynamic = "force-dynamic";

const navGroups: SiteNavGroup[] = productCategories.map((name) => {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const colors = categoryArtColors[slug];
  return {
    label: name,
    href: `/products/${slug}`,
    pillClassName: colors?.pill,
  };
});

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createServerClient();
  const user = await getAuthUser(supabase);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav
        logo={
          <Link href="/" className="flex items-center">
            <span className="font-heading text-xl font-bold uppercase tracking-[0.1em] text-brand-nav">
              Pixora
            </span>
          </Link>
        }
        navGroups={navGroups}
        utilityLinks={[
          { href: "/uploads", label: "My uploads" },
          { href: "/#how-it-works", label: "How it works" },
        ]}
        accountHref="/account"
        accountLabel="My account"
        cartHref="/cart"
        actions={<LogoutButton variant="ghost" size="sm" />}
      />
      <AccountNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
