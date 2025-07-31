/**
 * Enterprise Monitoring & Observability Stack
 * Comprehensive monitoring, logging, tracing, and alerting system
 */

import { supabase } from '@/integrations/supabase/client';

// Core monitoring interfaces
export interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags: Record<string, string>;
  type: 'counter' | 'gauge' | 'histogram' | 'timer';
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  component: string;
  metadata?: Record<string, any>;
  stackTrace?: string;
  correlationId?: string;
}

export interface TraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  tags: Record<string, string>;
  logs: Array<{ timestamp: Date; message: string; level: string }>;
  status: 'ok' | 'error' | 'timeout';
}

export interface Alert {
  id: string;
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'suppressed';
  triggeredAt: Date;
  resolvedAt?: Date;
  message: string;
  metadata: Record<string, any>;
  escalationLevel: number;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastChecked: Date;
  responseTime: number;
  details: Record<string, any>;
  dependencies: ServiceDependency[];
}

export interface ServiceDependency {
  name: string;
  status: 'available' | 'unavailable' | 'degraded';
  responseTime: number;
  errorRate: number;
  uptime: number;
}

// Performance monitoring
export interface PerformanceMetrics {
  // Core Web Vitals
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  
  // Custom metrics
  timeToInteractive: number;
  totalBlockingTime: number;
  speedIndex: number;
  
  // Resource metrics
  memoryUsage: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  
  // Network metrics
  navigationTiming: {
    dnsLookup: number;
    tcpConnect: number;
    serverResponse: number;
    domContentLoaded: number;
    loadComplete: number;
  };
}

// Business metrics
export interface BusinessMetrics {
  userEngagement: {
    sessionDuration: number;
    pageViews: number;
    bounceRate: number;
    conversionRate: number;
  };
  
  featureUsage: {
    predictiveAnalytics: number;
    blockchainTransactions: number;
    iotDevicesConnected: number;
    veteranFeaturesUsed: number;
  };
  
  systemHealth: {
    errorRate: number;
    uptime: number;
    averageResponseTime: number;
    throughput: number;
  };
}

// Enterprise Monitoring Service
export class MonitoringService {
  private static instance: MonitoringService;
  private metricsBuffer: Metric[] = [];
  private logsBuffer: LogEntry[] = [];
  private tracesBuffer: TraceSpan[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private performanceObserver: PerformanceObserver | null = null;

  private constructor() {
    this.initializeMonitoring();
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private initializeMonitoring(): void {
    // Initialize performance monitoring
    this.initializePerformanceMonitoring();
    
    // Initialize error tracking
    this.initializeErrorTracking();
    
    // Initialize user activity tracking
    this.initializeUserTracking();
    
    // Start periodic flushing
    this.startPeriodicFlush();
    
    // Initialize health checks
    this.initializeHealthChecks();
  }

  private initializePerformanceMonitoring(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Core Web Vitals
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordPerformanceMetric(entry);
        }
      });

