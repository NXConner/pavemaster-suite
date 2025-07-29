/**
 * Performance monitoring and optimization utilities
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      // Observe navigation metrics
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric('page_load_time', navEntry.loadEventEnd - navEntry.fetchStart, 'ms', {
              dom_content_loaded: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
              first_byte: navEntry.responseStart - navEntry.fetchStart,
            });
          }
        });
      });

      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // Observe paint metrics
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric(entry.name.replace('-', '_'), entry.startTime, 'ms');
        });
      });

      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.recordMetric('largest_contentful_paint', lastEntry.startTime, 'ms');
        }
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // Observe cumulative layout shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries() as PerformanceEntry[];
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric('cumulative_layout_shift', clsValue, 'count');
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

    } catch (error) {
      console.warn('Performance monitoring setup failed:', error);
    }
  }

  public recordMetric(
    name: string,
    value: number,
    unit: 'ms' | 'bytes' | 'count',
    metadata?: Record<string, unknown>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata,
    };

    const existing = this.metrics.get(name) ?? [];
    existing.push(metric);
    
    // Keep only last 100 metrics per type
    if (existing.length > 100) {
      existing.splice(0, existing.length - 100);
    }
    
    this.metrics.set(name, existing);

    // Log important metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance: ${name} = ${value}${unit}`, metadata);
    }
  }

  public getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.get(name) ?? [];
    }
    
    return Array.from(this.metrics.values()).flat();
  }

  public getAverageMetric(name: string): number | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) {
      return null;
    }
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  public clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }

  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Timer utility for measuring custom operations
export class PerformanceTimer {
  private startTime: number;
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.startTime = performance.now();
  }

  public end(metadata?: Record<string, unknown>): number {
    const duration = performance.now() - this.startTime;
    performanceMonitor.recordMetric(this.name, duration, 'ms', metadata);
    return duration;
  }
}

// React hook for measuring component render time
export function usePerformanceTimer(componentName: string) {
  const startTime = performance.now();
  
  return {
    measure: (operation: string, metadata?: Record<string, unknown>) => {
      const duration = performance.now() - startTime;
      performanceMonitor.recordMetric(
        `${componentName}_${operation}`,
        duration,
        'ms',
        metadata
      );
      return duration;
    }
  };
}

// Memory usage monitoring
export function getMemoryUsage(): Record<string, number> | null {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return null;
  }

  const memory = (performance as any).memory;
  if (!memory) {
    return null;
  }

  return {
    used: memory.usedJSHeapSize,
    total: memory.totalJSHeapSize,
    limit: memory.jsHeapSizeLimit,
  };
}

// Bundle size monitoring
export function trackBundleSize(bundleName: string, size: number): void {
  performanceMonitor.recordMetric(`bundle_size_${bundleName}`, size, 'bytes');
}

// API call performance tracking
export function trackAPICall(endpoint: string, duration: number, status: number): void {
  performanceMonitor.recordMetric('api_call_duration', duration, 'ms', {
    endpoint,
    status,
    success: status >= 200 && status < 300,
  });
}

// Resource loading performance
export function trackResourceLoad(resourceType: string, duration: number, size?: number): void {
  performanceMonitor.recordMetric(`resource_load_${resourceType}`, duration, 'ms', {
    size,
  });
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceMonitor.destroy();
  });
}

// Export performance data for analytics
export function exportPerformanceData(): Record<string, PerformanceMetric[]> {
  const data: Record<string, PerformanceMetric[]> = {};
  performanceMonitor.getMetrics().forEach(metric => {
    if (!data[metric.name]) {
      data[metric.name] = [];
    }
    data[metric.name].push(metric);
  });
  return data;
}