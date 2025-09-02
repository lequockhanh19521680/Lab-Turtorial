import * as React from "react"
import { cn } from "@/lib/utils"

// Page Container - Main layout wrapper
export interface SeraPageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const SeraPageContainer = React.forwardRef<HTMLDivElement, SeraPageContainerProps>(
  ({ className, size = 'xl', padding = 'md', children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'max-w-3xl',
      md: 'max-w-5xl', 
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
      full: 'max-w-full',
    }

    const paddingClasses = {
      none: '',
      sm: 'px-4 sm:px-6',
      md: 'px-4 sm:px-6 lg:px-8',
      lg: 'px-6 sm:px-8 lg:px-12',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto w-full',
          sizeClasses[size],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SeraPageContainer.displayName = "SeraPageContainer"

// Page Header - Consistent page headers
export interface SeraPageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  action?: React.ReactNode
  breadcrumb?: React.ReactNode
  badge?: React.ReactNode
}

const SeraPageHeader = React.forwardRef<HTMLDivElement, SeraPageHeaderProps>(
  ({ className, title, description, action, breadcrumb, badge, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('space-y-4 pb-8', className)}
      {...props}
    >
      {breadcrumb && (
        <div className="text-sm text-secondary-600">
          {breadcrumb}
        </div>
      )}
      
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-secondary-900">
              {title}
            </h1>
            {badge && badge}
          </div>
          {description && (
            <p className="text-lg text-secondary-600 max-w-3xl">
              {description}
            </p>
          )}
        </div>
        
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  )
)
SeraPageHeader.displayName = "SeraPageHeader"

// Grid Layouts
export interface SeraGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  responsive?: boolean
  autoFit?: boolean
  minItemWidth?: string
}

const SeraGrid = React.forwardRef<HTMLDivElement, SeraGridProps>(
  ({ 
    className, 
    cols = 3, 
    gap = 'md', 
    responsive = true,
    autoFit = false,
    minItemWidth = '300px',
    children, 
    ...props 
  }, ref) => {
    const gapClasses = {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-12',
    }

    const getGridClasses = () => {
      if (autoFit) {
        return `grid ${gapClasses[gap]}`
      }

      if (responsive) {
        const responsiveClasses = {
          1: 'grid grid-cols-1',
          2: 'grid grid-cols-1 md:grid-cols-2',
          3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
          4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
          5: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
          6: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
        }
        return `${responsiveClasses[cols]} ${gapClasses[gap]}`
      }

      return `grid grid-cols-${cols} ${gapClasses[gap]}`
    }

    const gridStyle = autoFit ? {
      gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`
    } : undefined

    return (
      <div
        ref={ref}
        className={cn(getGridClasses(), className)}
        style={gridStyle}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SeraGrid.displayName = "SeraGrid"

// Stack Layout - Vertical spacing
export interface SeraStackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  direction?: 'col' | 'row'
  wrap?: boolean
}

const SeraStack = React.forwardRef<HTMLDivElement, SeraStackProps>(
  ({ 
    className, 
    spacing = 'md', 
    align = 'stretch',
    justify = 'start',
    direction = 'col',
    wrap = false,
    children, 
    ...props 
  }, ref) => {
    const spacingClasses = {
      sm: direction === 'col' ? 'space-y-2' : 'space-x-2',
      md: direction === 'col' ? 'space-y-4' : 'space-x-4',
      lg: direction === 'col' ? 'space-y-6' : 'space-x-6',
      xl: direction === 'col' ? 'space-y-8' : 'space-x-8',
    }

    const alignClasses = {
      start: 'items-start',
      center: 'items-center', 
      end: 'items-end',
      stretch: 'items-stretch',
    }

    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          direction === 'col' ? 'flex-col' : 'flex-row',
          wrap && 'flex-wrap',
          spacingClasses[spacing],
          alignClasses[align],
          justifyClasses[justify],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SeraStack.displayName = "SeraStack"

// Section - Content sections with optional borders and backgrounds
export interface SeraSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: 'default' | 'bordered' | 'elevated' | 'subtle'
  spacing?: 'sm' | 'md' | 'lg'
}

const SeraSection = React.forwardRef<HTMLDivElement, SeraSectionProps>(
  ({ 
    className, 
    title, 
    description, 
    action,
    variant = 'default',
    spacing = 'md',
    children, 
    ...props 
  }, ref) => {
    const variantClasses = {
      default: '',
      bordered: 'border border-secondary-200 rounded-xl p-6',
      elevated: 'bg-white border border-secondary-200 rounded-xl p-6 shadow-soft',
      subtle: 'bg-secondary-50 rounded-xl p-6',
    }

    const spacingClasses = {
      sm: 'space-y-4',
      md: 'space-y-6',
      lg: 'space-y-8',
    }

    return (
      <div
        ref={ref}
        className={cn(
          spacingClasses[spacing],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {(title || description || action) && (
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              {title && (
                <h2 className="text-xl font-semibold text-secondary-900">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-secondary-600">
                  {description}
                </p>
              )}
            </div>
            {action && (
              <div className="flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    )
  }
)
SeraSection.displayName = "SeraSection"

// Divider - Visual separators
export interface SeraDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  variant?: 'solid' | 'dashed' | 'dotted'
  spacing?: 'sm' | 'md' | 'lg'
  label?: string
}

const SeraDivider = React.forwardRef<HTMLDivElement, SeraDividerProps>(
  ({ 
    className, 
    orientation = 'horizontal',
    variant = 'solid',
    spacing = 'md',
    label,
    ...props 
  }, ref) => {
    const spacingClasses = {
      sm: orientation === 'horizontal' ? 'my-4' : 'mx-4',
      md: orientation === 'horizontal' ? 'my-6' : 'mx-6',
      lg: orientation === 'horizontal' ? 'my-8' : 'mx-8',
    }

    const variantClasses = {
      solid: 'border-secondary-200',
      dashed: 'border-secondary-200 border-dashed',
      dotted: 'border-secondary-200 border-dotted',
    }

    if (label && orientation === 'horizontal') {
      return (
        <div className={cn('relative', spacingClasses[spacing], className)} ref={ref} {...props}>
          <div className="absolute inset-0 flex items-center">
            <div className={cn('w-full border-t', variantClasses[variant])} />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-secondary-500">{label}</span>
          </div>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          orientation === 'horizontal' ? 'border-t' : 'border-l',
          orientation === 'horizontal' ? 'w-full h-px' : 'w-px h-full',
          variantClasses[variant],
          spacingClasses[spacing],
          className
        )}
        {...props}
      />
    )
  }
)
SeraDivider.displayName = "SeraDivider"

export {
  SeraPageContainer,
  SeraPageHeader,
  SeraGrid,
  SeraStack,
  SeraSection,
  SeraDivider,
}