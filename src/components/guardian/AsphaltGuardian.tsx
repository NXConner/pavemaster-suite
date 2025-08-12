import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Eye,
  Thermometer,
  CloudRain,
  Wind,
  Clock,
  Camera,
  Gauge,
  MapPin,
  Zap,
  Activity,
  TrendingUp,
} from 'lucide-react';

export const AsphaltGuardian = () => {
  const [activeMonitoring, setActiveMonitoring] = useState(true);

  const qualityMetrics = [
    {
      name: 'Surface Temperature',
      value: 68,
      unit: '°F',
      status: 'optimal',
      range: '50-85°F',
      icon: Thermometer,
    },
    {
      name: 'Humidity Level',
      value: 45,
      unit: '%',
      status: 'good',
      range: '30-70%',
      icon: CloudRain,
    },
    {
      name: 'Wind Speed',
      value: 8,
      unit: 'mph',
      status: 'acceptable',
      range: '0-15 mph',
      icon: Wind,
    },
    {
      name: 'Compaction Level',
      value: 96,
      unit: '%',
      status: 'optimal',
      range: '95-100%',
      icon: Gauge,
    },
  ];

  const complianceChecks = [
    { name: 'DOT Standards', status: 'compliant', lastCheck: '2 hours ago' },
    { name: 'Environmental Regs', status: 'compliant', lastCheck: '4 hours ago' },
    { name: 'Safety Protocols', status: 'warning', lastCheck: '6 hours ago' },
    { name: 'Quality Specs', status: 'compliant', lastCheck: '1 hour ago' },
  ];

  const inspectionAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Temperature Deviation',
      description: 'Surface temperature approaching upper limit in Section B',
      time: '5 minutes ago',
      priority: 'medium',
    },
    {
      id: 2,
      type: 'info',
      title: 'Compaction Complete',
      description: 'Section A compaction meets specifications',
      time: '15 minutes ago',
      priority: 'low',
    },
    {
      id: 3,
      type: 'alert',
      title: 'Material Quality Check',
      description: 'Requires immediate inspection in Section C',
      time: '25 minutes ago',
      priority: 'high',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'acceptable': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      case 'compliant': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'non-compliant': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'optimal':
      case 'compliant':
        return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>;
      case 'acceptable':
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
      case 'poor':
      case 'non-compliant':
        return <Badge className="bg-red-100 text-red-800">{status}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Asphalt Guardian</h1>
          <p className="text-muted-foreground">Real-time quality monitoring and compliance tracking</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge
            variant={activeMonitoring ? 'default' : 'secondary'}
            className="gap-2"
          >
            <div className={`w-2 h-2 rounded-full ${activeMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            {activeMonitoring ? 'Active Monitoring' : 'Monitoring Paused'}
          </Badge>
          <Button
            onClick={() => { setActiveMonitoring(!activeMonitoring); }}
            variant={activeMonitoring ? 'outline' : 'default'}
          >
            {activeMonitoring ? 'Pause' : 'Start'} Monitoring
          </Button>
        </div>
      </div>

      <Tabs defaultValue="monitoring" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {qualityMetrics.map((metric, index) => (
              <Card key={index} className="relative">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <metric.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value}{metric.unit}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    {getStatusBadge(metric.status)}
                    <span className="text-xs text-muted-foreground">{metric.range}</span>
                  </div>
                  <Progress
                    value={metric.value}
                    className="mt-3"
                    max={metric.name === 'Compaction Level' ? 100 : metric.name === 'Surface Temperature' ? 120 : 100}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Monitoring Feed
              </CardTitle>
              <CardDescription>
                Real-time updates from field sensors and equipment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inspectionAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    {getPriorityIcon(alert.priority)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{alert.title}</h4>
                        <span className="text-xs text-muted-foreground">{alert.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance Status
                </CardTitle>
                <CardDescription>
                  Current compliance with industry standards and regulations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceChecks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{check.name}</span>
                        <p className="text-xs text-muted-foreground">Last checked: {check.lastCheck}</p>
                      </div>
                      {getStatusBadge(check.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Compliance Alerts
                </CardTitle>
                <CardDescription>
                  Issues requiring attention for regulatory compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Safety protocol review required for Section C due to temperature warnings.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    • All DOT standards currently met
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • Environmental compliance active
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • Quality specifications within range
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inspections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Inspection Dashboard
              </CardTitle>
              <CardDescription>
                Comprehensive inspection tracking and documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">24</div>
                  <div className="text-sm text-muted-foreground">Inspections Passed</div>
                </div>
                <div className="text-center p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-yellow-600">3</div>
                  <div className="text-sm text-muted-foreground">Pending Review</div>
                </div>
                <div className="text-center p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-red-600">1</div>
                  <div className="text-sm text-muted-foreground">Failed Inspections</div>
                </div>
              </div>

              <div className="space-y-4">
                {inspectionAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-4 rounded-lg border">
                    {getPriorityIcon(alert.priority)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge variant="outline">{alert.priority} priority</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{alert.time}</span>
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm" variant="outline">Mark Resolved</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quality Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">94.5%</div>
                <p className="text-sm text-muted-foreground">Average quality score</p>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>This month</span>
                    <span>+2.3%</span>
                  </div>
                  <Progress value={94.5} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Efficiency Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">87.2%</div>
                <p className="text-sm text-muted-foreground">Operational efficiency</p>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>This month</span>
                    <span>+5.1%</span>
                  </div>
                  <Progress value={87.2} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Compliance Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">98.7%</div>
                <p className="text-sm text-muted-foreground">Regulatory compliance</p>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>This month</span>
                    <span>+0.8%</span>
                  </div>
                  <Progress value={98.7} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>
                AI-powered recommendations for improving quality and efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <h4 className="font-medium text-green-800">Optimization Opportunity</h4>
                  <p className="text-sm text-green-700">
                    Temperature control in Section B has improved 15% this week. Consider applying
                    the same techniques to other sections.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <h4 className="font-medium text-blue-800">Efficiency Gain</h4>
                  <p className="text-sm text-blue-700">
                    Implementing predictive maintenance reduced equipment downtime by 22%.
                    Schedule next maintenance cycle proactively.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                  <h4 className="font-medium text-yellow-800">Attention Required</h4>
                  <p className="text-sm text-yellow-700">
                    Weather conditions may affect operations tomorrow. Review contingency plans
                    and material storage protocols.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};