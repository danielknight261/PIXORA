import { SiteFooter } from "@pixora/ui/components/site-footer";
import { SiteHeader } from "@/features/auth/components/site-header";
import { PromoBannerShell } from "@/features/layout/promo-banner-shell";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PromoBannerShell />
      <SiteHeader />
      <main className="art-mesh-bg flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
