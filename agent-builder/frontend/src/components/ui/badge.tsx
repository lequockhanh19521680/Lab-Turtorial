import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-primary-200 bg-primary-100 text-primary-800 hover:bg-primary-200",
        secondary: "border-secondary-200 bg-secondary-100 text-secondary-800 hover:bg-secondary-200",
        destructive: "border-error-200 bg-error-100 text-error-800 hover:bg-error-200",
        success: "border-success-200 bg-success-100 text-success-800 hover:bg-success-200",
        warning: "border-warning-200 bg-warning-100 text-warning-800 hover:bg-warning-200",
        info: "border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100",
        outline: "border-border bg-transparent text-foreground hover:bg-secondary-100",
        gradient: "border-transparent bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600",
        pending: "border-warning-200 bg-warning-100 text-warning-800 animate-pulse-slow",
        inProgress: "border-primary-200 bg-primary-100 text-primary-800 animate-pulse",
        completed: "border-success-200 bg-success-100 text-success-800",
        failed: "border-error-200 bg-error-100 text-error-800",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-3 py-1.5 text-xs",
        lg: "px-4 py-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
  animated?: boolean
  onRemove?: () => void
}

function Badge({ 
  className, 
  variant, 
  size, 
  icon, 
  animated = false, 
  onRemove,
  children,
  ...props 
}: BadgeProps) {
  const badgeContent = (
    <>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
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

  if (animated) {
    return (
      <motion.div 
        className={cn(badgeVariants({ variant, size }), className)} 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {badgeContent}
      </motion.div>
    )
  }

  return (
    <div 
      className={cn(badgeVariants({ variant, size }), className)} 
      {...props}
    >
      {badgeContent}
    </div>
  )
}

// Status-specific badge components for better UX
const StatusBadge = ({ status, ...props }: Omit<BadgeProps, 'variant'> & { status: 'pending' | 'in-progress' | 'completed' | 'failed' }) => {
  const variantMap = {
    'pending': 'pending' as const,
    'in-progress': 'inProgress' as const,
    'completed': 'completed' as const,
    'failed': 'failed' as const,
  }

  const iconMap = {
    'pending': '⏳',
    'in-progress': '🔄',
    'completed': '✅',
    'failed': '❌',
  }

  const labelMap = {
    'pending': 'Pending',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'failed': 'Failed',
  }

  return (
    <Badge
      variant={variantMap[status]}
      icon={iconMap[status]}
      animated
      {...props}
    >
      {labelMap[status]}
    </Badge>
  )
}

export { Badge, StatusBadge, badgeVariants }