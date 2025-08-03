import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Lock,
  Eye,
  FileText,
  Server
} from "lucide-react";
import { SecurityStatus } from './SecurityStatus';

interface SecurityEvent {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  action: string;
  timestamp: Date;
  description: string;
  source?: string;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  activeThreats: number;
  blockedAttempts: number;
  lastScanTime: Date;
  systemStatus: 'secure' | 'warning' | 'critical';
}

export function SecurityDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    activeThreats: 0,
    blockedAttempts: 0,
    lastScanTime: new Date(),
    systemStatus: 'secure'
  });

  useEffect(() => {
    // Simulate loading security data
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        type: 'authentication',
        severity: 'medium',
        action: 'Failed login attempt',
        timestamp: new Date(Date.now() - 30000),
        description: 'Multiple failed login attempts from IP 192.168.1.100',
        source: '192.168.1.100'
      },
      {
        id: '2',
        type: 'input_validation',
        severity: 'low',
        action: 'Invalid input detected',
        timestamp: new Date(Date.now() - 120000),
        description: 'SQL injection attempt blocked in form submission',
        source: 'Form Validation'
      },
      {
        id: '3',
        type: 'rate_limit',
        severity: 'medium',
        action: 'Rate limit exceeded',
        timestamp: new Date(Date.now() - 300000),
        description: 'API rate limit exceeded for user session',
        source: 'API Gateway'
      }
    ];

    setSecurityEvents(mockEvents);
    setMetrics({
      totalEvents: mockEvents.length,
      criticalEvents: mockEvents.filter(e => e.severity === 'critical').length,
      activeThreats: 2,
      blockedAttempts: 15,
      lastScanTime: new Date(),
      systemStatus: mockEvents.some(e => e.severity === 'critical') ? 'critical' : 
                   mockEvents.some(e => e.severity === 'high') ? 'warning' : 'secure'
    });
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'secure': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Security Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor system security status and events
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(metrics.systemStatus)}
          <Badge 
            variant={metrics.systemStatus === 'secure' ? 'outline' : 'destructive'}
            className="capitalize"
          >
            {metrics.systemStatus}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <FileText className="h-4 w-4" />
            Security Events
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="gap-2">
            <Eye className="h-4 w-4" />
            Real-time Monitoring
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Lock className="h-4 w-4" />
            Security Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Events</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last hour
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{metrics.activeThreats}</div>
                <p className="text-xs text-muted-foreground">
                  Require immediate attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blocked Attempts</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{metrics.blockedAttempts}</div>
                <p className="text-xs text-muted-foreground">
                  Attacks prevented today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{metrics.systemStatus}</div>
                <p className="text-xs text-muted-foreground">
                  Last scan: {metrics.lastScanTime.toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <SecurityStatus />
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>Latest security incidents and system alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {securityEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center justify-between border-b pb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(event.severity) as any} className="text-xs">
                          {event.severity}
                        </Badge>
                        <span className="text-sm font-medium">{event.action}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Event Log</CardTitle>
              <CardDescription>Comprehensive log of all security-related events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(event.severity) as any}>
                          {event.severity.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{event.type}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {event.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <h4 className="font-medium mb-1">{event.action}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                    {event.source && (
                      <p className="text-xs text-muted-foreground">Source: {event.source}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-time Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Threat Detection</CardTitle>
                <CardDescription>Live monitoring of security threats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>XSS Attack Detection</span>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>SQL Injection Protection</span>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Rate Limiting</span>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Input Validation</span>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Current system security status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Authentication Service</span>
                  <Badge variant="outline" className="text-green-600">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Database Security</span>
                  <Badge variant="outline" className="text-green-600">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>API Gateway</span>
                  <Badge variant="outline" className="text-green-600">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Session Management</span>
                  <Badge variant="outline" className="text-green-600">Healthy</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
              <CardDescription>Manage security settings and policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Authentication Settings</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• OTP Expiry: 5 minutes</li>
                  <li>• Password Strength: High</li>
                  <li>• Session Timeout: 1 hour</li>
                  <li>• Failed Login Attempts: 5 max</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Security Policies</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Row Level Security: Enabled</li>
                  <li>• Input Validation: Strict</li>
                  <li>• Rate Limiting: Active</li>
                  <li>• Leaked Password Protection: Enabled</li>
                </ul>
              </div>

              <Button className="w-full">
                Update Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}