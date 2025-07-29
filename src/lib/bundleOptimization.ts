import { performanceMonitor } from './performance';
import { configUtils } from '@/config/environment';

/**
 * Advanced Bundle Optimization System
 * Implements intelligent loading, progressive enhancement, and performance monitoring
 */

interface BundleLoadStrategy {
  priority: 'critical' | 'high' | 'normal' | 'low';
  loadTiming: 'immediate' | 'on-interaction' | 'on-idle' | 'on-visible';
  dependencies?: string[];
  conditions?: {
    network?: 'fast' | 'slow' | 'offline';
    device?: 'desktop' | 'mobile' | 'tablet';
    feature?: string;
    user?: 'new' | 'returning' | 'premium';
  };
}

interface BundleMetrics {
  loadTime: number;
  parseTime: number;
  executionTime: number;
  memoryUsage: number;
  cacheHit: boolean;
  networkSpeed: string;
}

class IntelligentBundleLoader {
  private loadedBundles = new Set<string>();
  private loadingPromises = new Map<string, Promise<any>>();
  private bundleMetrics = new Map<string, BundleMetrics>();
  private userBehaviorPattern: string[] = [];
  private networkQuality: 'fast' | 'slow' | 'offline' = 'fast';

  constructor() {
    this.initializeNetworkMonitoring();
    this.initializeUserBehaviorTracking();
    this.setupIntersectionObserver();
  }

  /**
   * Load bundle with intelligent strategies
   */
  async loadBundle(
    bundleName: string,
    importFunc: () => Promise<any>,
    strategy: BundleLoadStrategy = { priority: 'normal', loadTiming: 'immediate' },
  ): Promise<any> {
    const startTime = performance.now();

    // Check if already loaded
    if (this.loadedBundles.has(bundleName)) {
      return this.getCachedBundle(bundleName);
    }

    // Check if currently loading
    if (this.loadingPromises.has(bundleName)) {
      return this.loadingPromises.get(bundleName);
    }

    // Apply loading strategy
    const shouldLoad = this.evaluateLoadConditions(strategy);
    if (!shouldLoad) {
      return this.queueForLater(bundleName, importFunc, strategy);
    }

    // Create loading promise
    const loadingPromise = this.executeLoad(bundleName, importFunc, startTime);
    this.loadingPromises.set(bundleName, loadingPromise);

    try {
      const result = await loadingPromise;
      this.loadedBundles.add(bundleName);
      this.recordUserBehavior(bundleName);
      return result;
    } finally {
      this.loadingPromises.delete(bundleName);
    }
  }

  /**
   * Preload bundles based on user behavior prediction
   */
  preloadPredictedBundles(): void {
    const predictions = this.predictNextBundles();

    predictions.forEach(({ bundleName, probability, importFunc }) => {
      if (probability > 0.7 && !this.loadedBundles.has(bundleName)) {
        this.queueIdlePreload(bundleName, importFunc);
      }
    });
  }

  /**
   * Progressive bundle loading based on viewport and user interaction
   */
  setupProgressiveLoading(): void {
    // Preload critical above-the-fold bundles
    this.preloadCriticalBundles();

    // Load secondary bundles on user interaction
    this.setupInteractionPreloading();

    // Load tertiary bundles during idle time
    this.setupIdleLoading();
  }

