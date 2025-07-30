import { openDB, type IDBPDatabase, type IDBPTransaction } from 'idb';
import mobileService from './mobileService';

// Types for offline data management
export interface OfflineEntity {
  id: string;
  type: 'task' | 'measurement' | 'photo' | 'location' | 'report' | 'inspection';
  data: any;
  timestamp: number;
  lastModified: number;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'conflict' | 'failed';
  retryCount: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deviceId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface SyncConflict {
  id: string;
  localData: any;
  remoteData: any;
  conflictType: 'version' | 'deletion' | 'concurrent_edit';
  timestamp: number;
  resolved: boolean;
}

export interface SyncStats {
  totalItems: number;
  pendingSync: number;
  syncedItems: number;
  failedItems: number;
  conflictItems: number;
  lastSyncTime: number;
  syncDuration: number;
  bandwidthUsed: number;
}

export interface OfflineConfig {
  maxRetries: number;
  retryDelay: number;
  syncInterval: number;
  maxOfflineItems: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  conflictResolutionStrategy: 'local' | 'remote' | 'merge' | 'manual';
  networkThreshold: 'any' | 'wifi' | 'good';
}

class AdvancedOfflineManager {
  private db: IDBPDatabase | null = null;
  private syncQueue: OfflineEntity[] = [];
  private conflicts: SyncConflict[] = [];
  private syncInProgress = false;
  private syncStats: SyncStats = {
    totalItems: 0,
    pendingSync: 0,
    syncedItems: 0,
    failedItems: 0,
    conflictItems: 0,
    lastSyncTime: 0,
    syncDuration: 0,
    bandwidthUsed: 0
  };
  
  private config: OfflineConfig = {
    maxRetries: 3,
    retryDelay: 5000,
    syncInterval: 30000,
    maxOfflineItems: 10000,
    compressionEnabled: true,
    encryptionEnabled: true,
    conflictResolutionStrategy: 'merge',
    networkThreshold: 'any'
  };

  private listeners: { [event: string]: Function[] } = {};
  private syncTimer: NodeJS.Timeout | null = null;
  private deviceId: string = '';

  async initialize(): Promise<void> {
    try {
      // Get device ID
      this.deviceId = await this.getDeviceId();
      
      // Initialize IndexedDB
      this.db = await openDB('AdvancedOfflineDB', 3, {
        upgrade(db, oldVersion, newVersion, transaction) {
          // Create stores if they don't exist
          if (!db.objectStoreNames.contains('entities')) {
            const entitiesStore = db.createObjectStore('entities', { keyPath: 'id' });
            entitiesStore.createIndex('type', 'type');
            entitiesStore.createIndex('syncStatus', 'syncStatus');
            entitiesStore.createIndex('timestamp', 'timestamp');
            entitiesStore.createIndex('priority', 'priority');
          }
          
          if (!db.objectStoreNames.contains('conflicts')) {
            const conflictsStore = db.createObjectStore('conflicts', { keyPath: 'id' });
            conflictsStore.createIndex('timestamp', 'timestamp');
            conflictsStore.createIndex('resolved', 'resolved');
          }
          
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', { keyPath: 'key' });
          }
          
          if (!db.objectStoreNames.contains('attachments')) {
            const attachmentsStore = db.createObjectStore('attachments', { keyPath: 'id' });
            attachmentsStore.createIndex('entityId', 'entityId');
            attachmentsStore.createIndex('type', 'type');
          }
        }
      });

      // Load sync queue and conflicts
      await this.loadSyncQueue();
      await this.loadConflicts();
      await this.loadSyncStats();
      
      // Start sync timer
      this.startSyncTimer();
      
      // Listen for network changes
      this.setupNetworkListeners();
      
      console.log('✅ Advanced Offline Manager initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Advanced Offline Manager:', error);
      throw error;
    }
  }

