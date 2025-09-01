import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./button"

export interface StepperProps {
  steps: Array<{
    title: string
    description?: string
  }>
  currentStep: number
  className?: string
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ steps, currentStep, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center space-y-2">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium",
                    index < currentStep
                      ? "bg-primary-600 border-primary-600 text-white"
                      : index === currentStep
                      ? "border-primary-600 text-primary-600 bg-white"
                      : "border-gray-300 text-gray-500 bg-white"
                  )}
                >
                  {index < currentStep ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
                      "text-sm font-medium",
                      index <= currentStep ? "text-gray-900" : "text-gray-500"
                    )}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-gray-500 max-w-20 mt-1">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4",
                    index < currentStep ? "bg-primary-600" : "bg-gray-300"
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
Stepper.displayName = "Stepper"

export interface StepperNavigationProps {
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

const StepperNavigation = React.forwardRef<HTMLDivElement, StepperNavigationProps>(
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
        className={cn("flex items-center justify-between pt-6 border-t", className)}
        {...props}
      >
        <div>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {!isFirstStep && onPrevious && (
            <Button variant="outline" onClick={onPrevious} disabled={isLoading}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              {previousLabel}
            </Button>
          )}
          
          {onNext && (
            <Button
              onClick={onNext}
              disabled={isNextDisabled || isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : !isLastStep ? (
                <>
                  {nextLabel}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              ) : null}
              {isLastStep && !isLoading && nextLabel}
            </Button>
          )}
        </div>
      </div>
    )
  }
)
StepperNavigation.displayName = "StepperNavigation"

export { Stepper, StepperNavigation }