// PHASE 10: Enhanced Mobile Field Interface
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  MapPin, 
  Mic, 
  WifiOff, 
  Wifi, 
  Battery, 
  Smartphone,
  Navigation,
  Target,
  Upload,
  Download,
  Vibrate,
  Volume2,
  Settings,
  PlayCircle,
  Square,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';

// PHASE 10: Import enhanced mobile service
import { 
  enhancedMobileService,
  MobileCapabilities,
  LocationData,
  PhotoData,
  MobileSettings
} from '@/services/enhancedMobileService';

// PHASE 10: Enhanced Field Interface Component
const EnhancedMobileFieldInterface: React.FC = () => {
  // State management
  const [capabilities, setCapabilities] = useState<MobileCapabilities | null>(null);
  const [settings, setSettings] = useState<MobileSettings | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [syncStatus, setSyncStatus] = useState({ total: 0, pending: 0, failed: 0 });
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('camera');

  // Field report state
  const [fieldReport, setFieldReport] = useState({
    title: '',
    description: '',
    location: null as LocationData | null,
    photos: [] as string[],
    measurements: '',
    issues: '',
    recommendations: ''
  });

  // Effects
  useEffect(() => {
    initializeMobileInterface();
    return () => {
      enhancedMobileService.cleanup();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      updateSyncStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // PHASE 10: Initialize mobile interface
  const initializeMobileInterface = async () => {
    try {
      setLoading(true);
      
      // Get device capabilities
      const caps = await enhancedMobileService.detectCapabilities();
      setCapabilities(caps);
      setIsOnline(caps.hasNetwork);
      
      // Get settings
      const settings = enhancedMobileService.getSettings();
      setSettings(settings);
      
      // Get current location if available
      if (caps.hasGPS) {
        try {
          const location = await enhancedMobileService.getCurrentLocation();
          setCurrentLocation(location);
          setFieldReport(prev => ({ ...prev, location }));
        } catch (error) {
          console.warn('Could not get initial location:', error);
        }
      }
      
      updateSyncStatus();
    } catch (error) {
      console.error('Failed to initialize mobile interface:', error);
    } finally {
      setLoading(false);
    }
  };

  // PHASE 10: Camera functionality
  const handleTakePhoto = async () => {
    try {
      const photo = await enhancedMobileService.takePhoto({
        includeLocation: true,
        saveToGallery: true,
        allowEditing: false
      });
      
      setPhotos(prev => [photo, ...prev]);
      setFieldReport(prev => ({
        ...prev,
        photos: [photo.id, ...prev.photos]
      }));
      
      // Show success feedback
      showNotification('Photo captured successfully!', 'success');
    } catch (error) {
      console.error('Error taking photo:', error);
      showNotification('Failed to take photo', 'error');
    }
  };

  // PHASE 10: Location tracking
  const toggleLocationTracking = async () => {
    try {
      if (isTracking) {
        await enhancedMobileService.stopLocationTracking();
        setIsTracking(false);
        showNotification('Location tracking stopped', 'info');
      } else {
        await enhancedMobileService.startLocationTracking((location) => {
          setCurrentLocation(location);
          if (!fieldReport.location) {
            setFieldReport(prev => ({ ...prev, location }));
          }
        });
        setIsTracking(true);
        showNotification('Location tracking started', 'success');
      }
    } catch (error) {
      console.error('Error toggling location tracking:', error);
      showNotification('Location tracking failed', 'error');
    }
  };

  // PHASE 10: Voice-to-text functionality
  const handleVoiceRecording = async () => {
    try {
      if (isRecording) {
        setIsRecording(false);
        return;
      }
      
      setIsRecording(true);
      const transcript = await enhancedMobileService.startVoiceRecognition();
      setVoiceText(transcript);
      setFieldReport(prev => ({
        ...prev,
        description: prev.description + (prev.description ? ' ' : '') + transcript
      }));
      showNotification('Voice transcribed successfully!', 'success');
    } catch (error) {
      console.error('Voice recognition error:', error);
      showNotification('Voice recognition failed', 'error');
    } finally {
      setIsRecording(false);
    }
  };

  // PHASE 10: Sync management
  const updateSyncStatus = () => {
    const status = enhancedMobileService.getOfflineQueueStatus();
    setSyncStatus(status);
  };

  const handleManualSync = async () => {
    try {
      showNotification('Syncing data...', 'info');
      await enhancedMobileService.syncOfflineQueue();
      updateSyncStatus();
      showNotification('Sync completed!', 'success');
    } catch (error) {
      console.error('Sync failed:', error);
      showNotification('Sync failed', 'error');
    }
  };

  // PHASE 10: Settings management
  const updateMobileSettings = async (key: keyof MobileSettings, value: any) => {
    try {
      const newSettings = { [key]: value };
      await enhancedMobileService.updateSettings(newSettings);
      setSettings(prev => prev ? { ...prev, ...newSettings } : null);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  // PHASE 10: Utility functions
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    // Trigger haptic feedback
    if (capabilities?.hasHaptics) {
      enhancedMobileService.triggerHaptic(type === 'error' ? 'heavy' : 'light');
    }
    // You can integrate with your notification system here
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const formatLocation = (location: LocationData | null): string => {
    if (!location) return 'Location not available';
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  const getNetworkStatusColor = () => {
    return isOnline ? 'text-green-600' : 'text-red-600';
  };

  const getBatteryStatusColor = () => {
    if (!capabilities?.batteryLevel) return 'text-gray-400';
    if (capabilities.batteryLevel > 50) return 'text-green-600';
    if (capabilities.batteryLevel > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Initializing mobile interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      {/* PHASE 10: Device Status Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Field Interface
            </CardTitle>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className={`h-4 w-4 ${getNetworkStatusColor()}`} />
              ) : (
                <WifiOff className={`h-4 w-4 ${getNetworkStatusColor()}`} />
              )}
              {capabilities?.batteryLevel && (
                <div className="flex items-center gap-1">
                  <Battery className={`h-4 w-4 ${getBatteryStatusColor()}`} />
                  <span className={`text-xs ${getBatteryStatusColor()}`}>
                    {Math.round(capabilities.batteryLevel * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>
          <CardDescription>
            {capabilities?.deviceType} • {capabilities?.platform} • 
            {isOnline ? ' Online' : ' Offline Mode'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* PHASE 10: Offline Sync Status */}
      {syncStatus.total > 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Offline Queue</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              {syncStatus.pending} pending, {syncStatus.failed} failed
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleManualSync}
              disabled={!isOnline}
            >
              <Upload className="h-3 w-3 mr-1" />
              Sync
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* PHASE 10: Main Interface Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="camera" className="flex items-center gap-1">
            <Camera className="h-3 w-3" />
            Camera
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            GPS
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-1">
            <Mic className="h-3 w-3" />
            Voice
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* PHASE 10: Camera Tab */}
        <TabsContent value="camera" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Photo Capture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleTakePhoto}
                disabled={!capabilities?.hasCamera}
                className="w-full"
                size="lg"
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>

              {/* Photo Gallery */}
              {photos.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Recent Photos ({photos.length})</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {photos.slice(0, 4).map((photo) => (
                      <div key={photo.id} className="relative aspect-square">
                        <img
                          src={photo.dataUrl}
                          alt="Field photo"
                          className="w-full h-full object-cover rounded border"
                        />
                        <Badge className="absolute top-1 right-1 text-xs">
                          {photo.saved ? 'Saved' : 'Local'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PHASE 10: Location Tab */}
        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                GPS Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Location:</span>
                  <Badge variant={currentLocation ? 'default' : 'secondary'}>
                    {currentLocation ? 'Available' : 'Not Available'}
                  </Badge>
                </div>
                {currentLocation && (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    <p><strong>Coordinates:</strong> {formatLocation(currentLocation)}</p>
                    <p><strong>Accuracy:</strong> ±{currentLocation.accuracy.toFixed(1)}m</p>
                    {currentLocation.address && (
                      <p><strong>Address:</strong> {currentLocation.address}</p>
                    )}
                  </div>
                )}
              </div>

              <Button
                onClick={toggleLocationTracking}
                disabled={!capabilities?.hasGPS}
                className="w-full"
                variant={isTracking ? 'destructive' : 'default'}
              >
                {isTracking ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Stop Tracking
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4 mr-2" />
                    Start Tracking
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PHASE 10: Voice Tab */}
        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleVoiceRecording}
                disabled={!settings?.voiceToText}
                className="w-full"
                variant={isRecording ? 'destructive' : 'default'}
                size="lg"
              >
                {isRecording ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>

              {isRecording && (
                <div className="flex items-center justify-center p-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="text-sm">Recording...</span>
                  </div>
                </div>
              )}

              {voiceText && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Transcription:</label>
                  <div className="p-3 bg-blue-50 rounded text-sm">
                    {voiceText}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Field Report:</label>
                <Textarea
                  placeholder="Describe your observations..."
                  value={fieldReport.description}
                  onChange={(e) => setFieldReport(prev => ({ 
                    ...prev, 
                    description: e.target.value 
                  }))}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PHASE 10: Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Mobile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Auto Sync</label>
                      <p className="text-xs text-gray-500">Sync when network available</p>
                    </div>
                    <Switch
                      checked={settings.autoSync}
                      onCheckedChange={(checked) => updateMobileSettings('autoSync', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Haptic Feedback</label>
                      <p className="text-xs text-gray-500">Vibrate on actions</p>
                    </div>
                    <Switch
                      checked={settings.hapticFeedback}
                      onCheckedChange={(checked) => updateMobileSettings('hapticFeedback', checked)}
                      disabled={!capabilities?.hasHaptics}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Voice to Text</label>
                      <p className="text-xs text-gray-500">Enable voice recognition</p>
                    </div>
                    <Switch
                      checked={settings.voiceToText}
                      onCheckedChange={(checked) => updateMobileSettings('voiceToText', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Background Sync</label>
                      <p className="text-xs text-gray-500">Sync in background</p>
                    </div>
                    <Switch
                      checked={settings.backgroundSync}
                      onCheckedChange={(checked) => updateMobileSettings('backgroundSync', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Photo Quality</label>
                    <select
                      value={settings.photosQuality}
                      onChange={(e) => updateMobileSettings('photosQuality', e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="high">High (100%)</option>
                      <option value="medium">Medium (75%)</option>
                      <option value="low">Low (50%)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location Accuracy</label>
                    <select
                      value={settings.locationAccuracy}
                      onChange={(e) => updateMobileSettings('locationAccuracy', e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="high">High Accuracy</option>
                      <option value="medium">Balanced</option>
                      <option value="low">Battery Saver</option>
                    </select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedMobileFieldInterface;