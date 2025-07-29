import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LazyLoadWrapper } from '@/components/LazyLoadWrapper';
import { useAuth } from '@/hooks/useAuth';
import { performanceMonitor } from '@/lib/performance';
import { configUtils } from '@/config/environment';

// Advanced lazy component with performance tracking and preloading
const createAdvancedLazyComponent = (
  importFunc: () => Promise<{ default: React.ComponentType<any> }>,
  componentName: string,
  preloadTriggers: string[] = [],
) => {
  const LazyComponent = React.lazy(async () => {
    const start = performance.now();

    try {
      const module = await importFunc();

      const loadTime = performance.now() - start;
      performanceMonitor.recordMetric(`route_load_${componentName}`, loadTime, 'ms', {
        cached: loadTime < 50,
        componentName,
      });

      return module;
    } catch (error) {
      performanceMonitor.recordMetric('route_load_error', 1, 'count', {
        componentName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  });

  // Preload component on hover or focus for instant navigation
  const preload = () => {
    importFunc().catch(() => {});
  };

  const WrappedComponent = (props: any) => {
    // Auto-preload based on triggers - moved inside component
    React.useEffect(() => {
      const currentPath = window.location.pathname;
      const shouldPreload = preloadTriggers.some(trigger => currentPath.includes(trigger));

      if (shouldPreload) {
        preload();
      }
    }, [preloadTriggers]); // Added proper dependencies

    return (
      <LazyLoadWrapper skeleton="page">
        <LazyComponent {...props} />
      </LazyLoadWrapper>
    );
  };

  WrappedComponent.preload = preload;
  return WrappedComponent;
};

// Core application pages with advanced lazy loading
const Dashboard = createAdvancedLazyComponent(
  () => import('@/pages/Index'),
  'dashboard',
  ['/'], // Preload on homepage
);

const ProjectsPage = createAdvancedLazyComponent(
  () => import('@/pages/Projects'),
  'projects',
  ['/dashboard', '/'], // Preload from dashboard
);

const EstimatesPage = createAdvancedLazyComponent(
  () => import('@/pages/Estimates'),
  'estimates',
  ['/projects', '/dashboard'], // Preload from related pages
);

const InvoicesPage = createAdvancedLazyComponent(
  () => import('@/pages/Invoices'),
  'invoices',
  ['/estimates', '/projects'], // Preload from related pages
);

const ClientsPage = createAdvancedLazyComponent(
  () => import('@/pages/Clients'),
  'clients',
  ['/projects', '/dashboard'], // Preload from related pages
);

const InventoryPage = createAdvancedLazyComponent(
  () => import('@/pages/Inventory'),
  'inventory',
  ['/projects'], // Preload from projects
);

const SchedulingPage = createAdvancedLazyComponent(
  () => import('@/pages/Scheduling'),
  'scheduling',
  ['/projects', '/dashboard'], // Preload from related pages
);

// Analytics page - only load if feature is enabled
const AnalyticsPage = configUtils.isFeatureEnabled('enableAnalytics')
  ? createAdvancedLazyComponent(
    () => import('@/pages/Analytics'),
    'analytics',
    ['/dashboard'], // Preload from dashboard if analytics enabled
  )
  : null;

const SettingsPage = createAdvancedLazyComponent(
  () => import('@/pages/Settings'),
  'settings',
  // No auto-preload for settings
);

// Auth pages
const LoginPage = createAdvancedLazyComponent(
  () => import('@/pages/Login'),
  'login',
);

const SignupPage = createAdvancedLazyComponent(
  () => import('@/pages/Signup'),
  'signup',
);

// Error pages
const NotFoundPage = createAdvancedLazyComponent(
  () => import('@/pages/NotFound'),
  'not-found',
);

// Protected Route with performance tracking
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredFeature?: string;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

function ProtectedRoute({ children, requiredFeature, requiredRole, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Performance tracking for auth checks
  React.useEffect(() => {
    if (!loading) {
      performanceMonitor.recordMetric('auth_check_duration', 0, 'ms', {
        authenticated: !!user,
        requiredFeature,
        requiredRole,
      });
    }
  }, [loading, user, requiredFeature, requiredRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">
          <div className="text-center">
            <div className="h-8 w-32 bg-gray-200 rounded mb-4 mx-auto"></div>
            <div className="h-4 w-48 bg-gray-200 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Feature flag check
  if (requiredFeature && !configUtils.isFeatureEnabled(requiredFeature as any)) {
    return fallback || <Navigate to="/dashboard" replace />;
  }

  // Role-based access control
  if (requiredRole && user.user_metadata?.role !== requiredRole) {
    return fallback || <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Public Route Component
interface PublicRouteProps {
  children: React.ReactNode;
}

function PublicRoute({ children }: PublicRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">
          <div className="text-center">
            <div className="h-8 w-32 bg-gray-200 rounded mb-4 mx-auto"></div>
            <div className="h-4 w-48 bg-gray-200 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Route preloading hook with intelligent predictions
export function useIntelligentPreloading() {
  React.useEffect(() => {
    const currentPath = window.location.pathname;

    // Preload based on current page context
    const preloadStrategies = {
      '/dashboard': () => {
        // From dashboard, users often go to projects or analytics
        ProjectsPage.preload();
        if (configUtils.isFeatureEnabled('enableAnalytics') && AnalyticsPage) {
          AnalyticsPage.preload();
        }
      },
      '/projects': () => {
        // From projects, users often go to estimates or scheduling
        EstimatesPage.preload();
        SchedulingPage.preload();
      },
      '/estimates': () => {
        // From estimates, users often go to invoices or clients
        InvoicesPage.preload();
        ClientsPage.preload();
      },
      '/clients': () => {
        // From clients, users often go to projects or estimates
        ProjectsPage.preload();
        EstimatesPage.preload();
      },
    };

    // Execute preload strategy for current page
    Object.entries(preloadStrategies).forEach(([path, strategy]) => {
      if (currentPath.includes(path)) {
        // Delay preloading to not interfere with current page load
        setTimeout(strategy, 1000);
      }
    });

    // Preload on idle
    if ('requestIdleCallback' in window) {
      const idleCallback = () => {
        // Preload remaining critical pages during idle time
        Dashboard.preload();
        ProjectsPage.preload();
        if (configUtils.isFeatureEnabled('enableAnalytics') && AnalyticsPage) {
          AnalyticsPage.preload();
        }
      };

      requestIdleCallback(idleCallback, { timeout: 5000 });
    }
  }, []);

  // Preload on navigation intent (mouseenter on nav links)
  const preloadOnHover = React.useCallback((routePath: string) => {
    const preloadMap: Record<string, () => void> = {
      '/dashboard': Dashboard.preload,
      '/projects': ProjectsPage.preload,
      '/estimates': EstimatesPage.preload,
      '/invoices': InvoicesPage.preload,
      '/clients': ClientsPage.preload,
      '/inventory': InventoryPage.preload,
      '/scheduling': SchedulingPage.preload,
      '/analytics': AnalyticsPage?.preload || (() => {}),
      '/settings': SettingsPage.preload,
    };

    const preloadFn = preloadMap[routePath];
    if (preloadFn) {
      preloadFn();
    }
  }, []);

  return { preloadOnHover };
}

// Main Optimized App Router
export function OptimizedAppRouter() {
  useIntelligentPreloading();

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/*"
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/estimates/*"
            element={
              <ProtectedRoute>
                <EstimatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices/*"
            element={
              <ProtectedRoute>
                <InvoicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/*"
            element={
              <ProtectedRoute>
                <ClientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/*"
            element={
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scheduling/*"
            element={
              <ProtectedRoute>
                <SchedulingPage />
              </ProtectedRoute>
            }
          />

          {/* Feature-gated routes */}
          {configUtils.isFeatureEnabled('enableAnalytics') && AnalyticsPage && (
            <Route
              path="/analytics/*"
              element={
                <ProtectedRoute requiredFeature="enableAnalytics">
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
          )}

          <Route
            path="/settings/*"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/index" element={<Navigate to="/dashboard" replace />} />

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}