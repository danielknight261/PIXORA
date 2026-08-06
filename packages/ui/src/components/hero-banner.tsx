import { cn } from "@pixora/ui/lib/utils";

export type HeroBannerProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  imageUrl?: string | null;
  imageSlot?: React.ReactNode;
  className?: string;
};

export function HeroBanner({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  imageUrl,
  imageSlot,
  className,
}: HeroBannerProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-card shadow-card",
        className,
      )}
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-0">
        <div className="flex flex-col justify-center space-y-6 p-8 md:p-12 lg:p-16">
          {eyebrow ? (
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-display text-balance">{title}</h1>
          <p className="text-body max-w-lg text-muted-foreground">{description}</p>
          {(primaryAction || secondaryAction) && (
            <div className="flex flex-wrap gap-4">{primaryAction}{secondaryAction}</div>
          )}
        </div>
        <div className="relative min-h-[280px] bg-gradient-to-br from-primary/15 via-accent/10 to-muted lg:min-h-full">
          {imageSlot ? (
            imageSlot
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="grid grid-cols-2 gap-3 opacity-90">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "aspect-square rounded-2xl bg-white/80 shadow-card",
                      i === 1 && "rotate-[-4deg]",
                      i === 2 && "rotate-[3deg] translate-y-2",
                      i === 3 && "rotate-[2deg]",
                      i === 4 && "rotate-[-2deg] translate-y-4",
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
