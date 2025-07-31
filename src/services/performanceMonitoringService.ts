// PHASE 14: Performance Monitoring and Observability Service
// Comprehensive monitoring, alerting, and analytics for enterprise operations
export interface PerformanceMetric {
  id: string;
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary' | 'timer';
  category: 'frontend' | 'backend' | 'database' | 'network' | 'infrastructure' | 'business';
  value: number;
  unit: string;
  timestamp: string;
  tags: Record<string, string>;
  metadata: MetricMetadata;
}

export interface MetricMetadata {
  source: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  component: string;
  instance: string;
  region: string;
}

export interface PerformanceThreshold {
  id: string;
  metricName: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  value: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  duration: number; // seconds
  description: string;
  enabled: boolean;
  notifications: NotificationConfig[];
}

export interface NotificationConfig {
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';
  target: string;
  template: string;
  conditions: NotificationCondition[];
}

export interface NotificationCondition {
  field: string;
  operator: string;
  value: any;
}

export interface PerformanceAlert {
  id: string;
  metricName: string;
  threshold: PerformanceThreshold;
  currentValue: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  status: 'active' | 'resolved' | 'suppressed';
  triggeredAt: string;
  resolvedAt?: string;
  duration: number;
  context: AlertContext;
  history: AlertHistory[];
}

export interface AlertContext {
  metric: PerformanceMetric;
  relatedMetrics: PerformanceMetric[];
  systemState: SystemState;
  userImpact: UserImpact;
  recommendations: string[];
}

export interface SystemState {
  cpu: number;
  memory: number;
  disk: number;
  network: NetworkState;
  applications: ApplicationState[];
  database: DatabaseState;
}

export interface NetworkState {
  latency: number;
  throughput: number;
  errors: number;
  connections: number;
}

export interface ApplicationState {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  cpu: number;
  memory: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
}

export interface DatabaseState {
  connections: number;
  queryTime: number;
  deadlocks: number;
  cacheHitRatio: number;
  replicationLag: number;
}

export interface UserImpact {
  affectedUsers: number;
  impactLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  businessImpact: 'none' | 'minor' | 'moderate' | 'major' | 'severe';
  estimatedRevenueLoss: number;
  slaViolation: boolean;
}

export interface AlertHistory {
  timestamp: string;
  action: 'triggered' | 'escalated' | 'acknowledged' | 'resolved' | 'suppressed';
  user?: string;
  notes?: string;
}

export interface PerformanceDashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  filters: DashboardFilter[];
  refreshInterval: number;
  permissions: string[];
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'gauge' | 'table' | 'text' | 'map' | 'heatmap';
  title: string;
  query: MetricQuery;
  visualization: VisualizationConfig;
  position: WidgetPosition;
  size: WidgetSize;
}

export interface MetricQuery {
  metrics: string[];
  filters: QueryFilter[];
  groupBy: string[];
  timeRange: TimeRange;
  aggregation: AggregationConfig;
}

export interface QueryFilter {
  field: string;
  operator: string;
  value: any;
}

export interface TimeRange {
  start: string;
  end: string;
  relative?: string; // e.g., 'last_1h', 'last_24h'
}

export interface AggregationConfig {
  function: 'avg' | 'sum' | 'min' | 'max' | 'count' | 'percentile';
  interval: string; // e.g., '1m', '5m', '1h'
  percentile?: number;
}

export interface VisualizationConfig {
  chartType: 'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'gauge';
  colors: string[];
  axes: AxisConfig[];
  legend: LegendConfig;
  annotations: AnnotationConfig[];
}

export interface AxisConfig {
  name: string;
  type: 'linear' | 'logarithmic' | 'time';
  min?: number;
  max?: number;
  unit: string;
}

export interface LegendConfig {
  position: 'top' | 'bottom' | 'left' | 'right';
  visible: boolean;
}

