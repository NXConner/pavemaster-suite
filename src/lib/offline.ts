/**
 * Comprehensive offline support and data synchronization
 */

import { useEffect, useState, useCallback } from 'react';
import { useAppActions } from '@/stores/appStore';
import { persistenceUtils } from '@/lib/queryClient';

// Types for offline support
export interface OfflineOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

export interface OfflineState {
  isOnline: boolean;
  isBackgroundSync: boolean;
  pendingOperations: OfflineOperation[];
  lastSyncTime: number;
}

// IndexedDB utilities for offline storage
class OfflineStorage {
  private dbName = 'pavemaster-offline';
  private version = 1;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('operations')) {
          const operationsStore = db.createObjectStore('operations', { keyPath: 'id' });
          operationsStore.createIndex('timestamp', 'timestamp');
          operationsStore.createIndex('type', 'type');
        }

        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp');
        }

        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });
  }

  async addOperation(operation: OfflineOperation): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['operations'], 'readwrite');
      const store = transaction.objectStore('operations');
      const request = store.add(operation);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getOperations(): Promise<OfflineOperation[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['operations'], 'readonly');
      const store = transaction.objectStore('operations');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async removeOperation(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['operations'], 'readwrite');
      const store = transaction.objectStore('operations');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async cacheData(key: string, data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const cacheEntry = {
      key,
      data,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put(cacheEntry);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
    });
  }

  async setMetadata(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      const request = store.put({ key, value });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getMetadata(key: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
    });
  }
}

// Global offline storage instance
export const offlineStorage = new OfflineStorage();

// Offline manager class
class OfflineManager {
  private syncInProgress = false;
  private maxRetries = 3;
  private retryDelays = [1000, 5000, 15000]; // 1s, 5s, 15s

  async initialize(): Promise<void> {
    await offlineStorage.initialize();
    
    // Set up background sync registration
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('background-sync');
      } catch (error) {
        console.warn('Background sync registration failed:', error);
      }
    }
  }

  async queueOperation(operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const fullOperation: OfflineOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    await offlineStorage.addOperation(fullOperation);
    
    // Try to sync immediately if online
    if (navigator.onLine) {
      this.sync();
    }
  }

  async sync(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) {
      return;
    }

    this.syncInProgress = true;

    try {
      const operations = await offlineStorage.getOperations();
      const sortedOperations = operations.sort((a, b) => a.timestamp - b.timestamp);

      for (const operation of sortedOperations) {
        try {
          await this.executeOperation(operation);
          await offlineStorage.removeOperation(operation.id);
        } catch (error) {
          console.error('Failed to sync operation:', operation, error);
          
          // Increment retry count
          operation.retryCount++;
          operation.lastError = error instanceof Error ? error.message : 'Unknown error';

          if (operation.retryCount >= this.maxRetries) {
            // Move to failed operations or remove
            await offlineStorage.removeOperation(operation.id);
            console.error('Operation exceeded max retries:', operation);
          } else {
            // Schedule retry
            const delay = this.retryDelays[operation.retryCount - 1] || 15000;
            setTimeout(() => this.sync(), delay);
          }
        }
      }

      // Update last sync time
      await offlineStorage.setMetadata('lastSyncTime', Date.now());
    } finally {
      this.syncInProgress = false;
    }
  }

  private async executeOperation(operation: OfflineOperation): Promise<void> {
    // This would be implemented based on your API structure
    const { type, entity, data } = operation;
    
    const apiUrl = `/api/${entity}`;
    let response: Response;

    switch (type) {
      case 'create':
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        break;
      
      case 'update':
        response = await fetch(`${apiUrl}/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        break;
      
      case 'delete':
        response = await fetch(`${apiUrl}/${data.id}`, {
          method: 'DELETE',
        });
        break;
      
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  async getPendingOperationsCount(): Promise<number> {
    const operations = await offlineStorage.getOperations();
    return operations.length;
  }

  async clearPendingOperations(): Promise<void> {
    const operations = await offlineStorage.getOperations();
    for (const operation of operations) {
      await offlineStorage.removeOperation(operation.id);
    }
  }
}

// Global offline manager instance
export const offlineManager = new OfflineManager();

// React hooks for offline functionality
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      offlineManager.sync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      persistenceUtils.persistCriticalData();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export function useOfflineOperations() {
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  const updatePendingCount = useCallback(async () => {
    try {
      const count = await offlineManager.getPendingOperationsCount();
      setPendingCount(count);
    } catch (error) {
      console.error('Failed to get pending operations count:', error);
    }
  }, []);

  const updateLastSyncTime = useCallback(async () => {
    try {
      const time = await offlineStorage.getMetadata('lastSyncTime');
      setLastSyncTime(time);
    } catch (error) {
      console.error('Failed to get last sync time:', error);
    }
  }, []);

  useEffect(() => {
    updatePendingCount();
    updateLastSyncTime();

    // Update every 5 seconds
    const interval = setInterval(() => {
      updatePendingCount();
      updateLastSyncTime();
    }, 5000);

    return () => clearInterval(interval);
  }, [updatePendingCount, updateLastSyncTime]);

  const queueOperation = useCallback(async (
    type: 'create' | 'update' | 'delete',
    entity: string,
    data: any
  ) => {
    await offlineManager.queueOperation({ type, entity, data });
    updatePendingCount();
  }, [updatePendingCount]);

  const sync = useCallback(async () => {
    await offlineManager.sync();
    updatePendingCount();
    updateLastSyncTime();
  }, [updatePendingCount, updateLastSyncTime]);

  const clearOperations = useCallback(async () => {
    await offlineManager.clearPendingOperations();
    updatePendingCount();
  }, [updatePendingCount]);

  return {
    pendingCount,
    lastSyncTime,
    queueOperation,
    sync,
    clearOperations,
  };
}

// Service worker message handling
export function setupServiceWorkerMessaging() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, payload } = event.data;

      switch (type) {
        case 'BACKGROUND_SYNC':
          offlineManager.sync();
          break;
        
        case 'CACHE_UPDATED':
          // Handle cache updates
          console.log('Cache updated:', payload);
          break;
        
        case 'OFFLINE_FALLBACK':
          // Handle offline fallback
          console.log('Offline fallback triggered:', payload);
          break;
      }
    });
  }
}

// Offline status component helper
export function useOfflineNotification() {
  const isOnline = useOnlineStatus();
  const { pendingCount } = useOfflineOperations();
  const { addNotification, removeNotification } = useAppActions();

  useEffect(() => {
    let notificationId: string | null = null;

    if (!isOnline) {
      addNotification({
        type: 'warning',
        title: 'You are offline',
        message: 'Changes will be saved and synced when connection is restored.',
        dismissible: false,
      });
    } else if (pendingCount > 0) {
      addNotification({
        type: 'info',
        title: 'Syncing data',
        message: `${pendingCount} changes are being synced.`,
        dismissible: true,
        duration: 3000,
      });
    }

    return () => {
      if (notificationId) {
        removeNotification(notificationId);
      }
    };
  }, [isOnline, pendingCount, addNotification, removeNotification]);
}

// Initialize offline support
export async function initializeOfflineSupport() {
  try {
    await offlineManager.initialize();
    setupServiceWorkerMessaging();
    
    // Set up periodic sync
    setInterval(() => {
      if (navigator.onLine) {
        offlineManager.sync();
      }
    }, 30000); // Every 30 seconds

    console.log('✅ Offline support initialized');
  } catch (error) {
    console.error('❌ Failed to initialize offline support:', error);
  }
}