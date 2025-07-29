import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import {
  Wifi,
  WifiOff,
  Thermometer,
  Droplets,
  Wind,
  Zap,
  Gauge,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  RefreshCw,
  Activity,
  TrendingUp,
  TrendingDown,
  Signal,
  Battery,
  Satellite,
  Radio,
  Wrench,
  Eye,
  Shield,
  Bell,
  Download,
  Upload,
  Monitor,
  Cpu,
  HardDrive
} from 'lucide-react';

// IoT Device interfaces
interface IoTDevice {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'pressure' | 'vibration' | 'fuel' | 'gps' | 'camera' | 'weight' | 'ph' | 'air_quality';
  status: 'online' | 'offline' | 'maintenance' | 'error';
  location: {
    name: string;
    coordinates: [number, number];
    project?: string;
  };
  connectivity: {
    type: 'wifi' | 'cellular' | 'lora' | 'bluetooth' | 'satellite';
    signalStrength: number; // 0-100
    lastSeen: string;
    dataRate: number; // bytes/sec
  };
  battery: {
    level: number; // 0-100
    voltage: number;
    charging: boolean;
    estimatedLife: number; // hours
  };
  configuration: {
    samplingRate: number; // seconds
    threshold: {
      min: number;
      max: number;
      critical: number;
    };
    calibrationDate: string;
    firmware: string;
  };
  alerts: IoTAlert[];
  lastReading: IoTReading;
}

interface IoTReading {
  id: string;
  deviceId: string;
  timestamp: string;
  value: number;
  unit: string;
  quality: 'good' | 'fair' | 'poor' | 'error';
  metadata: {
    temperature?: number;
    humidity?: number;
    pressure?: number;
    coordinates?: [number, number];
  };
}

interface IoTAlert {
  id: string;
  deviceId: string;
  type: 'threshold' | 'connectivity' | 'battery' | 'calibration' | 'maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolvedAt?: string;
}

interface EquipmentTelemetry {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'paver' | 'roller' | 'truck' | 'compactor' | 'spreader';
  metrics: {
    engineHours: number;
    fuelLevel: number;
    temperature: number;
    vibration: number;
    speed: number;
    hydraulicPressure: number;
    oilPressure: number;
    coolantLevel: number;
  };
  gps: {
    latitude: number;
    longitude: number;
    altitude: number;
    heading: number;
    speed: number;
  };
  diagnostics: {
    errorCodes: string[];
    warningCodes: string[];
    lastMaintenance: string;
    nextMaintenance: string;
    healthScore: number; // 0-100
  };
  status: 'operating' | 'idle' | 'maintenance' | 'error' | 'offline';
  lastUpdate: string;
}

interface EnvironmentalData {
  timestamp: string;
  location: string;
  coordinates: [number, number];
  weather: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    precipitation: number;
    uvIndex: number;
  };
  airQuality: {
    pm25: number;
    pm10: number;
    ozone: number;
    co: number;
    no2: number;
    so2: number;
    aqi: number;
  };
  soilConditions: {
    moisture: number;
    ph: number;
    temperature: number;
    compaction: number;
  };
}

