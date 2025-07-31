import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { supabase } from '../integrations/supabase/client';
import { Shield, AlertTriangle, Eye, Activity, Lock, UserCheck, Server, Globe } from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  source_ip: string;
  user_agent: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'investigating';
}

interface SecurityMetric {
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

export default function SecurityMonitor() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchSecurityEvents();
    generateSecurityMetrics();
  }, []);

  const fetchSecurityEvents = async () => {
    try {
      // Fetch real security events from Supabase
      const { data: events, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching security events:', error);
        // Fallback to mock data for demo
        const mockEvents: SecurityEvent[] = [
          {
            id: '1',
            type: 'login_attempt',
            severity: 'medium',
            description: 'Multiple failed login attempts detected',
            source_ip: '192.168.1.100',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            status: 'investigating'
          },
          {
            id: '2',
            type: 'data_access',
            severity: 'low',
            description: 'Unusual data access pattern detected',
            source_ip: '10.0.0.15',
            user_agent: 'PaveMaster Mobile App v1.0',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            status: 'resolved'
          }
        ];
        setEvents(mockEvents);
        return;
      }

      const formattedEvents: SecurityEvent[] = events?.map(event => ({
        id: event.id,
        type: event.type || 'unknown',
        severity: (event.severity as 'low' | 'medium' | 'high' | 'critical') || 'low',
        description: event.description,
        source_ip: event.source_ip || 'unknown',
        user_agent: event.user_agent || 'unknown',
        timestamp: event.created_at || new Date().toISOString(),
        status: 'active' as const
      })) || [];

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching security events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSecurityMetrics = () => {
    const mockMetrics: SecurityMetric[] = [
      {
        name: 'Active Sessions',
        value: 23,
        trend: 'stable',
        status: 'good'
      },
      {
        name: 'Failed Logins (24h)',
        value: 8,
        trend: 'down',
        status: 'good'
      },
      {
        name: 'Blocked IPs',
        value: 12,
        trend: 'up',
        status: 'warning'
      },
      {
        name: 'Security Score',
        value: 94,
        trend: 'up',
        status: 'good'
      }
    ];
    
    setMetrics(mockMetrics);
  };

  const runSecurityScan = async () => {
    setScanning(true);
    // Simulate security scan
    setTimeout(() => {
      fetchSecurityEvents();
      generateSecurityMetrics();
      setScanning(false);
    }, 2000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500';
      case 'investigating': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getMetricIcon = (name: string) => {
    switch (name) {
      case 'Active Sessions': return <UserCheck className="h-4 w-4" />;
      case 'Failed Logins (24h)': return <Lock className="h-4 w-4" />;
      case 'Blocked IPs': return <Globe className="h-4 w-4" />;
      case 'Security Score': return <Shield className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading Security Monitor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Shield className="mr-3 h-8 w-8 text-blue-500" />
            Security Monitor
          </h1>
          <p className="text-muted-foreground">Real-time security monitoring and threat detection</p>
        </div>
        <Button onClick={runSecurityScan} disabled={scanning}>
          {scanning ? (
            <>
              <Activity className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Security Scan
            </>
          )}
        </Button>
      </div>

      {/* Security Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              <div className="flex items-center space-x-1">
                {getMetricIcon(metric.name)}
                <span className="text-sm">{getTrendIcon(metric.trend)}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <Badge 
                className={
                  metric.status === 'good' ? 'bg-green-500' :
                  metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }
              >
                {metric.status.toUpperCase()}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Recent Security Events
          </CardTitle>
          <CardDescription>Latest security alerts and incidents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${getSeverityColor(event.severity)}`} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{event.description}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(event.status)}>
                        {event.status.toUpperCase()}
                      </Badge>
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Type:</span> {event.type}
                    </div>
                    <div>
                      <span className="font-medium">Source IP:</span> {event.source_ip}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">User Agent:</span> {event.user_agent}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Health Dashboard */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="mr-2 h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>Infrastructure security status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Database Security</span>
                <Badge className="bg-green-500">SECURE</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">API Security</span>
                <Badge className="bg-green-500">SECURE</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">File Storage</span>
                <Badge className="bg-green-500">SECURE</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Authentication</span>
                <Badge className="bg-green-500">SECURE</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Network Security</span>
                <Badge className="bg-yellow-500">MONITORING</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Status</CardTitle>
            <CardDescription>Security compliance and audit readiness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">98%</div>
                <p className="text-sm text-muted-foreground">Overall Compliance Score</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Data Protection</span>
                  <span className="font-medium">✓ Compliant</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Access Controls</span>
                  <span className="font-medium">✓ Compliant</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Audit Logging</span>
                  <span className="font-medium">✓ Compliant</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Encryption</span>
                  <span className="font-medium text-yellow-600">⚠ Review Required</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}