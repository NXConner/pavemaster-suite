import React from 'react';
import { getEnvironmentInfo } from '@/config/environment';

/**
 * Advanced Performance Monitoring System
 * Tracks Core Web Vitals, custom metrics, and user interactions
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface NavigatorWithMemory extends Navigator {
  memory?: MemoryInfo;
}

export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    this.initializeObservers();
  }

  /**
   * Record a custom performance metric
   */
  recordMetric(name: string, value: number, unit: string, metadata?: Record<string, unknown>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: performance.now(),
      metadata,
    };

    const categoryMetrics = this.metrics.get(name) || [];
    categoryMetrics.push(metric);

    // Keep only last 100 metrics per category
    if (categoryMetrics.length > 100) {
      categoryMetrics.shift();
    }

    this.metrics.set(name, categoryMetrics);

    // Log in development
    if (getEnvironmentInfo().isDevelopment) {
      console.log(`📊 Performance: ${name} = ${value.toFixed(2)}${unit}`, metadata);
    }
  }

  /**
   * Get Core Web Vitals
   */
  getCoreWebVitals(): Record<string, number> {
    const vitals: Record<string, number> = {};

    // Get FCP (First Contentful Paint)
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcpEntry) {
      vitals.fcp = fcpEntry.startTime;
    }

    // Get LCP from our observer
    const lcpMetrics = this.metrics.get('largest-contentful-paint');
    if (lcpMetrics && lcpMetrics.length > 0) {
      vitals.lcp = lcpMetrics[lcpMetrics.length - 1]?.value ?? 0;
    }

    return vitals;
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    try {
      // Navigation timing observer
      if ('PerformanceObserver' in window) {
        const navObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.recordMetric('navigation_load_time', navEntry.loadEventEnd - navEntry.loadEventStart, 'ms');
              this.recordMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart, 'ms');
            }
          });
        });

        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navObserver);
      }

      // Paint timing observer
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric(entry.name, entry.startTime, 'ms', {
            entryType: entry.entryType,
          });
        });
      });

      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.set('paint', paintObserver);

      // Largest Contentful Paint observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.recordMetric('largest-contentful-paint', lastEntry.startTime, 'ms', {
            element: (lastEntry as any).element?.tagName ?? 'unknown',
          });
        }
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);

      // Cumulative Layout Shift observer
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });

        if (clsValue > 0) {
          this.recordMetric('cumulative-layout-shift', clsValue, '', {
            type: 'layout-shift',
          });
        }
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', clsObserver);
    } catch (error) {
      console.warn('Performance observers not fully supported:', error);
    }
  }

  /**
   * Get memory usage information
   */
  getMemoryUsage(): Record<string, number> {
    const nav = navigator as NavigatorWithMemory;
    if (nav.memory) {
      const memory = nav.memory;
      return {
        used: Math.round(memory.usedJSHeapSize / (1024 * 1024)),
        total: Math.round(memory.totalJSHeapSize / (1024 * 1024)),
        limit: Math.round(memory.jsHeapSizeLimit / (1024 * 1024)),
      };
    }
    return {};
  }

  /**
   * Export all performance data
   */
  exportPerformanceData(): Record<string, PerformanceMetric[]> {
    const data: Record<string, PerformanceMetric[]> = {};
    this.metrics.forEach((metrics, name) => {
      data[name] = [...metrics];
    });
    return data;
  }

  /**
   * Clear all performance data
   */
  clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Disconnect all observers
   */
  disconnect(): void {
    this.observers.forEach(observer => { observer.disconnect(); });
    this.observers.clear();
  }
}

export class PerformanceTimer {
  private startTime: number;
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.startTime = performance.now();
  }

  end(): number {
    const duration = performance.now() - this.startTime;
    // Use the global instance directly to avoid circular imports
    globalPerformanceMonitor.recordMetric(this.name, duration, 'ms');
    return duration;
  }
}

/**
 * React hook for performance timing
 */
export function usePerformanceTimer(componentName: string) {
  const [timer] = React.useState(() => new PerformanceTimer(`component_${componentName}`));

  React.useEffect(() => {
    return () => {
      timer.end();
    };
  }, [timer]);

  return timer;
}

/**
 * Get current memory usage
 */
export function getMemoryUsage(): number {
  const nav = navigator as NavigatorWithMemory;
  return nav.memory ? Math.round(nav.memory.usedJSHeapSize / (1024 * 1024)) : 0;
}

/**
 * Track bundle size
 */
export function trackBundleSize(bundleName: string, size: number): void {
  globalPerformanceMonitor.recordMetric(`bundle_size_${bundleName}`, size, 'bytes');
}

/**
 * Track API call performance
 */
export function trackAPICall(endpoint: string, duration: number, status: number): void {
  globalPerformanceMonitor.recordMetric(`api_call_${endpoint}`, duration, 'ms', {
    status,
    success: status >= 200 && status < 300,
  });
}

/**
 * Track resource loading
 */
export function trackResourceLoad(resourceType: string, duration: number, size?: number): void {
  globalPerformanceMonitor.recordMetric(`resource_load_${resourceType}`, duration, 'ms', {
    size: size ?? 0,
  });
}

// Global performance monitor instance
const globalPerformanceMonitor = new PerformanceMonitor();
export const performanceMonitor = globalPerformanceMonitor;

/**
 * Export performance data for analysis
 */
export function exportPerformanceData(): Record<string, PerformanceMetric[]> {
  return globalPerformanceMonitor.exportPerformanceData();
}