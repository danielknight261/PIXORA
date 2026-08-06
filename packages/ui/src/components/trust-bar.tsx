import {
  Eye,
  ShieldCheck,
  Sparkles,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@pixora/ui/lib/utils";

export type TrustItem = {
  icon?: LucideIcon;
  label: string;
  description?: string;
};

const defaultItems: TrustItem[] = [
  {
    icon: Truck,
    label: "Fast delivery",
    description: "Tracked shipping across the UK",
  },
  {
    icon: Sparkles,
    label: "Premium print quality",
    description: "Professional-grade materials",
  },
  {
    icon: Eye,
    label: "Live preview",
    description: "See your design before you buy",
  },
  {
    icon: ShieldCheck,
    label: "Secure checkout",
    description: "Protected payments with Stripe",
  },
];

export type TrustBarProps = {
  items?: TrustItem[];
  className?: string;
};

export function TrustBar({ items = defaultItems, className }: TrustBarProps) {
  return (
    <section
      className={cn(
        "rounded-3xl border bg-card px-6 py-8 shadow-card md:px-10",
        className,
      )}
    >
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon ?? Sparkles;
          return (
            <div key={item.label} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-heading text-sm font-semibold">{item.label}</p>
                {item.description ? (
                  <p className="text-caption mt-1">{item.description}</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