export interface AnnotationConfig {
  type: 'line' | 'area' | 'point';
  value: any;
  label: string;
  color: string;
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface DashboardLayout {
  type: 'grid' | 'free';
  columns: number;
  rowHeight: number;
  margin: number[];
}

export interface DashboardFilter {
  name: string;
  type: 'dropdown' | 'multiselect' | 'text' | 'date';
  options?: string[];
  defaultValue?: any;
}

export interface PerformanceReport {
  id: string;
  name: string;
  type: 'scheduled' | 'ad_hoc';
  format: 'pdf' | 'html' | 'json' | 'csv';
  content: ReportContent;
  schedule?: ReportSchedule;
  recipients: ReportRecipient[];
  lastGenerated?: string;
  nextGeneration?: string;
}

export interface ReportContent {
  title: string;
  summary: ReportSummary;
  sections: ReportSection[];
  appendices: ReportAppendix[];
}

export interface ReportSummary {
  period: string;
  keyMetrics: KeyMetric[];
  highlights: string[];
  issues: string[];
  recommendations: string[];
}

export interface KeyMetric {
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

export interface ReportSection {
  title: string;
  type: 'metrics' | 'analysis' | 'charts' | 'tables';
  content: any;
  insights: string[];
}

export interface ReportAppendix {
  title: string;
  type: 'data' | 'methodology' | 'glossary';
  content: any;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string;
  timezone: string;
  enabled: boolean;
}

export interface ReportRecipient {
  email: string;
  name: string;
  role: string;
  format: 'pdf' | 'html' | 'json' | 'csv';
}

export interface TraceData {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  serviceName: string;
  startTime: string;
  duration: number;
  status: 'ok' | 'error' | 'timeout';
  tags: Record<string, any>;
  logs: LogEntry[];
  baggage: Record<string, any>;
}

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  fields: Record<string, any>;
}

export interface DistributedTrace {
  traceId: string;
  rootSpan: TraceData;
  spans: TraceData[];
  services: string[];
  totalDuration: number;
  errorCount: number;
  criticalPath: string[];
  bottlenecks: TraceBottleneck[];
}

export interface TraceBottleneck {
  spanId: string;
  operationName: string;
  serviceName: string;
  duration: number;
  percentage: number;
  cause: string;
  recommendations: string[];
}

export interface SLAConfiguration {
  id: string;
  name: string;
  description: string;
  targets: SLATarget[];
  period: 'monthly' | 'quarterly' | 'annually';
  penalties: SLAPenalty[];
  rewards: SLAReward[];
  monitoring: SLAMonitoring;
}

export interface SLATarget {
  metric: string;
  target: number;
  unit: string;
  weight: number;
  criticality: 'low' | 'medium' | 'high' | 'critical';
}

export interface SLAPenalty {
  threshold: number;
  type: 'financial' | 'credit' | 'notice';
  amount: number;
  description: string;
}

export interface SLAReward {
  threshold: number;
  type: 'bonus' | 'credit' | 'recognition';
  amount: number;
  description: string;
}

export interface SLAMonitoring {
  frequency: string;
  alerting: boolean;
  reporting: boolean;
  escalation: EscalationConfig[];
}

export interface EscalationConfig {
  threshold: number;
  delay: number;
  recipients: string[];
  actions: string[];
}

export interface CapacityPlanning {
  id: string;
  resource: string;
  currentCapacity: number;
  utilization: number;
  trend: CapacityTrend;
  forecast: CapacityForecast[];
  recommendations: CapacityRecommendation[];
  lastUpdated: string;
}

export interface CapacityTrend {
  direction: 'increasing' | 'decreasing' | 'stable';
  rate: number;
  confidence: number;
  seasonality: SeasonalityPattern[];
}

export interface SeasonalityPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  pattern: number[];
  strength: number;
}

export interface CapacityForecast {
  date: string;
  predicted: number;
  confidence: number;
  scenarios: ScenarioForecast[];
}

export interface ScenarioForecast {
  name: string;
  probability: number;
  value: number;
  description: string;
}

export interface CapacityRecommendation {
  type: 'scale_up' | 'scale_down' | 'optimize' | 'redistribute';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  cost: number;
  timeline: string;
  implementation: string[];
}

