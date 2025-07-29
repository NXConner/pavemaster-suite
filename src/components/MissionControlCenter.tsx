import React, { useState, useEffect, useRef } from 'react';
import { 
  Satellite, Radio, Globe, Radar, Target, Shield, Zap, AlertTriangle,
  Command, Activity, TrendingUp, Users, DollarSign, Clock, MapPin,
  Brain, Eye, Settings, Play, Pause, Volume2, VolumeX, Maximize,
  Monitor, Server, Database, Network, Cpu, HardDrive, Battery,
  Thermometer, Wind, CloudRain, Sun, Moon, Calendar, Timer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MissionStatus {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'on_hold' | 'critical';
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  team_size: number;
  estimated_completion: string;
  location: string;
  budget_used: number;
  budget_total: number;
}

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  network_load: number;
  database_connections: number;
  api_response_time: number;
  active_users: number;
  error_rate: number;
  uptime: string;
}

interface ThreatAlert {
  id: string;
  type: 'security' | 'safety' | 'operational' | 'financial';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  location?: string;
  timestamp: string;
  acknowledged: boolean;
  escalated: boolean;
}

interface CommunicationChannel {
  id: string;
  name: string;
  type: 'radio' | 'satellite' | 'cellular' | 'internet';
  status: 'online' | 'offline' | 'degraded';
  signal_strength: number;
  active_connections: number;
  bandwidth_usage: number;
}

