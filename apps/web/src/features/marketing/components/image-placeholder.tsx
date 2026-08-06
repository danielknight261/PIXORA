import { heroMeshColors } from "@pixora/shared";
import { Camera, ImageIcon } from "lucide-react";
import { cn } from "@pixora/ui/lib/utils";

const categoryGradients: Record<string, string> = {
  "canvas-prints": "from-blue-500/50 via-indigo-400/35 to-violet-400/25",
  "photo-prints": "from-cyan-500/50 via-sky-400/35 to-blue-400/25",
  "framed-prints": "from-amber-500/50 via-orange-400/35 to-yellow-400/25",
  mugs: "from-orange-500/50 via-rose-400/35 to-red-400/25",
  calendars: "from-emerald-500/50 via-green-400/35 to-teal-400/25",
  "phone-cases": "from-violet-500/50 via-purple-400/35 to-fuchsia-400/25",
  "photo-books": "from-rose-500/50 via-pink-400/35 to-red-400/25",
};

const tileGradients = [
  "from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-500",
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
];

export type ImagePlaceholderProps = {
  variant?: "hero" | "category" | "product";
  slug?: string;
  label?: string;
  className?: string;
};

export function ImagePlaceholder({
  variant = "product",
  slug,
  label,
  className,
}: ImagePlaceholderProps) {
  const gradient =
    slug && categoryGradients[slug]
      ? categoryGradients[slug]
      : "from-primary/30 via-art-violet/25 to-art-rose/20";

  if (variant === "hero") {
    return (
      <div
        className={cn(
          "absolute inset-0 overflow-hidden bg-gradient-to-br from-primary/20 via-art-violet/15 to-art-rose/10",
          className,
        )}
      >
        {heroMeshColors.map((color, i) => (
          <div
            key={color}
            className="pointer-events-none absolute rounded-full blur-3xl"
            style={{
              backgroundColor: color,
              opacity: 0.25,
              width: `${120 + i * 40}px`,
              height: `${120 + i * 40}px`,
              top: `${10 + i * 12}%`,
              left: `${5 + i * 14}%`,
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "relative aspect-square w-28 overflow-hidden rounded-2xl border-2 border-white/50 shadow-card-hover sm:w-32 md:w-36",
                  i === 0 && "-rotate-6",
                  i === 1 && "translate-y-3 rotate-3",
                  i === 2 && "rotate-2",
                  i === 3 && "translate-y-4 -rotate-3",
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br",
                    tileGradients[i],
                  )}
                />
                <ImageIcon className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-white/80" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br",
        gradient,
        variant === "category" ? "min-h-[180px]" : "min-h-full",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.25),transparent_60%)]" />
      <div className="relative flex flex-col items-center gap-2 text-white/80">
        {variant === "category" ? (
          <Camera className="h-10 w-10 drop-shadow-sm" />
        ) : (
          <ImageIcon className="h-8 w-8 drop-shadow-sm" />
        )}
        {label ? (
          <span className="max-w-[80%] text-center text-xs font-semibold uppercase tracking-wider drop-shadow-sm">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
