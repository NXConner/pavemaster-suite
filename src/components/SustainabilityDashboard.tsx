// PHASE 13: Sustainability Dashboard Component
// Comprehensive dashboard for environmental monitoring, sustainability tracking, and green practices management
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Leaf, 
  Droplets, 
  Zap, 
  Recycle, 
  TreePine, 
  Wind, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Download,
  RefreshCw,
  Settings,
  FileText,
  Award,
  Globe,
  Factory,
  Car,
  Home,
  Lightbulb,
  ThermometerSun,
  CloudRain
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { environmentalMonitoringService } from '@/services/environmentalMonitoringService';
import { type EnvironmentalProfile, type EnvironmentalGoal, type CarbonFootprint } from '@/services/environmentalMonitoringService';

interface SustainabilityDashboardProps {
  organizationId: string;
  className?: string;
}

interface MetricCard {
  title: string;
  value: string | number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  icon: React.ReactNode;
  color: string;
  target?: number;
  status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
}

interface GoalProgress {
  id: string;
  title: string;
  progress: number;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  status: 'on_track' | 'at_risk' | 'behind' | 'achieved';
  category: string;
}

interface InitiativeStatus {
  id: string;
  name: string;
  status: 'planning' | 'implementation' | 'monitoring' | 'completed';
  progress: number;
  impact: string;
  cost: number;
  roi: number;
  completionDate: string;
}

