import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { withLazyLoading } from '@/components/LazyLoadWrapper';
import { useAuth } from '@/hooks/useAuth';
import { performanceMonitor } from '@/lib/performance';

// Lazy load all major page components with performance tracking
const Dashboard = withLazyLoading(
  () => {
    const start = performance.now();
    return import('@/pages/Index').then(module => {
      performanceMonitor.recordMetric('page_load_dashboard', performance.now() - start, 'ms');
      return module;
    });
  },
  { skeleton: 'page' },
);

const ProjectsPage = withLazyLoading(
  () => {
    const start = performance.now();
    return import('@/pages/Projects').then(module => {
      performanceMonitor.recordMetric('page_load_projects', performance.now() - start, 'ms');
      return module;
    });
  },
  { skeleton: 'page' },
);

const EstimatesPage = withLazyLoading(
  () => {
    const start = performance.now();
    return import('@/pages/Estimates').then(module => {
      performanceMonitor.recordMetric('page_load_estimates', performance.now() - start, 'ms');
      return module;
    });
  },
  { skeleton: 'page' },
);

const InvoicesPage = withLazyLoading(
  () => {
    const start = performance.now();
    return import('@/pages/Invoices').then(module => {
      performanceMonitor.recordMetric('page_load_invoices', performance.now() - start, 'ms');
      return module;
    });
  },
  { skeleton: 'page' },
);

const ClientsPage = withLazyLoading(
  () => {
    const start = performance.now();
    return import('@/pages/Clients').then(module => {
      performanceMonitor.recordMetric('page_load_clients', performance.now() - start, 'ms');
      return module;
    });
  },
  { skeleton: 'page' },
);

const InventoryPage = withLazyLoading(
  () => {
    const start = performance.now();
    return import('@/pages/Inventory').then(module => {
      performanceMonitor.recordMetric('page_load_inventory', performance.now() - start, 'ms');
      return module;
    });
  },
  { skeleton: 'page' },
);

const SchedulingPage = withLazyLoading(
  () => {
    const start = performance.now();
    return import('@/pages/Scheduling').then(module => {
      performanceMonitor.recordMetric('page_load_scheduling', performance.now() - start, 'ms');
      return module;
    });
  },
  { skeleton: 'page' },
);

const AnalyticsPage = withLazyLoading(
  () => {
    const start = performance.now();
    return import('@/pages/Analytics').then(module => {
      performanceMonitor.recordMetric('page_load_analytics', performance.now() - start, 'ms');
      return module;
    });
  },
  { skeleton: 'page' },
);

const SettingsPage = withLazyLoading(
  () => {
    const start = performance.now();
    return import('@/pages/Settings').then(module => {
      performanceMonitor.recordMetric('page_load_settings', performance.now() - start, 'ms');
      return module;
    });
  },
  { skeleton: 'page' },
);

const LoginPage = withLazyLoading(
  () => import('@/pages/Login'),
  { skeleton: 'card' },
);

const SignupPage = withLazyLoading(
  () => import('@/pages/Signup'),
  { skeleton: 'card' },
);

const NotFoundPage = withLazyLoading(
  () => import('@/pages/NotFound'),
  { skeleton: 'page' },
);

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

function ProtectedRoute({ children, requiredRole, fallback }: ProtectedRouteProps) {
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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access control (if implemented)
  if (requiredRole && user.user_metadata?.role !== requiredRole) {
    return fallback || <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Public Route Component (redirects authenticated users)
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

// Route preloading hook
export function useRoutePreloading() {
  React.useEffect(() => {
    // Preload critical routes after initial load
    const preloadTimer = setTimeout(() => {
      // Preload dashboard and projects as they're most commonly accessed
      import('@/pages/Index').catch(() => {});
      import('@/pages/Projects').catch(() => {});
    }, 2000);

    return () => { clearTimeout(preloadTimer); };
  }, []);

  // Preload on hover for navigation links
  const preloadRoute = React.useCallback((routePath: string) => {
    const routeMap: Record<string, () => Promise<any>> = {
      '/dashboard': () => import('@/pages/Index'),
      '/projects': () => import('@/pages/Projects'),
      '/estimates': () => import('@/pages/Estimates'),
      '/invoices': () => import('@/pages/Invoices'),
      '/clients': () => import('@/pages/Clients'),
      '/inventory': () => import('@/pages/Inventory'),
      '/scheduling': () => import('@/pages/Scheduling'),
      '/analytics': () => import('@/pages/Analytics'),
      '/settings': () => import('@/pages/Settings'),
    };

    const importFunc = routeMap[routePath];
    if (importFunc) {
      importFunc().catch(() => {});
    }
  }, []);

  return { preloadRoute };
}

// Main App Router
export function AppRouter() {
  useRoutePreloading();

  return (
    <BrowserRouter>
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
        <Route
          path="/analytics/*"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
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
    </BrowserRouter>
  );
}