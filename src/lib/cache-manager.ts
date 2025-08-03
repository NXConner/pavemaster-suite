// Advanced Cache Management System
// Handles browser cache, service worker cache, and intelligent prefetching

export interface CacheConfig {
  maxAge: number;
  maxSize: number;
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  version: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
  size: number;
  accessCount: number;
  lastAccess: number;
}

export interface PrefetchConfig {
  enabled: boolean;
  maxConcurrent: number;
  probability: number;
  delay: number;
}

// Main Cache Manager Class
export class CacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private prefetchQueue = new Set<string>();
  private currentMemorySize = 0;
  private config: CacheConfig;
  private prefetchConfig: PrefetchConfig;
  private analytics = {
    hits: 0,
    misses: 0,
    prefetches: 0,
    evictions: 0,
  };

  constructor(
    config: Partial<CacheConfig> = {},
    prefetchConfig: Partial<PrefetchConfig> = {}
  ) {
    this.config = {
      maxAge: 1000 * 60 * 30, // 30 minutes
      maxSize: 50 * 1024 * 1024, // 50MB
      strategy: 'stale-while-revalidate',
      version: '1.0.0',
      ...config,
    };

    this.prefetchConfig = {
      enabled: true,
      maxConcurrent: 3,
      probability: 0.7,
      delay: 100,
      ...prefetchConfig,
    };

    // Initialize service worker if supported
    this.initializeServiceWorker();
    
    // Set up cleanup interval
    setInterval(() => this.cleanup(), 1000 * 60 * 5); // Every 5 minutes
  }

  // Service Worker Registration
  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('ServiceWorker registration successful:', registration.scope);
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event.data);
        });
      } catch (error) {
        console.warn('ServiceWorker registration failed:', error);
      }
    }
  }

  // Handle messages from service worker
  private handleServiceWorkerMessage(data: any): void {
    switch (data.type) {
      case 'CACHE_HIT':
        this.analytics.hits++;
        break;
      case 'CACHE_MISS':
        this.analytics.misses++;
        break;
      case 'PREFETCH_COMPLETE':
        this.analytics.prefetches++;
        break;
    }
  }

  // Get item from cache
  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && this.isValid(memoryEntry)) {
      memoryEntry.accessCount++;
      memoryEntry.lastAccess = Date.now();
      this.analytics.hits++;
      return memoryEntry.data;
    }

    // Try browser storage
    const storageEntry = await this.getFromStorage<T>(key);
    if (storageEntry && this.isValid(storageEntry)) {
      // Promote to memory cache
      this.setInMemory(key, storageEntry.data, storageEntry.ttl);
      this.analytics.hits++;
      return storageEntry.data;
    }

    // Try service worker cache
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const swResponse = await this.getFromServiceWorker<T>(key);
      if (swResponse) {
        this.analytics.hits++;
        return swResponse;
      }
    }

    this.analytics.misses++;
    return null;
  }

  // Set item in cache
  async set<T>(
    key: string, 
    data: T, 
    ttl: number = this.config.maxAge
  ): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version: this.config.version,
      size: this.estimateSize(data),
      accessCount: 1,
      lastAccess: Date.now(),
    };

    // Set in memory cache
    this.setInMemory(key, data, ttl);

    // Set in browser storage
    await this.setInStorage(key, entry);

    // Set in service worker cache
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_SET',
        key,
        data: entry,
      });
    }
  }

  // Set in memory cache with size management
  private setInMemory<T>(key: string, data: T, ttl: number): void {
    const size = this.estimateSize(data);
    
    // Check if we need to make space
    while (this.currentMemorySize + size > this.config.maxSize) {
      this.evictLeastUsed();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version: this.config.version,
      size,
      accessCount: 1,
      lastAccess: Date.now(),
    };

    this.memoryCache.set(key, entry);
    this.currentMemorySize += size;
  }

  // Evict least recently used item
  private evictLeastUsed(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const entry = this.memoryCache.get(oldestKey);
      if (entry) {
        this.currentMemorySize -= entry.size;
        this.memoryCache.delete(oldestKey);
        this.analytics.evictions++;
      }
    }
  }

  // Get from browser storage (IndexedDB)
  private async getFromStorage<T>(key: string): Promise<CacheEntry<T> | null> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const result = await this.promisifyRequest(store.get(key));
      
      return result || null;
    } catch (error) {
      console.warn('Storage get error:', error);
      return null;
    }
  }

  // Set in browser storage (IndexedDB)
  private async setInStorage<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      await this.promisifyRequest(store.put({ key, ...entry }));
    } catch (error) {
      console.warn('Storage set error:', error);
    }
  }

  // Get from service worker
  private async getFromServiceWorker<T>(key: string): Promise<T | null> {
    return new Promise((resolve) => {
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        resolve(event.data.data || null);
      };

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_GET',
          key,
        }, [channel.port2]);
      } else {
        resolve(null);
      }

      // Timeout after 1 second
      setTimeout(() => resolve(null), 1000);
    });
  }

  // Open IndexedDB
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PaveMasterCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('version', 'version');
        }
      };
    });
  }

  // Promisify IndexedDB request
  private promisifyRequest(request: IDBRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Check if cache entry is valid
  private isValid(entry: CacheEntry<any>): boolean {
    const age = Date.now() - entry.timestamp;
    return age < entry.ttl && entry.version === this.config.version;
  }

  // Estimate object size in bytes
  private estimateSize(obj: any): number {
    const jsonString = JSON.stringify(obj);
    return new Blob([jsonString]).size;
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    
    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isValid(entry)) {
        this.currentMemorySize -= entry.size;
        this.memoryCache.delete(key);
      }
    }

    // Clean storage cache
    this.cleanupStorage();
  }

  // Cleanup storage cache
  private async cleanupStorage(): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const index = store.index('timestamp');
      
      const cutoff = Date.now() - this.config.maxAge;
      const range = IDBKeyRange.upperBound(cutoff);
      
      await this.promisifyRequest(index.openCursor(range));
    } catch (error) {
      console.warn('Storage cleanup error:', error);
    }
  }

  // Intelligent prefetching
  async prefetch(urls: string[]): Promise<void> {
    if (!this.prefetchConfig.enabled) return;

    for (const url of urls) {
      if (this.prefetchQueue.size >= this.prefetchConfig.maxConcurrent) {
        break;
      }

      if (Math.random() > this.prefetchConfig.probability) {
        continue;
      }

      if (!this.prefetchQueue.has(url)) {
        this.prefetchQueue.add(url);
        
        setTimeout(async () => {
          try {
            await this.prefetchResource(url);
          } finally {
            this.prefetchQueue.delete(url);
          }
        }, this.prefetchConfig.delay);
      }
    }
  }

  // Prefetch a single resource
  private async prefetchResource(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        await this.set(`prefetch:${url}`, data, this.config.maxAge / 2);
        this.analytics.prefetches++;
      }
    } catch (error) {
      console.warn('Prefetch error:', error);
    }
  }

  // Get cache analytics
  getAnalytics() {
    const hitRate = this.analytics.hits / (this.analytics.hits + this.analytics.misses) || 0;
    
    return {
      ...this.analytics,
      hitRate: Math.round(hitRate * 100),
      memoryUsage: this.currentMemorySize,
      memoryEntries: this.memoryCache.size,
      maxMemory: this.config.maxSize,
    };
  }

  // Clear all caches
  async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();
    this.currentMemorySize = 0;

    // Clear storage cache
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      await this.promisifyRequest(store.clear());
    } catch (error) {
      console.warn('Storage clear error:', error);
    }

    // Clear service worker cache
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_CLEAR',
      });
    }
  }

  // Delete specific key
  async delete(key: string): Promise<void> {
    // Delete from memory
    const entry = this.memoryCache.get(key);
    if (entry) {
      this.currentMemorySize -= entry.size;
      this.memoryCache.delete(key);
    }

    // Delete from storage
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      await this.promisifyRequest(store.delete(key));
    } catch (error) {
      console.warn('Storage delete error:', error);
    }

    // Delete from service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_DELETE',
        key,
      });
    }
  }
}

