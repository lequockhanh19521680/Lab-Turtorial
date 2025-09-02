import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Copy, Check } from 'lucide-react';
import { Button } from '@/features/shared/components/ui/button';
import { Card } from '@/features/shared/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  eventId?: string;
  copied: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  level?: 'page' | 'component' | 'feature';
}

/**
 * Enhanced Error Boundary with user-friendly error handling
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Generate a unique event ID for error tracking
    const eventId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.setState({
      errorInfo,
      eventId,
    });

    // Log error details
    console.error('ErrorBoundary caught an error:', {
      error,
      errorInfo,
      eventId,
      level: this.props.level || 'component',
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In a real app, you would send this to an error reporting service
    this.reportError(error, errorInfo, eventId);
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo, eventId: string) => {
    try {
      // Here you would integrate with error tracking services like:
      // - Sentry
      // - Bugsnag
      // - Custom error API
      
      const errorReport = {
        eventId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        level: this.props.level || 'component',
      };

      // Mock error reporting (replace with actual service)
      console.warn('Error reported:', errorReport);
      
      // In development, you might want to show more details
      if (process.env.NODE_ENV === 'development') {
        console.group('🐛 Error Boundary Details');
        console.error('Error:', error);
        console.error('Error Info:', errorInfo);
        console.error('Full Report:', errorReport);
        console.groupEnd();
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      eventId: undefined,
      copied: false,
    });
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private copyErrorDetails = async () => {
    if (!this.state.error || !this.state.errorInfo) return;

    const errorDetails = {
      eventId: this.state.eventId,
      error: this.state.error.message,
      stack: this.state.error.stack,
      componentStack: this.state.errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      this.setState({ copied: true });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        this.setState({ copied: false });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isPageLevel = this.props.level === 'page';
      const isFeatureLevel = this.props.level === 'feature';

      return (
        <div className={`
          flex items-center justify-center p-4
          ${isPageLevel ? 'min-h-screen bg-gray-50' : 'min-h-[400px]'}
        `}>
          <Card className="w-full max-w-md mx-auto">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isPageLevel ? 'Page Error' : isFeatureLevel ? 'Feature Error' : 'Something went wrong'}
                </h2>
                <p className="text-gray-600">
                  {isPageLevel 
                    ? 'This page encountered an unexpected error. Please try refreshing or go back to the home page.'
                    : 'This component encountered an error. You can try again or refresh the page.'
                  }
                </p>
              </div>

              {this.props.showDetails && this.state.error && (
                <div className="text-left bg-gray-50 p-3 rounded-lg border">
                  <div className="text-sm text-gray-700 space-y-1">
                    <div><strong>Error:</strong> {this.state.error.message}</div>
                    {this.state.eventId && (
                      <div><strong>Event ID:</strong> {this.state.eventId}</div>
                    )}
                  </div>
                  
                  <Button
                    onClick={this.copyErrorDetails}
                    variant="outline"
                    size="sm"
                    className="mt-2 h-8"
                  >
                    {this.state.copied ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Details
                      </>
                    )}
                  </Button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  onClick={this.handleRetry}
                  variant="default"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                {isPageLevel && (
                  <Button
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="flex-1"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                )}
                
                <Button
                  onClick={this.handleRefresh}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    <Bug className="inline w-4 h-4 mr-1" />
                    Development Details
                  </summary>
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-xs font-mono text-red-800 whitespace-pre-wrap overflow-auto max-h-32">
                    {this.state.error.stack}
                  </div>
                </details>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping components with error boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook for manual error reporting
 */
export const useErrorHandler = () => {
  return React.useCallback((error: Error, errorInfo?: { componentStack?: string }) => {
    console.error('Manual error report:', error, errorInfo);
    
    // In a real app, send to error reporting service
    const errorReport = {
      eventId: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      type: 'manual',
    };

    console.warn('Manual error reported:', errorReport);
  }, []);
};