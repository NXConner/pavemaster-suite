import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Shield, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';

interface SecurityMetrics {
  activeThreats: number;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  lastScan: string;
  failedAttempts: number;
  authenticatedSessions: number;
}

export function SecurityStatus() {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    activeThreats: 0,
    securityLevel: 'low',
    lastScan: new Date().toISOString(),
    failedAttempts: 0,
    authenticatedSessions: 1,
  });

  useEffect(() => {
    // Simulate security monitoring
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        lastScan: new Date().toISOString(),
        // Simulate low activity for demo
        activeThreats: Math.random() > 0.9 ? 1 : 0,
        failedAttempts: Math.floor(Math.random() * 3),
      }));
    }, 30000); // Update every 30 seconds

    return () => { clearInterval(interval); };
  }, []);

  const getSecurityLevelIcon = () => {
    switch (metrics.securityLevel) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'medium': return <Activity className="w-4 h-4 text-warning" />;
      default: return <CheckCircle2 className="w-4 h-4 text-success" />;
    }
  };

  const getSecurityLevelVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (metrics.securityLevel) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4" />
          Security Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Threat Level</span>
          <Badge variant={getSecurityLevelVariant()} className="gap-1">
            {getSecurityLevelIcon()}
            {metrics.securityLevel.toUpperCase()}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Active Threats</span>
          <span className="text-sm font-medium">
            {metrics.activeThreats}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Failed Attempts</span>
          <span className="text-sm font-medium">
            {metrics.failedAttempts}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Active Sessions</span>
          <span className="text-sm font-medium">
            {metrics.authenticatedSessions}
          </span>
        </div>

        <div className="pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            Last scan: {new Date(metrics.lastScan).toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}