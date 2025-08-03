interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  memoryUsage?: any;
  timestamp: string;
}

interface BusinessMetrics {
  activeUsers: number;
  projectsCreated: number;
  equipmentTracked: number;
  apiCallsToday: number;
  errorRate: number;
  timestamp: string;
}

interface AlertRule {
  metric: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

class PerformanceMonitor {
  private observer: PerformanceObserver | null = null;
  private metrics: PerformanceMetrics[] = [];
  private alertRules: AlertRule[] = [
    { metric: 'pageLoadTime', threshold: 3000, operator: 'gt', severity: 'medium', message: 'Page load time exceeds 3 seconds' },
    { metric: 'largestContentfulPaint', threshold: 2500, operator: 'gt', severity: 'high', message: 'LCP exceeds 2.5 seconds' },
    { metric: 'firstInputDelay', threshold: 100, operator: 'gt', severity: 'medium', message: 'FID exceeds 100ms' },
    { metric: 'cumulativeLayoutShift', threshold: 0.1, operator: 'gt', severity: 'low', message: 'CLS exceeds 0.1' },
    { metric: 'errorRate', threshold: 5, operator: 'gt', severity: 'critical', message: 'Error rate exceeds 5%' }
  ];

  constructor() {
    this.initializePerformanceObserver();
    this.startMetricsCollection();
  }

  private initializePerformanceObserver(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.processPerformanceEntries(entries);
      });

      // Observe various performance entry types
      this.observer.observe({ 
        entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] 
      });
    } catch (error) {
      console.error('Failed to initialize performance observer:', error);
    }
  }

  private processPerformanceEntries(entries: PerformanceEntry[]): void {
    entries.forEach(entry => {
      switch (entry.entryType) {
        case 'navigation':
          this.handleNavigationEntry(entry as PerformanceNavigationTiming);
          break;
        case 'paint':
          this.handlePaintEntry(entry as PerformancePaintTiming);
          break;
        case 'largest-contentful-paint':
          this.handleLCPEntry(entry as PerformanceEntry);
          break;
        case 'first-input':
          this.handleFIDEntry(entry as PerformanceEntry);
          break;
        case 'layout-shift':
          this.handleCLSEntry(entry as PerformanceEntry);
          break;
      }
    });
  }

  private handleNavigationEntry(entry: PerformanceNavigationTiming): void {
    const metrics: PerformanceMetrics = {
      pageLoadTime: entry.loadEventEnd - entry.fetchStart,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      memoryUsage: (performance as any).memory,
      timestamp: new Date().toISOString()
    };

    this.recordMetrics(metrics);
  }

  private handlePaintEntry(entry: PerformancePaintTiming): void {
    if (entry.name === 'first-contentful-paint') {
      this.updateMetric('firstContentfulPaint', entry.startTime);
    }
  }

  private handleLCPEntry(entry: PerformanceEntry): void {
    this.updateMetric('largestContentfulPaint', entry.startTime);
  }

  private handleFIDEntry(entry: any): void {
    this.updateMetric('firstInputDelay', entry.processingStart - entry.startTime);
  }

  private handleCLSEntry(entry: any): void {
    if (!entry.hadRecentInput) {
      this.updateMetric('cumulativeLayoutShift', entry.value);
    }
  }

  private updateMetric(metricName: keyof PerformanceMetrics, value: number): void {
    const latestMetric = this.metrics[this.metrics.length - 1];
    if (latestMetric) {
      (latestMetric as any)[metricName] = value;
    }
  }

  private recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    this.checkAlerts(metrics);
    this.sendMetricsToAnalytics(metrics);
  }

  private checkAlerts(metrics: PerformanceMetrics): void {
    this.alertRules.forEach(rule => {
      const value = (metrics as any)[rule.metric];
      if (value !== undefined && this.evaluateRule(value, rule)) {
        this.triggerAlert(rule, value);
      }
    });
  }

  private evaluateRule(value: number, rule: AlertRule): boolean {
    switch (rule.operator) {
      case 'gt': return value > rule.threshold;
      case 'lt': return value < rule.threshold;
      case 'eq': return value === rule.threshold;
      default: return false;
    }
  }

  private triggerAlert(rule: AlertRule, value: number): void {
    const alert = {
      type: 'performance',
      severity: rule.severity,
      message: rule.message,
      metric: rule.metric,
      value,
      threshold: rule.threshold,
      timestamp: new Date().toISOString()
    };

    console.warn('Performance Alert:', alert);
    
    // Send to monitoring service
    this.sendAlert(alert);
  }

  private async sendAlert(alert: any): Promise<void> {
    try {
      // Send to monitoring service or webhook
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      });
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }

  private async sendMetricsToAnalytics(metrics: PerformanceMetrics): Promise<void> {
    try {
      // Send to analytics service
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      });
    } catch (error) {
      console.error('Failed to send metrics:', error);
    }
  }

  getLatestMetrics(): PerformanceMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  getMetricsHistory(hours: number = 24): PerformanceMetrics[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter(m => new Date(m.timestamp) > cutoff);
  }

  startMetricsCollection(): void {
    // Collect metrics every 30 seconds
    setInterval(() => {
      this.collectRuntimeMetrics();
    }, 30000);
  }

  private collectRuntimeMetrics(): void {
    if (typeof window === 'undefined') return;

    const metrics: PerformanceMetrics = {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      memoryUsage: (performance as any).memory,
      timestamp: new Date().toISOString()
    };

    this.recordMetrics(metrics);
  }

  async collectBusinessMetrics(): Promise<BusinessMetrics> {
    try {
      // These would typically come from your analytics service or database
      const businessMetrics: BusinessMetrics = {
        activeUsers: await this.getActiveUsers(),
        projectsCreated: await this.getProjectsCreatedToday(),
        equipmentTracked: await this.getEquipmentCount(),
        apiCallsToday: await this.getAPICallsToday(),
        errorRate: await this.getErrorRate(),
        timestamp: new Date().toISOString()
      };

      return businessMetrics;
    } catch (error) {
      console.error('Failed to collect business metrics:', error);
      throw error;
    }
  }

  private async getActiveUsers(): Promise<number> {
    // Implementation to get active users count
    return 0;
  }

  private async getProjectsCreatedToday(): Promise<number> {
    // Implementation to get projects created today
    return 0;
  }

  private async getEquipmentCount(): Promise<number> {
    // Implementation to get equipment count
    return 0;
  }

  private async getAPICallsToday(): Promise<number> {
    // Implementation to get API calls today
    return 0;
  }

  private async getErrorRate(): Promise<number> {
    // Implementation to get error rate
    return 0;
  }

  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();