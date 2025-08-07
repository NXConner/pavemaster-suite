import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import {
  Activity,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  Database,
  Server,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
} from 'lucide-react';

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  threshold: { warning: number; critical: number };
}

interface PerformanceLog {
  timestamp: Date;
  type: 'info' | 'warning' | 'error';
  message: string;
  details?: any;
}

const MOCK_METRICS: SystemMetric[] = [
  {
    id: 'cpu',
    name: 'CPU Usage',
    value: 45,
    unit: '%',
    status: 'good',
    trend: 'stable',
    threshold: { warning: 70, critical: 85 },
  },
  {
    id: 'memory',
    name: 'Memory Usage',
    value: 67,
    unit: '%',
    status: 'warning',
    trend: 'up',
    threshold: { warning: 65, critical: 80 },
  },
  {
    id: 'disk',
    name: 'Disk Usage',
    value: 34,
    unit: '%',
    status: 'good',
    trend: 'stable',
    threshold: { warning: 75, critical: 90 },
  },
  {
    id: 'network',
    name: 'Network Latency',
    value: 23,
    unit: 'ms',
    status: 'good',
    trend: 'down',
    threshold: { warning: 100, critical: 200 },
  },
];

const MOCK_LOGS: PerformanceLog[] = [
  {
    timestamp: new Date(),
    type: 'info',
    message: 'System performance optimal',
    details: { responseTime: '127ms', throughput: '1250 req/min' },
  },
  {
    timestamp: new Date(Date.now() - 120000),
    type: 'warning',
    message: 'Memory usage approaching threshold',
    details: { usage: '67%', threshold: '65%' },
  },
  {
    timestamp: new Date(Date.now() - 300000),
    type: 'info',
    message: 'Database connection pool optimized',
    details: { connections: 25, maxConnections: 100 },
  },
];

export function SystemPerformanceMonitor() {
  const [metrics, setMetrics] = useState<SystemMetric[]>(MOCK_METRICS);
  const [logs] = useState<PerformanceLog[]>(MOCK_LOGS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [uptime] = useState('72:14:33');

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time metric updates
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 10)),
        status: metric.value > metric.threshold.critical ? 'critical'
                : metric.value > metric.threshold.warning ? 'warning' : 'good',
      })));
    }, 5000);

    return () => { clearInterval(interval); };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMetricIcon = (id: string) => {
    switch (id) {
      case 'cpu': return <Cpu className="h-4 w-4 text-blue-500" />;
      case 'memory': return <MemoryStick className="h-4 w-4 text-purple-500" />;
      case 'disk': return <HardDrive className="h-4 w-4 text-green-500" />;
      case 'network': return <Wifi className="h-4 w-4 text-orange-500" />;
      default: return <Server className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-green-500" />;
      default: return <Activity className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border/50 bg-surface/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              System Performance Monitor
              <Badge variant="outline" className="ml-2">
                Uptime: {uptime}
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id} className="border/50 bg-surface/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getMetricIcon(metric.id)}
                  <span className="font-medium text-sm">{metric.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(metric.status)}
                  {getTrendIcon(metric.trend)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {Math.round(metric.value)}{metric.unit}
                  </span>
                  <Badge
                    variant={metric.status === 'critical' ? 'destructive'
                            : metric.status === 'warning' ? 'secondary' : 'default'}
                    className="text-xs"
                  >
                    {metric.status}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <Progress value={metric.value} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0{metric.unit}</span>
                    <span>100{metric.unit}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card className="border/50 bg-surface/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-48 flex items-end justify-between gap-2">
                {Array.from({ length: 12 }).map((_, index) => {
                  const value = Math.random() * 80 + 10;
                  return (
                    <div key={index} className="flex-1 bg-muted rounded-t-md relative">
                      <div
                        className={`rounded-t-md transition-all duration-500 ${
                          value > 70 ? 'bg-red-500'
                          : value > 50 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ height: `${value}%` }}
                      />
                      <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
                        {index + 1}h
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="text-center text-xs text-muted-foreground mt-4">
                Last 12 hours performance
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="border/50 bg-surface/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Database', status: 'online', response: '12ms' },
                { name: 'API Gateway', status: 'online', response: '45ms' },
                { name: 'Cache Layer', status: 'online', response: '3ms' },
                { name: 'File Storage', status: 'warning', response: '234ms' },
                { name: 'Auth Service', status: 'online', response: '67ms' },
                { name: 'Notification Service', status: 'online', response: '89ms' },
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-surface/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <span className="font-medium text-sm">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {service.response}
                    </Badge>
                    <Badge
                      variant={service.status === 'online' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {service.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Logs */}
      <Card className="border/50 bg-surface/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Performance Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-surface/30 rounded-lg">
                  {getLogIcon(log.type)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{log.message}</span>
                      <span className="text-xs text-muted-foreground">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    {log.details && (
                      <div className="text-xs text-muted-foreground">
                        {Object.entries(log.details).map(([key, value]) => (
                          <span key={key} className="mr-4">
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}