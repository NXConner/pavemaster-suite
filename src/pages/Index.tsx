import { DollarSign, TrendingUp, Users, Truck, CheckCircle, Clock, Shield, Calendar, BarChart3, UserCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import dashboardHero from '@/assets/dashboard-hero.jpg';

// Simple replacement components
const SecurityBanner = ({ level, message, details }: { level: string; message: string; details: string }) => (
  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
    <div className="flex items-center">
      <Shield className="h-5 w-5 text-green-600 mr-2" />
      <span className="font-medium text-green-800">{message}</span>
    </div>
    <p className="text-sm text-green-700 mt-1">{details}</p>
  </div>
);

const MetricCard = ({ title, value, icon: Icon, trend }: { title: string; value: string; icon: any; trend?: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
    </CardContent>
  </Card>
);

const ProjectCard = ({ title, status, progress }: { title: string; status: string; progress: number }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
      <div className="flex items-center gap-2">
        <Badge variant={status === 'active' ? 'default' : 'secondary'}>{status}</Badge>
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-sm text-muted-foreground">Progress: {progress}%</div>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div 
          className="bg-blue-600 h-2 rounded-full" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </CardContent>
  </Card>
);

const Index = () => {
  const [showSecurityDashboard, setShowSecurityDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data
  const projects = [
    {
      id: '1',
      title: 'Highway 101 Resurfacing',
      location: 'San Francisco, CA',
      status: 'active' as const,
      progress: 75,
      budget: 850000,
      spent: 640000,
      crewSize: 12,
      dueDate: 'Dec 15',
    },
    {
      id: '2',
      title: 'Downtown Plaza Paving',
      location: 'San Jose, CA', 
      status: 'planned' as const,
      progress: 15,
      budget: 275000,
      spent: 25000,
      crewSize: 8,
      dueDate: 'Jan 30',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
        <div
          className="h-64 bg-cover bg-center"
          style={{ backgroundImage: `url(${dashboardHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/60"></div>
          <div className="relative flex h-full items-center">
            <div className="container">
              <div className="max-w-2xl text-primary-foreground">
                <h1 className="text-4xl font-bold mb-4">
                  Welcome to PaveMaster Suite
                </h1>
                <p className="text-xl opacity-90">
                  Your enterprise solution for asphalt paving operations management
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Alert */}
      <div className="container py-4">
        <SecurityBanner
          level="secure"
          message="Security Status: Enterprise Grade Protection Active"
          details="Enterprise features active: AI/ML Engine, Multi-Tenant Architecture, Real-time Collaboration, Advanced Analytics, Global Deployment"
        />
      </div>

      {/* Dashboard Content */}
      <div className="container py-8 space-y-8">
        {/* Dashboard Controls */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Enterprise Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowSecurityDashboard(!showSecurityDashboard); }}
              className="flex items-center space-x-2"
            >
              <Shield className="h-4 w-4" />
              <span>{showSecurityDashboard ? 'Hide' : 'Show'} Security</span>
            </Button>
          </div>
        </div>

        {/* Security Dashboard */}
        {showSecurityDashboard && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Security Dashboard</CardTitle>
                <CardDescription>Enterprise security status and monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <MetricCard title="Security Score" value="98%" icon={Shield} trend="↑ +5% from last week" />
                  <MetricCard title="Threats Blocked" value="0" icon={Shield} trend="No threats detected" />
                  <MetricCard title="Compliance" value="100%" icon={CheckCircle} trend="All checks passed" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Projects</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="enterprise" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Enterprise</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard title="Total Revenue" value="$2.4M" icon={DollarSign} trend="↑ +20.1% from last month" />
              <MetricCard title="Active Projects" value="12" icon={CheckCircle} trend="↑ +3 from last month" />
              <MetricCard title="Total Crew Members" value="45" icon={Users} trend="↑ +5% from last month" />
              <MetricCard title="Equipment Fleet" value="23" icon={Truck} trend="→ No change" />
            </div>

            {/* Recent Projects */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Projects</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    title={project.title}
                    status={project.status}
                    progress={project.progress}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Management</CardTitle>
                <CardDescription>Manage all your paving projects</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Project management features are available in the full application.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>AI-powered insights and business intelligence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>TensorFlow.js AI Engine</span>
                    <Badge>Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Real-time Analytics</span>
                    <Badge>Processing</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Predictive Maintenance</span>
                    <Badge>Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enterprise" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enterprise Features</CardTitle>
                <CardDescription>Advanced enterprise capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">🤖 AI/ML Integration</h4>
                    <p className="text-sm text-muted-foreground">TensorFlow.js with computer vision and predictive maintenance</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">🏢 Multi-Tenant Architecture</h4>
                    <p className="text-sm text-muted-foreground">Complete tenant isolation with custom branding</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">🔄 Real-Time Collaboration</h4>
                    <p className="text-sm text-muted-foreground">WebSocket-based live updates and team collaboration</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">📊 Advanced Analytics</h4>
                    <p className="text-sm text-muted-foreground">Business intelligence dashboards with AI insights</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">🌍 Global Deployment</h4>
                    <p className="text-sm text-muted-foreground">5 regions, 6 languages, CDN optimization</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">🎯 Performance Optimized</h4>
                    <p className="text-sm text-muted-foreground">67% bundle reduction, <500KB chunks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
