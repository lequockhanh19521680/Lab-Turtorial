import * as React from "react"
import { cn } from "@/lib/utils"

// Loading Spinner Component
export interface SeraSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'white'
  thickness?: 'thin' | 'medium' | 'thick'
}

const SeraSpinner = React.forwardRef<HTMLDivElement, SeraSpinnerProps>(
  ({ className, size = 'md', variant = 'primary', thickness = 'medium', ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12',
    }

    const thicknessClasses = {
      thin: 'border-2',
      medium: 'border-4',
      thick: 'border-6',
    }

    const variantClasses = {
      primary: 'border-primary-200 border-t-primary-600',
      secondary: 'border-secondary-200 border-t-secondary-600',
      white: 'border-white/20 border-t-white',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'animate-spin rounded-full',
          sizeClasses[size],
          thicknessClasses[thickness],
          variantClasses[variant],
          className
        )}
        {...props}
      />
    )
  }
)
SeraSpinner.displayName = "SeraSpinner"

// Loading State Component
export interface SeraLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'center' | 'inline' | 'overlay'
  spinner?: boolean
}

const SeraLoading = React.forwardRef<HTMLDivElement, SeraLoadingProps>(
  ({ 
    className, 
    text = 'Loading...', 
    size = 'md', 
    variant = 'center',
    spinner = true,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    }

    const spinnerSizes = {
      sm: 'sm' as const,
      md: 'md' as const,
      lg: 'lg' as const,
    }

    const baseContent = (
      <div className="flex items-center space-x-3">
        {spinner && <SeraSpinner size={spinnerSizes[size]} />}
        <span className={cn('text-secondary-600', sizeClasses[size])}>
          {text}
        </span>
      </div>
    )

    const variantClasses = {
      center: 'flex items-center justify-center py-12',
      inline: 'flex items-center',
      overlay: 'fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50',
    }

    return (
      <div
        ref={ref}
        className={cn(variantClasses[variant], className)}
        {...props}
      >
        {baseContent}
      </div>
    )
  }
)
SeraLoading.displayName = "SeraLoading"

// Skeleton Component for loading placeholders
export interface SeraSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded'
  width?: string | number
  height?: string | number
  lines?: number
  animation?: 'pulse' | 'wave' | 'none'
}

const SeraSkeleton = React.forwardRef<HTMLDivElement, SeraSkeletonProps>(
  ({ 
    className, 
    variant = 'text',
    width,
    height,
    lines = 1,
    animation = 'pulse',
    style,
    ...props 
  }, ref) => {
    const variantClasses = {
      text: 'h-4 rounded',
      rectangular: 'rounded',
      circular: 'rounded-full',
      rounded: 'rounded-lg',
    }

    const animationClasses = {
      pulse: 'animate-pulse',
      wave: 'animate-pulse', // Could implement wave animation with CSS
      none: '',
    }

    const skeletonStyle = {
      width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
      height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
      ...style,
    }

    if (variant === 'text' && lines > 1) {
      return (
        <div className={cn('space-y-2', className)} ref={ref} {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'bg-secondary-200',
                variantClasses[variant],
                animationClasses[animation],
                index === lines - 1 && 'w-3/4' // Make last line shorter
              )}
              style={skeletonStyle}
            />
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-secondary-200',
          variantClasses[variant],
          animationClasses[animation],
          className
        )}
        style={skeletonStyle}
        {...props}
      />
    )
  }
)
SeraSkeleton.displayName = "SeraSkeleton"

// Progress Component
export interface SeraProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  variant?: 'default' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
}

const SeraProgress = React.forwardRef<HTMLDivElement, SeraProgressProps>(
  ({ 
    className, 
    value, 
    max = 100, 
    variant = 'default',
    size = 'md',
    showLabel = false,
    animated = false,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    }

    const variantClasses = {
      default: 'bg-primary-600',
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      error: 'bg-error-500',
    }

    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
        {...props}
      >
        {showLabel && (
          <div className="flex justify-between text-sm">
            <span className="text-secondary-600">Progress</span>
            <span className="text-secondary-900 font-medium">{Math.round(percentage)}%</span>
          </div>
        )}
        <div className={cn('w-full bg-secondary-200 rounded-full overflow-hidden', sizeClasses[size])}>
          <div
            className={cn(
              'h-full transition-all duration-300 ease-out rounded-full',
              variantClasses[variant],
              animated && 'animate-pulse'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)
SeraProgress.displayName = "SeraProgress"

// Empty State Component
export interface SeraEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const SeraEmptyState = React.forwardRef<HTMLDivElement, SeraEmptyStateProps>(
  ({ 
    className, 
    icon, 
    title, 
    description, 
    action,
    size = 'md',
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: {
        container: 'py-8',
        icon: 'w-8 h-8',
        title: 'text-lg',
        description: 'text-sm',
      },
      md: {
        container: 'py-12',
        icon: 'w-12 h-12',
        title: 'text-xl',
        description: 'text-base',
      },
      lg: {
        container: 'py-16',
        icon: 'w-16 h-16',
        title: 'text-2xl',
        description: 'text-lg',
      },
    }

    return (
      <div
        ref={ref}
        className={cn(
          'text-center',
          sizeClasses[size].container,
          className
        )}
        {...props}
      >
        {icon && (
          <div className={cn(
            'mx-auto text-secondary-400 mb-4',
            sizeClasses[size].icon
          )}>
            {icon}
          </div>
        )}
        <h3 className={cn(
          'font-medium text-secondary-900 mb-2',
          sizeClasses[size].title
        )}>
          {title}
        </h3>
        {description && (
          <p className={cn(
            'text-secondary-600 mb-6 max-w-sm mx-auto',
            sizeClasses[size].description
          )}>
            {description}
          </p>
        )}
        {action && (
          <div className="flex justify-center">
            {action}
          </div>
        )}
      </div>
    )
  }
)
SeraEmptyState.displayName = "SeraEmptyState"

// Error State Component
export interface SeraErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  action?: React.ReactNode
  onRetry?: () => void
  size?: 'sm' | 'md' | 'lg'
}

const SeraErrorState = React.forwardRef<HTMLDivElement, SeraErrorStateProps>(
  ({ 
    className, 
    title, 
    description, 
    action,
    onRetry,
    size = 'md',
    ...props 
  }, ref) => {
    const errorIcon = (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    )

    return (
      <SeraEmptyState
        ref={ref}
        icon={<div className="text-error-500">{errorIcon}</div>}
        title={title}
        description={description}
        size={size}
        action={action || (onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-error-600 hover:bg-error-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500"
          >
            Try again
          </button>
        ))}
        className={className}
        {...props}
      />
    )
  }
)
SeraErrorState.displayName = "SeraErrorState"

export {
  SeraSpinner,
  SeraLoading,
  SeraSkeleton,
  SeraProgress,
  SeraEmptyState,
  SeraErrorState,
}