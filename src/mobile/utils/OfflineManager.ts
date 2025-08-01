interface OfflineData {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

interface SyncQueueItem {
  id: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

class OfflineManager {
  private dbName = 'pavemaster-offline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private syncQueue: SyncQueueItem[] = [];
  private isOnline = navigator.onLine;
  private syncInProgress = false;

  constructor() {
    this.initializeDB();
    this.setupOnlineListeners();
    this.loadSyncQueue();
  }

  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('offlineData')) {
          const dataStore = db.createObjectStore('offlineData', { keyPath: 'id' });
          dataStore.createIndex('type', 'type', { unique: false });
          dataStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('userSettings')) {
          db.createObjectStore('userSettings', { keyPath: 'key' });
        }
      };
    });
  }

  private setupOnlineListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Connection restored - syncing offline data');
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📴 Connection lost - switching to offline mode');
    });
  }

  // Store data for offline access
  async storeOfflineData(type: string, data: any, id?: string): Promise<string> {
    if (!this.db) await this.initializeDB();

    const offlineData: OfflineData = {
      id: id || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      synced: this.isOnline
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      const request = store.put(offlineData);
      request.onsuccess = () => resolve(offlineData.id);
      request.onerror = () => reject(request.error);
    });
  }

  // Retrieve offline data
  async getOfflineData(type?: string): Promise<OfflineData[]> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      
      let request: IDBRequest;
      
      if (type) {
        const index = store.index('type');
        request = index.getAll(type);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Add item to sync queue
  async addToSyncQueue(
    method: SyncQueueItem['method'],
    url: string,
    data?: any,
    maxRetries = 3
  ): Promise<void> {
    const queueItem: SyncQueueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      method,
      url,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries
    };

    this.syncQueue.push(queueItem);
    await this.saveSyncQueue();

    // If online, try to sync immediately
    if (this.isOnline) {
      this.syncOfflineData();
    }
  }

  private async saveSyncQueue(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      
      // Clear existing queue and save new one
      store.clear().onsuccess = () => {
        let completed = 0;
        const total = this.syncQueue.length;
        
        if (total === 0) {
          resolve();
          return;
        }

        this.syncQueue.forEach(item => {
          const request = store.add(item);
          request.onsuccess = () => {
            completed++;
            if (completed === total) resolve();
          };
          request.onerror = () => reject(request.error);
        });
      };
    });
  }

  private async loadSyncQueue(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      
      const request = store.getAll();
      request.onsuccess = () => {
        this.syncQueue = request.result;
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Sync offline data when online
  async syncOfflineData(): Promise<void> {
    if (!this.isOnline || this.syncInProgress || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    console.log(`🔄 Syncing ${this.syncQueue.length} offline items...`);

    const itemsToRemove: string[] = [];
    
    for (const item of this.syncQueue) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
            // Add authentication headers if needed
          },
          body: item.data ? JSON.stringify(item.data) : undefined
        });

        if (response.ok) {
          console.log(`✅ Synced: ${item.method} ${item.url}`);
          itemsToRemove.push(item.id);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`❌ Sync failed for ${item.id}:`, error);
        
        item.retryCount++;
        
        if (item.retryCount >= item.maxRetries) {
          console.error(`🚫 Max retries reached for ${item.id}, removing from queue`);
          itemsToRemove.push(item.id);
        }
      }
    }

    // Remove successfully synced and failed items
    this.syncQueue = this.syncQueue.filter(item => !itemsToRemove.includes(item.id));
    await this.saveSyncQueue();

    this.syncInProgress = false;
    
    if (this.syncQueue.length > 0) {
      console.log(`⏳ ${this.syncQueue.length} items remaining in sync queue`);
    } else {
      console.log('🎉 All offline data synced successfully!');
    }
  }

  // Get sync status
  getSyncStatus(): { 
    isOnline: boolean; 
    pendingSync: number; 
    syncInProgress: boolean 
  } {
    return {
      isOnline: this.isOnline,
      pendingSync: this.syncQueue.length,
      syncInProgress: this.syncInProgress
    };
  }

  // Clear all offline data
  async clearOfflineData(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData', 'syncQueue'], 'readwrite');
      
      transaction.objectStore('offlineData').clear();
      transaction.objectStore('syncQueue').clear();
      
      transaction.oncomplete = () => {
        this.syncQueue = [];
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Store user settings
  async storeSettings(key: string, value: any): Promise<void> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userSettings'], 'readwrite');
      const store = transaction.objectStore('userSettings');
      
      const request = store.put({ key, value, timestamp: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get user settings
  async getSettings(key: string): Promise<any> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userSettings'], 'readonly');
      const store = transaction.objectStore('userSettings');
      
      const request = store.get(key);
      request.onsuccess = () => {
        resolve(request.result?.value || null);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Create singleton instance
export const offlineManager = new OfflineManager();
export default offlineManager;