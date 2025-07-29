import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Battery, 
  Download, 
  Upload,
  MapPin,
  Camera,
  Mic,
  Bell,
  Briefcase,
  FileText,
  Ruler,
  Tablet
} from 'lucide-react';

interface MobileDevice {
  id: string;
  name: string;
  type: 'phone' | 'tablet';
  status: 'online' | 'offline' | 'syncing';
  battery: number;
  location?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  lastSync: Date;
  pendingUploads: number;
}

interface OfflineData {
  projects: number;
  photos: number;
  reports: number;
  measurements: number;
}

export default function MobileHub() {
  const [devices, setDevices] = useState<MobileDevice[]>([]);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    projects: 0,
    photos: 0,
    reports: 0,
    measurements: 0
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'complete'>('idle');

  useEffect(() => {
    // Simulate fetching mobile devices
    const mockDevices: MobileDevice[] = [
      {
        id: '1',
        name: 'Field Crew iPhone',
        type: 'phone',
        status: 'online',
        battery: 85,
        location: {
          lat: 38.9072,
          lng: -77.0369,
          timestamp: new Date()
        },
        lastSync: new Date(Date.now() - 300000), // 5 minutes ago
        pendingUploads: 3
      },
      {
        id: '2',
        name: 'Site Manager iPad',
        type: 'tablet',
        status: 'offline',
        battery: 45,
        lastSync: new Date(Date.now() - 3600000), // 1 hour ago
        pendingUploads: 7
      },
      {
        id: '3',
        name: 'Quality Control Phone',
        type: 'phone',
        status: 'syncing',
        battery: 92,
        location: {
          lat: 38.8951,
          lng: -77.0364,
          timestamp: new Date()
        },
        lastSync: new Date(Date.now() - 600000), // 10 minutes ago
        pendingUploads: 0
      }
    ];

    setDevices(mockDevices);

    // Simulate offline data
    setOfflineData({
      projects: 12,
      photos: 48,
      reports: 23,
      measurements: 156
    });

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'syncing': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return 'text-green-600';
    if (battery > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSyncAll = async () => {
    setSyncStatus('syncing');
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setSyncStatus('complete');
    
    // Reset pending uploads
    setDevices(devices.map(device => ({ ...device, pendingUploads: 0, lastSync: new Date() })));
    
    setTimeout(() => setSyncStatus('idle'), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mobile Hub</h1>
          <p className="text-muted-foreground">
            Manage field devices and offline capabilities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isOnline ? "default" : "destructive"} className="gap-1">
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          <Button 
            onClick={handleSyncAll}
            disabled={syncStatus === 'syncing'}
            className="gap-2"
          >
            {syncStatus === 'syncing' ? (
              <>
                <Upload className="h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : syncStatus === 'complete' ? (
              <>
                <Download className="h-4 w-4" />
                Synced
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Sync All
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Offline Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Offline Projects</p>
                <p className="text-2xl font-bold">{offlineData.projects}</p>
              </div>
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cached Photos</p>
                <p className="text-2xl font-bold">{offlineData.photos}</p>
              </div>
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Reports</p>
                <p className="text-2xl font-bold">{offlineData.reports}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Measurements</p>
                <p className="text-2xl font-bold">{offlineData.measurements}</p>
              </div>
              <Ruler className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Connected Devices
          </CardTitle>
          <CardDescription>
            Field devices and their synchronization status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {device.type === 'phone' ? (
                      <Smartphone className="h-8 w-8" />
                    ) : (
                      <Tablet className="h-8 w-8" />
                    )}
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(device.status)}`} />
                  </div>
                  
                  <div>
                    <p className="font-medium">{device.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Battery className={`h-3 w-3 ${getBatteryColor(device.battery)}`} />
                        {device.battery}%
                      </span>
                      {device.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Location active
                        </span>
                      )}
                      <span>Last sync: {device.lastSync.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {device.pendingUploads > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <Upload className="h-3 w-3" />
                      {device.pendingUploads} pending
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {device.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Push Notifications
            </CardTitle>
            <CardDescription>
              Real-time alerts and updates for field crews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Project Updates</span>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Weather Alerts</span>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Equipment Notifications</span>
                <Badge variant="outline">Disabled</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Safety Alerts</span>
                <Badge variant="default">Enabled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Voice Integration
            </CardTitle>
            <CardDescription>
              Voice commands and audio recording capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Voice Notes</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Voice Commands</span>
                <Badge variant="outline">Beta</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Audio Reports</span>
                <Badge variant="default">Available</Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3">
                Configure Voice Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}