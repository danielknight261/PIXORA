import { Upload } from "lucide-react";
import { Button } from "@pixora/ui/components/ui/button";
import { cn } from "@pixora/ui/lib/utils";

export type UploadCtaProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  onUploadClick?: () => void;
  className?: string;
};

export function UploadCta({
  title = "Start with your photos",
  description = "Upload from your phone or computer — the same effortless flow you expect from leading photo platforms.",
  action,
  onUploadClick,
  className,
}: UploadCtaProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-gradient-to-r from-primary to-accent p-8 text-primary-foreground shadow-card-hover md:p-12",
        className,
      )}
    >
      <div className="relative z-10 max-w-xl space-y-4">
        <div className="inline-flex rounded-2xl bg-white/20 p-3">
          <Upload className="h-6 w-6" />
        </div>
        <h2 className="font-heading text-2xl font-bold md:text-3xl">{title}</h2>
        <p className="text-primary-foreground/90">{description}</p>
        {action ?? (
          <Button
            variant="secondary"
            size="lg"
            className="mt-2 bg-white text-primary hover:bg-white/90"
            onClick={onUploadClick}
          >
            Upload photos
          </Button>
        )}
      </div>
      <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-white/5" />
    </section>
  );
}
