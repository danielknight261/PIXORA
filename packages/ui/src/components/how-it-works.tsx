import { cn } from "@pixora/ui/lib/utils";

export type HowItWorksStep = {
  step: number;
  title: string;
  description: string;
};

const stepColors = [
  "bg-gradient-to-br from-blue-500 to-indigo-600",
  "bg-gradient-to-br from-violet-500 to-purple-600",
  "bg-gradient-to-br from-rose-500 to-pink-600",
];

const defaultSteps: HowItWorksStep[] = [
  {
    step: 1,
    title: "Upload your photos",
    description:
      "Add your favourite memories from any device — phone, tablet, or desktop.",
  },
  {
    step: 2,
    title: "Personalise your product",
    description:
      "Drag, crop, and customise with our live editor and instant preview.",
  },
  {
    step: 3,
    title: "Preview & order",
    description:
      "Review every detail, checkout securely, and track your order to your door.",
  },
];

export type HowItWorksProps = {
  title?: string;
  subtitle?: string;
  steps?: HowItWorksStep[];
  className?: string;
};

export function HowItWorks({
  title = "How it works",
  subtitle = "Three simple steps from photo to keepsake.",
  steps = defaultSteps,
  className,
}: HowItWorksProps) {
  return (
    <section className={cn("space-y-10", className)}>
      <div className="text-center">
        <h2 className="text-title">{title}</h2>
        <p className="text-body mt-2 text-muted-foreground">{subtitle}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((item, index) => (
          <div
            key={item.step}
            className="relative rounded-3xl border bg-card p-8 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <span
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-sm",
                stepColors[index] ?? "bg-primary",
              )}
            >
              {item.step}
            </span>
            <h3 className="font-heading mt-4 text-lg font-semibold">{item.title}</h3>
            <p className="text-body mt-2 text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