  private async executeLoad(
    bundleName: string,
    importFunc: () => Promise<any>,
    startTime: number,
  ): Promise<any> {
    try {
      const parseStart = performance.now();
      const module = await importFunc();
      const parseEnd = performance.now();

      const executionStart = performance.now();
      // Simulate module execution
      await new Promise(resolve => setTimeout(resolve, 0));
      const executionEnd = performance.now();

      const metrics: BundleMetrics = {
        loadTime: parseStart - startTime,
        parseTime: parseEnd - parseStart,
        executionTime: executionEnd - executionStart,
        memoryUsage: this.getMemoryUsage(),
        cacheHit: parseEnd - parseStart < 10, // Assume cache hit if very fast
        networkSpeed: this.networkQuality,
      };

      this.bundleMetrics.set(bundleName, metrics);
      this.reportBundleMetrics(bundleName, metrics);

      return module;
    } catch (error) {
      performanceMonitor.recordMetric('bundle_load_error', 1, 'count', {
        bundleName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private evaluateLoadConditions(strategy: BundleLoadStrategy): boolean {
    const { conditions } = strategy;
    if (!conditions) { return true; }

    // Network condition check
    if (conditions.network && conditions.network !== this.networkQuality) {
      return false;
    }

    // Device condition check
    if (conditions.device) {
      const deviceType = this.getDeviceType();
      if (deviceType !== conditions.device) {
        return false;
      }
    }

    // Feature flag check
    if (conditions.feature && !configUtils.isFeatureEnabled(conditions.feature as any)) {
      return false;
    }

    return true;
  }

  private predictNextBundles(): Array<{ bundleName: string; probability: number; importFunc: () => Promise<any> }> {
    // Simple ML-like prediction based on user behavior patterns
    const currentPath = window.location.pathname;
    const behaviorScore = new Map<string, number>();

    // Analyze recent behavior patterns
    this.userBehaviorPattern.slice(-10).forEach((bundle, index) => {
      const weight = (index + 1) / 10; // More recent = higher weight
      behaviorScore.set(bundle, (behaviorScore.get(bundle) || 0) + weight);
    });

    // Predict based on current page context
    const contextPredictions = this.getContextualPredictions(currentPath);

    return contextPredictions.map(prediction => ({
      ...prediction,
      probability: Math.min(1, (behaviorScore.get(prediction.bundleName) || 0) * 0.3 + prediction.probability),
    }));
  }

  private getContextualPredictions(currentPath: string): Array<{ bundleName: string; probability: number; importFunc: () => Promise<any> }> {
    const predictions: Array<{ bundleName: string; probability: number; importFunc: () => Promise<any> }> = [];

    if (currentPath.includes('/dashboard')) {
      predictions.push(
        { bundleName: 'projects', probability: 0.8, importFunc: () => import('@/pages/Index') },
        { bundleName: 'analytics', probability: 0.6, importFunc: () => import('@/pages/Index') },
      );
    } else if (currentPath.includes('/projects')) {
      predictions.push(
        { bundleName: 'estimates', probability: 0.9, importFunc: () => import('@/pages/Index') },
        { bundleName: 'scheduling', probability: 0.7, importFunc: () => import('@/pages/Index') },
      );
    } else if (currentPath.includes('/estimates')) {
      predictions.push(
        { bundleName: 'invoices', probability: 0.8, importFunc: () => import('@/pages/Index') },
        { bundleName: 'clients', probability: 0.6, importFunc: () => import('@/pages/Index') },
      );
    }

    return predictions;
  }

  private preloadCriticalBundles(): void {
    const criticalBundles = [
      { name: 'ui-components', import: () => import('@/components/ui/button') },
      { name: 'navigation', import: () => import('@/components/ui/card') },
      { name: 'dashboard-widgets', import: () => import('@/components/ui/badge') },
    ];

    criticalBundles.forEach(({ name, import: importFunc }) => {
      this.loadBundle(name, importFunc, {
        priority: 'critical',
        loadTiming: 'immediate',
      });
    });
  }

  private setupInteractionPreloading(): void {
    // Preload on hover over navigation items
    document.addEventListener('mouseenter', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('[data-preload]');

      if (link) {
        const bundleName = link.getAttribute('data-preload');
        if (bundleName && !this.loadedBundles.has(bundleName)) {
          this.preloadBundle(bundleName);
        }
      }
    }, { passive: true });

    // Preload on focus for keyboard navigation
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('[data-preload]');

      if (link) {
        const bundleName = link.getAttribute('data-preload');
        if (bundleName && !this.loadedBundles.has(bundleName)) {
          this.preloadBundle(bundleName);
        }
      }
    }, { passive: true });
  }

  private setupIdleLoading(): void {
    if ('requestIdleCallback' in window) {
      const idleLoader = () => {
        this.preloadPredictedBundles();
        requestIdleCallback(idleLoader, { timeout: 10000 });
      };

      requestIdleCallback(idleLoader, { timeout: 5000 });
    }
  }

  private queueIdlePreload(bundleName: string, importFunc: () => Promise<any>): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.loadBundle(bundleName, importFunc, {
          priority: 'low',
          loadTiming: 'on-idle',
        });
      }, { timeout: 5000 });
    }
  }

  private preloadBundle(bundleName: string): void {
    const preloadMap: Record<string, () => Promise<any>> = {
      'projects': () => import('@/pages/Index'), // Using existing page for now
      'estimates': () => import('@/pages/Index'),
      'invoices': () => import('@/pages/Index'),
      'clients': () => import('@/pages/Index'),
      'inventory': () => import('@/pages/Index'),
      'scheduling': () => import('@/pages/Index'),
      'analytics': () => import('@/pages/Index'),
      'settings': () => import('@/pages/Index'),
    };

    const importFunc = preloadMap[bundleName];
    if (importFunc) {
      this.loadBundle(bundleName, importFunc, {
        priority: 'high',
        loadTiming: 'on-interaction',
      });
    }
  }

  private queueForLater(
    bundleName: string,
    importFunc: () => Promise<any>,
    strategy: BundleLoadStrategy,
  ): Promise<any> {
    return new Promise((resolve) => {
      // Queue for appropriate timing
      switch (strategy.loadTiming) {
        case 'on-idle':
          this.queueIdlePreload(bundleName, importFunc);
          break;
        case 'on-interaction':
          // Will be loaded on user interaction
          break;
        case 'on-visible':
          this.setupVisibilityLoading(bundleName, importFunc);
          break;
      }

      // For now, resolve with a placeholder
      resolve({ default: () => null });
    });
  }

  private setupVisibilityLoading(bundleName: string, importFunc: () => Promise<any>): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.loadBundle(bundleName, importFunc);
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });

    // Find elements that might trigger this bundle
    const triggerElements = document.querySelectorAll(`[data-bundle="${bundleName}"]`);
    triggerElements.forEach(el => { observer.observe(el); });
  }

  private initializeNetworkMonitoring(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;

      const updateNetworkQuality = () => {
        if (connection.effectiveType === '4g' || connection.effectiveType === '3g') {
          this.networkQuality = 'fast';
        } else {
          this.networkQuality = 'slow';
        }
      };

      updateNetworkQuality();
      connection.addEventListener('change', updateNetworkQuality);
    }

    // Monitor actual network performance
    window.addEventListener('offline', () => {
      this.networkQuality = 'offline';
    });

    window.addEventListener('online', () => {
      this.networkQuality = 'fast'; // Assume fast until proven otherwise
    });
  }

  private initializeUserBehaviorTracking(): void {
    // Track page navigation patterns
    let lastPath = window.location.pathname;

    const trackNavigation = () => {
      const currentPath = window.location.pathname;
      if (currentPath !== lastPath) {
        this.userBehaviorPattern.push(this.pathToBundleName(currentPath));

        // Keep only last 20 interactions
        if (this.userBehaviorPattern.length > 20) {
          this.userBehaviorPattern.shift();
        }

        lastPath = currentPath;
      }
    };

    // Listen for route changes
    window.addEventListener('popstate', trackNavigation);

    // Override pushState and replaceState to catch programmatic navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      trackNavigation();
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      trackNavigation();
    };
  }

  private setupIntersectionObserver(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const bundleName = element.getAttribute('data-lazy-bundle');

          if (bundleName && !this.loadedBundles.has(bundleName)) {
            this.preloadBundle(bundleName);
          }
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '100px', // Start loading 100px before element becomes visible
    });

    // Observe elements that should trigger lazy loading
    document.addEventListener('DOMContentLoaded', () => {
      const lazyElements = document.querySelectorAll('[data-lazy-bundle]');
      lazyElements.forEach(el => { observer.observe(el); });
    });
  }

  private pathToBundleName(path: string): string {
    if (path.includes('/projects')) { return 'projects'; }
    if (path.includes('/estimates')) { return 'estimates'; }
    if (path.includes('/invoices')) { return 'invoices'; }
    if (path.includes('/clients')) { return 'clients'; }
    if (path.includes('/inventory')) { return 'inventory'; }
    if (path.includes('/scheduling')) { return 'scheduling'; }
    if (path.includes('/analytics')) { return 'analytics'; }
    if (path.includes('/settings')) { return 'settings'; }
    return 'dashboard';
  }

  private getCachedBundle(bundleName: string): any {
    // Return cached module if available
    return { default: () => null }; // Placeholder
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / (1024 * 1024); // MB
    }
    return 0;
  }

  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const width = window.innerWidth;
    if (width < 768) { return 'mobile'; }
    if (width < 1024) { return 'tablet'; }
    return 'desktop';
  }

  private recordUserBehavior(bundleName: string): void {
    this.userBehaviorPattern.push(bundleName);

    // Keep pattern manageable
    if (this.userBehaviorPattern.length > 50) {
      this.userBehaviorPattern.shift();
    }
  }

  private reportBundleMetrics(bundleName: string, metrics: BundleMetrics): void {
    performanceMonitor.recordMetric(`bundle_load_time_${bundleName}`, metrics.loadTime, 'ms', {
      bundleName,
      cacheHit: metrics.cacheHit,
      networkSpeed: metrics.networkSpeed,
    });

    performanceMonitor.recordMetric(`bundle_parse_time_${bundleName}`, metrics.parseTime, 'ms', {
      bundleName,
    });

    performanceMonitor.recordMetric(`bundle_memory_usage_${bundleName}`, metrics.memoryUsage, 'mb', {
      bundleName,
    });

    // Log summary for debugging
    console.group(`📦 Bundle Loaded: ${bundleName}`);
    console.log(`⏱️ Load Time: ${metrics.loadTime.toFixed(2)}ms`);
    console.log(`🔄 Parse Time: ${metrics.parseTime.toFixed(2)}ms`);
    console.log(`⚡ Execution Time: ${metrics.executionTime.toFixed(2)}ms`);
    console.log(`💾 Memory Usage: ${metrics.memoryUsage.toFixed(2)}MB`);
    console.log(`🚀 Cache Hit: ${metrics.cacheHit ? 'Yes' : 'No'}`);
    console.log(`🌐 Network: ${metrics.networkSpeed}`);
    console.groupEnd();
  }

  /**
   * Get performance statistics for analysis
   */
  getBundleAnalytics(): {
    totalBundles: number;
    averageLoadTime: number;
    cacheHitRate: number;
    memoryEfficiency: number;
    userPatterns: string[];
    } {
    const metrics = Array.from(this.bundleMetrics.values());

    return {
      totalBundles: this.loadedBundles.size,
      averageLoadTime: metrics.reduce((sum, m) => sum + m.loadTime, 0) / metrics.length || 0,
      cacheHitRate: metrics.filter(m => m.cacheHit).length / metrics.length || 0,
      memoryEfficiency: metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length || 0,
      userPatterns: [...this.userBehaviorPattern],
    };
  }
}

// Global bundle loader instance
export const intelligentBundleLoader = new IntelligentBundleLoader();

// Initialize progressive loading on app start
export function initializeBundleOptimization(): void {
  intelligentBundleLoader.setupProgressiveLoading();

  // Start predictive preloading after initial load
  setTimeout(() => {
    intelligentBundleLoader.preloadPredictedBundles();
  }, 2000);
}

// Export utilities for use in components
export { BundleLoadStrategy, BundleMetrics };