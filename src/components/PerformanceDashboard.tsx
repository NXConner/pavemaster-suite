import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  Users,
  Clock,
  Target,
  Activity,
  Wrench,
  Fuel,
  MapPin,
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  category: 'efficiency' | 'cost' | 'quality' | 'safety';
}

interface ProjectMetrics {
  totalProjects: number;
  completedProjects: number;
  onTimeDelivery: number;
  underBudget: number;
  qualityScore: number;
  customerSatisfaction: number;
}

interface OperationalData {
  equipmentUtilization: Array<{
    equipment: string;
    utilization: number;
    maintenance: number;
    efficiency: number;
  }>;
  crewPerformance: Array<{
    crew: string;
    productivity: number;
    safety: number;
    hours: number;
  }>;
  costBreakdown: Array<{
    category: string;
    amount: number;
    budget: number;
    variance: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    costs: number;
    profit: number;
    projects: number;
  }>;
}

interface PerformanceDashboardProps {
  className?: string;
}

export function PerformanceDashboard({ className = '' }: PerformanceDashboardProps) {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [projectMetrics, setProjectMetrics] = useState<ProjectMetrics | null>(null);
  const [operationalData, setOperationalData] = useState<OperationalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    loadPerformanceData();
  }, [selectedPeriod]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      // Simulate API call - in real implementation, this would fetch from your database
      const mockMetrics: PerformanceMetric[] = [
        {
          id: '1',
          name: 'Overall Equipment Efficiency',
          value: 87,
          target: 85,
          unit: '%',
          trend: 'up',
          change: 3.2,
          category: 'efficiency',
        },
        {
          id: '2',
          name: 'Fuel Cost per Project',
          value: 2850,
          target: 3200,
          unit: '$',
          trend: 'down',
          change: -12.5,
          category: 'cost',
        },
        {
          id: '3',
          name: 'Average Project Quality Score',
          value: 94,
          target: 90,
          unit: '%',
          trend: 'up',
          change: 2.8,
          category: 'quality',
        },
        {
          id: '4',
          name: 'Safety Incidents per Month',
          value: 0.2,
          target: 0.5,
          unit: 'incidents',
          trend: 'down',
          change: -60,
          category: 'safety',
        },
        {
          id: '5',
          name: 'Crew Productivity Index',
          value: 112,
          target: 100,
          unit: 'index',
          trend: 'up',
          change: 8.4,
          category: 'efficiency',
        },
        {
          id: '6',
          name: 'Material Waste Percentage',
          value: 3.2,
          target: 5.0,
          unit: '%',
          trend: 'down',
          change: -28,
          category: 'cost',
        },
      ];

      const mockProjectMetrics: ProjectMetrics = {
        totalProjects: 28,
        completedProjects: 24,
        onTimeDelivery: 87,
        underBudget: 76,
        qualityScore: 94,
        customerSatisfaction: 96,
      };

      const mockOperationalData: OperationalData = {
        equipmentUtilization: [
          { equipment: 'Asphalt Paver #1', utilization: 89, maintenance: 95, efficiency: 92 },
          { equipment: 'Roller Compactor #1', utilization: 84, maintenance: 88, efficiency: 86 },
          { equipment: 'Roller Compactor #2', utilization: 91, maintenance: 92, efficiency: 94 },
          { equipment: 'Dump Truck #1', utilization: 76, maintenance: 85, efficiency: 82 },
          { equipment: 'Dump Truck #2', utilization: 82, maintenance: 90, efficiency: 88 },
          { equipment: 'Seal Coating Unit', utilization: 78, maintenance: 94, efficiency: 85 },
        ],
        crewPerformance: [
          { crew: 'Crew Alpha', productivity: 115, safety: 98, hours: 184 },
          { crew: 'Crew Beta', productivity: 108, safety: 96, hours: 172 },
          { crew: 'Crew Gamma', productivity: 112, safety: 100, hours: 168 },
          { crew: 'Crew Delta', productivity: 95, safety: 94, hours: 156 },
        ],
        costBreakdown: [
          { category: 'Materials', amount: 125000, budget: 130000, variance: -3.8 },
          { category: 'Labor', amount: 85000, budget: 82000, variance: 3.7 },
          { category: 'Equipment', amount: 45000, budget: 48000, variance: -6.3 },
          { category: 'Fuel', amount: 18500, budget: 22000, variance: -15.9 },
          { category: 'Overhead', amount: 12000, budget: 12000, variance: 0 },
        ],
        monthlyTrends: [
          { month: 'Jan', revenue: 285000, costs: 198000, profit: 87000, projects: 6 },
          { month: 'Feb', revenue: 320000, costs: 224000, profit: 96000, projects: 7 },
          { month: 'Mar', revenue: 298000, costs: 208000, profit: 90000, projects: 6 },
          { month: 'Apr', revenue: 365000, costs: 255000, profit: 110000, projects: 8 },
          { month: 'May', revenue: 412000, costs: 288000, profit: 124000, projects: 9 },
          { month: 'Jun', revenue: 445000, costs: 311000, profit: 134000, projects: 10 },
        ],
      };

      setMetrics(mockMetrics);
      setProjectMetrics(mockProjectMetrics);
      setOperationalData(mockOperationalData);
    } catch (error) {
      console.error('Error loading performance data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load performance data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'efficiency': return <Activity className="h-4 w-4" />;
      case 'cost': return <DollarSign className="h-4 w-4" />;
      case 'quality': return <CheckCircle className="h-4 w-4" />;
      case 'safety': return <AlertTriangle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'efficiency': return 'text-blue-500';
      case 'cost': return 'text-green-500';
      case 'quality': return 'text-purple-500';
      case 'safety': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (trend === 'down') {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <div className="h-4 w-4 rounded-full bg-gray-300" />;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Period Selection */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Performance Dashboard</h2>
        <div className="flex gap-2">
          {['week', 'month', 'quarter', 'year'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setSelectedPeriod(period); }}
              className="capitalize"
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <span className={getCategoryColor(metric.category)}>
                  {getCategoryIcon(metric.category)}
                </span>
                {metric.name}
              </CardTitle>
              {getTrendIcon(metric.trend, metric.change)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.value}{metric.unit}
              </div>
              <div className="flex items-center justify-between mt-2">
                <Progress
                  value={(metric.value / metric.target) * 100}
                  className="flex-1 mr-2"
                />
                <span className="text-xs text-muted-foreground">
                  Target: {metric.target}{metric.unit}
                </span>
              </div>
              <p className={`text-xs mt-1 ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change >= 0 ? '+' : ''}{metric.change}% from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Project Overview */}
      {projectMetrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectMetrics.totalProjects}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectMetrics.completedProjects}</div>
              <Progress value={(projectMetrics.completedProjects / projectMetrics.totalProjects) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectMetrics.onTimeDelivery}%</div>
              <Progress value={projectMetrics.onTimeDelivery} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectMetrics.underBudget}%</div>
              <Progress value={projectMetrics.underBudget} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectMetrics.qualityScore}%</div>
              <Progress value={projectMetrics.qualityScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectMetrics.customerSatisfaction}%</div>
              <Progress value={projectMetrics.customerSatisfaction} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Operational Charts */}
      {operationalData && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Equipment Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={operationalData.equipmentUtilization}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="equipment" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="utilization" fill="#8884d8" name="Utilization %" />
                  <Bar dataKey="efficiency" fill="#82ca9d" name="Efficiency %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Crew Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={operationalData.crewPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="crew" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="productivity" fill="#ffc658" name="Productivity %" />
                  <Bar dataKey="safety" fill="#ff7300" name="Safety Score %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cost Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={operationalData.costBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, amount }) => `${category}: $${amount.toLocaleString()}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {operationalData.costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={operationalData.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                  <Line type="monotone" dataKey="costs" stroke="#82ca9d" name="Costs" />
                  <Line type="monotone" dataKey="profit" stroke="#ffc658" name="Profit" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}