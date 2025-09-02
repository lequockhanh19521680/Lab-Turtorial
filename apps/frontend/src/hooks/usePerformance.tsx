import { useEffect, useRef, useCallback, useMemo } from 'react';

// Performance monitoring types
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ComponentPerformance {
  renderTime: number;
  mountTime: number;
  updateCount: number;
  lastRenderTimestamp: number;
}

/**
 * Hook for monitoring component performance
 */
export const usePerformanceMonitor = (componentName: string, enabled = true) => {
  const mountTimeRef = useRef<number>(Date.now());
  const renderCountRef = useRef<number>(0);
  const lastRenderRef = useRef<number>(Date.now());
  const metricsRef = useRef<PerformanceMetric[]>([]);

  const reportMetric = useCallback((metric: PerformanceMetric) => {
    if (!enabled) return;
    
    metricsRef.current.push(metric);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 [${componentName}] ${metric.name}: ${metric.value}ms`, metric.metadata);
    }
    
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Send to analytics service like Google Analytics, DataDog, etc.
      // window.gtag?.('event', 'component_performance', {
      //   component_name: componentName,
      //   metric_name: metric.name,
      //   metric_value: metric.value,
      //   ...metric.metadata
      // });
    }
  }, [componentName, enabled]);

  const measureRender = useCallback(() => {
    if (!enabled) return;
    
    const now = Date.now();
    const renderTime = now - lastRenderRef.current;
    renderCountRef.current += 1;
    lastRenderRef.current = now;

    reportMetric({
      name: 'render_time',
      value: renderTime,
      timestamp: now,
      metadata: {
        renderCount: renderCountRef.current,
        componentName,
      },
    });
  }, [componentName, enabled, reportMetric]);

  // Measure mount time
  useEffect(() => {
    if (!enabled) return;
    
    const mountTime = Date.now() - mountTimeRef.current;
    
    reportMetric({
      name: 'mount_time',
      value: mountTime,
      timestamp: Date.now(),
      metadata: {
        componentName,
      },
    });
  }, [componentName, enabled, reportMetric]);

  // Measure render time
  useEffect(() => {
    measureRender();
  });

  const getMetrics = useCallback((): ComponentPerformance => {
    const now = Date.now();
    const metrics = metricsRef.current;
    
    const mountMetric = metrics.find(m => m.name === 'mount_time');
    const renderMetrics = metrics.filter(m => m.name === 'render_time');
    
    return {
      renderTime: renderMetrics.length > 0 
        ? renderMetrics.reduce((sum, m) => sum + m.value, 0) / renderMetrics.length 
        : 0,
      mountTime: mountMetric?.value || 0,
      updateCount: renderCountRef.current,
      lastRenderTimestamp: lastRenderRef.current,
    };
  }, []);

  return {
    measureRender,
    reportMetric,
    getMetrics,
    renderCount: renderCountRef.current,
  };
};

/**
 * Hook for measuring and optimizing expensive computations
 */
export const useComputationMetrics = <T>(
  computation: () => T,
  deps: React.DependencyList,
  name: string,
  threshold = 10 // ms
): T => {
  return useMemo(() => {
    const start = performance.now();
    const result = computation();
    const duration = performance.now() - start;

    if (duration > threshold) {
      console.warn(`🐌 Slow computation detected: ${name} took ${duration.toFixed(2)}ms`);
      
      // Report slow computation
      if (process.env.NODE_ENV === 'development') {
        console.log(`Computation "${name}" exceeded threshold of ${threshold}ms`);
      }
    }

    return result;
  }, deps);
};

/**
 * Hook for debouncing values to improve performance
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for throttling function calls
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef<number>(Date.now());

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastRun.current >= delay) {
      lastRun.current = now;
      return callback(...args);
    }
  }, [callback, delay]) as T;
};

/**
 * Hook for measuring network request performance
 */
export const useNetworkMetrics = () => {
  const measureRequest = useCallback(async <T>(
    name: string,
    requestFn: () => Promise<T>
  ): Promise<T> => {
    const start = performance.now();
    
    try {
      const result = await requestFn();
      const duration = performance.now() - start;
      
      console.log(`🌐 Network request "${name}" completed in ${duration.toFixed(2)}ms`);
      
      // Report to analytics
      if (process.env.NODE_ENV === 'production') {
        // Track network performance
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      console.error(`❌ Network request "${name}" failed after ${duration.toFixed(2)}ms:`, error);
      
      // Report error to analytics
      if (process.env.NODE_ENV === 'production') {
        // Track network errors
      }
      
      throw error;
    }
  }, []);

  return { measureRequest };
};

/**
 * Hook for measuring component re-render frequency
 */
export const useRenderMetrics = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const renderTimes = useRef<number[]>([]);

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    renderTimes.current.push(timeSinceLastRender);
    
    // Keep only last 10 render times
    if (renderTimes.current.length > 10) {
      renderTimes.current.shift();
    }
    
    lastRenderTime.current = now;
    
    // Warning for too frequent re-renders
    if (renderCount.current > 1 && timeSinceLastRender < 16) { // 60fps threshold
      console.warn(`⚡ ${componentName} re-rendered too quickly (${timeSinceLastRender}ms)`);
    }
    
    // Log every 10 renders in development
    if (process.env.NODE_ENV === 'development' && renderCount.current % 10 === 0) {
      const avgRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
      console.log(`📊 ${componentName} - Renders: ${renderCount.current}, Avg time between renders: ${avgRenderTime.toFixed(2)}ms`);
    }
  });

  return {
    renderCount: renderCount.current,
    averageRenderInterval: renderTimes.current.length > 0 
      ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length 
      : 0,
  };
};

/**
 * Higher-order component for performance monitoring
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = React.memo((props: P) => {
    const name = componentName || Component.displayName || Component.name || 'Anonymous';
    const { measureRender } = usePerformanceMonitor(name);
    
    // Measure render on every render
    measureRender();
    
    return React.createElement(Component, props);
  });

  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName || Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Performance monitoring context for app-wide metrics
 */
interface PerformanceContextValue {
  reportMetric: (metric: PerformanceMetric) => void;
  getMetrics: () => PerformanceMetric[];
  clearMetrics: () => void;
}

const PerformanceContext = React.createContext<PerformanceContextValue | null>(null);

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const metricsRef = useRef<PerformanceMetric[]>([]);

  const reportMetric = useCallback((metric: PerformanceMetric) => {
    metricsRef.current.push(metric);
    
    // Keep only last 1000 metrics to prevent memory leaks
    if (metricsRef.current.length > 1000) {
      metricsRef.current = metricsRef.current.slice(-1000);
    }
  }, []);

  const getMetrics = useCallback(() => {
    return [...metricsRef.current];
  }, []);

  const clearMetrics = useCallback(() => {
    metricsRef.current = [];
  }, []);

  const value = useMemo(() => ({
    reportMetric,
    getMetrics,
    clearMetrics,
  }), [reportMetric, getMetrics, clearMetrics]);

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformanceContext = () => {
  const context = React.useContext(PerformanceContext);
  
  if (!context) {
    throw new Error('usePerformanceContext must be used within a PerformanceProvider');
  }
  
  return context;
};