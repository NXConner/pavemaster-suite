import React, { ReactNode, useEffect } from 'react';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

interface PerformanceProviderProps {
  children: ReactNode;
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  const { recordMetric } = usePerformanceMonitoring({
    componentName: 'App',
    trackRenderTime: true,
    trackInteractions: true,
  });

  useEffect(() => {
    // Track app initialization time
    const initTime = performance.now();
    recordMetric('app-initialization', initTime, 'ms', { type: 'startup' });

    // Track Core Web Vitals
    if ('web-vitals' in window) {
      // This would integrate with the web-vitals library if installed
      // import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
      console.log('Web Vitals monitoring would be initialized here');
    }

    // Track memory usage
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      recordMetric('memory-usage', memoryInfo.usedJSHeapSize / 1024 / 1024, 'MB', {
        total: memoryInfo.totalJSHeapSize / 1024 / 1024,
        limit: memoryInfo.jsHeapSizeLimit / 1024 / 1024
      });
    }

    // Track navigation timing
    if (performance.navigation) {
      recordMetric('page-load-time', performance.timing.loadEventEnd - performance.timing.navigationStart, 'ms', {
        type: 'navigation'
      });
    }

    // Set up performance observer for monitoring
    if ('PerformanceObserver' in window) {
      try {
        // Long task observer
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) { // Tasks longer than 50ms
              recordMetric('long-task', entry.duration, 'ms', {
                name: entry.name,
                startTime: entry.startTime
              });
            }
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });

        // Layout shift observer
        const layoutShiftObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (entry.value > 0.1) { // Significant layout shifts
              recordMetric('layout-shift', entry.value, 'score', {
                hadRecentInput: entry.hadRecentInput
              });
            }
          });
        });
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });

        // Paint observer
        const paintObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            recordMetric(`paint-${entry.name}`, entry.startTime, 'ms', {
              type: 'paint'
            });
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });

        // Cleanup observers on unmount
        return () => {
          longTaskObserver.disconnect();
          layoutShiftObserver.disconnect();
          paintObserver.disconnect();
        };
      } catch (error) {
        console.warn('Performance observers not fully supported:', error);
      }
    }

    // Resource timing monitoring
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        // Monitor slow loading resources
        if (entry.duration > 1000) { // Resources taking longer than 1s
          recordMetric('slow-resource', entry.duration, 'ms', {
            name: entry.name,
            type: entry.initiatorType,
            size: entry.transferSize
          });
        }
      });
    });

    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Resource observer not supported:', error);
    }

    return () => {
      try {
        resourceObserver.disconnect();
      } catch (error) {
        // Observer already disconnected
      }
    };
  }, [recordMetric]);

  // Monitor React concurrent features performance
  useEffect(() => {
    if (import.meta.env.DEV) {
      // In development, track component render times
      const originalConsoleTime = console.time;
      const originalConsoleTimeEnd = console.timeEnd;

      console.time = (label?: string) => {
        if (label && label.includes('React')) {
          recordMetric('react-operation', performance.now(), 'ms', { 
            operation: label,
            type: 'start'
          });
        }
        originalConsoleTime.call(console, label);
      };

      console.timeEnd = (label?: string) => {
        if (label && label.includes('React')) {
          recordMetric('react-operation', performance.now(), 'ms', { 
            operation: label,
            type: 'end'
          });
        }
        originalConsoleTimeEnd.call(console, label);
      };

      return () => {
        console.time = originalConsoleTime;
        console.timeEnd = originalConsoleTimeEnd;
      };
    }
  }, [recordMetric]);

  return <>{children}</>;
}