import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Camera,
  MapPin,
  Wifi,
  WifiOff,
  Download,
  Upload,
  Image as ImageIcon,
  Video,
  Mic,
  Navigation,
  Compass,
  Clock,
  Database,
  Sync,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

// Camera integration
interface CameraCapture {
  id: string;
  type: 'photo' | 'video';
  blob: Blob;
  timestamp: Date;
  location?: GeolocationPosition;
  metadata?: {
    width: number;
    height: number;
    size: number;
    format: string;
  };
}

const CameraIntegration: React.FC<{
  onCapture?: (capture: CameraCapture) => void;
}> = ({ onCapture }) => {
  const [isActive, setIsActive] = useState(false);
  const [captures, setCaptures] = useState<CameraCapture[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => { track.stop(); });
      streamRef.current = null;
      setIsActive(false);
    }
  };

  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) { return; }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) { return; }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) { return; }

      const capture: CameraCapture = {
        id: Date.now().toString(),
        type: 'photo',
        blob,
        timestamp: new Date(),
        metadata: {
          width: canvas.width,
          height: canvas.height,
          size: blob.size,
          format: 'image/png',
        },
      };

      // Get location if available
      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
            });
          });
          capture.location = position;
        } catch (error) {
          console.log('Location not available');
        }
      }

      setCaptures(prev => [...prev, capture]);
      onCapture?.(capture);
    }, 'image/png');
  };

  const startVideoRecording = async () => {
    if (!streamRef.current) { return; }

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm',
      });

      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });

        const capture: CameraCapture = {
          id: Date.now().toString(),
          type: 'video',
          blob,
          timestamp: new Date(),
          metadata: {
            width: videoRef.current?.videoWidth || 0,
            height: videoRef.current?.videoHeight || 0,
            size: blob.size,
            format: 'video/webm',
          },
        };

        setCaptures(prev => [...prev, capture]);
        onCapture?.(capture);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting video recording:', error);
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Camera Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isActive ? (
          <Button onClick={startCamera} className="w-full">
            <Camera className="h-4 w-4 mr-2" />
            Start Camera
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-video object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex gap-2">
              <Button onClick={takePhoto} variant="default" className="flex-1">
                <ImageIcon className="h-4 w-4 mr-2" />
                Photo
              </Button>

              {!isRecording ? (
                <Button onClick={startVideoRecording} variant="secondary" className="flex-1">
                  <Video className="h-4 w-4 mr-2" />
                  Record
                </Button>
              ) : (
                <Button onClick={stopVideoRecording} variant="destructive" className="flex-1">
                  <XCircle className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              )}

              <Button onClick={stopCamera} variant="outline">
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {captures.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Recent Captures ({captures.length})</h3>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {captures.slice(-6).map((capture) => (
                <div key={capture.id} className="relative aspect-square rounded bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {capture.type === 'photo' ? (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <Video className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <Badge variant="secondary" className="absolute top-1 left-1 text-xs">
                    {capture.type}
                  </Badge>
                  {capture.location && (
                    <Badge variant="outline" className="absolute top-1 right-1 text-xs">
                      <MapPin className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// GPS and location services
interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
}

const GPSIntegration: React.FC<{
  onLocationUpdate?: (location: LocationData) => void;
}> = ({ onLocationUpdate }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const getCurrentLocation = async () => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude || undefined,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined,
        timestamp: new Date(),
      };

      setCurrentLocation(locationData);
      setLocationHistory(prev => [...prev.slice(-49), locationData]); // Keep last 50
      onLocationUpdate?.(locationData);
      setError(null);
    } catch (error) {
      setError('Failed to get location');
      console.error('Geolocation error:', error);
    }
  };

  const startTracking = () => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: new Date(),
        };

        setCurrentLocation(locationData);
        setLocationHistory(prev => [...prev.slice(-49), locationData]);
        onLocationUpdate?.(locationData);
        setError(null);
      },
      (error) => {
        setError('Tracking failed');
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    );

    watchIdRef.current = watchId;
    setIsTracking(true);
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsTracking(false);
    }
  };

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          GPS & Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={getCurrentLocation} variant="outline" className="flex-1">
            <Navigation className="h-4 w-4 mr-2" />
            Get Location
          </Button>

          {!isTracking ? (
            <Button onClick={startTracking} variant="default" className="flex-1">
              <Compass className="h-4 w-4 mr-2" />
              Start Tracking
            </Button>
          ) : (
            <Button onClick={stopTracking} variant="destructive" className="flex-1">
              <XCircle className="h-4 w-4 mr-2" />
              Stop Tracking
            </Button>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {currentLocation && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Latitude</Label>
                <div className="font-mono">{currentLocation.latitude.toFixed(6)}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Longitude</Label>
                <div className="font-mono">{currentLocation.longitude.toFixed(6)}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Accuracy</Label>
                <div>{Math.round(currentLocation.accuracy)}m</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Speed</Label>
                <div>{currentLocation.speed ? `${(currentLocation.speed * 3.6).toFixed(1)} km/h` : 'N/A'}</div>
              </div>
            </div>

            {currentLocation.altitude && (
              <div>
                <Label className="text-xs text-muted-foreground">Altitude</Label>
                <div>{Math.round(currentLocation.altitude)}m</div>
              </div>
            )}

            <div>
              <Label className="text-xs text-muted-foreground">Last Update</Label>
              <div className="text-sm">{currentLocation.timestamp.toLocaleTimeString()}</div>
            </div>
          </div>
        )}

        {locationHistory.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Location History ({locationHistory.length} points)
            </Label>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {locationHistory.slice(-5).reverse().map((location, index) => (
                <div key={index} className="text-xs p-2 bg-muted rounded flex justify-between">
                  <span>
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </span>
                  <span>{location.timestamp.toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isTracking && (
          <Badge variant="secondary" className="w-full justify-center">
            <Compass className="h-3 w-3 mr-1 animate-spin" />
            Tracking Active
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

// Offline synchronization
interface SyncItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: Date;
  synced: boolean;
}

const OfflineSynchronization: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); };
    const handleOffline = () => { setIsOnline(false); };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load sync queue from localStorage
  useEffect(() => {
    const savedQueue = localStorage.getItem('syncQueue');
    if (savedQueue) {
      try {
        const queue = JSON.parse(savedQueue).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setSyncQueue(queue);
      } catch (error) {
        console.error('Failed to load sync queue:', error);
      }
    }

    const savedLastSync = localStorage.getItem('lastSync');
    if (savedLastSync) {
      setLastSync(new Date(savedLastSync));
    }
  }, []);

  // Save sync queue to localStorage
  useEffect(() => {
    localStorage.setItem('syncQueue', JSON.stringify(syncQueue));
  }, [syncQueue]);

  const addToSyncQueue = useCallback((item: Omit<SyncItem, 'id' | 'timestamp' | 'synced'>) => {
    const syncItem: SyncItem = {
      id: Date.now().toString(),
      timestamp: new Date(),
      synced: false,
      ...item,
    };

    setSyncQueue(prev => [...prev, syncItem]);
  }, []);

  const syncData = async () => {
    if (!isOnline || isSyncing || syncQueue.length === 0) { return; }

    setIsSyncing(true);
    setSyncProgress(0);

    const unsyncedItems = syncQueue.filter(item => !item.synced);

    for (let i = 0; i < unsyncedItems.length; i++) {
      const item = unsyncedItems[i];

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mark as synced
        setSyncQueue(prev => prev.map(queueItem =>
          queueItem.id === item.id ? { ...queueItem, synced: true } : queueItem,
        ));

        setSyncProgress(((i + 1) / unsyncedItems.length) * 100);
      } catch (error) {
        console.error('Sync failed for item:', item.id, error);
        break;
      }
    }

    setLastSync(new Date());
    localStorage.setItem('lastSync', new Date().toISOString());
    setIsSyncing(false);
    setSyncProgress(0);
  };

  const clearSyncedItems = () => {
    setSyncQueue(prev => prev.filter(item => !item.synced));
  };

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && syncQueue.some(item => !item.synced)) {
      syncData();
    }
  }, [isOnline]);

  // Demo functions
  const addDemoData = () => {
    addToSyncQueue({
      type: 'create',
      table: 'projects',
      data: { name: 'Demo Project', status: 'active' },
    });
  };

  const updateDemoData = () => {
    addToSyncQueue({
      type: 'update',
      table: 'projects',
      data: { id: 1, status: 'completed' },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Offline Sync
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          <Badge variant={syncQueue.filter(item => !item.synced).length > 0 ? 'destructive' : 'secondary'}>
            {syncQueue.filter(item => !item.synced).length} pending
          </Badge>
        </div>

        {isSyncing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sync className="h-4 w-4 animate-spin" />
              <span className="text-sm">Syncing...</span>
            </div>
            <Progress value={syncProgress} className="w-full" />
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={syncData} disabled={!isOnline || isSyncing || syncQueue.length === 0} className="flex-1">
            <Sync className="h-4 w-4 mr-2" />
            Sync Now
          </Button>

          <Button onClick={clearSyncedItems} variant="outline" size="sm">
            Clear
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Demo Actions</Label>
          <div className="flex gap-2">
            <Button onClick={addDemoData} variant="outline" size="sm">
              Add Data
            </Button>
            <Button onClick={updateDemoData} variant="outline" size="sm">
              Update Data
            </Button>
          </div>
        </div>

        {syncQueue.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Sync Queue</Label>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {syncQueue.slice(-10).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                  <div>
                    <span className="font-medium">{item.type}</span>
                    <span className="text-muted-foreground"> • {item.table}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.synced ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <Clock className="h-3 w-3 text-yellow-500" />
                    )}
                    <span>{item.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {lastSync && (
          <div className="text-xs text-muted-foreground">
            Last sync: {lastSync.toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main native features demo
const NativeFeaturesDemo: React.FC = () => {
  const [captures, setCaptures] = useState<CameraCapture[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);

  const handleCapture = (capture: CameraCapture) => {
    setCaptures(prev => [...prev, capture]);
  };

  const handleLocationUpdate = (location: LocationData) => {
    setLocations(prev => [...prev.slice(-49), location]);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Native Features</h1>
        <p className="text-muted-foreground">
          Camera, GPS, and offline synchronization
        </p>
      </div>

      <CameraIntegration onCapture={handleCapture} />
      <GPSIntegration onLocationUpdate={handleLocationUpdate} />
      <OfflineSynchronization />

      {/* Summary stats */}
      <Card>
        <CardHeader>
          <CardTitle>Session Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{captures.length}</div>
              <div className="text-sm text-muted-foreground">Captures</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{locations.length}</div>
              <div className="text-sm text-muted-foreground">GPS Points</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export {
  CameraIntegration,
  GPSIntegration,
  OfflineSynchronization,
  NativeFeaturesDemo,
};

export default NativeFeaturesDemo;