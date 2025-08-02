import { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Shield, Activity, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useTacticalData } from '../../hooks/useTacticalData';
import { useJargon } from '../../contexts/JargonContext';

export function TacticalHUD() {
  const { getText } = useJargon();
  const { alerts, missions, metrics, acknowledgeAlert } = useTacticalData();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'default';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50 max-w-sm">
      {/* Status Bar */}
      <Card className="bg-background/95 backdrop-blur-sm border-primary/20">
        <CardContent className="p-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-mono">{getText('commandCenter')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(currentTime)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card className="bg-background/95 backdrop-blur-sm border-destructive/20">
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium">{getText('alerts')}</span>
                  <Badge variant="destructive" className="text-xs">{alerts.length}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => alerts.forEach(alert => acknowledgeAlert(alert.id))}
                >
                  Dismiss All
                </Button>
              </div>
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-start gap-2 text-xs">
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      {getAlertIcon(alert.type)}
                      <Badge variant={getAlertColor(alert.type) as any} className="text-xs">
                        {alert.type.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1">{alert.message}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                    onClick={() => acknowledgeAlert(alert.id)}
                  >
                    ACK
                  </Button>
                </div>
              ))}
              {alerts.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{alerts.length - 3} more {getText('alerts').toLowerCase()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mission Status */}
      {missions.length > 0 && (
        <Card className="bg-background/95 backdrop-blur-sm border-primary/20">
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{getText('missions')}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => window.location.reload()}
                >
                  Dismiss All
                </Button>
              </div>
              {missions.slice(0, 2).map((mission) => (
                <div key={mission.id} className="text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{mission.name}</span>
                    <Badge 
                      variant={mission.priority === 'critical' ? 'destructive' : 'default'}
                      className="text-xs"
                    >
                      {mission.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-muted rounded-full h-1">
                      <div 
                        className="bg-primary h-1 rounded-full transition-all"
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground">{mission.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Metrics */}
      {metrics && (
        <Card className="bg-background/95 backdrop-blur-sm border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">{getText('commandCenter')}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs"
                onClick={() => window.location.reload()}
              >
                Dismiss
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">{getText('projects')}</span>
                <p className="font-mono font-medium">{metrics.activeProjects}/{metrics.totalProjects}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{getText('equipment')}</span>
                <p className="font-mono font-medium">{metrics.equipmentUtilization}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}