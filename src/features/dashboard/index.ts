// Dashboard Feature - Main Export
// Following Feature-First Architecture (FFA) pattern

export { DashboardPage } from './components/DashboardPage';
export { DashboardMetrics } from './components/DashboardMetrics';
export { DashboardCharts } from './components/DashboardCharts';
export { DashboardQuickActions } from './components/DashboardQuickActions';

export { useDashboard } from './hooks/useDashboard';
export { useDashboardMetrics } from './hooks/useDashboardMetrics';
export { useDashboardCharts } from './hooks/useDashboardCharts';

export { dashboardStore } from './stores/dashboardStore';

export type { 
  DashboardState, 
  DashboardMetric, 
  DashboardChart,
  DashboardFilter
} from './types';

export { dashboardService } from './services/dashboardService';

// Feature metadata
export const DASHBOARD_FEATURE = {
  name: 'dashboard',
  version: '1.0.0',
  dependencies: ['analytics', 'projects', 'equipment'],
  routes: ['/dashboard', '/'],
  permissions: ['dashboard:read', 'dashboard:write']
} as const;