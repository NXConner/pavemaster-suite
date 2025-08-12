// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Click,
  Clock,
  Download,
  Upload,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Database,
  Cpu,
  Memory,
  HardDrive,
  Wifi,
} from 'lucide-react';

// Analytics data interfaces
interface UserAnalytics {
  userId: string;
  sessionId: string;
  timestamp: Date;
  event: string;
  properties: Record<string, any>;
  page: string;
  userAgent: string;
  ipAddress?: string;
  location?: {
    country: string;
    region: string;
    city: string;
  };
}

interface PerformanceMetrics {
  timestamp: Date;
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
}

interface ABTestExperiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: {
    id: string;
    name: string;
    description: string;
    traffic: number;
    conversions: number;
    participants: number;
  }[];
  startDate: Date;
  endDate?: Date;
  metrics: {
    primaryMetric: string;
    secondaryMetrics: string[];
  };
  results?: {
    winner?: string;
    confidence: number;
    lift: number;
  };
}

interface KPIMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  period: 'day' | 'week' | 'month' | 'quarter';
}

// User Analytics Tracker
class AnalyticsTracker {
  private events: UserAnalytics[] = [];
  private sessionId: string;
  private userId: string;

  constructor(userId: string = 'anonymous') {
    this.userId = userId;
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.initializeTracking();
  }

  private initializeTracking() {
    // Track page views
    this.track('page_view', {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
    });

    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A') {
        this.track('click', {
          element: target.tagName,
          text: target.textContent?.trim(),
          id: target.id,
          className: target.className,
          x: event.clientX,
          y: event.clientY,
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.track('form_submit', {
        formId: form.id,
        formAction: form.action,
        formMethod: form.method,
      });
    });

    // Track errors
    window.addEventListener('error', (event) => {
      this.track('error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // Track performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        this.track('performance', {
          loadTime: perfData.loadEventEnd - perfData.fetchStart,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
          firstPaint: this.getFirstPaint(),
          firstContentfulPaint: this.getFirstContentfulPaint(),
        });
      }, 0);
    });
  }

  private getFirstPaint(): number {
    const entries = performance.getEntriesByType('paint');
    const firstPaint = entries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  private getFirstContentfulPaint(): number {
    const entries = performance.getEntriesByType('paint');
    const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : 0;
  }

  public track(event: string, properties: Record<string, any> = {}) {
    const analyticsEvent: UserAnalytics = {
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date(),
      event,
      properties,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    };

    this.events.push(analyticsEvent);

    // Store in localStorage for persistence
    const stored = localStorage.getItem('analytics_events');
    const existingEvents = stored ? JSON.parse(stored) : [];
    existingEvents.push(analyticsEvent);

    // Keep only last 1000 events
    if (existingEvents.length > 1000) {
      existingEvents.splice(0, existingEvents.length - 1000);
    }

    localStorage.setItem('analytics_events', JSON.stringify(existingEvents));

    // Send to server (simulated)
    this.sendToServer(analyticsEvent);
  }

  private async sendToServer(event: UserAnalytics) {
    // Simulate API call
    try {
      // In real implementation, this would be an actual API call
      console.log('Sending analytics event:', event);
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  public getEvents(): UserAnalytics[] {
    return this.events;
  }

  public getSessionEvents(): UserAnalytics[] {
    return this.events.filter(event => event.sessionId === this.sessionId);
  }
}

// Performance Monitor
const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const collectPerformanceMetrics = useCallback(() => {
    const now = new Date();

    // Web Vitals simulation (in real app, use web-vitals library)
    const metric: PerformanceMetrics = {
      timestamp: now,
      pageLoadTime: performance.now(),
      firstContentfulPaint: Math.random() * 2000 + 500,
      largestContentfulPaint: Math.random() * 3000 + 1000,
      cumulativeLayoutShift: Math.random() * 0.1,
      firstInputDelay: Math.random() * 100 + 10,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || Math.random() * 50000000,
      cpuUsage: Math.random() * 100,
      networkLatency: Math.random() * 200 + 50,
    };

    setMetrics(prev => [...prev.slice(-49), metric]);
  }, []);

  const startMonitoring = () => {
    setIsMonitoring(true);
    collectPerformanceMetrics();
    intervalRef.current = setInterval(collectPerformanceMetrics, 5000);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getAverageMetric = (key: keyof PerformanceMetrics) => {
    if (metrics.length === 0) { return 0; }
    const sum = metrics.reduce((acc, metric) => acc + (metric[key] as number), 0);
    return sum / metrics.length;
  };

  const getMetricStatus = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) { return 'good'; }
    if (value <= thresholds.poor) { return 'needs-improvement'; }
    return 'poor';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {!isMonitoring ? (
            <Button onClick={startMonitoring} className="flex-1">
              <Zap className="h-4 w-4 mr-2" />
              Start Monitoring
            </Button>
          ) : (
            <Button onClick={stopMonitoring} variant="destructive" className="flex-1">
              <XCircle className="h-4 w-4 mr-2" />
              Stop Monitoring
            </Button>
          )}
        </div>

        {metrics.length > 0 && (
          <div className="space-y-4">
            {/* Web Vitals */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">LCP</Label>
                  <Badge variant={getMetricStatus(getAverageMetric('largestContentfulPaint'), { good: 2500, poor: 4000 }) === 'good' ? 'default' : 'destructive'}>
                    {(getAverageMetric('largestContentfulPaint') / 1000).toFixed(2)}s
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">FID</Label>
                  <Badge variant={getMetricStatus(getAverageMetric('firstInputDelay'), { good: 100, poor: 300 }) === 'good' ? 'default' : 'destructive'}>
                    {getAverageMetric('firstInputDelay').toFixed(0)}ms
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">CLS</Label>
                  <Badge variant={getMetricStatus(getAverageMetric('cumulativeLayoutShift'), { good: 0.1, poor: 0.25 }) === 'good' ? 'default' : 'destructive'}>
                    {getAverageMetric('cumulativeLayoutShift').toFixed(3)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Memory</Label>
                  <Badge variant="secondary">
                    {(getAverageMetric('memoryUsage') / 1024 / 1024).toFixed(1)}MB
                  </Badge>
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.slice(-20)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(time) => new Date(time).toLocaleString()}
                    formatter={(value: number, name: string) => [
                      name === 'memoryUsage' ? `${(value / 1024 / 1024).toFixed(1)}MB` : `${value.toFixed(0)}ms`,
                      name,
                    ]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="pageLoadTime" stroke="#8884d8" name="Load Time" />
                  <Line type="monotone" dataKey="networkLatency" stroke="#82ca9d" name="Network" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {isMonitoring && (
          <Badge variant="secondary" className="w-full justify-center">
            <Activity className="h-3 w-3 mr-1 animate-pulse" />
            Monitoring Active
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

// A/B Testing Platform
const ABTestingPlatform: React.FC = () => {
  const [experiments, setExperiments] = useState<ABTestExperiment[]>([
    {
      id: 'exp-001',
      name: 'Button Color Test',
      description: 'Testing different button colors for conversion',
      status: 'running',
      variants: [
        { id: 'control', name: 'Blue Button', description: 'Original blue button', traffic: 50, conversions: 45, participants: 1000 },
        { id: 'variant-a', name: 'Green Button', description: 'Green call-to-action button', traffic: 50, conversions: 52, participants: 980 },
      ],
      startDate: new Date('2024-01-01'),
      metrics: {
        primaryMetric: 'conversion_rate',
        secondaryMetrics: ['click_through_rate', 'bounce_rate'],
      },
    },
    {
      id: 'exp-002',
      name: 'Form Layout Test',
      description: 'Single column vs. two column form layout',
      status: 'completed',
      variants: [
        { id: 'control', name: 'Single Column', description: 'Traditional single column form', traffic: 50, conversions: 38, participants: 1200 },
        { id: 'variant-a', name: 'Two Columns', description: 'Side-by-side form fields', traffic: 50, conversions: 42, participants: 1180 },
      ],
      startDate: new Date('2023-12-15'),
      endDate: new Date('2024-01-15'),
      metrics: {
        primaryMetric: 'form_completion_rate',
        secondaryMetrics: ['time_to_complete', 'error_rate'],
      },
      results: {
        winner: 'variant-a',
        confidence: 95,
        lift: 12.5,
      },
    },
  ]);

  const [newExperiment, setNewExperiment] = useState({
    name: '',
    description: '',
    variants: [
      { name: 'Control', description: '', traffic: 50 },
      { name: 'Variant A', description: '', traffic: 50 },
    ],
  });

  const createExperiment = () => {
    if (!newExperiment.name.trim()) { return; }

    const experiment: ABTestExperiment = {
      id: `exp-${Date.now()}`,
      name: newExperiment.name,
      description: newExperiment.description,
      status: 'draft',
      variants: newExperiment.variants.map((variant, index) => ({
        id: index === 0 ? 'control' : `variant-${String.fromCharCode(97 + index - 1)}`,
        name: variant.name,
        description: variant.description,
        traffic: variant.traffic,
        conversions: 0,
        participants: 0,
      })),
      startDate: new Date(),
      metrics: {
        primaryMetric: 'conversion_rate',
        secondaryMetrics: ['engagement_rate'],
      },
    };

    setExperiments(prev => [...prev, experiment]);
    setNewExperiment({
      name: '',
      description: '',
      variants: [
        { name: 'Control', description: '', traffic: 50 },
        { name: 'Variant A', description: '', traffic: 50 },
      ],
    });
  };

  const toggleExperimentStatus = (experimentId: string) => {
    setExperiments(prev => prev.map(exp =>
      exp.id === experimentId
        ? { ...exp, status: exp.status === 'running' ? 'paused' : 'running' as any }
        : exp,
    ));
  };

  const calculateConversionRate = (variant: ABTestExperiment['variants'][0]) => {
    return variant.participants > 0 ? (variant.conversions / variant.participants * 100) : 0;
  };

  const getStatusColor = (status: ABTestExperiment['status']) => {
    switch (status) {
      case 'running': return 'default';
      case 'paused': return 'secondary';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          A/B Testing Platform
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="experiments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="experiments">Experiments</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>

          <TabsContent value="experiments" className="space-y-4">
            {experiments.map((experiment) => (
              <Card key={experiment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{experiment.name}</h3>
                      <p className="text-sm text-muted-foreground">{experiment.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(experiment.status)}>
                        {experiment.status}
                      </Badge>
                      {experiment.status !== 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { toggleExperimentStatus(experiment.id); }}
                        >
                          {experiment.status === 'running' ? 'Pause' : 'Start'}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {experiment.variants.map((variant) => (
                      <div key={variant.id} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{variant.name}</span>
                          <div className="text-sm text-muted-foreground">
                            {variant.traffic}% traffic
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Participants</div>
                            <div className="font-medium">{variant.participants.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Conversions</div>
                            <div className="font-medium">{variant.conversions}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Rate</div>
                            <div className="font-medium">{calculateConversionRate(variant).toFixed(2)}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {experiment.results && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">
                          Winner: {experiment.variants.find(v => v.id === experiment.results?.winner)?.name}
                        </span>
                      </div>
                      <div className="text-sm text-green-700">
                        {experiment.results.confidence}% confidence, {experiment.results.lift}% lift
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="exp-name">Experiment Name</Label>
                <Input
                  id="exp-name"
                  value={newExperiment.name}
                  onChange={(e) => { setNewExperiment(prev => ({ ...prev, name: e.target.value })); }}
                  placeholder="Button Color Test"
                />
              </div>

              <div>
                <Label htmlFor="exp-description">Description</Label>
                <Input
                  id="exp-description"
                  value={newExperiment.description}
                  onChange={(e) => { setNewExperiment(prev => ({ ...prev, description: e.target.value })); }}
                  placeholder="Testing different button colors for conversion"
                />
              </div>

              <div className="space-y-3">
                <Label>Variants</Label>
                {newExperiment.variants.map((variant, index) => (
                  <div key={index} className="border rounded p-3 space-y-2">
                    <Input
                      value={variant.name}
                      onChange={(e) => {
                        const newVariants = [...newExperiment.variants];
                        newVariants[index] = { ...newVariants[index], name: e.target.value };
                        setNewExperiment(prev => ({ ...prev, variants: newVariants }));
                      }}
                      placeholder={`Variant ${index === 0 ? 'Control' : String.fromCharCode(65 + index - 1)} name`}
                    />
                    <Input
                      value={variant.description}
                      onChange={(e) => {
                        const newVariants = [...newExperiment.variants];
                        newVariants[index] = { ...newVariants[index], description: e.target.value };
                        setNewExperiment(prev => ({ ...prev, variants: newVariants }));
                      }}
                      placeholder="Variant description"
                    />
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Traffic:</Label>
                      <Input
                        type="number"
                        value={variant.traffic}
                        onChange={(e) => {
                          const newVariants = [...newExperiment.variants];
                          newVariants[index] = { ...newVariants[index], traffic: parseInt(e.target.value) || 0 };
                          setNewExperiment(prev => ({ ...prev, variants: newVariants }));
                        }}
                        className="w-20"
                        min="0"
                        max="100"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={createExperiment} className="w-full">
                Create Experiment
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// KPI Dashboard
const KPIDashboard: React.FC = () => {
  const [kpis] = useState<KPIMetric[]>([
    { id: '1', name: 'Daily Active Users', value: 2845, target: 3000, unit: '', trend: 'up', change: 12.5, period: 'day' },
    { id: '2', name: 'Conversion Rate', value: 3.2, target: 4.0, unit: '%', trend: 'up', change: 8.3, period: 'week' },
    { id: '3', name: 'Revenue', value: 45680, target: 50000, unit: '$', trend: 'up', change: 15.7, period: 'month' },
    { id: '4', name: 'Page Load Time', value: 2.1, target: 2.0, unit: 's', trend: 'down', change: -5.2, period: 'day' },
    { id: '5', name: 'Customer Satisfaction', value: 4.2, target: 4.5, unit: '/5', trend: 'stable', change: 0.1, period: 'week' },
    { id: '6', name: 'Error Rate', value: 0.8, target: 0.5, unit: '%', trend: 'down', change: -15.3, period: 'day' },
  ]);

  const getProgressPercentage = (kpi: KPIMetric) => {
    return Math.min((kpi.value / kpi.target) * 100, 100);
  };

  const getTrendIcon = (trend: KPIMetric['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4" />;
    }
  };

  const getPerformanceColor = (kpi: KPIMetric) => {
    const percentage = getProgressPercentage(kpi);
    if (percentage >= 100) { return 'text-green-600'; }
    if (percentage >= 80) { return 'text-yellow-600'; }
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          KPI Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">{kpi.name}</h3>
                  {getTrendIcon(kpi.trend)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{kpi.value.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">{kpi.unit}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Target: {kpi.target.toLocaleString()}{kpi.unit}
                    </span>
                    <span className={`${kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change >= 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                    </span>
                  </div>

                  <Progress
                    value={getProgressPercentage(kpi)}
                    className="h-2"
                  />

                  <div className="text-xs text-muted-foreground">
                    This {kpi.period}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Analytics Foundation Component
const AnalyticsFoundation: React.FC = () => {
  const [tracker] = useState(() => new AnalyticsTracker());
  const [events, setEvents] = useState<UserAnalytics[]>([]);

  useEffect(() => {
    // Load stored events
    const stored = localStorage.getItem('analytics_events');
    if (stored) {
      try {
        const parsedEvents = JSON.parse(stored).map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp),
        }));
        setEvents(parsedEvents);
      } catch (error) {
        console.error('Failed to load analytics events:', error);
      }
    }

    // Update events periodically
    const interval = setInterval(() => {
      setEvents(tracker.getEvents());
    }, 5000);

    return () => { clearInterval(interval); };
  }, [tracker]);

  return (
    <div className="space-y-6 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Analytics Foundation</h1>
        <p className="text-muted-foreground">
          User analytics, performance monitoring, and A/B testing
        </p>
      </div>

      <Tabs defaultValue="kpis" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="experiments">A/B Tests</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="kpis">
          <KPIDashboard />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceMonitor />
        </TabsContent>

        <TabsContent value="experiments">
          <ABTestingPlatform />
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                User Events ({events.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.slice(-20).reverse().map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{event.event}</div>
                      <div className="text-xs text-muted-foreground">
                        {event.page} • {event.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {event.sessionId.slice(-6)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export {
  AnalyticsTracker,
  PerformanceMonitor,
  ABTestingPlatform,
  KPIDashboard,
  AnalyticsFoundation,
};

export default AnalyticsFoundation;