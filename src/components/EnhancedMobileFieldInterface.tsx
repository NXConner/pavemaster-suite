import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin,
  Clock,
  Thermometer,
  Wind,
  CloudRain,
  Sun,
  Camera,
  Mic,
  FileText,
  Users,
  Truck,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Share2,
  Download,
  Upload,
  Smartphone,
  Globe,
  Activity,
  Bell,
} from 'lucide-react';

import mobileService from '@/services/mobileService';
import type { 
  MobileCapabilities, 
  LocationData, 
  PhotoData 
} from '@/services/mobileService';

interface FieldTask {
  id: string;
  title: string;
  type: 'inspection' | 'measurement' | 'photo' | 'report' | 'location';
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  location?: string;
  dueTime?: string;
  data?: any;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  conditions: string;
  visibility: number;
}

interface DeviceStatus {
  batteryLevel: number;
  isCharging: boolean;
  networkType: string;
  signalStrength: number;
}

interface EnhancedMobileFieldInterfaceProps {
  className?: string;
}

export function EnhancedMobileFieldInterface({ 
  className = '' 
}: EnhancedMobileFieldInterfaceProps) {
  const { toast } = useToast();
  
  // State management
  const [capabilities, setCapabilities] = useState<MobileCapabilities>({
    camera: false,
    geolocation: false,
    pushNotifications: false,
    haptics: false,
    filesystem: false,
    motion: false,
    network: false,
  });
  
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [tasks, setTasks] = useState<FieldTask[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncPending, setSyncPending] = useState(0);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    batteryLevel: 0,
    isCharging: false,
    networkType: 'unknown',
    signalStrength: 0,
  });
  
  const [isLocationTracking, setIsLocationTracking] = useState(false);
  const [isMotionTracking, setIsMotionTracking] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<PhotoData[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const locationWatchId = useRef<string | null>(null);

  // Initialize mobile service
  useEffect(() => {
    initializeMobileService();
  }, []);

  const initializeMobileService = async () => {
    try {
      console.log('🚀 Initializing Enhanced Mobile Field Interface...');
      
      const caps = await mobileService.initialize();
      setCapabilities(caps);
      
      // Setup event listeners
      setupEventListeners();
      
      // Load initial data
      await loadFieldData();
      await updateDeviceStatus();
      
      if (caps.geolocation) {
        await getCurrentLocation();
      }
      
      if (caps.network) {
        await updateNetworkStatus();
      }
      
      setIsInitialized(true);
      
      toast({
        title: 'Mobile Service Ready',
        description: 'All mobile features have been initialized',
      });
    } catch (error) {
      console.error('Mobile initialization failed:', error);
      toast({
        title: 'Initialization Error',
        description: 'Some mobile features may not be available',
        variant: 'destructive',
      });
    }
  };

  const setupEventListeners = () => {
    // Network status changes
    mobileService.on('networkStatusChange', (status) => {
      setIsOnline(status.connected);
      setDeviceStatus(prev => ({
        ...prev,
        networkType: status.connectionType || 'unknown',
      }));
    });

    // Push notification events
    mobileService.on('pushNotificationReceived', (notification) => {
      toast({
        title: notification.title,
        description: notification.body,
      });
    });

    // Data sync events
    mobileService.on('dataSynced', (item) => {
      setSyncPending(prev => Math.max(0, prev - 1));
      toast({
        title: 'Data Synced',
        description: `${item.type} has been synchronized`,
      });
    });

    // App state changes
    mobileService.on('appStateChange', (state) => {
      if (state.isActive && isOnline) {
        // App became active, refresh data
        updateDeviceStatus();
        updateNetworkStatus();
      }
    });

    // Keyboard events for better UX
    mobileService.on('keyboardWillShow', () => {
      // Adjust UI for keyboard
    });

    mobileService.on('keyboardWillHide', () => {
      // Reset UI after keyboard
    });
  };

  const loadFieldData = async () => {
    // Load tasks from storage or generate mock data
    const savedTasks = await mobileService.getItem<FieldTask[]>('fieldTasks');
    
    if (savedTasks && savedTasks.length > 0) {
      setTasks(savedTasks);
    } else {
      const mockTasks: FieldTask[] = [
        {
          id: '1',
          title: 'Pre-pave Inspection',
          type: 'inspection',
          status: 'pending',
          priority: 'high',
          location: 'Church Parking Lot - Section A',
          dueTime: '09:00 AM',
        },
        {
          id: '2',
          title: 'Surface Temperature Check',
          type: 'measurement',
          status: 'in_progress',
          priority: 'medium',
          location: 'Church Parking Lot - Section B',
          dueTime: '09:30 AM',
        },
        {
          id: '3',
          title: 'Progress Photos',
          type: 'photo',
          status: 'pending',
          priority: 'medium',
          location: 'Church Parking Lot - Overall',
          dueTime: '10:00 AM',
        },
        {
          id: '4',
          title: 'GPS Location Marker',
          type: 'location',
          status: 'pending',
          priority: 'low',
          location: 'Church Parking Lot - Boundaries',
          dueTime: '11:00 AM',
        },
      ];
      setTasks(mockTasks);
      await mobileService.setItem('fieldTasks', mockTasks);
    }

    // Load weather data
    setWeather({
      temperature: 72,
      humidity: 65,
      windSpeed: 8,
      conditions: 'Partly Cloudy',
      visibility: 10,
    });

    // Check offline queue size
    setSyncPending(mobileService.offlineQueueSize);
  };

  const updateDeviceStatus = async () => {
    try {
      const deviceInfo = await mobileService.getDeviceInfo();
      
      // Simulate battery and signal data (would come from actual device APIs)
      setDeviceStatus({
        batteryLevel: Math.floor(Math.random() * 100),
        isCharging: Math.random() > 0.5,
        networkType: isOnline ? 'wifi' : 'none',
        signalStrength: Math.floor(Math.random() * 5),
      });
    } catch (error) {
      console.error('Failed to update device status:', error);
    }
  };

  const updateNetworkStatus = async () => {
    try {
      if (capabilities.network) {
        const status = await mobileService.getNetworkStatus();
        setIsOnline(status.connected);
      }
    } catch (error) {
      console.error('Failed to update network status:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      if (!capabilities.geolocation) {
        throw new Error('Geolocation not available');
      }

      const location = await mobileService.getCurrentLocation();
      setCurrentLocation(location);
      
      await mobileService.triggerHapticFeedback();
      
      toast({
        title: 'Location Updated',
        description: `Accuracy: ±${Math.round(location.accuracy)}m`,
      });
    } catch (error) {
      console.error('Location error:', error);
      toast({
        title: 'Location Error',
        description: 'Unable to get current location',
        variant: 'destructive',
      });
    }
  };

  const startLocationTracking = async () => {
    try {
      if (!capabilities.geolocation) {
        throw new Error('Geolocation not available');
      }

      const watchId = await mobileService.watchLocation((location) => {
        setCurrentLocation(location);
      });
      
      locationWatchId.current = watchId;
      setIsLocationTracking(true);
      
      toast({
        title: 'Location Tracking Started',
        description: 'Continuously tracking your location',
      });
    } catch (error) {
      console.error('Location tracking error:', error);
      toast({
        title: 'Tracking Error',
        description: 'Failed to start location tracking',
        variant: 'destructive',
      });
    }
  };

  const stopLocationTracking = async () => {
    try {
      if (locationWatchId.current) {
        await mobileService.clearLocationWatch(locationWatchId.current);
        locationWatchId.current = null;
      }
      setIsLocationTracking(false);
      
      toast({
        title: 'Location Tracking Stopped',
        description: 'Location tracking has been disabled',
      });
    } catch (error) {
      console.error('Stop tracking error:', error);
    }
  };

  const capturePhoto = async (taskId: string) => {
    try {
      if (!capabilities.camera) {
        throw new Error('Camera not available');
      }

      const photo = await mobileService.takePhoto({
        quality: 80,
        saveToGallery: true,
      });

      setCapturedPhotos(prev => [...prev, photo]);
      updateTaskStatus(taskId, 'completed', { photo });
      
      toast({
        title: 'Photo Captured',
        description: 'Photo saved and added to sync queue',
      });
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: 'Camera Error',
        description: 'Failed to capture photo',
        variant: 'destructive',
      });
    }
  };

  const recordMeasurement = async (taskId: string) => {
    try {
      // Simulate temperature measurement
      const temperature = 140 + Math.random() * 20; // 140-160°F
      const measurementData = {
        temperature: Math.round(temperature),
        timestamp: Date.now(),
        location: currentLocation,
      };

      updateTaskStatus(taskId, 'completed', measurementData);
      
      await mobileService.triggerHapticFeedback();
      
      toast({
        title: 'Measurement Recorded',
        description: `Temperature: ${measurementData.temperature}°F`,
      });
    } catch (error) {
      console.error('Measurement error:', error);
      toast({
        title: 'Measurement Error',
        description: 'Failed to record measurement',
        variant: 'destructive',
      });
    }
  };

  const recordLocationMarker = async (taskId: string) => {
    try {
      if (!currentLocation) {
        await getCurrentLocation();
        return;
      }

      const locationData = {
        ...currentLocation,
        marker: `Marker_${Date.now()}`,
        description: 'Field boundary marker',
      };

      updateTaskStatus(taskId, 'completed', locationData);
      
      toast({
        title: 'Location Marker Saved',
        description: `Lat: ${currentLocation.latitude.toFixed(6)}, Lon: ${currentLocation.longitude.toFixed(6)}`,
      });
    } catch (error) {
      console.error('Location marker error:', error);
      toast({
        title: 'Location Error',
        description: 'Failed to save location marker',
        variant: 'destructive',
      });
    }
  };

  const updateTaskStatus = async (
    taskId: string, 
    status: FieldTask['status'], 
    data?: any
  ) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return { 
          ...task, 
          status, 
          data: data ? { ...task.data, ...data } : task.data 
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    await mobileService.setItem('fieldTasks', updatedTasks);

    if (!isOnline) {
      setSyncPending(prev => prev + 1);
    }
  };

  const shareTaskData = async (task: FieldTask) => {
    try {
      const shareData = {
        title: `Task: ${task.title}`,
        text: `Status: ${task.status}\nLocation: ${task.location}\nData: ${JSON.stringify(task.data, null, 2)}`,
      };

      await mobileService.shareContent(shareData);
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: 'Share Error',
        description: 'Failed to share task data',
        variant: 'destructive',
      });
    }
  };

  const startMotionTracking = async () => {
    try {
      if (!capabilities.motion) {
        throw new Error('Motion tracking not available');
      }

      await mobileService.startMotionTracking((data) => {
        // Handle motion data
        console.log('Motion data:', data);
      });
      
      setIsMotionTracking(true);
      
      toast({
        title: 'Motion Tracking Started',
        description: 'Monitoring device movement',
      });
    } catch (error) {
      console.error('Motion tracking error:', error);
      toast({
        title: 'Motion Error',
        description: 'Failed to start motion tracking',
        variant: 'destructive',
      });
    }
  };

  const stopMotionTracking = async () => {
    try {
      await mobileService.stopMotionTracking();
      setIsMotionTracking(false);
      
      toast({
        title: 'Motion Tracking Stopped',
        description: 'Motion tracking has been disabled',
      });
    } catch (error) {
      console.error('Motion stop error:', error);
    }
  };

  const getTaskIcon = (type: FieldTask['type']) => {
    switch (type) {
      case 'inspection': return <CheckCircle className="h-5 w-5" />;
      case 'measurement': return <Thermometer className="h-5 w-5" />;
      case 'photo': return <Camera className="h-5 w-5" />;
      case 'location': return <MapPin className="h-5 w-5" />;
      case 'report': return <FileText className="h-5 w-5" />;
      default: return <CheckCircle className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: FieldTask['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: FieldTask['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (!isInitialized) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <Smartphone className="h-12 w-12 mx-auto text-primary animate-pulse" />
          <div>
            <h3 className="text-lg font-medium">Initializing Mobile Service</h3>
            <p className="text-sm text-muted-foreground">Setting up native mobile features...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 p-4 max-w-md mx-auto ${className}`}>
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">
            <Activity className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <CheckCircle className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="location">
            <MapPin className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Wrench className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          {/* Status Header */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Field Dashboard</span>
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <Badge variant="default" className="bg-green-500">
                      <Wifi className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Offline
                    </Badge>
                  )}
                  {syncPending > 0 && (
                    <Badge variant="secondary">{syncPending} pending</Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Device Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <Battery className="h-4 w-4 text-primary" />
                  <div className="text-sm">
                    <div className="font-medium">{deviceStatus.batteryLevel}%</div>
                    <div className="text-xs text-muted-foreground">
                      {deviceStatus.isCharging ? 'Charging' : 'Battery'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <Signal className="h-4 w-4 text-primary" />
                  <div className="text-sm">
                    <div className="font-medium">{deviceStatus.networkType}</div>
                    <div className="text-xs text-muted-foreground">
                      Signal: {deviceStatus.signalStrength}/5
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              {currentLocation && (
                <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div className="text-sm flex-1">
                    <div className="font-medium">Current Location</div>
                    <div className="text-muted-foreground">
                      {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Accuracy: ±{Math.round(currentLocation.accuracy)}m
                    </div>
                  </div>
                  {isLocationTracking && (
                    <Badge variant="default" className="bg-green-500">Live</Badge>
                  )}
                </div>
              )}

              {/* Weather */}
              {weather && (
                <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                  <Sun className="h-4 w-4 text-primary" />
                  <div className="text-sm flex-1">
                    <div className="font-medium">{weather.conditions}</div>
                    <div className="text-muted-foreground flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Thermometer className="h-3 w-3" />
                        {weather.temperature}°F
                      </span>
                      <span className="flex items-center gap-1">
                        <Wind className="h-3 w-3" />
                        {weather.windSpeed} mph
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Capabilities Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Device Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(capabilities).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <Badge variant={enabled ? "default" : "secondary"}>
                      {enabled ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      )}
                      {enabled ? 'Ready' : 'N/A'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Field Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className={getPriorityColor(task.priority)}>
                        {getTaskIcon(task.type)}
                      </span>
                      <div>
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <p className="text-xs text-muted-foreground">{task.location}</p>
                        {task.dueTime && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            Due: {task.dueTime}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(task.status)}
                      {task.data && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => shareTaskData(task)}
                        >
                          <Share2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Task Actions */}
                  {task.status !== 'completed' && (
                    <div className="flex gap-2 flex-wrap">
                      {task.type === 'photo' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => capturePhoto(task.id)}
                          className="flex items-center gap-2 text-xs"
                          disabled={!capabilities.camera}
                        >
                          <Camera className="h-3 w-3" />
                          Take Photo
                        </Button>
                      )}
                      {task.type === 'measurement' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => recordMeasurement(task.id)}
                          className="flex items-center gap-2 text-xs"
                        >
                          <Thermometer className="h-3 w-3" />
                          Record
                        </Button>
                      )}
                      {task.type === 'location' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => recordLocationMarker(task.id)}
                          className="flex items-center gap-2 text-xs"
                          disabled={!capabilities.geolocation}
                        >
                          <MapPin className="h-3 w-3" />
                          Mark Location
                        </Button>
                      )}
                      {task.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => updateTaskStatus(task.id, 'in_progress')}
                          className="text-xs"
                        >
                          Start Task
                        </Button>
                      )}
                      {task.status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                          className="text-xs"
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="location-tracking">Continuous Tracking</Label>
                <Switch
                  id="location-tracking"
                  checked={isLocationTracking}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      startLocationTracking();
                    } else {
                      stopLocationTracking();
                    }
                  }}
                  disabled={!capabilities.geolocation}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="motion-tracking">Motion Detection</Label>
                <Switch
                  id="motion-tracking"
                  checked={isMotionTracking}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      startMotionTracking();
                    } else {
                      stopMotionTracking();
                    }
                  }}
                  disabled={!capabilities.motion}
                />
              </div>

              <Button
                onClick={getCurrentLocation}
                disabled={!capabilities.geolocation}
                className="w-full"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Update Location
              </Button>

              {currentLocation && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <div className="font-medium mb-2">Current Position</div>
                  <div className="space-y-1">
                    <div>Latitude: {currentLocation.latitude.toFixed(6)}</div>
                    <div>Longitude: {currentLocation.longitude.toFixed(6)}</div>
                    <div>Accuracy: ±{Math.round(currentLocation.accuracy)}m</div>
                    {currentLocation.altitude && (
                      <div>Altitude: {Math.round(currentLocation.altitude)}m</div>
                    )}
                    {currentLocation.speed && (
                      <div>Speed: {(currentLocation.speed * 3.6).toFixed(1)} km/h</div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mobile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => mobileService.triggerHapticFeedback()}
                  disabled={!capabilities.haptics}
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <Activity className="h-6 w-6" />
                  <span className="text-xs">Test Haptics</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => mobileService.showToast('Test notification')}
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <Bell className="h-6 w-6" />
                  <span className="text-xs">Test Toast</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => mobileService.shareContent({ 
                    title: 'PaveMaster Suite', 
                    text: 'Field operations mobile app' 
                  })}
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <Share2 className="h-6 w-6" />
                  <span className="text-xs">Share App</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={updateDeviceStatus}
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <Smartphone className="h-6 w-6" />
                  <span className="text-xs">Refresh Status</span>
                </Button>
              </div>

              {syncPending > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-orange-700">
                      {syncPending} items pending sync
                    </span>
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Offline queue: {mobileService.offlineQueueSize} items
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}