const MissionControlCenter: React.FC = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [missions, setMissions] = useState<MissionStatus[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [threats, setThreats] = useState<ThreatAlert[]>([]);
  const [communications, setCommunications] = useState<CommunicationChannel[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [militaryJargon, setMilitaryJargon] = useState(true);
  const [alertLevel, setAlertLevel] = useState<'green' | 'yellow' | 'orange' | 'red'>('green');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshRate, setRefreshRate] = useState(5); // seconds
  const [showWeather, setShowWeather] = useState(true);
  const [weather, setWeather] = useState({
    temperature: 72,
    condition: 'Clear',
    wind_speed: 8,
    humidity: 45,
    visibility: 10
  });

  const refreshInterval = useRef<NodeJS.Timeout>();
  const audioContext = useRef<AudioContext>();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }
      
      setUserRole(data?.role);
    };

    checkUserRole();
  }, [user]);

  useEffect(() => {
    if (userRole && ['super_admin', 'admin'].includes(userRole)) {
      initializeMissionControl();
      if (autoRefresh) {
        startAutoRefresh();
      }
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [userRole, autoRefresh, refreshRate]);

  const initializeMissionControl = async () => {
    await Promise.all([
      loadMissions(),
      loadSystemMetrics(),
      loadThreats(),
      loadCommunications(),
      loadWeatherData()
    ]);
  };

  const startAutoRefresh = () => {
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
    }

    refreshInterval.current = setInterval(() => {
      initializeMissionControl();
    }, refreshRate * 1000);
  };

  const loadMissions = async () => {
    // Simulate mission data
    const missionData: MissionStatus[] = [
      {
        id: 'mission_001',
        name: 'Operation Alpha',
        status: 'active',
        progress: 67,
        priority: 'high',
        team_size: 12,
        estimated_completion: '2024-01-15T18:00:00Z',
        location: 'Site A-7',
        budget_used: 145000,
        budget_total: 200000
      },
      {
        id: 'mission_002',
        name: 'Project Beta Shield',
        status: 'critical',
        progress: 23,
        priority: 'critical',
        team_size: 8,
        estimated_completion: '2024-01-12T14:30:00Z',
        location: 'Sector 9',
        budget_used: 89000,
        budget_total: 120000
      },
      {
        id: 'mission_003',
        name: 'Maintenance Gamma',
        status: 'active',
        progress: 89,
        priority: 'medium',
        team_size: 5,
        estimated_completion: '2024-01-10T16:00:00Z',
        location: 'Base Operations',
        budget_used: 67000,
        budget_total: 75000
      },
      {
        id: 'mission_004',
        name: 'Security Sweep Delta',
        status: 'completed',
        progress: 100,
        priority: 'medium',
        team_size: 6,
        estimated_completion: '2024-01-08T12:00:00Z',
        location: 'Perimeter Zone',
        budget_used: 34000,
        budget_total: 35000
      }
    ];

    setMissions(missionData);
  };

  const loadSystemMetrics = async () => {
    const metrics: SystemMetrics = {
      cpu_usage: 23 + Math.random() * 10,
      memory_usage: 45 + Math.random() * 15,
      network_load: 67 + Math.random() * 20,
      database_connections: Math.floor(Math.random() * 50) + 25,
      api_response_time: 150 + Math.random() * 100,
      active_users: Math.floor(Math.random() * 20) + 45,
      error_rate: Math.random() * 2,
      uptime: '99.7%'
    };

    setSystemMetrics(metrics);
  };

  const loadThreats = async () => {
    const threatData: ThreatAlert[] = [
      {
        id: 'threat_001',
        type: 'security',
        severity: 'medium',
        message: 'Unauthorized access attempt detected in Sector 7',
        location: 'Sector 7',
        timestamp: new Date().toISOString(),
        acknowledged: false,
        escalated: false
      },
      {
        id: 'threat_002',
        type: 'safety',
        severity: 'high',
        message: 'Weather alert: High winds expected in operational area',
        timestamp: new Date().toISOString(),
        acknowledged: true,
        escalated: false
      },
      {
        id: 'threat_003',
        type: 'operational',
        severity: 'low',
        message: 'Equipment maintenance required for Unit 7',
        location: 'Equipment Bay',
        timestamp: new Date().toISOString(),
        acknowledged: true,
        escalated: false
      }
    ];

    setThreats(threatData);
    
    // Determine alert level based on threats
    const criticalThreats = threatData.filter(t => t.severity === 'critical').length;
    const highThreats = threatData.filter(t => t.severity === 'high').length;
    
    if (criticalThreats > 0) setAlertLevel('red');
    else if (highThreats > 0) setAlertLevel('orange');
    else if (threatData.filter(t => t.severity === 'medium').length > 2) setAlertLevel('yellow');
    else setAlertLevel('green');
  };

  const loadCommunications = async () => {
    const commData: CommunicationChannel[] = [
      {
        id: 'comm_001',
        name: 'Primary Radio',
        type: 'radio',
        status: 'online',
        signal_strength: 95,
        active_connections: 12,
        bandwidth_usage: 23
      },
      {
        id: 'comm_002',
        name: 'Satellite Uplink',
        type: 'satellite',
        status: 'online',
        signal_strength: 87,
        active_connections: 8,
        bandwidth_usage: 67
      },
      {
        id: 'comm_003',
        name: 'Cellular Network',
        type: 'cellular',
        status: 'degraded',
        signal_strength: 42,
        active_connections: 15,
        bandwidth_usage: 89
      },
      {
        id: 'comm_004',
        name: 'Internet Backbone',
        type: 'internet',
        status: 'online',
        signal_strength: 98,
        active_connections: 45,
        bandwidth_usage: 34
      }
    ];

    setCommunications(commData);
  };

  const loadWeatherData = async () => {
    // Simulate weather updates
    setWeather({
      temperature: 70 + Math.random() * 20,
      condition: ['Clear', 'Partly Cloudy', 'Overcast', 'Rain'][Math.floor(Math.random() * 4)],
      wind_speed: Math.floor(Math.random() * 20) + 5,
      humidity: Math.floor(Math.random() * 40) + 30,
      visibility: Math.floor(Math.random() * 5) + 5
    });
  };

  const playAlertSound = (severity: string) => {
    if (!audioEnabled || !audioContext.current) return;

    const frequencies = {
      low: 200,
      medium: 400,
      high: 800,
      critical: 1200
    };

    const freq = frequencies[severity as keyof typeof frequencies] || 400;
    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.setValueAtTime(freq, audioContext.current.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.current.currentTime);

    oscillator.start();
    oscillator.stop(audioContext.current.currentTime + 0.5);
  };

  const acknowledgeAlert = async (alertId: string) => {
    setThreats(prev => prev.map(threat => 
      threat.id === alertId 
        ? { ...threat, acknowledged: true }
        : threat
    ));

    toast({
      title: "Alert Acknowledged",
      description: "Threat alert has been marked as acknowledged"
    });
  };

  const escalateAlert = async (alertId: string) => {
    setThreats(prev => prev.map(threat => 
      threat.id === alertId 
        ? { ...threat, escalated: true }
        : threat
    ));

    toast({
      title: "Alert Escalated",
      description: "Threat alert has been escalated to command"
    });
  };

  const getJargonText = (civilian: string, military: string) => {
    return militaryJargon ? military : civilian;
  };

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'orange': return 'bg-orange-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getMissionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'on_hold': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return <Badge variant="destructive">CRITICAL</Badge>;
      case 'high': return <Badge variant="default">HIGH</Badge>;
      case 'medium': return <Badge variant="secondary">MEDIUM</Badge>;
      case 'low': return <Badge variant="outline">LOW</Badge>;
      default: return <Badge variant="outline">UNKNOWN</Badge>;
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear': return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'partly cloudy': return <CloudRain className="h-5 w-5 text-gray-500" />;
      case 'overcast': return <CloudRain className="h-5 w-5 text-gray-600" />;
      case 'rain': return <CloudRain className="h-5 w-5 text-blue-500" />;
      default: return <Sun className="h-5 w-5" />;
    }
  };

  if (!userRole || !['super_admin', 'admin'].includes(userRole)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center">
          <Satellite className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">Mission Control Access Denied</h2>
          <p className="text-muted-foreground">
            {getJargonText(
              'Command authorization required for Mission Control Center',
              'DEFCON clearance required for Command Operations'
            )}
          </p>
        </Card>
      </div>
    );
  }

  const mainContent = (
    <div className="min-h-screen bg-black text-white p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 pb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Command className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">
              {getJargonText('Mission Control Center', 'COMMAND OPERATIONS CENTER')}
            </h1>
          </div>
          <div className={`w-4 h-4 rounded-full ${getAlertLevelColor(alertLevel)} animate-pulse`}></div>
          <Badge variant="outline" className="border-white text-white">
            DEFCON {alertLevel.toUpperCase()}
          </Badge>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="military-jargon"
              checked={militaryJargon}
              onCheckedChange={setMilitaryJargon}
            />
            <Label htmlFor="military-jargon" className="text-xs text-white">
              {getJargonText('Military', 'Tactical')}
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="text-white hover:bg-gray-800"
            >
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-white hover:bg-gray-800"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">
        {/* Left Column - Missions & Systems */}
        <div className="col-span-4 space-y-4">
          {/* Active Missions */}
          <Card className="bg-gray-900 border-gray-700 h-1/2">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>{getJargonText('Active Missions', 'OPERATIONAL STATUS')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {missions.filter(m => m.status !== 'completed').map(mission => (
                    <div key={mission.id} className="border border-gray-700 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">{mission.name}</h4>
                        {getPriorityBadge(mission.priority)}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Progress:</span>
                          <span className="text-white">{mission.progress}%</span>
                        </div>
                        <Progress value={mission.progress} className="h-1" />
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Team:</span>
                          <span className="text-white">{mission.team_size} personnel</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Location:</span>
                          <span className="text-white">{mission.location}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Budget:</span>
                          <span className={mission.budget_used > mission.budget_total * 0.9 ? 'text-red-400' : 'text-green-400'}>
                            ${mission.budget_used.toLocaleString()} / ${mission.budget_total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="bg-gray-900 border-gray-700 h-1/2">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center space-x-2">
                <Server className="h-5 w-5 text-primary" />
                <span>{getJargonText('System Status', 'INFRASTRUCTURE STATUS')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {systemMetrics && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">CPU:</span>
                        <span className="text-white">{systemMetrics.cpu_usage.toFixed(1)}%</span>
                      </div>
                      <Progress value={systemMetrics.cpu_usage} className="h-1 mt-1" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Memory:</span>
                        <span className="text-white">{systemMetrics.memory_usage.toFixed(1)}%</span>
                      </div>
                      <Progress value={systemMetrics.memory_usage} className="h-1 mt-1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Network Load:</span>
                      <span className="text-white">{systemMetrics.network_load.toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Active Users:</span>
                      <span className="text-white">{systemMetrics.active_users}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">DB Connections:</span>
                      <span className="text-white">{systemMetrics.database_connections}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">API Response:</span>
                      <span className="text-white">{systemMetrics.api_response_time.toFixed(0)}ms</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Error Rate:</span>
                      <span className={systemMetrics.error_rate > 1 ? 'text-red-400' : 'text-green-400'}>
                        {systemMetrics.error_rate.toFixed(2)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Uptime:</span>
                      <span className="text-green-400">{systemMetrics.uptime}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Threat Matrix & Communications */}
        <div className="col-span-4 space-y-4">
          {/* Threat Matrix */}
          <Card className="bg-gray-900 border-gray-700 h-1/2">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>{getJargonText('Threat Matrix', 'THREAT ASSESSMENT')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {threats.map(threat => (
                    <div 
                      key={threat.id} 
                      className={`border rounded p-3 ${
                        threat.severity === 'critical' ? 'border-red-500 bg-red-950' :
                        threat.severity === 'high' ? 'border-orange-500 bg-orange-950' :
                        threat.severity === 'medium' ? 'border-yellow-500 bg-yellow-950' :
                        'border-gray-600 bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={
                          threat.severity === 'critical' ? 'destructive' :
                          threat.severity === 'high' ? 'default' :
                          threat.severity === 'medium' ? 'secondary' : 'outline'
                        }>
                          {threat.severity.toUpperCase()}
                        </Badge>
                        <div className="flex space-x-1">
                          {!threat.acknowledged && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => acknowledgeAlert(threat.id)}
                              className="h-6 text-xs"
                            >
                              ACK
                            </Button>
                          )}
                          {!threat.escalated && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => escalateAlert(threat.id)}
                              className="h-6 text-xs"
                            >
                              ESC
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-white mb-2">{threat.message}</p>
                      
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{threat.type.toUpperCase()}</span>
                        {threat.location && <span>{threat.location}</span>}
                        <span>{new Date(threat.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Communications */}
          <Card className="bg-gray-900 border-gray-700 h-1/2">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center space-x-2">
                <Radio className="h-5 w-5 text-primary" />
                <span>{getJargonText('Communications', 'COMMS STATUS')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {communications.map(comm => (
                  <div key={comm.id} className="border border-gray-700 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{comm.name}</h4>
                      <Badge variant={
                        comm.status === 'online' ? 'default' :
                        comm.status === 'degraded' ? 'secondary' : 'destructive'
                      }>
                        {comm.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Signal Strength:</span>
                        <span className="text-white">{comm.signal_strength}%</span>
                      </div>
                      <Progress value={comm.signal_strength} className="h-1" />
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Connections:</span>
                        <span className="text-white">{comm.active_connections}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bandwidth:</span>
                        <span className="text-white">{comm.bandwidth_usage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Situational Awareness & Weather */}
        <div className="col-span-4 space-y-4">
          {/* Weather & Environmental */}
          {showWeather && (
            <Card className="bg-gray-900 border-gray-700 h-1/3">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center space-x-2">
                  {getWeatherIcon(weather.condition)}
                  <span>{getJargonText('Weather Conditions', 'ENVIRONMENTAL STATUS')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Temperature:</span>
                      <span className="text-white">{Math.round(weather.temperature)}°F</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Condition:</span>
                      <span className="text-white">{weather.condition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Wind Speed:</span>
                      <span className="text-white">{weather.wind_speed} mph</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Humidity:</span>
                      <span className="text-white">{weather.humidity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Visibility:</span>
                      <span className="text-white">{weather.visibility} mi</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="bg-gray-900 border-gray-700 h-1/3">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>{getJargonText('Quick Actions', 'RAPID RESPONSE')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-white border-gray-600 hover:bg-gray-800"
                  onClick={() => toast({ title: "Emergency Alert Sent" })}
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Emergency
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-white border-gray-600 hover:bg-gray-800"
                  onClick={() => toast({ title: "All Teams Contacted" })}
                >
                  <Radio className="h-4 w-4 mr-1" />
                  All Call
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-white border-gray-600 hover:bg-gray-800"
                  onClick={() => setAlertLevel('red')}
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Lockdown
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-white border-gray-600 hover:bg-gray-800"
                  onClick={() => initializeMissionControl()}
                >
                  <Activity className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="bg-gray-900 border-gray-700 h-1/3">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center space-x-2">
                <Settings className="h-5 w-5 text-gray-400" />
                <span>{getJargonText('Control Settings', 'SYSTEM CONFIG')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-white text-sm">Auto Refresh</Label>
                <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white text-sm">Refresh Rate: {refreshRate}s</Label>
                <Slider
                  value={[refreshRate]}
                  onValueChange={(value) => setRefreshRate(value[0])}
                  min={1}
                  max={60}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-white text-sm">Show Weather</Label>
                <Switch checked={showWeather} onCheckedChange={setShowWeather} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50">
        {mainContent}
      </div>
    );
  }

  return mainContent;
};

export default MissionControlCenter;