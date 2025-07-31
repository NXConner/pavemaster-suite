/**
 * Advanced Performance Monitoring Service
 * Tracks Core Web Vitals, bundle performance, and provides optimization insights
 */

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  tTI?: number; // Time to Interactive
  
  // Custom Metrics
  componentRenderTime?: number;
  apiResponseTime?: number;
  memoryUsage?: number;
  bundleSize?: number;
  chunkLoadTime?: number;
}

export interface PerformanceBudget {
  lcp: number; // Target: 2.5s
  fid: number; // Target: 100ms
  cls: number; // Target: 0.1
  fcp: number; // Target: 1.8s
  ttfb: number; // Target: 600ms
  tTI: number; // Target: 3.8s
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private budget: PerformanceBudget;
  private observers: PerformanceObserver[] = [];
  private metricsBuffer: PerformanceMetrics[] = [];
  private alertCallback?: (metric: string, value: number, budget: number) => void;

  constructor(budget?: Partial<PerformanceBudget>) {
    this.budget = {
      lcp: 2500, // 2.5s
      fid: 100, // 100ms
      cls: 0.1, // 0.1
      fcp: 1800, // 1.8s
      ttfb: 600, // 600ms
      tTI: 3800, // 3.8s
      ...budget
    };

    this.initializeObservers();
    this.setupMemoryMonitoring();
  }

