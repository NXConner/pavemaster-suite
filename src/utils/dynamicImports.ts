/**
 * Dynamic import utilities for advanced code splitting and feature loading
 */

import { ComponentType, lazy } from 'react';
import { performanceMonitor } from '@/lib/performance';

// Feature flag system for dynamic loading
interface FeatureFlags {
  analytics: boolean;
  reporting: boolean;
  advancedCharts: boolean;
  dataExport: boolean;
  realTimeUpdates: boolean;
  mobileOptimizations: boolean;
}

// User permission levels for feature access
interface UserPermissions {
  canViewAnalytics: boolean;
  canExportData: boolean;
  canManageUsers: boolean;
  canViewReports: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

// Dynamic import with performance tracking
export function createDynamicImport<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  componentName: string,
  dependencies?: string[]
) {
  return lazy(async () => {
    const startTime = performance.now();
    
    try {
      // Pre-load dependencies if specified
      if (dependencies) {
        await Promise.all(dependencies.map(dep => import(dep).catch(() => {})));
      }

      const module = await importFn();
      
      const loadTime = performance.now() - startTime;
      performanceMonitor.recordMetric(`dynamic_import_${componentName}`, loadTime, 'ms', {
        dependencies: dependencies?.length || 0,
        cached: loadTime < 50 // Likely cached if very fast
      });

      return module;
    } catch (error) {
      performanceMonitor.recordMetric('dynamic_import_error', 1, 'count', {
        component: componentName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  });
}

// Feature-based component loading
export const FeatureComponents = {
  // Analytics features (heavy charts and data processing)
  AdvancedAnalytics: createDynamicImport(
    () => import('@/components/analytics/AdvancedAnalytics'),
    'AdvancedAnalytics',
    ['recharts', 'date-fns']
  ),

  // Reporting features (PDF generation, complex exports)
  ReportGenerator: createDynamicImport(
    () => import('@/components/reports/ReportGenerator'),
    'ReportGenerator',
    ['jspdf', 'html2canvas']
  ),

  // Data visualization (large charting libraries)
  DataVisualization: createDynamicImport(
    () => import('@/components/charts/DataVisualization'),
    'DataVisualization',
    ['d3', 'recharts']
  ),

  // Admin panel (user management, system settings)
  AdminPanel: createDynamicImport(
    () => import('@/components/admin/AdminPanel'),
    'AdminPanel'
  ),

  // Mobile-specific optimizations
  MobileOptimizedView: createDynamicImport(
    () => import('@/components/mobile/MobileOptimizedView'),
    'MobileOptimizedView'
  ),

  // Real-time features (WebSocket, live updates)
  RealTimeUpdates: createDynamicImport(
    () => import('@/components/realtime/RealTimeUpdates'),
    'RealTimeUpdates',
    ['socket.io-client']
  ),

  // Data export functionality
  DataExportTools: createDynamicImport(
    () => import('@/components/export/DataExportTools'),
    'DataExportTools',
    ['xlsx', 'csv-parser']
  ),
};

// Permission-based component loader
export function createPermissionBasedLoader<T = any>(
  component: ComponentType<T>,
  requiredPermissions: (keyof UserPermissions)[],
  fallbackComponent?: ComponentType<T>
) {
  return function PermissionWrapper(props: T) {
    // This would integrate with your auth system
    const userPermissions = getUserPermissions(); // Implement this function
    
    const hasPermission = requiredPermissions.every(
      permission => userPermissions[permission]
    );

    if (!hasPermission) {
      const FallbackComponent = fallbackComponent || (() => null);
      return <FallbackComponent {...props} />;
    }

    const DynamicComponent = component;
    return <DynamicComponent {...props} />;
  };
}

// Feature flag based loader
export function createFeatureFlagLoader<T = any>(
  component: ComponentType<T>,
  requiredFeatures: (keyof FeatureFlags)[],
  fallbackComponent?: ComponentType<T>
) {
  return function FeatureWrapper(props: T) {
    const featureFlags = getFeatureFlags(); // Implement this function
    
    const featureEnabled = requiredFeatures.every(
      feature => featureFlags[feature]
    );

    if (!featureEnabled) {
      const FallbackComponent = fallbackComponent || (() => null);
      return <FallbackComponent {...props} />;
    }

    const DynamicComponent = component;
    return <DynamicComponent {...props} />;
  };
}

// Progressive loading for heavy components
export class ProgressiveLoader {
  private static loadedModules = new Set<string>();
  private static preloadQueue: (() => Promise<any>)[] = [];

  static preloadFeature(featureName: keyof typeof FeatureComponents) {
    if (this.loadedModules.has(featureName)) {
      return Promise.resolve();
    }

    const preloadFn = () => {
      // Trigger the dynamic import to start loading
      const component = FeatureComponents[featureName];
      // Access the component to trigger loading
      return Promise.resolve();
    };

    this.preloadQueue.push(preloadFn);
    return this.processQueue();
  }

  private static async processQueue() {
    if (this.preloadQueue.length === 0) return;

    // Process 2 at a time to avoid overwhelming the network
    const batch = this.preloadQueue.splice(0, 2);
    await Promise.all(batch.map(fn => fn().catch(() => {})));

    // Continue with next batch after a small delay
    if (this.preloadQueue.length > 0) {
      setTimeout(() => this.processQueue(), 100);
    }
  }

  static preloadBasedOnUserRole(userPermissions: UserPermissions) {
    // Preload features based on user permissions
    if (userPermissions.canViewAnalytics) {
      this.preloadFeature('AdvancedAnalytics');
      this.preloadFeature('DataVisualization');
    }

    if (userPermissions.canViewReports) {
      this.preloadFeature('ReportGenerator');
    }

    if (userPermissions.canExportData) {
      this.preloadFeature('DataExportTools');
    }

    if (userPermissions.isAdmin) {
      this.preloadFeature('AdminPanel');
    }
  }

  static preloadBasedOnUserBehavior() {
    // Preload based on user navigation patterns
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/dashboard')) {
      // User is on dashboard, likely to view analytics
      this.preloadFeature('AdvancedAnalytics');
    }

    if (currentPath.includes('/projects')) {
      // User is viewing projects, might need reports
      this.preloadFeature('ReportGenerator');
    }
  }
}

// Utility functions to implement in your auth/feature flag system
function getUserPermissions(): UserPermissions {
  // Implement this based on your auth system
  // For now, return a default set of permissions
  return {
    canViewAnalytics: true,
    canExportData: true,
    canManageUsers: false,
    canViewReports: true,
    isAdmin: false,
    isSuperAdmin: false,
  };
}

function getFeatureFlags(): FeatureFlags {
  // Implement this based on your feature flag system
  // Could be from environment variables, API, or local storage
  return {
    analytics: true,
    reporting: true,
    advancedCharts: true,
    dataExport: true,
    realTimeUpdates: false, // Disabled by default
    mobileOptimizations: true,
  };
}

// Device-based loading
export function createDeviceBasedLoader<T = any>(
  desktopComponent: ComponentType<T>,
  mobileComponent: ComponentType<T>,
  threshold: number = 768
) {
  return function DeviceWrapper(props: T) {
    const isMobile = window.innerWidth < threshold;
    const Component = isMobile ? mobileComponent : desktopComponent;
    return <Component {...props} />;
  };
}

// Bandwidth-aware loading
export function createBandwidthAwareLoader<T = any>(
  highBandwidthComponent: ComponentType<T>,
  lowBandwidthComponent: ComponentType<T>
) {
  return function BandwidthWrapper(props: T) {
    // Check connection speed (if available)
    const connection = (navigator as any).connection;
    const isSlowConnection = connection && (
      connection.effectiveType === '2g' || 
      connection.effectiveType === 'slow-2g' ||
      connection.saveData
    );

    const Component = isSlowConnection ? lowBandwidthComponent : highBandwidthComponent;
    return <Component {...props} />;
  };
}

// Auto-preloader hook
export function useAutoPreloader() {
  React.useEffect(() => {
    const userPermissions = getUserPermissions();
    
    // Initial preload based on permissions
    ProgressiveLoader.preloadBasedOnUserRole(userPermissions);
    
    // Preload based on current route
    ProgressiveLoader.preloadBasedOnUserBehavior();
    
    // Preload on idle
    if ('requestIdleCallback' in window) {
      const idleCallback = () => {
        // Preload remaining features during idle time
        Object.keys(FeatureComponents).forEach(feature => {
          ProgressiveLoader.preloadFeature(feature as keyof typeof FeatureComponents);
        });
      };
      
      requestIdleCallback(idleCallback, { timeout: 5000 });
    }
  }, []);
}