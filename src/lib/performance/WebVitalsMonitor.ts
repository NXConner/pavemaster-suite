// Web Vitals Performance Monitor
// Tracks Core Web Vitals and custom performance metrics

import { onCLS, onFCP, onFID, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  metadata?: Record<string, any>;
}

export class WebVitalsMonitor {
  private metrics: PerformanceMetric[] = [];
  private apiEndpoint: string;
  private isProduction: boolean;

  constructor(apiEndpoint: string = '/api/analytics/performance') {
    this.apiEndpoint = apiEndpoint;
    this.isProduction = import.meta.env.PROD;
    this.initializeWebVitals();
  }

  private initializeWebVitals(): void {
    // Core Web Vitals
    onCLS(this.handleMetric.bind(this));
    onFCP(this.handleMetric.bind(this));
    onFID(this.handleMetric.bind(this));
    onLCP(this.handleMetric.bind(this));
    onTTFB(this.handleMetric.bind(this));
    onINP(this.handleMetric.bind(this));
  }

  private handleMetric(metric: Metric): void {
    const performanceMetric: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      unit: this.getMetricUnit(metric.name),
      timestamp: Date.now(),
      rating: metric.rating,
      metadata: {
        id: metric.id,
        delta: metric.delta,
        entries: metric.entries?.length || 0,
        navigationType: (performance.getEntriesByType('navigation')[0] as any)?.type || 'unknown'
      }
    };

    this.metrics.push(performanceMetric);
    this.sendMetricToAnalytics(performanceMetric);

    // Log in development
    if (!this.isProduction) {
      console.log(`📊 ${metric.name}:`, {
        value: `${metric.value}${this.getMetricUnit(metric.name)}`,
        rating: metric.rating,
        delta: metric.delta
      });
    }
  }

  private getMetricUnit(metricName: string): string {
    switch (metricName) {
      case 'CLS': return '';
      case 'FCP':
      case 'FID':
      case 'LCP':
      case 'TTFB':
      case 'INP':
        return 'ms';
      default:
        return '';
    }
  }

  private async sendMetricToAnalytics(metric: PerformanceMetric): Promise<void> {
    if (!this.isProduction) return;

    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...metric,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error('Failed to send performance metric:', error);
    }
  }

  public recordCustomMetric(
    name: string, 
    value: number, 
    unit: string = 'ms',
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      rating: this.getRatingForCustomMetric(name, value),
      metadata
    };

    this.metrics.push(metric);
    this.sendMetricToAnalytics(metric);
  }

  private getRatingForCustomMetric(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    // Define custom thresholds for different metrics
    const thresholds: Record<string, { good: number; poor: number }> = {
      'api-response-time': { good: 200, poor: 1000 },
      'component-render-time': { good: 16, poor: 100 },
      'bundle-load-time': { good: 1000, poor: 3000 },
      'image-load-time': { good: 500, poor: 2000 }
    };

    const threshold = thresholds[name];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  public generateReport(): {
    summary: Record<string, any>;
    metrics: PerformanceMetric[];
    recommendations: string[];
  } {
    const summary: Record<string, any> = {};
    const recommendations: string[] = [];

    // Calculate averages for each metric type
    const metricTypes = [...new Set(this.metrics.map(m => m.name))];
    
    metricTypes.forEach(type => {
      const typeMetrics = this.getMetricsByName(type);
      const values = typeMetrics.map(m => m.value);
      const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
      const ratings = typeMetrics.map(m => m.rating);
      const poorCount = ratings.filter(r => r === 'poor').length;
      
      summary[type] = {
        average: avgValue,
        count: typeMetrics.length,
        poorPercentage: (poorCount / typeMetrics.length) * 100
      };

      // Generate recommendations
      if (poorCount / typeMetrics.length > 0.3) {
        recommendations.push(`Improve ${type}: ${poorCount}/${typeMetrics.length} measurements are poor`);
      }
    });

    return {
      summary,
      metrics: this.metrics,
      recommendations
    };
  }
}

// Global instance
export const webVitalsMonitor = new WebVitalsMonitor();
