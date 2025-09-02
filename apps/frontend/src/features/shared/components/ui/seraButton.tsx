import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const seraButtonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        // Primary - main call-to-action
        primary: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-soft hover:shadow-medium hover:shadow-primary-500/25 hover:-translate-y-0.5",
        
        // Secondary - supporting actions
        secondary: "bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300 shadow-soft hover:shadow-medium",
        
        // Destructive - dangerous actions
        destructive: "bg-error-500 text-white hover:bg-error-600 active:bg-error-700 shadow-soft hover:shadow-medium hover:shadow-error-500/25 hover:-translate-y-0.5",
        
        // Outline - secondary actions with border
        outline: "border border-secondary-300 bg-white text-secondary-900 hover:bg-secondary-50 hover:border-secondary-400 active:bg-secondary-100 shadow-soft hover:shadow-medium",
        
        // Ghost - minimal actions
        ghost: "text-secondary-700 hover:bg-secondary-100 active:bg-secondary-200 hover:text-secondary-900",
        
        // Link - text-only actions
        link: "text-primary-600 hover:text-primary-700 active:text-primary-800 underline-offset-4 hover:underline p-0",
        
        // Gradient - premium actions
        gradient: "bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:from-primary-700 hover:to-accent-700 active:from-primary-800 active:to-accent-800 shadow-soft hover:shadow-glow hover:-translate-y-0.5",
        
        // Success - positive actions
        success: "bg-success-500 text-white hover:bg-success-600 active:bg-success-700 shadow-soft hover:shadow-medium hover:shadow-success-500/25 hover:-translate-y-0.5",
        
        // Warning - cautionary actions
        warning: "bg-warning-500 text-white hover:bg-warning-600 active:bg-warning-700 shadow-soft hover:shadow-medium hover:shadow-warning-500/25 hover:-translate-y-0.5",
      },
      size: {
        sm: "h-8 px-4 text-sm rounded-md",
        md: "h-10 px-6 text-sm",
        lg: "h-12 px-8 text-base rounded-lg",
        xl: "h-14 px-10 text-lg font-semibold rounded-xl",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface SeraButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof seraButtonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loadingText?: string
}

const SeraButton = React.forwardRef<HTMLButtonElement, SeraButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    leftIcon,
    rightIcon,
    loadingText,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const buttonContent = (
      <>
        {loading && (
          <div className="mr-2 animate-spin">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
        {leftIcon && !loading && (
          <span className="mr-2 flex-shrink-0">{leftIcon}</span>
        )}
        <span className="truncate">
          {loading && loadingText ? loadingText : children}
        </span>
        {rightIcon && !loading && (
          <span className="ml-2 flex-shrink-0">{rightIcon}</span>
        )}
      </>
    )

    return (
      <Comp
        className={cn(seraButtonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {buttonContent}
      </Comp>
    )
  }
)
SeraButton.displayName = "SeraButton"

// Specialized button components for common use cases
export const PrimaryButton = React.forwardRef<HTMLButtonElement, Omit<SeraButtonProps, 'variant'>>(
  (props, ref) => <SeraButton variant="primary" ref={ref} {...props} />
)

export const SecondaryButton = React.forwardRef<HTMLButtonElement, Omit<SeraButtonProps, 'variant'>>(
  (props, ref) => <SeraButton variant="secondary" ref={ref} {...props} />
)

export const DangerButton = React.forwardRef<HTMLButtonElement, Omit<SeraButtonProps, 'variant'>>(
  (props, ref) => <SeraButton variant="destructive" ref={ref} {...props} />
)

export const GhostButton = React.forwardRef<HTMLButtonElement, Omit<SeraButtonProps, 'variant'>>(
  (props, ref) => <SeraButton variant="ghost" ref={ref} {...props} />
)

export const GradientButton = React.forwardRef<HTMLButtonElement, Omit<SeraButtonProps, 'variant'>>(
  (props, ref) => <SeraButton variant="gradient" ref={ref} {...props} />
)

PrimaryButton.displayName = "PrimaryButton"
SecondaryButton.displayName = "SecondaryButton"
DangerButton.displayName = "DangerButton"
GhostButton.displayName = "GhostButton"
GradientButton.displayName = "GradientButton"

export { SeraButton, seraButtonVariants }