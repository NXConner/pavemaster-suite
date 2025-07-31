// PHASE 10: Enhanced Mobile Service - Native Device Integration
import { 
  Camera, 
  CameraResultType, 
  CameraSource, 
  Photo 
} from '@capacitor/camera';
import { 
  Geolocation, 
  Position,
  GeolocationOptions 
} from '@capacitor/geolocation';
import { 
  Device, 
  DeviceInfo 
} from '@capacitor/device';
import { 
  Network, 
  NetworkStatus 
} from '@capacitor/network';
import { 
  Preferences 
} from '@capacitor/preferences';
import { 
  Haptics, 
  ImpactStyle 
} from '@capacitor/haptics';
import { 
  StatusBar, 
  Style 
} from '@capacitor/status-bar';
import { 
  Filesystem, 
  Directory 
} from '@capacitor/filesystem';

// PHASE 10: Enhanced Type Definitions
export interface MobileCapabilities {
  hasCamera: boolean;
  hasGPS: boolean;
  hasNetwork: boolean;
  hasHaptics: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  platform: 'ios' | 'android' | 'web';
  batteryLevel?: number;
  isCharging?: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
  address?: string;
}

export interface PhotoData {
  id: string;
  dataUrl: string;
  webPath?: string;
  format: string;
  saved: boolean;
  timestamp: number;
  location?: LocationData;
  metadata?: {
    width: number;
    height: number;
    size: number;
    orientation?: number;
  };
}

export interface OfflineQueueItem {
  id: string;
  type: 'photo' | 'location' | 'report' | 'measurement';
  data: any;
  timestamp: number;
  retryCount: number;
  priority: 'high' | 'medium' | 'low';
  syncStatus: 'pending' | 'syncing' | 'success' | 'failed';
}

export interface MobileSettings {
  autoSync: boolean;
  photosQuality: 'high' | 'medium' | 'low';
  locationAccuracy: 'high' | 'medium' | 'low';
  hapticFeedback: boolean;
  voiceToText: boolean;
  offlineMode: boolean;
  backgroundSync: boolean;
}

// PHASE 10: Enhanced Mobile Service Class
export class EnhancedMobileService {
  private capabilities: MobileCapabilities | null = null;
  private settings: MobileSettings;
  private offlineQueue: OfflineQueueItem[] = [];
  private locationWatcher: string | null = null;
  private syncInterval: number | null = null;

  constructor() {
    this.settings = {
      autoSync: true,
      photosQuality: 'high',
      locationAccuracy: 'high',
      hapticFeedback: true,
      voiceToText: true,
      offlineMode: false,
      backgroundSync: true
    };
    
    this.initializeService();
  }

  // PHASE 10: Service Initialization
  private async initializeService(): Promise<void> {
    try {
      await this.detectCapabilities();
      await this.loadSettings();
      await this.setupNetworkListener();
      await this.initializeOfflineQueue();
      
      if (this.settings.backgroundSync) {
        this.startBackgroundSync();
      }
      
      console.log('Enhanced Mobile Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize mobile service:', error);
    }
  }

  // PHASE 10: Device Capabilities Detection
  async detectCapabilities(): Promise<MobileCapabilities> {
    try {
      const deviceInfo = await Device.getInfo();
      const networkStatus = await Network.getStatus();
      
      const capabilities: MobileCapabilities = {
        hasCamera: deviceInfo.platform !== 'web',
        hasGPS: deviceInfo.platform !== 'web',
        hasNetwork: networkStatus.connected,
        hasHaptics: deviceInfo.platform !== 'web',
        deviceType: this.getDeviceType(deviceInfo),
        platform: deviceInfo.platform as 'ios' | 'android' | 'web'
      };

      // Enhanced capability detection
      if (deviceInfo.platform !== 'web') {
        try {
          const batteryInfo = await Device.getBatteryInfo();
          capabilities.batteryLevel = batteryInfo.batteryLevel;
          capabilities.isCharging = batteryInfo.isCharging;
        } catch (error) {
          console.warn('Battery info not available:', error);
        }
      }

      this.capabilities = capabilities;
      return capabilities;
    } catch (error) {
      console.error('Error detecting capabilities:', error);
      throw error;
    }
  }

