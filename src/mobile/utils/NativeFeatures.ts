// Note: Capacitor imports are optional - will gracefully degrade to web APIs
export interface PhotoResult {
  webPath: string;
  base64String?: string;
  format: string;
}

export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface NotificationOptions {
  title: string;
  body: string;
  id?: number;
  schedule?: Date;
  sound?: string;
  smallIcon?: string;
  largeIcon?: string;
}

class NativeFeatures {
  private isCapacitorAvailable = false;

  constructor() {
    this.checkCapacitorAvailability();
  }

  private checkCapacitorAvailability(): void {
    this.isCapacitorAvailable = !!(window as any).Capacitor;
    
    if (!this.isCapacitorAvailable) {
      console.warn('📱 Capacitor not available - native features will use web fallbacks');
    }
  }

  // Camera functionality
  async takePicture(options?: {
    quality?: number;
    allowEditing?: boolean;
    resultType?: 'base64' | 'uri';
    source?: 'camera' | 'photos';
  }): Promise<PhotoResult> {
    if (!this.isCapacitorAvailable) {
      return this.webCameraFallback();
    }

    try {
      // Dynamic import for Capacitor Camera
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      
      const image = await Camera.getPhoto({
        quality: options?.quality || 90,
        allowEditing: options?.allowEditing || false,
        resultType: options?.resultType === 'base64' ? CameraResultType.Base64 : CameraResultType.Uri,
        source: options?.source === 'photos' ? CameraSource.Photos : CameraSource.Camera,
      });

      return {
        webPath: image.webPath || '',
        base64String: image.base64String,
        format: image.format || 'jpeg'
      };
    } catch (error) {
      console.error('📷 Camera error:', error);
      // Fall back to web implementation
      return this.webCameraFallback();
    }
  }

