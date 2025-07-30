import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps> | React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo;
  resetError: () => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to monitoring service in production
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, you would send this to your error monitoring service
    // Example: Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // sendErrorToMonitoringService(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        // If fallback is a React node, render it directly
        if (React.isValidElement(this.props.fallback)) {
          return this.props.fallback;
        }
        // If fallback is a component, render it with props
        const FallbackComponent = this.props.fallback as React.ComponentType<ErrorFallbackProps>;
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo!}
            resetError={this.resetError}
          />
        );
      }
      
      // Use default fallback
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo!}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, errorInfo, resetError }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const goHome = () => {
    window.location.href = '/';
  };

  const reportError = () => {
    // In production, this would open a support ticket or send feedback
    const errorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    console.log('Error Report:', errorReport);
    // sendErrorReport(errorReport);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Oops! Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-muted-foreground">
            <p>We apologize for the inconvenience. An unexpected error has occurred.</p>
            <p>Our team has been notified and is working to fix this issue.</p>
          </div>

          {isDevelopment && (
            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <h3 className="font-semibold text-destructive mb-2">Error Details (Development Mode)</h3>
                <div className="text-sm space-y-2">
                  <div>
                    <strong>Message:</strong> {error.message}
                  </div>
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium">Stack Trace</summary>
                      <pre className="mt-2 text-xs overflow-auto bg-muted p-2 rounded">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                  {errorInfo.componentStack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium">Component Stack</summary>
                      <pre className="mt-2 text-xs overflow-auto bg-muted p-2 rounded">
                        {errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={resetError} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={goHome} className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
            <Button onClick={reportError} variant="outline" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Report Issue
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>If this problem persists, please contact our support team.</p>
            <p className="mt-1">
              Error ID: {Date.now().toString(36).toUpperCase()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ErrorBoundary;
export { ErrorBoundary };
export type { ErrorBoundaryProps, ErrorFallbackProps };