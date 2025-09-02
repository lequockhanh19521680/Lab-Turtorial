import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { PrimaryButton, SecondaryButton, GhostButton } from "./seraButton"

export interface SeraStepperProps {
  steps: Array<{
    title: string
    description?: string
  }>
  currentStep: number
  className?: string
}

const SeraStepper = React.forwardRef<HTMLDivElement, SeraStepperProps>(
  ({ steps, currentStep, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center space-y-2">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium transition-all duration-200",
                    index < currentStep
                      ? "bg-primary-600 border-primary-600 text-white shadow-soft"
                      : index === currentStep
                      ? "border-primary-600 text-primary-600 bg-white shadow-soft ring-4 ring-primary-100"
                      : "border-secondary-300 text-secondary-500 bg-white"
                  )}
                >
                  {index < currentStep ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="text-center">
                  <div
                    className={cn(
                      "text-sm font-medium transition-colors",
                      index <= currentStep ? "text-secondary-900" : "text-secondary-500"
                    )}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-secondary-500 max-w-20 mt-1">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-colors duration-300",
                    index < currentStep ? "bg-primary-600" : "bg-secondary-300"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }
)
SeraStepper.displayName = "SeraStepper"

export interface SeraStepperNavigationProps {
  currentStep: number
  totalSteps: number
  onNext?: () => void
  onPrevious?: () => void
  onCancel?: () => void
  nextLabel?: string
  previousLabel?: string
  cancelLabel?: string
  isNextDisabled?: boolean
  isLoading?: boolean
  className?: string
}

const SeraStepperNavigation = React.forwardRef<HTMLDivElement, SeraStepperNavigationProps>(
  ({
    currentStep,
    totalSteps,
    onNext,
    onPrevious,
    onCancel,
    nextLabel = "Next",
    previousLabel = "Previous",
    cancelLabel = "Cancel",
    isNextDisabled = false,
    isLoading = false,
    className,
    ...props
  }, ref) => {
    const isFirstStep = currentStep === 0
    const isLastStep = currentStep === totalSteps - 1

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between pt-6 border-t border-secondary-200", className)}
        {...props}
      >
        <div>
          {onCancel && (
            <GhostButton onClick={onCancel}>
              {cancelLabel}
            </GhostButton>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {!isFirstStep && onPrevious && (
            <SecondaryButton 
              onClick={onPrevious} 
              disabled={isLoading}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              {previousLabel}
            </SecondaryButton>
          )}
          
          {onNext && (
            <PrimaryButton
              onClick={onNext}
              disabled={isNextDisabled || isLoading}
              loading={isLoading}
              loadingText={isLastStep ? "Creating..." : "Loading..."}
              rightIcon={!isLastStep && !isLoading ? <ChevronRight className="w-4 h-4" /> : undefined}
            >
              {nextLabel}
            </PrimaryButton>
          )}
        </div>
      </div>
    )
  }
)
SeraStepperNavigation.displayName = "SeraStepperNavigation"

export { SeraStepper, SeraStepperNavigation }