  /**
   * Initialize all performance observers
   */
  private initializeObservers(): void {
    // Largest Contentful Paint Observer
    if ('LargestContentfulPaint' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
        this.checkBudget('lcp', lastEntry.startTime);
        this.reportMetric('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    }

    // First Input Delay Observer
    if ('PerformanceEventTiming' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.name === 'first-input') {
            const fid = entry.processingStart - entry.startTime;
            this.metrics.fid = fid;
            this.checkBudget('fid', fid);
            this.reportMetric('fid', fid);
          }
        });
      });
      fidObserver.observe({ entryTypes: ['event'] });
      this.observers.push(fidObserver);
    }

    // Cumulative Layout Shift Observer
    if ('LayoutShift' in window) {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cls = clsValue;
        this.checkBudget('cls', clsValue);
        this.reportMetric('cls', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }

    // Navigation and Paint Observer
    if ('PerformanceNavigationTiming' in window) {
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          // First Contentful Paint
          const fcp = entry.loadEventEnd - entry.fetchStart;
          this.metrics.fcp = fcp;
          this.checkBudget('fcp', fcp);

          // Time to First Byte
          const ttfb = entry.responseStart - entry.requestStart;
          this.metrics.ttfb = ttfb;
          this.checkBudget('ttfb', ttfb);

          this.reportMetric('fcp', fcp);
          this.reportMetric('ttfb', ttfb);
        });
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);
    }

    // Resource Loading Observer
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.name.includes('.js') || entry.name.includes('.css')) {
          this.trackResourceLoad(entry);
        }
      });
    });
    resourceObserver.observe({ entryTypes: ['resource'] });
    this.observers.push(resourceObserver);
  }

  /**
   * Setup memory monitoring
   */
  private setupMemoryMonitoring(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = memory.usedJSHeapSize;
        this.reportMemoryUsage(memory);
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Track resource loading performance
   */
  private trackResourceLoad(entry: PerformanceEntry): void {
    const loadTime = entry.duration;
    if (entry.name.includes('chunk') || entry.name.includes('vendor')) {
      this.metrics.chunkLoadTime = loadTime;
      this.reportMetric('chunk-load', loadTime);
    }
  }

  /**
   * Check if metric exceeds budget
   */
  private checkBudget(metric: keyof PerformanceBudget, value: number): void {
    const budgetValue = this.budget[metric];
    if (value > budgetValue) {
      console.warn(`Performance budget exceeded for ${metric}: ${value}ms > ${budgetValue}ms`);
      this.alertCallback?.(metric, value, budgetValue);
    }
  }

  /**
   * Measure component render time
   */
  measureComponentRender<T>(componentName: string, fn: () => T): T {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    this.metrics.componentRenderTime = renderTime;
    this.reportMetric(`component-render-${componentName}`, renderTime);
    
    return result;
  }

  /**
   * Measure API response time
   */
  async measureApiCall<T>(url: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await fn();
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.metrics.apiResponseTime = responseTime;
      this.reportMetric(`api-response-${url}`, responseTime);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      this.reportMetric(`api-error-${url}`, responseTime);
      throw error;
    }
  }

  /**
   * Get performance score based on Core Web Vitals
   */
  getPerformanceScore(): number {
    const scores = {
      lcp: this.getLCPScore(),
      fid: this.getFIDScore(),
      cls: this.getCLSScore()
    };

    // Calculate weighted average (LCP: 25%, FID: 25%, CLS: 25%, Other: 25%)
    return (scores.lcp + scores.fid + scores.cls) / 3;
  }

  private getLCPScore(): number {
    if (!this.metrics.lcp) return 0;
    if (this.metrics.lcp <= 2500) return 100;
    if (this.metrics.lcp <= 4000) return 50;
    return 0;
  }

  private getFIDScore(): number {
    if (!this.metrics.fid) return 0;
    if (this.metrics.fid <= 100) return 100;
    if (this.metrics.fid <= 300) return 50;
    return 0;
  }

  private getCLSScore(): number {
    if (!this.metrics.cls) return 0;
    if (this.metrics.cls <= 0.1) return 100;
    if (this.metrics.cls <= 0.25) return 50;
    return 0;
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.lcp && this.metrics.lcp > 2500) {
      recommendations.push('Optimize Largest Contentful Paint: Consider image optimization, critical CSS inlining, or preloading key resources');
    }

    if (this.metrics.fid && this.metrics.fid > 100) {
      recommendations.push('Improve First Input Delay: Break up long tasks, optimize JavaScript execution, or use web workers');
    }

    if (this.metrics.cls && this.metrics.cls > 0.1) {
      recommendations.push('Reduce Cumulative Layout Shift: Add size attributes to images, reserve space for dynamic content');
    }

    if (this.metrics.memoryUsage && this.metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
      recommendations.push('High memory usage detected: Consider implementing virtual scrolling, lazy loading, or memory cleanup');
    }

    if (this.metrics.chunkLoadTime && this.metrics.chunkLoadTime > 1000) {
      recommendations.push('Slow chunk loading: Consider code splitting optimization or CDN implementation');
    }

    return recommendations;
  }

  /**
   * Export performance report
   */
  generateReport(): {
    metrics: PerformanceMetrics;
    score: number;
    recommendations: string[];
    budget: PerformanceBudget;
    violations: Array<{ metric: string; actual: number; budget: number }>;
  } {
    const violations: Array<{ metric: string; actual: number; budget: number }> = [];

    Object.entries(this.budget).forEach(([metric, budgetValue]) => {
      const actualValue = this.metrics[metric as keyof PerformanceMetrics];
      if (actualValue && actualValue > budgetValue) {
        violations.push({
          metric,
          actual: actualValue,
          budget: budgetValue
        });
      }
    });

    return {
      metrics: { ...this.metrics },
      score: this.getPerformanceScore(),
      recommendations: this.getOptimizationRecommendations(),
      budget: { ...this.budget },
      violations
    };
  }

  /**
   * Set alert callback for budget violations
   */
  onBudgetViolation(callback: (metric: string, value: number, budget: number) => void): void {
    this.alertCallback = callback;
  }

  /**
   * Report metric to monitoring service
   */
  private reportMetric(name: string, value: number): void {
    // Buffer metrics for batch sending
    this.metricsBuffer.push({
      [name]: value,
      timestamp: Date.now()
    } as any);

    // Send metrics in batches every 30 seconds
    if (this.metricsBuffer.length >= 10) {
      this.flushMetrics();
    }
  }

  /**
   * Report memory usage
   */
  private reportMemoryUsage(memory: any): void {
    const usage = {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };

    if (usage.percentage > 80) {
      console.warn('High memory usage detected:', usage);
    }
  }

  /**
   * Flush buffered metrics
   */
  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const metrics = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      // In production, send to monitoring service
      if (process.env.NODE_ENV === 'production') {
        // await fetch('/api/metrics', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ metrics })
        // });
      } else {
        console.log('Performance Metrics:', metrics);
      }
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
      // Re-add metrics to buffer for retry
      this.metricsBuffer.unshift(...metrics);
    }
  }

  /**
   * Start real-time monitoring
   */
  startMonitoring(): void {
    // Flush metrics every 30 seconds
    setInterval(() => {
      this.flushMetrics();
    }, 30000);

    // Generate report every 5 minutes
    setInterval(() => {
      const report = this.generateReport();
      console.log('Performance Report:', report);
    }, 300000);
  }

  /**
   * Stop monitoring and cleanup
   */
  stopMonitoring(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.flushMetrics(); // Send any remaining metrics
  }

  /**
   * Get current metrics snapshot
   */
  getCurrentMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-start monitoring in browser environment
if (typeof window !== 'undefined') {
  performanceMonitor.startMonitoring();
}

// Export utilities
export const measureRender = <T>(componentName: string, fn: () => T): T => 
  performanceMonitor.measureComponentRender(componentName, fn);

export const measureApi = <T>(url: string, fn: () => Promise<T>): Promise<T> => 
  performanceMonitor.measureApiCall(url, fn);