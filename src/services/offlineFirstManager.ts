// PHASE 10: Advanced Offline-First Manager
// IndexedDB-based offline storage with intelligent sync and conflict resolution

export interface OfflineEntity {
  id: string;
  type: 'project' | 'photo' | 'measurement' | 'report' | 'location' | 'task';
  data: any;
  localVersion: number;
  serverVersion?: number;
  lastModified: number;
  lastSynced?: number;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'conflict' | 'failed';
  conflicts?: ConflictData[];
  metadata: {
    userId: string;
    deviceId: string;
    offline: boolean;
    size: number;
    hash?: string;
  };
}

export interface SyncConflict {
  id: string;
  entityId: string;
  localData: any;
  serverData: any;
  conflictType: 'update' | 'delete' | 'concurrent';
  timestamp: number;
  resolution?: 'local' | 'server' | 'merge' | 'manual';
  resolvedData?: any;
}

export interface SyncStats {
  totalEntities: number;
  pendingSync: number;
  conflicts: number;
  lastSyncTime: number;
  syncInProgress: boolean;
  bytesProcessed: number;
  uploadSpeed: number;
  downloadSpeed: number;
}

export interface OfflineConfig {
  maxStorageSize: number; // in MB
  syncInterval: number; // in milliseconds
  maxRetries: number;
  compressionEnabled: boolean;
  conflictResolution: 'auto' | 'manual';
  batchSize: number;
  enableBackground: boolean;
}

interface ConflictData {
  type: 'field' | 'structure' | 'deletion';
  field?: string;
  localValue: any;
  serverValue: any;
  autoResolved?: boolean;
}

// PHASE 10: Database Schema
const DB_NAME = 'PaveMasterOfflineDB';
const DB_VERSION = 1;
const STORES = {
  ENTITIES: 'entities',
  CONFLICTS: 'conflicts',
  SYNC_LOG: 'syncLog',
  SETTINGS: 'settings',
  QUEUE: 'syncQueue'
};

export class OfflineFirstManager {
  private db: IDBDatabase | null = null;
  private config: OfflineConfig;
  private syncWorker: Worker | null = null;
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(config?: Partial<OfflineConfig>) {
    this.config = {
      maxStorageSize: 500, // 500MB
      syncInterval: 5 * 60 * 1000, // 5 minutes
      maxRetries: 3,
      compressionEnabled: true,
      conflictResolution: 'auto',
      batchSize: 50,
      enableBackground: true,
      ...config
    };

    this.initializeManager();
  }

  // PHASE 10: Initialization
  private async initializeManager(): Promise<void> {
    try {
      await this.initializeDatabase();
      this.setupNetworkListeners();
      this.setupPeriodicSync();
      
      if (this.config.enableBackground && 'serviceWorker' in navigator) {
        await this.initializeServiceWorker();
      }

      console.log('🗄️ Offline-First Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Offline Manager:', error);
      throw error;
    }
  }

  // PHASE 10: Database Management
  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Entities store
        if (!db.objectStoreNames.contains(STORES.ENTITIES)) {
          const entitiesStore = db.createObjectStore(STORES.ENTITIES, { keyPath: 'id' });
          entitiesStore.createIndex('type', 'type', { unique: false });
          entitiesStore.createIndex('syncStatus', 'syncStatus', { unique: false });
          entitiesStore.createIndex('lastModified', 'lastModified', { unique: false });
          entitiesStore.createIndex('userId', 'metadata.userId', { unique: false });
        }

