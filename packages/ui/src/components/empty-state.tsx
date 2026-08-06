import { type LucideIcon } from "lucide-react";
import { cn } from "@pixora/ui/lib/utils";

export type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-3xl border border-dashed bg-card px-8 py-16 text-center shadow-card",
        className,
      )}
    >
      {Icon ? (
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-7 w-7" />
        </div>
      ) : null}
      <h3 className="font-heading text-xl font-semibold">{title}</h3>
      <p className="text-body mt-2 max-w-md text-muted-foreground">{description}</p>
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}
