import { Capacitor } from '@capacitor/core';
import { 
  Camera, CameraResultType, CameraSource, Photo 
} from '@capacitor/camera';
import { 
  Geolocation, Position, PositionOptions 
} from '@capacitor/geolocation';
import { 
  Device, DeviceInfo 
} from '@capacitor/device';
import { 
  Network, NetworkStatus 
} from '@capacitor/network';
import { 
  Filesystem, Directory, Encoding 
} from '@capacitor/filesystem';
import { 
  Preferences 
} from '@capacitor/preferences';
import { 
  PushNotifications, Token, PushNotificationSchema 
} from '@capacitor/push-notifications';
import { 
  Haptics, ImpactStyle 
} from '@capacitor/haptics';
import { 
  StatusBar, Style 
} from '@capacitor/status-bar';
import { 
  Toast 
} from '@capacitor/toast';

export interface MobileCapabilities {
  camera: boolean;
  geolocation: boolean;
  filesystem: boolean;
  network: boolean;
  pushNotifications: boolean;
  haptics: boolean;
  deviceInfo: boolean;
  preferences: boolean;
  statusBar: boolean;
  toast: boolean;
}

export interface FieldData {
  id: string;
  type: 'measurement' | 'photo' | 'note' | 'location' | 'inspection' | 'task';
  data: any;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
    heading?: number;
    speed?: number;
  };
  timestamp: string;
  synced: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata: {
    deviceId: string;
    userId: string;
    projectId?: string;
    taskId?: string;
    tags?: string[];
  };
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: string;
  pendingItems: number;
  failedItems: number;
  syncInProgress: boolean;
  bandwidth: 'low' | 'medium' | 'high';
  connectionType: 'none' | 'wifi' | 'cellular' | 'unknown';
}

export interface AdvancedLocation {
  coordinates: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  metadata: {
    timestamp: string;
    source: 'gps' | 'network' | 'passive';
    quality: 'high' | 'medium' | 'low';
  };
}

export interface EnhancedPhoto {
  webPath: string;
  base64String?: string;
  format: string;
  exif?: {
    latitude?: number;
    longitude?: number;
    timestamp?: string;
    camera?: string;
    orientation?: number;
  };
  metadata: {
    id: string;
    size: number;
    width?: number;
    height?: number;
    compressed: boolean;
    quality: number;
  };
}

class AdvancedMobileService {
  private capabilities: MobileCapabilities = {
    camera: false,
    geolocation: false,
    filesystem: false,
    network: false,
    pushNotifications: false,
    haptics: false,
    deviceInfo: false,
    preferences: false,
    statusBar: false,
    toast: false
  };

  private fieldDataQueue: FieldData[] = [];
  private syncStatus: SyncStatus = {
    isOnline: false,
    lastSync: new Date().toISOString(),
    pendingItems: 0,
    failedItems: 0,
    syncInProgress: false,
    bandwidth: 'medium',
    connectionType: 'unknown'
  };

  private locationWatchId: string | null = null;
  private currentLocation: AdvancedLocation | null = null;
  private deviceInfo: DeviceInfo | null = null;

  constructor() {
    this.initialize();
  }

  // Initialize mobile service and check capabilities
  async initialize(): Promise<void> {
    try {
      // Check platform capabilities
      this.capabilities = {
        camera: Capacitor.isPluginAvailable('Camera'),
        geolocation: Capacitor.isPluginAvailable('Geolocation'),
        filesystem: Capacitor.isPluginAvailable('Filesystem'),
        network: Capacitor.isPluginAvailable('Network'),
        pushNotifications: Capacitor.isPluginAvailable('PushNotifications'),
        haptics: Capacitor.isPluginAvailable('Haptics'),
        deviceInfo: Capacitor.isPluginAvailable('Device'),
        preferences: Capacitor.isPluginAvailable('Preferences'),
        statusBar: Capacitor.isPluginAvailable('StatusBar'),
        toast: Capacitor.isPluginAvailable('Toast')
      };

      // Get device information
      if (this.capabilities.deviceInfo) {
        this.deviceInfo = await Device.getInfo();
      }

      // Setup network monitoring
      if (this.capabilities.network) {
        await this.setupNetworkMonitoring();
      }

      // Setup push notifications
      if (this.capabilities.pushNotifications) {
        await this.setupPushNotifications();
      }

      // Load cached field data
      await this.loadCachedFieldData();

      console.log('Advanced Mobile Service initialized:', this.capabilities);
    } catch (error) {
      console.error('Failed to initialize mobile service:', error);
    }
  }

