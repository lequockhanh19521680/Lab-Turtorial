import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  className?: string
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  label?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    value = 0, 
    max = 100, 
    className, 
    variant = 'default',
    size = 'md',
    showValue = false,
    label,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const sizeClasses = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4'
    }
    
    const variantClasses = {
      default: 'bg-primary',
      gradient: 'bg-gradient-to-r from-primary to-cyan-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500'
    }

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {(label || showValue) && (
          <div className="flex justify-between items-center mb-2">
            {label && <span className="text-sm font-medium text-foreground">{label}</span>}
            {showValue && (
              <span className="text-sm text-muted-foreground">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        <div className={cn(
          'w-full bg-muted rounded-full overflow-hidden',
          sizeClasses[size]
        )}>
          <div
            className={cn(
              'h-full transition-all duration-500 ease-out rounded-full',
              variantClasses[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)
Progress.displayName = 'Progress'

// Circular Progress Component
interface CircularProgressProps {
  value?: number
  max?: number
  size?: number
  strokeWidth?: number
  className?: string
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'error'
  showValue?: boolean
  children?: React.ReactNode
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className,
  variant = 'default',
  showValue = false,
  children
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  
  const variantColors = {
    default: '#0066FF',
    gradient: 'url(#gradient)',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {variant === 'gradient' && (
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0066FF" />
              <stop offset="100%" stopColor="#00CCFF" />
            </linearGradient>
          </defs>
        )}
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={variantColors[variant]}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {(showValue || children) && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children || (
            <span className="text-lg font-semibold text-foreground">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Step Progress Component
interface StepProgressProps {
  steps: Array<{
    label: string
    description?: string
    completed?: boolean
    current?: boolean
  }>
  className?: string
  variant?: 'horizontal' | 'vertical'
}

const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  className,
  variant = 'horizontal'
}) => {
  const isHorizontal = variant === 'horizontal'
  
  return (
    <div className={cn(
      'flex',
      isHorizontal ? 'items-center space-x-4' : 'flex-col space-y-4',
      className
    )}>
      {steps.map((step, index) => (
        <div key={index} className={cn(
          'flex',
          isHorizontal ? 'flex-col items-center' : 'items-center space-x-3'
        )}>
          <div className="flex items-center">
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200',
              step.completed
                ? 'bg-primary border-primary text-primary-foreground'
                : step.current
                ? 'border-primary text-primary bg-primary/10'
                : 'border-muted-foreground text-muted-foreground'
            )}>
              {step.completed ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            {index < steps.length - 1 && isHorizontal && (
              <div className={cn(
                'w-16 h-0.5 ml-2',
                step.completed ? 'bg-primary' : 'bg-muted'
              )} />
            )}
          </div>
          <div className={cn(
            'text-center',
            isHorizontal ? 'mt-2' : 'ml-3 flex-1'
          )}>
            <div className={cn(
              'text-sm font-medium',
              step.completed || step.current
                ? 'text-foreground'
                : 'text-muted-foreground'
            )}>
              {step.label}
            </div>
            {step.description && (
              <div className="text-xs text-muted-foreground mt-1">
                {step.description}
              </div>
            )}
          </div>
          {index < steps.length - 1 && !isHorizontal && (
            <div className={cn(
              'w-0.5 h-8 ml-4',
              step.completed ? 'bg-primary' : 'bg-muted'
            )} />
          )}
        </div>
      ))}
    </div>
  )
}

// Multi-Progress Component for multiple values
interface MultiProgressProps {
  items: Array<{
    label: string
    value: number
    color: string
  }>
  className?: string
  showLabels?: boolean
  showValues?: boolean
}

const MultiProgress: React.FC<MultiProgressProps> = ({
  items,
  className,
  showLabels = true,
  showValues = true
}) => {
  const total = items.reduce((sum, item) => sum + item.value, 0)
  
  return (
    <div className={cn('w-full', className)}>
      {showLabels && (
        <div className="flex justify-between items-center mb-2">
          <div className="flex flex-wrap gap-3">
            {items.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-foreground">{item.label}</span>
                {showValues && (
                  <span className="text-sm text-muted-foreground">
                    ({item.value})
                  </span>
                )}
              </div>
            ))}
          </div>
          {showValues && (
            <span className="text-sm text-muted-foreground">
              Total: {total}
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-muted rounded-full h-3 overflow-hidden flex">
        {items.map((item, index) => {
          const percentage = (item.value / total) * 100
          return (
            <div
              key={index}
              className="h-full transition-all duration-500 ease-out first:rounded-l-full last:rounded-r-full"
              style={{ 
                backgroundColor: item.color,
                width: `${percentage}%`
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

export { Progress as EnhancedProgress, CircularProgress as EnhancedCircularProgress, StepProgress, MultiProgress }