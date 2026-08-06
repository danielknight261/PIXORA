import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createServerClient,
  getAuthUser,
  getUserProfile,
  isSupabaseConfigured,
} from "@pixora/api";
import { ImageIcon, LayoutGrid, Package } from "lucide-react";
import { Breadcrumbs } from "@pixora/ui/components/breadcrumbs";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@pixora/ui/components/ui/card";

export const dynamic = "force-dynamic";

const accountCards = [
  {
    href: "/uploads",
    title: "Upload photos",
    description: "Add JPG, PNG, WEBP, or HEIC photos to your private library.",
    icon: ImageIcon,
  },
  {
    href: "/orders",
    title: "My orders",
    description: "Track order status and view your purchase history.",
    icon: Package,
  },
  {
    href: "/designs",
    title: "Saved designs",
    description: "Resume editing personalised products you have started.",
    icon: LayoutGrid,
  },
] as const;

export default async function AccountPage() {
  if (!isSupabaseConfigured()) {
    redirect("/login?redirectTo=/account");
  }

  const supabase = await createServerClient();
  const user = await getAuthUser(supabase);

  if (!user) {
    redirect("/login?redirectTo=/account");
  }

  const profile = await getUserProfile(supabase, user.id);
  const displayName = profile?.fullName ?? user.email ?? "Account";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "My account" }]}
        className="mb-6"
      />

      <div className="mb-8 space-y-1">
        <h1 className="text-title">My account</h1>
        <p className="text-body text-muted-foreground">
          Welcome back, {displayName}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accountCards.map((card) => (
          <Link key={card.href} href={card.href} className="group block">
            <Card interactive className="h-full">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-nav/10 text-brand-nav">
                  <card.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg group-hover:text-brand-nav">
                  {card.title}
                </CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
