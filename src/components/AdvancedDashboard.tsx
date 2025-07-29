import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Truck,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIData {
  id: string;
  title: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease';
  target?: number;
  icon: React.ReactNode;
  color: string;
}

interface ChartData {
  label: string;
  value: number;
  change?: number;
  category?: string;
  date?: string;
}

interface ProjectMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  averageCompletionTime: number;
  revenue: number;
  profitMargin: number;
}

interface OperationalMetrics {
  equipmentUtilization: number;
  fuelEfficiency: number;
  safetyIncidents: number;
  teamProductivity: number;
  customerSatisfaction: number;
  materialWaste: number;
}

export function AdvancedDashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [refreshKey, setRefreshKey] = useState(0);

  // Simulated real-time data
  const [projectMetrics, setProjectMetrics] = useState<ProjectMetrics>({
    totalProjects: 156,
    activeProjects: 23,
    completedProjects: 133,
    averageCompletionTime: 14.5,
    revenue: 2450000,
    profitMargin: 18.5
  });

  const [operationalMetrics, setOperationalMetrics] = useState<OperationalMetrics>({
    equipmentUtilization: 87,
    fuelEfficiency: 92,
    safetyIncidents: 2,
    teamProductivity: 94,
    customerSatisfaction: 96,
    materialWaste: 3.2
  });

  // KPI Cards Data
  const kpiData: KPIData[] = useMemo(() => [
    {
      id: 'revenue',
      title: 'Monthly Revenue',
      value: projectMetrics.revenue,
      unit: '$',
      change: 12.5,
      changeType: 'increase',
      target: 2500000,
      icon: <DollarSign className="h-4 w-4" />,
      color: 'text-green-600'
    },
    {
      id: 'projects',
      title: 'Active Projects',
      value: projectMetrics.activeProjects,
      unit: '',
      change: 8.3,
      changeType: 'increase',
      target: 25,
      icon: <Calendar className="h-4 w-4" />,
      color: 'text-blue-600'
    },
    {
      id: 'utilization',
      title: 'Equipment Utilization',
      value: operationalMetrics.equipmentUtilization,
      unit: '%',
      change: 5.2,
      changeType: 'increase',
      target: 90,
      icon: <Truck className="h-4 w-4" />,
      color: 'text-purple-600'
    },
    {
      id: 'satisfaction',
      title: 'Customer Satisfaction',
      value: operationalMetrics.customerSatisfaction,
      unit: '%',
      change: 2.1,
      changeType: 'increase',
      target: 95,
      icon: <Users className="h-4 w-4" />,
      color: 'text-orange-600'
    },
    {
      id: 'safety',
      title: 'Safety Score',
      value: 100 - (operationalMetrics.safetyIncidents * 10),
      unit: '/100',
      change: -5.0,
      changeType: 'decrease',
      target: 100,
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-red-600'
    },
    {
      id: 'efficiency',
      title: 'Fuel Efficiency',
      value: operationalMetrics.fuelEfficiency,
      unit: '%',
      change: 3.8,
      changeType: 'increase',
      target: 95,
      icon: <Zap className="h-4 w-4" />,
      color: 'text-yellow-600'
    }
  ], [projectMetrics, operationalMetrics]);

  // Chart data generators
  const revenueChartData: ChartData[] = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      label: month,
      value: Math.round(200000 + Math.random() * 300000 + (index * 15000)),
      change: Math.round((Math.random() - 0.5) * 20)
    }));
  }, [refreshKey]);

  const projectStatusData: ChartData[] = useMemo(() => [
    { label: 'Completed', value: projectMetrics.completedProjects, category: 'success' },
    { label: 'In Progress', value: projectMetrics.activeProjects, category: 'warning' },
    { label: 'Planning', value: 8, category: 'info' },
    { label: 'On Hold', value: 3, category: 'danger' }
  ], [projectMetrics]);

  const equipmentData: ChartData[] = useMemo(() => [
    { label: 'Pavers', value: 87, category: 'operational' },
    { label: 'Rollers', value: 92, category: 'operational' },
    { label: 'Trucks', value: 78, category: 'operational' },
    { label: 'Mixers', value: 95, category: 'operational' },
    { label: 'Compactors', value: 83, category: 'maintenance' }
  ], []);

  const productivityData: ChartData[] = useMemo(() => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    return weeks.map((week, index) => ({
      label: week,
      value: Math.round(85 + Math.random() * 15),
      change: Math.round((Math.random() - 0.5) * 10)
    }));
  }, [refreshKey]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update metrics slightly for real-time effect
      setProjectMetrics(prev => ({
        ...prev,
        revenue: prev.revenue + Math.round((Math.random() - 0.5) * 1000),
        activeProjects: Math.max(20, Math.min(30, prev.activeProjects + Math.round((Math.random() - 0.5) * 2)))
      }));

      setOperationalMetrics(prev => ({
        ...prev,
        equipmentUtilization: Math.max(80, Math.min(95, prev.equipmentUtilization + Math.round((Math.random() - 0.5) * 2))),
        customerSatisfaction: Math.max(90, Math.min(100, prev.customerSatisfaction + Math.round((Math.random() - 0.5))))
      }));

      setRefreshKey(prev => prev + 1);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getChangeIcon = (changeType: 'increase' | 'decrease') => {
    return changeType === 'increase' ? 
      <TrendingUp className="h-3 w-3" /> : 
      <TrendingDown className="h-3 w-3" />;
  };

  const getChangeColor = (changeType: 'increase' | 'decrease') => {
    return changeType === 'increase' ? 'text-green-600' : 'text-red-600';
  };

  const SimpleBarChart = ({ data, height = 200 }: { data: ChartData[]; height?: number }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="flex items-end space-x-2" style={{ height }}>
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-primary/80 rounded-t-sm transition-all duration-300 hover:bg-primary"
              style={{
                height: `${(item.value / maxValue) * (height - 40)}px`,
                minHeight: '4px'
              }}
            />
            <div className="text-xs text-muted-foreground mt-2 text-center">
              {item.label}
            </div>
            <div className="text-xs font-semibold">
              {typeof item.value === 'number' && item.value > 1000 
                ? formatNumber(item.value) 
                : item.value}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const SimplePieChart = ({ data }: { data: ChartData[] }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];

    return (
      <div className="flex items-center space-x-4">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${percentage} ${100 - percentage}`;
              const strokeDashoffset = -cumulativePercentage;
              cumulativePercentage += percentage;
              
              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={`hsl(${index * 72}, 70%, 50%)`}
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
        </div>
        <div className="flex-1 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: `hsl(${index * 72}, 70%, 50%)` }}
              />
              <span className="text-sm">{item.label}</span>
              <span className="text-sm font-semibold ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Dashboard</h1>
          <p className="text-muted-foreground">Real-time insights and analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Live Data
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiData.map((kpi) => (
          <Card key={kpi.id} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className={cn("p-2 rounded-lg bg-muted", kpi.color)}>
                  {kpi.icon}
                </div>
                <Badge variant="outline" className={getChangeColor(kpi.changeType)}>
                  {getChangeIcon(kpi.changeType)}
                  {Math.abs(kpi.change)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">{kpi.title}</h3>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-bold">
                    {kpi.unit === '$' ? formatCurrency(kpi.value) : 
                     kpi.unit === '%' ? `${kpi.value}${kpi.unit}` : 
                     `${formatNumber(kpi.value)}${kpi.unit}`}
                  </span>
                </div>
                {kpi.target && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Target: {kpi.unit === '$' ? formatCurrency(kpi.target) : `${kpi.target}${kpi.unit}`}</span>
                      <span>{Math.round((kpi.value / kpi.target) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(kpi.value / kpi.target) * 100} 
                      className="h-1"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Monthly Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={revenueChartData} height={300} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Asphalt Paving', amount: 1200000, percentage: 49 },
                  { name: 'Sealcoating', amount: 650000, percentage: 27 },
                  { name: 'Repair & Maintenance', amount: 400000, percentage: 16 },
                  { name: 'Consultation', amount: 200000, percentage: 8 }
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="font-semibold">{formatCurrency(item.amount)}</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Project Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimplePieChart data={projectStatusData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Highway 101 Resurfacing', progress: 85, deadline: '2024-02-15', status: 'on-track' },
                  { name: 'Shopping Center Parking', progress: 60, deadline: '2024-02-28', status: 'at-risk' },
                  { name: 'School District Repairs', progress: 95, deadline: '2024-02-10', status: 'ahead' },
                  { name: 'Industrial Complex', progress: 30, deadline: '2024-03-15', status: 'on-track' }
                ].map((project, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{project.name}</span>
                      <Badge variant={
                        project.status === 'ahead' ? 'default' :
                        project.status === 'at-risk' ? 'destructive' : 'secondary'
                      }>
                        {project.progress}%
                      </Badge>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Due: {project.deadline}</span>
                      <span className={cn(
                        project.status === 'ahead' && 'text-green-600',
                        project.status === 'at-risk' && 'text-red-600'
                      )}>
                        {project.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Equipment Utilization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={equipmentData} height={250} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operational Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { metric: 'Fuel Efficiency', value: operationalMetrics.fuelEfficiency, unit: '%', target: 95, color: 'bg-green-500' },
                  { metric: 'Material Waste', value: operationalMetrics.materialWaste, unit: '%', target: 5, color: 'bg-red-500', inverse: true },
                  { metric: 'Team Productivity', value: operationalMetrics.teamProductivity, unit: '%', target: 90, color: 'bg-blue-500' },
                  { metric: 'Safety Score', value: 100 - (operationalMetrics.safetyIncidents * 10), unit: '/100', target: 100, color: 'bg-yellow-500' }
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.metric}</span>
                      <span className="font-semibold">{item.value}{item.unit}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={item.inverse ? (item.target - item.value) / item.target * 100 : (item.value / item.target) * 100} 
                        className="flex-1 h-2" 
                      />
                      <Badge variant="outline" className="text-xs">
                        {item.inverse ? 
                          `${Math.round((item.target - item.value) / item.target * 100)}%` :
                          `${Math.round((item.value / item.target) * 100)}%`
                        }
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Weekly Productivity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={productivityData} height={250} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold">{projectMetrics.completedProjects}</div>
                    <div className="text-sm text-muted-foreground">Completed Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-2 bg-blue-100 rounded-full">
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold">{projectMetrics.averageCompletionTime}</div>
                    <div className="text-sm text-muted-foreground">Avg. Completion (days)</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Customer Satisfaction</span>
                    <span className="font-semibold">{operationalMetrics.customerSatisfaction}%</span>
                  </div>
                  <Progress value={operationalMetrics.customerSatisfaction} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Profit Margin</span>
                    <span className="font-semibold">{projectMetrics.profitMargin}%</span>
                  </div>
                  <Progress value={projectMetrics.profitMargin} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdvancedDashboard;