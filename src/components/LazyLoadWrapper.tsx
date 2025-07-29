import React, { Suspense, ComponentType, lazy } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  skeleton?: 'page' | 'card' | 'list' | 'custom';
}

// Default loading skeletons for different content types
const PageSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-[250px]" />
      <Skeleton className="h-4 w-[400px]" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const CardSkeleton = () => (
  <Card>
    <CardContent className="p-4">
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-20 w-full" />
    </CardContent>
  </Card>
);

const ListSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

const DefaultLoadingFallback = ({ skeleton }: { skeleton: string }) => {
  const renderSkeleton = () => {
    switch (skeleton) {
      case 'page':
        return <PageSkeleton />;
      case 'card':
        return <CardSkeleton />;
      case 'list':
        return <ListSkeleton />;
      default:
        return (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="animate-pulse">
      {renderSkeleton()}
    </div>
  );
};

export function LazyLoadWrapper({
  children,
  fallback,
  errorFallback,
  skeleton = 'custom',
}: LazyLoadWrapperProps) {
  const loadingFallback = fallback || <DefaultLoadingFallback skeleton={skeleton} />;

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={loadingFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    fallback?: React.ReactNode;
    errorFallback?: React.ReactNode;
    skeleton?: 'page' | 'card' | 'list' | 'custom';
  },
) {
  const LazyComponent = lazy(importFunc);

  return function LazyLoadedComponent(props: P) {
    return (
      <LazyLoadWrapper
        fallback={options?.fallback}
        errorFallback={options?.errorFallback}
        skeleton={options?.skeleton}
      >
        <LazyComponent {...props} />
      </LazyLoadWrapper>
    );
  };
}

// Hook for preloading components
export function usePreloadComponent(
  importFunc: () => Promise<{ default: ComponentType<any> }>,
) {
  const preload = React.useCallback(() => {
    const componentImport = importFunc();
    // Preload but don't wait for it
    componentImport.catch(error => {
      console.warn('Component preload failed:', error);
    });
    return componentImport;
  }, [importFunc]);

  return { preload };
}

// Intersection Observer hook for lazy loading on scroll
export function useLazyLoad(threshold = 0.1) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      },
      { threshold },
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, hasLoaded]);

  return { ref, isVisible, hasLoaded };
}