  async saveEntity(entity: Partial<OfflineEntity>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');
    
    const fullEntity: OfflineEntity = {
      id: entity.id || this.generateId(),
      type: entity.type || 'task',
      data: entity.data || {},
      timestamp: Date.now(),
      lastModified: Date.now(),
      syncStatus: 'pending',
      retryCount: 0,
      priority: entity.priority || 'medium',
      deviceId: this.deviceId,
      userId: entity.userId,
      metadata: entity.metadata || {},
      ...entity
    };

    // Compress data if enabled
    if (this.config.compressionEnabled) {
      fullEntity.data = await this.compressData(fullEntity.data);
    }

    // Encrypt data if enabled
    if (this.config.encryptionEnabled) {
      fullEntity.data = await this.encryptData(fullEntity.data);
    }

    const tx = this.db.transaction('entities', 'readwrite');
    await tx.store.put(fullEntity);
    await tx.done;

    // Add to sync queue if not already synced
    if (fullEntity.syncStatus === 'pending') {
      this.addToSyncQueue(fullEntity);
    }

    this.emit('entitySaved', fullEntity);
    await this.updateSyncStats();
    
    return fullEntity.id;
  }

  async getEntity(id: string): Promise<OfflineEntity | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const entity = await this.db.get('entities', id);
    if (!entity) return null;

    // Decrypt and decompress if needed
    let processedEntity = { ...entity };
    if (this.config.encryptionEnabled && entity.data) {
      processedEntity.data = await this.decryptData(entity.data);
    }
    if (this.config.compressionEnabled && processedEntity.data) {
      processedEntity.data = await this.decompressData(processedEntity.data);
    }