  // PHASE 10: Camera Integration with Enhanced Features
  async takePhoto(options?: {
    quality?: number;
    allowEditing?: boolean;
    saveToGallery?: boolean;
    includeLocation?: boolean;
  }): Promise<PhotoData> {
    try {
      if (!this.capabilities?.hasCamera) {
        throw new Error('Camera not available on this device');
      }

      // Haptic feedback for photo capture
      if (this.settings.hapticFeedback) {
        await this.triggerHaptic('medium');
      }

      const photo = await Camera.getPhoto({
        quality: this.getPhotoQuality(),
        allowEditing: options?.allowEditing ?? false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        saveToGallery: options?.saveToGallery ?? true
      });

      let location: LocationData | undefined;
      if (options?.includeLocation && this.capabilities?.hasGPS) {
        try {
          location = await this.getCurrentLocation();
        } catch (error) {
          console.warn('Could not get location for photo:', error);
        }
      }

      const photoData: PhotoData = {
        id: this.generateId(),
        dataUrl: photo.dataUrl!,
        webPath: photo.webPath,
        format: photo.format,
        saved: options?.saveToGallery ?? true,
        timestamp: Date.now(),
        location,
        metadata: {
          width: photo.width || 0,
          height: photo.height || 0,
          size: this.estimatePhotoSize(photo.dataUrl!),
          orientation: 0
        }
      };

      // Save to offline queue if no network
      if (!this.capabilities?.hasNetwork) {
        await this.addToOfflineQueue({
          id: this.generateId(),
          type: 'photo',
          data: photoData,
          timestamp: Date.now(),
          retryCount: 0,
          priority: 'medium',
          syncStatus: 'pending'
        });
      }

      // Save locally
      await this.savePhotoLocally(photoData);
      
      return photoData;
    } catch (error) {
      console.error('Error taking photo:', error);
      throw error;
    }
  }

  // PHASE 10: Enhanced GPS Location Services
  async getCurrentLocation(highAccuracy: boolean = true): Promise<LocationData> {
    try {
      if (!this.capabilities?.hasGPS) {
        throw new Error('GPS not available on this device');
      }

      const options: GeolocationOptions = {
        enableHighAccuracy: highAccuracy,
        timeout: 10000,
        maximumAge: 60000
      };

      const position = await Geolocation.getCurrentPosition(options);
      
      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude || undefined,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined,
        timestamp: position.timestamp
      };

      // Try to get address if possible
      try {
        locationData.address = await this.reverseGeocode(
          locationData.latitude, 
          locationData.longitude
        );
      } catch (error) {
        console.warn('Reverse geocoding failed:', error);
      }

      return locationData;
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  }

