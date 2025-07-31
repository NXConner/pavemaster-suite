// Advanced Multi-Layer Cache Manager
// Implements browser, memory, and persistent caching strategies

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  strategy?: 'lru' | 'fifo' | 'ttl';
  persistent?: boolean; // Use IndexedDB for persistence
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export class CacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private dbName = 'pavemaster-cache';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initializeIndexedDB();
    this.startCleanupTimer();
  }

  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('ttl', 'ttl', { unique: false });
        }
      };
    });
  }

  // Memory cache operations
  async set<T>(
    key: string, 
    data: T, 
    options: CacheOptions = {}
  ): Promise<void> {
    const {
      ttl = 5 * 60 * 1000, // 5 minutes default
      maxSize = 1000,
      persistent = false
    } = options;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    // Store in memory cache
    this.memoryCache.set(key, entry);

    // Enforce max size
    if (this.memoryCache.size > maxSize) {
      this.evictEntries(maxSize);
    }

    // Store in persistent cache if requested
    if (persistent && this.db) {
      await this.setPersistent(key, entry);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && this.isValid(memoryEntry)) {
      memoryEntry.accessCount++;
      memoryEntry.lastAccessed = Date.now();
      return memoryEntry.data as T;
    }

    // Try persistent cache
    if (this.db) {
      const persistentEntry = await this.getPersistent<T>(key);
      if (persistentEntry && this.isValid(persistentEntry)) {
        // Promote to memory cache
        this.memoryCache.set(key, persistentEntry);
        return persistentEntry.data;
      }
    }

    return null;
  }

  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    
    if (this.db) {
      await this.deletePersistent(key);
    }
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    
    if (this.db) {
      await this.clearPersistent();
    }
  }

  // Persistent cache operations
  private async setPersistent<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      const request = store.put({ key, ...entry });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getPersistent<T>(key: string): Promise<CacheEntry<T> | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          const { key: _, ...entry } = result;
          resolve(entry as CacheEntry<T>);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async deletePersistent(key: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async clearPersistent(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Cache management utilities
  private isValid(entry: CacheEntry<any>): boolean {
    const now = Date.now();
    return (now - entry.timestamp) < entry.ttl;
  }

  private evictEntries(targetSize: number): void {
    const entries = Array.from(this.memoryCache.entries());
    
    // Sort by last accessed time (LRU)
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Remove oldest entries
    const toRemove = entries.length - targetSize;
    for (let i = 0; i < toRemove; i++) {
      this.memoryCache.delete(entries[i][0]);
    }
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isValid(entry)) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.memoryCache.delete(key));
  }

  // Statistics and monitoring
  getStats(): {
    memorySize: number;
    hitRate: number;
    totalAccesses: number;
  } {
    const entries = Array.from(this.memoryCache.values());
    const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const hitRate = totalAccesses > 0 ? (entries.length / totalAccesses) * 100 : 0;

    return {
      memorySize: this.memoryCache.size,
      hitRate,
      totalAccesses
    };
  }
}

// Global cache manager instance
export const cacheManager = new CacheManager();
