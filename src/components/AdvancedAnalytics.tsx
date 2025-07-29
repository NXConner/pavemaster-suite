import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, Activity,
  Calendar, Clock, Users, DollarSign, Target, Zap, AlertTriangle,
  Download, Share2, Filter, RefreshCw, Settings, Eye, EyeOff,
  MapPin, Car, Briefcase, Building, Wrench, ShoppingCart, Gauge
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AnalyticsData {
  financial: {
    revenue: number;
    costs: number;
    profit: number;
    profitMargin: number;
    trend: 'up' | 'down' | 'stable';
  };
  productivity: {
    efficiency: number;
    utilization: number;
    completionRate: number;
    averageTaskTime: number;
    trend: 'up' | 'down' | 'stable';
  };
  workforce: {
    totalEmployees: number;
    activeEmployees: number;
    attendanceRate: number;
    overtimeHours: number;
    satisfactionScore: number;
  };
  projects: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    completionRate: number;
  };
  equipment: {
    total: number;
    operational: number;
    maintenance: number;
    utilization: number;
    downtime: number;
  };
  safety: {
    incidentCount: number;
    safetyScore: number;
    complianceRate: number;
    nearMisses: number;
    trainingCompletion: number;
  };
}

interface ChartDataPoint {
  date: string;
  value: number;
  category?: string;
  label?: string;
}

interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  status: 'good' | 'warning' | 'critical';
  category: string;
}

const AdvancedAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [chartData, setChartData] = useState<Record<string, ChartDataPoint[]>>({});
  const [kpis, setKPIs] = useState<KPI[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(60); // seconds
  const [militaryJargon, setMilitaryJargon] = useState(false);
  const [showPredictions, setShowPredictions] = useState(true);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['financial', 'productivity', 'workforce']);

  const refreshIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }
      
      setUserRole(data?.role);
    };

    checkUserRole();
  }, [user]);

  useEffect(() => {
    if (userRole && ['super_admin', 'admin', 'manager'].includes(userRole)) {
      fetchAnalyticsData();
      if (autoRefresh) {
        startAutoRefresh();
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [userRole, selectedTimeRange, selectedDepartment, autoRefresh, refreshInterval]);

  const startAutoRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(() => {
      fetchAnalyticsData();
    }, refreshInterval * 1000);
  };

  const fetchAnalyticsData = async () => {
    try {
      await Promise.all([
        loadAnalyticsData(),
        loadChartData(),
        loadKPIs()
      ]);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        variant: "destructive",
        title: "Error fetching analytics",
        description: "Unable to load analytics data. Please try again."
      });
    }
  };

  const loadAnalyticsData = async () => {
    // Simulate comprehensive analytics data
    const data: AnalyticsData = {
      financial: {
        revenue: 1250000,
        costs: 890000,
        profit: 360000,
        profitMargin: 28.8,
        trend: 'up'
      },
      productivity: {
        efficiency: 87.3,
        utilization: 82.1,
        completionRate: 94.5,
        averageTaskTime: 4.2,
        trend: 'up'
      },
      workforce: {
        totalEmployees: 145,
        activeEmployees: 134,
        attendanceRate: 96.2,
        overtimeHours: 287,
        satisfactionScore: 8.4
      },
      projects: {
        total: 23,
        completed: 18,
        inProgress: 4,
        overdue: 1,
        completionRate: 78.3
      },
      equipment: {
        total: 67,
        operational: 61,
        maintenance: 4,
        utilization: 89.2,
        downtime: 3.1
      },
      safety: {
        incidentCount: 2,
        safetyScore: 94.7,
        complianceRate: 98.1,
        nearMisses: 7,
        trainingCompletion: 92.3
      }
    };

    setAnalyticsData(data);
  };

  const loadChartData = async () => {
    const charts = {
      revenue: generateTimeSeriesData('revenue', 30),
      costs: generateTimeSeriesData('costs', 30),
      productivity: generateTimeSeriesData('productivity', 30),
      workforce: generateTimeSeriesData('workforce', 30),
      projects: generateTimeSeriesData('projects', 30),
      safety: generateTimeSeriesData('safety', 30)
    };

    setChartData(charts);
  };

  const generateTimeSeriesData = (metric: string, days: number): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    const baseValue = {
      revenue: 40000,
      costs: 28000,
      productivity: 85,
      workforce: 92,
      projects: 78,
      safety: 94
    }[metric] || 50;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const value = baseValue + (Math.random() - 0.5) * baseValue * 0.2;
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value * 100) / 100,
        category: metric
      });
    }

    return data;
  };

  const loadKPIs = async () => {
    const kpiData: KPI[] = [
      {
        id: 'revenue_growth',
        name: 'Revenue Growth',
        value: 12.7,
        target: 15.0,
        unit: '%',
        trend: 'up',
        change: 2.3,
        status: 'good',
        category: 'financial'
      },
      {
        id: 'cost_efficiency',
        name: 'Cost Efficiency',
        value: 71.2,
        target: 75.0,
        unit: '%',
        trend: 'up',
        change: 1.8,
        status: 'warning',
        category: 'financial'
      },
      {
        id: 'employee_productivity',
        name: 'Employee Productivity',
        value: 87.3,
        target: 85.0,
        unit: '%',
        trend: 'up',
        change: 3.1,
        status: 'good',
        category: 'productivity'
      },
      {
        id: 'project_completion',
        name: 'Project Completion Rate',
        value: 94.5,
        target: 90.0,
        unit: '%',
        trend: 'up',
        change: 4.2,
        status: 'good',
        category: 'projects'
      },
      {
        id: 'safety_score',
        name: 'Safety Performance',
        value: 94.7,
        target: 95.0,
        unit: '/100',
        trend: 'stable',
        change: -0.3,
        status: 'warning',
        category: 'safety'
      },
      {
        id: 'equipment_uptime',
        name: 'Equipment Uptime',
        value: 96.9,
        target: 95.0,
        unit: '%',
        trend: 'up',
        change: 1.2,
        status: 'good',
        category: 'equipment'
      },
      {
        id: 'customer_satisfaction',
        name: 'Customer Satisfaction',
        value: 4.6,
        target: 4.5,
        unit: '/5',
        trend: 'up',
        change: 0.2,
        status: 'good',
        category: 'quality'
      },
      {
        id: 'inventory_turnover',
        name: 'Inventory Turnover',
        value: 8.3,
        target: 10.0,
        unit: 'x',
        trend: 'down',
        change: -0.7,
        status: 'critical',
        category: 'operations'
      }
    ];

    setKPIs(kpiData);
  };

  const exportData = (format: 'csv' | 'pdf' | 'xlsx') => {
    const data = {
      analytics: analyticsData,
      kpis: kpis,
      charts: chartData,
      exportedAt: new Date().toISOString(),
      timeRange: selectedTimeRange,
      department: selectedDepartment
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${format}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    toast({
      title: "Export Complete",
      description: `Analytics data exported as ${format.toUpperCase()}`
    });
  };

  const getJargonText = (civilian: string, military: string) => {
    return militaryJargon ? military : civilian;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'productivity': return <TrendingUp className="h-4 w-4" />;
      case 'projects': return <Target className="h-4 w-4" />;
      case 'safety': return <AlertTriangle className="h-4 w-4" />;
      case 'equipment': return <Wrench className="h-4 w-4" />;
      case 'workforce': return <Users className="h-4 w-4" />;
      case 'quality': return <Gauge className="h-4 w-4" />;
      case 'operations': return <Building className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (!userRole || !['super_admin', 'admin', 'manager'].includes(userRole)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">Analytics Access Restricted</h2>
          <p className="text-muted-foreground">
            {getJargonText(
              'Management access required for Advanced Analytics',
              'Command authorization required for Strategic Intelligence'
            )}
          </p>
        </Card>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">
              {getJargonText('Advanced Analytics', 'Strategic Intelligence Center')}
            </h1>
          </div>
          <Badge variant="outline" className="animate-pulse">
            Live Data
          </Badge>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>Last update: {new Date().toLocaleTimeString()}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="military-jargon"
              checked={militaryJargon}
              onCheckedChange={setMilitaryJargon}
            />
            <Label htmlFor="military-jargon" className="text-xs">
              {getJargonText('Military', 'Tactical')}
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={(checked) => {
                setAutoRefresh(checked);
                if (checked) {
                  startAutoRefresh();
                }
              }}
            />
            <Label htmlFor="auto-refresh" className="text-xs">Auto-Refresh</Label>
          </div>

          <Button variant="outline" onClick={() => exportData('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="hr">Human Resources</SelectItem>
              <SelectItem value="safety">Safety & Compliance</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Switch
              id="predictions"
              checked={showPredictions}
              onCheckedChange={setShowPredictions}
            />
            <Label htmlFor="predictions" className="text-sm">
              {getJargonText('Show Predictions', 'Tactical Forecasts')}
            </Label>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Label className="text-sm">Update Interval: {refreshInterval}s</Label>
          <Slider
            value={[refreshInterval]}
            onValueChange={(value) => setRefreshInterval(value[0])}
            min={30}
            max={300}
            step={30}
            className="w-24"
          />
        </div>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {getJargonText('Total Revenue', 'Mission Revenue')}
                </p>
                <p className="text-2xl font-bold">${(analyticsData.financial.revenue / 1000).toFixed(0)}K</p>
              </div>
              <div className="flex items-center space-x-1">
                {getTrendIcon(analyticsData.financial.trend)}
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <Progress value={(analyticsData.financial.revenue / 1500000) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {getJargonText('Productivity', 'Operational Efficiency')}
                </p>
                <p className="text-2xl font-bold">{analyticsData.productivity.efficiency}%</p>
              </div>
              <div className="flex items-center space-x-1">
                {getTrendIcon(analyticsData.productivity.trend)}
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <Progress value={analyticsData.productivity.efficiency} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {getJargonText('Active Workforce', 'Active Personnel')}
                </p>
                <p className="text-2xl font-bold">{analyticsData.workforce.activeEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
            <Progress value={(analyticsData.workforce.activeEmployees / analyticsData.workforce.totalEmployees) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {getJargonText('Project Success', 'Mission Success')}
                </p>
                <p className="text-2xl font-bold">{analyticsData.projects.completionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
            <Progress value={analyticsData.projects.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {getJargonText('Safety Score', 'Risk Assessment')}
                </p>
                <p className="text-2xl font-bold">{analyticsData.safety.safetyScore}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <Progress value={analyticsData.safety.safetyScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {getJargonText('Equipment Uptime', 'Asset Operational Status')}
                </p>
                <p className="text-2xl font-bold">{analyticsData.equipment.utilization}%</p>
              </div>
              <Wrench className="h-8 w-8 text-gray-500" />
            </div>
            <Progress value={analyticsData.equipment.utilization} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            {getJargonText('Overview', 'Situation Report')}
          </TabsTrigger>
          <TabsTrigger value="financial">
            {getJargonText('Financial', 'Resource Analysis')}
          </TabsTrigger>
          <TabsTrigger value="operations">
            {getJargonText('Operations', 'Mission Status')}
          </TabsTrigger>
          <TabsTrigger value="workforce">
            {getJargonText('Workforce', 'Personnel')}
          </TabsTrigger>
          <TabsTrigger value="predictive">
            {getJargonText('Predictive', 'Intelligence')}
          </TabsTrigger>
          <TabsTrigger value="custom">
            {getJargonText('Custom', 'Command View')}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map(kpi => (
              <Card key={kpi.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(kpi.category)}
                      <h4 className="text-sm font-medium">{kpi.name}</h4>
                    </div>
                    {getTrendIcon(kpi.trend)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-end space-x-2">
                      <span className="text-2xl font-bold">{kpi.value}</span>
                      <span className="text-sm text-muted-foreground">{kpi.unit}</span>
                    </div>
                    
                    <div className="flex justify-between text-xs">
                      <span>Target: {kpi.target}{kpi.unit}</span>
                      <span className={getStatusColor(kpi.status)}>
                        {kpi.change > 0 ? '+' : ''}{kpi.change}%
                      </span>
                    </div>
                    
                    <Progress value={(kpi.value / kpi.target) * 100} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="h-5 w-5" />
                  <span>{getJargonText('Revenue Trend', 'Financial Performance')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Revenue Trend Chart</p>
                    <p className="text-xs text-muted-foreground">
                      {chartData.revenue?.length || 0} data points
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>{getJargonText('Cost Breakdown', 'Resource Allocation')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Cost Distribution</p>
                    <p className="text-xs text-muted-foreground">
                      Labor: 60% | Materials: 25% | Equipment: 15%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>{getJargonText('Productivity Metrics', 'Operational Efficiency')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Productivity Dashboard</p>
                    <p className="text-xs text-muted-foreground">
                      Efficiency: {analyticsData.productivity.efficiency}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>{getJargonText('Workforce Analytics', 'Personnel Metrics')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded flex items-center justify-center">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Workforce Overview</p>
                    <p className="text-xs text-muted-foreground">
                      {analyticsData.workforce.activeEmployees}/{analyticsData.workforce.totalEmployees} Active
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Revenue</span>
                    <span className="font-bold">${analyticsData.financial.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Costs</span>
                    <span className="font-bold">${analyticsData.financial.costs.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Net Profit</span>
                    <span className="font-bold text-green-600">${analyticsData.financial.profit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit Margin</span>
                    <span className="font-bold">{analyticsData.financial.profitMargin}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">71.2%</div>
                    <div className="text-sm text-muted-foreground">Current Efficiency</div>
                  </div>
                  <Progress value={71.2} className="h-2" />
                  <div className="text-xs text-center text-muted-foreground">
                    Target: 75%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ROI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">24.7%</div>
                    <div className="text-sm text-muted-foreground">Return on Investment</div>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Equipment ROI:</span>
                      <span>18.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Training ROI:</span>
                      <span>31.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Technology ROI:</span>
                      <span>42.1%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Projects</span>
                    <Badge>{analyticsData.projects.total}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed</span>
                    <Badge variant="outline" className="text-green-600">{analyticsData.projects.completed}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>In Progress</span>
                    <Badge variant="outline" className="text-blue-600">{analyticsData.projects.inProgress}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Overdue</span>
                    <Badge variant="destructive">{analyticsData.projects.overdue}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equipment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Equipment</span>
                    <Badge>{analyticsData.equipment.total}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Operational</span>
                    <Badge variant="outline" className="text-green-600">{analyticsData.equipment.operational}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>In Maintenance</span>
                    <Badge variant="outline" className="text-yellow-600">{analyticsData.equipment.maintenance}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilization Rate</span>
                    <Badge variant="outline">{analyticsData.equipment.utilization}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Safety Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Incidents (MTD)</span>
                    <Badge variant={analyticsData.safety.incidentCount > 0 ? "destructive" : "outline"}>
                      {analyticsData.safety.incidentCount}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Safety Score</span>
                    <Badge variant="outline" className="text-green-600">{analyticsData.safety.safetyScore}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Compliance Rate</span>
                    <Badge variant="outline">{analyticsData.safety.complianceRate}%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Training Complete</span>
                    <Badge variant="outline">{analyticsData.safety.trainingCompletion}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Additional tabs would continue here with similar structure */}
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;