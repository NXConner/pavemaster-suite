import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  WifiOff, 
  Wifi, 
  Download, 
  Upload, 
  HardDrive, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export function OfflineManager() {
  const offlineStatus = {
    isOnline: true,
    pendingUploads: 7,
    cachedData: 23,
    lastSync: '2 minutes ago'
  };

  const offlineData = [
    {
      type: 'Photos',
      count: 12,
      size: '45 MB',
      status: 'ready'
    },
    {
      type: 'Voice Notes',
      count: 3,
      size: '8 MB',
      status: 'ready'
    },
    {
      type: 'GPS Data',
      count: 156,
      size: '2 MB',
      status: 'syncing'
    },
    {
      type: 'Forms',
      count: 5,
      size: '1 MB',
      status: 'pending'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'syncing':
        return <Upload className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'text-green-700 bg-green-50';
      case 'syncing':
        return 'text-blue-700 bg-blue-50';
      case 'pending':
        return 'text-orange-700 bg-orange-50';
      default:
        return 'text-red-700 bg-red-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {offlineStatus.isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            Offline Data Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Badge variant={offlineStatus.isOnline ? "default" : "destructive"}>
                {offlineStatus.isOnline ? 'Online' : 'Offline'}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">Connection Status</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">
                {offlineStatus.pendingUploads}
              </div>
              <div className="text-sm text-muted-foreground">Pending Uploads</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">
                {offlineStatus.cachedData}
              </div>
              <div className="text-sm text-muted-foreground">Cached Items</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium">
                {offlineStatus.lastSync}
              </div>
              <div className="text-sm text-muted-foreground">Last Sync</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offline Data Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Cached Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {offlineData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <div className="font-medium">{item.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.count} items • {item.size}
                    </div>
                  </div>
                </div>
                
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sync Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button className="flex items-center gap-2" disabled={!offlineStatus.isOnline}>
          <Upload className="h-4 w-4" />
          Sync All Data
        </Button>
        
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download for Offline
        </Button>
        
        <Button variant="destructive" className="flex items-center gap-2">
          <HardDrive className="h-4 w-4" />
          Clear Cache
        </Button>
      </div>

      {/* Storage Info */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Used Storage</span>
              <span className="font-medium">56 MB</span>
            </div>
            <div className="flex justify-between">
              <span>Available Space</span>
              <span className="font-medium">2.1 GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '2.5%' }}></div>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Storage usage is optimized
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}