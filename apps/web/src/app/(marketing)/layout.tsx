import { PublicShell } from "@/features/layout/public-shell";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicShell>{children}</PublicShell>;
}
