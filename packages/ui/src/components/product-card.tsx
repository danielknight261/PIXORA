import { formatCurrency } from "@pixora/shared";
import { Badge } from "@pixora/ui/components/ui/badge";
import { Button } from "@pixora/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@pixora/ui/components/ui/card";
import { Skeleton } from "@pixora/ui/components/ui/skeleton";
import { cn } from "@pixora/ui/lib/utils";

export type ProductCardProps = {
  name: string;
  description?: string | null;
  price: number;
  href: string;
  imageUrl?: string | null;
  category?: string | null;
  loading?: false;
  className?: string;
} | {
  loading: true;
  className?: string;
  name?: string;
  description?: string | null;
  price?: number;
  href?: string;
  imageUrl?: string | null;
  category?: string | null;
};

export function ProductCard(props: ProductCardProps) {
  if (props.loading) {
    return (
      <Card className={cn("overflow-hidden", props.className)}>
        <Skeleton className="aspect-square w-full rounded-none" />
        <CardHeader>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardFooter>
          <Skeleton className="h-11 w-full rounded-3xl" />
        </CardFooter>
      </Card>
    );
  }

  const { name, description, price, href, imageUrl, category, className } =
    props;

  return (
    <Card interactive className={cn("group overflow-hidden", className)}>
      <a href={href} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-secondary">
              <span className="text-caption">Preview coming soon</span>
            </div>
          )}
          <Badge variant="soft" className="absolute left-4 top-4">
            From {formatCurrency(price)}
          </Badge>
        </div>
        <CardHeader className="pb-2">
          {category ? (
            <p className="text-caption uppercase tracking-wider">{category}</p>
          ) : null}
          <CardTitle className="text-xl">{name}</CardTitle>
          {description ? (
            <CardDescription className="line-clamp-2">
              {description}
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="pt-0">
          <p className="font-heading text-lg font-semibold text-foreground">
            {formatCurrency(price)}
          </p>
        </CardContent>
        <CardFooter className="pt-0">
          <Button variant="premium" className="w-full">
            Start designing
          </Button>
        </CardFooter>
      </a>
    </Card>
  );
}
