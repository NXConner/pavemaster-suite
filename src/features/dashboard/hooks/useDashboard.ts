import { useEffect, useCallback } from 'react';
import { dashboardStore, dashboardSelectors } from '../stores/dashboardStore';
import type { UseDashboardReturn, DashboardFilter } from '../types';

export function useDashboard(): UseDashboardReturn {
  // Subscribe to store state
  const state = dashboardStore((state) => ({
    metrics: state.metrics,
    charts: state.charts,
    filters: state.filters,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated
  }));

  // Subscribe to store actions
  const actions = dashboardStore((state) => ({
    fetchDashboardData: state.fetchDashboardData,
    refreshData: state.refreshData,
    updateFilters: state.updateFilters,
    resetFilters: state.resetFilters,
    exportData: state.exportData
  }));

  // Fetch data on mount
  useEffect(() => {
    actions.fetchDashboardData();
  }, []);

  // Refresh data when filters change
  useEffect(() => {
    actions.fetchDashboardData();
  }, [state.filters]);

  // Memoized action wrappers
  const refreshData = useCallback(async () => {
    await actions.refreshData();
  }, [actions.refreshData]);

  const updateFilters = useCallback((filters: Partial<DashboardFilter>) => {
    actions.updateFilters(filters);
  }, [actions.updateFilters]);

  const resetFilters = useCallback(() => {
    actions.resetFilters();
  }, [actions.resetFilters]);

  const exportData = useCallback(async (format: 'csv' | 'pdf' | 'excel') => {
    await actions.exportData(format);
  }, [actions.exportData]);

  return {
    state,
    actions: {
      refreshData,
      updateFilters,
      resetFilters,
      exportData
    }
  };
}

// Specialized hooks for specific use cases
export function useDashboardMetrics() {
  const metrics = dashboardStore(dashboardSelectors.metrics);
  const isLoading = dashboardStore(dashboardSelectors.isLoading);
  const error = dashboardStore(dashboardSelectors.error);
  const refreshMetrics = dashboardStore((state) => state.refreshData);

  const criticalMetrics = dashboardStore(dashboardSelectors.criticalMetrics);

  return {
    metrics,
    criticalMetrics,
    isLoading,
    error,
    refreshMetrics
  };
}

export function useDashboardCharts() {
  const charts = dashboardStore(dashboardSelectors.charts);
  const isLoading = dashboardStore(dashboardSelectors.isLoading);
  const error = dashboardStore(dashboardSelectors.error);
  const refreshCharts = dashboardStore((state) => state.refreshData);

  const updateChartConfig = useCallback((chartId: string, config: any) => {
    // This would be implemented to update chart configuration
    console.log('Update chart config:', chartId, config);
  }, []);

  return {
    charts,
    isLoading,
    error,
    refreshCharts,
    updateChartConfig
  };
}

export function useDashboardStatus() {
  const hasData = dashboardStore(dashboardSelectors.hasData);
  const isDataStale = dashboardStore(dashboardSelectors.isDataStale);
  const lastUpdated = dashboardStore(dashboardSelectors.lastUpdated);
  const isLoading = dashboardStore(dashboardSelectors.isLoading);

  return {
    hasData,
    isDataStale,
    lastUpdated,
    isLoading,
    needsRefresh: isDataStale && !isLoading
  };
}