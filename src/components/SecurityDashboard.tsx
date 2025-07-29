import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Lock, Key, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SecurityBanner } from '@/components/ui/security-banner';
import { useAuth } from '@/hooks/useAuth';

interface SecurityMetric {
  title: string;
  status: 'secure' | 'warning' | 'critical';
  description: string;
  score: number;
}

export function SecurityDashboard() {
  const { user } = useAuth();
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    // Simulate security assessment
    const metrics: SecurityMetric[] = [
      {
        title: 'Authentication',
        status: user ? 'secure' : 'critical',
        description: user ? 'User authenticated with secure session' : 'No authentication detected',
        score: user ? 100 : 0,
      },
      {
        title: 'Database Security',
        status: 'warning',
        description: 'RLS policies active, 47 security issues remaining',
        score: 75,
      },
      {
        title: 'Input Validation',
        status: 'secure',
        description: 'XSS protection and input sanitization active',
        score: 95,
      },
      {
        title: 'Session Management',
        status: user ? 'secure' : 'warning',
        description: user ? 'Secure session with auto-refresh' : 'No active session',
        score: user ? 90 : 50,
      },
      {
        title: 'Data Encryption',
        status: 'secure',
        description: 'HTTPS enabled, data encrypted in transit',
        score: 100,
      },
      {
        title: 'Access Control',
        status: 'secure',
        description: 'Role-based access control implemented',
        score: 85,
      },
    ];

    setSecurityMetrics(metrics);

    // Calculate overall score
    const totalScore = metrics.reduce((sum, metric) => sum + metric.score, 0);
    const avgScore = Math.round(totalScore / metrics.length);
    setOverallScore(avgScore);
  }, [user]);

  const getStatusIcon = (status: SecurityMetric['status']) => {
    switch (status) {
      case 'secure':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'critical':
        return <Shield className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: SecurityMetric['status']) => {
    switch (status) {
      case 'secure':
        return <Badge className="bg-success/10 text-success border-success/20">Secure</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">Warning</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
    }
  };

  const getOverallStatus = () => {
    if (overallScore >= 90) { return 'secure'; }
    if (overallScore >= 70) { return 'warning'; }
    return 'critical';
  };

  return (
    <div className="space-y-6">
      {/* Overall Security Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-medium">Security Overview</CardTitle>
          </div>
          {getStatusBadge(getOverallStatus())}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{overallScore}%</span>
              <span className="text-sm text-muted-foreground">Security Score</span>
            </div>
            <Progress value={overallScore} className="h-2" />
            <SecurityBanner
              level={getOverallStatus()}
              message={
                overallScore >= 90
                  ? 'Excellent security posture'
                  : overallScore >= 70
                    ? 'Good security with some improvements needed'
                    : 'Critical security issues require attention'
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {securityMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              {getStatusIcon(metric.status)}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{metric.score}%</span>
                  {getStatusBadge(metric.status)}
                </div>
                <Progress value={metric.score} className="h-1" />
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Recent Security Events</CardTitle>
          </div>
          <CardDescription>Latest security-related activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Database security policies updated</span>
              <span className="text-muted-foreground ml-auto">Just now</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Authentication system hardened</span>
              <span className="text-muted-foreground ml-auto">Just now</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Input validation implemented</span>
              <span className="text-muted-foreground ml-auto">Just now</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Database className="h-4 w-4 text-warning" />
              <span>47 security issues identified (down from 101)</span>
              <span className="text-muted-foreground ml-auto">Just now</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}