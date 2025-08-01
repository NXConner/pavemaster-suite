/**
 * Enhanced PWA Service
 * Advanced caching strategies, offline synchronization, background sync, and push notifications
 */

export interface PWAConfig {
  enableOfflineMode: boolean;
  enableBackgroundSync: boolean;
  enablePushNotifications: boolean;
  cacheStrategy: 'network-first' | 'cache-first' | 'stale-while-revalidate';
  offlinePages: string[];
  syncStrategies: SyncStrategy[];
  pushNotificationConfig: PushNotificationConfig;
}

export interface SyncStrategy {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  retryAttempts: number;
  retryDelay: number;
  priority: 'high' | 'medium' | 'low';
}

export interface PushNotificationConfig {
  vapidPublicKey: string;
  showBadge: boolean;
  requestPermissionOnLoad: boolean;
  notificationActions: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface OfflineData {
  id: string;
  data: any;
  action: string;
  timestamp: number;
  retries: number;
  priority: 'high' | 'medium' | 'low';
}

export interface CacheMetrics {
  totalCacheSize: number;
  cacheHitRate: number;
  offlineRequestCount: number;
  syncQueueSize: number;
  lastSyncTime: number;
}

export class EnhancedPWAService {
  private config: PWAConfig;
  private serviceWorker: ServiceWorker | null = null;
  private offlineQueue: OfflineData[] = [];
  private syncInProgress = false;
  private cacheMetrics: CacheMetrics = {
    totalCacheSize: 0,
    cacheHitRate: 0,
    offlineRequestCount: 0,
    syncQueueSize: 0,
    lastSyncTime: 0
  };

  constructor(config?: Partial<PWAConfig>) {
    this.config = {
      enableOfflineMode: true,
      enableBackgroundSync: true,
      enablePushNotifications: true,
      cacheStrategy: 'stale-while-revalidate',
      offlinePages: ['/', '/projects', '/settings'],
      syncStrategies: [],
      pushNotificationConfig: {
        vapidPublicKey: '',
        showBadge: true,
        requestPermissionOnLoad: false,
        notificationActions: [
          { action: 'view', title: 'View' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      },
      ...config
    };

    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  /**
   * Initialize PWA service
   */
  private async initialize(): Promise<void> {
    if ('serviceWorker' in navigator) {
      await this.registerServiceWorker();
      this.setupOfflineHandling();
      
      if (this.config.enablePushNotifications) {
        await this.setupPushNotifications();
      }
      
      this.loadOfflineQueue();
      this.startPeriodicSync();
      this.setupCacheMetrics();
      
      console.log('📱 Enhanced PWA service initialized');
    }
  }

  /**
   * Register service worker
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      this.serviceWorker = registration.active;

      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification();
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));

      console.log('✅ Service worker registered successfully');
    } catch (error) {
      console.error('❌ Service worker registration failed:', error);
    }
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, payload } = event.data;

    switch (type) {
      case 'CACHE_UPDATED':
        this.updateCacheMetrics(payload);
        break;
      case 'OFFLINE_REQUEST':
        this.handleOfflineRequest(payload);
        break;
      case 'SYNC_COMPLETE':
        this.handleSyncComplete(payload);
        break;
      case 'PUSH_RECEIVED':
        this.handlePushNotification(payload);
        break;
    }
  }

  /**
   * Setup offline handling
   */
  private setupOfflineHandling(): void {
    if (!this.config.enableOfflineMode) return;

    // Listen for online/offline events
    window.addEventListener('online', this.handleOnlineEvent.bind(this));
    window.addEventListener('offline', this.handleOfflineEvent.bind(this));

    // Intercept fetch requests for offline handling
    this.setupOfflineFetchInterception();
  }

  /**
   * Setup offline fetch interception
   */
  private setupOfflineFetchInterception(): void {
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
      try {
        const response = await originalFetch(input, init);
        
        // Update cache metrics
        this.cacheMetrics.cacheHitRate = this.calculateCacheHitRate(true);
        
        return response;
      } catch (error) {
        if (!navigator.onLine) {
          // Handle offline request
          const offlineResponse = await this.handleOfflineRequest({
            url: typeof input === 'string' ? input : input.url,
            method: init?.method || 'GET',
            body: init?.body,
            headers: init?.headers
          });
          
          if (offlineResponse) {
            return offlineResponse;
          }
        }
        
        this.cacheMetrics.cacheHitRate = this.calculateCacheHitRate(false);
        throw error;
      }
    };
  }

  /**
   * Handle offline requests
   */
  private async handleOfflineRequest(request: any): Promise<Response | null> {
    this.cacheMetrics.offlineRequestCount++;

    // Try to get from cache first
    const cachedResponse = await this.getCachedResponse(request.url);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If it's a mutating request, queue it for later sync
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      this.queueOfflineRequest(request);
      
      // Return a synthetic response for optimistic UI updates
      return new Response(
        JSON.stringify({ success: true, queued: true }),
        {
          status: 202,
          statusText: 'Accepted (Queued for sync)',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // For GET requests, return offline page or cached fallback
    return this.getOfflineFallback(request.url);
  }

  /**
   * Get cached response
   */
  private async getCachedResponse(url: string): Promise<Response | null> {
    try {
      const cache = await caches.open('pwa-cache-v1');
      const response = await cache.match(url);
      return response || null;
    } catch (error) {
      console.error('Cache retrieval failed:', error);
      return null;
    }
  }

  /**
   * Queue offline request for later sync
   */
  private queueOfflineRequest(request: any): void {
    const offlineData: OfflineData = {
      id: this.generateId(),
      data: {
        url: request.url,
        method: request.method,
        body: request.body,
        headers: request.headers
      },
      action: 'http-request',
      timestamp: Date.now(),
      retries: 0,
      priority: 'medium'
    };

    this.offlineQueue.push(offlineData);
    this.saveOfflineQueue();
    this.cacheMetrics.syncQueueSize = this.offlineQueue.length;

    console.log('📦 Queued offline request:', request.url);
  }

  /**
   * Get offline fallback response
   */
  private async getOfflineFallback(url: string): Promise<Response> {
    // Check if there's a specific offline page for this route
    const offlinePage = this.config.offlinePages.find(page => url.includes(page));
    
    if (offlinePage) {
      const cachedPage = await this.getCachedResponse(offlinePage);
      if (cachedPage) {
        return cachedPage;
      }
    }

    // Return generic offline page
    return new Response(
      this.generateOfflineHTML(url),
      {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }

  /**
   * Generate offline HTML page
   */
  private generateOfflineHTML(url: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - PaveMaster Suite</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-align: center;
            }
            .offline-container {
              max-width: 400px;
              padding: 2rem;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 10px;
              backdrop-filter: blur(10px);
            }
            .offline-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            h1 { margin: 0 0 1rem 0; }
            p { margin: 0 0 1.5rem 0; opacity: 0.9; }
            .retry-btn {
              background: #ffffff;
              color: #667eea;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 5px;
              font-weight: 600;
              cursor: pointer;
              transition: transform 0.2s;
            }
            .retry-btn:hover {
              transform: translateY(-2px);
            }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="offline-icon">📶</div>
            <h1>You're Offline</h1>
            <p>It looks like you've lost your internet connection. Don't worry, you can still browse cached content!</p>
            <button class="retry-btn" onclick="window.location.reload()">
              Try Again
            </button>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Handle online event
   */
  private async handleOnlineEvent(): void {
    console.log('🌐 Back online - starting sync...');
    
    this.showConnectionStatus('online');
    await this.syncOfflineData();
  }

  /**
   * Handle offline event
   */
  private handleOfflineEvent(): void {
    console.log('📴 Gone offline - enabling offline mode...');
    this.showConnectionStatus('offline');
  }

  /**
   * Show connection status notification
   */
  private showConnectionStatus(status: 'online' | 'offline'): void {
    const notification = document.createElement('div');
    notification.className = `connection-status ${status}`;
    notification.textContent = status === 'online' ? 
      '🌐 Back online!' : 
      '📴 You\'re offline';
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${status === 'online' ? '#10b981' : '#f59e0b'};
      color: white;
      border-radius: 8px;
      font-weight: 500;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * Sync offline data
   */
  private async syncOfflineData(): Promise<void> {
    if (this.syncInProgress || this.offlineQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    console.log(`🔄 Syncing ${this.offlineQueue.length} offline requests...`);

    const successfulSyncs: string[] = [];
    const failedSyncs: OfflineData[] = [];

    for (const item of this.offlineQueue) {
      try {
        await this.syncSingleItem(item);
        successfulSyncs.push(item.id);
      } catch (error) {
        item.retries++;
        if (item.retries < 3) {
          failedSyncs.push(item);
        }
        console.error(`Sync failed for ${item.id}:`, error);
      }
    }

    // Remove successful syncs from queue
    this.offlineQueue = this.offlineQueue.filter(item => 
      !successfulSyncs.includes(item.id)
    );

    // Re-add failed syncs for retry
    this.offlineQueue.push(...failedSyncs);
    
    this.saveOfflineQueue();
    this.cacheMetrics.syncQueueSize = this.offlineQueue.length;
    this.cacheMetrics.lastSyncTime = Date.now();
    this.syncInProgress = false;

    console.log(`✅ Sync complete: ${successfulSyncs.length} successful, ${failedSyncs.length} failed`);
  }

  /**
   * Sync single offline item
   */
  private async syncSingleItem(item: OfflineData): Promise<void> {
    const { url, method, body, headers } = item.data;
    
    const response = await fetch(url, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Setup push notifications
   */
  private async setupPushNotifications(): Promise<void> {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn('Push notifications not supported');
      return;
    }

    // Request permission if configured
    if (this.config.pushNotificationConfig.requestPermissionOnLoad) {
      await this.requestNotificationPermission();
    }

    // Subscribe to push notifications if permission granted
    if (Notification.permission === 'granted') {
      await this.subscribeToPushNotifications();
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<boolean> {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      return true;
    } else {
      console.log('❌ Notification permission denied');
      return false;
    }
  }

  /**
   * Subscribe to push notifications
   */
  private async subscribeToPushNotifications(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          this.config.pushNotificationConfig.vapidPublicKey
        )
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      console.log('✅ Push notification subscription successful');
    } catch (error) {
      console.error('❌ Push notification subscription failed:', error);
    }
  }

  /**
   * Send subscription to server
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    // This would send the subscription to your backend
    console.log('Subscription object:', subscription);
    
    // Example implementation:
    // await fetch('/api/push/subscribe', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(subscription)
    // });
  }

  /**
   * Handle push notification
   */
  private handlePushNotification(payload: any): void {
    const { title, body, icon, badge, actions, data } = payload;
    
    const notificationOptions: NotificationOptions = {
      body,
      icon: icon || '/icons/icon-192x192.png',
      badge: badge || '/icons/badge-72x72.png',
      actions: actions || this.config.pushNotificationConfig.notificationActions,
      data,
      requireInteraction: true,
      vibrate: [200, 100, 200]
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, notificationOptions);
      });
    }
  }

  /**
   * Show update notification
   */
  private showUpdateNotification(): void {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #1f2937;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 400px;
      ">
        <div>🚀</div>
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">Update Available</div>
          <div style="font-size: 14px; opacity: 0.8;">A new version of the app is ready!</div>
        </div>
        <button onclick="this.closest('.update-notification').remove(); window.location.reload();" style="
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
        ">Update</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      notification.remove();
    }, 10000);
  }

  /**
   * Setup cache metrics monitoring
   */
  private setupCacheMetrics(): void {
    setInterval(async () => {
      await this.updateCacheSize();
    }, 30000); // Update every 30 seconds
  }

  /**
   * Update cache size metrics
   */
  private async updateCacheSize(): Promise<void> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        this.cacheMetrics.totalCacheSize = estimate.usage || 0;
      }
    } catch (error) {
      console.error('Failed to get cache size:', error);
    }
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(isHit: boolean): number {
    // Simple implementation - in production, use more sophisticated tracking
    const currentRate = this.cacheMetrics.cacheHitRate;
    return isHit ? Math.min(100, currentRate + 1) : Math.max(0, currentRate - 1);
  }

  /**
   * Start periodic sync
   */
  private startPeriodicSync(): void {
    if (!this.config.enableBackgroundSync) return;

    // Sync every 5 minutes when online
    setInterval(() => {
      if (navigator.onLine && this.offlineQueue.length > 0) {
        this.syncOfflineData();
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Load offline queue from storage
   */
  private loadOfflineQueue(): void {
    try {
      const stored = localStorage.getItem('pwa-offline-queue');
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
        this.cacheMetrics.syncQueueSize = this.offlineQueue.length;
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  /**
   * Save offline queue to storage
   */
  private saveOfflineQueue(): void {
    try {
      localStorage.setItem('pwa-offline-queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Utility functions
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Public API methods
   */
  
  /**
   * Get current cache metrics
   */
  getCacheMetrics(): CacheMetrics {
    return { ...this.cacheMetrics };
  }

  /**
   * Force sync offline data
   */
  async forceSyncOfflineData(): Promise<void> {
    await this.syncOfflineData();
  }

  /**
   * Clear all caches
   */
  async clearAllCaches(): Promise<void> {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('🗑️ All caches cleared');
  }

  /**
   * Get offline queue status
   */
  getOfflineQueueStatus(): { count: number; items: OfflineData[] } {
    return {
      count: this.offlineQueue.length,
      items: [...this.offlineQueue]
    };
  }

  /**
   * Subscribe to push notifications manually
   */
  async enablePushNotifications(): Promise<boolean> {
    const permission = await this.requestNotificationPermission();
    if (permission) {
      await this.subscribeToPushNotifications();
    }
    return permission;
  }

  /**
   * Update cache strategy
   */
  updateCacheStrategy(strategy: 'network-first' | 'cache-first' | 'stale-while-revalidate'): void {
    this.config.cacheStrategy = strategy;
    
    // Notify service worker of strategy change
    if (this.serviceWorker) {
      this.serviceWorker.postMessage({
        type: 'UPDATE_CACHE_STRATEGY',
        strategy
      });
    }
  }
}

// Export singleton instance
export const enhancedPWAService = new EnhancedPWAService();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  enhancedPWAService.initialize();
}

// Export utilities
export const getCacheMetrics = () => enhancedPWAService.getCacheMetrics();
export const forceSyncOfflineData = () => enhancedPWAService.forceSyncOfflineData();
export const enablePushNotifications = () => enhancedPWAService.enablePushNotifications();