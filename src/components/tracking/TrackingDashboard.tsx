import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { MapView } from './MapView';
import {
  Truck,
  Users,
  Wrench,
  Activity,
  Clock,
  Filter,
  Download,
} from 'lucide-react';

interface TrackingDevice {
  id: string;
  name: string;
  type: 'vehicle' | 'employee' | 'equipment';
  latitude: number;
  longitude: number;
  status: 'online' | 'offline' | 'idle';
  lastUpdate: string;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
  assignedTo?: string;
}

export function TrackingDashboard() {
  const [devices, setDevices] = useState<TrackingDevice[]>([]);
  const [, setSelectedDevice] = useState<TrackingDevice | null>(null);
  const [filter, setFilter] = useState<'all' | 'vehicle' | 'employee' | 'equipment'>('all');

  useEffect(() => {
    // Simulate loading tracking data
    const mockDevices: TrackingDevice[] = [
      {
        id: '1',
        name: 'Truck 001',
        type: 'vehicle',
        latitude: 37.7749,
        longitude: -122.4194,
        status: 'online',
        lastUpdate: '2 min ago',
        speed: 45,
        heading: 180,
        batteryLevel: 85,
        assignedTo: 'John Doe',
      },
      {
        id: '2',
        name: 'Paver Alpha',
        type: 'equipment',
        latitude: 37.7849,
        longitude: -122.4094,
        status: 'idle',
        lastUpdate: '5 min ago',
        batteryLevel: 62,
        assignedTo: 'Mike Smith',
      },
      {
        id: '3',
        name: 'Crew Leader',
        type: 'employee',
        latitude: 37.7649,
        longitude: -122.4294,
        status: 'online',
        lastUpdate: '1 min ago',
        batteryLevel: 78,
      },
      {
        id: '4',
        name: 'Truck 002',
        type: 'vehicle',
        latitude: 37.7549,
        longitude: -122.4394,
        status: 'offline',
        lastUpdate: '45 min ago',
        batteryLevel: 12,
        assignedTo: 'Sarah Johnson',
      },
    ];

    setDevices(mockDevices);
  }, []);

  const filteredDevices = devices.filter(device =>
    filter === 'all' || device.type === filter,
  );

  const stats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    offline: devices.filter(d => d.status === 'offline').length,
    idle: devices.filter(d => d.status === 'idle').length,
    vehicles: devices.filter(d => d.type === 'vehicle').length,
    employees: devices.filter(d => d.type === 'employee').length,
    equipment: devices.filter(d => d.type === 'equipment').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'idle': return 'bg-yellow-500';
      default: return 'bg-card0';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'online': return 'default' as const;
      case 'offline': return 'destructive' as const;
      case 'idle': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">Online</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.online}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm font-medium">Idle</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{stats.idle}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm font-medium">Offline</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.offline}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Vehicles</span>
            </div>
            <div className="text-2xl font-bold">{stats.vehicles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Employees</span>
            </div>
            <div className="text-2xl font-bold">{stats.employees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Equipment</span>
            </div>
            <div className="text-2xl font-bold">{stats.equipment}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tracking Interface */}
      <Tabs defaultValue="map" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="playback">Playback</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <TabsContent value="map" className="space-y-4">
          <MapView devices={filteredDevices} onDeviceSelect={setSelectedDevice} />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setFilter('all'); }}
            >
              All ({stats.total})
            </Button>
            <Button
              variant={filter === 'vehicle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setFilter('vehicle'); }}
            >
              <Truck className="h-4 w-4 mr-2" />
              Vehicles ({stats.vehicles})
            </Button>
            <Button
              variant={filter === 'employee' ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setFilter('employee'); }}
            >
              <Users className="h-4 w-4 mr-2" />
              Employees ({stats.employees})
            </Button>
            <Button
              variant={filter === 'equipment' ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setFilter('equipment'); }}
            >
              <Wrench className="h-4 w-4 mr-2" />
              Equipment ({stats.equipment})
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Device List</CardTitle>
              <CardDescription>
                All tracked devices with current status and location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredDevices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => { setSelectedDevice(device); }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(device.status)}`}></div>
                      <div>
                        <div className="font-medium">{device.name}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {device.type} {device.assignedTo && `• Assigned to ${device.assignedTo}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {device.batteryLevel && (
                        <div className="text-sm">
                          🔋 {device.batteryLevel}%
                        </div>
                      )}
                      <Badge variant={getStatusBadgeVariant(device.status)}>
                        {device.status}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {device.lastUpdate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="playback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historical Playback</CardTitle>
              <CardDescription>
                Review historical tracking data and routes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <div>
                      <label className="text-sm font-medium">Start Date</label>
                      <input type="date" className="w-full mt-1 border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Date</label>
                      <input type="date" className="w-full mt-1 border rounded px-3 py-2" />
                    </div>
                  </div>
                  <Button>Load Playback</Button>
                </div>

                <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <div>Select date range to view historical tracking data</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}