        // Conflicts store
        if (!db.objectStoreNames.contains(STORES.CONFLICTS)) {
          const conflictsStore = db.createObjectStore(STORES.CONFLICTS, { keyPath: 'id' });
          conflictsStore.createIndex('entityId', 'entityId', { unique: false });
          conflictsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Sync log store
        if (!db.objectStoreNames.contains(STORES.SYNC_LOG)) {
          const syncLogStore = db.createObjectStore(STORES.SYNC_LOG, { keyPath: 'id', autoIncrement: true });
          syncLogStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncLogStore.createIndex('status', 'status', { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains(STORES.QUEUE)) {
          const queueStore = db.createObjectStore(STORES.QUEUE, { keyPath: 'id' });
          queueStore.createIndex('priority', 'priority', { unique: false });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // PHASE 10: Entity Management
  async saveEntity(entity: Omit<OfflineEntity, 'id' | 'localVersion' | 'lastModified' | 'syncStatus'>): Promise<string> {
    const id = entity.data.id || this.generateId();
    const timestamp = Date.now();

    const offlineEntity: OfflineEntity = {
      id,
      localVersion: await this.getNextVersion(id),
      lastModified: timestamp,
      syncStatus: this.isOnline ? 'pending' : 'pending',
      ...entity,
      data: { ...entity.data, id },
      metadata: {
        ...entity.metadata,
        offline: !this.isOnline,
        size: this.calculateSize(entity.data)
      }
    };

    await this.storeEntity(offlineEntity);
    
    // Trigger sync if online
    if (this.isOnline && !this.syncInProgress) {
      this.scheduleSyncEntity(id);
    }

    this.emit('entitySaved', { id, entity: offlineEntity });
    return id;
  }

  async getEntity(id: string): Promise<OfflineEntity | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.ENTITIES], 'readonly');
      const store = transaction.objectStore(STORES.ENTITIES);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getEntitiesByType(type: OfflineEntity['type'], filters?: any): Promise<OfflineEntity[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.ENTITIES], 'readonly');
      const store = transaction.objectStore(STORES.ENTITIES);
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => {
        let entities = request.result || [];
        
        // Apply filters if provided
        if (filters) {
          entities = entities.filter(entity => {
            return Object.keys(filters).every(key => {
              const entityValue = this.getNestedValue(entity, key);
              return entityValue === filters[key];
            });
          });
        }

        resolve(entities);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteEntity(id: string): Promise<void> {
    const entity = await this.getEntity(id);
    if (!entity) return;

    // Mark as deleted instead of removing
    const deletedEntity: OfflineEntity = {
      ...entity,
      data: { ...entity.data, _deleted: true },
      lastModified: Date.now(),
      localVersion: entity.localVersion + 1,
      syncStatus: 'pending',
      metadata: {
        ...entity.metadata,
        offline: !this.isOnline
      }
    };

    await this.storeEntity(deletedEntity);
    
    if (this.isOnline && !this.syncInProgress) {
      this.scheduleSyncEntity(id);
    }

    this.emit('entityDeleted', { id, entity: deletedEntity });
  }

  // PHASE 10: Sync Management
  async startSync(): Promise<SyncStats> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    this.syncInProgress = true;
    const startTime = Date.now();
    let stats: SyncStats = {
      totalEntities: 0,
      pendingSync: 0,
      conflicts: 0,
      lastSyncTime: startTime,
      syncInProgress: true,
      bytesProcessed: 0,
      uploadSpeed: 0,
      downloadSpeed: 0
    };

    try {
      this.emit('syncStarted', stats);

      // Get all pending entities
      const pendingEntities = await this.getPendingEntities();
      stats.totalEntities = pendingEntities.length;

      // Process in batches
      for (let i = 0; i < pendingEntities.length; i += this.config.batchSize) {
        const batch = pendingEntities.slice(i, i + this.config.batchSize);
        await this.syncBatch(batch, stats);
      }

      // Check for server updates
      await this.fetchServerUpdates(stats);

      // Resolve conflicts
      await this.resolveConflicts(stats);

      stats.lastSyncTime = Date.now();
      stats.syncInProgress = false;
      
      await this.logSyncResult(stats, 'success');
      this.emit('syncCompleted', stats);

      return stats;
    } catch (error) {
      stats.syncInProgress = false;
      await this.logSyncResult(stats, 'failed', error);
      this.emit('syncFailed', { stats, error });
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncBatch(entities: OfflineEntity[], stats: SyncStats): Promise<void> {
    for (const entity of entities) {
      try {
        entity.syncStatus = 'syncing';
        await this.storeEntity(entity);

        if (entity.data._deleted) {
          await this.syncDeletedEntity(entity, stats);
        } else {
          await this.syncRegularEntity(entity, stats);
        }

        entity.syncStatus = 'synced';
        entity.lastSynced = Date.now();
        await this.storeEntity(entity);

      } catch (error) {
        entity.syncStatus = 'failed';
        await this.storeEntity(entity);
        console.error(`Failed to sync entity ${entity.id}:`, error);
      }
    }
  }

  private async syncRegularEntity(entity: OfflineEntity, stats: SyncStats): Promise<void> {
    // Simulate API call - replace with actual API
    const response = await this.apiCall('POST', '/api/entities', {
      id: entity.id,
      type: entity.type,
      data: entity.data,
      version: entity.localVersion
    });

    stats.bytesProcessed += entity.metadata.size;
    
    if (response.conflict) {
      await this.handleSyncConflict(entity, response.serverData);
      stats.conflicts++;
    } else {
      entity.serverVersion = response.version;
    }
  }

  private async syncDeletedEntity(entity: OfflineEntity, stats: SyncStats): Promise<void> {
    // Simulate API call for deletion
    await this.apiCall('DELETE', `/api/entities/${entity.id}`, {
      version: entity.localVersion
    });

    // Remove from local storage after successful sync
    await this.removeEntity(entity.id);
    stats.bytesProcessed += entity.metadata.size;
  }

  // PHASE 10: Conflict Resolution
  private async handleSyncConflict(localEntity: OfflineEntity, serverData: any): Promise<void> {
    const conflict: SyncConflict = {
      id: this.generateId(),
      entityId: localEntity.id,
      localData: localEntity.data,
      serverData,
      conflictType: 'update',
      timestamp: Date.now()
    };

    if (this.config.conflictResolution === 'auto') {
      // Auto-resolve using last-write-wins or merge strategies
      conflict.resolution = await this.autoResolveConflict(conflict);
      conflict.resolvedData = this.mergeConflictData(conflict);
      
      if (conflict.resolvedData) {
        localEntity.data = conflict.resolvedData;
        localEntity.conflicts = []; // Clear previous conflicts
        await this.storeEntity(localEntity);
      }
    } else {
      // Store conflict for manual resolution
      await this.storeConflict(conflict);
      localEntity.syncStatus = 'conflict';
      localEntity.conflicts = localEntity.conflicts || [];
      localEntity.conflicts.push({
        type: 'structure',
        localValue: localEntity.data,
        serverValue: serverData,
        autoResolved: false
      });
    }
  }

  private async autoResolveConflict(conflict: SyncConflict): Promise<'local' | 'server' | 'merge'> {
    // Implement intelligent conflict resolution
    const localModified = conflict.localData.lastModified || 0;
    const serverModified = conflict.serverData.lastModified || 0;

    // If server is newer, prefer server
    if (serverModified > localModified) {
      return 'server';
    }

    // If local is newer, prefer local
    if (localModified > serverModified) {
      return 'local';
    }

    // If same timestamp, try to merge
    return 'merge';
  }

  private mergeConflictData(conflict: SyncConflict): any {
    if (conflict.resolution === 'local') {
      return conflict.localData;
    }
    
    if (conflict.resolution === 'server') {
      return conflict.serverData;
    }

    if (conflict.resolution === 'merge') {
      // Implement field-level merging
      return {
        ...conflict.serverData,
        ...conflict.localData,
        lastModified: Math.max(
          conflict.localData.lastModified || 0,
          conflict.serverData.lastModified || 0
        ),
        _mergedAt: Date.now()
      };
    }

    return null;
  }

  // PHASE 10: Background Processing
  private async initializeServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register('/sw-offline.js');
      
      // Set up message channel for communication
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_COMPLETE') {
          this.emit('backgroundSyncCompleted', event.data.stats);
        }
      });

