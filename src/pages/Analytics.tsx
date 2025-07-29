import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import PredictiveAnalytics from '@/components/PredictiveAnalytics';
import { PerformanceDashboard } from '@/components/PerformanceDashboard';
import { 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Target, 
  Activity, 
  Zap,
  PieChart,
  LineChart,
  Users,
  AlertTriangle
} from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Advanced Analytics</h1>
            <p className="text-muted-foreground">
              Predictive intelligence and performance insights for pavement operations
            </p>
          </div>
        </div>

        {/* Analytics Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Predictive Analytics
              </CardTitle>
              <CardDescription>
                AI-powered predictions for maintenance and project outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="default">Active</Badge>
                <Badge variant="secondary">ML Enabled</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance Tracking
              </CardTitle>
              <CardDescription>
                Real-time monitoring of operational metrics and KPIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="default">Live Data</Badge>
                <Badge variant="secondary">24/7 Monitoring</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Cost Optimization
              </CardTitle>
              <CardDescription>
                Intelligent recommendations for reducing operational costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="default">Optimizing</Badge>
                <Badge variant="secondary">15% Savings</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Risk Assessment
              </CardTitle>
              <CardDescription>
                Proactive identification and mitigation of project risks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="default">Monitoring</Badge>
                <Badge variant="secondary">3 Alerts</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="predictive" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Predictive
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Real-Time Performance Dashboard
                </CardTitle>
                <CardDescription>
                  Monitor key performance indicators, equipment utilization, and project metrics in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Predictive Intelligence Engine
                </CardTitle>
                <CardDescription>
                  AI-powered predictions for equipment maintenance, project outcomes, and cost optimization.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PredictiveAnalytics />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Smart Recommendations
                  </CardTitle>
                  <CardDescription>
                    AI-generated insights and optimization recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <h4 className="font-medium">Fuel Optimization</h4>
                      <Badge variant="default">High Impact</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Optimizing route planning could reduce fuel costs by 15% and save approximately $2,800 per month.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <h4 className="font-medium">Crew Scheduling</h4>
                      <Badge variant="secondary">Medium Impact</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Adjusting crew schedules based on project complexity could improve productivity by 12%.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <h4 className="font-medium">Equipment Maintenance</h4>
                      <Badge variant="destructive">Urgent</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Asphalt Paver #1 shows signs of increased wear. Schedule maintenance within 5 days to prevent breakdown.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Optimization Opportunities
                  </CardTitle>
                  <CardDescription>
                    Data-driven opportunities for process improvement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Material Ordering</h4>
                      <p className="text-sm text-muted-foreground">Bulk purchasing optimization</p>
                    </div>
                    <Badge variant="default">8% Savings</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Project Sequencing</h4>
                      <p className="text-sm text-muted-foreground">Geographic clustering optimization</p>
                    </div>
                    <Badge variant="default">12% Time Savings</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Weather Planning</h4>
                      <p className="text-sm text-muted-foreground">Advanced weather-based scheduling</p>
                    </div>
                    <Badge variant="default">22% Less Delays</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Quality Control</h4>
                      <p className="text-sm text-muted-foreground">Predictive quality assurance</p>
                    </div>
                    <Badge variant="default">95% Quality Score</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Monthly Performance Report
                  </CardTitle>
                  <CardDescription>
                    Comprehensive monthly analysis of all operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Projects Completed</span>
                      <span className="font-medium">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">On-Time Delivery</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Revenue</span>
                      <span className="font-medium">$445,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Profit Margin</span>
                      <span className="font-medium">30.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Cost Analysis Report
                  </CardTitle>
                  <CardDescription>
                    Detailed breakdown of operational costs and savings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Material Costs</span>
                      <span className="font-medium">$125,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Labor Costs</span>
                      <span className="font-medium">$85,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Equipment Costs</span>
                      <span className="font-medium">$45,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Savings</span>
                      <span className="font-medium text-green-600">$43,100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Efficiency Report
                  </CardTitle>
                  <CardDescription>
                    Equipment and crew efficiency analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Equipment Utilization</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Crew Productivity</span>
                      <span className="font-medium">112%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Fuel Efficiency</span>
                      <span className="font-medium">94%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Overall Efficiency</span>
                      <span className="font-medium">91%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Automated Report Generation</CardTitle>
                <CardDescription>
                  Schedule and customize automated reports for stakeholders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  **Note: Advanced Reporting API Required** - Automated report generation and scheduling would require additional API integrations for email delivery and report formatting.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}