import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

interface ProgressProps {
  value: number
  max?: number
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "success" | "warning" | "error"
  showPercentage?: boolean
  animated?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value, 
    max = 100, 
    size = "md", 
    variant = "default", 
    showPercentage = false,
    animated = true,
    ...props 
  }, ref) => {
    const percentage = Math.round((value / max) * 100)
    
    const sizeClasses = {
      sm: "h-2",
      md: "h-3",
      lg: "h-4"
    }

    const variantClasses = {
      default: "bg-primary-500",
      success: "bg-success-500",
      warning: "bg-warning-500",
      error: "bg-error-500"
    }

    return (
      <div className={cn("space-y-2", className)} {...props}>
        <div
          ref={ref}
          className={cn("w-full bg-secondary-200 rounded-full overflow-hidden", sizeClasses[size])}
        >
          <motion.div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              variantClasses[variant]
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: animated ? 0.8 : 0, ease: "easeOut" }}
          />
        </div>
        {showPercentage && (
          <div className="text-center text-sm font-medium text-foreground">
            {percentage}%
          </div>
        )}
      </div>
    )
  }
)
Progress.displayName = "Progress"

interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  className?: string
  variant?: "default" | "success" | "warning" | "error"
  showPercentage?: boolean
  animated?: boolean
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ 
    className, 
    value, 
    max = 100, 
    size = 120,
    strokeWidth = 8,
    variant = "default", 
    showPercentage = true,
    animated = true,
    ...props 
  }, ref) => {
    const percentage = Math.round((value / max) * 100)
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference
    
    const variantColors = {
      default: "#0ea5e9", // primary-500
      success: "#22c55e", // success-500
      warning: "#f59e0b", // warning-500
      error: "#ef4444"    // error-500
    }

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e4e4e7"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={variantColors[variant]}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: animated ? strokeDashoffset : strokeDashoffset }}
            transition={{ duration: animated ? 0.8 : 0, ease: "easeOut" }}
          />
        </svg>
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium" style={{ color: variantColors[variant] }}>
              {percentage}%
            </span>
          </div>
        )}
      </div>
    )
  }
)
CircularProgress.displayName = "CircularProgress"

interface ProgressStepsProps {
  steps: Array<{
    id: string
    title: string
    description?: string
    status: 'completed' | 'current' | 'pending'
  }>
  className?: string
}

const ProgressSteps = React.forwardRef<HTMLDivElement, ProgressStepsProps>(
  ({ className, steps, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("", className)} {...props}>
        <nav aria-label="Progress">
          <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
            {steps.map((step, stepIdx) => (
              <li key={step.id} className="md:flex-1">
                <div
                  className={cn(
                    "group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0",
                    step.status === 'completed'
                      ? "border-success-600"
                      : step.status === 'current'
                      ? "border-primary-600"
                      : "border-secondary-200"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium",
                      step.status === 'completed'
                        ? "text-success-600"
                        : step.status === 'current'
                        ? "text-primary-600"
                        : "text-secondary-500"
                    )}
                  >
                    Step {stepIdx + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">{step.title}</span>
                  {step.description && (
                    <span className="text-sm text-foreground-muted">{step.description}</span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    )
  }
)
ProgressSteps.displayName = "ProgressSteps"

export { Progress, CircularProgress, ProgressSteps }