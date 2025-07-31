/**
 * Advanced Performance Monitoring Service
 * Tracks Core Web Vitals, application performance, and provides optimization insights
 */

export interface CoreWebVitals {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  inp?: number; // Interaction to Next Paint (new metric)
}

export interface CustomMetrics {
  componentRenderTime: Map<string, number[]>;
  apiResponseTimes: Map<string, number[]>;
  memoryUsage: number[];
  bundleLoadTimes: Map<string, number>;
  routeNavigationTimes: Map<string, number>;
  errorCounts: Map<string, number>;
}

export interface PerformanceBudget {
  lcp: number; // Target: 2500ms
  fid: number; // Target: 100ms
  cls: number; // Target: 0.1
  fcp: number; // Target: 1800ms
  ttfb: number; // Target: 600ms
  inp: number; // Target: 200ms
  componentRender: number; // Target: 16ms (one frame)
  apiResponse: number; // Target: 1000ms
  memoryHeap: number; // Target: 50MB
}

export interface PerformanceAlert {
  metric: string;
  value: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  recommendations: string[];
}

export class AdvancedPerformanceMonitor {
  private vitals: CoreWebVitals = {};
  private customMetrics: CustomMetrics;
  private budget: PerformanceBudget;
  private observers: PerformanceObserver[] = [];
  private alerts: PerformanceAlert[] = [];
  private isMonitoring = false;
  private alertCallbacks: Array<(alert: PerformanceAlert) => void> = [];

