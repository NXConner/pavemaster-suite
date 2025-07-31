import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { supabase } from '../integrations/supabase/client';
import { Wifi, WifiOff, Activity, Thermometer, MapPin } from 'lucide-react';

interface Device {
  id: string;
  name: string;
  type: string | null;
  status: string | null;
  last_seen: string | null;
  metadata: any;
}

interface GPSLocation {
  id: string;
  device_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  battery_level?: number | null;
  signal_strength?: number | null;
}

export default function IoTHub() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [locations, setLocations] = useState<GPSLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevices();
    fetchLocations();
  }, []);

  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('last_seen', { ascending: false });

      if (error) throw error;
      setDevices(data || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('gps_locations')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading IoT devices...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">IoT Hub</h1>
          <p className="text-muted-foreground">Monitor and manage connected devices</p>
        </div>
        <Button onClick={() => fetchDevices()}>
          <Activity className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {devices.map((device) => (
          <Card key={device.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{device.name}</CardTitle>
              <div className="flex items-center space-x-2">
                {device.status === 'online' ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <div className={`w-2 h-2 rounded-full ${getStatusColor(device.status || 'unknown')}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="outline">{device.type}</Badge>
                <p className="text-xs text-muted-foreground">
                  Last seen: {device.last_seen ? new Date(device.last_seen).toLocaleString() : 'Never'}
                </p>
                {device.metadata?.temperature && (
                  <div className="flex items-center space-x-1">
                    <Thermometer className="h-3 w-3" />
                    <span className="text-xs">{device.metadata.temperature}°F</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent GPS Locations</CardTitle>
          <CardDescription>Latest location updates from tracked devices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {locations.map((location) => (
              <div key={location.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(location.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                {location.battery_level && (
                  <Badge variant="outline">{location.battery_level}% battery</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}