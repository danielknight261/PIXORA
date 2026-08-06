import { Star } from "lucide-react";
import { cn } from "@pixora/ui/lib/utils";

export type TestimonialCardProps = {
  quote: string;
  author: string;
  context?: string;
  rating?: number;
  className?: string;
};

export function TestimonialCard({
  quote,
  author,
  context,
  rating = 5,
  className,
}: TestimonialCardProps) {
  return (
    <figure
      className={cn(
        "rounded-3xl border bg-card p-8 shadow-card",
        className,
      )}
    >
      <div className="flex gap-0.5 text-warning">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <blockquote className="text-body mt-4 text-foreground">&ldquo;{quote}&rdquo;</blockquote>
      <figcaption className="mt-6">
        <p className="font-heading text-sm font-semibold">{author}</p>
        {context ? (
          <p className="text-caption mt-1">{context}</p>
        ) : null}
      </figcaption>
    </figure>
  );
}