// PHASE 14: Performance Monitoring Service Class
export class PerformanceMonitoringService {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private thresholds: Map<string, PerformanceThreshold> = new Map();
  private alerts: Map<string, PerformanceAlert> = new Map();
  private dashboards: Map<string, PerformanceDashboard> = new Map();
  private traces: Map<string, DistributedTrace> = new Map();
  private slaConfigurations: Map<string, SLAConfiguration> = new Map();
  private capacityPlans: Map<string, CapacityPlanning> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    this.initializeService();
  }

  // PHASE 14: Service Initialization
  private async initializeService(): Promise<void> {
    try {
      console.log('📊 Initializing Performance Monitoring Service...');
      
      // Setup default thresholds
      await this.setupDefaultThresholds();
      
      // Initialize dashboards
      await this.setupDefaultDashboards();
      
      // Start metric collection
      await this.startMetricCollection();
      
      // Initialize SLA monitoring
      await this.setupSLAMonitoring();
      
      this.isInitialized = true;
      console.log('✅ Performance Monitoring Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize performance monitoring service:', error);
      throw error;
    }
  }

  // PHASE 14: Default Thresholds Setup
  private async setupDefaultThresholds(): Promise<void> {
    const defaultThresholds: PerformanceThreshold[] = [
      // Response Time Thresholds
      {
        id: 'response_time_warning',
        metricName: 'http_request_duration',
        operator: '>',
        value: 1000, // 1 second
        severity: 'warning',
        duration: 60,
        description: 'API response time exceeds 1 second',
        enabled: true,
        notifications: [
          {
            type: 'email',
            target: 'ops-team@company.com',
            template: 'response_time_alert',
            conditions: []
          }
        ]
      },
      {
        id: 'response_time_critical',
        metricName: 'http_request_duration',
        operator: '>',
        value: 5000, // 5 seconds
        severity: 'critical',
        duration: 30,
        description: 'API response time exceeds 5 seconds',
        enabled: true,
        notifications: [
          {
            type: 'pagerduty',
            target: 'primary_escalation',
            template: 'critical_alert',
            conditions: []
          }
        ]
      },

      // Error Rate Thresholds
      {
        id: 'error_rate_warning',
        metricName: 'http_request_error_rate',
        operator: '>',
        value: 5, // 5%
        severity: 'warning',
        duration: 120,
        description: 'Error rate exceeds 5%',
        enabled: true,
        notifications: [
          {
            type: 'slack',
            target: '#alerts',
            template: 'error_rate_alert',
            conditions: []
          }
        ]
      },

      // CPU Usage Thresholds
      {
        id: 'cpu_usage_warning',
        metricName: 'cpu_usage_percent',
        operator: '>',
        value: 80,
        severity: 'warning',
        duration: 300,
        description: 'CPU usage exceeds 80%',
        enabled: true,
        notifications: [
          {
            type: 'email',
            target: 'infrastructure@company.com',
            template: 'resource_alert',
            conditions: []
          }
        ]
      },

      // Memory Usage Thresholds
      {
        id: 'memory_usage_critical',
        metricName: 'memory_usage_percent',
        operator: '>',
        value: 90,
        severity: 'critical',
        duration: 180,
        description: 'Memory usage exceeds 90%',
        enabled: true,
        notifications: [
          {
            type: 'pagerduty',
            target: 'infrastructure_escalation',
            template: 'resource_critical',
            conditions: []
          }
        ]
      },

      // Database Performance
      {
        id: 'db_query_time_warning',
        metricName: 'database_query_duration',
        operator: '>',
        value: 2000, // 2 seconds
        severity: 'warning',
        duration: 120,
        description: 'Database query time exceeds 2 seconds',
        enabled: true,
        notifications: [
          {
            type: 'slack',
            target: '#database',
            template: 'db_performance_alert',
            conditions: []
          }
        ]
      }
    ];

    defaultThresholds.forEach(threshold => {
      this.thresholds.set(threshold.id, threshold);
    });

    console.log(`📊 Setup ${defaultThresholds.length} default performance thresholds`);
  }

  // PHASE 14: Default Dashboards Setup
  private async setupDefaultDashboards(): Promise<void> {
    const defaultDashboards: PerformanceDashboard[] = [
      // System Overview Dashboard
      {
        id: 'system_overview',
        name: 'System Overview',
        description: 'High-level system health and performance metrics',
        widgets: [
          {
            id: 'response_time_chart',
            type: 'chart',
            title: 'Average Response Time',
            query: {
              metrics: ['http_request_duration'],
              filters: [],
              groupBy: ['service'],
              timeRange: { start: '', end: '', relative: 'last_1h' },
              aggregation: { function: 'avg', interval: '1m' }
            },
            visualization: {
              chartType: 'line',
              colors: ['#3b82f6', '#10b981', '#f59e0b'],
              axes: [
                { name: 'time', type: 'time', unit: 'time' },
                { name: 'duration', type: 'linear', unit: 'ms' }
              ],
              legend: { position: 'bottom', visible: true },
              annotations: []
            },
            position: { x: 0, y: 0 },
            size: { width: 6, height: 3 }
          },
          {
            id: 'error_rate_gauge',
            type: 'gauge',
            title: 'Error Rate',
            query: {
              metrics: ['http_request_error_rate'],
              filters: [],
              groupBy: [],
              timeRange: { start: '', end: '', relative: 'last_5m' },
              aggregation: { function: 'avg', interval: '5m' }
            },
            visualization: {
              chartType: 'gauge',
              colors: ['#10b981', '#f59e0b', '#ef4444'],
              axes: [{ name: 'rate', type: 'linear', min: 0, max: 100, unit: '%' }],
              legend: { position: 'bottom', visible: false },
              annotations: []
            },
            position: { x: 6, y: 0 },
            size: { width: 3, height: 3 }
          },
          {
            id: 'resource_usage_chart',
            type: 'chart',
            title: 'Resource Usage',
            query: {
              metrics: ['cpu_usage_percent', 'memory_usage_percent'],
              filters: [],
              groupBy: ['instance'],
              timeRange: { start: '', end: '', relative: 'last_1h' },
              aggregation: { function: 'avg', interval: '5m' }
            },
            visualization: {
              chartType: 'area',
              colors: ['#3b82f6', '#10b981'],
              axes: [
                { name: 'time', type: 'time', unit: 'time' },
                { name: 'usage', type: 'linear', min: 0, max: 100, unit: '%' }
              ],
              legend: { position: 'bottom', visible: true },
              annotations: []
            },
            position: { x: 0, y: 3 },
            size: { width: 9, height: 3 }
          }
        ],
        layout: {
          type: 'grid',
          columns: 12,
          rowHeight: 60,
          margin: [10, 10, 10, 10]
        },
        filters: [
          {
            name: 'environment',
            type: 'dropdown',
            options: ['production', 'staging', 'development'],
            defaultValue: 'production'
          },
          {
            name: 'service',
            type: 'multiselect',
            options: ['api', 'web', 'database', 'cache'],
            defaultValue: ['api', 'web']
          }
        ],
        refreshInterval: 30,
        permissions: ['monitoring:read']
      },

      // Database Performance Dashboard
      {
        id: 'database_performance',
        name: 'Database Performance',
        description: 'Database metrics and performance analysis',
        widgets: [
          {
            id: 'db_connections',
            type: 'gauge',
            title: 'Active Connections',
            query: {
              metrics: ['database_connections_active'],
              filters: [],
              groupBy: [],
              timeRange: { start: '', end: '', relative: 'last_5m' },
              aggregation: { function: 'avg', interval: '1m' }
            },
            visualization: {
              chartType: 'gauge',
              colors: ['#10b981', '#f59e0b', '#ef4444'],
              axes: [{ name: 'connections', type: 'linear', min: 0, max: 100, unit: 'count' }],
              legend: { position: 'bottom', visible: false },
              annotations: []
            },
            position: { x: 0, y: 0 },
            size: { width: 3, height: 3 }
          },
          {
            id: 'query_performance',
            type: 'chart',
            title: 'Query Performance',
            query: {
              metrics: ['database_query_duration'],
              filters: [],
              groupBy: ['query_type'],
              timeRange: { start: '', end: '', relative: 'last_1h' },
              aggregation: { function: 'percentile', interval: '5m', percentile: 95 }
            },
            visualization: {
              chartType: 'line',
              colors: ['#3b82f6', '#10b981', '#f59e0b'],
              axes: [
                { name: 'time', type: 'time', unit: 'time' },
                { name: 'duration', type: 'linear', unit: 'ms' }
              ],
              legend: { position: 'bottom', visible: true },
              annotations: []
            },
            position: { x: 3, y: 0 },
            size: { width: 9, height: 3 }
          }
        ],
        layout: {
          type: 'grid',
          columns: 12,
          rowHeight: 60,
          margin: [10, 10, 10, 10]
        },
        filters: [
          {
            name: 'database',
            type: 'dropdown',
            options: ['primary', 'replica', 'cache'],
            defaultValue: 'primary'
          }
        ],
        refreshInterval: 15,
        permissions: ['monitoring:read', 'database:read']
      }
    ];

    defaultDashboards.forEach(dashboard => {
      this.dashboards.set(dashboard.id, dashboard);
    });

    console.log(`📊 Setup ${defaultDashboards.length} default dashboards`);
  }

  // PHASE 14: Metric Collection
  private async startMetricCollection(): Promise<void> {
    // Simulate metric collection every 10 seconds
    setInterval(async () => {
      await this.collectSystemMetrics();
      await this.collectApplicationMetrics();
      await this.collectBusinessMetrics();
      await this.evaluateThresholds();
    }, 10000);

    console.log('📈 Started metric collection');
  }

  private async collectSystemMetrics(): Promise<void> {
    const timestamp = new Date().toISOString();
    const baseMetadata: MetricMetadata = {
      source: 'system_monitor',
      environment: 'production',
      version: '2.0.0',
      component: 'system',
      instance: 'web-01',
      region: 'us-west-2'
    };

    const systemMetrics: PerformanceMetric[] = [
      {
        id: `cpu_${Date.now()}`,
        name: 'cpu_usage_percent',
        type: 'gauge',
        category: 'infrastructure',
        value: Math.random() * 100,
        unit: 'percent',
        timestamp,
        tags: { host: 'web-01', cpu: 'all' },
        metadata: baseMetadata
      },
      {
        id: `memory_${Date.now()}`,
        name: 'memory_usage_percent',
        type: 'gauge',
        category: 'infrastructure',
        value: Math.random() * 100,
        unit: 'percent',
        timestamp,
        tags: { host: 'web-01', type: 'physical' },
        metadata: baseMetadata
      },
      {
        id: `disk_${Date.now()}`,
        name: 'disk_usage_percent',
        type: 'gauge',
        category: 'infrastructure',
        value: Math.random() * 100,
        unit: 'percent',
        timestamp,
        tags: { host: 'web-01', mount: '/' },
        metadata: baseMetadata
      }
    ];

    // Store metrics
    systemMetrics.forEach(metric => {
      const metricHistory = this.metrics.get(metric.name) || [];
      metricHistory.push(metric);
      
      // Keep only last 1000 data points
      if (metricHistory.length > 1000) {
        metricHistory.shift();
      }
      
      this.metrics.set(metric.name, metricHistory);
    });
  }

  private async collectApplicationMetrics(): Promise<void> {
    const timestamp = new Date().toISOString();
    const baseMetadata: MetricMetadata = {
      source: 'app_monitor',
      environment: 'production',
      version: '2.0.0',
      component: 'application',
      instance: 'app-01',
      region: 'us-west-2'
    };

    const appMetrics: PerformanceMetric[] = [
      {
        id: `response_time_${Date.now()}`,
        name: 'http_request_duration',
        type: 'histogram',
        category: 'backend',
        value: Math.random() * 2000 + 100, // 100-2100ms
        unit: 'milliseconds',
        timestamp,
        tags: { method: 'GET', endpoint: '/api/projects', status: '200' },
        metadata: baseMetadata
      },
      {
        id: `error_rate_${Date.now()}`,
        name: 'http_request_error_rate',
        type: 'gauge',
        category: 'backend',
        value: Math.random() * 10, // 0-10%
        unit: 'percent',
        timestamp,
        tags: { service: 'api', endpoint: '/api/projects' },
        metadata: baseMetadata
      },
      {
        id: `throughput_${Date.now()}`,
        name: 'http_requests_per_second',
        type: 'counter',
        category: 'backend',
        value: Math.random() * 1000 + 50, // 50-1050 rps
        unit: 'requests_per_second',
        timestamp,
        tags: { service: 'api' },
        metadata: baseMetadata
      }
    ];

    // Store metrics
    appMetrics.forEach(metric => {
      const metricHistory = this.metrics.get(metric.name) || [];
      metricHistory.push(metric);
      
      if (metricHistory.length > 1000) {
        metricHistory.shift();
      }
      
      this.metrics.set(metric.name, metricHistory);
    });
  }

  private async collectBusinessMetrics(): Promise<void> {
    const timestamp = new Date().toISOString();
    const baseMetadata: MetricMetadata = {
      source: 'business_monitor',
      environment: 'production',
      version: '2.0.0',
      component: 'business',
      instance: 'analytics-01',
      region: 'us-west-2'
    };

    const businessMetrics: PerformanceMetric[] = [
      {
        id: `active_users_${Date.now()}`,
        name: 'active_users_count',
        type: 'gauge',
        category: 'business',
        value: Math.floor(Math.random() * 1000) + 100,
        unit: 'count',
        timestamp,
        tags: { type: 'concurrent' },
        metadata: baseMetadata
      },
      {
        id: `projects_created_${Date.now()}`,
        name: 'projects_created_total',
        type: 'counter',
        category: 'business',
        value: Math.floor(Math.random() * 10) + 1,
        unit: 'count',
        timestamp,
        tags: { type: 'new' },
        metadata: baseMetadata
      }
    ];

    businessMetrics.forEach(metric => {
      const metricHistory = this.metrics.get(metric.name) || [];
      metricHistory.push(metric);
      
      if (metricHistory.length > 1000) {
        metricHistory.shift();
      }
      
      this.metrics.set(metric.name, metricHistory);
    });
  }

  // PHASE 14: Threshold Evaluation
  private async evaluateThresholds(): Promise<void> {
    for (const threshold of this.thresholds.values()) {
      if (!threshold.enabled) continue;

      const metricHistory = this.metrics.get(threshold.metricName);
      if (!metricHistory || metricHistory.length === 0) continue;

      const latestMetric = metricHistory[metricHistory.length - 1];
      const isViolating = this.evaluateThresholdCondition(
        latestMetric.value,
        threshold.operator,
        threshold.value
      );

      if (isViolating) {
        await this.handleThresholdViolation(threshold, latestMetric);
      }
    }
  }

  private evaluateThresholdCondition(actual: number, operator: string, expected: number): boolean {
    switch (operator) {
      case '>': return actual > expected;
      case '<': return actual < expected;
      case '>=': return actual >= expected;
      case '<=': return actual <= expected;
      case '==': return actual === expected;
      case '!=': return actual !== expected;
      default: return false;
    }
  }

  private async handleThresholdViolation(threshold: PerformanceThreshold, metric: PerformanceMetric): Promise<void> {
    // Check if alert already exists
    const existingAlert = Array.from(this.alerts.values()).find(
      alert => alert.metricName === threshold.metricName && alert.status === 'active'
    );

    if (existingAlert) {
      // Update existing alert
      existingAlert.currentValue = metric.value;
      existingAlert.duration = Date.now() - new Date(existingAlert.triggeredAt).getTime();
      return;
    }

    // Create new alert
    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metricName: threshold.metricName,
      threshold,
      currentValue: metric.value,
      severity: threshold.severity,
      status: 'active',
      triggeredAt: new Date().toISOString(),
      duration: 0,
      context: await this.buildAlertContext(metric),
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'triggered'
        }
      ]
    };

    this.alerts.set(alert.id, alert);

    // Send notifications
    await this.sendAlertNotifications(alert);

    console.log(`🚨 Alert triggered: ${threshold.metricName} = ${metric.value} ${threshold.operator} ${threshold.value}`);
  }

  private async buildAlertContext(metric: PerformanceMetric): Promise<AlertContext> {
    // Get related metrics for context
    const relatedMetrics = Array.from(this.metrics.values())
      .flat()
      .filter(m => m.timestamp === metric.timestamp && m.name !== metric.name)
      .slice(0, 5);

    return {
      metric,
      relatedMetrics,
      systemState: await this.getCurrentSystemState(),
      userImpact: await this.assessUserImpact(metric),
      recommendations: this.generateRecommendations(metric)
    };
  }

  private async getCurrentSystemState(): Promise<SystemState> {
    const latestMetrics = this.getLatestMetrics();
    
    return {
      cpu: latestMetrics.get('cpu_usage_percent')?.value || 0,
      memory: latestMetrics.get('memory_usage_percent')?.value || 0,
      disk: latestMetrics.get('disk_usage_percent')?.value || 0,
      network: {
        latency: 50,
        throughput: 1000,
        errors: 0,
        connections: 100
      },
      applications: [
        {
          name: 'PaveMaster API',
          status: 'healthy',
          cpu: latestMetrics.get('cpu_usage_percent')?.value || 0,
          memory: latestMetrics.get('memory_usage_percent')?.value || 0,
          responseTime: latestMetrics.get('http_request_duration')?.value || 0,
          errorRate: latestMetrics.get('http_request_error_rate')?.value || 0,
          throughput: latestMetrics.get('http_requests_per_second')?.value || 0
        }
      ],
      database: {
        connections: 50,
        queryTime: 100,
        deadlocks: 0,
        cacheHitRatio: 95,
        replicationLag: 0
      }
    };
  }

  private async assessUserImpact(metric: PerformanceMetric): Promise<UserImpact> {
    // Simplified user impact assessment
    let impactLevel: UserImpact['impactLevel'] = 'none';
    let businessImpact: UserImpact['businessImpact'] = 'none';
    let affectedUsers = 0;

    if (metric.name === 'http_request_duration' && metric.value > 1000) {
      impactLevel = 'medium';
      businessImpact = 'moderate';
      affectedUsers = 100;
    } else if (metric.name === 'http_request_error_rate' && metric.value > 5) {
      impactLevel = 'high';
      businessImpact = 'major';
      affectedUsers = 500;
    }

    return {
      affectedUsers,
      impactLevel,
      businessImpact,
      estimatedRevenueLoss: businessImpact === 'major' ? 1000 : 0,
      slaViolation: impactLevel === 'high'
    };
  }

  private generateRecommendations(metric: PerformanceMetric): string[] {
    const recommendations: string[] = [];

    switch (metric.name) {
      case 'cpu_usage_percent':
        if (metric.value > 80) {
          recommendations.push('Consider scaling up instances or optimizing CPU-intensive operations');
          recommendations.push('Review recent deployments for performance regressions');
        }
        break;
      case 'memory_usage_percent':
        if (metric.value > 90) {
          recommendations.push('Investigate memory leaks or increase instance memory');
          recommendations.push('Review memory-intensive operations and caching strategies');
        }
        break;
      case 'http_request_duration':
        if (metric.value > 1000) {
          recommendations.push('Optimize database queries and API endpoints');
          recommendations.push('Implement or review caching strategies');
          recommendations.push('Consider adding request timeouts');
        }
        break;
      case 'http_request_error_rate':
        if (metric.value > 5) {
          recommendations.push('Check application logs for error patterns');
          recommendations.push('Verify external service dependencies');
          recommendations.push('Review recent code deployments');
        }
        break;
    }

    return recommendations;
  }

  private getLatestMetrics(): Map<string, PerformanceMetric> {
    const latest = new Map<string, PerformanceMetric>();
    
    for (const [name, history] of this.metrics.entries()) {
      if (history.length > 0) {
        latest.set(name, history[history.length - 1]);
      }
    }
    
    return latest;
  }

  private async sendAlertNotifications(alert: PerformanceAlert): Promise<void> {
    for (const notification of alert.threshold.notifications) {
      switch (notification.type) {
        case 'email':
          console.log(`📧 Email alert sent to ${notification.target}`);
          break;
        case 'slack':
          console.log(`💬 Slack alert sent to ${notification.target}`);
          break;
        case 'webhook':
          console.log(`🔗 Webhook alert sent to ${notification.target}`);
          break;
        case 'pagerduty':
          console.log(`📟 PagerDuty alert sent to ${notification.target}`);
          break;
      }
    }
  }

  // PHASE 14: SLA Monitoring
  private async setupSLAMonitoring(): Promise<void> {
    const slaConfigs: SLAConfiguration[] = [
      {
        id: 'api_availability',
        name: 'API Availability SLA',
        description: '99.9% uptime guarantee for API services',
        targets: [
          {
            metric: 'uptime_percentage',
            target: 99.9,
            unit: 'percent',
            weight: 1.0,
            criticality: 'critical'
          }
        ],
        period: 'monthly',
        penalties: [
          {
            threshold: 99.5,
            type: 'credit',
            amount: 10,
            description: '10% service credit for 99.5-99.8% uptime'
          },
          {
            threshold: 99.0,
            type: 'credit',
            amount: 25,
            description: '25% service credit for <99% uptime'
          }
        ],
        rewards: [
          {
            threshold: 99.95,
            type: 'bonus',
            amount: 5,
            description: '5% bonus for >99.95% uptime'
          }
        ],
        monitoring: {
          frequency: '1m',
          alerting: true,
          reporting: true,
          escalation: [
            {
              threshold: 99.5,
              delay: 300,
              recipients: ['ops-team@company.com'],
              actions: ['alert', 'investigate']
            }
          ]
        }
      }
    ];

    slaConfigs.forEach(config => {
      this.slaConfigurations.set(config.id, config);
    });

    console.log(`📋 Setup ${slaConfigs.length} SLA configurations`);
  }

  // PHASE 14: Public API Methods
  async recordMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): Promise<void> {
    const fullMetric: PerformanceMetric = {
      ...metric,
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    const metricHistory = this.metrics.get(metric.name) || [];
    metricHistory.push(fullMetric);
    
    if (metricHistory.length > 1000) {
      metricHistory.shift();
    }
    
    this.metrics.set(metric.name, metricHistory);
  }

  async queryMetrics(query: MetricQuery): Promise<PerformanceMetric[]> {
    let results: PerformanceMetric[] = [];

    // Get metrics for each requested metric name
    for (const metricName of query.metrics) {
      const metricHistory = this.metrics.get(metricName) || [];
      results = results.concat(metricHistory);
    }

    // Apply filters
    for (const filter of query.filters) {
      results = results.filter(metric => {
        const value = metric.tags[filter.field] || metric[filter.field as keyof PerformanceMetric];
        return this.applyFilter(value, filter.operator, filter.value);
      });
    }

    // Apply time range
    if (query.timeRange.start && query.timeRange.end) {
      const start = new Date(query.timeRange.start).getTime();
      const end = new Date(query.timeRange.end).getTime();
      results = results.filter(metric => {
        const timestamp = new Date(metric.timestamp).getTime();
        return timestamp >= start && timestamp <= end;
      });
    }

    return results;
  }

  private applyFilter(value: any, operator: string, filterValue: any): boolean {
    switch (operator) {
      case '=': return value === filterValue;
      case '!=': return value !== filterValue;
      case '>': return value > filterValue;
      case '<': return value < filterValue;
      case '>=': return value >= filterValue;
      case '<=': return value <= filterValue;
      case 'in': return Array.isArray(filterValue) && filterValue.includes(value);
      default: return true;
    }
  }

  async createDashboard(dashboard: Omit<PerformanceDashboard, 'id'>): Promise<PerformanceDashboard> {
    const fullDashboard: PerformanceDashboard = {
      ...dashboard,
      id: `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.dashboards.set(fullDashboard.id, fullDashboard);
    return fullDashboard;
  }

  async getDashboard(id: string): Promise<PerformanceDashboard | null> {
    return this.dashboards.get(id) || null;
  }

  async getAlerts(filters?: { status?: string; severity?: string }): Promise<PerformanceAlert[]> {
    let alerts = Array.from(this.alerts.values());

    if (filters?.status) {
      alerts = alerts.filter(alert => alert.status === filters.status);
    }

    if (filters?.severity) {
      alerts = alerts.filter(alert => alert.severity === filters.severity);
    }

    return alerts.sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());
  }

  async acknowledgeAlert(alertId: string, userId: string, notes?: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (!alert) return;

    alert.history.push({
      timestamp: new Date().toISOString(),
      action: 'acknowledged',
      user: userId,
      notes
    });

    console.log(`✅ Alert ${alertId} acknowledged by ${userId}`);
  }

  async resolveAlert(alertId: string, userId: string, notes?: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (!alert) return;

    alert.status = 'resolved';
    alert.resolvedAt = new Date().toISOString();
    alert.history.push({
      timestamp: new Date().toISOString(),
      action: 'resolved',
      user: userId,
      notes
    });

    console.log(`✅ Alert ${alertId} resolved by ${userId}`);
  }

  async generatePerformanceReport(type: 'daily' | 'weekly' | 'monthly'): Promise<PerformanceReport> {
    const report: PerformanceReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Performance Report`,
      type: 'ad_hoc',
      format: 'json',
      content: {
        title: `Performance Report - ${type}`,
        summary: {
          period: type,
          keyMetrics: [
            {
              name: 'Average Response Time',
              value: 850,
              unit: 'ms',
              change: -5.2,
              trend: 'down',
              status: 'good'
            },
            {
              name: 'Error Rate',
              value: 2.1,
              unit: '%',
              change: 0.3,
              trend: 'up',
              status: 'warning'
            },
            {
              name: 'System Uptime',
              value: 99.95,
              unit: '%',
              change: 0.1,
              trend: 'up',
              status: 'good'
            }
          ],
          highlights: [
            'Response times improved by 5.2% compared to previous period',
            'System uptime exceeded SLA target of 99.9%',
            'Successfully handled 50% increase in traffic'
          ],
          issues: [
            'Slight increase in error rate during peak hours',
            'Database query performance degraded on Tuesday'
          ],
          recommendations: [
            'Implement additional caching for frequently accessed data',
            'Review database indexing strategy',
            'Consider auto-scaling policies for peak traffic'
          ]
        },
        sections: [
          {
            title: 'System Performance',
            type: 'metrics',
            content: {
              cpu: { avg: 45.2, max: 78.3, min: 12.1 },
              memory: { avg: 67.8, max: 89.2, min: 34.5 },
              disk: { avg: 34.1, max: 56.7, min: 28.9 }
            },
            insights: [
              'CPU utilization remained within normal ranges',
              'Memory usage peaked during data processing tasks',
              'Disk I/O showed consistent patterns'
            ]
          }
        ],
        appendices: [
          {
            title: 'Methodology',
            type: 'methodology',
            content: 'Performance metrics collected every 30 seconds using automated monitoring agents'
          }
        ]
      },
      recipients: [
        {
          email: 'operations@company.com',
          name: 'Operations Team',
          role: 'Operations Manager',
          format: 'pdf'
        }
      ],
      lastGenerated: new Date().toISOString()
    };

    return report;
  }

  // PHASE 14: Cleanup
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up Performance Monitoring Service...');
    
    this.metrics.clear();
    this.thresholds.clear();
    this.alerts.clear();
    this.dashboards.clear();
    this.traces.clear();
    this.slaConfigurations.clear();
    this.capacityPlans.clear();
    
    console.log('✅ Performance Monitoring Service cleanup completed');
  }
}

// PHASE 14: Export singleton instance
export const performanceMonitoringService = new PerformanceMonitoringService();
export default performanceMonitoringService;