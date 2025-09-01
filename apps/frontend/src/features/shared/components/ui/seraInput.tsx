import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const seraInputVariants = cva(
  "flex w-full rounded-lg border border-secondary-300 bg-white px-4 py-3 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-secondary-300 focus:border-primary-500",
        error: "border-error-500 focus:border-error-500 focus:ring-error-500",
        success: "border-success-500 focus:border-success-500 focus:ring-success-500",
        warning: "border-warning-500 focus:border-warning-500 focus:ring-warning-500",
      },
      size: {
        sm: "h-9 px-3 py-2 text-sm",
        md: "h-11 px-4 py-3 text-sm",
        lg: "h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface SeraInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof seraInputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
  success?: string
  helperText?: string
  label?: string
  required?: boolean
}

const SeraInput = React.forwardRef<HTMLInputElement, SeraInputProps>(
  ({ 
    className, 
    variant, 
    size, 
    type = "text",
    leftIcon,
    rightIcon,
    error,
    success,
    helperText,
    label,
    required,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${React.useId()}`
    
    // Determine variant based on state
    const effectiveVariant = error ? 'error' : success ? 'success' : variant

    const inputElement = (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-500">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          id={inputId}
          className={cn(
            seraInputVariants({ variant: effectiveVariant, size }),
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500">
            {rightIcon}
          </div>
        )}
      </div>
    )

    if (label || error || success || helperText) {
      return (
        <div className="space-y-2">
          {label && (
            <label 
              htmlFor={inputId}
              className="text-sm font-medium text-secondary-900"
            >
              {label}
              {required && <span className="text-error-500 ml-1">*</span>}
            </label>
          )}
          {inputElement}
          {(error || success || helperText) && (
            <div className="flex items-center space-x-2">
              {error && (
                <>
                  <svg className="w-4 h-4 text-error-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-error-600">{error}</p>
                </>
              )}
              {success && !error && (
                <>
                  <svg className="w-4 h-4 text-success-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-success-600">{success}</p>
                </>
              )}
              {helperText && !error && !success && (
                <p className="text-sm text-secondary-600">{helperText}</p>
              )}
            </div>
          )}
        </div>
      )
    }

    return inputElement
  }
)
SeraInput.displayName = "SeraInput"

// Textarea component
const seraTextareaVariants = cva(
  "flex min-h-[80px] w-full rounded-lg border border-secondary-300 bg-white px-4 py-3 text-sm transition-all duration-200 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
  {
    variants: {
      variant: {
        default: "border-secondary-300 focus:border-primary-500",
        error: "border-error-500 focus:border-error-500 focus:ring-error-500",
        success: "border-success-500 focus:border-success-500 focus:ring-success-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface SeraTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof seraTextareaVariants> {
  error?: string
  success?: string
  helperText?: string
  label?: string
  required?: boolean
  resize?: boolean
}

const SeraTextarea = React.forwardRef<HTMLTextAreaElement, SeraTextareaProps>(
  ({ 
    className, 
    variant,
    error,
    success,
    helperText,
    label,
    required,
    resize = false,
    id,
    ...props 
  }, ref) => {
    const textareaId = id || `textarea-${React.useId()}`
    
    // Determine variant based on state
    const effectiveVariant = error ? 'error' : success ? 'success' : variant

    const textareaElement = (
      <textarea
        ref={ref}
        id={textareaId}
        className={cn(
          seraTextareaVariants({ variant: effectiveVariant }),
          resize && "resize-y",
          className
        )}
        {...props}
      />
    )

    if (label || error || success || helperText) {
      return (
        <div className="space-y-2">
          {label && (
            <label 
              htmlFor={textareaId}
              className="text-sm font-medium text-secondary-900"
            >
              {label}
              {required && <span className="text-error-500 ml-1">*</span>}
            </label>
          )}
          {textareaElement}
          {(error || success || helperText) && (
            <div className="flex items-center space-x-2">
              {error && (
                <>
                  <svg className="w-4 h-4 text-error-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-error-600">{error}</p>
                </>
              )}
              {success && !error && (
                <>
                  <svg className="w-4 h-4 text-success-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-success-600">{success}</p>
                </>
              )}
              {helperText && !error && !success && (
                <p className="text-sm text-secondary-600">{helperText}</p>
              )}
            </div>
          )}
        </div>
      )
    }

    return textareaElement
  }
)
SeraTextarea.displayName = "SeraTextarea"

// Search Input Component
export interface SearchInputProps extends Omit<SeraInputProps, 'leftIcon' | 'type'> {
  onClear?: () => void
  loading?: boolean
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onClear, loading, value, ...props }, ref) => {
    const searchIcon = (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )

    const rightIcon = loading ? (
      <div className="animate-spin">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    ) : value && onClear ? (
      <button
        type="button"
        onClick={onClear}
        className="hover:text-secondary-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    ) : null

    return (
      <SeraInput
        ref={ref}
        type="search"
        leftIcon={searchIcon}
        rightIcon={rightIcon}
        value={value}
        {...props}
      />
    )
  }
)
SearchInput.displayName = "SearchInput"

export {
  SeraInput,
  SeraTextarea,
  SearchInput,
  seraInputVariants,
  seraTextareaVariants,
}