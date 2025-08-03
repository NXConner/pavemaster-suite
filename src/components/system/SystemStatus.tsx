import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import {
  Shield,
  Activity,
  Users,
  Truck,
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3,
} from 'lucide-react';
import { useTacticalData } from '../../hooks/useTacticalData';
import { useJargon } from '../../contexts/JargonContext';

export function SystemStatus() {
  const { getText } = useJargon();
  const { alerts, missions, metrics, loading } = useTacticalData();
  const [systemHealth, setSystemHealth] = useState({
    overall: 95,
    database: 98,
    api: 97,
    frontend: 96,
    realtime: 94,
  });

  useEffect(() => {
    // Simulate system health monitoring
    const interval = setInterval(() => {
      setSystemHealth(prev => ({
        overall: Math.max(90, Math.min(100, prev.overall + (Math.random() - 0.5) * 2)),
        database: Math.max(95, Math.min(100, prev.database + (Math.random() - 0.5) * 1)),
        api: Math.max(90, Math.min(100, prev.api + (Math.random() - 0.5) * 2)),
        frontend: Math.max(92, Math.min(100, prev.frontend + (Math.random() - 0.5) * 1.5)),
        realtime: Math.max(88, Math.min(100, prev.realtime + (Math.random() - 0.5) * 3)),
      }));
    }, 5000);

    return () => { clearInterval(interval); };
  }, []);

  const getHealthColor = (value: number) => {
    if (value >= 95) { return 'text-green-500'; }
    if (value >= 85) { return 'text-yellow-500'; }
    return 'text-red-500';
  };

  const getHealthBadge = (value: number) => {
    if (value >= 95) { return 'default'; }
    if (value >= 85) { return 'secondary'; }
    return 'destructive';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-pulse" />
            {getText('systemStatus')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className={`h-5 w-5 ${getHealthColor(systemHealth.overall)}`} />
            {getText('systemStatus')}
            <Badge variant={getHealthBadge(systemHealth.overall)}>
              {systemHealth.overall.toFixed(1)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Database</span>
                <span className={getHealthColor(systemHealth.database)}>
                  {systemHealth.database.toFixed(1)}%
                </span>
              </div>
              <Progress value={systemHealth.database} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>API Services</span>
                <span className={getHealthColor(systemHealth.api)}>
                  {systemHealth.api.toFixed(1)}%
                </span>
              </div>
              <Progress value={systemHealth.api} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Frontend</span>
                <span className={getHealthColor(systemHealth.frontend)}>
                  {systemHealth.frontend.toFixed(1)}%
                </span>
              </div>
              <Progress value={systemHealth.frontend} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Real-time</span>
                <span className={getHealthColor(systemHealth.realtime)}>
                  {systemHealth.realtime.toFixed(1)}%
                </span>
              </div>
              <Progress value={systemHealth.realtime} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Systems */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Active Systems
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-2">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">{metrics?.activeProjects || 0}</div>
              <div className="text-sm text-muted-foreground">{getText('projects')}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-2">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">{metrics?.equipmentUtilization || 0}%</div>
              <div className="text-sm text-muted-foreground">{getText('equipment')}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold">{alerts.length}</div>
              <div className="text-sm text-muted-foreground">{getText('alerts')}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{missions.filter(m => m.status === 'completed').length}</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Generate Report</div>
                  <div className="text-sm text-muted-foreground">Create system analysis</div>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Security Scan</div>
                  <div className="text-sm text-muted-foreground">Run diagnostics</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}