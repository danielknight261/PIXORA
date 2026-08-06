import { categoryArtColors } from "@pixora/shared";
import { Button } from "@pixora/ui/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@pixora/ui/components/ui/card";
import { cn } from "@pixora/ui/lib/utils";

export type CategoryCardProps = {
  title: string;
  description?: string | null;
  href: string;
  slug?: string;
  imageUrl?: string | null;
  className?: string;
};

export function CategoryCard({
  title,
  description,
  href,
  slug,
  imageUrl,
  className,
}: CategoryCardProps) {
  const art = slug ? categoryArtColors[slug] : undefined;

  return (
    <a href={href} className={cn("group block", className)}>
      <Card
        interactive
        className={cn(
          "h-full overflow-hidden",
          art && `ring-1 ring-inset ${art.ring}`,
        )}
      >
        <div
          className={cn(
            "relative aspect-[4/3] overflow-hidden bg-gradient-to-br",
            art?.gradient ?? "from-primary/20 via-art-violet/15 to-art-rose/10",
          )}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full flex-col items-start justify-end p-6">
              <span
                className={cn(
                  "inline-block rounded-full px-3 py-1 text-xs font-semibold text-white",
                  art?.pill ?? "bg-primary",
                )}
              >
                Personalise
              </span>
              <span className="font-heading mt-3 text-lg font-semibold text-foreground">
                {title}
              </span>
            </div>
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : (
            <CardDescription>
              Personalise and preview your design before you buy.
            </CardDescription>
          )}
        </CardHeader>
        <CardFooter className="pt-0">
          <Button variant="soft" size="sm" className="pointer-events-none">
            View options
          </Button>
        </CardFooter>
      </Card>
    </a>
  );
}