      console.log('Service Worker registered for background sync');
    } catch (error) {
      console.warn('Service Worker registration failed:', error);
    }
  }

  private setupPeriodicSync(): void {
    setInterval(async () => {
      if (this.isOnline && !this.syncInProgress) {
        try {
          const pendingCount = await this.getPendingCount();
          if (pendingCount > 0) {
            await this.startSync();
          }
        } catch (error) {
          console.error('Periodic sync failed:', error);
        }
      }
    }, this.config.syncInterval);
  }

  // PHASE 10: Network Management
  private setupNetworkListeners(): void {
    window.addEventListener('online', async () => {
      this.isOnline = true;
      this.emit('networkStatusChanged', { online: true });
      
      // Start sync when coming back online
      if (!this.syncInProgress) {
        setTimeout(() => this.startSync(), 1000);
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('networkStatusChanged', { online: false });
    });
  }

  // PHASE 10: Storage Management
  async getStorageInfo(): Promise<{
    used: number;
    available: number;
    quota: number;
    percentage: number;
  }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const available = quota - used;
      const percentage = quota > 0 ? (used / quota) * 100 : 0;

      return {
        used: Math.round(used / (1024 * 1024)), // MB
        available: Math.round(available / (1024 * 1024)), // MB
        quota: Math.round(quota / (1024 * 1024)), // MB
        percentage: Math.round(percentage)
      };
    }

    return { used: 0, available: 0, quota: 0, percentage: 0 };
  }

  async cleanupOldData(daysOld: number = 30): Promise<number> {
    const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    const entities = await this.getEntitiesByType('project'); // Get all types
    
    let cleanedCount = 0;
    for (const entity of entities) {
      if (entity.lastModified < cutoffDate && entity.syncStatus === 'synced') {
        await this.removeEntity(entity.id);
        cleanedCount++;
      }
    }

    this.emit('dataCleanup', { cleanedCount, cutoffDate });
    return cleanedCount;
  }

  // PHASE 10: Utility Methods
  private async storeEntity(entity: OfflineEntity): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.ENTITIES], 'readwrite');
      const store = transaction.objectStore(STORES.ENTITIES);
      const request = store.put(entity);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async removeEntity(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.ENTITIES], 'readwrite');
      const store = transaction.objectStore(STORES.ENTITIES);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getPendingEntities(): Promise<OfflineEntity[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.ENTITIES], 'readonly');
      const store = transaction.objectStore(STORES.ENTITIES);
      const index = store.index('syncStatus');
      const request = index.getAll('pending');

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private async getPendingCount(): Promise<number> {
    const entities = await this.getPendingEntities();
    return entities.length;
  }

  private async getNextVersion(id: string): Promise<number> {
    const existing = await this.getEntity(id);
    return existing ? existing.localVersion + 1 : 1;
  }

  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private async apiCall(method: string, url: string, data?: any): Promise<any> {
    // Simulate API call - replace with actual implementation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      success: true,
      version: Date.now(),
      conflict: Math.random() < 0.1, // 10% chance of conflict
      serverData: data
    };
  }

  private async scheduleSyncEntity(id: string): Promise<void> {
    // Schedule individual entity sync
    setTimeout(async () => {
      try {
        const entity = await this.getEntity(id);
        if (entity && entity.syncStatus === 'pending') {
          await this.syncBatch([entity], {
            totalEntities: 1,
            pendingSync: 0,
            conflicts: 0,
            lastSyncTime: Date.now(),
            syncInProgress: false,
            bytesProcessed: 0,
            uploadSpeed: 0,
            downloadSpeed: 0
          });
        }
      } catch (error) {
        console.error('Individual sync failed:', error);
      }
    }, 1000);
  }

  private async fetchServerUpdates(stats: SyncStats): Promise<void> {
    // Fetch updates from server
    // Implementation would depend on your API
  }

  private async resolveConflicts(stats: SyncStats): Promise<void> {
    const conflicts = await this.getAllConflicts();
    stats.conflicts = conflicts.length;

    for (const conflict of conflicts) {
      if (this.config.conflictResolution === 'auto') {
        await this.autoResolveStoredConflict(conflict);
      }
    }
  }

  private async getAllConflicts(): Promise<SyncConflict[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.CONFLICTS], 'readonly');
      const store = transaction.objectStore(STORES.CONFLICTS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private async storeConflict(conflict: SyncConflict): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.CONFLICTS], 'readwrite');
      const store = transaction.objectStore(STORES.CONFLICTS);
      const request = store.put(conflict);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async autoResolveStoredConflict(conflict: SyncConflict): Promise<void> {
    // Auto-resolve stored conflicts
    const resolution = await this.autoResolveConflict(conflict);
    conflict.resolution = resolution;
    conflict.resolvedData = this.mergeConflictData(conflict);
    
    await this.storeConflict(conflict);
  }

  private async logSyncResult(stats: SyncStats, status: 'success' | 'failed', error?: any): Promise<void> {
    if (!this.db) return;

    const logEntry = {
      timestamp: Date.now(),
      status,
      stats,
      error: error?.message
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SYNC_LOG], 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_LOG);
      const request = store.add(logEntry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // PHASE 10: Event Management
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // PHASE 10: Public API
  async getSyncStats(): Promise<SyncStats> {
    const pendingCount = await this.getPendingCount();
    const conflicts = await this.getAllConflicts();
    
    return {
      totalEntities: 0, // Would be calculated
      pendingSync: pendingCount,
      conflicts: conflicts.length,
      lastSyncTime: 0, // Would be stored
      syncInProgress: this.syncInProgress,
      bytesProcessed: 0,
      uploadSpeed: 0,
      downloadSpeed: 0
    };
  }

  isInitialized(): boolean {
    return this.db !== null;
  }

  // PHASE 10: Cleanup
  async cleanup(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    
    this.eventListeners.clear();
  }
}

// PHASE 10: Export singleton instance
export const offlineFirstManager = new OfflineFirstManager();
export default offlineFirstManager;