  constructor(budget?: Partial<PerformanceBudget>) {
    this.budget = {
      lcp: 2500,
      fid: 100,
      cls: 0.1,
      fcp: 1800,
      ttfb: 600,
      inp: 200,
      componentRender: 16,
      apiResponse: 1000,
      memoryHeap: 50 * 1024 * 1024, // 50MB
      ...budget
    };

    this.customMetrics = {
      componentRenderTime: new Map(),
      apiResponseTimes: new Map(),
      memoryUsage: [],
      bundleLoadTimes: new Map(),
      routeNavigationTimes: new Map(),
      errorCounts: new Map()
    };

    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  /**
   * Initialize all performance observers
   */
  private initializeObservers(): void {
    try {
      // Core Web Vitals Observers
      this.setupLCPObserver();
      this.setupFIDObserver();
      this.setupCLSObserver();
      this.setupNavigationObserver();
      this.setupResourceObserver();
      this.setupMemoryMonitoring();
      
      console.log('🚀 Performance monitoring initialized');
    } catch (error) {
      console.warn('Performance observer initialization failed:', error);
    }
  }

  /**
   * Setup Largest Contentful Paint observer
   */
  private setupLCPObserver(): void {
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          this.vitals.lcp = lastEntry.startTime;
          this.checkBudgetViolation('lcp', lastEntry.startTime, this.budget.lcp);
        }
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn('LCP observer failed:', error);
      }
    }
  }

  /**
   * Setup First Input Delay observer
   */
  private setupFIDObserver(): void {
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (entry.name === 'first-input') {
            const fid = entry.processingStart - entry.startTime;
            this.vitals.fid = fid;
            this.checkBudgetViolation('fid', fid, this.budget.fid);
          }
        });
      });
      
      try {
        fidObserver.observe({ entryTypes: ['event'] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn('FID observer failed:', error);
      }
    }
  }

  /**
   * Setup Cumulative Layout Shift observer
   */
  private setupCLSObserver(): void {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.vitals.cls = clsValue;
        this.checkBudgetViolation('cls', clsValue, this.budget.cls);
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (error) {
        console.warn('CLS observer failed:', error);
      }
    }
  }

  /**
   * Setup navigation timing observer
   */
  private setupNavigationObserver(): void {
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          // First Contentful Paint
          if (entry.loadEventEnd && entry.fetchStart) {
            const fcp = entry.loadEventEnd - entry.fetchStart;
            this.vitals.fcp = fcp;
            this.checkBudgetViolation('fcp', fcp, this.budget.fcp);
          }

          // Time to First Byte
          if (entry.responseStart && entry.requestStart) {
            const ttfb = entry.responseStart - entry.requestStart;
            this.vitals.ttfb = ttfb;
            this.checkBudgetViolation('ttfb', ttfb, this.budget.ttfb);
          }
        });
      });
      
      try {
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (error) {
        console.warn('Navigation observer failed:', error);
      }
    }
  }

  /**
   * Setup resource loading observer
   */
  private setupResourceObserver(): void {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (entry.name.includes('.js') || entry.name.includes('.css')) {
            const fileName = entry.name.split('/').pop() || entry.name;
            this.customMetrics.bundleLoadTimes.set(fileName, entry.duration);
            
            // Alert on slow bundle loading
            if (entry.duration > 2000) { // 2 seconds
              this.createAlert({
                metric: 'bundle-load',
                value: entry.duration,
                threshold: 2000,
                severity: 'medium',
                recommendations: [
                  'Consider code splitting for large bundles',
                  'Implement preloading for critical resources',
                  'Optimize bundle size with tree shaking'
                ]
              });
            }
          }
        });
      });
      
      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.warn('Resource observer failed:', error);
      }
    }
  }

  /**
   * Setup memory monitoring
   */
  private setupMemoryMonitoring(): void {
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        const usedMemory = memory.usedJSHeapSize;
        
        this.customMetrics.memoryUsage.push(usedMemory);
        
        // Keep only last 100 measurements
        if (this.customMetrics.memoryUsage.length > 100) {
          this.customMetrics.memoryUsage.shift();
        }
        
        this.checkBudgetViolation('memory', usedMemory, this.budget.memoryHeap);
      };

      setInterval(checkMemory, 30000); // Check every 30 seconds
    }
  }

  /**
   * Check for budget violations and create alerts
   */
  private checkBudgetViolation(metric: string, value: number, threshold: number): void {
    if (value > threshold) {
      const severity = this.calculateSeverity(value, threshold);
      const recommendations = this.getRecommendations(metric, value, threshold);
      
      this.createAlert({
        metric,
        value,
        threshold,
        severity,
        recommendations
      });
    }
  }

  /**
   * Calculate alert severity based on how much threshold is exceeded
   */
  private calculateSeverity(value: number, threshold: number): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = value / threshold;
    if (ratio > 3) return 'critical';
    if (ratio > 2) return 'high';
    if (ratio > 1.5) return 'medium';
    return 'low';
  }

  /**
   * Get optimization recommendations for specific metrics
   */
  private getRecommendations(metric: string, value: number, threshold: number): string[] {
    const recommendations: string[] = [];
    
    switch (metric) {
      case 'lcp':
        recommendations.push(
          'Optimize images with WebP/AVIF format',
          'Preload critical resources',
          'Reduce server response time',
          'Use a CDN for static assets'
        );
        break;
      case 'fid':
        recommendations.push(
          'Break up long tasks with setTimeout',
          'Use web workers for heavy computations',
          'Optimize JavaScript execution',
          'Defer non-critical JavaScript'
        );
        break;
      case 'cls':
        recommendations.push(
          'Add size attributes to images and videos',
          'Reserve space for dynamic content',
          'Use CSS aspect ratios',
          'Avoid inserting content above existing content'
        );
        break;
      case 'memory':
        recommendations.push(
          'Implement virtual scrolling for large lists',
          'Clean up event listeners and subscriptions',
          'Use React.memo for expensive components',
          'Optimize image loading and caching'
        );
        break;
      default:
        recommendations.push('Monitor and optimize this metric');
    }
    
    return recommendations;
  }

  /**
   * Create and store performance alert
   */
  private createAlert(alertData: Omit<PerformanceAlert, 'timestamp'>): void {
    const alert: PerformanceAlert = {
      ...alertData,
      timestamp: Date.now()
    };
    
    this.alerts.push(alert);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts.shift();
    }
    
    // Notify callbacks
    this.alertCallbacks.forEach(callback => callback(alert));
    
    // Log critical alerts
    if (alert.severity === 'critical') {
      console.error('🚨 Critical Performance Alert:', alert);
    } else if (alert.severity === 'high') {
      console.warn('⚠️ High Performance Alert:', alert);
    }
  }

  /**
   * Measure component render time
   */
  measureComponentRender<T>(componentName: string, renderFn: () => T): T {
    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Store render time
    if (!this.customMetrics.componentRenderTime.has(componentName)) {
      this.customMetrics.componentRenderTime.set(componentName, []);
    }
    
    const times = this.customMetrics.componentRenderTime.get(componentName)!;
    times.push(renderTime);
    
    // Keep only last 20 measurements
    if (times.length > 20) {
      times.shift();
    }
    
    this.checkBudgetViolation('component-render', renderTime, this.budget.componentRender);
    
    return result;
  }

  /**
   * Measure API call performance
   */
  async measureApiCall<T>(endpoint: string, apiCall: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      // Store response time
      if (!this.customMetrics.apiResponseTimes.has(endpoint)) {
        this.customMetrics.apiResponseTimes.set(endpoint, []);
      }
      
      const times = this.customMetrics.apiResponseTimes.get(endpoint)!;
      times.push(responseTime);
      
      // Keep only last 20 measurements
      if (times.length > 20) {
        times.shift();
      }
      
      this.checkBudgetViolation('api-response', responseTime, this.budget.apiResponse);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      // Track error
      const errorKey = `${endpoint}-error`;
      const errorCount = this.customMetrics.errorCounts.get(errorKey) || 0;
      this.customMetrics.errorCounts.set(errorKey, errorCount + 1);
      
      this.createAlert({
        metric: 'api-error',
        value: responseTime,
        threshold: this.budget.apiResponse,
        severity: 'high',
        recommendations: [
          'Check network connectivity',
          'Implement retry logic',
          'Add error boundaries',
          'Monitor server health'
        ]
      });
      
      throw error;
    }
  }

  /**
   * Measure route navigation time
   */
  measureRouteNavigation(route: string, navigationFn: () => void): void {
    const startTime = performance.now();
    
    navigationFn();
    
    // Use requestIdleCallback to measure after navigation completes
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const endTime = performance.now();
        const navigationTime = endTime - startTime;
        
        this.customMetrics.routeNavigationTimes.set(route, navigationTime);
        
        if (navigationTime > 500) { // 500ms threshold
          this.createAlert({
            metric: 'route-navigation',
            value: navigationTime,
            threshold: 500,
            severity: 'medium',
            recommendations: [
              'Implement route-based code splitting',
              'Preload route components',
              'Optimize component mounting'
            ]
          });
        }
      });
    }
  }

  /**
   * Get performance score (0-100)
   */
  getPerformanceScore(): number {
    let score = 100;
    const violations = this.getBudgetViolations();
    
    violations.forEach(violation => {
      switch (violation.severity) {
        case 'critical': score -= 30; break;
        case 'high': score -= 20; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    });
    
    return Math.max(0, score);
  }

  /**
   * Get current budget violations
   */
  getBudgetViolations(): Array<{metric: string, value: number, threshold: number, severity: string}> {
    const violations = [];
    
    if (this.vitals.lcp && this.vitals.lcp > this.budget.lcp) {
      violations.push({
        metric: 'lcp',
        value: this.vitals.lcp,
        threshold: this.budget.lcp,
        severity: this.calculateSeverity(this.vitals.lcp, this.budget.lcp)
      });
    }
    
    // Add other violations...
    
    return violations;
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport(): {
    vitals: CoreWebVitals;
    customMetrics: {
      avgComponentRenderTime: number;
      avgApiResponseTime: number;
      currentMemoryUsage: number;
      totalErrors: number;
    };
    score: number;
    violations: any[];
    alerts: PerformanceAlert[];
    recommendations: string[];
  } {
    // Calculate averages
    const avgComponentRenderTime = Array.from(this.customMetrics.componentRenderTime.values())
      .flat()
      .reduce((sum, time, _, arr) => sum + time / arr.length, 0);
    
    const avgApiResponseTime = Array.from(this.customMetrics.apiResponseTimes.values())
      .flat()
      .reduce((sum, time, _, arr) => sum + time / arr.length, 0);
    
    const currentMemoryUsage = this.customMetrics.memoryUsage.length > 0 
      ? this.customMetrics.memoryUsage[this.customMetrics.memoryUsage.length - 1] 
      : 0;
    
    const totalErrors = Array.from(this.customMetrics.errorCounts.values())
      .reduce((sum, count) => sum + count, 0);
    
    return {
      vitals: { ...this.vitals },
      customMetrics: {
        avgComponentRenderTime,
        avgApiResponseTime,
        currentMemoryUsage,
        totalErrors
      },
      score: this.getPerformanceScore(),
      violations: this.getBudgetViolations(),
      alerts: [...this.alerts],
      recommendations: this.getOverallRecommendations()
    };
  }

  /**
   * Get overall optimization recommendations
   */
  private getOverallRecommendations(): string[] {
    const recommendations = new Set<string>();
    
    this.alerts.forEach(alert => {
      alert.recommendations.forEach(rec => recommendations.add(rec));
    });
    
    return Array.from(recommendations);
  }

  /**
   * Subscribe to performance alerts
   */
  onAlert(callback: (alert: PerformanceAlert) => void): () => void {
    this.alertCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Start monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🎯 Performance monitoring started');
    
    // Generate reports periodically
    setInterval(() => {
      const report = this.generateReport();
      console.log('📊 Performance Report:', report);
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Stop monitoring and cleanup
   */
  stopMonitoring(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isMonitoring = false;
    console.log('🛑 Performance monitoring stopped');
  }

  /**
   * Get current metrics snapshot
   */
  getCurrentMetrics(): {
    vitals: CoreWebVitals;
    score: number;
    alerts: number;
  } {
    return {
      vitals: { ...this.vitals },
      score: this.getPerformanceScore(),
      alerts: this.alerts.length
    };
  }
}

// Export singleton instance
export const performanceMonitor = new AdvancedPerformanceMonitor();

// Utility functions
export const measureRender = <T>(componentName: string, renderFn: () => T): T => 
  performanceMonitor.measureComponentRender(componentName, renderFn);

export const measureApi = <T>(endpoint: string, apiCall: () => Promise<T>): Promise<T> => 
  performanceMonitor.measureApiCall(endpoint, apiCall);

export const measureNavigation = (route: string, navigationFn: () => void): void => 
  performanceMonitor.measureRouteNavigation(route, navigationFn);

// Auto-start monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.startMonitoring();
}