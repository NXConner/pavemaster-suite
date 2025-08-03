import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import {
  Smartphone,
  Download,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  MapPin,
  Camera,
  Mic,
  Bell,
  Zap,
  Cloud,
  HardDrive,
  RefreshCw,
} from 'lucide-react';

export default function Mobile() {
  const [activeTab, setActiveTab] = useState('overview');
  const [syncStatus, setSyncStatus] = useState('connected');
  const [webhookUrl, setWebhookUrl] = useState('');

  const mobileDevices = [
    {
      id: 'MD001',
      name: 'Mike\'s iPhone 15 Pro',
      type: 'iOS',
      version: '17.2.1',
      app_version: '2.1.0',
      status: 'online',
      battery: 85,
      signal: 4,
      last_sync: '2024-01-16T10:30:00Z',
      location: 'Church Site - Richmond, VA',
      features: ['GPS', 'Camera', 'Offline Mode', 'Push Notifications'],
    },
    {
      id: 'MD002',
      name: 'Sarah\'s Samsung Galaxy S24',
      type: 'Android',
      version: '14.0',
      app_version: '2.1.0',
      status: 'offline',
      battery: 42,
      signal: 2,
      last_sync: '2024-01-16T08:15:00Z',
      location: 'Equipment Yard',
      features: ['GPS', 'Camera', 'Offline Mode', 'Barcode Scanner'],
    },
  ];

  const offlineData = [
    {
      id: 'OD001',
      type: 'Photo Report',
      title: 'Foundation Inspection - Site A',
      size: '12.5 MB',
      created: '2024-01-16T09:45:00Z',
      sync_status: 'pending',
    },
    {
      id: 'OD002',
      type: 'Time Entry',
      title: 'Work Hours - Jan 15',
      size: '0.2 MB',
      created: '2024-01-15T17:30:00Z',
      sync_status: 'synced',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'default';
      case 'offline': return 'secondary';
      case 'syncing': return 'outline';
      default: return 'destructive';
    }
  };

  const getSignalStrength = (signal: number) => {
    if (signal >= 4) { return 'text-green-600'; }
    if (signal >= 2) { return 'text-yellow-600'; }
    return 'text-red-600';
  };

  const triggerSync = async () => {
    setSyncStatus('syncing');
    // Simulate sync process
    setTimeout(() => {
      setSyncStatus('connected');
    }, 3000);
  };

  const triggerZapier = async (mobileData: any) => {
    if (!webhookUrl) { return; }

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          event: 'mobile_sync',
          data: mobileData,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Zapier webhook failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mobile & IoT Integration</h1>
          <p className="text-muted-foreground">Manage mobile devices, offline sync, and IoT sensors</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={triggerSync} disabled={syncStatus === 'syncing'}>
            {syncStatus === 'syncing' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {syncStatus === 'syncing' ? 'Syncing...' : 'Force Sync'}
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Download App
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="offline">Offline Data</TabsTrigger>
          <TabsTrigger value="iot">IoT Sensors</TabsTrigger>
          <TabsTrigger value="zapier">Zapier</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mobileDevices.filter(d => d.status === 'online').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {mobileDevices.length} total devices
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Sync</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {offlineData.filter(d => d.sync_status === 'pending').length}
                </div>
                <p className="text-xs text-muted-foreground">Data items to sync</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Data Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15.2 MB</div>
                <p className="text-xs text-muted-foreground">Offline storage used</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {syncStatus === 'connected' ? (
                    <Wifi className="h-4 w-4 text-green-600" />
                  ) : syncStatus === 'syncing' ? (
                    <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium capitalize">{syncStatus}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mobile App Features</CardTitle>
              <CardDescription>Progressive Web App capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">GPS Tracking</p>
                      <p className="text-sm text-muted-foreground">Real-time location tracking</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Camera className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Photo Reports</p>
                      <p className="text-sm text-muted-foreground">Capture and upload photos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <HardDrive className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Offline Mode</p>
                      <p className="text-sm text-muted-foreground">Work without internet connection</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Real-time alerts and updates</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mic className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Voice Notes</p>
                      <p className="text-sm text-muted-foreground">Audio recording capabilities</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Cloud className="h-5 w-5 text-cyan-600" />
                    <div>
                      <p className="font-medium">Cloud Sync</p>
                      <p className="text-sm text-muted-foreground">Automatic data synchronization</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          {mobileDevices.map((device) => (
            <Card key={device.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {device.type === 'iOS' ? (
                      <Smartphone className="h-8 w-8 text-gray-600" />
                    ) : (
                      <Smartphone className="h-8 w-8 text-green-600" />
                    )}
                    <div>
                      <CardTitle className="text-lg">{device.name}</CardTitle>
                      <CardDescription>
                        {device.type} {device.version} • App v{device.app_version}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(device.status)}>
                    {device.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <Battery className="h-4 w-4" />
                    <span className="text-sm">{device.battery}%</span>
                    <Progress value={device.battery} className="flex-1 h-2" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Signal className={`h-4 w-4 ${getSignalStrength(device.signal)}`} />
                    <span className="text-sm">{device.signal}/5 bars</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{device.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    <span className="text-sm">
                      {new Date(device.last_sync).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Features:</p>
                  <div className="flex gap-1 flex-wrap">
                    {device.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="offline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Offline Data Management</CardTitle>
              <CardDescription>Data stored locally on mobile devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {offlineData.map((data) => (
                  <div key={data.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <HardDrive className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{data.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {data.type} • {data.size} • {new Date(data.created).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={data.sync_status === 'synced' ? 'default' : 'secondary'}>
                      {data.sync_status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="iot" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>IoT Sensor Network</CardTitle>
              <CardDescription>Connected sensors and monitoring devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <p className="font-medium">Temperature Sensor #1</p>
                  </div>
                  <p className="text-2xl font-bold">72°F</p>
                  <p className="text-sm text-muted-foreground">Asphalt mix temperature</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <p className="font-medium">Pressure Monitor</p>
                  </div>
                  <p className="text-2xl font-bold">45 PSI</p>
                  <p className="text-sm text-muted-foreground">Compaction pressure</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zapier" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Mobile & IoT Zapier Integration
              </CardTitle>
              <CardDescription>Automate mobile data workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Zapier Webhook URL</Label>
                <Input
                  id="webhook-url"
                  value={webhookUrl}
                  onChange={(e) => { setWebhookUrl(e.target.value); }}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                />
              </div>
              <Button
                className="w-full"
                onClick={() => triggerZapier({ test: true })}
                disabled={!webhookUrl}
              >
                <Zap className="h-4 w-4 mr-2" />
                Test Integration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}