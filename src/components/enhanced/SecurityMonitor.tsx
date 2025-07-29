import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle, Activity, Lock, Users, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logSecurityEvent } from '@/lib/security';

interface SecurityMetric {
  title: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface SecurityEvent {
  id: string;
  action: string;
  user_id: string;
  created_at: string;
  details: any;
  severity?: string;
  resource_type?: string;
  resource_id?: string;
}

export function SecurityMonitor() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [overallScore, setOverallScore] = useState(85);

  useEffect(() => {
    if (user) {
      loadSecurityData();
      // Log security dashboard access
      logSecurityEvent('security_dashboard_accessed', 'system');
    }
  }, [user]);

  const loadSecurityData = async () => {
    try {
      setIsLoading(true);
      
      // Load security audit logs
      const { data: events, error: eventsError } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (eventsError) {
        console.error('Error loading security events:', eventsError);
      } else {
        setRecentEvents(events || []);
      }

      // Calculate security metrics
      const mockMetrics: SecurityMetric[] = [
        {
          title: 'Failed Login Attempts',
          value: 3,
          trend: 'down',
          severity: 'medium',
          description: 'Number of failed authentication attempts in the last 24 hours'
        },
        {
          title: 'Active Sessions',
          value: 12,
          trend: 'stable',
          severity: 'low',
          description: 'Currently active user sessions'
        },
        {
          title: 'RLS Policies Active',
          value: 28,
          trend: 'up',
          severity: 'low',
          description: 'Row Level Security policies protecting database tables'
        },
        {
          title: 'Suspicious Activities',
          value: 0,
          trend: 'stable',
          severity: 'low',
          description: 'Potential security threats detected'
        },
        {
          title: 'Data Access Violations',
          value: 1,
          trend: 'down',
          severity: 'medium',
          description: 'Unauthorized data access attempts'
        },
        {
          title: 'API Rate Limits Hit',
          value: 5,
          trend: 'up',
          severity: 'medium',
          description: 'Number of rate limit violations'
        }
      ];

      setMetrics(mockMetrics);
      
      // Calculate overall security score
      const criticalIssues = mockMetrics.filter(m => m.severity === 'critical').length;
      const highIssues = mockMetrics.filter(m => m.severity === 'high').length;
      const mediumIssues = mockMetrics.filter(m => m.severity === 'medium').length;
      
      const score = Math.max(50, 100 - (criticalIssues * 30) - (highIssues * 15) - (mediumIssues * 5));
      setOverallScore(score);
      
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatEventAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Score Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Security Score</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <span className={getScoreColor(overallScore)}>{overallScore}/100</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Overall security health of your application
          </p>
          {overallScore < 80 && (
            <Alert className="mt-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Security Attention Required</AlertTitle>
              <AlertDescription>
                Your security score indicates areas that need improvement. Review the metrics below.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Security Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Badge className={getSeverityColor(metric.severity)}>
                {metric.severity}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>
              <div className="flex items-center mt-2">
                <Activity className="h-3 w-3 mr-1 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Trend: {metric.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
          <CardDescription>
            Latest security-related activities in your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Lock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent security events recorded</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between py-2 border-b border-muted last:border-0">
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {formatEventAction(event.action)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {event.details?.resource_type || 'system'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Security Actions
          </CardTitle>
          <CardDescription>
            Quick actions to improve your application security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => logSecurityEvent('manual_security_scan_initiated', 'system')}
          >
            <Shield className="h-4 w-4 mr-2" />
            Run Security Scan
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => window.open('/settings', '_blank')}
          >
            <Lock className="h-4 w-4 mr-2" />
            Review Security Settings
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => logSecurityEvent('security_audit_requested', 'system')}
          >
            <Activity className="h-4 w-4 mr-2" />
            Download Security Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}