      // Observe different performance entry types
      const entryTypes = ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'];
      entryTypes.forEach(type => {
        try {
          this.performanceObserver?.observe({ entryTypes: [type] });
        } catch (e) {
          // Some browsers may not support all entry types
          console.debug(`Performance observer type '${type}' not supported`);
        }
      });
    }

    // Memory usage monitoring
    if ('memory' in performance) {
      setInterval(() => {
        this.recordMetric({
          name: 'memory.used_heap_size',
          value: (performance as any).memory.usedJSHeapSize,
          unit: 'bytes',
          timestamp: new Date(),
          tags: { type: 'memory' },
          type: 'gauge'
        });
      }, 30000); // Every 30 seconds
    }
  }

  private recordPerformanceMetric(entry: PerformanceEntry): void {
    const metric: Metric = {
      name: `performance.${entry.name || entry.entryType}`,
      value: entry.duration || (entry as any).value || 0,
      unit: 'milliseconds',
      timestamp: new Date(entry.startTime),
      tags: {
        type: entry.entryType,
        name: entry.name
      },
      type: 'timer'
    };

    this.recordMetric(metric);
  }

  private initializeErrorTracking(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError('JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineNumber: event.lineno,
        columnNumber: event.colno,
        stack: event.error?.stack
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise
      });
    });

    // React error boundary integration
    this.setupReactErrorBoundary();
  }

  private setupReactErrorBoundary(): void {
    // This would be integrated with React Error Boundary
    (window as any).__PAVEMASTER_ERROR_HANDLER__ = (error: Error, errorInfo: any) => {
      this.logError('React Error Boundary', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    };
  }

  private initializeUserTracking(): void {
    // Page visibility tracking
    document.addEventListener('visibilitychange', () => {
      this.recordMetric({
        name: 'user.page_visibility',
        value: document.hidden ? 0 : 1,
        unit: 'boolean',
        timestamp: new Date(),
        tags: { state: document.hidden ? 'hidden' : 'visible' },
        type: 'gauge'
      });
    });

    // User interaction tracking
    ['click', 'scroll', 'keydown'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        this.recordMetric({
          name: `user.interaction.${eventType}`,
          value: 1,
          unit: 'count',
          timestamp: new Date(),
          tags: { type: eventType },
          type: 'counter'
        });
      }, { passive: true });
    });
  }

  private startPeriodicFlush(): void {
    this.flushInterval = setInterval(() => {
      this.flushData();
    }, 10000); // Flush every 10 seconds
  }

  private initializeHealthChecks(): void {
    setInterval(() => {
      this.performHealthChecks();
    }, 60000); // Every minute
  }

  // Public API methods
  recordMetric(metric: Metric): void {
    this.metricsBuffer.push(metric);
    
    // Immediate flush for critical metrics
    if (metric.tags.priority === 'critical') {
      this.flushData();
    }
  }

  recordLog(entry: LogEntry): void {
    // Add automatic metadata
    const enrichedEntry: LogEntry = {
      ...entry,
      timestamp: entry.timestamp || new Date(),
      sessionId: this.getSessionId(),
      requestId: this.generateRequestId(),
      correlationId: this.getCorrelationId()
    };

    this.logsBuffer.push(enrichedEntry);
    
    // Immediate flush for errors
    if (entry.level === 'error' || entry.level === 'fatal') {
      this.flushData();
    }
  }

  startTrace(operationName: string): TraceSpan {
    const traceSpan: TraceSpan = {
      traceId: this.generateTraceId(),
      spanId: this.generateSpanId(),
      operationName,
      startTime: new Date(),
      tags: {},
      logs: [],
      status: 'ok'
    };

    return traceSpan;
  }

  finishTrace(span: TraceSpan, status: 'ok' | 'error' | 'timeout' = 'ok'): void {
    span.endTime = new Date();
    span.duration = span.endTime.getTime() - span.startTime.getTime();
    span.status = status;
    
    this.tracesBuffer.push(span);
  }

  // Convenience methods
  logInfo(message: string, metadata?: Record<string, any>): void {
    this.recordLog({
      level: 'info',
      message,
      timestamp: new Date(),
      component: this.getComponent(),
      metadata
    });
  }

  logError(message: string, metadata?: Record<string, any>): void {
    this.recordLog({
      level: 'error',
      message,
      timestamp: new Date(),
      component: this.getComponent(),
      metadata,
      stackTrace: new Error().stack
    });
  }

  logWarning(message: string, metadata?: Record<string, any>): void {
    this.recordLog({
      level: 'warn',
      message,
      timestamp: new Date(),
      component: this.getComponent(),
      metadata
    });
  }

  // Business metrics tracking
  trackFeatureUsage(feature: string, metadata?: Record<string, any>): void {
    this.recordMetric({
      name: `feature.usage.${feature}`,
      value: 1,
      unit: 'count',
      timestamp: new Date(),
      tags: { feature, ...metadata },
      type: 'counter'
    });
  }

  trackUserAction(action: string, metadata?: Record<string, any>): void {
    this.recordMetric({
      name: `user.action.${action}`,
      value: 1,
      unit: 'count',
      timestamp: new Date(),
      tags: { action, ...metadata },
      type: 'counter'
    });
  }

  trackBusinessMetric(name: string, value: number, unit: string, tags?: Record<string, string>): void {
    this.recordMetric({
      name: `business.${name}`,
      value,
      unit,
      timestamp: new Date(),
      tags: tags || {},
      type: 'gauge'
    });
  }

  // Performance monitoring methods
  measurePageLoad(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.recordMetric({
          name: 'performance.page_load_time',
          value: navigation.loadEventEnd - navigation.fetchStart,
          unit: 'milliseconds',
          timestamp: new Date(),
          tags: { type: 'navigation' },
          type: 'timer'
        });
      }
    }
  }

  measureComponentRender(componentName: string, duration: number): void {
    this.recordMetric({
      name: 'performance.component_render',
      value: duration,
      unit: 'milliseconds',
      timestamp: new Date(),
      tags: { component: componentName },
      type: 'timer'
    });
  }

  // Health check methods
  private async performHealthChecks(): Promise<void> {
    const healthChecks: HealthCheck[] = [];

    // Supabase health check
    try {
      const start = Date.now();
      await supabase.from('health_check').select('*').limit(1);
      const responseTime = Date.now() - start;
      
      healthChecks.push({
        service: 'supabase',
        status: 'healthy',
        lastChecked: new Date(),
        responseTime,
        details: { provider: 'supabase' },
        dependencies: []
      });
    } catch (error) {
      healthChecks.push({
        service: 'supabase',
        status: 'unhealthy',
        lastChecked: new Date(),
        responseTime: -1,
        details: { error: (error as Error).message },
        dependencies: []
      });
    }

    // API health checks
    await this.checkAPIHealth(healthChecks);
    
    // Store health check results
    healthChecks.forEach(check => {
      this.recordMetric({
        name: `health.${check.service}.status`,
        value: check.status === 'healthy' ? 1 : 0,
        unit: 'boolean',
        timestamp: new Date(),
        tags: { service: check.service },
        type: 'gauge'
      });

      if (check.responseTime > 0) {
        this.recordMetric({
          name: `health.${check.service}.response_time`,
          value: check.responseTime,
          unit: 'milliseconds',
          timestamp: new Date(),
          tags: { service: check.service },
          type: 'timer'
        });
      }
    });
  }

  private async checkAPIHealth(healthChecks: HealthCheck[]): Promise<void> {
    const endpoints = [
      { name: 'api', url: '/api/health' },
      { name: 'cdn', url: 'https://cdn.pavemaster.com/health' }
    ];

    for (const endpoint of endpoints) {
      try {
        const start = Date.now();
        const response = await fetch(endpoint.url);
        const responseTime = Date.now() - start;
        
        healthChecks.push({
          service: endpoint.name,
          status: response.ok ? 'healthy' : 'degraded',
          lastChecked: new Date(),
          responseTime,
          details: { status: response.status, url: endpoint.url },
          dependencies: []
        });
      } catch (error) {
        healthChecks.push({
          service: endpoint.name,
          status: 'unhealthy',
          lastChecked: new Date(),
          responseTime: -1,
          details: { error: (error as Error).message, url: endpoint.url },
          dependencies: []
        });
      }
    }
  }

  // Data flushing
  private async flushData(): Promise<void> {
    if (this.metricsBuffer.length === 0 && this.logsBuffer.length === 0 && this.tracesBuffer.length === 0) {
      return;
    }

    try {
      // Flush metrics
      if (this.metricsBuffer.length > 0) {
        await this.flushMetrics([...this.metricsBuffer]);
        this.metricsBuffer = [];
      }

      // Flush logs
      if (this.logsBuffer.length > 0) {
        await this.flushLogs([...this.logsBuffer]);
        this.logsBuffer = [];
      }

      // Flush traces
      if (this.tracesBuffer.length > 0) {
        await this.flushTraces([...this.tracesBuffer]);
        this.tracesBuffer = [];
      }
    } catch (error) {
      console.error('Failed to flush monitoring data:', error);
    }
  }

  private async flushMetrics(metrics: Metric[]): Promise<void> {
    // In production, this would send to monitoring service (DataDog, New Relic, etc.)
    console.debug('Flushing metrics:', metrics.length);
    
    // Store in Supabase for now
    try {
      await supabase.from('metrics').insert(
        metrics.map(metric => ({
          name: metric.name,
          value: metric.value,
          unit: metric.unit,
          timestamp: metric.timestamp.toISOString(),
          tags: metric.tags,
          type: metric.type
        }))
      );
    } catch (error) {
      console.error('Failed to store metrics:', error);
    }
  }

  private async flushLogs(logs: LogEntry[]): Promise<void> {
    console.debug('Flushing logs:', logs.length);
    
    try {
      await supabase.from('logs').insert(
        logs.map(log => ({
          level: log.level,
          message: log.message,
          timestamp: log.timestamp.toISOString(),
          user_id: log.userId,
          session_id: log.sessionId,
          request_id: log.requestId,
          component: log.component,
          metadata: log.metadata,
          stack_trace: log.stackTrace,
          correlation_id: log.correlationId
        }))
      );
    } catch (error) {
      console.error('Failed to store logs:', error);
    }
  }

  private async flushTraces(traces: TraceSpan[]): Promise<void> {
    console.debug('Flushing traces:', traces.length);
    
    try {
      await supabase.from('traces').insert(
        traces.map(trace => ({
          trace_id: trace.traceId,
          span_id: trace.spanId,
          parent_span_id: trace.parentSpanId,
          operation_name: trace.operationName,
          start_time: trace.startTime.toISOString(),
          end_time: trace.endTime?.toISOString(),
          duration: trace.duration,
          tags: trace.tags,
          logs: trace.logs,
          status: trace.status
        }))
      );
    } catch (error) {
      console.error('Failed to store traces:', error);
    }
  }

  // Utility methods
  private getSessionId(): string {
    return sessionStorage.getItem('monitoring_session_id') || this.generateSessionId();
  }

  private generateSessionId(): string {
    const sessionId = crypto.randomUUID();
    sessionStorage.setItem('monitoring_session_id', sessionId);
    return sessionId;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSpanId(): string {
    return `span_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCorrelationId(): string {
    return sessionStorage.getItem('correlation_id') || this.generateSessionId();
  }

  private getComponent(): string {
    return window.location.pathname.split('/')[1] || 'unknown';
  }

  // Cleanup
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    // Final flush
    this.flushData();
  }
}

// Alerting system
export class AlertingService {
  private static instance: AlertingService;
  private alerts: Map<string, Alert> = new Map();
  private thresholds: Map<string, { threshold: number; comparison: 'gt' | 'lt' | 'eq' }> = new Map();

  static getInstance(): AlertingService {
    if (!AlertingService.instance) {
      AlertingService.instance = new AlertingService();
    }
    return AlertingService.instance;
  }

  private constructor() {
    this.setupDefaultThresholds();
  }

  private setupDefaultThresholds(): void {
    // Performance thresholds
    this.thresholds.set('performance.page_load_time', { threshold: 3000, comparison: 'gt' });
    this.thresholds.set('performance.first_contentful_paint', { threshold: 1800, comparison: 'gt' });
    
    // Error rate thresholds
    this.thresholds.set('error.rate', { threshold: 0.05, comparison: 'gt' });
    
    // Memory thresholds
    this.thresholds.set('memory.used_heap_size', { threshold: 100 * 1024 * 1024, comparison: 'gt' });
  }

  checkThreshold(metricName: string, value: number): void {
    const threshold = this.thresholds.get(metricName);
    if (!threshold) return;

    const shouldAlert = this.evaluateThreshold(value, threshold);
    
    if (shouldAlert) {
      this.triggerAlert({
        id: `alert_${metricName}_${Date.now()}`,
        name: `${metricName} threshold exceeded`,
        condition: `${metricName} ${threshold.comparison} ${threshold.threshold}`,
        severity: this.determineSeverity(metricName, value, threshold.threshold),
        status: 'active',
        triggeredAt: new Date(),
        message: `Metric ${metricName} has value ${value} which exceeds threshold ${threshold.threshold}`,
        metadata: { metricName, value, threshold: threshold.threshold },
        escalationLevel: 0
      });
    }
  }

  private evaluateThreshold(value: number, threshold: { threshold: number; comparison: 'gt' | 'lt' | 'eq' }): boolean {
    switch (threshold.comparison) {
      case 'gt': return value > threshold.threshold;
      case 'lt': return value < threshold.threshold;
      case 'eq': return value === threshold.threshold;
      default: return false;
    }
  }

  private determineSeverity(metricName: string, value: number, threshold: number): Alert['severity'] {
    const ratio = value / threshold;
    
    if (ratio > 2) return 'critical';
    if (ratio > 1.5) return 'high';
    if (ratio > 1.2) return 'medium';
    return 'low';
  }

  private triggerAlert(alert: Alert): void {
    this.alerts.set(alert.id, alert);
    console.warn('🚨 Alert triggered:', alert);
    
    // Send to monitoring service
    this.sendAlertNotification(alert);
  }

  private async sendAlertNotification(alert: Alert): Promise<void> {
    try {
      await supabase.from('alerts').insert({
        id: alert.id,
        name: alert.name,
        condition: alert.condition,
        severity: alert.severity,
        status: alert.status,
        triggered_at: alert.triggeredAt.toISOString(),
        message: alert.message,
        metadata: alert.metadata,
        escalation_level: alert.escalationLevel
      });
    } catch (error) {
      console.error('Failed to store alert:', error);
    }
  }
}

// Export singleton instances
export const monitoring = MonitoringService.getInstance();
export const alerting = AlertingService.getInstance();

// Export utilities for React integration
export const useMonitoring = () => {
  return {
    trackFeatureUsage: monitoring.trackFeatureUsage.bind(monitoring),
    trackUserAction: monitoring.trackUserAction.bind(monitoring),
    logError: monitoring.logError.bind(monitoring),
    logInfo: monitoring.logInfo.bind(monitoring),
    measureComponentRender: monitoring.measureComponentRender.bind(monitoring),
    startTrace: monitoring.startTrace.bind(monitoring),
    finishTrace: monitoring.finishTrace.bind(monitoring)
  };
};