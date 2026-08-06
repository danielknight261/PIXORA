import { PublicShell } from "@/features/layout/public-shell";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicShell>{children}</PublicShell>;
}
