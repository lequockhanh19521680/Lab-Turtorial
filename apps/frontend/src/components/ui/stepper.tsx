import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepperProps {
  steps: { id: string; title: string; description?: string }[]
  currentStep: number
  onStepClick?: (step: number) => void
  className?: string
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ steps, currentStep, onStepClick, className }, ref) => {
    return (
      <div ref={ref} className={cn("w-full", className)}>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                    index < currentStep
                      ? "border-primary bg-primary text-primary-foreground"
                      : index === currentStep
                      ? "border-primary bg-background text-primary"
                      : "border-muted-foreground/25 bg-background text-muted-foreground",
                    onStepClick && "cursor-pointer hover:border-primary"
                  )}
                  onClick={() => onStepClick?.(index)}
                >
                  {index < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className={cn(
                    "text-sm font-medium",
                    index <= currentStep ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "h-px flex-1 bg-border mx-4",
                  index < currentStep ? "bg-primary" : "bg-muted-foreground/25"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }
)
Stepper.displayName = "Stepper"

export { Stepper }