  // Enhanced photo capture with metadata
  async capturePhoto(options: {
    quality?: number;
    allowEditing?: boolean;
    source?: CameraSource;
    includeLocation?: boolean;
    compression?: boolean;
  } = {}): Promise<EnhancedPhoto> {
    if (!this.capabilities.camera) {
      throw new Error('Camera not available');
    }

    try {
      const photo: Photo = await Camera.getPhoto({
        quality: options.quality || 90,
        allowEditing: options.allowEditing || false,
        resultType: CameraResultType.Uri,
        source: options.source || CameraSource.Camera,
      });

      const enhancedPhoto: EnhancedPhoto = {
        webPath: photo.webPath!,
        base64String: photo.base64String,
        format: photo.format,
        metadata: {
          id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          size: 0, // Will be calculated if needed
          compressed: options.compression || false,
          quality: options.quality || 90
        }
      };

      // Add location data if requested and available
      if (options.includeLocation && this.currentLocation) {
        enhancedPhoto.exif = {
          latitude: this.currentLocation.coordinates.latitude,
          longitude: this.currentLocation.coordinates.longitude,
          timestamp: new Date().toISOString()
        };
      }

      // Provide haptic feedback
      if (this.capabilities.haptics) {
        await Haptics.impact({ style: ImpactStyle.Light });
      }

      return enhancedPhoto;
    } catch (error) {
      console.error('Failed to capture photo:', error);
      throw error;
    }
  }