    return processedEntity;
  }

  async getEntitiesByType(type: string, limit?: number): Promise<OfflineEntity[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const tx = this.db.transaction('entities', 'readonly');
    const index = tx.store.index('type');
    const entities = limit 
      ? await index.getAll(type, limit)
      : await index.getAll(type);
    
    // Process all entities (decrypt/decompress)
    const processedEntities = await Promise.all(
      entities.map(async (entity) => {
        let processedEntity = { ...entity };
        if (this.config.encryptionEnabled && entity.data) {
          processedEntity.data = await this.decryptData(entity.data);
        }
        if (this.config.compressionEnabled && processedEntity.data) {
          processedEntity.data = await this.decompressData(processedEntity.data);
        }
        return processedEntity;
      })
    );

    return processedEntities;
  }

  async deleteEntity(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const tx = this.db.transaction('entities', 'readwrite');
    await tx.store.delete(id);
    await tx.done;

    // Remove from sync queue
    this.syncQueue = this.syncQueue.filter(entity => entity.id !== id);
    
    this.emit('entityDeleted', { id });
    await this.updateSyncStats();
  }

  async syncWithServer(): Promise<SyncStats> {
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping...');
      return this.syncStats;
    }

    if (!await this.canSync()) {
      console.log('Cannot sync: network conditions not met');
      return this.syncStats;
    }

    this.syncInProgress = true;
    const syncStartTime = Date.now();
    let syncedCount = 0;
    let failedCount = 0;
    let bandwidthUsed = 0;

    try {
      console.log(`🔄 Starting sync of ${this.syncQueue.length} items...`);
      this.emit('syncStarted', { queueSize: this.syncQueue.length });

      // Sort by priority and timestamp
      const sortedQueue = this.syncQueue.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        return priorityDiff || a.timestamp - b.timestamp;
      });

      // Process in batches
      const batchSize = 10;
      for (let i = 0; i < sortedQueue.length; i += batchSize) {
        const batch = sortedQueue.slice(i, i + batchSize);
        
        const batchResults = await Promise.allSettled(
          batch.map(entity => this.syncEntity(entity))
        );

        for (let j = 0; j < batchResults.length; j++) {
          const result = batchResults[j];
          const entity = batch[j];

          if (result.status === 'fulfilled') {
            syncedCount++;
            entity.syncStatus = 'synced';
            entity.retryCount = 0;
            bandwidthUsed += this.estimateEntitySize(entity);
          } else {
            failedCount++;
            entity.retryCount++;
            entity.syncStatus = entity.retryCount >= this.config.maxRetries ? 'failed' : 'pending';
            console.error(`Failed to sync entity ${entity.id}:`, result.reason);
          }

          // Update entity in database
          if (this.db) {
            const tx = this.db.transaction('entities', 'readwrite');
            await tx.store.put(entity);
            await tx.done;
          }
        }

        // Progress callback
        this.emit('syncProgress', {
          completed: i + batch.length,
          total: sortedQueue.length,
          synced: syncedCount,
          failed: failedCount
        });
      }

      // Update sync queue (remove synced items)
      this.syncQueue = this.syncQueue.filter(entity => 
        entity.syncStatus !== 'synced'
      );

      // Update stats
      const syncDuration = Date.now() - syncStartTime;
      this.syncStats = {
        ...this.syncStats,
        syncedItems: this.syncStats.syncedItems + syncedCount,
        failedItems: this.syncStats.failedItems + failedCount,
        lastSyncTime: Date.now(),
        syncDuration,
        bandwidthUsed: this.syncStats.bandwidthUsed + bandwidthUsed
      };

      await this.saveSyncStats();
      
      console.log(`✅ Sync completed: ${syncedCount} synced, ${failedCount} failed`);
      this.emit('syncCompleted', {
        synced: syncedCount,
        failed: failedCount,
        duration: syncDuration
      });

    } catch (error) {
      console.error('❌ Sync failed:', error);
      this.emit('syncFailed', { error: error.message });
    } finally {
      this.syncInProgress = false;
    }

    return this.syncStats;
  }

  async resolveConflict(conflictId: string, resolution: 'local' | 'remote' | 'merge', mergedData?: any): Promise<void> {
    const conflict = this.conflicts.find(c => c.id === conflictId);
    if (!conflict) throw new Error('Conflict not found');

    let resolvedData;
    switch (resolution) {
      case 'local':
        resolvedData = conflict.localData;
        break;
      case 'remote':
        resolvedData = conflict.remoteData;
        break;
      case 'merge':
        resolvedData = mergedData || this.mergeConflictData(conflict.localData, conflict.remoteData);
        break;
    }

    // Update entity with resolved data
    await this.saveEntity({
      id: conflict.id,
      data: resolvedData,
      syncStatus: 'pending'
    });

    // Mark conflict as resolved
    conflict.resolved = true;
    if (this.db) {
      const tx = this.db.transaction('conflicts', 'readwrite');
      await tx.store.put(conflict);
      await tx.done;
    }

    this.emit('conflictResolved', { conflictId, resolution });
  }

  async getConflicts(): Promise<SyncConflict[]> {
    return this.conflicts.filter(c => !c.resolved);
  }

  async clearOldData(olderThan: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const cutoffTime = Date.now() - olderThan;
    const tx = this.db.transaction('entities', 'readwrite');
    const index = tx.store.index('timestamp');
    
    let deletedCount = 0;
    let cursor = await index.openCursor(IDBKeyRange.upperBound(cutoffTime));
    
    while (cursor) {
      const entity = cursor.value;
      if (entity.syncStatus === 'synced') {
        await cursor.delete();
        deletedCount++;
      }
      cursor = await cursor.continue();
    }
    
    await tx.done;
    console.log(`🗑️ Cleaned up ${deletedCount} old synced items`);
    
    return deletedCount;
  }

  // Event handling
  addEventListener(event: string, callback: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  removeEventListener(event: string, callback: Function): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data?: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Private helper methods
  private async getDeviceId(): Promise<string> {
    try {
      const deviceInfo = await mobileService.getDeviceInfo();
      return deviceInfo.uuid || `device_${Date.now()}`;
    } catch {
      return `device_${Date.now()}`;
    }
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addToSyncQueue(entity: OfflineEntity): void {
    const existingIndex = this.syncQueue.findIndex(e => e.id === entity.id);
    if (existingIndex >= 0) {
      this.syncQueue[existingIndex] = entity;
    } else {
      this.syncQueue.push(entity);
    }
  }

  private async syncEntity(entity: OfflineEntity): Promise<void> {
    // Simulate API call - replace with actual implementation
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    
    // Simulate occasional failures
    if (Math.random() < 0.1) {
      throw new Error('Network error');
    }
    
    // Simulate conflicts
    if (Math.random() < 0.05) {
      await this.handleConflict(entity, { ...entity.data, serverModified: true });
      throw new Error('Conflict detected');
    }
  }

  private async handleConflict(localEntity: OfflineEntity, remoteData: any): Promise<void> {
    const conflict: SyncConflict = {
      id: localEntity.id,
      localData: localEntity.data,
      remoteData,
      conflictType: 'concurrent_edit',
      timestamp: Date.now(),
      resolved: false
    };

    this.conflicts.push(conflict);
    
    if (this.db) {
      const tx = this.db.transaction('conflicts', 'readwrite');
      await tx.store.put(conflict);
      await tx.done;
    }

    // Auto-resolve based on strategy
    if (this.config.conflictResolutionStrategy !== 'manual') {
      await this.resolveConflict(conflict.id, this.config.conflictResolutionStrategy);
    }

    this.emit('conflictDetected', conflict);
  }

  private mergeConflictData(localData: any, remoteData: any): any {
    // Simple merge strategy - prioritize newer fields
    const merged = { ...localData };
    
    for (const [key, value] of Object.entries(remoteData)) {
      if (value !== null && value !== undefined) {
        merged[key] = value;
      }
    }
    
    return merged;
  }

  private async canSync(): Promise<boolean> {
    try {
      const networkStatus = await mobileService.getNetworkStatus();
      
      if (!networkStatus.connected) return false;
      
      switch (this.config.networkThreshold) {
        case 'wifi':
          return networkStatus.connectionType === 'wifi';
        case 'good':
          return networkStatus.connectionType === 'wifi' || 
                 (networkStatus.connectionType === 'cellular' && !networkStatus.downlinkMax);
        default:
          return true;
      }
    } catch {
      return false;
    }
  }

  private estimateEntitySize(entity: OfflineEntity): number {
    return JSON.stringify(entity).length;
  }

  private async compressData(data: any): Promise<any> {
    // Simple compression simulation - in real implementation use libraries like pako
    return JSON.stringify(data);
  }

  private async decompressData(data: any): Promise<any> {
    // Simple decompression simulation
    return typeof data === 'string' ? JSON.parse(data) : data;
  }

  private async encryptData(data: any): Promise<any> {
    // Simple encryption simulation - in real implementation use Web Crypto API
    return btoa(JSON.stringify(data));
  }

  private async decryptData(data: any): Promise<any> {
    // Simple decryption simulation
    try {
      return JSON.parse(atob(data));
    } catch {
      return data;
    }
  }

  private async loadSyncQueue(): Promise<void> {
    if (!this.db) return;
    
    const tx = this.db.transaction('entities', 'readonly');
    const index = tx.store.index('syncStatus');
    const pendingEntities = await index.getAll('pending');
    
    this.syncQueue = pendingEntities;
  }

  private async loadConflicts(): Promise<void> {
    if (!this.db) return;
    
    const tx = this.db.transaction('conflicts', 'readonly');
    const allConflicts = await tx.store.getAll();
    
    this.conflicts = allConflicts;
  }

  private async loadSyncStats(): Promise<void> {
    if (!this.db) return;
    
    try {
      const savedStats = await this.db.get('metadata', 'syncStats');
      if (savedStats) {
        this.syncStats = { ...this.syncStats, ...savedStats.value };
      }
    } catch (error) {
      console.warn('Could not load sync stats:', error);
    }
  }

  private async saveSyncStats(): Promise<void> {
    if (!this.db) return;
    
    const tx = this.db.transaction('metadata', 'readwrite');
    await tx.store.put({ key: 'syncStats', value: this.syncStats });
    await tx.done;
  }

  private async updateSyncStats(): Promise<void> {
    if (!this.db) return;
    
    const tx = this.db.transaction('entities', 'readonly');
    const allEntities = await tx.store.getAll();
    
    this.syncStats.totalItems = allEntities.length;
    this.syncStats.pendingSync = allEntities.filter(e => e.syncStatus === 'pending').length;
    this.syncStats.conflictItems = this.conflicts.filter(c => !c.resolved).length;
    
    await this.saveSyncStats();
  }

  private startSyncTimer(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    
    this.syncTimer = setInterval(async () => {
      if (!this.syncInProgress && this.syncQueue.length > 0) {
        await this.syncWithServer();
      }
    }, this.config.syncInterval);
  }

  private setupNetworkListeners(): void {
    mobileService.addEventListener('networkStatusChanged', async (status) => {
      if (status.connected && this.syncQueue.length > 0) {
        console.log('Network reconnected, starting sync...');
        setTimeout(() => this.syncWithServer(), 1000);
      }
    });
  }

  // Public getters
  get stats(): SyncStats {
    return { ...this.syncStats };
  }

  get queueSize(): number {
    return this.syncQueue.length;
  }

  get isOnline(): boolean {
    return !this.syncInProgress;
  }
}

export const advancedOfflineManager = new AdvancedOfflineManager();
export default advancedOfflineManager;