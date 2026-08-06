import { cn } from "@pixora/ui/lib/utils";

export type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  align?: "left" | "center";
  eyebrowClassName?: string;
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
  align = "center",
  eyebrowClassName,
  className,
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-4",
        isCenter ? "text-center" : "text-left",
        action && "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn(isCenter && "mx-auto max-w-2xl")}>
        {eyebrow ? (
          <p
            className={cn(
              "text-sm font-semibold uppercase tracking-widest text-primary",
              eyebrowClassName,
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-title mt-2">{title}</h2>
        {subtitle ? (
          <p className="text-body mt-2 text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className={cn(isCenter && "mx-auto")}>{action}</div> : null}
    </div>
  );
}
