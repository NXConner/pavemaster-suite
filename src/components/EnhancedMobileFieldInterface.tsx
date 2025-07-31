import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Camera, 
  MapPin, 
  Mic, 
  Upload, 
  Download, 
  Wifi, 
  WifiOff, 
  Battery,
  Signal
} from 'lucide-react';

export function EnhancedMobileFieldInterface() {
  const connectionStatus = {
    online: true,
    signal: 4,
    battery: 85
  };

  const fieldActions = [
    {
      title: 'Smart Photo Capture',
      description: 'AI-enhanced photo capture with auto-tagging',
      icon: Camera,
      badge: 'Enhanced',
      color: 'bg-blue-500'
    },
    {
      title: 'Voice-to-Text',
      description: 'Voice recordings with automatic transcription',
      icon: Mic,
      badge: 'AI-Powered',
      color: 'bg-purple-500'
    },
    {
      title: 'Precision GPS',
      description: 'High-accuracy location with offline mapping',
      icon: MapPin,
      badge: 'Premium',
      color: 'bg-green-500'
    },
    {
      title: 'Intelligent Sync',
      description: 'Smart data synchronization and conflict resolution',
      icon: Upload,
      badge: 'Auto',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {connectionStatus.online ? (
                  <Wifi className="h-4 w-4 text-green-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {connectionStatus.online ? 'Online' : 'Offline'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Signal className="h-4 w-4 text-blue-600" />
                <span className="text-sm">{connectionStatus.signal}/5</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Battery className="h-4 w-4 text-green-600" />
                <span className="text-sm">{connectionStatus.battery}%</span>
              </div>
            </div>
            
            <Badge variant={connectionStatus.online ? "default" : "secondary"}>
              Field Ready
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Enhanced Mobile Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card key={index} className="relative overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${action.color} bg-opacity-10`}>
                        <Icon className={`h-6 w-6 text-current`} />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {action.badge}
                      </Badge>
                    </div>
                    
                    <h3 className="font-medium mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {action.description}
                    </p>
                    
                    <Button size="sm" className="w-full">
                      Launch Tool
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Field Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Field Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">47</div>
              <div className="text-sm text-muted-foreground">Photos Captured</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-muted-foreground">Voice Notes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">234</div>
              <div className="text-sm text-muted-foreground">GPS Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">98%</div>
              <div className="text-sm text-muted-foreground">Sync Success</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button className="h-16 flex flex-col items-center justify-center">
          <Download className="h-5 w-5 mb-1" />
          <span className="text-xs">Sync All</span>
        </Button>
        <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
          <Camera className="h-5 w-5 mb-1" />
          <span className="text-xs">Quick Capture</span>
        </Button>
      </div>
    </div>
  );
}