// HTTP Cache utilities
export class HTTPCache {
  private cacheManager: CacheManager;

  constructor(cacheManager: CacheManager) {
    this.cacheManager = cacheManager;
  }

  // Enhanced fetch with caching
  async fetch(
    url: string, 
    options: RequestInit = {}, 
    cacheOptions: {
      ttl?: number;
      strategy?: 'cache-first' | 'network-first' | 'stale-while-revalidate';
      key?: string;
    } = {}
  ): Promise<Response> {
    const cacheKey = cacheOptions.key || `http:${url}:${JSON.stringify(options)}`;
    const strategy = cacheOptions.strategy || 'stale-while-revalidate';

    switch (strategy) {
      case 'cache-first':
        return this.cacheFirstStrategy(url, options, cacheKey, cacheOptions.ttl);
      
      case 'network-first':
        return this.networkFirstStrategy(url, options, cacheKey, cacheOptions.ttl);
      
      case 'stale-while-revalidate':
      default:
        return this.staleWhileRevalidateStrategy(url, options, cacheKey, cacheOptions.ttl);
    }
  }

  // Cache first strategy
  private async cacheFirstStrategy(
    url: string, 
    options: RequestInit, 
    cacheKey: string, 
    ttl?: number
  ): Promise<Response> {
    const cached = await this.cacheManager.get<{
      data: any;
      headers: Record<string, string>;
      status: number;
    }>(cacheKey);

    if (cached) {
      return new Response(JSON.stringify(cached.data), {
        status: cached.status,
        headers: cached.headers,
      });
    }

    const response = await fetch(url, options);
    if (response.ok) {
      const data = await response.clone().json();
      await this.cacheManager.set(cacheKey, {
        data,
        headers: Object.fromEntries(response.headers.entries()),
        status: response.status,
      }, ttl);
    }

    return response;
  }

  // Network first strategy
  private async networkFirstStrategy(
    url: string, 
    options: RequestInit, 
    cacheKey: string, 
    ttl?: number
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        const data = await response.clone().json();
        await this.cacheManager.set(cacheKey, {
          data,
          headers: Object.fromEntries(response.headers.entries()),
          status: response.status,
        }, ttl);
      }
      return response;
    } catch (error) {
      const cached = await this.cacheManager.get<{
        data: any;
        headers: Record<string, string>;
        status: number;
      }>(cacheKey);

      if (cached) {
        return new Response(JSON.stringify(cached.data), {
          status: cached.status,
          headers: cached.headers,
        });
      }

      throw error;
    }
  }

  // Stale while revalidate strategy
  private async staleWhileRevalidateStrategy(
    url: string, 
    options: RequestInit, 
    cacheKey: string, 
    ttl?: number
  ): Promise<Response> {
    const cached = await this.cacheManager.get<{
      data: any;
      headers: Record<string, string>;
      status: number;
    }>(cacheKey);

    // Start network request in background
    const networkPromise = fetch(url, options).then(async (response) => {
      if (response.ok) {
        const data = await response.clone().json();
        await this.cacheManager.set(cacheKey, {
          data,
          headers: Object.fromEntries(response.headers.entries()),
          status: response.status,
        }, ttl);
      }
      return response;
    });

    // Return cached version immediately if available
    if (cached) {
      // Don't await network request - let it complete in background
      networkPromise.catch(console.warn);
      
      return new Response(JSON.stringify(cached.data), {
        status: cached.status,
        headers: cached.headers,
      });
    }

    // If no cache, wait for network
    return networkPromise;
  }
}

// Create singleton instance
export const cacheManager = new CacheManager();
export const httpCache = new HTTPCache(cacheManager);

// Resource preloader
export class ResourcePreloader {
  private cacheManager: CacheManager;
  private loadQueue = new Set<string>();
  private observer?: IntersectionObserver;

  constructor(cacheManager: CacheManager) {
    this.cacheManager = cacheManager;
    this.setupIntersectionObserver();
  }

  // Setup intersection observer for lazy loading
  private setupIntersectionObserver(): void {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const element = entry.target as HTMLElement;
              const src = element.dataset.src;
              if (src && !this.loadQueue.has(src)) {
                this.preloadResource(src);
              }
            }
          });
        },
        { rootMargin: '50px' }
      );
    }
  }

  // Observe element for lazy loading
  observe(element: HTMLElement): void {
    this.observer?.observe(element);
  }

  // Preload critical resources
  async preloadCritical(resources: string[]): Promise<void> {
    const promises = resources.map(url => this.preloadResource(url));
    await Promise.all(promises);
  }

  // Preload single resource
  private async preloadResource(url: string): Promise<void> {
    if (this.loadQueue.has(url)) return;
    
    this.loadQueue.add(url);
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.text();
        await this.cacheManager.set(`preload:${url}`, data);
      }
    } catch (error) {
      console.warn('Preload error:', error);
    } finally {
      this.loadQueue.delete(url);
    }
  }
}

export const resourcePreloader = new ResourcePreloader(cacheManager);