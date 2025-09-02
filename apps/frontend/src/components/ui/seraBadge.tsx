import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { seraPatterns } from "@/lib/seraTheme"

const seraBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-primary-200 bg-primary-100 text-primary-800 hover:bg-primary-200",
        secondary: "border-secondary-200 bg-secondary-100 text-secondary-800 hover:bg-secondary-200",
        destructive: "border-error-200 bg-error-100 text-error-800 hover:bg-error-200",
        success: "border-success-200 bg-success-100 text-success-800 hover:bg-success-200",
        warning: "border-warning-200 bg-warning-100 text-warning-800 hover:bg-warning-200",
        info: "border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100",
        outline: "border-secondary-300 bg-transparent text-secondary-700 hover:bg-secondary-100",
        gradient: "border-transparent bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600",
        
        // Status-specific variants
        pending: "border-warning-200 bg-warning-100 text-warning-800 animate-pulse-slow",
        inProgress: "border-primary-200 bg-primary-100 text-primary-800 animate-pulse",
        completed: "border-success-200 bg-success-100 text-success-800",
        failed: "border-error-200 bg-error-100 text-error-800",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1.5 text-xs",
        lg: "px-4 py-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface SeraBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof seraBadgeVariants> {
  icon?: React.ReactNode
  pulse?: boolean
  onRemove?: () => void
}

const SeraBadge = React.forwardRef<HTMLDivElement, SeraBadgeProps>(
  ({ 
    className, 
    variant, 
    size, 
    icon, 
    pulse = false,
    onRemove,
    children,
    ...props 
  }, ref) => {
    const badgeContent = (
      <>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="truncate">{children}</span>
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="ml-1 flex-shrink-0 rounded-full p-0.5 hover:bg-black/10 transition-colors"
            aria-label="Remove badge"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </>
    )

    return (
      <div 
        ref={ref}
        className={cn(
          seraBadgeVariants({ variant, size }), 
          pulse && "animate-pulse",
          className
        )} 
        {...props}
      >
        {badgeContent}
      </div>
    )
  }
)
SeraBadge.displayName = "SeraBadge"

// Status Badge Component - uses the SERA status patterns
export interface StatusBadgeProps extends Omit<SeraBadgeProps, 'variant' | 'icon' | 'children'> {
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  showIcon?: boolean
  customText?: string
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, showIcon = true, customText, ...props }, ref) => {
    const statusConfig = seraPatterns.status.variants[status]
    
    if (!statusConfig) {
      console.warn(`Unknown status: ${status}`)
      return null
    }

    const variantMap = {
      'pending': 'pending' as const,
      'in-progress': 'inProgress' as const,
      'completed': 'completed' as const,
      'failed': 'failed' as const,
    }

    const labelMap = {
      'pending': 'Pending',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'failed': 'Failed',
    }

    return (
      <SeraBadge
        ref={ref}
        variant={variantMap[status]}
        icon={showIcon ? statusConfig.icon : undefined}
        {...props}
      >
        {customText || labelMap[status]}
      </SeraBadge>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

// Priority Badge Component
export interface PriorityBadgeProps extends Omit<SeraBadgeProps, 'variant' | 'icon' | 'children'> {
  priority: 'low' | 'medium' | 'high' | 'urgent'
  showIcon?: boolean
}

const PriorityBadge = React.forwardRef<HTMLDivElement, PriorityBadgeProps>(
  ({ priority, showIcon = true, ...props }, ref) => {
    const priorityConfig = {
      low: {
        variant: 'secondary' as const,
        icon: '📘',
        label: 'Low',
      },
      medium: {
        variant: 'warning' as const,
        icon: '📙',
        label: 'Medium',
      },
      high: {
        variant: 'destructive' as const,
        icon: '📕',
        label: 'High',
      },
      urgent: {
        variant: 'gradient' as const,
        icon: '🚨',
        label: 'Urgent',
      },
    }

    const config = priorityConfig[priority]

    return (
      <SeraBadge
        ref={ref}
        variant={config.variant}
        icon={showIcon ? config.icon : undefined}
        {...props}
      >
        {config.label}
      </SeraBadge>
    )
  }
)
PriorityBadge.displayName = "PriorityBadge"

// Category Badge Component
export interface CategoryBadgeProps extends Omit<SeraBadgeProps, 'children'> {
  category: string
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

const CategoryBadge = React.forwardRef<HTMLDivElement, CategoryBadgeProps>(
  ({ category, color = 'primary', className, ...props }, ref) => {
    const colorMap = {
      primary: 'default',
      secondary: 'secondary',
      success: 'success',
      warning: 'warning',
      error: 'destructive',
    } as const

    return (
      <SeraBadge
        ref={ref}
        variant={colorMap[color]}
        className={cn("capitalize", className)}
        {...props}
      >
        {category}
      </SeraBadge>
    )
  }
)
CategoryBadge.displayName = "CategoryBadge"

export {
  SeraBadge,
  StatusBadge,
  PriorityBadge,
  CategoryBadge,
  seraBadgeVariants,
}