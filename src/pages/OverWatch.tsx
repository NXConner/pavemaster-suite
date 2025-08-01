import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Eye, Activity, Shield, Zap, AlertTriangle, CheckCircle, Users, Truck } from 'lucide-react';

interface SystemStatus {
  name: string;
  status: 'online' | 'warning' | 'offline';
  metrics: number;
  icon: React.ComponentType<any>;
}

export default function OverWatch() {
  const [systems, setSystems] = useState<SystemStatus[]>([
    { name: 'Fleet Tracking', status: 'online', metrics: 98, icon: Truck },
    { name: 'Employee Monitor', status: 'online', metrics: 95, icon: Users },
    { name: 'Safety Systems', status: 'warning', metrics: 87, icon: Shield },
    { name: 'Operations', status: 'online', metrics: 92, icon: Activity },
  ]);

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: 'Vehicle #203 fuel level below 20%', time: '2 min ago' },
    { id: 2, type: 'info', message: 'Crew Alpha completed morning inspection', time: '15 min ago' },
    { id: 3, type: 'warning', message: 'Weather advisory: Rain expected at 3 PM', time: '1 hour ago' }
  ]);

  const [liveData, setLiveData] = useState({
    activeVehicles: 12,
    activeEmployees: 28,
    ongoingProjects: 5,
    systemUptime: 99.7
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setLiveData(prev => ({
        ...prev,
        activeVehicles: prev.activeVehicles + Math.floor(Math.random() * 3) - 1,
        systemUptime: 99.7 + Math.random() * 0.3
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Eye className="h-8 w-8" />
              OverWatch TOSS
            </h1>
            <p className="text-muted-foreground">
              Tactical Operations & Strategic Surveillance
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            System Active
          </Badge>
        </div>

        {/* Live Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveData.activeVehicles}</div>
              <p className="text-xs text-muted-foreground">+2 from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Personnel</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveData.activeEmployees}</div>
              <p className="text-xs text-muted-foreground">On duty today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveData.ongoingProjects}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveData.systemUptime.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Real-time monitoring of all systems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {systems.map((system, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(system.status)}`}></div>
                    <system.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{system.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{system.metrics}%</span>
                    <Badge variant={system.status === 'online' ? 'default' : 'destructive'}>
                      {system.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Live Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Live Alerts</CardTitle>
              <CardDescription>Recent system notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Acknowledge
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Command Center */}
        <Card>
          <CardHeader>
            <CardTitle>Command Center</CardTitle>
            <CardDescription>Quick actions and system controls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Shield className="h-6 w-6" />
                Emergency Protocol
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Activity className="h-6 w-6" />
                System Scan
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Zap className="h-6 w-6" />
                Power Management
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Eye className="h-6 w-6" />
                Full Surveillance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}