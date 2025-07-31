import { lazy, Suspense } from 'react';
import { PageLoading } from '@/components/Loading';

// PHASE 9: Enhanced lazy loading with intelligent preloading
const createLazyComponent = (importFn: () => Promise<any>, componentName: string) => {
  const LazyComponent = lazy(() => 
    importFn().catch(() => ({ 
      default: () => (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600">Failed to load {componentName}</h3>
            <p className="text-sm text-gray-500 mt-2">Please refresh the page to try again.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }))
  );
  
  LazyComponent.displayName = `Lazy${componentName}`;
  return LazyComponent;
};

// PHASE 9: Core pages (highest priority - preload immediately)
export const IndexPage = createLazyComponent(
  () => import('@/pages/Index'),
  'HomePage'
);

export const AuthPage = createLazyComponent(
  () => import('@/pages/Auth'),
  'AuthPage'
);

export const SettingsPage = createLazyComponent(
  () => import('@/pages/Settings'),
  'SettingsPage'
);

// PHASE 9: Management pages (high priority - group together)
export const TeamManagementPage = createLazyComponent(
  () => import('@/pages/TeamManagement'),
  'TeamManagementPage'
);

export const EquipmentManagementPage = createLazyComponent(
  () => import('@/pages/EquipmentManagement'),
  'EquipmentManagementPage'
);

export const FinancialManagementPage = createLazyComponent(
  () => import('@/pages/FinancialManagement'),
  'FinancialManagementPage'
);

export const SafetyManagementPage = createLazyComponent(
  () => import('@/pages/SafetyManagement'),
  'SafetyManagementPage'
);

export const SchedulingSystemPage = createLazyComponent(
  () => import('@/pages/SchedulingSystem'),
  'SchedulingSystemPage'
);

// PHASE 9: Project-related pages (medium-high priority)
export const ProjectsPage = createLazyComponent(
  () => import('@/pages/Projects'),
  'ProjectsPage'
);

export const ParkingLotDesignerPage = createLazyComponent(
  () => import('@/pages/ParkingLotDesigner'),
  'ParkingLotDesignerPage'
);

export const PhotoReportsPage = createLazyComponent(
  () => import('@/pages/PhotoReports'),
  'PhotoReportsPage'
);

export const MeasurementsPage = createLazyComponent(
  () => import('@/pages/Measurements'),
  'MeasurementsPage'
);

export const TrackingPage = createLazyComponent(
  () => import('@/pages/Tracking'),
  'TrackingPage'
);

// PHASE 9: Analytics and AI features (medium priority)
export const AnalyticsPage = createLazyComponent(
  () => import('@/pages/Analytics'),
  'AnalyticsPage'
);

export const AIHubPage = createLazyComponent(
  () => import('@/pages/AIHub'),
  'AIHubPage'
);

// PHASE 9: Mobile features (medium priority)
export const MobilePage = createLazyComponent(
  () => import('@/pages/Mobile'),
  'MobilePage'
);

// PHASE 9: Enterprise and expansion features (lower priority)
export const VeteranResourcesPage = createLazyComponent(
  () => import('@/pages/VeteranResources'),
  'VeteranResourcesPage'
);

export const FleetManagementPage = createLazyComponent(
  () => import('@/pages/FleetManagement'),
  'FleetManagementPage'
);

export const CompanyResourcesPage = createLazyComponent(
  () => import('@/pages/CompanyResources'),
  'CompanyResourcesPage'
);

// PHASE 9: Advanced components (lazy load on demand)
export const OverWatchTOSS = createLazyComponent(
  () => import('@/components/OverWatchTOSS'),
  'OverWatchTOSS'
);

export const TaskPriorityManager = createLazyComponent(
  () => import('@/components/TaskPriorityManager'),
  'TaskPriorityManager'
);

export const AIOperationsCenter = createLazyComponent(
  () => import('@/components/AIOperationsCenter'),
  'AIOperationsCenter'
);

export const AdvancedAnalytics = createLazyComponent(
  () => import('@/components/AdvancedAnalytics'),
  'AdvancedAnalytics'
);

export const MissionControlCenter = createLazyComponent(
  () => import('@/components/MissionControlCenter'),
  'MissionControlCenter'
);

export const EnterpriseIntegrations = createLazyComponent(
  () => import('@/components/EnterpriseIntegrations'),
  'EnterpriseIntegrations'
);

export const MobileCompanion = createLazyComponent(
  () => import('@/components/MobileCompanion'),
  'MobileCompanion'
);

export const QuantumOperationsCenter = createLazyComponent(
  () => import('@/components/QuantumOperationsCenter'),
  'QuantumOperationsCenter'
);

export const UltimateEnhancedMissionControl = createLazyComponent(
  () => import('@/components/UltimateEnhancedMissionControl'),
  'UltimateEnhancedMissionControl'
);

export const PerformanceMonitor = createLazyComponent(
  () => import('@/components/PerformanceMonitor'),
  'PerformanceMonitor'
);

export const AdvancedDashboard = createLazyComponent(
  () => import('@/components/AdvancedDashboard'),
  'AdvancedDashboard'
);

export const PredictiveAnalytics = createLazyComponent(
  () => import('@/components/PredictiveAnalytics'),
  'PredictiveAnalytics'
);

export const IoTDashboard = createLazyComponent(
  () => import('@/components/IoTDashboard'),
  'IoTDashboard'
);

export const GlobalExpansion = createLazyComponent(
  () => import('@/components/GlobalExpansion'),
  'GlobalExpansion'
);

export const ApiDocumentation = createLazyComponent(
  () => import('@/components/ApiDocumentation'),
  'ApiDocumentation'
);

// PHASE 9: Enhanced Suspense wrapper with loading states
export const LazyRoute = ({ 
  component: Component, 
  fallback = <PageLoading title="Loading..." />,
  ...props 
}: { 
  component: React.ComponentType<any>;
  fallback?: React.ReactNode;
  [key: string]: any;
}) => (
  <Suspense fallback={fallback}>
    <Component {...props} />
  </Suspense>
);

// PHASE 9: Route preloading utilities
export const preloadRoute = (routeImport: () => Promise<any>) => {
  // Preload on hover or focus for better UX
  return {
    onMouseEnter: () => routeImport(),
    onFocus: () => routeImport()
  };
};

// PHASE 9: Critical routes that should be preloaded immediately
export const preloadCriticalRoutes = () => {
  // Preload most commonly accessed routes
  const criticalRoutes = [
    () => import('@/pages/Index'),
    () => import('@/pages/Projects'),
    () => import('@/pages/TeamManagement'),
    () => import('@/pages/Settings')
  ];
  
  // Use requestIdleCallback for better performance
  if ('requestIdleCallback' in window) {
    criticalRoutes.forEach((route, index) => {
      window.requestIdleCallback(() => {
        setTimeout(() => route(), index * 100);
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    criticalRoutes.forEach((route, index) => {
      setTimeout(() => route(), index * 200);
    });
  }
};

// PHASE 9: Smart preloading based on user behavior
export const useSmartPreloading = () => {
  // This would typically use analytics data to predict next routes
  // For now, we'll preload based on common user flows
  const commonFlows = {
    '/': ['/projects', '/team', '/equipment'],
    '/projects': ['/parking-designer', '/photos', '/measurements'],
    '/team': ['/equipment', '/schedule', '/safety'],
    '/analytics': ['/ai', '/predictive-analytics', '/iot-monitoring']
  };
  
  return (currentRoute: string) => {
    const nextRoutes = commonFlows[currentRoute as keyof typeof commonFlows];
    if (nextRoutes) {
      nextRoutes.forEach(route => {
        // Preload likely next routes
        setTimeout(() => {
          switch (route) {
            case '/projects':
              import('@/pages/Projects');
              break;
            case '/team':
              import('@/pages/TeamManagement');
              break;
            case '/equipment':
              import('@/pages/EquipmentManagement');
              break;
            case '/parking-designer':
              import('@/pages/ParkingLotDesigner');
              break;
            case '/photos':
              import('@/pages/PhotoReports');
              break;
            case '/measurements':
              import('@/pages/Measurements');
              break;
            case '/schedule':
              import('@/pages/SchedulingSystem');
              break;
            case '/safety':
              import('@/pages/SafetyManagement');
              break;
            case '/ai':
              import('@/pages/AIHub');
              break;
            case '/predictive-analytics':
              import('@/components/PredictiveAnalytics');
              break;
            case '/iot-monitoring':
              import('@/components/IoTDashboard');
              break;
          }
        }, 1000); // Delay to not interfere with current page load
      });
    }
  };
};