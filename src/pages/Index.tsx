import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, AnimatedCardContainer } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

// Import new components
import { AsphaltGuardian } from '../components/guardian/AsphaltGuardian';
import { SealcoatCalculator } from '../components/calculators/SealcoatCalculator';
import { StripingCalculator } from '../components/calculators/StripingCalculator';
import { MaterialEstimator } from '../components/calculators/MaterialEstimator';
import { RegulationsGuide } from '../components/regulations/RegulationsGuide';

import {
  Building,
  Users,
  Truck,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  Calendar,
  Shield,
  Activity,
  Gauge,
  Package,
  Book,
  Zap,
  Target,
  Command,
  Cpu,
  Radio,
  Satellite,
  Eye,
  Brain,
} from 'lucide-react';

interface QuickAccessItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'active' | 'ready' | 'pending' | 'offline';
  category: 'core' | 'tools' | 'monitoring' | 'analytics';
  priority: 'high' | 'medium' | 'low';
  metrics?: {
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
    percentage?: number;
  };
}

const QUICK_ACCESS_ITEMS: QuickAccessItem[] = [
  {
    id: 'guardian',
    title: 'Asphalt Guardian',
    description: 'AI-powered pavement monitoring',
    icon: Shield,
    status: 'active',
    category: 'core',
    priority: 'high',
    metrics: { value: '99.7%', trend: 'up', percentage: 2.3 },
  },
  {
    id: 'sealcoat-calc',
    title: 'Sealcoat Calculator',
    description: 'Precision material estimation',
    icon: Calculator,
    status: 'ready',
    category: 'tools',
    priority: 'high',
    metrics: { value: '47', trend: 'up', percentage: 15 },
  },
  {
    id: 'striping-calc',
    title: 'Striping Calculator',
    description: 'Line marking optimization',
    icon: Target,
    status: 'ready',
    category: 'tools',
    priority: 'medium',
    metrics: { value: '12.4K', trend: 'stable' },
  },
  {
    id: 'material-calc',
    title: 'Material Estimator',
    description: 'Comprehensive cost analysis',
    icon: Package,
    status: 'ready',
    category: 'tools',
    priority: 'medium',
    metrics: { value: '$247K', trend: 'up', percentage: 8.2 },
  },
  {
    id: 'overwatch',
    title: 'OverWatch Command',
    description: 'Mission command center',
    icon: Command,
    status: 'active',
    category: 'monitoring',
    priority: 'high',
    metrics: { value: '24/7', trend: 'stable' },
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    description: 'Intelligent support system',
    icon: Brain,
    status: 'active',
    category: 'core',
    priority: 'high',
    metrics: { value: '1.2K', trend: 'up', percentage: 34 },
  },
  {
    id: 'fleet-tracking',
    title: 'Fleet Tracker',
    description: 'Real-time vehicle monitoring',
    icon: Truck,
    status: 'active',
    category: 'monitoring',
    priority: 'high',
    metrics: { value: '18/20', trend: 'stable' },
  },
  {
    id: 'performance',
    title: 'Performance Hub',
    description: 'System analytics dashboard',
    icon: Activity,
    status: 'active',
    category: 'analytics',
    priority: 'medium',
    metrics: { value: '94%', trend: 'up', percentage: 1.8 },
  },
];

const SYSTEM_STATUS = {
  operational: 18,
  warning: 2,
  critical: 0,
  offline: 1,
};