  // PHASE 10: Location Tracking for Field Operations
  async startLocationTracking(callback: (location: LocationData) => void): Promise<string> {
    try {
      if (!this.capabilities?.hasGPS) {
        throw new Error('GPS not available for tracking');
      }

      const watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: this.settings.locationAccuracy === 'high',
          timeout: 10000,
          maximumAge: 30000
        },
        (position) => {
          if (position) {
            const locationData: LocationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude || undefined,
              heading: position.coords.heading || undefined,
              speed: position.coords.speed || undefined,
              timestamp: position.timestamp
            };
            callback(locationData);
          }
        },
        (error) => {
          console.error('Location tracking error:', error);
        }
      );

      this.locationWatcher = watchId;
      return watchId;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      throw error;
    }
  }

  async stopLocationTracking(): Promise<void> {
    if (this.locationWatcher) {
      await Geolocation.clearWatch({ id: this.locationWatcher });
      this.locationWatcher = null;
    }
  }

  // PHASE 10: Haptic Feedback System
  async triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
    try {
      if (!this.capabilities?.hasHaptics || !this.settings.hapticFeedback) {
        return;
      }

      const impactStyle = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy
      }[type];

      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  // PHASE 10: Voice-to-Text Integration
  async startVoiceRecognition(): Promise<string> {
    try {
      if (!this.settings.voiceToText) {
        throw new Error('Voice-to-text is disabled');
      }

      // Check if SpeechRecognition is available
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        return new Promise((resolve, reject) => {
          const SpeechRecognition = (window as any).SpeechRecognition || 
                                   (window as any).webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            resolve(transcript);
          };

          recognition.onerror = (event: any) => {
            reject(new Error(`Speech recognition error: ${event.error}`));
          };

          recognition.onend = () => {
            console.log('Speech recognition ended');
          };

          recognition.start();
          
          // Haptic feedback for start
          this.triggerHaptic('light');
        });
      } else {
        throw new Error('Speech recognition not supported');
      }
    } catch (error) {
      console.error('Voice recognition error:', error);
      throw error;
    }
  }

  // PHASE 10: Offline Queue Management
  private async addToOfflineQueue(item: OfflineQueueItem): Promise<void> {
    try {
      this.offlineQueue.push(item);
      await this.saveOfflineQueue();
      console.log(`Added item to offline queue: ${item.type}`);
    } catch (error) {
      console.error('Error adding to offline queue:', error);
    }
  }

  async syncOfflineQueue(): Promise<void> {
    try {
      if (!this.capabilities?.hasNetwork) {
        console.log('No network available for sync');
        return;
      }

      const pendingItems = this.offlineQueue.filter(
        item => item.syncStatus === 'pending' || item.syncStatus === 'failed'
      );

      for (const item of pendingItems) {
        try {
          item.syncStatus = 'syncing';
          await this.syncItem(item);
          item.syncStatus = 'success';
          
          // Haptic feedback for successful sync
          await this.triggerHaptic('light');
        } catch (error) {
          item.syncStatus = 'failed';
          item.retryCount++;
          console.error(`Failed to sync item ${item.id}:`, error);
        }
      }

      // Remove successfully synced items
      this.offlineQueue = this.offlineQueue.filter(
        item => item.syncStatus !== 'success'
      );
      
      await this.saveOfflineQueue();
    } catch (error) {
      console.error('Error syncing offline queue:', error);
    }
  }

  // PHASE 10: Network Status Management
  private async setupNetworkListener(): Promise<void> {
    try {
      Network.addListener('networkStatusChange', async (status: NetworkStatus) => {
        if (this.capabilities) {
          this.capabilities.hasNetwork = status.connected;
        }

        if (status.connected && this.settings.autoSync) {
          // Auto-sync when network becomes available
          setTimeout(() => this.syncOfflineQueue(), 1000);
        }
      });
    } catch (error) {
      console.error('Error setting up network listener:', error);
    }
  }

  // PHASE 10: Background Sync
  private startBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Sync every 5 minutes
    this.syncInterval = window.setInterval(async () => {
      if (this.capabilities?.hasNetwork && this.settings.autoSync) {
        await this.syncOfflineQueue();
      }
    }, 5 * 60 * 1000);
  }

  // PHASE 10: Utility Methods
  private getDeviceType(deviceInfo: DeviceInfo): 'mobile' | 'tablet' | 'desktop' {
    if (deviceInfo.platform === 'web') return 'desktop';
    // Simple heuristic - could be enhanced with screen size detection
    return deviceInfo.platform === 'ios' || deviceInfo.platform === 'android' 
      ? 'mobile' : 'desktop';
  }

  private getPhotoQuality(): number {
    const qualityMap = {
      high: 100,
      medium: 75,
      low: 50
    };
    return qualityMap[this.settings.photosQuality];
  }

  private generateId(): string {
    return `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private estimatePhotoSize(dataUrl: string): number {
    // Rough estimation of photo size in bytes
    return Math.round((dataUrl.length * 3) / 4);
  }

  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    // Placeholder for reverse geocoding - integrate with preferred service
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  private async savePhotoLocally(photo: PhotoData): Promise<void> {
    try {
      await Preferences.set({
        key: `photo_${photo.id}`,
        value: JSON.stringify(photo)
      });
    } catch (error) {
      console.error('Error saving photo locally:', error);
    }
  }

  private async saveOfflineQueue(): Promise<void> {
    try {
      await Preferences.set({
        key: 'offline_queue',
        value: JSON.stringify(this.offlineQueue)
      });
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  private async loadSettings(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: 'mobile_settings' });
      if (value) {
        this.settings = { ...this.settings, ...JSON.parse(value) };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  private async initializeOfflineQueue(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: 'offline_queue' });
      if (value) {
        this.offlineQueue = JSON.parse(value);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
    }
  }

  private async syncItem(item: OfflineQueueItem): Promise<void> {
    // Placeholder for actual sync implementation
    // This would integrate with your backend API
    console.log(`Syncing ${item.type} item:`, item.id);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // PHASE 10: Public API Methods
  async updateSettings(newSettings: Partial<MobileSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    
    try {
      await Preferences.set({
        key: 'mobile_settings',
        value: JSON.stringify(this.settings)
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  getCapabilities(): MobileCapabilities | null {
    return this.capabilities;
  }

  getSettings(): MobileSettings {
    return { ...this.settings };
  }

  getOfflineQueueStatus(): {
    total: number;
    pending: number;
    failed: number;
  } {
    const pending = this.offlineQueue.filter(item => item.syncStatus === 'pending').length;
    const failed = this.offlineQueue.filter(item => item.syncStatus === 'failed').length;
    
    return {
      total: this.offlineQueue.length,
      pending,
      failed
    };
  }

  // PHASE 10: Cleanup
  async cleanup(): Promise<void> {
    if (this.locationWatcher) {
      await this.stopLocationTracking();
    }
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

// PHASE 10: Export singleton instance
export const enhancedMobileService = new EnhancedMobileService();
export default enhancedMobileService;