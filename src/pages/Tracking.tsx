import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import {
  MapPin,
  Navigation,
  Users,
  Truck,
  Battery,
  Signal,
  Clock,
  Route,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

interface GPSDevice {
  id: string;
  name: string;
  type: 'vehicle' | 'equipment' | 'personnel';
  status: 'online' | 'offline' | 'low_battery';
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  battery: number;
  lastUpdate: string;
  assignedTo?: string;
}

interface LocationHistory {
  id: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  speed: number;
}

export default function TrackingPage() {
  const { toast } = useToast();
  const [devices, setDevices] = useState<GPSDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 39.8283, lng: -98.5795 }); // Center of US

  useEffect(() => {
    loadGPSDevices();
    loadLocationHistory();
    
    // Setup real-time updates
    const interval = setInterval(() => {
      updateDeviceLocations();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadGPSDevices = async () => {
    // Mock data - in real implementation, fetch from Supabase
    const mockDevices: GPSDevice[] = [
      {
        id: '1',
        name: 'Crew Truck #1',
        type: 'vehicle',
        status: 'online',
        latitude: 39.8283,
        longitude: -98.5795,
        speed: 45,
        heading: 180,
        battery: 85,
        lastUpdate: new Date().toISOString(),
        assignedTo: 'John Smith'
      },
      {
        id: '2',
        name: 'Asphalt Paver',
        type: 'equipment',
        status: 'online',
        latitude: 39.8300,
        longitude: -98.5800,
        speed: 0,
        heading: 0,
        battery: 92,
        lastUpdate: new Date().toISOString(),
        assignedTo: 'Mike Johnson'
      },
      {
        id: '3',
        name: 'Material Truck',
        type: 'vehicle',
        status: 'low_battery',
        latitude: 39.8250,
        longitude: -98.5750,
        speed: 25,
        heading: 90,
        battery: 15,
        lastUpdate: new Date().toISOString(),
        assignedTo: 'Tom Wilson'
      }
    ];
    setDevices(mockDevices);
  };

  const loadLocationHistory = async () => {
    // Mock location history data
    const mockHistory: LocationHistory[] = [
      {
        id: '1',
        deviceId: '1',
        latitude: 39.8280,
        longitude: -98.5790,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        speed: 50
      },
      {
        id: '2',
        deviceId: '1',
        latitude: 39.8283,
        longitude: -98.5795,
        timestamp: new Date().toISOString(),
        speed: 45
      }
    ];
    setLocationHistory(mockHistory);
  };

  const updateDeviceLocations = async () => {
    setIsLoading(true);
    try {
      // In real implementation, fetch latest GPS data from Supabase
      await loadGPSDevices();
      toast({
        title: "Locations Updated",
        description: "GPS device locations have been refreshed",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update device locations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'low_battery':
        return <Battery className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'vehicle':
        return <Truck className="h-5 w-5" />;
      case 'equipment':
        return <Zap className="h-5 w-5" />;
      case 'personnel':
        return <Users className="h-5 w-5" />;
      default:
        return <MapPin className="h-5 w-5" />;
    }
  };

  const centerMapOnDevice = (device: GPSDevice) => {
    setMapCenter({ lat: device.latitude, lng: device.longitude });
    setSelectedDevice(device.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">GPS Tracking</h1>
              <p className="text-muted-foreground">
                Real-time location monitoring for crews and equipment
              </p>
            </div>
          </div>
          <Button onClick={updateDeviceLocations} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Locations
          </Button>
        </div>

        <Tabs defaultValue="map" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="map">Live Map</TabsTrigger>
            <TabsTrigger value="devices">Device List</TabsTrigger>
            <TabsTrigger value="history">Location History</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-4">
              {/* Map Area */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Live Location Map
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[500px] bg-muted rounded-md flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
                        <p className="text-muted-foreground mb-4">
                          Map integration with Google Maps or Mapbox will be displayed here
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Current center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Device Quick List */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Device Access</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {devices.map((device) => (
                      <div
                        key={device.id}
                        className={`p-3 rounded-md border cursor-pointer transition-colors ${
                          selectedDevice === device.id
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => centerMapOnDevice(device)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {getDeviceIcon(device.type)}
                          <span className="font-medium text-sm">{device.name}</span>
                          {getStatusIcon(device.status)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <div>Speed: {device.speed} mph</div>
                          <div>Battery: {device.battery}%</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Online Devices:</span>
                        <span className="font-medium text-green-600">
                          {devices.filter(d => d.status === 'online').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Offline Devices:</span>
                        <span className="font-medium text-red-600">
                          {devices.filter(d => d.status === 'offline').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Low Battery:</span>
                        <span className="font-medium text-yellow-600">
                          {devices.filter(d => d.status === 'low_battery').length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="devices" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {devices.map((device) => (
                <Card key={device.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {getDeviceIcon(device.type)}
                      {device.name}
                      {getStatusIcon(device.status)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Type</div>
                        <div className="font-medium capitalize">{device.type}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Status</div>
                        <Badge variant={device.status === 'online' ? 'default' : 'destructive'}>
                          {device.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Speed</div>
                        <div className="font-medium">{device.speed} mph</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Battery</div>
                        <div className="font-medium">{device.battery}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Assigned To</div>
                        <div className="font-medium">{device.assignedTo || 'Unassigned'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Last Update</div>
                        <div className="font-medium">
                          {new Date(device.lastUpdate).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="text-muted-foreground text-sm mb-1">Location</div>
                      <div className="font-mono text-xs">
                        {device.latitude.toFixed(6)}, {device.longitude.toFixed(6)}
                      </div>
                    </div>
                    <Button
                      onClick={() => centerMapOnDevice(device)}
                      className="w-full"
                      variant="outline"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      View on Map
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Location History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {locationHistory.map((entry) => {
                    const device = devices.find(d => d.id === entry.deviceId);
                    return (
                      <div key={entry.id} className="flex items-center gap-4 p-4 border rounded-md">
                        <div className="flex items-center gap-2">
                          {device && getDeviceIcon(device.type)}
                          <div>
                            <div className="font-medium">{device?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(entry.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-mono text-sm">
                            {entry.latitude.toFixed(6)}, {entry.longitude.toFixed(6)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Speed: {entry.speed} mph
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Route className="h-4 w-4 mr-2" />
                          View Route
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}