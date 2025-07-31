/**
 * Advanced Mobile Service - Native Device Integration & PWA Optimization
 * Implements camera ML processing, advanced sensors, background tasks, and offline-first architecture
 */

import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Device, DeviceInfo } from '@capacitor/device';
import { Network, NetworkStatus } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';
import { Motion } from '@capacitor/motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { performanceMonitor } from '@/lib/performance';
import { computerVisionService } from '../ai/ComputerVisionService';

interface MobileConfig {
  enableBackgroundTasks: boolean;
  enableAdvancedSensors: boolean;
  enableMLProcessing: boolean;
  offlineFirst: boolean;
  syncInterval: number;
  cacheSize: number;
  enableHaptics: boolean;
  enablePushNotifications: boolean;
}

interface LocationTrackingConfig {
  accuracy: 'low' | 'medium' | 'high' | 'highest';
  enableBackgroundTracking: boolean;
  updateInterval: number;
  distanceFilter: number;
  enableGeofencing: boolean;
}

interface CameraMLConfig {
  enableRealTimeAnalysis: boolean;
  analysisTypes: ('quality_control' | 'defect_detection' | 'equipment_assessment' | 'safety_compliance')[];
  autoUpload: boolean;
  compressionQuality: number;
  maxFileSize: number;
}

interface OfflineData {
  id: string;
  type: 'photo' | 'location' | 'form_data' | 'sensor_data';
  data: any;
  timestamp: number;
  synced: boolean;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

interface SensorData {
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  magnetometer: { x: number; y: number; z: number };
  timestamp: number;
  accuracy: number;
}

export class AdvancedMobileService {
  private static instance: AdvancedMobileService;
  private config: MobileConfig;
  private isInitialized: boolean = false;
  private deviceInfo: DeviceInfo | null = null;
  private networkStatus: NetworkStatus | null = null;
  private offlineQueue: OfflineData[] = [];
  private locationWatchId: string | null = null;
  private sensorWatchId: string | null = null;
  private syncTimer: NodeJS.Timeout | null = null;
  private backgroundTaskId: number | null = null;

  private constructor() {
    this.config = {
      enableBackgroundTasks: true,
      enableAdvancedSensors: true,
      enableMLProcessing: true,
      offlineFirst: true,
      syncInterval: 30000, // 30 seconds
      cacheSize: 100, // MB
      enableHaptics: true,
      enablePushNotifications: true
    };
  }

  public static getInstance(): AdvancedMobileService {
    if (!AdvancedMobileService.instance) {
      AdvancedMobileService.instance = new AdvancedMobileService();
    }
    return AdvancedMobileService.instance;
  }

  /**
   * Initialize the mobile service with all native capabilities
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const startTime = performance.now();

    try {
      console.log('📱 Initializing Advanced Mobile Service...');

      // Initialize device info
      this.deviceInfo = await Device.getInfo();
      console.log('📱 Device Info:', this.deviceInfo);

      // Initialize network status monitoring
      await this.initializeNetworkMonitoring();

      // Initialize native components
      await Promise.all([
        this.initializeStatusBar(),
        this.initializeSplashScreen(),
        this.initializePushNotifications(),
        this.initializeLocationTracking(),
        this.initializeSensorMonitoring(),
        this.initializeOfflineSupport()
      ]);

      this.isInitialized = true;

      performanceMonitor.recordMetric('mobile_service_init', performance.now() - startTime, 'ms', {
        devicePlatform: this.deviceInfo.platform,
        deviceModel: this.deviceInfo.model
      });

      console.log('📱 Advanced Mobile Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Mobile Service:', error);
      throw error;
    }
  }

  /**
   * Initialize network status monitoring
   */
  private async initializeNetworkMonitoring(): Promise<void> {
    try {
      this.networkStatus = await Network.getStatus();
      
      Network.addListener('networkStatusChange', (status) => {
        console.log('📶 Network status changed:', status);
        this.networkStatus = status;
        
        if (status.connected && this.offlineQueue.length > 0) {
          this.syncOfflineData();
        }
      });
    } catch (error) {
      console.error('Network monitoring initialization failed:', error);
    }
  }