const SustainabilityDashboard: React.FC<SustainabilityDashboardProps> = ({
  organizationId,
  className = ''
}) => {
  const [profile, setProfile] = useState<EnvironmentalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Mock data for demonstration
  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      title: 'Carbon Footprint',
      value: 450.5,
      unit: 'tons CO₂e',
      trend: 'down',
      trendValue: 13.4,
      icon: <Factory className="h-5 w-5" />,
      color: 'text-green-600',
      target: 390.2,
      status: 'good'
    },
    {
      title: 'Water Usage',
      value: 15420,
      unit: 'gallons',
      trend: 'down',
      trendValue: 8.2,
      icon: <Droplets className="h-5 w-5" />,
      color: 'text-blue-600',
      status: 'excellent'
    },
    {
      title: 'Energy Consumption',
      value: 125.3,
      unit: 'MWh',
      trend: 'up',
      trendValue: 5.1,
      icon: <Zap className="h-5 w-5" />,
      color: 'text-yellow-600',
      status: 'needs_improvement'
    },
    {
      title: 'Waste Diversion',
      value: 78,
      unit: '%',
      trend: 'up',
      trendValue: 12.3,
      icon: <Recycle className="h-5 w-5" />,
      color: 'text-green-600',
      status: 'excellent'
    },
    {
      title: 'Renewable Energy',
      value: 35,
      unit: '%',
      trend: 'up',
      trendValue: 25.0,
      icon: <Wind className="h-5 w-5" />,
      color: 'text-blue-600',
      status: 'good'
    },
    {
      title: 'Biodiversity Index',
      value: 8.2,
      unit: '/10',
      trend: 'stable',
      trendValue: 0.5,
      icon: <TreePine className="h-5 w-5" />,
      color: 'text-green-600',
      status: 'excellent'
    }
  ]);

  const [goals, setGoals] = useState<GoalProgress[]>([
    {
      id: 'carbon_neutral_2030',
      title: 'Carbon Neutral by 2030',
      progress: 13.4,
      target: 0,
      current: 450.5,
      unit: 'tons CO₂e',
      deadline: '2030-12-31',
      status: 'on_track',
      category: 'carbon_reduction'
    },
    {
      id: 'waste_diversion_2025',
      title: '90% Waste Diversion by 2025',
      progress: 86.7,
      target: 90,
      current: 78,
      unit: '%',
      deadline: '2025-12-31',
      status: 'on_track',
      category: 'waste_reduction'
    },
    {
      id: 'renewable_energy_2026',
      title: '50% Renewable Energy by 2026',
      progress: 70,
      target: 50,
      current: 35,
      unit: '%',
      deadline: '2026-12-31',
      status: 'on_track',
      category: 'energy_efficiency'
    }
  ]);

  const [initiatives, setInitiatives] = useState<InitiativeStatus[]>([
    {
      id: 'solar_installation',
      name: 'Solar Panel Installation',
      status: 'implementation',
      progress: 65,
      impact: 'Reduce carbon emissions by 120 tons CO₂e annually',
      cost: 85000,
      roi: 15,
      completionDate: '2024-06-30'
    },
    {
      id: 'fleet_electrification',
      name: 'Fleet Electrification Program',
      status: 'planning',
      progress: 25,
      impact: 'Reduce mobile emissions by 80 tons CO₂e annually',
      cost: 150000,
      roi: 12,
      completionDate: '2024-12-31'
    },
    {
      id: 'waste_reduction',
      name: 'Advanced Waste Reduction Technologies',
      status: 'monitoring',
      progress: 90,
      impact: 'Increase waste diversion to 85%',
      cost: 25000,
      roi: 25,
      completionDate: '2024-03-31'
    }
  ]);

  // Carbon emissions breakdown data
  const carbonBreakdownData = [
    { name: 'Vehicles', value: 155.8, color: '#8884d8' },
    { name: 'Equipment', value: 89.4, color: '#82ca9d' },
    { name: 'Materials', value: 124.5, color: '#ffc658' },
    { name: 'Energy', value: 58.9, color: '#ff7300' },
    { name: 'Transportation', value: 21.9, color: '#00ff88' }
  ];

  // Trends data
  const trendsData = [
    { month: 'Jan', carbon: 520, water: 16800, energy: 118 },
    { month: 'Feb', carbon: 510, water: 16200, energy: 115 },
    { month: 'Mar', carbon: 495, water: 15900, energy: 120 },
    { month: 'Apr', carbon: 480, water: 15600, energy: 125 },
    { month: 'May', carbon: 470, water: 15400, energy: 128 },
    { month: 'Jun', carbon: 451, water: 15420, energy: 125 }
  ];

  // Load environmental profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const envProfile = await environmentalMonitoringService.getEnvironmentalProfile(organizationId);
        
        if (envProfile) {
          setProfile(envProfile);
          setLastUpdated(envProfile.updatedAt);
        } else {
          // Create a sample profile for demonstration
          const newProfile = await environmentalMonitoringService.createEnvironmentalProfile({
            organizationId,
            facilityName: 'Green Pavement Solutions'
          });
          setProfile(newProfile);
          setLastUpdated(newProfile.updatedAt);
        }
      } catch (error) {
        console.error('Error loading environmental profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [organizationId]);

  // Refresh data
  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const updatedMetrics = await environmentalMonitoringService.monitorEnvironmentalMetrics(organizationId);
      setLastUpdated(new Date().toISOString());
      
      // Simulate metric updates
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: typeof metric.value === 'number' ? 
          metric.value + (Math.random() - 0.5) * 10 : 
          metric.value,
        trendValue: Math.random() * 20
      })));
      
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [organizationId]);

  // Generate sustainability report
  const handleGenerateReport = useCallback(async () => {
    try {
      const report = await environmentalMonitoringService.generateSustainabilityReport(organizationId, {
        period: 'annual',
        format: 'comprehensive'
      });
      
      // In a real app, this would trigger a download
      console.log('Generated sustainability report:', report);
      
      // Create mock download
      const reportData = JSON.stringify(report, null, 2);
      const blob = new Blob([reportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sustainability-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  }, [organizationId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'needs_improvement': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      case 'on_track': return 'text-green-600 bg-green-50';
      case 'at_risk': return 'text-yellow-600 bg-yellow-50';
      case 'behind': return 'text-red-600 bg-red-50';
      case 'achieved': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'achieved':
        return <CheckCircle className="h-4 w-4" />;
      case 'good':
      case 'on_track':
        return <TrendingUp className="h-4 w-4" />;
      case 'needs_improvement':
      case 'at_risk':
        return <Clock className="h-4 w-4" />;
      case 'critical':
      case 'behind':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Leaf className="h-8 w-8 text-green-600" />
            Sustainability Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Environmental impact monitoring and sustainability tracking for {profile?.facilityName || 'your organization'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateReport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-500">
        Last updated: {new Date(lastUpdated).toLocaleString()}
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-gray-50 ${metric.color}`}>
                  {metric.icon}
                </div>
                <Badge className={getStatusColor(metric.status)}>
                  {getStatusIcon(metric.status)}
                  <span className="ml-1 capitalize">{metric.status.replace('_', ' ')}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                  </span>
                  <span className="text-sm text-gray-600">{metric.unit}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : metric.trend === 'down' ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                  <span className={metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                    {metric.trendValue.toFixed(1)}% from last month
                  </span>
                </div>
                <p className="text-sm text-gray-600">{metric.title}</p>
                {metric.target && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Progress to target</span>
                      <span>{metric.target} {metric.unit}</span>
                    </div>
                    <Progress 
                      value={typeof metric.value === 'number' ? (metric.value / metric.target) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals & Targets</TabsTrigger>
          <TabsTrigger value="initiatives">Initiatives</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Carbon Footprint Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5" />
                  Carbon Footprint Breakdown
                </CardTitle>
                <CardDescription>
                  Distribution of carbon emissions by source category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={carbonBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {carbonBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} tons CO₂e`, 'Emissions']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Environmental Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Environmental Trends
                </CardTitle>
                <CardDescription>
                  Monthly trends for key environmental metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="carbon" stroke="#8884d8" strokeWidth={2} name="Carbon (tons CO₂e)" />
                      <Line type="monotone" dataKey="water" stroke="#82ca9d" strokeWidth={2} name="Water (gallons)" />
                      <Line type="monotone" dataKey="energy" stroke="#ffc658" strokeWidth={2} name="Energy (MWh)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
              <CardDescription>
                Latest sustainability milestones and accomplishments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">13.4% Carbon Reduction Achieved</h4>
                    <p className="text-sm text-green-700">Exceeded Q1 target by implementing equipment efficiency improvements</p>
                    <p className="text-xs text-green-600 mt-1">Completed 2 weeks ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">78% Waste Diversion Rate</h4>
                    <p className="text-sm text-blue-700">New recycling program increased diversion by 15%</p>
                    <p className="text-xs text-blue-600 mt-1">Completed 1 month ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900">ISO 14001 Certification Renewed</h4>
                    <p className="text-sm text-purple-700">Environmental management system certification maintained</p>
                    <p className="text-xs text-purple-600 mt-1">Completed 6 weeks ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals & Targets Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <Badge className={getStatusColor(goal.status)}>
                      {getStatusIcon(goal.status)}
                      <span className="ml-1 capitalize">{goal.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                  <CardDescription>
                    Target deadline: {new Date(goal.deadline).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Current: {goal.current} {goal.unit}</span>
                      <span>Target: {goal.target} {goal.unit}</span>
                    </div>
                    <Progress value={goal.progress} className="h-3" />
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{goal.progress.toFixed(1)}% complete</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {Math.round((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add New Goal Button */}
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Add New Sustainability Goal</h3>
                <p className="text-gray-600 mb-4">Set targets for carbon reduction, waste diversion, energy efficiency, and more.</p>
                <Button>
                  <Target className="h-4 w-4 mr-2" />
                  Create Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Initiatives Tab */}
        <TabsContent value="initiatives" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initiatives.map((initiative) => (
              <Card key={initiative.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{initiative.name}</CardTitle>
                    <Badge className={getStatusColor(initiative.status)}>
                      <span className="capitalize">{initiative.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                  <CardDescription>
                    Expected completion: {new Date(initiative.completionDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{initiative.progress}%</span>
                      </div>
                      <Progress value={initiative.progress} className="h-2" />
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900 mb-1">Expected Impact:</p>
                      <p>{initiative.impact}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">Investment</p>
                        <p className="text-gray-600">${initiative.cost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">ROI</p>
                        <p className="text-gray-600">{initiative.roi}%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add New Initiative Button */}
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center">
                <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Launch New Initiative</h3>
                <p className="text-gray-600 mb-4">Start a new sustainability project to reduce environmental impact.</p>
                <Button>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Create Initiative
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Energy Consumption Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Energy Consumption Analysis
                </CardTitle>
                <CardDescription>
                  Monthly energy usage and renewable energy contribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="energy" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Water Usage Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Water Usage Trends
                </CardTitle>
                <CardDescription>
                  Water consumption patterns and conservation efforts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="water" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Environmental Impact Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Environmental Impact Summary
              </CardTitle>
              <CardDescription>
                Comprehensive overview of environmental performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TreePine className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Carbon Offset</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">100</p>
                  <p className="text-sm text-green-700">tons CO₂e offset</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Water Saved</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">2,840</p>
                  <p className="text-sm text-blue-700">gallons this month</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Clean Energy</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-900">43.8</p>
                  <p className="text-sm text-yellow-700">MWh from renewables</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Recycle className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Waste Diverted</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">19.1</p>
                  <p className="text-sm text-purple-700">tons from landfill</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weather Impact Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudRain className="h-5 w-5" />
                Weather Impact Analysis
              </CardTitle>
              <CardDescription>
                How weather conditions affect environmental performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Current Conditions</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <ThermometerSun className="h-4 w-4 text-orange-500" />
                      <span>72°F</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span>65% humidity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-gray-500" />
                      <span>8 mph wind</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CloudRain className="h-4 w-4 text-gray-500" />
                      <span>0% precipitation</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Impact on Operations</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Solar generation</span>
                      <span className="text-green-600">Optimal</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Equipment efficiency</span>
                      <span className="text-green-600">High</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Water usage</span>
                      <span className="text-blue-600">Normal</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Air quality</span>
                      <span className="text-green-600">Good</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SustainabilityDashboard;