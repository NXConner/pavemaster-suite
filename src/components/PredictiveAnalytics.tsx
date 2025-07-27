import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
  Zap,
  Brain,
  Target,
  Calendar,
  Wrench
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  performance: {
    projectsCompleted: number;
    onTimeDelivery: number;
    costEfficiency: number;
    qualityScore: number;
  };
  predictions: {
    equipmentMaintenance: Array<{
      id: string;
      name: string;
      riskLevel: 'low' | 'medium' | 'high';
      daysUntilMaintenance: number;
      confidence: number;
    }>;
    projectDelays: Array<{
      projectId: string;
      name: string;
      delayRisk: number;
      factors: string[];
    }>;
    costOverruns: Array<{
      projectId: string;
      name: string;
      overrunRisk: number;
      estimatedOverrun: number;
    }>;
  };
  trends: {
    monthlyRevenue: Array<{
      month: string;
      revenue: number;
      target: number;
    }>;
    projectEfficiency: Array<{
      month: string;
      efficiency: number;
      industry: number;
    }>;
    costSavings: Array<{
      category: string;
      savings: number;
      potential: number;
    }>;
  };
  insights: Array<{
    id: string;
    type: 'optimization' | 'warning' | 'opportunity';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    actionRequired: boolean;
  }>;
}

interface PredictiveAnalyticsProps {
  className?: string;
}

export function PredictiveAnalytics({ className = "" }: PredictiveAnalyticsProps) {
  const { toast } = useToast();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from your analytics API
      // For now, we'll simulate the data
      const mockData: AnalyticsData = {
        performance: {
          projectsCompleted: 24,
          onTimeDelivery: 87,
          costEfficiency: 94,
          qualityScore: 91
        },
        predictions: {
          equipmentMaintenance: [
            {
              id: 'eq-001',
              name: 'Asphalt Paver #1',
              riskLevel: 'high',
              daysUntilMaintenance: 5,
              confidence: 89
            },
            {
              id: 'eq-002',
              name: 'Roller Compactor #2',
              riskLevel: 'medium',
              daysUntilMaintenance: 14,
              confidence: 76
            },
            {
              id: 'eq-003',
              name: 'Truck #3',
              riskLevel: 'low',
              daysUntilMaintenance: 45,
              confidence: 92
            }
          ],
          projectDelays: [
            {
              projectId: 'proj-001',
              name: 'Church Parking Lot Repair',
              delayRisk: 23,
              factors: ['Weather conditions', 'Material delivery']
            },
            {
              projectId: 'proj-002',
              name: 'Highway Sealcoating',
              delayRisk: 67,
              factors: ['Traffic restrictions', 'Equipment availability']
            }
          ],
          costOverruns: [
            {
              projectId: 'proj-002',
              name: 'Highway Sealcoating',
              overrunRisk: 45,
              estimatedOverrun: 8500
            }
          ]
        },
        trends: {
          monthlyRevenue: [
            { month: 'Jan', revenue: 85000, target: 80000 },
            { month: 'Feb', revenue: 92000, target: 85000 },
            { month: 'Mar', revenue: 78000, target: 85000 },
            { month: 'Apr', revenue: 88000, target: 90000 },
            { month: 'May', revenue: 95000, target: 90000 },
            { month: 'Jun', revenue: 102000, target: 95000 }
          ],
          projectEfficiency: [
            { month: 'Jan', efficiency: 85, industry: 82 },
            { month: 'Feb', efficiency: 88, industry: 83 },
            { month: 'Mar', efficiency: 82, industry: 81 },
            { month: 'Apr', efficiency: 91, industry: 84 },
            { month: 'May', efficiency: 94, industry: 85 },
            { month: 'Jun', efficiency: 96, industry: 86 }
          ],
          costSavings: [
            { category: 'Fuel Optimization', savings: 12500, potential: 18000 },
            { category: 'Route Planning', savings: 8200, potential: 15000 },
            { category: 'Equipment Efficiency', savings: 15600, potential: 22000 },
            { category: 'Material Waste', savings: 6800, potential: 12000 }
          ]
        },
        insights: [
          {
            id: '1',
            type: 'warning',
            title: 'Equipment Maintenance Alert',
            description: 'Asphalt Paver #1 requires immediate maintenance based on usage patterns',
            impact: 'high',
            actionRequired: true
          },
          {
            id: '2',
            type: 'optimization',
            title: 'Route Optimization Opportunity',
            description: 'Optimizing delivery routes could save 15% on fuel costs',
            impact: 'medium',
            actionRequired: false
          },
          {
            id: '3',
            type: 'opportunity',
            title: 'Seasonal Demand Spike',
            description: 'Church projects typically increase 40% in spring - prepare inventory',
            impact: 'high',
            actionRequired: false
          }
        ]
      };

      setData(mockData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    try {
      // Note: Would require AI API key
      toast({
        title: "AI Analysis",
        description: "AI insights would be generated with proper API configuration",
      });
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'optimization': return <Zap className="h-4 w-4 text-blue-500" />;
      case 'opportunity': return <Target className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-y-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading analytics...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.performance.projectsCompleted}</div>
            <p className="text-xs text-muted-foreground">This quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.performance.onTimeDelivery}%</div>
            <Progress value={data.performance.onTimeDelivery} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Efficiency</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.performance.costEfficiency}%</div>
            <Progress value={data.performance.costEfficiency} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.performance.qualityScore}%</div>
            <Progress value={data.performance.qualityScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue vs Target</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.trends.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="target" stackId="2" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted))" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Efficiency vs Industry</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.trends.projectEfficiency}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="efficiency" stroke="hsl(var(--primary))" name="Our Performance" />
                    <Line type="monotone" dataKey="industry" stroke="hsl(var(--muted-foreground))" name="Industry Average" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Equipment Maintenance Predictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.predictions.equipmentMaintenance.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.daysUntilMaintenance} days until maintenance
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={item.riskLevel === 'high' ? 'destructive' : item.riskLevel === 'medium' ? 'secondary' : 'default'}>
                        {item.riskLevel} risk
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.confidence}% confidence
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Project Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.predictions.projectDelays.map((item) => (
                  <div key={item.projectId} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{item.name}</p>
                      <Badge variant={item.delayRisk > 50 ? 'destructive' : 'secondary'}>
                        {item.delayRisk}% delay risk
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.factors.map((factor, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Savings Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.trends.costSavings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                  <Legend />
                  <Bar dataKey="savings" fill="hsl(var(--primary))" name="Achieved Savings" />
                  <Bar dataKey="potential" fill="hsl(var(--muted))" name="Potential Savings" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">AI-Generated Insights</h3>
            <Button onClick={generateInsights} className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Generate New Insights
            </Button>
          </div>

          <div className="space-y-4">
            {data.insights.map((insight) => (
              <Card key={insight.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'secondary' : 'default'}>
                            {insight.impact} impact
                          </Badge>
                          {insight.actionRequired && (
                            <Badge variant="outline">Action Required</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}