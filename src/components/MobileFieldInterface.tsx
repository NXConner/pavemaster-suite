import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Camera, MapPin, Mic, Upload, Download } from 'lucide-react';

export function MobileFieldInterface() {
  const mobileFeatures = [
    {
      title: 'Photo Capture',
      description: 'Take photos with GPS coordinates',
      icon: Camera,
      action: 'Take Photo'
    },
    {
      title: 'Voice Recording',
      description: 'Record voice notes in the field',
      icon: Mic,
      action: 'Record'
    },
    {
      title: 'GPS Location',
      description: 'Get precise location data',
      icon: MapPin,
      action: 'Get Location'
    },
    {
      title: 'Data Sync',
      description: 'Sync data when online',
      icon: Upload,
      action: 'Sync Now'
    },
    {
      title: 'Offline Download',
      description: 'Download data for offline use',
      icon: Download,
      action: 'Download'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile Field Interface
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mobileFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-4">
                  <div className="text-center space-y-3">
                    <Icon className="h-8 w-8 mx-auto text-primary" />
                    <div>
                      <h3 className="font-medium">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      {feature.action}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Field Data Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Photos Captured</span>
              <span className="font-medium">23</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Voice Notes</span>
              <span className="font-medium">7</span>
            </div>
            <div className="flex justify-between items-center">
              <span>GPS Points</span>
              <span className="font-medium">156</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Pending Sync</span>
              <span className="font-medium text-orange-600">3 items</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}