  private async webCameraFallback(): Promise<PhotoResult> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Use rear camera by default
      
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              webPath: URL.createObjectURL(file),
              base64String: reader.result as string,
              format: file.type.split('/')[1] || 'jpeg'
            });
          };
          reader.readAsDataURL(file);
        } else {
          reject(new Error('No file selected'));
        }
      };
      
      input.click();
    });
  }

  // Geolocation functionality
  async getCurrentPosition(options?: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  }): Promise<LocationResult> {
    if (!this.isCapacitorAvailable) {
      return this.webGeolocationFallback(options);
    }

    try {
      // Dynamic import for Capacitor Geolocation
      const { Geolocation } = await import('@capacitor/geolocation');
      
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: options?.enableHighAccuracy || true,
        timeout: options?.timeout || 10000,
        maximumAge: options?.maximumAge || 60000,
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      };
    } catch (error) {
      console.error('📍 Geolocation error:', error);
      // Fall back to web implementation
      return this.webGeolocationFallback(options);
    }
  }

  private async webGeolocationFallback(options?: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  }): Promise<LocationResult> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: options?.enableHighAccuracy || true,
          timeout: options?.timeout || 10000,
          maximumAge: options?.maximumAge || 60000,
        }
      );
    });
  }

  // Watch position for continuous tracking
  async watchPosition(
    callback: (position: LocationResult) => void,
    errorCallback?: (error: Error) => void,
    options?: {
      enableHighAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
    }
  ): Promise<string> {
    if (!this.isCapacitorAvailable) {
      return this.webWatchPositionFallback(callback, errorCallback, options);
    }

    try {
      // Dynamic import for Capacitor Geolocation
      const { Geolocation } = await import('@capacitor/geolocation');
      
      const watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: options?.enableHighAccuracy || true,
          timeout: options?.timeout || 10000,
          maximumAge: options?.maximumAge || 60000,
        },
        (position) => {
          if (position) {
            callback({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            });
          }
        },
        (error) => {
          errorCallback?.(new Error(`Watch position error: ${error.message}`));
        }
      );

      return watchId;
    } catch (error) {
      console.error('📍 Watch position error:', error);
      // Fall back to web implementation
      return this.webWatchPositionFallback(callback, errorCallback, options);
    }
  }

  private async webWatchPositionFallback(
    callback: (position: LocationResult) => void,
    errorCallback?: (error: Error) => void,
    options?: {
      enableHighAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
    }
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          callback({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          errorCallback?.(new Error(`Watch position error: ${error.message}`));
        },
        {
          enableHighAccuracy: options?.enableHighAccuracy || true,
          timeout: options?.timeout || 10000,
          maximumAge: options?.maximumAge || 60000,
        }
      );

      resolve(watchId.toString());
    });
  }

  // Clear position watch
  async clearWatch(watchId: string): Promise<void> {
    if (!this.isCapacitorAvailable) {
      navigator.geolocation.clearWatch(parseInt(watchId));
      return;
    }

    try {
      // Dynamic import for Capacitor Geolocation
      const { Geolocation } = await import('@capacitor/geolocation');
      await Geolocation.clearWatch({ id: watchId });
    } catch (error) {
      console.error('📍 Clear watch error:', error);
      // Fall back to web implementation
      navigator.geolocation.clearWatch(parseInt(watchId));
    }
  }

  // Local notifications
  async scheduleNotification(options: NotificationOptions): Promise<void> {
    if (!this.isCapacitorAvailable) {
      return this.webNotificationFallback(options);
    }

    try {
      // Dynamic import for Capacitor LocalNotifications
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      await LocalNotifications.requestPermissions();

      const notificationOptions = {
        notifications: [
          {
            title: options.title,
            body: options.body,
            id: options.id || Date.now(),
            schedule: options.schedule ? { at: options.schedule } : undefined,
            sound: options.sound || 'default',
            smallIcon: options.smallIcon || 'ic_stat_icon_config_sample',
            largeIcon: options.largeIcon,
          },
        ],
      };

      await LocalNotifications.schedule(notificationOptions);
    } catch (error) {
      console.error('🔔 Notification error:', error);
      // Fall back to web implementation
      return this.webNotificationFallback(options);
    }
  }

  private async webNotificationFallback(options: NotificationOptions): Promise<void> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.smallIcon || '/icons/pwa-192x192.png',
        badge: options.largeIcon,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } else {
      throw new Error('Notification permission denied');
    }
  }

  // App info
  async getAppInfo(): Promise<any> {
    if (!this.isCapacitorAvailable) {
      return {
        name: 'PaveMaster Suite',
        id: 'com.pavemaster.suite',
        build: '1.0.0',
        version: '1.0.0',
      };
    }

    try {
      // Dynamic import for Capacitor App
      const { App } = await import('@capacitor/app');
      return await App.getInfo();
    } catch (error) {
      console.error('📱 App info error:', error);
      return {
        name: 'PaveMaster Suite',
        id: 'com.pavemaster.suite',
        build: '1.0.0',
        version: '1.0.0',
      };
    }
  }

  // App state handling
  setupAppStateListeners(): void {
    if (!this.isCapacitorAvailable) {
      // Web fallback for app state
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          console.log('📱 App moved to background');
        } else {
          console.log('📱 App moved to foreground');
        }
      });
      return;
    }

    // Dynamic import and setup for Capacitor App
    import('@capacitor/app').then(({ App }) => {
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('📱 App state changed. Is active:', isActive);
        
        if (isActive) {
          // App resumed - sync data, refresh content
          console.log('📱 App resumed - refreshing data');
        } else {
          // App paused - save state, pause operations
          console.log('📱 App paused - saving state');
        }
      });
    }).catch(() => {
      // Fall back to web implementation
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          console.log('📱 App moved to background');
        } else {
          console.log('📱 App moved to foreground');
        }
      });
    });
  }

  // Haptic feedback
  async hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): Promise<void> {
    if (this.isCapacitorAvailable) {
      try {
        // Dynamic import for Capacitor Haptics
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
        
        const impactStyle = type === 'light' ? ImpactStyle.Light :
                           type === 'medium' ? ImpactStyle.Medium : ImpactStyle.Heavy;
        
        await Haptics.impact({ style: impactStyle });
        return;
      } catch (error) {
        console.error('Haptics not available:', error);
      }
    }

    // Web fallback
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 50,
      };
      
      navigator.vibrate(patterns[type]);
    }
  }

  // Check if native features are available
  isNativeFeatureAvailable(feature: 'camera' | 'geolocation' | 'notifications'): boolean {
    if (!this.isCapacitorAvailable) {
      switch (feature) {
        case 'camera':
          return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
        case 'geolocation':
          return 'geolocation' in navigator;
        case 'notifications':
          return 'Notification' in window;
        default:
          return false;
      }
    }

    return true; // Assume all features are available in native context
  }

  // Share functionality
  async share(options: { title: string; text: string; url?: string }): Promise<void> {
    if (this.isCapacitorAvailable) {
      try {
        // Dynamic import for Capacitor Share
        const { Share } = await import('@capacitor/share');
        await Share.share(options);
        return;
      } catch (error) {
        console.error('Native share not available:', error);
      }
    }

    // Web fallback
    if ('share' in navigator) {
      try {
        await (navigator as any).share(options);
      } catch (error) {
        console.error('Web share failed:', error);
        // Final fallback - copy to clipboard
        if ('clipboard' in navigator) {
          const shareText = `${options.title}\n${options.text}${options.url ? `\n${options.url}` : ''}`;
          await navigator.clipboard.writeText(shareText);
        }
      }
    } else {
      // Final fallback - copy to clipboard
      if ('clipboard' in navigator) {
        const shareText = `${options.title}\n${options.text}${options.url ? `\n${options.url}` : ''}`;
        await navigator.clipboard.writeText(shareText);
      }
    }
  }

  // Device info
  async getDeviceInfo(): Promise<any> {
    if (this.isCapacitorAvailable) {
      try {
        // Dynamic import for Capacitor Device
        const { Device } = await import('@capacitor/device');
        return await Device.getInfo();
      } catch (error) {
        console.error('Device info not available:', error);
      }
    }

    // Web fallback
    return {
      platform: 'web',
      model: 'Unknown',
      operatingSystem: navigator.platform,
      osVersion: 'Unknown',
      manufacturer: 'Unknown',
      isVirtual: false,
      webViewVersion: 'Unknown'
    };
  }
}

// Create singleton instance
export const nativeFeatures = new NativeFeatures();
export default nativeFeatures;