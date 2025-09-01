import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const seraCardVariants = cva(
  "rounded-xl border bg-white shadow-soft transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-secondary-200 hover:shadow-medium",
        elevated: "border-secondary-200 shadow-medium hover:shadow-lg",
        interactive: "border-secondary-200 hover:shadow-medium hover:-translate-y-1 cursor-pointer",
        outline: "border-2 border-primary-200 bg-primary-50/50",
        glass: "backdrop-blur-sm bg-white/80 border-white/20 shadow-lg",
        gradient: "bg-gradient-to-br from-white to-secondary-50 border-secondary-200 shadow-medium",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
)

export interface SeraCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof seraCardVariants> {
  hover?: boolean
}

const SeraCard = React.forwardRef<HTMLDivElement, SeraCardProps>(
  ({ className, variant, padding, hover = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        seraCardVariants({ variant, padding }),
        hover && "hover:shadow-medium hover:-translate-y-1",
        className
      )}
      {...props}
    />
  )
)
SeraCard.displayName = "SeraCard"

const SeraCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
))
SeraCardHeader.displayName = "SeraCardHeader"

const SeraCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-semibold leading-none tracking-tight text-secondary-900",
      className
    )}
    {...props}
  />
))
SeraCardTitle.displayName = "SeraCardTitle"

const SeraCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-secondary-600", className)}
    {...props}
  />
))
SeraCardDescription.displayName = "SeraCardDescription"

const SeraCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
SeraCardContent.displayName = "SeraCardContent"

const SeraCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-6", className)}
    {...props}
  />
))
SeraCardFooter.displayName = "SeraCardFooter"

// Specialized card components
export interface StatsCardProps extends Omit<SeraCardProps, 'children'> {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: string
    isPositive: boolean
  }
  loading?: boolean
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ title, value, description, icon, trend, loading, className, ...props }, ref) => (
    <SeraCard ref={ref} variant="elevated" className={cn("", className)} {...props}>
      <SeraCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <SeraCardTitle className="text-sm font-medium">{title}</SeraCardTitle>
        {icon && <div className="text-secondary-500">{icon}</div>}
      </SeraCardHeader>
      <SeraCardContent>
        <div className="space-y-1">
          {loading ? (
            <div className="h-8 w-20 bg-secondary-200 rounded animate-pulse" />
          ) : (
            <div className="text-2xl font-bold text-secondary-900">{value}</div>
          )}
          
          {(description || trend) && (
            <div className="flex items-center space-x-2">
              {description && (
                <p className="text-xs text-secondary-600">{description}</p>
              )}
              {trend && (
                <span 
                  className={cn(
                    "text-xs font-medium",
                    trend.isPositive ? "text-success-600" : "text-error-600"
                  )}
                >
                  {trend.isPositive ? "↗" : "↘"} {trend.value}
                </span>
              )}
            </div>
          )}
        </div>
      </SeraCardContent>
    </SeraCard>
  )
)
StatsCard.displayName = "StatsCard"

export interface FeatureCardProps extends Omit<SeraCardProps, 'children'> {
  title: string
  description: string
  icon?: React.ReactNode
  action?: React.ReactNode
  badge?: React.ReactNode
  image?: string
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ title, description, icon, action, badge, image, className, ...props }, ref) => (
    <SeraCard 
      ref={ref} 
      variant="interactive" 
      className={cn("group", className)} 
      {...props}
    >
      {image && (
        <div className="aspect-video w-full overflow-hidden rounded-t-xl">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className={cn(image ? "p-6" : "")}>
        <SeraCardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {icon && (
                <div className="flex-shrink-0 p-2 bg-primary-100 rounded-lg text-primary-600">
                  {icon}
                </div>
              )}
              <div>
                <SeraCardTitle className="group-hover:text-primary-600 transition-colors">
                  {title}
                </SeraCardTitle>
                {badge && <div className="mt-2">{badge}</div>}
              </div>
            </div>
          </div>
        </SeraCardHeader>
        
        <SeraCardContent className="mt-4">
          <SeraCardDescription>{description}</SeraCardDescription>
        </SeraCardContent>
        
        {action && (
          <SeraCardFooter>
            {action}
          </SeraCardFooter>
        )}
      </div>
    </SeraCard>
  )
)
FeatureCard.displayName = "FeatureCard"

export {
  SeraCard,
  SeraCardHeader,
  SeraCardFooter,
  SeraCardTitle,
  SeraCardDescription,
  SeraCardContent,
  StatsCard,
  FeatureCard,
  seraCardVariants,
}