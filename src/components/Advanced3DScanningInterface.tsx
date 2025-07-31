import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Scan, 
  Box, 
  RotateCcw, 
  Camera, 
  Layers, 
  Zap,
  Eye,
  Download
} from 'lucide-react';

export function Advanced3DScanningInterface() {
  const scanningFeatures = [
    {
      title: 'LiDAR Scanning',
      description: 'High-precision 3D surface capture',
      icon: Scan,
      status: 'active',
      accuracy: '±2cm'
    },
    {
      title: 'Photogrammetry',
      description: 'Photo-based 3D reconstruction',
      icon: Camera,
      status: 'ready',
      accuracy: '±5cm'
    },
    {
      title: 'Point Cloud Processing',
      description: 'Real-time 3D data processing',
      icon: Box,
      status: 'processing',
      accuracy: '±1cm'
    },
    {
      title: 'AR Visualization',
      description: 'Augmented reality overlay',
      icon: Eye,
      status: 'ready',
      accuracy: '±3cm'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'ready':
        return 'bg-gray-500';
      default:
        return 'bg-red-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* 3D Scanning Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Advanced 3D Scanning Interface
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {scanningFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="relative">
                  <CardContent className="p-4">
                    <div className="text-center space-y-3">
                      <div className="relative">
                        <Icon className="h-8 w-8 mx-auto text-primary" />
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(feature.status)}`} />
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-sm">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        {feature.accuracy}
                      </Badge>
                      
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Scan Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Scan Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Scan Resolution</label>
              <select className="w-full p-2 border rounded-md">
                <option>High (1mm accuracy)</option>
                <option>Medium (5mm accuracy)</option>
                <option>Fast (1cm accuracy)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Scan Area</label>
              <select className="w-full p-2 border rounded-md">
                <option>Small (1m²)</option>
                <option>Medium (10m²)</option>
                <option>Large (100m²)</option>
              </select>
            </div>
            
            <Button className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Start 3D Scan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Scan Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Surface Coverage</span>
                <span>78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Point Cloud Density</span>
                <span>1.2M points</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3D Model Preview */}
      <Card>
        <CardHeader>
          <CardTitle>3D Model Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-48 flex items-center justify-center">
            <div className="text-center">
              <Box className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-muted-foreground">3D model preview will appear here</p>
              <p className="text-sm text-muted-foreground">Start a scan to generate 3D data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}