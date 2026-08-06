import { Check } from "lucide-react";
import { cn } from "@pixora/ui/lib/utils";

export type StepIndicatorStep = {
  id: string;
  label: string;
};

export type StepIndicatorProps = {
  steps: StepIndicatorStep[];
  currentStep: string;
  className?: string;
};

export function StepIndicator({
  steps,
  currentStep,
  className,
}: StepIndicatorProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol className="flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = step.id === currentStep;

          return (
            <li key={step.id} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {index > 0 ? (
                  <div
                    className={cn(
                      "h-0.5 flex-1",
                      isComplete || isCurrent ? "bg-primary" : "bg-border",
                    )}
                  />
                ) : (
                  <div className="flex-1" />
                )}
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    isComplete && "bg-primary text-primary-foreground",
                    isCurrent && "border-2 border-primary bg-background text-primary",
                    !isComplete &&
                      !isCurrent &&
                      "border border-border bg-muted text-muted-foreground",
                  )}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                {index < steps.length - 1 ? (
                  <div
                    className={cn(
                      "h-0.5 flex-1",
                      isComplete ? "bg-primary" : "bg-border",
                    )}
                  />
                ) : (
                  <div className="flex-1" />
                )}
              </div>
              <span
                className={cn(
                  "mt-2 hidden text-center text-xs font-medium sm:block",
                  isCurrent ? "text-primary" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
