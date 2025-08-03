import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { 
  Building2,
  Users,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Database,
  Cloud,
  Zap,
  Settings,
  Lock,
  Shield,
  CheckCircle,
  AlertTriangle,
  Activity,
  Globe,
  DollarSign,
  Target,
  Briefcase
} from 'lucide-react';

export default function Enterprise() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [webhookUrl, setWebhookUrl] = useState('');

  const analyticsData = {
    revenue: { current: 285000, previous: 240000, growth: 18.8 },
    projects: { current: 45, previous: 38, growth: 18.4 },
    efficiency: { current: 94, previous: 87, growth: 8.0 },
    satisfaction: { current: 96, previous: 92, growth: 4.3 }
  };

  const integrations = [
    {
      name: 'QuickBooks Online',
      category: 'Accounting',
      status: 'connected',
      description: 'Financial data synchronization',
      lastSync: '2024-01-16T10:30:00Z'
    },
    {
      name: 'ADP Workforce',
      category: 'HR/Payroll',
      status: 'pending',
      description: 'Employee management and payroll',
      lastSync: null
    },
    {
      name: 'Microsoft Teams',
      category: 'Communication',
      status: 'connected',
      description: 'Team collaboration and messaging',
      lastSync: '2024-01-16T09:15:00Z'
    },
    {
      name: 'SAP Business One',
      category: 'ERP',
      status: 'disconnected',
      description: 'Enterprise resource planning',
      lastSync: '2024-01-14T16:22:00Z'
    },
    {
      name: 'Fleet Tracking Pro',
      category: 'GPS/Fleet',
      status: 'connected',
      description: 'Vehicle and equipment tracking',
      lastSync: '2024-01-16T10:45:00Z'
    }
  ];

  const kpiMetrics = [
    { name: 'Project Completion Rate', value: 94, target: 95, trend: 'up' },
    { name: 'Cost Variance', value: -2.1, target: 5.0, trend: 'down' },
    { name: 'Client Satisfaction', value: 4.7, target: 4.5, trend: 'up' },
    { name: 'Equipment Utilization', value: 87, target: 90, trend: 'up' },
    { name: 'Safety Score', value: 98, target: 95, trend: 'up' },
    { name: 'Profit Margin', value: 22.5, target: 20.0, trend: 'up' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'default';
      case 'pending': return 'secondary';
      case 'disconnected': return 'destructive';
      default: return 'outline';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="h-3 w-3 text-green-600" /> : 
      <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };


  const triggerZapier = async (enterpriseData: any) => {
    if (!webhookUrl) return;
    
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          event: 'enterprise_update',
          data: enterpriseData,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Zapier webhook failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise Analytics & Integrations</h1>
          <p className="text-muted-foreground">Advanced business intelligence and enterprise system integration</p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Configure Integrations
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="kpi">KPI Dashboard</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="business-intelligence">BI Reports</TabsTrigger>
          <TabsTrigger value="zapier">Zapier</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analyticsData.revenue.current)}</div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  +{analyticsData.revenue.growth}% from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Active Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.projects.current}</div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  +{analyticsData.projects.growth}% from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Efficiency Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.efficiency.current}%</div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  +{analyticsData.efficiency.growth}% from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Client Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.satisfaction.current}%</div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  +{analyticsData.satisfaction.growth}% from last month
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Revenue chart visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Project Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Project distribution chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kpi" className="space-y-6">
          <div className="grid gap-4">
            {kpiMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{metric.name}</h3>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(metric.trend)}
                      <span className="text-sm font-medium">
                        {metric.name.includes('Rate') || metric.name.includes('Score') || metric.name.includes('Utilization') 
                          ? `${metric.value}%` 
                          : metric.name.includes('Satisfaction')
                          ? metric.value.toFixed(1)
                          : metric.name.includes('Variance')
                          ? `${metric.value}%`
                          : `${metric.value}%`
                        }
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Progress 
                      value={metric.name.includes('Variance') ? Math.abs(metric.value) : metric.value} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Target: {
                        metric.name.includes('Satisfaction') 
                          ? metric.target.toFixed(1)
                          : `${metric.target}%`
                      }</span>
                      <span>
                        {metric.value >= metric.target ? 'Above Target' : 'Below Target'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          {integrations.map((integration, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription>{integration.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(integration.status)}>
                    {integration.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Category: {integration.category}</p>
                    <p className="text-xs text-muted-foreground">
                      Last sync: {integration.lastSync 
                        ? new Date(integration.lastSync).toLocaleString() 
                        : 'Never'
                      }
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                    {integration.status === 'connected' && (
                      <Button variant="outline" size="sm">
                        <Activity className="h-3 w-3 mr-1" />
                        Test
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="business-intelligence" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Executive Dashboard</CardTitle>
                <CardDescription>High-level business metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Quarterly Revenue Goal</span>
                    <span className="text-green-600 font-bold">112% achieved</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Project Pipeline</span>
                    <span className="text-blue-600 font-bold">$1.2M pending</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium">Team Utilization</span>
                    <span className="text-purple-600 font-bold">94% capacity</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Predictive Analytics</CardTitle>
                <CardDescription>AI-powered business forecasting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">Next Month Forecast</p>
                    <p className="text-sm text-muted-foreground">Expected revenue: $95K (+15%)</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">Equipment Maintenance</p>
                    <p className="text-sm text-muted-foreground">Paver #2 due for service in 5 days</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">Resource Optimization</p>
                    <p className="text-sm text-muted-foreground">Recommend hiring 1 operator</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="zapier" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Enterprise Zapier Integration
              </CardTitle>
              <CardDescription>Automate enterprise workflows and data pipelines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Zapier Webhook URL</Label>
                <Input
                  id="webhook-url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                />
              </div>
              <Button 
                className="w-full"
                onClick={() => triggerZapier({ 
                  analytics: analyticsData,
                  kpis: kpiMetrics,
                  integrations: integrations 
                })}
                disabled={!webhookUrl}
              >
                <Zap className="h-4 w-4 mr-2" />
                Test Integration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}