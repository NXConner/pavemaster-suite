import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { 
  DashboardState, 
  DashboardFilter, 
  DashboardMetric, 
  DashboardChart 
} from '../types';
import { dashboardService } from '../services/dashboardService';

interface DashboardStore extends DashboardState {
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setMetrics: (metrics: DashboardMetric[]) => void;
  setCharts: (charts: DashboardChart[]) => void;
  updateFilters: (filters: Partial<DashboardFilter>) => void;
  resetFilters: () => void;
  
  // Async Actions
  fetchDashboardData: () => Promise<void>;
  refreshData: () => Promise<void>;
  exportData: (format: 'csv' | 'pdf' | 'excel') => Promise<void>;
}

const defaultFilters: DashboardFilter = {
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
    preset: 'month'
  },
  projects: [],
  equipmentTypes: [],
  locations: [],
  users: []
};

const initialState: DashboardState = {
  metrics: [],
  charts: [],
  filters: defaultFilters,
  isLoading: false,
  error: null,
  lastUpdated: null
};

export const dashboardStore = create<DashboardStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // Synchronous Actions
      setLoading: (loading) => set((state) => {
        state.isLoading = loading;
      }),

      setError: (error) => set((state) => {
        state.error = error;
        state.isLoading = false;
      }),

      setMetrics: (metrics) => set((state) => {
        state.metrics = metrics;
        state.lastUpdated = new Date();
      }),

      setCharts: (charts) => set((state) => {
        state.charts = charts;
        state.lastUpdated = new Date();
      }),

      updateFilters: (newFilters) => set((state) => {
        state.filters = { ...state.filters, ...newFilters };
      }),

      resetFilters: () => set((state) => {
        state.filters = defaultFilters;
      }),

      // Async Actions
      fetchDashboardData: async () => {
        const { setLoading, setError, setMetrics, setCharts } = get();
        
        try {
          setLoading(true);
          setError(null);

          const response = await dashboardService.getDashboardData(get().filters);
          
          setMetrics(response.metrics);
          setCharts(response.charts);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
        } finally {
          setLoading(false);
        }
      },

      refreshData: async () => {
        await get().fetchDashboardData();
      },

      exportData: async (format) => {
        const { setLoading, setError } = get();
        
        try {
          setLoading(true);
          setError(null);

          await dashboardService.exportData(get().filters, format);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to export data');
        } finally {
          setLoading(false);
        }
      }
    })),
    {
      name: 'dashboard-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        filters: state.filters,
        // Don't persist loading states or data
      }),
      version: 1,
    }
  )
);

// Selectors for optimized component subscriptions
export const dashboardSelectors = {
  metrics: (state: DashboardStore) => state.metrics,
  charts: (state: DashboardStore) => state.charts,
  filters: (state: DashboardStore) => state.filters,
  isLoading: (state: DashboardStore) => state.isLoading,
  error: (state: DashboardStore) => state.error,
  lastUpdated: (state: DashboardStore) => state.lastUpdated,
  
  // Computed selectors
  hasData: (state: DashboardStore) => state.metrics.length > 0 || state.charts.length > 0,
  criticalMetrics: (state: DashboardStore) => 
    state.metrics.filter(metric => metric.color === 'red'),
  isDataStale: (state: DashboardStore) => {
    if (!state.lastUpdated) return true;
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - state.lastUpdated.getTime() > fiveMinutes;
  }
};