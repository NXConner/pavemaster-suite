import { 
  Camera, 
  CameraResultType, 
  CameraSource
} from '@capacitor/camera';
import { 
  Geolocation
} from '@capacitor/geolocation';
import { 
  Device
} from '@capacitor/device';
import { 
  Network
} from '@capacitor/network';
import { 
  Preferences 
} from '@capacitor/preferences';
import { 
  PushNotifications
} from '@capacitor/push-notifications';
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
  Directory, 
  Encoding 
} from '@capacitor/filesystem';
import { 
  Share 
} from '@capacitor/share';
import { 
  Motion
} from '@capacitor/motion';
import { 
  App
} from '@capacitor/app';
import { 
  Keyboard,
  KeyboardResize 
} from '@capacitor/keyboard';
import { 
  Toast 
} from '@capacitor/toast';

// Types
export interface MobileCapabilities {
  camera: boolean;
  geolocation: boolean;
  pushNotifications: boolean;
  haptics: boolean;
  filesystem: boolean;
  motion: boolean;
  network: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export interface PhotoData {
  base64String?: string;
  dataUrl?: string;
  path?: string;
  webPath?: string;
  format: string;
  saved: boolean;
}

export interface OfflineData {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  synced: boolean;
  retries: number;
}

export interface NotificationPayload {
  title: string;
  body: string;
  id?: string;
  badge?: number;
  data?: any;
}

class MobileService {
  private capabilities: MobileCapabilities;
  private offlineQueue: OfflineData[] = [];
  private isInitialized = false;
  private listeners: { [key: string]: Function[] } = {};

  constructor() {
    this.capabilities = {
      camera: false,
      geolocation: false,
      pushNotifications: false,
      haptics: false,
      filesystem: false,
      motion: false,
      network: false,
    };
  }

  async initialize(): Promise<MobileCapabilities> {
    if (this.isInitialized) {
      return this.capabilities;
    }

    console.log('🚀 Initializing Mobile Service...');

    try {
      // Check device capabilities
      await this.checkCapabilities();
      
      // Initialize core services
      await this.initializeNetworkMonitoring();
      await this.initializeAppStateMonitoring();
      await this.initializeKeyboardHandling();
      await this.initializePushNotifications();
      
      // Load offline data
      await this.loadOfflineQueue();
      
      // Setup auto-sync
      this.setupAutoSync();

      this.isInitialized = true;
      console.log('✅ Mobile service initialized successfully', this.capabilities);
      
      return this.capabilities;
    } catch (error) {
      console.error('❌ Mobile Service initialization failed:', error);
      throw error;
    }
  }

  private async checkCapabilities(): Promise<void> {
    try {
      // Check Camera
      try {
        this.capabilities.camera = true;
      } catch {
        this.capabilities.camera = false;
      }

      // Check Geolocation
      try {
        await Geolocation.checkPermissions();
        this.capabilities.geolocation = true;
      } catch {
        this.capabilities.geolocation = false;
      }

      // Check Push Notifications
      try {
        this.capabilities.pushNotifications = true;
      } catch {
        this.capabilities.pushNotifications = false;
      }

      // Check Haptics
      try {
        this.capabilities.haptics = true;
      } catch {
        this.capabilities.haptics = false;
      }

      // Check Filesystem
      try {
        this.capabilities.filesystem = true;
      } catch {
        this.capabilities.filesystem = false;
      }

      // Check Motion
      try {
        this.capabilities.motion = true;
      } catch {
        this.capabilities.motion = false;
      }

      // Check Network
      try {
        await Network.getStatus();
        this.capabilities.network = true;
      } catch {
        this.capabilities.network = false;
      }
    } catch (error) {
      console.error('Error checking capabilities:', error);
    }
  }

  // Camera Service
  async takePhoto(options?: {
    quality?: number;
    source?: CameraSource;
    saveToGallery?: boolean;
  }): Promise<PhotoData> {
    if (!this.capabilities.camera) {
      throw new Error('Camera not available');
    }

    try {
      const photo = await Camera.getPhoto({
        quality: options?.quality || 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: options?.source || CameraSource.Camera,
        saveToGallery: options?.saveToGallery || true,
      });

      const photoData: PhotoData = {
        base64String: photo.base64String,
        dataUrl: photo.dataUrl,
        path: photo.path,
        webPath: photo.webPath,
        format: photo.format,
        saved: true,
      };

      // Save to offline queue if not synced
      await this.addToOfflineQueue('photo', photoData);

      await this.triggerHapticFeedback();
      await this.showToast('Photo captured successfully');

      return photoData;
    } catch (error) {
      console.error('Camera error:', error);
      throw new Error('Failed to capture photo');
    }
  }

