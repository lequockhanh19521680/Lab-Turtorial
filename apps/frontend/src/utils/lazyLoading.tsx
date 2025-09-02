import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Loading component for lazy-loaded components
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  showProgress?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Loading...', 
  showProgress = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`} />
      {message && (
        <p className="text-sm text-gray-600 animate-pulse">{message}</p>
      )}
      {showProgress && (
        <div className="w-32 bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '45%' }} />
        </div>
      )}
    </div>
  );
};

/**
 * Enhanced lazy loading with better error handling and loading states
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    name?: string;
    fallback?: React.ReactNode;
    errorFallback?: React.ReactNode;
    showLoadingProgress?: boolean;
    retryAttempts?: number;
  } = {}
) {
  const {
    name = 'LazyComponent',
    fallback,
    errorFallback,
    showLoadingProgress = false,
    retryAttempts = 3,
  } = options;

  // Enhanced import function with retry logic
  const importWithRetry = async (attemptCount = 0): Promise<{ default: T }> => {
    try {
      return await importFn();
    } catch (error) {
      if (attemptCount < retryAttempts) {
        console.warn(`Failed to load ${name}, retrying... (${attemptCount + 1}/${retryAttempts})`);
        
        // Exponential backoff
        const delay = Math.pow(2, attemptCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return importWithRetry(attemptCount + 1);
      }
      
      console.error(`Failed to load ${name} after ${retryAttempts} attempts:`, error);
      throw error;
    }
  };

  const LazyComponent = lazy(() => importWithRetry());

  const WrappedComponent: React.FC<React.ComponentProps<T>> = (props) => (
    <ErrorBoundary
      level="component"
      fallback={errorFallback}
      onError={(error) => {
        console.error(`Error in lazy component ${name}:`, error);
      }}
    >
      <Suspense
        fallback={
          fallback || (
            <LoadingSpinner
              size="md"
              message={`Loading ${name}...`}
              showProgress={showLoadingProgress}
            />
          )
        }
      >
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `Lazy(${name})`;

  return WrappedComponent;
}

/**
 * Preload lazy components for better performance
 */
export function preloadComponent(importFn: () => Promise<any>) {
  return importFn().catch(error => {
    console.warn('Failed to preload component:', error);
  });
}

/**
 * Route-based code splitting utilities
 */
export const LazyPages = {
  // Auth pages
  Login: createLazyComponent(
    () => import('@/pages/auth/LoginPage'),
    { name: 'LoginPage' }
  ),
  Register: createLazyComponent(
    () => import('@/pages/auth/RegisterPage'),
    { name: 'RegisterPage' }
  ),
  
  // Dashboard pages
  Dashboard: createLazyComponent(
    () => import('@/pages/dashboard/DashboardPage'),
    { name: 'DashboardPage', showLoadingProgress: true }
  ),
  
  // Project pages
  Projects: createLazyComponent(
    () => import('@/pages/projects/ProjectsPage'),
    { name: 'ProjectsPage', showLoadingProgress: true }
  ),
  ProjectDetail: createLazyComponent(
    () => import('@/pages/projects/ProjectDetailPage'),
    { name: 'ProjectDetailPage', showLoadingProgress: true }
  ),
  CreateProject: createLazyComponent(
    () => import('@/pages/projects/CreateProjectPage'),
    { name: 'CreateProjectPage' }
  ),
  
  // Settings pages
  Settings: createLazyComponent(
    () => import('@/pages/settings/SettingsPage'),
    { name: 'SettingsPage' }
  ),
  Profile: createLazyComponent(
    () => import('@/pages/settings/ProfilePage'),
    { name: 'ProfilePage' }
  ),
  
  // Admin pages
  AdminDashboard: createLazyComponent(
    () => import('@/pages/admin/AdminDashboardPage'),
    { name: 'AdminDashboardPage', showLoadingProgress: true }
  ),
  UserManagement: createLazyComponent(
    () => import('@/pages/admin/UserManagementPage'),
    { name: 'UserManagementPage', showLoadingProgress: true }
  ),
};

/**
 * Component-based lazy loading for heavy components
 */
export const LazyComponents = {
  // Chart components
  ProjectChart: createLazyComponent(
    () => import('@/components/charts/ProjectChart'),
    { name: 'ProjectChart' }
  ),
  AnalyticsChart: createLazyComponent(
    () => import('@/components/charts/AnalyticsChart'),
    { name: 'AnalyticsChart' }
  ),
  
  // Editor components
  CodeEditor: createLazyComponent(
    () => import('@/components/editors/CodeEditor'),
    { name: 'CodeEditor', showLoadingProgress: true }
  ),
  MarkdownEditor: createLazyComponent(
    () => import('@/components/editors/MarkdownEditor'),
    { name: 'MarkdownEditor' }
  ),
  
  // AI components
  AIChatInterface: createLazyComponent(
    () => import('@/components/AIChatInterface'),
    { name: 'AIChatInterface', showLoadingProgress: true }
  ),
  
  // File components
  FileUploader: createLazyComponent(
    () => import('@/components/FileUploader'),
    { name: 'FileUploader' }
  ),
  FilePreview: createLazyComponent(
    () => import('@/components/FilePreview'),
    { name: 'FilePreview' }
  ),
};

/**
 * Hook for lazy loading with loading states
 */
export const useLazyLoad = <T>(
  importFn: () => Promise<T>,
  dependencies: React.DependencyList = []
) => {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await importFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load'));
    } finally {
      setLoading(false);
    }
  }, dependencies);

  React.useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
};

/**
 * Higher-order component for adding lazy loading to any component
 */
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    threshold?: number; // Intersection observer threshold
    rootMargin?: string;
    fallback?: React.ReactNode;
  } = {}
) {
  const { threshold = 0.1, rootMargin = '50px', fallback } = options;

  const LazyWrapper: React.FC<P> = (props) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const [hasLoaded, setHasLoaded] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasLoaded) {
            setIsVisible(true);
            setHasLoaded(true);
            observer.disconnect();
          }
        },
        { threshold, rootMargin }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => observer.disconnect();
    }, [threshold, rootMargin, hasLoaded]);

    return (
      <div ref={ref}>
        {isVisible ? (
          <Component {...props} />
        ) : (
          fallback || <LoadingSpinner size="sm" message="Loading component..." />
        )}
      </div>
    );
  };

  LazyWrapper.displayName = `withLazyLoading(${Component.displayName || Component.name})`;

  return LazyWrapper;
}

/**
 * Utility for preloading components on user interaction
 */
export const usePreloader = () => {
  const preloadedComponents = React.useRef(new Set<string>());

  const preload = React.useCallback((
    name: string,
    importFn: () => Promise<any>
  ) => {
    if (preloadedComponents.current.has(name)) {
      return;
    }

    preloadedComponents.current.add(name);
    
    importFn()
      .then(() => {
        console.log(`✅ Preloaded component: ${name}`);
      })
      .catch((error) => {
        console.warn(`❌ Failed to preload component ${name}:`, error);
        preloadedComponents.current.delete(name);
      });
  }, []);

  const preloadOnHover = React.useCallback((
    name: string,
    importFn: () => Promise<any>
  ) => {
    return {
      onMouseEnter: () => preload(name, importFn),
      onFocus: () => preload(name, importFn),
    };
  }, [preload]);

  return { preload, preloadOnHover };
};