export default function IoTDashboard() {
  // State management
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [equipment, setEquipment] = useState<EquipmentTelemetry[]>([]);
  const [environmental, setEnvironmental] = useState<EnvironmentalData[]>([]);
  const [alerts, setAlerts] = useState<IoTAlert[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [refreshInterval, setRefreshInterval] = useState<number>(30);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // Load data
  useEffect(() => {
    loadIoTData();
    if (autoRefresh) {
      const interval = setInterval(loadIoTData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadIoTData = () => {
    // Mock IoT data - in production, this would come from IoT platform
    setDevices([
      {
        id: 'temp-001',
        name: 'Asphalt Temperature Sensor',
        type: 'temperature',
        status: 'online',
        location: {
          name: 'Route 29 Project Site',
          coordinates: [38.9072, -77.0369],
          project: 'Route 29 Repaving'
        },
        connectivity: {
          type: 'wifi',
          signalStrength: 87,
          lastSeen: new Date(Date.now() - 30000).toISOString(),
          dataRate: 1024
        },
        battery: {
          level: 78,
          voltage: 3.7,
          charging: false,
          estimatedLife: 48
        },
        configuration: {
          samplingRate: 60,
          threshold: {
            min: 120,
            max: 350,
            critical: 400
          },
          calibrationDate: '2024-01-15',
          firmware: 'v2.1.3'
        },
        alerts: [],
        lastReading: {
          id: 'reading-1',
          deviceId: 'temp-001',
          timestamp: new Date().toISOString(),
          value: 285,
          unit: '°F',
          quality: 'good',
          metadata: {
            humidity: 45,
            pressure: 1013.25
          }
        }
      },
      {
        id: 'gps-002',
        name: 'Fleet Tracker #FL-001',
        type: 'gps',
        status: 'online',
        location: {
          name: 'Church Parking Lot',
          coordinates: [38.8977, -77.0365]
        },
        connectivity: {
          type: 'cellular',
          signalStrength: 92,
          lastSeen: new Date(Date.now() - 15000).toISOString(),
          dataRate: 2048
        },
        battery: {
          level: 95,
          voltage: 12.6,
          charging: true,
          estimatedLife: 120
        },
        configuration: {
          samplingRate: 30,
          threshold: {
            min: 0,
            max: 80,
            critical: 100
          },
          calibrationDate: '2024-01-10',
          firmware: 'v3.0.1'
        },
        alerts: [],
        lastReading: {
          id: 'reading-2',
          deviceId: 'gps-002',
          timestamp: new Date().toISOString(),
          value: 35,
          unit: 'mph',
          quality: 'good',
          metadata: {
            coordinates: [38.8977, -77.0365]
          }
        }
      },
      {
        id: 'vib-003',
        name: 'Roller Compactor Vibration Monitor',
        type: 'vibration',
        status: 'maintenance',
        location: {
          name: 'Highway Sealcoating Site',
          coordinates: [38.9100, -77.0300]
        },
        connectivity: {
          type: 'bluetooth',
          signalStrength: 65,
          lastSeen: new Date(Date.now() - 300000).toISOString(),
          dataRate: 512
        },
        battery: {
          level: 25,
          voltage: 3.2,
          charging: false,
          estimatedLife: 6
        },
        configuration: {
          samplingRate: 10,
          threshold: {
            min: 0,
            max: 50,
            critical: 80
          },
          calibrationDate: '2023-12-20',
          firmware: 'v1.9.8'
        },
        alerts: [
          {
            id: 'alert-1',
            deviceId: 'vib-003',
            type: 'battery',
            severity: 'high',
            message: 'Battery level critically low (25%)',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            acknowledged: false
          }
        ],
        lastReading: {
          id: 'reading-3',
          deviceId: 'vib-003',
          timestamp: new Date().toISOString(),
          value: 45.2,
          unit: 'Hz',
          quality: 'fair',
          metadata: {
            temperature: 68
          }
        }
      }
    ]);

    setEquipment([
      {
        id: 'eq-001',
        equipmentId: 'FL-001',
        equipmentName: 'Asphalt Paver #1',
        type: 'paver',
        metrics: {
          engineHours: 1247.5,
          fuelLevel: 73,
          temperature: 185,
          vibration: 2.3,
          speed: 3.2,
          hydraulicPressure: 2100,
          oilPressure: 45,
          coolantLevel: 88
        },
        gps: {
          latitude: 38.9072,
          longitude: -77.0369,
          altitude: 95,
          heading: 127,
          speed: 3.2
        },
        diagnostics: {
          errorCodes: [],
          warningCodes: ['W001: Air filter needs attention'],
          lastMaintenance: '2024-01-10',
          nextMaintenance: '2024-02-10',
          healthScore: 87
        },
        status: 'operating',
        lastUpdate: new Date().toISOString()
      },
      {
        id: 'eq-002',
        equipmentId: 'FL-002',
        equipmentName: 'Roller Compactor #2',
        type: 'roller',
        metrics: {
          engineHours: 892.3,
          fuelLevel: 45,
          temperature: 201,
          vibration: 45.8,
          speed: 2.1,
          hydraulicPressure: 1950,
          oilPressure: 42,
          coolantLevel: 82
        },
        gps: {
          latitude: 38.9100,
          longitude: -77.0300,
          altitude: 98,
          heading: 95,
          speed: 2.1
        },
        diagnostics: {
          errorCodes: ['E102: Hydraulic pressure anomaly'],
          warningCodes: [],
          lastMaintenance: '2024-01-05',
          nextMaintenance: '2024-02-05',
          healthScore: 74
        },
        status: 'maintenance',
        lastUpdate: new Date().toISOString()
      }
    ]);

    setEnvironmental([
      {
        timestamp: new Date().toISOString(),
        location: 'Route 29 Project Site',
        coordinates: [38.9072, -77.0369],
        weather: {
          temperature: 72,
          humidity: 55,
          pressure: 1013.2,
          windSpeed: 8.3,
          windDirection: 230,
          precipitation: 0,
          uvIndex: 6
        },
        airQuality: {
          pm25: 12.5,
          pm10: 18.7,
          ozone: 0.065,
          co: 0.8,
          no2: 0.025,
          so2: 0.005,
          aqi: 42
        },
        soilConditions: {
          moisture: 23.5,
          ph: 7.2,
          temperature: 68,
          compaction: 85
        }
      }
    ]);

    // Collect all alerts
    const allAlerts = devices.flatMap(device => device.alerts);
    setAlerts(allAlerts);
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': case 'operating': return 'text-green-600';
      case 'offline': case 'error': return 'text-red-600';
      case 'maintenance': return 'text-yellow-600';
      case 'idle': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': case 'operating': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'offline': case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'maintenance': return <Wrench className="h-4 w-4 text-yellow-600" />;
      case 'idle': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getConnectivityIcon = (type: string) => {
    switch (type) {
      case 'wifi': return <Wifi className="h-4 w-4" />;
      case 'cellular': return <Signal className="h-4 w-4" />;
      case 'lora': return <Radio className="h-4 w-4" />;
      case 'bluetooth': return <Radio className="h-4 w-4" />;
      case 'satellite': return <Satellite className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-blue-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      critical: 'bg-red-500'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-500';
  };

  // Chart data
  const deviceStatusData = [
    { name: 'Online', value: devices.filter(d => d.status === 'online').length, color: '#22c55e' },
    { name: 'Offline', value: devices.filter(d => d.status === 'offline').length, color: '#ef4444' },
    { name: 'Maintenance', value: devices.filter(d => d.status === 'maintenance').length, color: '#eab308' },
    { name: 'Error', value: devices.filter(d => d.status === 'error').length, color: '#f97316' }
  ];

  const batteryData = devices.map(device => ({
    name: device.name.slice(0, 10) + '...',
    battery: device.battery.level,
    status: device.status
  }));

  const signalStrengthData = devices.map(device => ({
    name: device.name.slice(0, 10) + '...',
    signal: device.connectivity.signalStrength,
    type: device.connectivity.type
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Monitor className="h-8 w-8 text-blue-600" />
            IoT & Equipment Monitoring
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring of sensors, equipment, and environmental conditions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 seconds</SelectItem>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">1 minute</SelectItem>
              <SelectItem value="300">5 minutes</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Devices</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.filter(d => d.status === 'online').length}</div>
            <div className="text-xs text-muted-foreground">
              of {devices.length} total devices
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Equipment</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipment.filter(e => e.status === 'operating').length}</div>
            <div className="text-xs text-muted-foreground">
              of {equipment.length} total units
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{alerts.filter(a => !a.acknowledged).length}</div>
            <div className="text-xs text-muted-foreground">
              {alerts.filter(a => a.severity === 'critical').length} critical
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94.3%</div>
            <div className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +2.1% from last week
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Device Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {deviceStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Battery Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={batteryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="battery" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Readings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sensor Readings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.slice(0, 5).map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(device.status)}
                      <div>
                        <p className="font-medium">{device.name}</p>
                        <p className="text-sm text-muted-foreground">{device.location.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {device.lastReading.value} {device.lastReading.unit}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(device.lastReading.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <div className="grid gap-4">
            {devices.map((device) => (
              <Card key={device.id} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(device.status)}
                      <h3 className="font-semibold text-lg">{device.name}</h3>
                      <Badge variant="outline" className="capitalize">{device.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{device.location.name}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        {getConnectivityIcon(device.connectivity.type)}
                        <span>{device.connectivity.signalStrength}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Battery className="h-4 w-4" />
                        <span>{device.battery.level}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(device.connectivity.lastSeen).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {device.lastReading.value} {device.lastReading.unit}
                    </div>
                    <div className="text-sm text-muted-foreground">Current Reading</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Signal Strength</div>
                    <Progress value={device.connectivity.signalStrength} className="mt-1" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Battery Level</div>
                    <Progress value={device.battery.level} className="mt-1" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Data Rate</div>
                    <div className="font-medium">{(device.connectivity.dataRate / 1024).toFixed(1)} KB/s</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Firmware</div>
                    <div className="font-medium">{device.configuration.firmware}</div>
                  </div>
                </div>

                {device.alerts.length > 0 && (
                  <div className="border-t pt-3">
                    <h4 className="font-medium mb-2 text-orange-600">Active Alerts</h4>
                    {device.alerts.map((alert) => (
                      <div key={alert.id} className="flex items-center gap-2 text-sm">
                        <Badge className={getSeverityBadge(alert.severity)}>{alert.severity}</Badge>
                        <span>{alert.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3 mr-1" />
                    Export Data
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-6">
          <div className="grid gap-4">
            {equipment.map((eq) => (
              <Card key={eq.id} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(eq.status)}
                      <h3 className="font-semibold text-lg">{eq.equipmentName}</h3>
                      <Badge variant="outline" className="capitalize">{eq.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">ID: {eq.equipmentId}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{eq.gps.latitude.toFixed(4)}, {eq.gps.longitude.toFixed(4)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{eq.diagnostics.healthScore}%</div>
                    <div className="text-sm text-muted-foreground">Health Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Engine Hours</div>
                    <div className="font-medium">{eq.metrics.engineHours.toFixed(1)} hrs</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Fuel Level</div>
                    <Progress value={eq.metrics.fuelLevel} className="mt-1" />
                    <div className="text-sm font-medium">{eq.metrics.fuelLevel}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Temperature</div>
                    <div className="font-medium flex items-center gap-1">
                      <Thermometer className="h-4 w-4" />
                      {eq.metrics.temperature}°F
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Speed</div>
                    <div className="font-medium">{eq.metrics.speed} mph</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Oil Pressure</div>
                    <div className="font-medium">{eq.metrics.oilPressure} PSI</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Hydraulic Pressure</div>
                    <div className="font-medium">{eq.metrics.hydraulicPressure} PSI</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Coolant Level</div>
                    <Progress value={eq.metrics.coolantLevel} className="mt-1" />
                    <div className="text-sm font-medium">{eq.metrics.coolantLevel}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Vibration</div>
                    <div className="font-medium">{eq.metrics.vibration} Hz</div>
                  </div>
                </div>

                {(eq.diagnostics.errorCodes.length > 0 || eq.diagnostics.warningCodes.length > 0) && (
                  <div className="border-t pt-3">
                    <h4 className="font-medium mb-2">Diagnostics</h4>
                    {eq.diagnostics.errorCodes.map((code, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm mb-1">
                        <Badge className="bg-red-500">Error</Badge>
                        <span>{code}</span>
                      </div>
                    ))}
                    {eq.diagnostics.warningCodes.map((code, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm mb-1">
                        <Badge className="bg-yellow-500">Warning</Badge>
                        <span>{code}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline">
                    <MapPin className="h-3 w-3 mr-1" />
                    Track Location
                  </Button>
                  <Button size="sm" variant="outline">
                    <Wrench className="h-3 w-3 mr-1" />
                    Schedule Maintenance
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3 mr-1" />
                    Export Telemetry
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="environmental" className="space-y-6">
          {environmental.map((env, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{env.location}</h3>
                  <p className="text-sm text-muted-foreground">
                    {env.coordinates[0].toFixed(4)}, {env.coordinates[1].toFixed(4)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(env.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{env.weather.temperature}°F</div>
                  <div className="text-sm text-muted-foreground">Current Temperature</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <Thermometer className="h-6 w-6 mx-auto mb-1 text-orange-500" />
                  <div className="font-medium">{env.weather.temperature}°F</div>
                  <div className="text-sm text-muted-foreground">Temperature</div>
                </div>
                <div className="text-center">
                  <Droplets className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                  <div className="font-medium">{env.weather.humidity}%</div>
                  <div className="text-sm text-muted-foreground">Humidity</div>
                </div>
                <div className="text-center">
                  <Wind className="h-6 w-6 mx-auto mb-1 text-gray-500" />
                  <div className="font-medium">{env.weather.windSpeed} mph</div>
                  <div className="text-sm text-muted-foreground">Wind Speed</div>
                </div>
                <div className="text-center">
                  <Gauge className="h-6 w-6 mx-auto mb-1 text-purple-500" />
                  <div className="font-medium">{env.weather.pressure} mb</div>
                  <div className="text-sm text-muted-foreground">Pressure</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Air Quality</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">AQI</span>
                      <span className="font-medium text-green-600">{env.airQuality.aqi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">PM2.5</span>
                      <span className="font-medium">{env.airQuality.pm25} μg/m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">PM10</span>
                      <span className="font-medium">{env.airQuality.pm10} μg/m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Ozone</span>
                      <span className="font-medium">{env.airQuality.ozone} ppm</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Soil Conditions</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Moisture</span>
                      <span className="font-medium">{env.soilConditions.moisture}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">pH Level</span>
                      <span className="font-medium">{env.soilConditions.ph}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Temperature</span>
                      <span className="font-medium">{env.soilConditions.temperature}°F</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Compaction</span>
                      <span className="font-medium">{env.soilConditions.compaction}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Alerts</h3>
                <p className="text-muted-foreground">All systems are operating normally</p>
              </Card>
            ) : (
              alerts.map((alert) => (
                <Card key={alert.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityBadge(alert.severity)}>{alert.severity}</Badge>
                        <Badge variant="outline" className="capitalize">{alert.type}</Badge>
                        {!alert.acknowledged && <Badge variant="secondary">New</Badge>}
                      </div>
                      <h3 className="font-semibold">{alert.message}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Device: {devices.find(d => d.id === alert.deviceId)?.name || alert.deviceId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!alert.acknowledged && (
                        <Button size="sm" variant="outline">
                          Acknowledge
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        View Device
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}