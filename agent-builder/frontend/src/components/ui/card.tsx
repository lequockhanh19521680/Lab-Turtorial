import * as React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"

import { cn } from "@/lib/utils"

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, keyof HTMLMotionProps<"div">>, HTMLMotionProps<"div"> {
  interactive?: boolean
  glass?: boolean
  gradient?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, glass = false, gradient = false, ...props }, ref) => {
    const baseClasses = "rounded-xl border bg-background text-foreground shadow-soft transition-all duration-200"
    const interactiveClasses = interactive ? "hover:shadow-medium hover:scale-[1.02] cursor-pointer" : ""
    const glassClasses = glass ? "bg-white/80 backdrop-blur-sm border-white/20" : ""
    const gradientClasses = gradient ? "bg-gradient-to-br from-background via-background to-background-secondary" : ""

    return (
      <motion.div
        ref={ref}
        className={cn(
          baseClasses,
          interactiveClasses,
          glassClasses,
          gradientClasses,
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={interactive ? { y: -2 } : undefined}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-2 p-6 pb-4", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-heading font-semibold leading-tight tracking-tight text-foreground",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-foreground-muted leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0 gap-3", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

// Enhanced Card variants
const CardStats = React.forwardRef<
  HTMLDivElement,
  CardProps & { icon?: React.ReactNode; value: string; label: string; trend?: number }
>(({ className, icon, value, label, trend, ...props }, ref) => (
  <Card ref={ref} className={cn("p-6", className)} interactive {...props}>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {icon && (
          <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
            {icon}
          </div>
        )}
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-foreground-muted">{label}</p>
        </div>
      </div>
      {trend !== undefined && (
        <div className={cn(
          "text-sm font-medium px-2 py-1 rounded-md",
          trend > 0 ? "text-success-700 bg-success-100" : trend < 0 ? "text-error-700 bg-error-100" : "text-secondary-700 bg-secondary-100"
        )}>
          {trend > 0 && "+"}
          {trend}%
        </div>
      )}
    </div>
  </Card>
))
CardStats.displayName = "CardStats"

const CardFeature = React.forwardRef<
  HTMLDivElement,
  CardProps & { icon?: React.ReactNode; title: string; description: string }
>(({ className, icon, title, description, ...props }, ref) => (
  <Card ref={ref} className={cn("p-6 text-center", className)} interactive {...props}>
    {icon && (
      <motion.div 
        className="mx-auto mb-4 p-3 w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {icon}
      </motion.div>
    )}
    <h4 className="text-lg font-heading font-semibold text-foreground mb-2">{title}</h4>
    <p className="text-sm text-foreground-muted leading-relaxed">{description}</p>
  </Card>
))
CardFeature.displayName = "CardFeature"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardStats,
  CardFeature
}