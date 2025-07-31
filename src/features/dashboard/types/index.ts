// Dashboard Feature Types
export interface DashboardState {
  metrics: DashboardMetric[];
  charts: DashboardChart[];
  filters: DashboardFilter;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface DashboardMetric {
  id: string;
  title: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  trend: TrendData[];
}

export interface TrendData {
  date: string;
  value: number;
}

export interface DashboardChart {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'radar';
  data: ChartDataPoint[];
  config: ChartConfig;
}

export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
}

export interface ChartConfig {
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  colors: string[];
  legend: boolean;
  grid: boolean;
  responsive: boolean;
}

export interface AxisConfig {
  title: string;
  type: 'category' | 'value' | 'time';
  format?: string;
}

export interface DashboardFilter {
  dateRange: DateRange;
  projects: string[];
  equipmentTypes: string[];
  locations: string[];
  users: string[];
}

export interface DateRange {
  start: Date;
  end: Date;
  preset?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  permissions: string[];
  category: 'create' | 'report' | 'manage' | 'analyze';
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'map' | 'calendar';
  position: WidgetPosition;
  size: WidgetSize;
  config: Record<string, any>;
}

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetSize {
  minW: number;
  minH: number;
  maxW?: number;
  maxH?: number;
}

// API Response Types
export interface GetDashboardDataResponse {
  metrics: DashboardMetric[];
  charts: DashboardChart[];
  quickActions: QuickAction[];
  widgets: DashboardWidget[];
}

export interface UpdateDashboardLayoutRequest {
  widgets: DashboardWidget[];
}

// Hook Return Types
export interface UseDashboardReturn {
  state: DashboardState;
  actions: {
    refreshData: () => Promise<void>;
    updateFilters: (filters: Partial<DashboardFilter>) => void;
    resetFilters: () => void;
    exportData: (format: 'csv' | 'pdf' | 'excel') => Promise<void>;
  };
}

export interface UseDashboardMetricsReturn {
  metrics: DashboardMetric[];
  isLoading: boolean;
  error: string | null;
  refreshMetrics: () => Promise<void>;
}

export interface UseDashboardChartsReturn {
  charts: DashboardChart[];
  isLoading: boolean;
  error: string | null;
  refreshCharts: () => Promise<void>;
  updateChartConfig: (chartId: string, config: Partial<ChartConfig>) => void;
}