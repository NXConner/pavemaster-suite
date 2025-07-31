import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  variant?: 'spinner' | 'skeleton' | 'pulse' | 'dots';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

interface PageLoadingProps {
  title?: string;
  description?: string;
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

interface SkeletonCardProps {
  count?: number;
  hasImage?: boolean;
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

      case 'skeleton':
      default:
        return (
          <div className="space-y-3">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[220px]" />
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

export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              className={cn(
                "h-4 flex-1",
                colIndex === 0 && "h-6" // First column slightly taller for emphasis
              )} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard({ count = 3, hasImage = true }: SkeletonCardProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="space-y-4">
              {hasImage && (
                <Skeleton className="h-48 w-full rounded-md" />
              )}
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/5" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex justify-end space-x-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-16" />
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Loading state for specific use cases
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