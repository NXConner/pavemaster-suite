
import { useState } from 'react';
import { DashboardLayout } from '../components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Truck, 
  Users, 
  Calendar,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap
} from 'lucide-react';

// Sample data - in production this would come from your API
const revenueData = [
  { month: 'Jan', revenue: 45000, projects: 12, profit: 8500 },
  { month: 'Feb', revenue: 52000, projects: 15, profit: 11200 },
  { month: 'Mar', revenue: 48000, projects: 13, profit: 9600 },
  { month: 'Apr', revenue: 61000, projects: 18, profit: 13400 },
  { month: 'May', revenue: 68000, projects: 21, profit: 16200 },
  { month: 'Jun', revenue: 72000, projects: 24, profit: 18500 },
];

const projectTypeData = [
  { name: 'Parking Lots', value: 45, color: '#8884d8' },
  { name: 'Driveways', value: 30, color: '#82ca9d' },
  { name: 'Road Repairs', value: 15, color: '#ffc658' },
  { name: 'Sealcoating', value: 10, color: '#ff7300' },
];

const equipmentUtilization = [
  { equipment: 'Paver #1', utilization: 85, status: 'Active' },
  { equipment: 'Roller #1', utilization: 92, status: 'Active' },
  { equipment: 'Truck #1', utilization: 78, status: 'Maintenance' },
  { equipment: 'Compactor', utilization: 65, status: 'Active' },
  { equipment: 'Paver #2', utilization: 71, status: 'Active' },
];

const crewPerformance = [
  { crew: 'Alpha Team', efficiency: 94, projects: 8, avgTime: '2.3 days' },
  { crew: 'Beta Team', efficiency: 87, projects: 6, avgTime: '2.8 days' },
  { crew: 'Gamma Team', efficiency: 91, projects: 7, avgTime: '2.5 days' },
];

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  // Calculate KPIs
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalProjects = revenueData.reduce((sum, item) => sum + item.projects, 0);
  const avgProjectValue = totalRevenue / totalProjects;
  const profitMargin = ((revenueData.reduce((sum, item) => sum + item.profit, 0) / totalRevenue) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Business intelligence and performance metrics for your paving operations
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                +12.5% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                +8 new this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Project Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Math.round(avgProjectValue).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingDown className="inline h-3 w-3 mr-1 text-red-500" />
                -2.1% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profitMargin.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                +0.8% from last period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="crew">Crew Performance</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>
                    Monthly revenue and project count over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [
                        name === 'revenue' ? `$${value.toLocaleString()}` : value,
                        name === 'revenue' ? 'Revenue' : 'Projects'
                      ]} />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stackId="1"
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Project Types</CardTitle>
                  <CardDescription>
                    Distribution of project types this period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={projectTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {projectTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Performance</CardTitle>
                <CardDescription>
                  Monthly project completion and revenue metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="projects" fill="#8884d8" name="Projects Completed" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Utilization</CardTitle>
                <CardDescription>
                  Current utilization rates and status of all equipment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {equipmentUtilization.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Truck className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{item.equipment}</p>
                          <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32">
                          <Progress value={item.utilization} className="h-2" />
                        </div>
                        <span className="text-sm font-medium w-12">{item.utilization}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crew" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Crew Performance</CardTitle>
                <CardDescription>
                  Efficiency metrics and project completion rates by crew
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {crewPerformance.map((crew, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{crew.crew}</h4>
                        <Badge variant="outline">{crew.efficiency}% Efficiency</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Projects</p>
                          <p className="font-medium">{crew.projects}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Completion</p>
                          <p className="font-medium">{crew.avgTime}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rating</p>
                          <div className="flex items-center">
                            <Progress value={crew.efficiency} className="h-2 w-16" />
                            <span className="ml-2 text-xs">{crew.efficiency}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Performance</CardTitle>
                <CardDescription>
                  Revenue, profit, and cost analysis over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Profit"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Generate reports and export data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Monthly Report
              </Button>
              <Button variant="outline" size="sm">
                <PieChartIcon className="h-4 w-4 mr-2" />
                Export Charts
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Report
              </Button>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Share Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}