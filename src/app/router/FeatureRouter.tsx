import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Loading } from '@/components/Loading';
import { LazyLoadWrapper } from '@/components/LazyLoadWrapper';

// Feature imports - dynamically imported for code splitting
const DashboardFeature = React.lazy(() => 
  import('@/features/dashboard').then(module => ({ 
    default: module.DashboardPage 
  }))
);

const ProjectsFeature = React.lazy(() => 
  import('@/pages/Projects').then(module => ({ 
    default: module.default 
  }))
);

const AnalyticsFeature = React.lazy(() => 
  import('@/pages/Analytics').then(module => ({ 
    default: module.default 
  }))
);

const EquipmentFeature = React.lazy(() => 
  import('@/pages/EquipmentManagement').then(module => ({ 
    default: module.default 
  }))
);

const TeamFeature = React.lazy(() => 
  import('@/pages/TeamManagement').then(module => ({ 
    default: module.default 
  }))
);

const FinancialFeature = React.lazy(() => 
  import('@/pages/FinancialManagement').then(module => ({ 
    default: module.default 
  }))
);

const SettingsFeature = React.lazy(() => 
  import('@/pages/Settings').then(module => ({ 
    default: module.default 
  }))
);

const MobileFeature = React.lazy(() => 
  import('@/pages/Mobile').then(module => ({ 
    default: module.default 
  }))
);

// Feature route configuration
interface FeatureRoute {
  path: string;
  component: React.ComponentType;
  permissions?: string[];
  preload?: boolean;
  metadata?: {
    title: string;
    description: string;
    category: string;
  };
}

const FEATURE_ROUTES: FeatureRoute[] = [
  {
    path: '/',
    component: DashboardFeature,
    permissions: ['dashboard:read'],
    preload: true,
    metadata: {
      title: 'Dashboard',
      description: 'Main dashboard overview',
      category: 'overview'
    }
  },
  {
    path: '/dashboard',
    component: DashboardFeature,
    permissions: ['dashboard:read'],
    preload: true,
    metadata: {
      title: 'Dashboard',
      description: 'Main dashboard overview',
      category: 'overview'
    }
  },
  {
    path: '/projects/*',
    component: ProjectsFeature,
    permissions: ['projects:read'],
    metadata: {
      title: 'Projects',
      description: 'Project management and tracking',
      category: 'management'
    }
  },
  {
    path: '/analytics/*',
    component: AnalyticsFeature,
    permissions: ['analytics:read'],
    metadata: {
      title: 'Analytics',
      description: 'Performance analytics and reporting',
      category: 'analysis'
    }
  },
  {
    path: '/equipment/*',
    component: EquipmentFeature,
    permissions: ['equipment:read'],
    metadata: {
      title: 'Equipment',
      description: 'Equipment management and tracking',
      category: 'management'
    }
  },
  {
    path: '/team/*',
    component: TeamFeature,
    permissions: ['team:read'],
    metadata: {
      title: 'Team',
      description: 'Team management and assignments',
      category: 'management'
    }
  },
  {
    path: '/financial/*',
    component: FinancialFeature,
    permissions: ['financial:read'],
    metadata: {
      title: 'Financial',
      description: 'Financial management and budgeting',
      category: 'management'
    }
  },
  {
    path: '/mobile/*',
    component: MobileFeature,
    permissions: ['mobile:read'],
    metadata: {
      title: 'Mobile',
      description: 'Mobile field operations',
      category: 'tools'
    }
  },
  {
    path: '/settings/*',
    component: SettingsFeature,
    permissions: ['settings:read'],
    metadata: {
      title: 'Settings',
      description: 'Application settings and configuration',
      category: 'configuration'
    }
  }
];

interface FeatureRouteWrapperProps {
  route: FeatureRoute;
}

function FeatureRouteWrapper({ route }: FeatureRouteWrapperProps) {
  const Component = route.component;

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
}

export function FeatureRouter() {
  return (
    <Routes>
      {FEATURE_ROUTES.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<FeatureRouteWrapper route={route} />}
        />
      ))}
      
      {/* Catch-all route for 404 */}
      <Route 
        path="*" 
        element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
              <p className="text-gray-600 mb-4">Page not found</p>
              <Navigate to="/dashboard" replace />
            </div>
          </div>
        } 
      />
    </Routes>
  );
}

// Hook to get current feature metadata
export function useCurrentFeature() {
  const currentPath = window.location.pathname;
  
  const currentRoute = FEATURE_ROUTES.find(route => {
    if (route.path === '/') return currentPath === '/';
    if (route.path.endsWith('/*')) {
      const basePath = route.path.slice(0, -2);
      return currentPath.startsWith(basePath);
    }
    return currentPath === route.path;
  });

  return {
    route: currentRoute,
    metadata: currentRoute?.metadata,
    permissions: currentRoute?.permissions || []
  };
}

// Utility to preload feature routes
export function preloadFeatureRoutes() {
  FEATURE_ROUTES
    .filter(route => route.preload)
    .forEach(route => {
      // Trigger lazy loading
      route.component;
    });
}

// Feature registry for dynamic feature loading
export const FEATURE_REGISTRY = {
  dashboard: {
    component: DashboardFeature,
    routes: ['/dashboard', '/'],
    permissions: ['dashboard:read'],
    dependencies: ['analytics', 'projects']
  },
  projects: {
    component: ProjectsFeature,
    routes: ['/projects'],
    permissions: ['projects:read'],
    dependencies: []
  },
  analytics: {
    component: AnalyticsFeature,
    routes: ['/analytics'],
    permissions: ['analytics:read'],
    dependencies: ['projects']
  },
  equipment: {
    component: EquipmentFeature,
    routes: ['/equipment'],
    permissions: ['equipment:read'],
    dependencies: []
  },
  team: {
    component: TeamFeature,
    routes: ['/team'],
    permissions: ['team:read'],
    dependencies: []
  },
  financial: {
    component: FinancialFeature,
    routes: ['/financial'],
    permissions: ['financial:read'],
    dependencies: ['projects']
  },
  mobile: {
    component: MobileFeature,
    routes: ['/mobile'],
    permissions: ['mobile:read'],
    dependencies: []
  },
  settings: {
    component: SettingsFeature,
    routes: ['/settings'],
    permissions: ['settings:read'],
    dependencies: []
  }
} as const;

export type FeatureName = keyof typeof FEATURE_REGISTRY;