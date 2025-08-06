import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { MapPin, Navigation, Play, Pause, RotateCcw } from 'lucide-react';

interface Device {
  id: string;
  name: string;
  type: 'vehicle' | 'employee' | 'equipment';
  latitude: number;
  longitude: number;
  status: 'online' | 'offline' | 'idle';
  lastUpdate: string;
  speed?: number;
  heading?: number;
}

interface MapViewProps {
  devices: Device[];
  onDeviceSelect?: (device: Device) => void;
}

export function MapView({ devices, onDeviceSelect }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Simulate map center based on devices
  const mapCenter = devices.length > 0 ? {
    lat: devices.reduce((sum, d) => sum + d.latitude, 0) / devices.length,
    lng: devices.reduce((sum, d) => sum + d.longitude, 0) / devices.length,
  } : { lat: 37.7749, lng: -122.4194 };

  const handleDeviceClick = (device: Device) => {
    setSelectedDevice(device);
    onDeviceSelect?.(device);
  };

  const getDeviceColor = (device: Device) => {
    switch (device.status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'idle': return 'bg-yellow-500';
      default: return 'bg-card0';
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'vehicle': return '🚛';
      case 'employee': return '👤';
      case 'equipment': return '⚙️';
      default: return '📍';
    }
  };

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Live Tracking Map
          </CardTitle>
          <CardDescription>
            Real-time GPS tracking for vehicles, employees, and equipment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setIsPlaying(!isPlaying); }}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pause' : 'Play'} Tracking
            </Button>
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset View
            </Button>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm">Playback Speed:</span>
              <select
                value={playbackSpeed}
                onChange={(e) => { setPlaybackSpeed(Number(e.target.value)); }}
                className="text-sm border rounded px-2 py-1"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={5}>5x</option>
              </select>
            </div>
          </div>

          {/* Map Container */}
          <div
            ref={mapRef}
            className="relative w-full h-96 bg-muted rounded-lg border overflow-hidden"
          >
            {/* Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            </div>

            {/* Device Markers */}
            {devices.map((device, index) => (
              <div
                key={device.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110"
                style={{
                  left: `${20 + (index % 5) * 15}%`,
                  top: `${20 + Math.floor(index / 5) * 15}%`,
                }}
                onClick={() => { handleDeviceClick(device); }}
              >
                <div className={`w-4 h-4 rounded-full ${getDeviceColor(device)} animate-pulse`}>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs bg-card border rounded px-1 whitespace-nowrap">
                    {getDeviceIcon(device.type)} {device.name}
                  </div>
                </div>
              </div>
            ))}

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border rounded-lg p-3">
              <div className="text-xs font-medium mb-2">Legend</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Idle</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Offline</span>
                </div>
              </div>
            </div>

            {/* Map Info */}
            <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm border rounded-lg p-3">
              <div className="text-xs space-y-1">
                <div>Center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}</div>
                <div>Active Devices: {devices.filter(d => d.status === 'online').length}</div>
                <div>Total Devices: {devices.length}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Device Details */}
      {selectedDevice && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              {selectedDevice.name} Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-muted-foreground">Type</div>
                <div className="capitalize">{selectedDevice.type}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Status</div>
                <div className="capitalize">{selectedDevice.status}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Location</div>
                <div>{selectedDevice.latitude.toFixed(4)}, {selectedDevice.longitude.toFixed(4)}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Last Update</div>
                <div>{selectedDevice.lastUpdate}</div>
              </div>
              {selectedDevice.speed && (
                <div>
                  <div className="font-medium text-muted-foreground">Speed</div>
                  <div>{selectedDevice.speed} mph</div>
                </div>
              )}
              {selectedDevice.heading && (
                <div>
                  <div className="font-medium text-muted-foreground">Heading</div>
                  <div>{selectedDevice.heading}°</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}