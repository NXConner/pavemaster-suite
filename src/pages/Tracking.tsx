import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Clock, Battery, Signal } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface GPSLocation {
  id: string;
  device_id: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  battery_level: number;
  signal_strength: number;
  timestamp: string;
}

interface Device {
  id: string;
  name: string;
  type: string;
  status: string;
  user_id: string;
}

export default function Tracking() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [locations, setLocations] = useState<GPSLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDevices();
      fetchLocations();
    }
  }, [user]);

  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', user?.id);
      
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
        .limit(50);
      
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
      case 'online': return 'bg-success';
      case 'offline': return 'bg-destructive';
      case 'idle': return 'bg-warning';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <MapPin className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">GPS Tracking</h1>
          <p className="text-muted-foreground">Real-time vehicle and crew location monitoring</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => {
          const latestLocation = locations.find(loc => loc.device_id === device.id);
          
          return (
            <Card key={device.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{device.name}</CardTitle>
                  <Badge className={getStatusColor(device.status)}>
                    {device.status || 'Unknown'}
                  </Badge>
                </div>
                <CardDescription>{device.type}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {latestLocation ? (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{latestLocation.latitude.toFixed(6)}, {latestLocation.longitude.toFixed(6)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Navigation className="h-4 w-4" />
                      <span>{latestLocation.speed?.toFixed(1) || '0'} mph</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Battery className="h-4 w-4" />
                      <span>{latestLocation.battery_level || 'N/A'}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Signal className="h-4 w-4" />
                      <span>{latestLocation.signal_strength || 'N/A'} dBm</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(latestLocation.timestamp).toLocaleString()}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">No location data available</p>
                )}
                
                <Button variant="outline" className="w-full">
                  View on Map
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {devices.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Devices Found</h3>
            <p className="text-muted-foreground mb-4">Add GPS tracking devices to monitor vehicle and crew locations.</p>
            <Button>Add Device</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}