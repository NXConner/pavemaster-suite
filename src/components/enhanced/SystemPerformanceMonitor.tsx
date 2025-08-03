import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'optimal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  history: number[];
}

export function SystemPerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    {
      id: 'cpu',
      name: 'CPU Usage',
      value: 34,
      unit: '%',
      status: 'optimal',
      trend: 'stable',
      history: [32, 33, 34, 35, 34],
    },
    {
      id: 'memory',
      name: 'Memory Usage',
      value: 67,
      unit: '%',
      status: 'warning',
      trend: 'up',
      history: [60, 62, 64, 66, 67],
    },
    {
      id: 'disk',
      name: 'Disk Usage',
      value: 45,
      unit: '%',
      status: 'optimal',
      trend: 'stable',
      history: [44, 45, 45, 46, 45],
    },
    {
      id: 'network',
      name: 'Network Load',
      value: 23,
      unit: 'Mbps',
      status: 'optimal',
      trend: 'down',
      history: [30, 28, 26, 24, 23],
    },
  ]);

  const [systemHealth, setSystemHealth] = useState({
    overall: 94,
    uptime: '7d 14h 23m',
    lastReboot: '2024-01-08 02:30:00',
    activeProcesses: 156,
    loadAverage: 1.23,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        const variance = (Math.random() - 0.5) * 10;
        const newValue = Math.max(0, Math.min(100, metric.value + variance));
        const newHistory = [...metric.history.slice(1), newValue];

        let status: 'optimal' | 'warning' | 'critical' = 'optimal';
        if (newValue > 80) { status = 'critical'; } else if (newValue > 60) { status = 'warning'; }

        let trend: 'up' | 'down' | 'stable' = 'stable';
        const recentAvg = newHistory.slice(-3).reduce((a, b) => a + b, 0) / 3;
        const olderAvg = newHistory.slice(-5, -2).reduce((a, b) => a + b, 0) / 3;
        if (recentAvg > olderAvg + 2) { trend = 'up'; } else if (recentAvg < olderAvg - 2) { trend = 'down'; }

        return {
          ...metric,
          value: newValue,
          status,
          trend,
          history: newHistory,
        };
      }));

      setSystemHealth(prev => ({
        ...prev,
        overall: Math.max(75, Math.min(100, prev.overall + (Math.random() - 0.5) * 2)),
        activeProcesses: Math.max(100, Math.min(200, prev.activeProcesses + Math.floor((Math.random() - 0.5) * 10))),
      }));
    }, 3000);

    return () => { clearInterval(interval); };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMetricIcon = (id: string) => {
    switch (id) {
      case 'cpu': return <Cpu className="h-5 w-5" />;
      case 'memory': return <HardDrive className="h-5 w-5" />;
      case 'disk': return <HardDrive className="h-5 w-5" />;
      case 'network': return <Wifi className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-green-500" />;
      default: return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-500" />
            System Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-1">
                {Math.round(systemHealth.overall)}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Health</div>
              <Progress value={systemHealth.overall} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-lg font-bold mb-1">{systemHealth.uptime}</div>
              <div className="text-sm text-muted-foreground">System Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold mb-1">{systemHealth.activeProcesses}</div>
              <div className="text-sm text-muted-foreground">Active Processes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold mb-1">{systemHealth.loadAverage}</div>
              <div className="text-sm text-muted-foreground">Load Average</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getMetricIcon(metric.id)}
                  <span className="text-sm font-medium">{metric.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.trend)}
                  {getStatusIcon(metric.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                    {Math.round(metric.value)}
                  </span>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                </div>

                <Progress
                  value={metric.value}
                  className="h-2"
                />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last 5 readings</span>
                  <Badge
                    variant={
                      metric.status === 'optimal' ? 'default'
                        : metric.status === 'warning' ? 'secondary' : 'destructive'
                    }
                  >
                    {metric.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Mini Chart */}
                <div className="flex items-end gap-1 h-8">
                  {metric.history.map((value, index) => (
                    <div
                      key={index}
                      className="bg-orange-500/30 rounded-sm flex-1"
                      style={{ height: `${(value / 100) * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-16 flex-col gap-2">
              <HardDrive className="h-5 w-5" />
              <span className="text-xs">Clear Cache</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <HardDrive className="h-5 w-5" />
              <span className="text-xs">Disk Cleanup</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <Activity className="h-5 w-5" />
              <span className="text-xs">Optimize DB</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <Cpu className="h-5 w-5" />
              <span className="text-xs">Process Mgmt</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance History */}
      <Card>
        <CardHeader>
          <CardTitle>24-Hour Performance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-1">
            {Array.from({ length: 24 }, (_, i) => {
              const height = Math.random() * 80 + 20;
              return (
                <div
                  key={i}
                  className="bg-gradient-to-t from-orange-500 to-orange-300 rounded-t flex-1"
                  style={{ height: `${height}%` }}
                  title={`${i}:00 - ${Math.round(height)}% avg performance`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}