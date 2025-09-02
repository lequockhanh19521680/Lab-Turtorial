// SERA UI Component Library - Main Export File
// This provides a clean import interface for all SERA UI components

// Core Components
export * from './seraButton'
export * from './seraCard' 
export * from './seraBadge'
export * from './seraInput'

// Layout Components  
export * from './seraLayout'

// Loading & State Components
export * from './seraLoading'

// Theme & Design Tokens
export { default as seraTheme, seraPatterns, seraUtils } from '../../lib/seraTheme'

// Re-export commonly used combinations
export {
  // Button combinations
  PrimaryButton,
  SecondaryButton, 
  DangerButton,
  GhostButton,
  GradientButton,
} from './seraButton'

export {
  // Card combinations
  StatsCard,
  FeatureCard,
} from './seraCard'

export {
  // Badge combinations  
  StatusBadge,
  PriorityBadge,
  CategoryBadge,
} from './seraBadge'

export {
  // Input combinations
  SearchInput,
} from './seraInput'

export {
  // Loading combinations
  SeraSpinner,
  SeraLoading,
  SeraSkeleton,
  SeraProgress,
  SeraEmptyState,
  SeraErrorState,
} from './seraLoading'

export {
  // Layout combinations
  SeraPageContainer,
  SeraPageHeader,
  SeraGrid,
  SeraStack,
  SeraSection,
  SeraDivider,
} from './seraLayout'