// SERA UI Design System Foundation
// Based on the existing patterns in Dashboard and other components

export const seraTheme = {
  // Color Palette
  colors: {
    // Primary colors (main brand colors)
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Secondary colors (supporting colors)
    secondary: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    
    // Accent colors (highlights and calls-to-action)
    accent: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843',
    },
    
    // Semantic colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    
    // Neutral colors for text and backgrounds
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
  },
  
  // Typography Scale
  typography: {
    // Font families
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      serif: ['ui-serif', 'Georgia', 'Cambria', 'serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      display: ['Figtree', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    
    // Font sizes
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
    },
    
    // Font weights
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },
  
  // Spacing Scale
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  
  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000',
    soft: '0 2px 8px rgba(0, 0, 0, 0.08)',
    medium: '0 4px 12px rgba(0, 0, 0, 0.12)',
    glow: '0 0 20px rgba(59, 130, 246, 0.15)',
  },
  
  // Animation & Transitions
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  
  // Component-specific design tokens
  components: {
    // Button variants
    button: {
      size: {
        sm: {
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          borderRadius: '0.375rem',
        },
        md: {
          padding: '0.625rem 1.5rem',
          fontSize: '1rem',
          borderRadius: '0.5rem',
        },
        lg: {
          padding: '0.75rem 2rem',
          fontSize: '1.125rem',
          borderRadius: '0.5rem',
        },
      },
    },
    
    // Card variants
    card: {
      padding: {
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
      },
      
      borderRadius: '0.75rem',
      background: 'white',
      border: '1px solid rgb(229 231 235)',
      shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    },
    
    // Input variants
    input: {
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      border: '1px solid rgb(209 213 219)',
      fontSize: '1rem',
      
      focus: {
        borderColor: 'rgb(59 130 246)',
        ring: '0 0 0 2px rgb(59 130 246 / 0.2)',
      },
    },
  },
}

// Component Design Patterns
export const seraPatterns = {
  // Layout patterns
  layouts: {
    // Dashboard grid layout
    dashboard: {
      gap: '2rem',
      gridTemplate: 'grid grid-cols-1 gap-6 lg:grid-cols-12',
    },
    
    // Card grid
    cardGrid: {
      base: 'grid gap-6',
      responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
      autoFit: 'grid gap-6 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]',
    },
    
    // Page container
    pageContainer: {
      padding: 'px-4 sm:px-6 lg:px-8',
      maxWidth: 'max-w-7xl mx-auto',
      spacing: 'space-y-8',
    },
  },
  
  // Interaction patterns
  interactions: {
    // Hover effects
    hover: {
      lift: 'transition-all duration-200 hover:-translate-y-1 hover:shadow-lg',
      glow: 'transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
      scale: 'transition-transform duration-200 hover:scale-105',
    },
    
    // Loading states
    loading: {
      skeleton: 'animate-pulse bg-gray-200 rounded',
      spinner: 'animate-spin rounded-full border-2 border-gray-300 border-t-primary-600',
    },
    
    // Focus states
    focus: {
      ring: 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
      within: 'focus-within:ring-2 focus-within:ring-primary-500',
    },
  },
  
  // Status patterns
  status: {
    // Status colors and icons
    variants: {
      pending: {
        color: 'warning',
        icon: '⏳',
        className: 'bg-warning-100 text-warning-800 border-warning-200',
      },
      'in-progress': {
        color: 'primary',
        icon: '🔄',
        className: 'bg-primary-100 text-primary-800 border-primary-200 animate-pulse',
      },
      completed: {
        color: 'success',
        icon: '✅',
        className: 'bg-success-100 text-success-800 border-success-200',
      },
      failed: {
        color: 'error',
        icon: '❌',
        className: 'bg-error-100 text-error-800 border-error-200',
      },
    },
  },
  
  // Content patterns
  content: {
    // Empty states
    emptyState: {
      container: 'text-center py-12',
      icon: 'mx-auto h-12 w-12 text-gray-400',
      title: 'mt-2 text-sm font-medium text-gray-900',
      description: 'mt-1 text-sm text-gray-500',
      action: 'mt-6',
    },
    
    // Error states
    errorState: {
      container: 'text-center py-12',
      icon: 'mx-auto h-12 w-12 text-red-500',
      title: 'mt-2 text-sm font-medium text-gray-900',
      description: 'mt-1 text-sm text-gray-500',
      retry: 'mt-6',
    },
  },
}

// Utility functions for consistent styling
export const seraUtils = {
  // Generate status classes
  getStatusClasses: (status: string) => {
    const variant = seraPatterns.status.variants[status as keyof typeof seraPatterns.status.variants]
    return variant?.className || seraPatterns.status.variants.pending.className
  },
  
  // Generate responsive padding
  getResponsivePadding: (size: 'sm' | 'md' | 'lg' = 'md') => {
    const paddingMap = {
      sm: 'p-4 sm:p-6',
      md: 'p-6 sm:p-8',
      lg: 'p-8 sm:p-12',
    }
    return paddingMap[size]
  },
  
  // Generate shadow classes
  getShadowClasses: (variant: 'soft' | 'medium' | 'glow' = 'soft') => {
    const shadowMap = {
      soft: 'shadow-soft',
      medium: 'shadow-medium',
      glow: 'shadow-glow',
    }
    return shadowMap[variant]
  },
  
  // Generate animation classes
  getAnimationClasses: (type: 'lift' | 'glow' | 'scale' = 'lift') => {
    return seraPatterns.interactions.hover[type]
  },
}

export default seraTheme