// Performance Monitoring React Hook
// Provides easy access to performance monitoring in components

import { useEffect, useCallback, useRef } from 'react';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  metadata?: Record<string, any>;
}

export interface UsePerformanceMonitoringOptions {
  componentName?: string;
  trackRenderTime?: boolean;
  trackInteractions?: boolean;
}

export const usePerformanceMonitoring = (options: UsePerformanceMonitoringOptions = {}) => {
  const {
    componentName = 'unknown-component',
    trackRenderTime = false,
    trackInteractions = false
  } = options;

  const renderStartTime = useRef<number>();
  const interactionStartTime = useRef<number>();

  // Track component render time
  useEffect(() => {
    if (trackRenderTime && renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current;
      recordCustomMetric(
        'component-render-time',
        renderTime,
        'ms',
        { component: componentName }
      );
    }
  });

  // Start render timing
  useEffect(() => {
    if (trackRenderTime) {
      renderStartTime.current = performance.now();
    }
  }, [trackRenderTime]);

  // Track API call performance
  const trackApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    apiName: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;
      
      recordCustomMetric(
        'api-response-time',
        duration,
        'ms',
        { 
          api: apiName,
          component: componentName,
          success: true
        }
      );
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      recordCustomMetric(
        'api-response-time',
        duration,
        'ms',
        { 
          api: apiName,
          component: componentName,
          success: false,
          error: (error as Error).message
        }
      );
      
      throw error;
    }
  }, [componentName]);

  // Track user interactions
  const trackInteraction = useCallback((interactionName: string) => {
    if (!trackInteractions) return;

    if (interactionStartTime.current) {
      const duration = performance.now() - interactionStartTime.current;
      recordCustomMetric(
        'user-interaction-time',
        duration,
        'ms',
        {
          interaction: interactionName,
          component: componentName
        }
      );
    }

    interactionStartTime.current = performance.now();
  }, [componentName, trackInteractions]);

  // Simple metric recording function
  const recordCustomMetric = useCallback((
    name: string,
    value: number,
    unit: string = 'ms',
    metadata?: Record<string, any>
  ) => {
    // In development, log to console
    if (import.meta.env.DEV) {
      console.log(`📊 Performance: ${name} = ${value}${unit}`, metadata);
    }
    
    // TODO: Integrate with actual performance monitoring service
    // This would send to analytics endpoint in production
  }, []);

  // Get performance metrics (placeholder)
  const getMetrics = useCallback((): PerformanceMetric[] => {
    return [];
  }, []);

  // Get component-specific metrics (placeholder)
  const getComponentMetrics = useCallback((): PerformanceMetric[] => {
    return [];
  }, [componentName]);

  return {
    trackApiCall,
    trackInteraction,
    getMetrics,
    getComponentMetrics,
    recordMetric: recordCustomMetric
  };
};
