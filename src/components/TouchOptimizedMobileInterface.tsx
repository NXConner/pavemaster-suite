import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useDeviceInfo, useOrientation, useViewportHeight, useSafeArea } from '@/hooks/use-mobile';
import mobileService, { MobileCapabilities, LocationData, PhotoData } from '@/services/mobileService';
import {
  Smartphone,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  MapPin,
  Camera,
  Navigation,
  Users,
  Settings,
  Zap,
  Thermometer,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Square,
  Share,
  Download,
  Upload,
  RotateCcw,
  Vibrate,
  Bell,
  BellOff,
  Shield,
  ShieldCheck,
  Gauge,
  Layers,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Volume2,
  VolumeX
} from 'lucide-react';
import '../styles/mobile.css';

interface TouchOptimizedMobileInterfaceProps {
  className?: string;
}

interface FieldTask {
  id: string;
  title: string;
  type: 'inspection' | 'measurement' | 'photo' | 'report';
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  location?: string;
  dueTime?: string;
  progress?: number;
  assignee?: string;
  description?: string;
}

interface DeviceStatus {
  battery: number;
  signal: number;
  storage: number;
  memory: number;
  temperature: number;
}

export function TouchOptimizedMobileInterface({ className = '' }: TouchOptimizedMobileInterfaceProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [capabilities, setCapabilities] = useState<MobileCapabilities | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isLocationTracking, setIsLocationTracking] = useState(false);
  const [isMotionTracking, setIsMotionTracking] = useState(false);
  const [fieldTasks, setFieldTasks] = useState<FieldTask[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    battery: 85,
    signal: 4,
    storage: 72,
    memory: 68,
    temperature: 22
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  
  const deviceInfo = useDeviceInfo();
  const orientation = useOrientation();
  const viewportHeight = useViewportHeight();
  const safeArea = useSafeArea();
  const { toast } = useToast();
  const locationWatchId = useRef<string | null>(null);

  useEffect(() => {
    initializeMobileService();
    loadFieldTasks();
    setupEventListeners();
    updateDeviceStatus();
  }, []);

  const initializeMobileService = async () => {
    try {
      const caps = await mobileService.initialize();
      setCapabilities(caps);
      setIsInitialized(true);
      
      if (caps.hasGeolocation) {
        await getCurrentLocation();
      }
      
      toast({
        title: "Mobile Interface Ready",
        description: `Initialized with ${Object.values(caps).filter(Boolean).length} capabilities`,
      });
    } catch (error) {
      console.error('Failed to initialize mobile service:', error);
      toast({
        title: "Initialization Error",
        description: "Some mobile features may not be available",
        variant: "destructive"
      });
    }
  };

  const setupEventListeners = () => {
    mobileService.addEventListener('networkStatusChanged', (status) => {
      toast({
        title: status.connected ? "Back Online" : "Gone Offline",
        description: status.connected ? "Data sync resumed" : "Working in offline mode",
      });
    });

    mobileService.addEventListener('appStateChanged', (state) => {
      if (state.isActive && autoSync) {
        syncData();
      }
    });
  };

  const loadFieldTasks = () => {
    const sampleTasks: FieldTask[] = [
      {
        id: '1',
        title: 'Pavement Condition Survey',
        type: 'inspection',
        status: 'pending',
        priority: 'high',
        location: 'Highway 101, Mile 45',
        dueTime: '2:00 PM',
        progress: 0,
        assignee: 'Team Alpha',
        description: 'Complete visual assessment of pavement condition'
      },
      {
        id: '2',
        title: 'Surface Temperature Reading',
        type: 'measurement',
        status: 'in_progress',
        priority: 'medium',
        location: 'Route 85, Section B',
        dueTime: '3:30 PM',
        progress: 65,
        assignee: 'Team Beta',
        description: 'Record surface temperature at marked locations'
      },
      {
        id: '3',
        title: 'Crack Documentation',
        type: 'photo',
        status: 'completed',
        priority: 'medium',
        location: 'Main St Bridge',
        dueTime: '1:00 PM',
        progress: 100,
        assignee: 'Team Alpha',
        description: 'Photograph crack patterns for analysis'
      }
    ];
    setFieldTasks(sampleTasks);
  };

  const updateDeviceStatus = async () => {
    try {
      const info = await mobileService.getDeviceInfo();
      setDeviceStatus(prev => ({
        ...prev,
        battery: info.batteryLevel || prev.battery,
        temperature: info.isCharging ? prev.temperature + 2 : prev.temperature
      }));
    } catch (error) {
      console.error('Failed to update device status:', error);
    }
  };

  const getCurrentLocation = async () => {
    if (!capabilities?.hasGeolocation) return;
    
    try {
      const location = await mobileService.getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 10000
      });
      setCurrentLocation(location);
      
      if (hapticFeedback) {
        await mobileService.triggerHaptic('light');
      }
      
      toast({
        title: "Location Updated",
        description: `Accuracy: ±${location.accuracy}m`,
      });
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Failed to get current location",
        variant: "destructive"
      });
    }
  };

  const startLocationTracking = async () => {
    if (!capabilities?.hasGeolocation || isLocationTracking) return;
    
    try {
      const watchId = await mobileService.watchLocation((location) => {
        setCurrentLocation(location);
      });
      locationWatchId.current = watchId;
      setIsLocationTracking(true);
      
      toast({
        title: "Location Tracking Started",
        description: "Real-time GPS tracking enabled",
      });
    } catch (error) {
      toast({
        title: "Tracking Error",
        description: "Failed to start location tracking",
        variant: "destructive"
      });
    }
  };

  const stopLocationTracking = async () => {
    if (!isLocationTracking || !locationWatchId.current) return;
    
    try {
      await mobileService.clearLocationWatch(locationWatchId.current);
      locationWatchId.current = null;
      setIsLocationTracking(false);
      
      toast({
        title: "Location Tracking Stopped",
        description: "GPS tracking disabled",
      });
    } catch (error) {
      console.error('Failed to stop location tracking:', error);
    }
  };

  const capturePhoto = async (taskId: string) => {
    if (!capabilities?.hasCamera) return;
    
    try {
      const photo = await mobileService.takePhoto({
        quality: 80,
        allowEditing: true,
        source: 'camera'
      });
      
      // Update task with photo
      setFieldTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed' as const, progress: 100 }
          : task
      ));
      
      if (hapticFeedback) {
        await mobileService.triggerHaptic('medium');
      }
      
      toast({
        title: "Photo Captured",
        description: "Added to task documentation",
      });
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Failed to capture photo",
        variant: "destructive"
      });
    }
  };

  const shareTaskData = async (task: FieldTask) => {
    try {
      await mobileService.share({
        title: `Task: ${task.title}`,
        text: `Status: ${task.status}\nLocation: ${task.location}\nAssignee: ${task.assignee}`,
        url: window.location.href
      });
      
      toast({
        title: "Data Shared",
        description: "Task information sent successfully",
      });
    } catch (error) {
      console.error('Failed to share task data:', error);
    }
  };

  const syncData = async () => {
    try {
      await mobileService.syncOfflineData();
      
      toast({
        title: "Data Synced",
        description: "All offline data synchronized",
      });
    } catch (error) {
      toast({
        title: "Sync Error",
        description: "Failed to sync offline data",
        variant: "destructive"
      });
    }
  };

  const toggleHapticFeedback = async () => {
    setHapticFeedback(!hapticFeedback);
    if (!hapticFeedback && capabilities?.hasHaptics) {
      await mobileService.triggerHaptic('light');
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="mobile-quick-action-icon text-red-500" />;
      case 'medium': return <Clock className="mobile-quick-action-icon text-yellow-500" />;
      default: return <CheckCircle className="mobile-quick-action-icon text-green-500" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'mobile-status-badge mobile-status-pending';
      case 'in_progress': return 'mobile-status-badge mobile-status-progress';
      case 'completed': return 'mobile-status-badge mobile-status-completed';
      default: return 'mobile-status-badge';
    }
  };

  if (!isInitialized) {
    return (
      <div className={`mobile-loading ${className}`}>
        <div className="mobile-loading-spinner" />
        <p className="mt-4">Initializing mobile interface...</p>
      </div>
    );
  }

  return (
    <div className={`mobile-container mobile-safe-area ${className}`} style={{ minHeight: `${viewportHeight}px` }}>
      {/* Device Status Bar */}
      <div className="mobile-device-status">
        <div className="mobile-device-status-item">
          <Smartphone className="h-3 w-3" />
          <span>{deviceInfo.platform}</span>
        </div>
        <div className="mobile-device-status-item">
          {deviceInfo.isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          <span>{deviceInfo.isOnline ? 'Online' : 'Offline'}</span>
        </div>
        <div className="mobile-device-status-item">
          <Battery className="h-3 w-3" />
          <span>{deviceStatus.battery}%</span>
        </div>
        <div className="mobile-device-status-item">
          <Thermometer className="h-3 w-3" />
          <span>{deviceStatus.temperature}°C</span>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="mobile-tabs">
        <TabsList className="mobile-grid-4 w-full">
          <TabsTrigger value="dashboard" className="mobile-tab-trigger">
            <Gauge className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="tasks" className="mobile-tab-trigger">
            <Layers className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="location" className="mobile-tab-trigger">
            <MapPin className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="settings" className="mobile-tab-trigger">
            <Settings className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mobile-section">
          {/* Device Overview Card */}
          <Card className="mobile-card">
            <CardHeader className="mobile-card-header">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Device Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="mobile-card-content">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Storage</span>
                    <span>{deviceStatus.storage}%</span>
                  </div>
                  <Progress value={deviceStatus.storage} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memory</span>
                    <span>{deviceStatus.memory}%</span>
                  </div>
                  <Progress value={deviceStatus.memory} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Battery</span>
                    <span>{deviceStatus.battery}%</span>
                  </div>
                  <Progress value={deviceStatus.battery} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mobile-card">
            <CardHeader className="mobile-card-header">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="mobile-card-content p-0">
              <div className="mobile-quick-actions">
                <button
                  className="mobile-quick-action mobile-haptic-medium"
                  onClick={() => capturePhoto('quick')}
                  disabled={!capabilities?.hasCamera}
                >
                  <Camera className="mobile-quick-action-icon" />
                  <span className="mobile-quick-action-text">Photo</span>
                </button>
                
                <button
                  className="mobile-quick-action mobile-haptic-medium"
                  onClick={getCurrentLocation}
                  disabled={!capabilities?.hasGeolocation}
                >
                  <Navigation className="mobile-quick-action-icon" />
                  <span className="mobile-quick-action-text">Location</span>
                </button>
                
                <button
                  className="mobile-quick-action mobile-haptic-medium"
                  onClick={syncData}
                  disabled={!deviceInfo.isOnline}
                >
                  <RotateCcw className="mobile-quick-action-icon" />
                  <span className="mobile-quick-action-text">Sync</span>
                </button>
                
                <button
                  className="mobile-quick-action mobile-haptic-medium"
                  onClick={() => shareTaskData(fieldTasks[0])}
                >
                  <Share className="mobile-quick-action-icon" />
                  <span className="mobile-quick-action-text">Share</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mobile-section">
          <Card className="mobile-card">
            <CardHeader className="mobile-card-header">
              <CardTitle>Field Tasks</CardTitle>
            </CardHeader>
            <CardContent className="mobile-card-content">
              <div className="space-y-4">
                {fieldTasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(task.priority)}
                        <span className={getStatusBadgeClass(task.status)}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                    
                    {task.progress !== undefined && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>{task.progress}%</span>
                        </div>
                        <Progress value={task.progress} className="h-2" />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                      <span>{task.location}</span>
                      <span>{task.dueTime}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      {task.type === 'photo' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => capturePhoto(task.id)}
                          className="mobile-button mobile-haptic-light text-xs"
                          disabled={!capabilities?.hasCamera}
                        >
                          <Camera className="h-3 w-3 mr-1" />
                          Capture
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        onClick={() => shareTaskData(task)}
                        className="mobile-button mobile-haptic-light text-xs"
                      >
                        <Share className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="mobile-section">
          {currentLocation && (
            <div className="mobile-location-display">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <span className="font-medium">Current Location</span>
              </div>
              <div className="text-sm text-gray-600">
                <p>Lat: {currentLocation.latitude.toFixed(6)}</p>
                <p>Lng: {currentLocation.longitude.toFixed(6)}</p>
                <p className="mobile-gps-accuracy">Accuracy: ±{currentLocation.accuracy}m</p>
              </div>
            </div>
          )}

          <Card className="mobile-card">
            <CardHeader className="mobile-card-header">
              <CardTitle>GPS Controls</CardTitle>
            </CardHeader>
            <CardContent className="mobile-card-content">
              <div className="space-y-4">
                <div className="mobile-grid-2">
                  <Button
                    onClick={getCurrentLocation}
                    disabled={!capabilities?.hasGeolocation}
                    className="mobile-button mobile-haptic-medium"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Location
                  </Button>
                  
                  <Button
                    onClick={isLocationTracking ? stopLocationTracking : startLocationTracking}
                    disabled={!capabilities?.hasGeolocation}
                    variant={isLocationTracking ? "destructive" : "default"}
                    className="mobile-button mobile-haptic-medium"
                  >
                    {isLocationTracking ? (
                      <>
                        <Square className="h-4 w-4 mr-2" />
                        Stop Track
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Track
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mobile-section">
          <Card className="mobile-card">
            <CardHeader className="mobile-card-header">
              <CardTitle>Mobile Settings</CardTitle>
            </CardHeader>
            <CardContent className="mobile-card-content">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <Label htmlFor="notifications">Notifications</Label>
                  </div>
                  <Switch
                    id="notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                    className="mobile-focus-visible"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Vibrate className="h-4 w-4" />
                    <Label htmlFor="haptic">Haptic Feedback</Label>
                  </div>
                  <Switch
                    id="haptic"
                    checked={hapticFeedback}
                    onCheckedChange={toggleHapticFeedback}
                    className="mobile-focus-visible"
                    disabled={!capabilities?.hasHaptics}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    <Label htmlFor="darkMode">Dark Mode</Label>
                  </div>
                  <Switch
                    id="darkMode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                    className="mobile-focus-visible"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    <Label htmlFor="autoSync">Auto Sync</Label>
                  </div>
                  <Switch
                    id="autoSync"
                    checked={autoSync}
                    onCheckedChange={setAutoSync}
                    className="mobile-focus-visible"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mobile-card">
            <CardHeader className="mobile-card-header">
              <CardTitle>Device Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="mobile-card-content">
              <div className="space-y-3">
                {capabilities && Object.entries(capabilities).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    {value ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}