  // Geolocation Service
  async getCurrentLocation(options?: any): Promise<LocationData> {
    if (!this.capabilities.geolocation) {
      throw new Error('Geolocation not available');
    }

    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
        ...options,
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
      };

      // Save to offline queue
      await this.addToOfflineQueue('location', locationData);

      return locationData;
    } catch (error) {
      console.error('Geolocation error:', error);
      throw new Error('Failed to get location');
    }
  }

  async watchLocation(callback: (location: LocationData) => void): Promise<string> {
    if (!this.capabilities.geolocation) {
      throw new Error('Geolocation not available');
    }

    const watchId = await Geolocation.watchPosition({
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 5000,
    }, (position, error) => {
      if (error) {
        console.error('Location watch error:', error);
        return;
      }

      if (position) {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        };
        callback(locationData);
      }
    });

    return watchId;
  }

  async clearLocationWatch(watchId: string): Promise<void> {
    await Geolocation.clearWatch({ id: watchId });
  }

  // Network Service
  private async initializeNetworkMonitoring(): Promise<void> {
    if (!this.capabilities.network) return;

    Network.addListener('networkStatusChange', (status) => {
      this.emit('networkStatusChange', status);
      
      if (status.connected && this.offlineQueue.length > 0) {
        this.syncOfflineData();
      }
    });
  }

  async getNetworkStatus(): Promise<any> {
    if (!this.capabilities.network) {
      throw new Error('Network monitoring not available');
    }

    return await Network.getStatus();
  }

  // Storage Service
  async setItem(key: string, value: any): Promise<void> {
    try {
      await Preferences.set({
        key,
        value: JSON.stringify(value),
      });
    } catch (error) {
      console.error('Storage set error:', error);
      throw new Error('Failed to save data');
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const { value } = await Preferences.get({ key });
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error('Storage remove error:', error);
      throw new Error('Failed to remove data');
    }
  }

  async clear(): Promise<void> {
    try {
      await Preferences.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
      throw new Error('Failed to clear storage');
    }
  }

  // Push Notifications Service
  private async initializePushNotifications(): Promise<void> {
    if (!this.capabilities.pushNotifications) return;

    try {
      await PushNotifications.requestPermissions();

      PushNotifications.addListener('registration', (token: any) => {
        console.log('Push registration success, token: ' + token.value);
        this.emit('pushTokenReceived', token.value);
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Push registration error: ', error);
        this.emit('pushRegistrationError', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
        console.log('Push notification received: ', notification);
        this.emit('pushNotificationReceived', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification: any) => {
        console.log('Push notification action performed', notification);
        this.emit('pushNotificationActionPerformed', notification);
      });

      await PushNotifications.register();
    } catch (error) {
      console.error('Push notifications initialization error:', error);
    }
  }

  // Haptics Service
  async triggerHapticFeedback(style: ImpactStyle = ImpactStyle.Medium): Promise<void> {
    if (!this.capabilities.haptics) return;

    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.error('Haptics error:', error);
    }
  }

  // File System Service
  async saveFile(fileName: string, data: string, directory: Directory = Directory.Documents): Promise<string> {
    if (!this.capabilities.filesystem) {
      throw new Error('Filesystem not available');
    }

    try {
      const result = await Filesystem.writeFile({
        path: fileName,
        data,
        directory,
        encoding: Encoding.UTF8,
      });

      return result.uri;
    } catch (error) {
      console.error('File save error:', error);
      throw new Error('Failed to save file');
    }
  }

  async readFile(fileName: string, directory: Directory = Directory.Documents): Promise<string> {
    if (!this.capabilities.filesystem) {
      throw new Error('Filesystem not available');
    }

    try {
      const result = await Filesystem.readFile({
        path: fileName,
        directory,
        encoding: Encoding.UTF8,
      });

      return result.data as string;
    } catch (error) {
      console.error('File read error:', error);
      throw new Error('Failed to read file');
    }
  }

  // Share Service
  async shareContent(content: {
    title?: string;
    text?: string;
    url?: string;
    files?: string[];
  }): Promise<void> {
    try {
      await Share.share(content);
    } catch (error) {
      console.error('Share error:', error);
      throw new Error('Failed to share content');
    }
  }

  // Motion Service
  async startMotionTracking(callback: (data: any) => void): Promise<void> {
    if (!this.capabilities.motion) {
      throw new Error('Motion tracking not available');
    }

    try {
      await Motion.addListener('accel', callback);
    } catch (error) {
      console.error('Motion tracking error:', error);
      throw new Error('Failed to start motion tracking');
    }
  }

  async stopMotionTracking(): Promise<void> {
    try {
      await Motion.removeAllListeners();
    } catch (error) {
      console.error('Motion stop error:', error);
    }
  }

  // App State Service
  private async initializeAppStateMonitoring(): Promise<void> {
    App.addListener('appStateChange', (state: any) => {
      this.emit('appStateChange', state);
      
      if (state.isActive) {
        // App became active, sync if needed
        this.syncOfflineData();
      }
    });

    App.addListener('backButton', () => {
      this.emit('backButton');
    });
  }

  // Keyboard Service
  private async initializeKeyboardHandling(): Promise<void> {
    Keyboard.setResizeMode({ mode: KeyboardResize.Body });

    Keyboard.addListener('keyboardWillShow', (info) => {
      this.emit('keyboardWillShow', info);
    });

    Keyboard.addListener('keyboardDidShow', (info) => {
      this.emit('keyboardDidShow', info);
    });

    Keyboard.addListener('keyboardWillHide', () => {
      this.emit('keyboardWillHide');
    });

    Keyboard.addListener('keyboardDidHide', () => {
      this.emit('keyboardDidHide');
    });
  }

  // Toast Service
  async showToast(text: string, duration: 'short' | 'long' = 'short'): Promise<void> {
    try {
      await Toast.show({
        text,
        duration,
      });
    } catch (error) {
      console.error('Toast error:', error);
    }
  }

  // Status Bar Service
  async setStatusBarStyle(style: Style): Promise<void> {
    try {
      await StatusBar.setStyle({ style });
    } catch (error) {
      console.error('Status bar error:', error);
    }
  }

  async hideStatusBar(): Promise<void> {
    try {
      await StatusBar.hide();
    } catch (error) {
      console.error('Status bar hide error:', error);
    }
  }

  async showStatusBar(): Promise<void> {
    try {
      await StatusBar.show();
    } catch (error) {
      console.error('Status bar show error:', error);
    }
  }

  // Offline Data Management
  private async addToOfflineQueue(type: string, data: any): Promise<void> {
    const offlineData: OfflineData = {
      id: this.generateId(),
      type,
      data,
      timestamp: Date.now(),
      synced: false,
      retries: 0,
    };

    this.offlineQueue.push(offlineData);
    await this.saveOfflineQueue();
  }

  private async loadOfflineQueue(): Promise<void> {
    try {
      const queue = await this.getItem<OfflineData[]>('offlineQueue');
      this.offlineQueue = queue || [];
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.offlineQueue = [];
    }
  }

  private async saveOfflineQueue(): Promise<void> {
    try {
      await this.setItem('offlineQueue', this.offlineQueue);
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  private async syncOfflineData(): Promise<void> {
    if (this.offlineQueue.length === 0) return;

    try {
      const networkStatus = await this.getNetworkStatus();
      if (!networkStatus.connected) return;

      const unsyncedData = this.offlineQueue.filter(item => !item.synced);
      
      for (const item of unsyncedData) {
        try {
          // Simulate API call - replace with actual sync logic
          await this.syncDataItem(item);
          item.synced = true;
          this.emit('dataSynced', item);
        } catch (error) {
          item.retries++;
          console.error(`Failed to sync ${item.type}:`, error);
          
          // Remove items that have failed too many times
          if (item.retries > 3) {
            this.offlineQueue = this.offlineQueue.filter(q => q.id !== item.id);
          }
        }
      }

      // Remove synced items
      this.offlineQueue = this.offlineQueue.filter(item => !item.synced);
      await this.saveOfflineQueue();
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  private async syncDataItem(item: OfflineData): Promise<void> {
    // Mock sync - replace with actual API calls
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve();
        } else {
          reject(new Error('Sync failed'));
        }
      }, 1000);
    });
  }

  private setupAutoSync(): void {
    // Sync every 5 minutes when online
    setInterval(async () => {
      try {
        const networkStatus = await this.getNetworkStatus();
        if (networkStatus.connected) {
          await this.syncOfflineData();
        }
      } catch (error) {
        console.error('Auto-sync error:', error);
      }
    }, 5 * 60 * 1000);
  }

  // Device Info Service
  async getDeviceInfo(): Promise<any> {
    return await Device.getInfo();
  }

  async getDeviceId(): Promise<string> {
    const { identifier } = await Device.getId();
    return identifier;
  }

  // Event System
  on(event: string, callback: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data?: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Utility Methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Public Getters
  get isOnline(): boolean {
    return navigator.onLine;
  }

  hasCapability(capability: keyof MobileCapabilities): boolean {
    return this.capabilities[capability];
  }

  get offlineQueueSize(): number {
    return this.offlineQueue.filter(item => !item.synced).length;
  }

  get allCapabilities(): MobileCapabilities {
    return { ...this.capabilities };
  }
}

// Export singleton instance
export const mobileService = new MobileService();
export default mobileService;