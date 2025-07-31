import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

interface PageLoadingProps {
  title?: string;
  description?: string;
}

export function Loading({ 
  variant = 'spinner', 
  size = 'md', 
  text, 
  className,
  fullScreen = false 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const containerClasses = cn(
    'flex items-center justify-center',
    fullScreen && 'min-h-screen',
    className
  );

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
            {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
          </div>
        );

      case 'dots':
        return (
          <div className="flex flex-col items-center gap-3">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'bg-primary rounded-full animate-bounce',
                    size === 'sm' && 'h-2 w-2',
                    size === 'md' && 'h-3 w-3',
                    size === 'lg' && 'h-4 w-4'
                  )}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.6s'
                  }}
                />
              ))}
            </div>
            {text && <p className="text-sm text-muted-foreground">{text}</p>}
          </div>
        );

      case 'pulse':
        return (
          <div className="flex flex-col items-center gap-3">
            <div className={cn(
              'bg-primary rounded-full animate-pulse',
              sizeClasses[size]
            )} />
            {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
            {text && <p className="text-sm text-muted-foreground">{text}</p>}
          </div>
        );
    }
  };

  return (
    <div className={containerClasses}>
      {renderLoader()}
    </div>
  );
}

export function PageLoading({ title = 'Loading...', description }: PageLoadingProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="max-w-md w-full mx-4">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <RefreshCw className="h-12 w-12 text-primary animate-spin" />
              <div className="absolute inset-0 h-12 w-12 border-2 border-primary/20 rounded-full animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">{title}</h3>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            <div className="flex space-x-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-1 w-8 bg-primary/30 rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Convenience exports
export function LoadingSpinner({ size = 'md' }: Pick<LoadingProps, 'size'>) {
  return <Loading variant="spinner" size={size} />;
}

export function LoadingDots({ size = 'md' }: Pick<LoadingProps, 'size'>) {
  return <Loading variant="dots" size={size} />;
}

export function LoadingPulse({ size = 'md' }: Pick<LoadingProps, 'size'>) {
  return <Loading variant="pulse" size={size} />;
}

export default Loading;