  /**
   * Initialize status bar styling
   */
  private async initializeStatusBar(): Promise<void> {
    try {
      if (this.deviceInfo?.platform === 'ios' || this.deviceInfo?.platform === 'android') {
        await StatusBar.setStyle({ style: Style.Default });
        await StatusBar.setBackgroundColor({ color: '#ffffff' });
      }
    } catch (error) {
      console.error('Status bar initialization failed:', error);
    }
  }

  /**
   * Initialize splash screen
   */
  private async initializeSplashScreen(): Promise<void> {
    try {
      await SplashScreen.hide();
    } catch (error) {
      console.error('Splash screen initialization failed:', error);
    }
  }

  /**
   * Initialize push notifications
   */
  private async initializePushNotifications(): Promise<void> {
    if (!this.config.enablePushNotifications) return;

    try {
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        await PushNotifications.register();

        PushNotifications.addListener('registration', (token: Token) => {
          console.log('📳 Push registration token:', token.value);
          this.storePushToken(token.value);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          console.log('📳 Push notification received:', notification);
          this.handlePushNotification(notification);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('📳 Push notification action performed:', notification);
        });
      }
    } catch (error) {
      console.error('Push notifications initialization failed:', error);
    }
  }

  /**
   * Enhanced camera with ML processing
   */
  public async capturePhotoWithAnalysis(config: CameraMLConfig): Promise<{
    photo: Photo;
    analysis?: any;
  }> {
    const startTime = performance.now();

    try {
      // Capture photo with optimal settings
      const photo = await Camera.getPhoto({
        quality: config.compressionQuality || 80,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        correctOrientation: true,
        width: 1920,
        height: 1080
      });

      let analysis;

      // Perform ML analysis if enabled
      if (config.enableRealTimeAnalysis && photo.webPath) {
        try {
          // Convert photo to File for analysis
          const response = await fetch(photo.webPath);
          const blob = await response.blob();
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });

          // Run analysis for each specified type
          const analysisPromises = config.analysisTypes.map(analysisType =>
            computerVisionService.analyzeImage(file, {
              analysisType,
              enhanceImage: true,
              realTimeProcessing: true
            })
          );

          analysis = await Promise.all(analysisPromises);

          // Provide haptic feedback based on findings
          if (this.config.enableHaptics) {
            const hasCriticalFindings = analysis.some(result => 
              result.findings.some(finding => finding.severity === 'critical')
            );
            
            if (hasCriticalFindings) {
              await Haptics.impact({ style: ImpactStyle.Heavy });
            } else {
              await Haptics.impact({ style: ImpactStyle.Light });
            }
          }
        } catch (error) {
          console.error('Photo analysis failed:', error);
        }
      }

      // Store offline if needed
      if (this.config.offlineFirst) {
        await this.storeOfflineData({
          id: crypto.randomUUID(),
          type: 'photo',
          data: { photo, analysis },
          timestamp: Date.now(),
          synced: false,
          priority: analysis?.some((result: any) => 
            result.findings.some((finding: any) => finding.severity === 'critical')
          ) ? 'critical' : 'normal'
        });
      }

      performanceMonitor.recordMetric('camera_capture_with_ml', performance.now() - startTime, 'ms', {
        hasAnalysis: !!analysis,
        analysisTypes: config.analysisTypes.length
      });

      return { photo, analysis };
    } catch (error) {
      console.error('Camera capture failed:', error);
      throw error;
    }
  }

  /**
   * Initialize advanced location tracking
   */
  private async initializeLocationTracking(): Promise<void> {
    try {
      const permission = await Geolocation.requestPermissions();
      
      if (permission.location === 'granted') {
        console.log('📍 Location tracking initialized');
      }
    } catch (error) {
      console.error('Location tracking initialization failed:', error);
    }
  }

  /**
   * Start high-accuracy location tracking
   */
  public async startLocationTracking(config: LocationTrackingConfig): Promise<void> {
    try {
      if (this.locationWatchId) {
        await this.stopLocationTracking();
      }

      const watchOptions = {
        enableHighAccuracy: config.accuracy === 'highest',
        timeout: 10000,
        maximumAge: config.updateInterval
      };

      this.locationWatchId = await Geolocation.watchPosition(
        watchOptions,
        (position: Position | null, error?: any) => {
          if (error) {
            console.error('Location tracking error:', error);
            return;
          }

          if (position) {
            this.handleLocationUpdate(position, config);
          }
        }
      );

      console.log('📍 Location tracking started with config:', config);
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      throw error;
    }
  }

  /**
   * Handle location updates
   */
  private async handleLocationUpdate(position: Position, config: LocationTrackingConfig): Promise<void> {
    const locationData = {
      id: crypto.randomUUID(),
      type: 'location' as const,
      data: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        speed: position.coords.speed,
        heading: position.coords.heading,
        timestamp: position.timestamp
      },
      timestamp: Date.now(),
      synced: false,
      priority: 'normal' as const
    };

    // Store location data
    await this.storeOfflineData(locationData);

    // Sync if online and high priority
    if (this.networkStatus?.connected) {
      await this.syncOfflineData();
    }
  }

  /**
   * Initialize advanced sensor monitoring
   */
  private async initializeSensorMonitoring(): Promise<void> {
    if (!this.config.enableAdvancedSensors) return;

    try {
      // Start motion sensor monitoring
      this.sensorWatchId = await Motion.addListener('accel', (event) => {
        this.handleSensorData({
          accelerometer: { x: event.acceleration.x, y: event.acceleration.y, z: event.acceleration.z },
          gyroscope: { x: event.rotationRate.alpha, y: event.rotationRate.beta, z: event.rotationRate.gamma },
          magnetometer: { x: 0, y: 0, z: 0 }, // Would need additional plugin
          timestamp: Date.now(),
          accuracy: 1.0
        });
      }) as string;

      console.log('📊 Advanced sensor monitoring initialized');
    } catch (error) {
      console.error('Sensor monitoring initialization failed:', error);
    }
  }

  /**
   * Handle sensor data collection
   */
  private async handleSensorData(sensorData: SensorData): Promise<void> {
    // Detect significant motion or events
    const totalAcceleration = Math.sqrt(
      sensorData.accelerometer.x ** 2 + 
      sensorData.accelerometer.y ** 2 + 
      sensorData.accelerometer.z ** 2
    );

    // Store sensor data if significant motion detected
    if (totalAcceleration > 15) { // Threshold for significant motion
      await this.storeOfflineData({
        id: crypto.randomUUID(),
        type: 'sensor_data',
        data: sensorData,
        timestamp: Date.now(),
        synced: false,
        priority: totalAcceleration > 25 ? 'high' : 'normal'
      });

      // Haptic feedback for significant events
      if (this.config.enableHaptics && totalAcceleration > 20) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      }
    }
  }

  /**
   * Initialize offline support and sync
   */
  private async initializeOfflineSupport(): Promise<void> {
    try {
      // Load existing offline data
      const storedData = await Preferences.get({ key: 'offlineQueue' });
      if (storedData.value) {
        this.offlineQueue = JSON.parse(storedData.value);
        console.log('📦 Loaded', this.offlineQueue.length, 'offline items');
      }

      // Start sync timer
      if (this.config.offlineFirst) {
        this.syncTimer = setInterval(() => {
          if (this.networkStatus?.connected) {
            this.syncOfflineData();
          }
        }, this.config.syncInterval);
      }

      console.log('💾 Offline support initialized');
    } catch (error) {
      console.error('Offline support initialization failed:', error);
    }
  }

  /**
   * Store data for offline sync
   */
  private async storeOfflineData(data: OfflineData): Promise<void> {
    try {
      this.offlineQueue.push(data);

      // Maintain queue size
      if (this.offlineQueue.length > 1000) {
        this.offlineQueue = this.offlineQueue
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 1000);
      }

      // Persist to storage
      await Preferences.set({
        key: 'offlineQueue',
        value: JSON.stringify(this.offlineQueue)
      });

      performanceMonitor.recordMetric('offline_data_stored', performance.now(), 'ms', {
        dataType: data.type,
        priority: data.priority,
        queueSize: this.offlineQueue.length
      });
    } catch (error) {
      console.error('Failed to store offline data:', error);
    }
  }

  /**
   * Sync offline data when connection is available
   */
  private async syncOfflineData(): Promise<void> {
    if (!this.networkStatus?.connected || this.offlineQueue.length === 0) return;

    const startTime = performance.now();
    let syncedCount = 0;

    try {
      // Sort by priority and timestamp
      const prioritizedQueue = this.offlineQueue.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        return priorityDiff !== 0 ? priorityDiff : b.timestamp - a.timestamp;
      });

      // Sync in batches
      const batchSize = 10;
      for (let i = 0; i < prioritizedQueue.length; i += batchSize) {
        const batch = prioritizedQueue.slice(i, i + batchSize);
        
        try {
          // Simulate API sync (replace with actual implementation)
          await this.syncBatch(batch);
          
          // Mark as synced
          batch.forEach(item => {
            item.synced = true;
            syncedCount++;
          });
        } catch (error) {
          console.error('Batch sync failed:', error);
          break; // Stop syncing if batch fails
        }
      }

      // Remove synced items
      this.offlineQueue = this.offlineQueue.filter(item => !item.synced);

      // Update storage
      await Preferences.set({
        key: 'offlineQueue',
        value: JSON.stringify(this.offlineQueue)
      });

      performanceMonitor.recordMetric('offline_sync_complete', performance.now() - startTime, 'ms', {
        syncedCount,
        remainingCount: this.offlineQueue.length
      });

      console.log('📡 Synced', syncedCount, 'items, remaining:', this.offlineQueue.length);
    } catch (error) {
      console.error('Offline sync failed:', error);
    }
  }

  /**
   * Sync a batch of offline data
   */
  private async syncBatch(batch: OfflineData[]): Promise<void> {
    // Simulate API call - replace with actual implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('📤 Synced batch of', batch.length, 'items');
        resolve();
      }, 100);
    });
  }

  /**
   * Stop location tracking
   */
  public async stopLocationTracking(): Promise<void> {
    if (this.locationWatchId) {
      await Geolocation.clearWatch({ id: this.locationWatchId });
      this.locationWatchId = null;
      console.log('📍 Location tracking stopped');
    }
  }

  /**
   * Store push notification token
   */
  private async storePushToken(token: string): Promise<void> {
    try {
      await Preferences.set({ key: 'pushToken', value: token });
      
      // Send token to server for registration
      // This would be implemented with your backend API
      console.log('📳 Push token stored:', token);
    } catch (error) {
      console.error('Failed to store push token:', error);
    }
  }

  /**
   * Handle incoming push notification
   */
  private handlePushNotification(notification: PushNotificationSchema): void {
    // Handle different notification types
    if (notification.data?.type === 'urgent_job') {
      // High priority notification
      if (this.config.enableHaptics) {
        Haptics.impact({ style: ImpactStyle.Heavy });
      }
    }

    // Store notification for offline access
    this.storeOfflineData({
      id: crypto.randomUUID(),
      type: 'form_data',
      data: { type: 'notification', notification },
      timestamp: Date.now(),
      synced: false,
      priority: notification.data?.priority || 'normal'
    });
  }

  /**
   * Get mobile service status
   */
  public getStatus(): {
    isInitialized: boolean;
    deviceInfo: DeviceInfo | null;
    networkStatus: NetworkStatus | null;
    offlineQueueSize: number;
    locationTracking: boolean;
    sensorMonitoring: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      deviceInfo: this.deviceInfo,
      networkStatus: this.networkStatus,
      offlineQueueSize: this.offlineQueue.length,
      locationTracking: !!this.locationWatchId,
      sensorMonitoring: !!this.sensorWatchId
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<MobileConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Cleanup resources
   */
  public async destroy(): Promise<void> {
    if (this.locationWatchId) {
      await this.stopLocationTracking();
    }

    if (this.sensorWatchId) {
      await Motion.removeAllListeners();
    }

    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    Network.removeAllListeners();
    PushNotifications.removeAllListeners();

    console.log('📱 Advanced Mobile Service destroyed');
  }
}

// Export singleton instance
export const advancedMobileService = AdvancedMobileService.getInstance();