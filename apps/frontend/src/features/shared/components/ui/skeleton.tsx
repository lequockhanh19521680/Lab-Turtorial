import React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

function Skeleton({
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Enhanced skeleton variants
const SkeletonText = ({ className, ...props }: SkeletonProps) => (
  <Skeleton className={cn('h-4 bg-muted', className)} {...props} />
)

const SkeletonCircle = ({ className, ...props }: SkeletonProps) => (
  <Skeleton className={cn('rounded-full', className)} {...props} />
)

const SkeletonAvatar = ({ className, ...props }: SkeletonProps) => (
  <SkeletonCircle className={cn('w-10 h-10', className)} {...props} />
)

const SkeletonButton = ({ className, ...props }: SkeletonProps) => (
  <Skeleton className={cn('h-10 w-24 rounded-lg', className)} {...props} />
)

const SkeletonCard = ({ className, ...props }: SkeletonProps) => (
  <Skeleton className={cn('h-32 rounded-xl', className)} {...props} />
)

// Composite skeleton components
interface SkeletonCardWithHeaderProps {
  showAvatar?: boolean
  showButton?: boolean
  textLines?: number
  className?: string
}

const SkeletonCardWithHeader = ({ 
  showAvatar = true, 
  showButton = true, 
  textLines = 3,
  className 
}: SkeletonCardWithHeaderProps) => (
  <div className={cn('bg-card border border-border rounded-xl p-6 space-y-4', className)}>
    <div className="flex items-center space-x-3">
      {showAvatar && <SkeletonAvatar />}
      <div className="flex-1 space-y-2">
        <SkeletonText className="h-4 w-32" />
        <SkeletonText className="h-3 w-24" />
      </div>
      {showButton && <SkeletonButton />}
    </div>
    <div className="space-y-2">
      {Array.from({ length: textLines }).map((_, i) => (
        <SkeletonText 
          key={i} 
          className={i === textLines - 1 ? 'w-4/5' : 'w-full'} 
        />
      ))}
    </div>
  </div>
)

interface SkeletonProjectCardProps {
  className?: string
}

const SkeletonProjectCard = ({ className }: SkeletonProjectCardProps) => (
  <div className={cn('bg-card border border-border rounded-xl p-6 space-y-4', className)}>
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-2">
        <SkeletonText className="h-5 w-48" />
        <SkeletonText className="h-3 w-32" />
      </div>
      <SkeletonCircle className="w-6 h-6" />
    </div>
    <div className="space-y-2">
      <SkeletonText className="h-4 w-full" />
      <SkeletonText className="h-4 w-4/5" />
    </div>
    <div className="flex items-center justify-between">
      <div className="flex space-x-2">
        <SkeletonText className="h-6 w-16 rounded-full" />
        <SkeletonText className="h-6 w-20 rounded-full" />
      </div>
      <SkeletonText className="h-8 w-24 rounded-lg" />
    </div>
  </div>
)

export { 
  Skeleton, 
  SkeletonText, 
  SkeletonCircle, 
  SkeletonAvatar, 
  SkeletonButton, 
  SkeletonCard,
  SkeletonCardWithHeader,
  SkeletonProjectCard
}