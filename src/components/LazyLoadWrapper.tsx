import { Suspense, ComponentType, lazy, ReactNode } from 'react';
import { Loading } from '@/components/Loading';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface LazyLoadWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function LazyLoadWrapper({ children, fallback }: LazyLoadWrapperProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={fallback || <Loading />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// Higher-order component for wrapping lazy-loaded components
export function withLazyLoading<T extends object>(
  Component: ComponentType<T>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: T) {
    return (
      <LazyLoadWrapper fallback={fallback}>
        <Component {...props} />
      </LazyLoadWrapper>
    );
  };
}

// Utility function to create lazy-loaded components with error boundary
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyComponentWrapper(props: React.ComponentProps<T>) {
    return (
      <LazyLoadWrapper fallback={fallback}>
        <LazyComponent {...props} />
      </LazyLoadWrapper>
    );
  };
}

export default LazyLoadWrapper;