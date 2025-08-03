import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { MilitaryStatusBar } from '../components/ui/military-status-bar';
import { TacticalGrid } from '../components/ui/tactical-grid';
import { ThemeSwitcher } from '../components/ui/theme-switcher';
import { MapView } from '../components/tracking/MapView';
import {
  Shield,
  Satellite,
  Activity,
  AlertTriangle,
  Eye,
  Radar,
  Radio,
  Users,
  MapPin,
  Zap,
  Crosshair,
  Command,
  Target,
  Cpu,
  Globe,
  Settings,
  Lock,
  Wifi,
  Database,
  Server,
} from 'lucide-react';

interface SystemStatus {
  name: string;
  status: 'online' | 'warning' | 'offline' | 'secure';
  metrics: number;
  classification: 'CLASSIFIED' | 'SECRET' | 'TOP SECRET' | 'UNCLASSIFIED';
  lastUpdate: string;
}

interface Alert {
  id: number;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  location?: string;
}

interface Camera {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  sector: string;
  resolution: string;
  nightVision: boolean;
}

export default function OverWatch() {
  const [systems] = useState<SystemStatus[]>([
    {
      name: 'QUANTUM SURVEILLANCE NETWORK',
      status: 'online',
      metrics: 99.7,
      classification: 'TOP SECRET',
      lastUpdate: '0.03s ago',
    },
    {
      name: 'TACTICAL THREAT ASSESSMENT',
      status: 'secure',
      metrics: 97.3,
      classification: 'SECRET',
      lastUpdate: '0.12s ago',
    },
    {
      name: 'PERSONNEL BIOMETRIC GRID',
      status: 'online',
      metrics: 98.9,
      classification: 'CLASSIFIED',
      lastUpdate: '0.05s ago',
    },
    {
      name: 'ENVIRONMENTAL MONITORING',
      status: 'warning',
      metrics: 94.1,
      classification: 'UNCLASSIFIED',
      lastUpdate: '2.3s ago',
    },
    {
      name: 'QUANTUM COMMUNICATION HUB',
      status: 'online',
      metrics: 99.9,
      classification: 'TOP SECRET',
      lastUpdate: '0.01s ago',
    },
    {
      name: 'AI PREDICTIVE ANALYSIS',
      status: 'online',
      metrics: 96.8,
      classification: 'SECRET',
      lastUpdate: '0.08s ago',
    },
  ]);

  const [alerts] = useState<Alert[]>([
    {
      id: 1,
      type: 'INTRUSION DETECTION',
      severity: 'high',
      message: 'Unauthorized access attempt on sector 7-Alpha',
      timestamp: '12:34:56',
      location: 'PERIMETER GRID 7-A',
    },
    {
      id: 2,
      type: 'ENVIRONMENTAL ANOMALY',
      severity: 'medium',
      message: 'Temperature spike detected in equipment bay',
      timestamp: '12:31:22',
      location: 'FACILITY ZONE C',
    },
    {
      id: 3,
      type: 'PERSONNEL MOVEMENT',
      severity: 'low',
      message: 'Shift change initiated - Alpha team returning',
      timestamp: '12:28:14',
      location: 'CHECKPOINT BRAVO',
    },
    {
      id: 4,
      type: 'SYSTEM MAINTENANCE',
      severity: 'low',
      message: 'Scheduled quantum core calibration complete',
      timestamp: '12:15:03',
      location: 'CORE FACILITY',
    },
  ]);

  const [cameras] = useState<Camera[]>([
    { id: 'CAM-001', name: 'NORTH PERIMETER', status: 'online', sector: 'ALPHA', resolution: '4K', nightVision: true },
    { id: 'CAM-002', name: 'SOUTH PERIMETER', status: 'online', sector: 'BRAVO', resolution: '4K', nightVision: true },
    { id: 'CAM-003', name: 'EAST PERIMETER', status: 'online', sector: 'CHARLIE', resolution: '4K', nightVision: true },
    { id: 'CAM-004', name: 'WEST PERIMETER', status: 'maintenance', sector: 'DELTA', resolution: '4K', nightVision: true },
    { id: 'CAM-005', name: 'COMMAND CENTER', status: 'online', sector: 'CENTRAL', resolution: '8K', nightVision: true },
    { id: 'CAM-006', name: 'EQUIPMENT BAY', status: 'online', sector: 'ECHO', resolution: '4K', nightVision: false },
  ]);

  const [operationalData, setOperationalData] = useState({
    activeSensors: 127,
    dataStreamsMbps: 2847.3,
    personnelTracked: 24,
    threatLevel: 2,
    systemEfficiency: 98.7,
    powerConsumption: 87.2,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setOperationalData(prev => ({
        ...prev,
        dataStreamsMbps: prev.dataStreamsMbps + (Math.random() - 0.5) * 50,
        systemEfficiency: Math.max(95, Math.min(100, prev.systemEfficiency + (Math.random() - 0.5) * 0.5)),
        powerConsumption: Math.max(80, Math.min(95, prev.powerConsumption + (Math.random() - 0.5) * 2)),
      }));
    }, 2000);

    return () => { clearInterval(interval); };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-success';
      case 'secure': return 'text-primary';
      case 'warning': return 'text-warning';
      case 'offline': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'TOP SECRET': return 'border-destructive text-destructive bg-destructive/10';
      case 'SECRET': return 'border-warning text-warning bg-warning/10';
      case 'CLASSIFIED': return 'border-primary text-primary bg-primary/10';
      case 'UNCLASSIFIED': return 'border-success text-success bg-success/10';
      default: return 'border-muted text-muted-foreground bg-muted/10';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-destructive text-destructive bg-destructive/10';
      case 'high': return 'border-warning text-warning bg-warning/10';
      case 'medium': return 'border-primary text-primary bg-primary/10';
      case 'low': return 'border-success text-success bg-success/10';
      default: return 'border-muted text-muted-foreground bg-muted/10';
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Tactical Grid Background */}
      <div className="fixed inset-0 pointer-events-none">
        <TacticalGrid intensity={0.2} animated={true} />
      </div>

      {/* Military Status Bar */}
      <div className="relative z-10 p-4">
        <MilitaryStatusBar />
      </div>

      <div className="container mx-auto p-6 space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <Satellite className="h-12 w-12 text-primary animate-pulse" />
              <Crosshair className="h-6 w-6 text-accent absolute -top-1 -right-1 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                OverWatch TOSS
              </h1>
              <p className="text-lg text-muted-foreground font-mono">
                Tactical Operations & Strategic Surveillance
              </p>
              <p className="text-sm text-accent font-mono">
                ISAC-OS v3.1.4 | DEFCON READY | ALL SYSTEMS NOMINAL
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
              <Eye className="h-4 w-4 animate-pulse" />
              OVERWATCH: ACTIVE
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 border-success text-success">
              <Shield className="h-4 w-4" />
              SECURED
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 border-primary text-primary">
              <Command className="h-4 w-4" />
              COMMAND READY
            </Badge>
          </div>
        </div>

        {/* Theme Configuration Panel */}
        <div className="flex justify-center">
          <ThemeSwitcher />
        </div>

        {/* Operational Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono">ACTIVE SENSORS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{operationalData.activeSensors}</div>
              <p className="text-xs text-muted-foreground font-mono">OPERATIONAL</p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-info/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono">DATA STREAMS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">{operationalData.dataStreamsMbps.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground font-mono">MBPS</p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-secondary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono">PERSONNEL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{operationalData.personnelTracked}</div>
              <p className="text-xs text-muted-foreground font-mono">TRACKED</p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-warning/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono">THREAT LEVEL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{operationalData.threatLevel}</div>
              <p className="text-xs text-muted-foreground font-mono">MODERATE</p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-success/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono">EFFICIENCY</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{operationalData.systemEfficiency.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground font-mono">OPTIMAL</p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono">POWER USAGE</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{operationalData.powerConsumption.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground font-mono">NOMINAL</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tactical Surveillance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Real-time Monitoring */}
          <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary animate-pulse" />
                Real-time Monitoring
              </CardTitle>
              <CardDescription>Live surveillance feed analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-mono">Active Cameras</span>
                  <Badge variant="secondary" className="bg-success/20 text-success border-success/50">
                    {cameras.filter(c => c.status === 'online').length}/{cameras.length}
                  </Badge>
                </div>
                <Progress value={85} className="h-3" />
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>Coverage: <span className="text-success">85%</span></div>
                  <div>Quality: <span className="text-primary">4K</span></div>
                  <div>Latency: <span className="text-accent">12ms</span></div>
                  <div>Status: <span className="text-success animate-pulse">ACTIVE</span></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Threat Detection */}
          <Card className="border-warning/20 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-warning animate-pulse" />
                Threat Detection
              </CardTitle>
              <CardDescription>AI-powered threat assessment & analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-mono">Threat Level</span>
                  <Badge variant="outline" className="border-warning text-warning bg-warning/10 animate-pulse">
                    ELEVATED
                  </Badge>
                </div>
                <div className="space-y-2">
                  {alerts.slice(0, 3).map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded border border-warning/20">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${alert.severity === 'high' ? 'bg-destructive animate-pulse' : 'bg-warning'}`} />
                        <span className="text-xs font-mono">{alert.type}</span>
                      </div>
                      <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <Cpu className="h-3 w-3" />
                    AI Processing: <span className="text-primary">97.3%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantum Communication Networks */}
          <Card className="border-info/20 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-info animate-pulse" />
                Quantum Comms
              </CardTitle>
              <CardDescription>Multi-channel quantum-encrypted networks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-mono">Primary Channel</span>
                    <Badge variant="outline" className="border-success text-success bg-success/10 animate-pulse">
                      ACTIVE
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-mono">Backup Channel</span>
                    <Badge variant="outline" className="border-warning text-warning bg-warning/10">
                      STANDBY
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-mono">Emergency Channel</span>
                    <Badge variant="outline" className="border-primary text-primary bg-primary/10">
                      READY
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-mono">Quantum Link</span>
                    <Badge variant="outline" className="border-accent text-accent bg-accent/10 animate-pulse">
                      ENTANGLED
                    </Badge>
                  </div>
                </div>
                <div className="pt-2 border-t border-border/50 space-y-1">
                  <div className="text-xs text-muted-foreground font-mono">
                    Signal: <span className="text-success">98.7%</span> |
                    Encryption: <span className="text-primary">QUANTUM-256</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    Latency: <span className="text-accent">0.03ms</span> |
                    Bandwidth: <span className="text-info">10Gbps</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Personnel Tracking */}
          <Card className="border-secondary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-secondary animate-pulse" />
                Personnel Matrix
              </CardTitle>
              <CardDescription>Real-time team tracking & biometrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-mono">Personnel Online</span>
                  <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/50">
                    24/26
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-success/10 rounded border border-success/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                      <span className="text-xs font-mono">Field Teams</span>
                    </div>
                    <span className="text-xs text-success font-mono">8 ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-primary/10 rounded border border-primary/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-xs font-mono">Command Staff</span>
                    </div>
                    <span className="text-xs text-primary font-mono">6 ONLINE</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-info/10 rounded border border-info/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-info rounded-full animate-pulse" />
                      <span className="text-xs font-mono">Support Units</span>
                    </div>
                    <span className="text-xs text-info font-mono">10 READY</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <MapPin className="h-3 w-3" />
                    GPS: <span className="text-success">LOCKED</span> |
                    Vitals: <span className="text-primary">NOMINAL</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status Matrix */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              System Status Matrix
            </CardTitle>
            <CardDescription>Advanced system monitoring with security classifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systems.map((system, index) => (
                <div key={index} className="p-4 rounded-lg border border-border/50 bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-primary" />
                      <span className="font-mono text-sm font-medium">{system.name}</span>
                    </div>
                    <Badge className={getClassificationColor(system.classification)} variant="outline">
                      {system.classification}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono">STATUS</span>
                      <span className={`text-xs font-mono ${getStatusColor(system.status)}`}>
                        {system.status.toUpperCase()}
                      </span>
                    </div>
                    <Progress value={system.metrics} className="h-2" />
                    <div className="flex justify-between items-center text-xs font-mono text-muted-foreground">
                      <span>{system.metrics}% EFFICIENCY</span>
                      <span>UPD: {system.lastUpdate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alert Management Center */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Alert Management Center
            </CardTitle>
            <CardDescription>Real-time security and operational alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`h-5 w-5 mt-0.5 ${alert.severity === 'high' ? 'text-destructive animate-pulse' : 'text-warning'}`} />
                      <div>
                        <div className="font-mono text-sm font-medium">{alert.type}</div>
                        <div className="text-sm text-muted-foreground">{alert.message}</div>
                        <div className="flex items-center gap-4 mt-2 text-xs font-mono text-muted-foreground">
                          <span>TIME: {alert.timestamp}</span>
                          {alert.location && <span>LOC: {alert.location}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Button variant="ghost" size="sm" className="text-xs">
                        ACK
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tactical Surveillance Map */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Tactical Surveillance Grid
            </CardTitle>
            <CardDescription>Real-time geospatial intelligence and tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <MapView
              devices={[
                {
                  id: '1',
                  name: 'ALPHA-001',
                  type: 'vehicle',
                  latitude: 37.7749,
                  longitude: -122.4194,
                  status: 'online',
                  lastUpdate: '0.3s ago',
                  speed: 25,
                  heading: 180,
                },
                {
                  id: '2',
                  name: 'BRAVO-LEAD',
                  type: 'employee',
                  latitude: 37.7849,
                  longitude: -122.4094,
                  status: 'online',
                  lastUpdate: '1.2s ago',
                },
                {
                  id: '3',
                  name: 'CHARLIE-EQ01',
                  type: 'equipment',
                  latitude: 37.7649,
                  longitude: -122.4294,
                  status: 'idle',
                  lastUpdate: '5.7s ago',
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Command & Control Center */}
        <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Command className="h-5 w-5 text-primary" />
              Command & Control Center
            </CardTitle>
            <CardDescription>Strategic command operations and emergency protocols</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-24 flex flex-col gap-2 border-destructive/50 hover:bg-destructive/10">
                <Shield className="h-8 w-8 text-destructive" />
                <span className="font-mono text-xs">EMERGENCY</span>
                <span className="font-mono text-xs">PROTOCOL</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2 border-warning/50 hover:bg-warning/10">
                <Radar className="h-8 w-8 text-warning" />
                <span className="font-mono text-xs">FULL SCAN</span>
                <span className="font-mono text-xs">SWEEP</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2 border-primary/50 hover:bg-primary/10">
                <Zap className="h-8 w-8 text-primary" />
                <span className="font-mono text-xs">POWER</span>
                <span className="font-mono text-xs">MANAGEMENT</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2 border-success/50 hover:bg-success/10">
                <Lock className="h-8 w-8 text-success" />
                <span className="font-mono text-xs">SECURE</span>
                <span className="font-mono text-xs">LOCKDOWN</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2 border-info/50 hover:bg-info/10">
                <Wifi className="h-8 w-8 text-info" />
                <span className="font-mono text-xs">COMMS</span>
                <span className="font-mono text-xs">CHECK</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2 border-accent/50 hover:bg-accent/10">
                <Eye className="h-8 w-8 text-accent" />
                <span className="font-mono text-xs">OVERWATCH</span>
                <span className="font-mono text-xs">MODE</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2 border-secondary/50 hover:bg-secondary/10">
                <Activity className="h-8 w-8 text-secondary" />
                <span className="font-mono text-xs">SYSTEM</span>
                <span className="font-mono text-xs">DIAGNOSTICS</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2 border-muted/50 hover:bg-muted/10">
                <Settings className="h-8 w-8 text-muted-foreground" />
                <span className="font-mono text-xs">CONFIG</span>
                <span className="font-mono text-xs">PANEL</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}