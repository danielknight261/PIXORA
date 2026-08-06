import { X } from "lucide-react";
import { cn } from "@pixora/ui/lib/utils";

export type PromoBannerProps = {
  message: string;
  href?: string;
  linkLabel?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
};

export function PromoBanner({
  message,
  href,
  linkLabel = "Shop now",
  dismissible = false,
  onDismiss,
  className,
}: PromoBannerProps) {
  return (
    <div
      className={cn(
        "relative bg-gradient-to-r from-primary via-art-violet to-art-rose px-6 py-3 text-center text-sm text-primary-foreground",
        className,
      )}
    >
      <p className="font-medium">
        {message}
        {href ? (
          <>
            {" "}
            <a
              href={href}
              className="underline underline-offset-4 transition-opacity hover:opacity-80"
            >
              {linkLabel}
            </a>
          </>
        ) : null}
      </p>
      {dismissible && onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 transition-opacity hover:opacity-80"
          aria-label="Dismiss promotion"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
