import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, Wifi, WifiOff, Battery, Signal, Camera, Mic, 
  MapPin, Clock, Bell, User, Home, BarChart3, Settings,
  Navigation, Phone, MessageCircle, AlertTriangle, CheckCircle,
  Download, Upload, Sync, Globe, Bluetooth, Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MobileStatus {
  isOnline: boolean;
  batteryLevel: number;
  signalStrength: number;
  gpsEnabled: boolean;
  cameraAvailable: boolean;
  microphoneAvailable: boolean;
  bluetoothEnabled: boolean;
  notificationsEnabled: boolean;
  lastSync: string;
  dataUsage: number;
}

interface QuickAction {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  enabled: boolean;
  badge?: number;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable: boolean;
}

interface OfflineAction {
  id: string;
  type: 'clock_in' | 'clock_out' | 'location_update' | 'photo_upload' | 'form_submit';
  data: any;
  timestamp: string;
  synced: boolean;
}

const MobileCompanion: React.FC = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileStatus, setMobileStatus] = useState<MobileStatus>({
    isOnline: navigator.onLine,
    batteryLevel: 75,
    signalStrength: 4,
    gpsEnabled: false,
    cameraAvailable: false,
    microphoneAvailable: false,
    bluetoothEnabled: false,
    notificationsEnabled: false,
    lastSync: new Date().toISOString(),
    dataUsage: 2.3
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [offlineActions, setOfflineActions] = useState<OfflineAction[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lon: number} | null>(null);
  const [isClocked, setIsClocked] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);

  const watchId = useRef<number>();
  const mediaRecorder = useRef<MediaRecorder>();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }
      
      setUserRole(data?.role);
    };

    checkUserRole();
  }, [user]);

  useEffect(() => {
    initializeMobileFeatures();
    loadNotifications();
    loadOfflineActions();

    // Set up online/offline listeners
    const handleOnline = () => {
      setMobileStatus(prev => ({ ...prev, isOnline: true }));
      syncOfflineActions();
    };

    const handleOffline = () => {
      setMobileStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  const initializeMobileFeatures = async () => {
    // Check device capabilities
    const capabilities = {
      gpsEnabled: 'geolocation' in navigator,
      cameraAvailable: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      microphoneAvailable: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      bluetoothEnabled: 'bluetooth' in navigator,
      notificationsEnabled: 'Notification' in window && Notification.permission === 'granted'
    };

    setMobileStatus(prev => ({ ...prev, ...capabilities }));

    // Request permissions
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setMobileStatus(prev => ({ 
        ...prev, 
        notificationsEnabled: permission === 'granted' 
      }));
    }

    // Start location tracking if available
    if (capabilities.gpsEnabled) {
      startLocationTracking();
    }

    // Check battery status
    if ('getBattery' in navigator) {
      const battery = await (navigator as any).getBattery();
      setMobileStatus(prev => ({ 
        ...prev, 
        batteryLevel: Math.round(battery.level * 100) 
      }));
    }
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) return;

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 60000
    };

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lon: longitude });
        
        // Save location update (offline capable)
        const locationUpdate: OfflineAction = {
          id: `location_${Date.now()}`,
          type: 'location_update',
          data: { latitude, longitude, timestamp: new Date().toISOString() },
          timestamp: new Date().toISOString(),
          synced: mobileStatus.isOnline
        };

        if (mobileStatus.isOnline) {
          syncLocationUpdate(locationUpdate);
        } else {
          setOfflineActions(prev => [...prev, locationUpdate]);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        showNotification('GPS Error', 'Unable to get current location', 'error');
      },
      options
    );
  };

  const loadNotifications = async () => {
    const notificationsData: Notification[] = [
      {
        id: 'notif_1',
        type: 'info',
        title: 'Shift Starting Soon',
        message: 'Your shift begins in 30 minutes',
        timestamp: new Date().toISOString(),
        read: false,
        actionable: true
      },
      {
        id: 'notif_2',
        type: 'warning',
        title: 'Weather Alert',
        message: 'High winds expected in your work area',
        timestamp: new Date().toISOString(),
        read: false,
        actionable: false
      },
      {
        id: 'notif_3',
        type: 'success',
        title: 'Timesheet Approved',
        message: 'Your timesheet for last week has been approved',
        timestamp: new Date().toISOString(),
        read: true,
        actionable: false
      }
    ];

    setNotifications(notificationsData);
  };

  const loadOfflineActions = () => {
    const savedActions = localStorage.getItem('offlineActions');
    if (savedActions) {
      setOfflineActions(JSON.parse(savedActions));
    }
  };

  const saveOfflineActions = (actions: OfflineAction[]) => {
    localStorage.setItem('offlineActions', JSON.stringify(actions));
    setOfflineActions(actions);
  };

  const syncOfflineActions = async () => {
    if (!mobileStatus.isOnline || syncInProgress) return;

    setSyncInProgress(true);
    const unsyncedActions = offlineActions.filter(action => !action.synced);

    try {
      for (const action of unsyncedActions) {
        await syncAction(action);
      }

      // Mark all actions as synced
      const updatedActions = offlineActions.map(action => ({ ...action, synced: true }));
      saveOfflineActions(updatedActions);

      setMobileStatus(prev => ({ ...prev, lastSync: new Date().toISOString() }));
      
      showNotification('Sync Complete', `${unsyncedActions.length} actions synchronized`, 'success');
    } catch (error) {
      console.error('Sync error:', error);
      showNotification('Sync Failed', 'Unable to sync offline actions', 'error');
    } finally {
      setSyncInProgress(false);
    }
  };

  const syncAction = async (action: OfflineAction) => {
    // Simulate API calls for different action types
    switch (action.type) {
      case 'clock_in':
      case 'clock_out':
        await new Promise(resolve => setTimeout(resolve, 500));
        break;
      case 'location_update':
        await syncLocationUpdate(action);
        break;
      case 'photo_upload':
        await new Promise(resolve => setTimeout(resolve, 1000));
        break;
      default:
        break;
    }
  };

  const syncLocationUpdate = async (action: OfflineAction) => {
    // In a real app, this would sync with the server
    await new Promise(resolve => setTimeout(resolve, 200));
  };

  const clockInOut = async () => {
    const action = isClocked ? 'clock_out' : 'clock_in';
    const actionData: OfflineAction = {
      id: `${action}_${Date.now()}`,
      type: action,
      data: {
        timestamp: new Date().toISOString(),
        location: currentLocation
      },
      timestamp: new Date().toISOString(),
      synced: mobileStatus.isOnline
    };

    if (mobileStatus.isOnline) {
      await syncAction(actionData);
    } else {
      const newActions = [...offlineActions, actionData];
      saveOfflineActions(newActions);
    }

    setIsClocked(!isClocked);
    showNotification(
      `Clock ${action === 'clock_in' ? 'In' : 'Out'}`,
      `Successfully ${action === 'clock_in' ? 'clocked in' : 'clocked out'}`,
      'success'
    );
  };

  const takePhoto = async () => {
    if (!mobileStatus.cameraAvailable) {
      showNotification('Camera Error', 'Camera not available', 'error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setShowCamera(true);
      
      // In a real app, you'd capture the photo and save it
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        setShowCamera(false);
        
        const photoAction: OfflineAction = {
          id: `photo_${Date.now()}`,
          type: 'photo_upload',
          data: {
            type: 'receipt',
            timestamp: new Date().toISOString(),
            location: currentLocation
          },
          timestamp: new Date().toISOString(),
          synced: mobileStatus.isOnline
        };

        if (mobileStatus.isOnline) {
          syncAction(photoAction);
        } else {
          const newActions = [...offlineActions, photoAction];
          saveOfflineActions(newActions);
        }

        showNotification('Photo Captured', 'Receipt photo saved successfully', 'success');
      }, 3000);
    } catch (error) {
      console.error('Camera error:', error);
      showNotification('Camera Error', 'Unable to access camera', 'error');
    }
  };

  const startVoiceRecording = async () => {
    if (!mobileStatus.microphoneAvailable) {
      showNotification('Microphone Error', 'Microphone not available', 'error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      mediaRecorder.current.start();
      setVoiceRecording(true);
      
      mediaRecorder.current.ondataavailable = (event) => {
        // In a real app, you'd process the audio data
        console.log('Audio data available:', event.data);
      };

      setTimeout(() => {
        stopVoiceRecording();
      }, 10000); // Auto-stop after 10 seconds
    } catch (error) {
      console.error('Microphone error:', error);
      showNotification('Microphone Error', 'Unable to access microphone', 'error');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder.current && voiceRecording) {
      mediaRecorder.current.stop();
      setVoiceRecording(false);
      showNotification('Voice Note', 'Voice note recorded successfully', 'success');
    }
  };

  const showNotification = (title: string, message: string, type: Notification['type']) => {
    const notification: Notification = {
      id: `notif_${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      actionable: false
    };

    setNotifications(prev => [notification, ...prev.slice(0, 9)]);

    // Show native notification if permissions are granted
    if (mobileStatus.notificationsEnabled && 'Notification' in window) {
      new window.Notification(title, {
        body: message,
        icon: '/favicon.ico'
      });
    }

    // Show toast
    toast({
      title,
      description: message,
      variant: type === 'error' ? 'destructive' : 'default'
    });
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const quickActions: QuickAction[] = [
    {
      id: 'clock',
      name: isClocked ? 'Clock Out' : 'Clock In',
      icon: Clock,
      action: clockInOut,
      enabled: true,
      badge: isClocked ? 1 : 0
    },
    {
      id: 'camera',
      name: 'Take Photo',
      icon: Camera,
      action: takePhoto,
      enabled: mobileStatus.cameraAvailable
    },
    {
      id: 'voice',
      name: voiceRecording ? 'Stop Recording' : 'Voice Note',
      icon: Mic,
      action: voiceRecording ? stopVoiceRecording : startVoiceRecording,
      enabled: mobileStatus.microphoneAvailable
    },
    {
      id: 'sync',
      name: 'Sync Data',
      icon: Sync,
      action: syncOfflineActions,
      enabled: mobileStatus.isOnline && !syncInProgress,
      badge: offlineActions.filter(a => !a.synced).length
    }
  ];

  const getSignalIcon = () => {
    if (!mobileStatus.isOnline) return <WifiOff className="h-4 w-4 text-red-500" />;
    if (mobileStatus.signalStrength >= 3) return <Signal className="h-4 w-4 text-green-500" />;
    if (mobileStatus.signalStrength >= 2) return <Signal className="h-4 w-4 text-yellow-500" />;
    return <Signal className="h-4 w-4 text-red-500" />;
  };

  const getBatteryColor = () => {
    if (mobileStatus.batteryLevel > 50) return 'text-green-500';
    if (mobileStatus.batteryLevel > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <Card className="p-8 text-center">
          <Smartphone className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">Mobile Access</h2>
          <p className="text-muted-foreground">Please sign in to access mobile features</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 bg-white rounded-lg mb-4 shadow-sm">
        <div className="flex items-center space-x-2">
          {getSignalIcon()}
          <span className="text-xs">{mobileStatus.isOnline ? 'Online' : 'Offline'}</span>
        </div>
        
        <div className="flex items-center space-x-3">
          {currentLocation && (
            <MapPin className="h-4 w-4 text-blue-500" />
          )}
          <div className="flex items-center space-x-1">
            <Battery className={`h-4 w-4 ${getBatteryColor()}`} />
            <span className="text-xs">{mobileStatus.batteryLevel}%</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Home className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(action => (
              <Button
                key={action.id}
                variant={action.id === 'clock' && isClocked ? 'destructive' : 'outline'}
                className="relative h-16 flex-col space-y-1"
                onClick={action.action}
                disabled={!action.enabled}
              >
                <action.icon className="h-5 w-5" />
                <span className="text-xs">{action.name}</span>
                {action.badge && action.badge > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    {action.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="text-xs">
            <Home className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs relative">
            <Bell className="h-4 w-4" />
            {notifications.filter(n => !n.read).length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs">
                {notifications.filter(n => !n.read).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="offline" className="text-xs relative">
            <Download className="h-4 w-4" />
            {offlineActions.filter(a => !a.synced).length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs">
                {offlineActions.filter(a => !a.synced).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">
            <Settings className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          {/* Current Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Current Status</h3>
                <Badge variant={isClocked ? 'default' : 'secondary'}>
                  {isClocked ? 'Clocked In' : 'Clocked Out'}
                </Badge>
              </div>
              
              {isClocked && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Started:</span>
                    <span>8:00 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>2h 45m</span>
                  </div>
                  {currentLocation && (
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="text-blue-600">GPS Active</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Summary */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Today's Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Hours Worked:</span>
                  <span className="font-medium">6.5h</span>
                </div>
                <div className="flex justify-between">
                  <span>Tasks Completed:</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span>Photos Taken:</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Distance Traveled:</span>
                  <span className="font-medium">15.2 mi</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weather & Conditions */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Current Conditions</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">72°F</div>
                  <div className="text-sm text-muted-foreground">Partly Cloudy</div>
                </div>
                <div className="text-right text-sm">
                  <div>Wind: 8 mph</div>
                  <div>Humidity: 45%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-3">
          {notifications.map(notification => (
            <Card 
              key={notification.id}
              className={`cursor-pointer ${notification.read ? 'opacity-60' : ''}`}
              onClick={() => markNotificationRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Offline Actions Tab */}
        <TabsContent value="offline" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Offline Actions</h3>
            <Button 
              size="sm" 
              onClick={syncOfflineActions}
              disabled={!mobileStatus.isOnline || syncInProgress}
            >
              {syncInProgress ? (
                <Sync className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </Button>
          </div>

          {offlineActions.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">No offline actions pending</p>
              </CardContent>
            </Card>
          ) : (
            offlineActions.map(action => (
              <Card key={action.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm capitalize">
                        {action.type.replace('_', ' ')}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(action.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={action.synced ? 'default' : 'secondary'}>
                      {action.synced ? 'Synced' : 'Pending'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">GPS Tracking</Label>
                  <p className="text-xs text-muted-foreground">Enable location tracking</p>
                </div>
                <Switch checked={mobileStatus.gpsEnabled} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive instant alerts</p>
                </div>
                <Switch checked={mobileStatus.notificationsEnabled} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Auto Sync</Label>
                  <p className="text-xs text-muted-foreground">Sync when online</p>
                </div>
                <Switch checked={true} />
              </div>

              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Data Usage:</span>
                    <span>{mobileStatus.dataUsage} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Sync:</span>
                    <span>{new Date(mobileStatus.lastSync).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>App Version:</span>
                    <span>1.0.0</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Camera Overlay */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-white text-center">
            <Camera className="h-16 w-16 mx-auto mb-4" />
            <p>Camera is active...</p>
            <p className="text-sm opacity-75">Taking photo in 3 seconds</p>
          </div>
        </div>
      )}

      {/* Voice Recording Indicator */}
      {voiceRecording && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-500 text-white p-3 rounded-lg flex items-center justify-center z-40">
          <Mic className="h-4 w-4 mr-2" />
          <span className="text-sm">Recording voice note...</span>
          <Button 
            size="sm" 
            variant="ghost" 
            className="ml-4 text-white hover:bg-red-600"
            onClick={stopVoiceRecording}
          >
            Stop
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileCompanion;