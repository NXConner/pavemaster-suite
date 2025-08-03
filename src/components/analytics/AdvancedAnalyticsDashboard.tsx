import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

interface AnalyticsMetric {
  id: string;
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

const MOCK_METRICS: AnalyticsMetric[] = [
  {
    id: 'revenue',
    label: 'Monthly Revenue',
    value: '$45,250',
    change: 12.5,
    trend: 'up',
    status: 'good'
  },
  {
    id: 'projects',
    label: 'Active Projects',
    value: '8',
    change: -2.3,
    trend: 'down',
    status: 'warning'
  },
  {
    id: 'efficiency',
    label: 'Crew Efficiency',
    value: '87%',
    change: 5.2,
    trend: 'up',
    status: 'good'
  },
  {
    id: 'costs',
    label: 'Operating Costs',
    value: '$28,100',
    change: -8.7,
    trend: 'down',
    status: 'good'
  }
];

const CHART_DATA: ChartData[] = [
  { name: 'Completed', value: 65, color: 'hsl(var(--primary))' },
  { name: 'In Progress', value: 25, color: 'hsl(var(--secondary))' },
  { name: 'Planned', value: 10, color: 'hsl(var(--muted))' }
];

export function AdvancedAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [metrics] = useState<AnalyticsMetric[]>(MOCK_METRICS);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-border/50 bg-surface/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Advanced Analytics Dashboard
            </CardTitle>
            <div className="flex gap-2">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id} className="border-border/50 bg-surface/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(metric.status)}
                    <span className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </span>
                  </div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metric.trend)}
                    <span className={`text-sm font-medium ${getChangeColor(metric.change)}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Chart */}
        <Card className="border-border/50 bg-surface/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Project Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {CHART_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{item.value}%</span>
                    <div className="w-20 h-2 bg-muted rounded-full">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${item.value}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <Card className="border-border/50 bg-surface/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-40 flex items-end justify-between gap-2">
                {[65, 72, 68, 85, 91, 78, 89].map((value, idx) => (
                  <div key={idx} className="flex-1 bg-muted rounded-t-md relative">
                    <div 
                      className="bg-primary rounded-t-md transition-all duration-500"
                      style={{ height: `${value}%` }}
                    />
                    <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
                      {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-center text-xs text-muted-foreground mt-4">
                Last 7 days performance
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resource Utilization */}
        <Card className="border-border/50 bg-surface/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Resource Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Crew A', utilization: 95, status: 'high' },
                { name: 'Crew B', utilization: 78, status: 'medium' },
                { name: 'Crew C', utilization: 45, status: 'low' },
                { name: 'Equipment', utilization: 82, status: 'medium' }
              ].map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="text-muted-foreground">{item.utilization}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.status === 'high' ? 'bg-red-500' :
                        item.status === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${item.utilization}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cost Analysis */}
        <Card className="border-border/50 bg-surface/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: 'Materials', amount: 15750, percentage: 45 },
                { category: 'Labor', amount: 12200, percentage: 35 },
                { category: 'Equipment', amount: 5250, percentage: 15 },
                { category: 'Overhead', amount: 1750, percentage: 5 }
              ].map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-sm font-medium">{item.category}</span>
                    <div className="text-xs text-muted-foreground">
                      ${item.amount.toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="outline">{item.percentage}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline Overview */}
        <Card className="border-border/50 bg-surface/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Timeline Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-3">
                {[
                  { time: '09:00', event: 'Crew A deployed to Site 1', status: 'completed' },
                  { time: '10:30', event: 'Quality check passed', status: 'completed' },
                  { time: '12:15', event: 'Material delivery arrived', status: 'completed' },
                  { time: '14:00', event: 'Weather alert issued', status: 'warning' },
                  { time: '15:30', event: 'Phase 2 initiated', status: 'active' },
                  { time: '16:45', event: 'Equipment maintenance due', status: 'pending' }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="text-xs text-muted-foreground mt-1 w-12">
                      {item.time}
                    </div>
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      item.status === 'completed' ? 'bg-green-500' :
                      item.status === 'warning' ? 'bg-yellow-500' :
                      item.status === 'active' ? 'bg-blue-500' : 'bg-muted'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}