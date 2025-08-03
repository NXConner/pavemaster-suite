import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Wifi, 
  Thermometer, 
  Activity, 
  Zap,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Radio,
  Gauge
} from 'lucide-react';

interface IoTDevice {
  id: string;
  name: string;
  type: 'sensor' | 'tracker' | 'monitor' | 'controller';
  status: 'online' | 'offline' | 'warning' | 'error';
  location: string;
  lastSeen: Date;
  batteryLevel?: number;
  signalStrength: number;
  data: Record<string, any>;
}

interface IoTData {
  deviceId: string;
  timestamp: Date;
  readings: Record<string, number>;
}

const MOCK_DEVICES: IoTDevice[] = [
  {
    id: 'temp-001',
    name: 'Asphalt Temperature Sensor',
    type: 'sensor',
    status: 'online',
    location: '1st Baptist Church - Zone A',
    lastSeen: new Date(),
    batteryLevel: 87,
    signalStrength: 85,
    data: { temperature: 165, humidity: 45 }
  },
  {
    id: 'gps-002',
    name: 'Vehicle Tracker - Unit 3',
    type: 'tracker',
    status: 'online',
    location: 'Grace Methodist Church',
    lastSeen: new Date(Date.now() - 60000),
    batteryLevel: 92,
    signalStrength: 78,
    data: { latitude: 37.5407, longitude: -77.4360, speed: 0 }
  },
  {
    id: 'comp-003',
    name: 'Compactor Pressure Monitor',
    type: 'monitor',
    status: 'warning',
    location: 'Trinity Lutheran - Zone B',
    lastSeen: new Date(Date.now() - 300000),
    batteryLevel: 34,
    signalStrength: 62,
    data: { pressure: 145, vibration: 2.3 }
  }
];

const RECENT_DATA: IoTData[] = [
  {
    deviceId: 'temp-001',
    timestamp: new Date(),
    readings: { temperature: 165, humidity: 45 }
  },
  {
    deviceId: 'gps-002',
    timestamp: new Date(Date.now() - 60000),
    readings: { speed: 0, fuel: 78 }
  }
];

export function IoTManagement() {
  const [devices] = useState<IoTDevice[]>(MOCK_DEVICES);
  const [recentData] = useState<IoTData[]>(RECENT_DATA);
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'offline': return <AlertTriangle className="h-4 w-4 text-gray-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sensor': return <Thermometer className="h-4 w-4 text-blue-500" />;
      case 'tracker': return <MapPin className="h-4 w-4 text-green-500" />;
      case 'monitor': return <Activity className="h-4 w-4 text-purple-500" />;
      case 'controller': return <Zap className="h-4 w-4 text-orange-500" />;
      default: return <Wifi className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      case 'offline': return 'outline';
      default: return 'outline';
    }
  };

  const getBatteryColor = (level?: number) => {
    if (!level) return 'bg-gray-500';
    if (level > 60) return 'bg-green-500';
    if (level > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSignalStrength = (strength: number) => {
    if (strength > 80) return { bars: 4, color: 'text-green-500' };
    if (strength > 60) return { bars: 3, color: 'text-yellow-500' };
    if (strength > 40) return { bars: 2, color: 'text-orange-500' };
    return { bars: 1, color: 'text-red-500' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-border/50 bg-surface/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-primary" />
            IoT Device Management
            <Badge variant="outline" className="ml-2">
              {devices.filter(d => d.status === 'online').length} Online
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Device Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device List */}
        <Card className="border-border/50 bg-surface/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary" />
              Connected Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {devices.map((device) => {
                  const signal = getSignalStrength(device.signalStrength);
                  
                  return (
                    <div
                      key={device.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedDevice?.id === device.id 
                          ? 'border-primary/50 bg-primary/5' 
                          : 'border-border/50 bg-surface/30 hover:border-border/80'
                      }`}
                      onClick={() => setSelectedDevice(device)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(device.type)}
                          <span className="font-medium text-sm">{device.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(device.status)}
                          <Badge variant={getStatusColor(device.status)} className="text-xs">
                            {device.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{device.location}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>Last seen: {device.lastSeen.toLocaleTimeString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {/* Battery Level */}
                            {device.batteryLevel && (
                              <div className="flex items-center gap-1">
                                <div className="w-4 h-2 border border-border/50 rounded-sm bg-background">
                                  <div 
                                    className={`h-full rounded-sm transition-all ${getBatteryColor(device.batteryLevel)}`}
                                    style={{ width: `${device.batteryLevel}%` }}
                                  />
                                </div>
                                <span className="text-xs">{device.batteryLevel}%</span>
                              </div>
                            )}
                            
                            {/* Signal Strength */}
                            <div className={`flex items-center gap-0.5 ${signal.color}`}>
                              {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-1 bg-current rounded-sm ${
                                    i < signal.bars ? 'opacity-100' : 'opacity-20'
                                  }`}
                                  style={{ height: `${(i + 1) * 3}px` }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Device Details */}
        <Card className="border-border/50 bg-surface/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary" />
              Device Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDevice ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {getTypeIcon(selectedDevice.type)}
                  <span className="font-medium">{selectedDevice.name}</span>
                  <Badge variant={getStatusColor(selectedDevice.status)}>
                    {selectedDevice.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Device ID</span>
                    <div className="font-mono text-sm">{selectedDevice.id}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Type</span>
                    <div className="text-sm capitalize">{selectedDevice.type}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Location</span>
                    <div className="text-sm">{selectedDevice.location}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Signal</span>
                    <div className="text-sm">{selectedDevice.signalStrength}%</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium">Current Readings</span>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedDevice.data).map(([key, value]) => (
                      <div key={key} className="p-2 bg-muted rounded-lg">
                        <div className="text-xs text-muted-foreground capitalize">{key}</div>
                        <div className="text-sm font-medium">
                          {typeof value === 'number' ? value.toFixed(1) : value}
                          {key === 'temperature' && '°F'}
                          {key === 'humidity' && '%'}
                          {key === 'pressure' && ' PSI'}
                          {key === 'speed' && ' mph'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium">Actions</span>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline">
                      Configure
                    </Button>
                    <Button size="sm" variant="outline">
                      Calibrate
                    </Button>
                    <Button size="sm" variant="outline">
                      Reset
                    </Button>
                    <Button size="sm" variant="outline">
                      Download Logs
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Wifi className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a device to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Data */}
      <Card className="border-border/50 bg-surface/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Recent Data Stream
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentData.map((data, index) => {
              const device = devices.find(d => d.id === data.deviceId);
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-surface/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {device && getTypeIcon(device.type)}
                    <div>
                      <div className="font-medium text-sm">{device?.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {data.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {Object.entries(data.readings).map(([key, value]) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {key}: {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}