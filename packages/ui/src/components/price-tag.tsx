import { formatCurrency } from "@pixora/shared";
import { Badge } from "@pixora/ui/components/ui/badge";
import { cn } from "@pixora/ui/lib/utils";

export type PriceTagProps = {
  price: number;
  prefix?: string;
  compareAtPrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function PriceTag({
  price,
  prefix = "From",
  compareAtPrice,
  size = "md",
  className,
}: PriceTagProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span
        className={cn(
          "font-heading font-semibold text-foreground",
          sizeClasses[size],
        )}
      >
        {prefix ? `${prefix} ` : ""}
        {formatCurrency(price)}
      </span>
      {compareAtPrice && compareAtPrice > price ? (
        <>
          <span className="text-caption line-through">
            {formatCurrency(compareAtPrice)}
          </span>
          <Badge variant="soft">Save {formatCurrency(compareAtPrice - price)}</Badge>
        </>
      ) : null}
    </div>
  );
}