  // Advanced location tracking with high accuracy
  async getCurrentLocation(options: {
    highAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  } = {}): Promise<AdvancedLocation> {
    if (!this.capabilities.geolocation) {
      throw new Error('Geolocation not available');
    }

    try {
      const positionOptions: PositionOptions = {
        enableHighAccuracy: options.highAccuracy || true,
        timeout: options.timeout || 15000,
        maximumAge: options.maximumAge || 60000
      };

      const position: Position = await Geolocation.getCurrentPosition(positionOptions);

      const advancedLocation: AdvancedLocation = {
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'gps',
          quality: position.coords.accuracy < 10 ? 'high' : 
                  position.coords.accuracy < 50 ? 'medium' : 'low'
        }
      };

      this.currentLocation = advancedLocation;
      return advancedLocation;
    } catch (error) {
      console.error('Failed to get location:', error);
      throw error;
    }
  }

  // Start continuous location tracking
  async startLocationTracking(callback: (location: AdvancedLocation) => void): Promise<string> {
    if (!this.capabilities.geolocation) {
      throw new Error('Geolocation not available');
    }

    try {
      this.locationWatchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        },
        (position, error) => {
          if (error) {
            console.error('Location tracking error:', error);
            return;
          }

          if (position) {
            const advancedLocation: AdvancedLocation = {
              coordinates: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude || undefined,
                altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
                heading: position.coords.heading || undefined,
                speed: position.coords.speed || undefined
              },
              metadata: {
                timestamp: new Date().toISOString(),
                source: 'gps',
                quality: position.coords.accuracy < 10 ? 'high' : 
                        position.coords.accuracy < 50 ? 'medium' : 'low'
              }
            };

            this.currentLocation = advancedLocation;
            callback(advancedLocation);
          }
        }
      );

      return this.locationWatchId;
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      throw error;
    }
  }

  // Stop location tracking
  async stopLocationTracking(): Promise<void> {
    if (this.locationWatchId) {
      await Geolocation.clearWatch({ id: this.locationWatchId });
      this.locationWatchId = null;
    }
  }

  // Store field data with offline support
  async storeFieldData(data: Omit<FieldData, 'id' | 'timestamp' | 'synced' | 'metadata'>): Promise<string> {
    const fieldData: FieldData = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      synced: false,
      metadata: {
        deviceId: this.deviceInfo?.identifier || 'unknown',
        userId: 'current_user', // Should be injected
        tags: []
      },
      ...data
    };

    // Add current location if available
    if (this.currentLocation) {
      fieldData.location = this.currentLocation.coordinates;
    }

    // Add to queue
    this.fieldDataQueue.push(fieldData);

    // Store locally
    await this.saveFieldDataLocally(fieldData);

    // Attempt immediate sync if online
    if (this.syncStatus.isOnline) {
      this.syncFieldData();
    }

    return fieldData.id;
  }

  // Advanced sync with retry mechanism
  async syncFieldData(): Promise<void> {
    if (this.syncStatus.syncInProgress || !this.syncStatus.isOnline) {
      return;
    }

    this.syncStatus.syncInProgress = true;
    this.syncStatus.pendingItems = this.fieldDataQueue.filter(item => !item.synced).length;

    try {
      const unsyncedData = this.fieldDataQueue.filter(item => !item.synced);
      
      for (const data of unsyncedData) {
        try {
          // Simulate API call - replace with actual implementation
          await this.uploadFieldData(data);
          
          // Mark as synced
          data.synced = true;
          this.syncStatus.pendingItems--;
          
          // Provide haptic feedback for successful sync
          if (this.capabilities.haptics) {
            await Haptics.impact({ style: ImpactStyle.Light });
          }
        } catch (error) {
          console.error('Failed to sync field data:', error);
          this.syncStatus.failedItems++;
        }
      }

      this.syncStatus.lastSync = new Date().toISOString();
      
      // Clean up synced data older than 24 hours
      await this.cleanupOldData();
      
    } catch (error) {
      console.error('Sync operation failed:', error);
    } finally {
      this.syncStatus.syncInProgress = false;
    }
  }

  // Enhanced notifications with rich content
  async showNotification(options: {
    title: string;
    body: string;
    priority?: 'low' | 'normal' | 'high';
    actions?: Array<{ id: string; title: string; }>;
    badge?: number;
    sound?: string;
  }): Promise<void> {
    if (this.capabilities.toast) {
      await Toast.show({
        text: `${options.title}: ${options.body}`,
        duration: options.priority === 'high' ? 'long' : 'short',
        position: 'bottom'
      });
    }

    if (this.capabilities.haptics && options.priority === 'high') {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    }
  }

  // Comprehensive device diagnostics
  async getDeviceDiagnostics(): Promise<{
    device: DeviceInfo | null;
    network: NetworkStatus | null;
    storage: { available: number; used: number };
    location: AdvancedLocation | null;
    capabilities: MobileCapabilities;
    syncStatus: SyncStatus;
  }> {
    const networkStatus = this.capabilities.network ? await Network.getStatus() : null;
    
    return {
      device: this.deviceInfo,
      network: networkStatus,
      storage: {
        available: 0, // Would need platform-specific implementation
        used: 0
      },
      location: this.currentLocation,
      capabilities: this.capabilities,
      syncStatus: this.syncStatus
    };
  }

  // Private helper methods
  private async setupNetworkMonitoring(): Promise<void> {
    const status = await Network.getStatus();
    this.updateSyncStatus(status);

    Network.addListener('networkStatusChange', (status) => {
      this.updateSyncStatus(status);
      
      // Auto-sync when coming back online
      if (status.connected && this.fieldDataQueue.some(item => !item.synced)) {
        setTimeout(() => this.syncFieldData(), 1000);
      }
    });
  }

  private updateSyncStatus(networkStatus: NetworkStatus): void {
    this.syncStatus.isOnline = networkStatus.connected;
    this.syncStatus.connectionType = networkStatus.connectionType;
    
    // Estimate bandwidth based on connection type
    if (networkStatus.connectionType === 'wifi') {
      this.syncStatus.bandwidth = 'high';
    } else if (networkStatus.connectionType === 'cellular') {
      this.syncStatus.bandwidth = 'medium';
    } else {
      this.syncStatus.bandwidth = 'low';
    }
  }

  private async setupPushNotifications(): Promise<void> {
    await PushNotifications.requestPermissions();
    
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push notification received: ', notification);
      
      // Provide haptic feedback
      if (this.capabilities.haptics) {
        Haptics.impact({ style: ImpactStyle.Medium });
      }
    });
  }

  private async saveFieldDataLocally(data: FieldData): Promise<void> {
    if (!this.capabilities.filesystem) return;

    try {
      const fileName = `field_data_${data.id}.json`;
      await Filesystem.writeFile({
        path: fileName,
        data: JSON.stringify(data),
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });
    } catch (error) {
      console.error('Failed to save field data locally:', error);
    }
  }

  private async loadCachedFieldData(): Promise<void> {
    if (!this.capabilities.filesystem) return;

    try {
      const { files } = await Filesystem.readdir({
        path: '',
        directory: Directory.Data
      });

      const fieldDataFiles = files.filter(file => file.name.startsWith('field_data_'));
      
      for (const file of fieldDataFiles) {
        try {
          const { data } = await Filesystem.readFile({
            path: file.name,
            directory: Directory.Data,
            encoding: Encoding.UTF8
          });
          
          const fieldData: FieldData = JSON.parse(data);
          this.fieldDataQueue.push(fieldData);
        } catch (error) {
          console.error('Failed to load cached field data:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load cached field data:', error);
    }
  }

  private async uploadFieldData(data: FieldData): Promise<void> {
    // Simulate API upload - replace with actual implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve();
        } else {
          reject(new Error('Upload failed'));
        }
      }, 1000 + Math.random() * 2000);
    });
  }

  private async cleanupOldData(): Promise<void> {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    this.fieldDataQueue = this.fieldDataQueue.filter(item => {
      const itemTime = new Date(item.timestamp).getTime();
      return !item.synced || itemTime > cutoffTime;
    });
  }

  // Public getters
  get isOnline(): boolean {
    return this.syncStatus.isOnline;
  }

  get pendingSync(): number {
    return this.syncStatus.pendingItems;
  }

  get currentPosition(): AdvancedLocation | null {
    return this.currentLocation;
  }

  get deviceCapabilities(): MobileCapabilities {
    return { ...this.capabilities };
  }

  get currentSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }
}

// Export singleton instance
export const advancedMobileService = new AdvancedMobileService();
export default advancedMobileService;