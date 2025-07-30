import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Users,
  Building,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Zap,
  Activity,
  PieChart,
  BarChart3,
  Clock,
  Calculator,
  FileText,
  Eye
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, PieChart as RechartsPieChart, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CostCategory {
  id: string;
  name: string;
  totalCost: number;
  color: string;
  subcategories: Array<{
    name: string;
    cost: number;
    trend: number;
  }>;
}

interface EmployeeCostData {
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  totalNegativeCost: number;
  totalPositiveCost: number;
  netCost: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recentEvents: Array<{
    date: string;
    type: string;
    cost: number;
    description: string;
  }>;
  categories: Record<string, number>;
}

interface ProjectCostData {
  projectId: string;
  projectName: string;
  budgetedCost: number;
  actualCost: number;
  variance: number;
  variancePercentage: number;
  employeeCosts: number;
  materialCosts: number;
  equipmentCosts: number;
  overheadCosts: number;
}

interface RealTimeCostMetrics {
  totalDailyCost: number;
  hourlyBurnRate: number;
  projectedMonthlyCost: number;
  costPerEmployee: number;
  efficiencyRating: number;
  topCostDrivers: Array<{
    category: string;
    cost: number;
    percentage: number;
  }>;
}

export default function SuperAdminCostCounter() {
  const { toast } = useToast();
  
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [costCategories, setCostCategories] = useState<CostCategory[]>([]);
  const [employeeCosts, setEmployeeCosts] = useState<EmployeeCostData[]>([]);
  const [projectCosts, setProjectCosts] = useState<ProjectCostData[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeCostMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadCostData();
    
    if (autoRefresh) {
      const interval = setInterval(loadCostData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [selectedPeriod, selectedDepartment, autoRefresh]);

  const loadCostData = async () => {
    setIsLoading(true);
    try {
      // Simulate API calls - replace with actual data fetching
      await Promise.all([
        loadCostCategories(),
        loadEmployeeCostData(),
        loadProjectCostData(),
        loadRealTimeMetrics()
      ]);
    } catch (error) {
      toast({
        title: "Error Loading Cost Data",
        description: "Failed to load cost information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCostCategories = async () => {
    // Mock data - replace with actual API call
    const categories: CostCategory[] = [
      {
        id: 'employee-costs',
        name: 'Employee Costs',
        totalCost: 125000,
        color: '#ff6b6b',
        subcategories: [
          { name: 'Compliance Violations', cost: 45000, trend: 15 },
          { name: 'Training Costs', cost: 25000, trend: -5 },
          { name: 'Turnover Costs', cost: 55000, trend: 8 }
        ]
      },
      {
        id: 'equipment-costs',
        name: 'Equipment & Maintenance',
        totalCost: 75000,
        color: '#4ecdc4',
        subcategories: [
          { name: 'Equipment Damage', cost: 30000, trend: 12 },
          { name: 'Maintenance Overruns', cost: 25000, trend: -3 },
          { name: 'Downtime Costs', cost: 20000, trend: 6 }
        ]
      },
      {
        id: 'project-overruns',
        name: 'Project Overruns',
        totalCost: 95000,
        color: '#45b7d1',
        subcategories: [
          { name: 'Schedule Delays', cost: 40000, trend: 20 },
          { name: 'Quality Issues', cost: 35000, trend: 10 },
          { name: 'Resource Overages', cost: 20000, trend: 5 }
        ]
      },
      {
        id: 'safety-incidents',
        name: 'Safety & Compliance',
        totalCost: 35000,
        color: '#f7b731',
        subcategories: [
          { name: 'Incident Costs', cost: 15000, trend: -10 },
          { name: 'Regulatory Fines', cost: 12000, trend: 25 },
          { name: 'Insurance Increases', cost: 8000, trend: 5 }
        ]
      }
    ];

    setCostCategories(categories);
  };

  const loadEmployeeCostData = async () => {
    // Mock data - replace with actual API call
    const employees: EmployeeCostData[] = [
      {
        employeeId: 'emp-001',
        employeeName: 'John Smith',
        department: 'Operations',
        position: 'Equipment Operator',
        totalNegativeCost: 15000,
        totalPositiveCost: 5000,
        netCost: -10000,
        riskLevel: 'high',
        recentEvents: [
          { date: '2024-01-15', type: 'Equipment Damage', cost: 3000, description: 'Damaged excavator bucket' },
          { date: '2024-01-10', type: 'Safety Violation', cost: 500, description: 'PPE violation' }
        ],
        categories: {
          'Equipment': 8000,
          'Safety': 3000,
          'Quality': 2000,
          'Attendance': 2000
        }
      },
      {
        employeeId: 'emp-002',
        employeeName: 'Sarah Johnson',
        department: 'Quality Control',
        position: 'QC Inspector',
        totalNegativeCost: 5000,
        totalPositiveCost: 12000,
        netCost: 7000,
        riskLevel: 'low',
        recentEvents: [
          { date: '2024-01-12', type: 'Quality Achievement', cost: -1000, description: 'Zero defect milestone' }
        ],
        categories: {
          'Quality': -3000,
          'Training': 2000
        }
      }
    ];

    setEmployeeCosts(employees);
  };

  const loadProjectCostData = async () => {
    // Mock data - replace with actual API call
    const projects: ProjectCostData[] = [
      {
        projectId: 'proj-001',
        projectName: 'Highway Resurfacing - Route 95',
        budgetedCost: 500000,
        actualCost: 575000,
        variance: 75000,
        variancePercentage: 15,
        employeeCosts: 225000,
        materialCosts: 200000,
        equipmentCosts: 100000,
        overheadCosts: 50000
      },
      {
        projectId: 'proj-002',
        projectName: 'Parking Lot Sealcoating - Mall Complex',
        budgetedCost: 125000,
        actualCost: 118000,
        variance: -7000,
        variancePercentage: -5.6,
        employeeCosts: 45000,
        materialCosts: 50000,
        equipmentCosts: 18000,
        overheadCosts: 5000
      }
    ];

    setProjectCosts(projects);
  };

  const loadRealTimeMetrics = async () => {
    // Mock data - replace with actual API call
    const metrics: RealTimeCostMetrics = {
      totalDailyCost: 12500,
      hourlyBurnRate: 1560,
      projectedMonthlyCost: 387500,
      costPerEmployee: 2840,
      efficiencyRating: 78.5,
      topCostDrivers: [
        { category: 'Employee Violations', cost: 45000, percentage: 35 },
        { category: 'Equipment Issues', cost: 30000, percentage: 23 },
        { category: 'Project Delays', cost: 25000, percentage: 19 },
        { category: 'Safety Incidents', cost: 15000, percentage: 12 },
        { category: 'Other', cost: 14000, percentage: 11 }
      ]
    };

    setRealTimeMetrics(metrics);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const exportCostReport = () => {
    // Generate comprehensive cost report
    const reportData = {
      summary: {
        totalCost: costCategories.reduce((sum, cat) => sum + cat.totalCost, 0),
        period: selectedPeriod,
        department: selectedDepartment,
        generatedAt: new Date().toISOString()
      },
      categories: costCategories,
      employees: employeeCosts,
      projects: projectCosts,
      realTimeMetrics
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cost-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Report Exported",
      description: "Cost report has been downloaded successfully."
    });
  };

  const costTrendData = costCategories.map(cat => ({
    name: cat.name,
    cost: cat.totalCost,
    trend: cat.subcategories.reduce((avg, sub) => avg + sub.trend, 0) / cat.subcategories.length
  }));

  const pieData = costCategories.map(cat => ({
    name: cat.name,
    value: cat.totalCost,
    color: cat.color
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading cost data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Cost Counter</h1>
          <p className="text-muted-foreground">Comprehensive business cost tracking and analysis</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
              <SelectItem value="quality">Quality Control</SelectItem>
              <SelectItem value="safety">Safety</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadCostData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportCostReport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      {realTimeMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Daily Cost</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(realTimeMetrics.totalDailyCost)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hourly Burn Rate</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(realTimeMetrics.hourlyBurnRate)}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Projected Monthly</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(realTimeMetrics.projectedMonthlyCost)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cost per Employee</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(realTimeMetrics.costPerEmployee)}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Efficiency Rating</p>
                  <p className="text-2xl font-bold text-green-600">{realTimeMetrics.efficiencyRating}%</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employee Costs</TabsTrigger>
          <TabsTrigger value="projects">Project Costs</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Cost Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Cost Drivers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Top Cost Drivers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {realTimeMetrics?.topCostDrivers.map((driver, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{driver.category}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={driver.percentage} className="flex-1 h-2" />
                        <span className="text-sm text-muted-foreground">{driver.percentage}%</span>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-bold text-red-600">{formatCurrency(driver.cost)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Cost Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Cost Trends by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'cost' ? formatCurrency(value as number) : `${value}%`,
                      name === 'cost' ? 'Total Cost' : 'Trend'
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="cost" fill="#8884d8" name="Cost" />
                  <Bar yAxisId="right" dataKey="trend" fill="#82ca9d" name="Trend %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employee Cost Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employeeCosts
                  .sort((a, b) => b.totalNegativeCost - a.totalNegativeCost)
                  .map((employee) => (
                  <div key={employee.employeeId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{employee.employeeName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {employee.position} - {employee.department}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRiskBadgeColor(employee.riskLevel)}>
                          {employee.riskLevel.toUpperCase()}
                        </Badge>
                        <div className="text-right">
                          <p className="font-bold text-red-600">
                            -{formatCurrency(employee.totalNegativeCost)}
                          </p>
                          <p className="text-sm text-green-600">
                            +{formatCurrency(employee.totalPositiveCost)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Net: {employee.netCost < 0 ? '-' : '+'}{formatCurrency(Math.abs(employee.netCost))}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Cost Categories */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                      {Object.entries(employee.categories).map(([category, cost]) => (
                        <div key={category} className="text-center p-2 bg-muted rounded">
                          <p className="text-xs font-medium">{category}</p>
                          <p className={`text-sm font-bold ${cost < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {cost < 0 ? '-' : '+'}{formatCurrency(Math.abs(cost))}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Recent Events */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Recent Events:</p>
                      {employee.recentEvents.slice(0, 3).map((event, index) => (
                        <div key={index} className="flex justify-between text-sm p-2 bg-muted rounded">
                          <span>{event.type} - {event.description}</span>
                          <span className={event.cost < 0 ? 'text-green-600' : 'text-red-600'}>
                            {event.cost < 0 ? '+' : '-'}{formatCurrency(Math.abs(event.cost))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Project Cost Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectCosts.map((project) => (
                  <div key={project.projectId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{project.projectName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Budgeted: {formatCurrency(project.budgetedCost)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(project.actualCost)}</p>
                        <p className={`text-sm ${project.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {project.variance > 0 ? '+' : ''}{formatCurrency(project.variance)} 
                          ({project.variancePercentage > 0 ? '+' : ''}{project.variancePercentage}%)
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="text-center p-2 bg-muted rounded">
                        <p className="text-xs font-medium">Employee Costs</p>
                        <p className="text-sm font-bold">{formatCurrency(project.employeeCosts)}</p>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <p className="text-xs font-medium">Material Costs</p>
                        <p className="text-sm font-bold">{formatCurrency(project.materialCosts)}</p>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <p className="text-xs font-medium">Equipment Costs</p>
                        <p className="text-sm font-bold">{formatCurrency(project.equipmentCosts)}</p>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <p className="text-xs font-medium">Overhead</p>
                        <p className="text-sm font-bold">{formatCurrency(project.overheadCosts)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {costCategories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{category.name}</span>
                    <span className="text-2xl font-bold text-red-600">
                      {formatCurrency(category.totalCost)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.subcategories.map((sub, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{sub.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={sub.trend > 0 ? 'destructive' : 'default'}>
                            {sub.trend > 0 ? '+' : ''}{sub.trend}%
                          </Badge>
                          <span className="font-medium">{formatCurrency(sub.cost)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost per Employee Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Cost per Employee</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={employeeCosts.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="employeeName" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="totalNegativeCost" fill="#ff6b6b" name="Negative Cost" />
                    <Bar dataKey="totalPositiveCost" fill="#51cf66" name="Positive Cost" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Efficiency Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Efficiency Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Overall Efficiency</span>
                    <span className="font-bold">{realTimeMetrics?.efficiencyRating}%</span>
                  </div>
                  <Progress value={realTimeMetrics?.efficiencyRating} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Cost Control</span>
                    <span className="font-bold">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Employee Performance</span>
                    <span className="font-bold">82%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Project Efficiency</span>
                    <span className="font-bold">74%</span>
                  </div>
                  <Progress value={74} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}