export default function Index() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [systemTime, setSystemTime] = useState(new Date());
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'ready': return 'text-blue-500 bg-blue-500/10';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10';
      case 'offline': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-red-500';
      case 'medium': return 'border-l-4 border-l-yellow-500';
      case 'low': return 'border-l-4 border-l-green-500';
      default: return '';
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? QUICK_ACCESS_ITEMS 
    : QUICK_ACCESS_ITEMS.filter(item => item.category === selectedCategory);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'guardian':
        return <AsphaltGuardian />;
      case 'sealcoat-calc':
        return <SealcoatCalculator />;
      case 'striping-calc':
        return <StripingCalculator />;
      case 'material-calc':
        return <MaterialEstimator />;
      case 'regulations':
        return <RegulationsGuide />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8" ref={dashboardRef}>
      {/* Enhanced Header with Real-time Status */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 tactical-grid opacity-10" />
        <div className="relative z-10 flex items-center justify-between p-6 rounded-lg bg-card/80 backdrop-blur-sm border border-primary/20">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-primary-glow">
              PaveMaster Command Center
            </h1>
            <p className="text-lg text-muted-foreground">
              Tactical Operations Dashboard - {systemTime.toLocaleString()}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="outline" className="gap-2 animate-pulse">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                All Systems Operational
              </Badge>
              <Badge variant="outline" className="gap-2">
                <Radio className="w-3 h-3" />
                {SYSTEM_STATUS.operational} Active Systems
              </Badge>
              <Badge variant="outline" className="gap-2">
                <Satellite className="w-3 h-3" />
                Global Network Online
              </Badge>
            </div>
          </div>
          
          {/* System Status Display */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-500">{SYSTEM_STATUS.operational}</div>
              <div className="text-xs text-muted-foreground">Operational</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-500">{SYSTEM_STATUS.warning}</div>
              <div className="text-xs text-muted-foreground">Warnings</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-500">{SYSTEM_STATUS.critical}</div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'All Systems', icon: Command },
          { id: 'core', label: 'Core Operations', icon: Cpu },
          { id: 'tools', label: 'Calculation Tools', icon: Calculator },
          { id: 'monitoring', label: 'Monitoring', icon: Eye },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        ].map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={selectedCategory === id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(id)}
            className="flex items-center gap-2 whitespace-nowrap"
            animation={selectedCategory === id ? 'glow' : 'none'}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Button>
        ))}
      </div>

      {/* Enhanced Quick Access Grid */}
      <AnimatedCardContainer staggerDelay={150}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              variant={item.status === 'active' ? 'neon' : 'elevated'}
              interactive
              tilt
              glow={item.priority === 'high'}
              className={`group cursor-pointer transition-all duration-300 ${getPriorityIndicator(item.priority)}`}
              onClick={() => setActiveSection(item.id)}
              onHover={() => setHoveredCard(item.id)}
              onLeave={() => setHoveredCard(null)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(item.status)} transition-colors`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors">
                        {item.title}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className={`w-3 h-3 rounded-full ${
                    item.status === 'active' ? 'bg-green-500 animate-pulse' :
                    item.status === 'ready' ? 'bg-blue-500' :
                    item.status === 'pending' ? 'bg-yellow-500 animate-pulse' :
                    'bg-red-500'
                  }`} />
                </div>
                
                <CardDescription className="text-xs mt-2">
                  {item.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Metrics Display */}
                {item.metrics && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {item.metrics.value}
                      </span>
                      {item.metrics.trend && (
                        <div className={`flex items-center gap-1 text-xs ${
                          item.metrics.trend === 'up' ? 'text-green-500' :
                          item.metrics.trend === 'down' ? 'text-red-500' :
                          'text-muted-foreground'
                        }`}>
                          {item.metrics.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                          {item.metrics.trend === 'down' && <TrendingUp className="w-3 h-3 rotate-180" />}
                          {item.metrics.percentage && `${item.metrics.percentage}%`}
                        </div>
                      )}
                    </div>
                    
                    {/* Progress Bar for Active Items */}
                    {item.status === 'active' && (
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div 
                          className="bg-primary h-1.5 rounded-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${Math.min(100, (typeof item.metrics.value === 'string' 
                              ? parseFloat(item.metrics.value) 
                              : item.metrics.value
                            ))}%` 
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <Button
                  variant={item.status === 'active' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full mt-4 group-hover:scale-105 transition-transform"
                  ripple={false}
                >
                  {item.status === 'active' ? 'Monitor' : 'Launch'}
                  {item.status === 'active' && <Zap className="w-3 h-3 ml-2" />}
                </Button>
              </CardContent>

              {/* Hover Effect Overlay */}
              {hoveredCard === item.id && (
                <div className="absolute inset-0 bg-primary/5 rounded-lg animate-in fade-in-0 duration-200" />
              )}
            </Card>
          ))}
        </div>
      </AnimatedCardContainer>

      {/* System Overview Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card variant="glass" className="tactical-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Active Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">12</div>
                <p className="text-sm text-muted-foreground">Across 8 locations</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">8 On Schedule</Badge>
                  <Badge variant="outline" className="text-xs">4 Ahead</Badge>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass" className="tactical-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">47</div>
                <p className="text-sm text-muted-foreground">Personnel online</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">32 Field</Badge>
                  <Badge variant="outline" className="text-xs">15 Office</Badge>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass" className="tactical-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="w-5 h-5" />
                  Efficiency Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">96.7%</div>
                <p className="text-sm text-muted-foreground">7-day average</p>
                <div className="mt-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-[96.7%] animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <Card variant="holographic">
            <CardHeader>
              <CardTitle>System Performance Metrics</CardTitle>
              <CardDescription>Real-time monitoring of critical systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Database Response', value: 94, status: 'good' },
                  { name: 'API Throughput', value: 87, status: 'good' },
                  { name: 'Memory Usage', value: 72, status: 'warning' },
                  { name: 'Network Latency', value: 98, status: 'excellent' },
                ].map((metric) => (
                  <div key={metric.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{metric.name}</span>
                      <span className="font-mono">{metric.value}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          metric.status === 'excellent' ? 'bg-green-500' :
                          metric.status === 'good' ? 'bg-blue-500' :
                          metric.status === 'warning' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <div className="space-y-4">
            {[
              { type: 'info', message: 'System backup completed successfully', time: '2 minutes ago' },
              { type: 'warning', message: 'High memory usage on Server-02', time: '15 minutes ago' },
              { type: 'success', message: 'New equipment calibration complete', time: '1 hour ago' },
              { type: 'info', message: 'Weekly maintenance scheduled for Sunday', time: '2 hours ago' },
            ].map((alert, index) => (
              <Card key={index} variant="outline" className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.type === 'success' ? 'bg-green-500' :
                    alert.type === 'warning' ? 'bg-yellow-500' :
                    alert.type === 'error' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card variant="gradient">
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Data-driven insights and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold">Productivity Trends</h4>
                  <div className="text-2xl font-bold text-green-500">+15.3%</div>
                  <p className="text-sm text-muted-foreground">Compared to last month</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Cost Efficiency</h4>
                  <div className="text-2xl font-bold text-blue-500">+8.7%</div>
                  <p className="text-sm text-muted-foreground">Year over year improvement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background/50 backdrop-blur-sm">
        {renderActiveSection()}
      </div>
    </DashboardLayout>
  );
}