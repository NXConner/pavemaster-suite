import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Alert, AlertDescription } from '@/ui/alert';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  enableRetry?: boolean;
  enableReporting?: boolean;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error info:', errorInfo);
    }

    // Report error to monitoring service
    this.reportError(error, errorInfo);
  }

  reportError = async (error: Error, errorInfo: ErrorInfo) => {
    if (!this.props.enableReporting) return;

    try {
      // Send to error reporting service
      if (window.ISACMonitoring) {
        window.ISACMonitoring.trackError('component_error', {
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          retryCount: this.state.retryCount,
        });
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const { error, errorInfo } = this.state;
    const errorReport = {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    // Create a bug report URL or open email client
    const subject = encodeURIComponent(`Bug Report: ${error?.message || 'Component Error'}`);
    const body = encodeURIComponent(`Error Details:\n\n${JSON.stringify(errorReport, null, 2)}`);
    window.open(`mailto:support@isac-os.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, retryCount } = this.state;
      const canRetry = this.props.enableRetry && retryCount < this.maxRetries;

      return (
        <div className={`min-h-[400px] flex items-center justify-center p-4 ${this.props.className || ''}`}>
          <Card className="w-full max-w-lg mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl font-semibold text-red-900 dark:text-red-100">
                Something went wrong
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-center text-gray-600 dark:text-gray-400">
                We encountered an unexpected error. Our team has been notified and is working on a fix.
              </p>

              {this.props.showErrorDetails && error && (
                <Alert variant="destructive">
                  <Bug className="h-4 w-4" />
                  <AlertDescription className="font-mono text-xs">
                    <details>
                      <summary className="cursor-pointer mb-2">Error Details</summary>
                      <div className="space-y-2">
                        <div>
                          <strong>Message:</strong> {error.message}
                        </div>
                        {error.stack && (
                          <div>
                            <strong>Stack:</strong>
                            <pre className="whitespace-pre-wrap text-xs mt-1">
                              {error.stack}
                            </pre>
                          </div>
                        )}
                        {errorInfo?.componentStack && (
                          <div>
                            <strong>Component Stack:</strong>
                            <pre className="whitespace-pre-wrap text-xs mt-1">
                              {errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  </AlertDescription>
                </Alert>
              )}

              {retryCount > 0 && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400 text-center">
                  Retry attempt {retryCount}/{this.maxRetries}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    variant="default"
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}

                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {this.props.enableReporting && (
                <Button
                  onClick={this.handleReportBug}
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Report This Issue
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;