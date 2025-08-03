// PaveMaster Suite Service Worker
// Advanced caching, offline support, and background sync

const CACHE_NAME = 'pavemaster-v1.0.0';
const RUNTIME_CACHE = 'pavemaster-runtime';
const OFFLINE_CACHE = 'pavemaster-offline';

// Resources to cache on install
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/static/js/main.js',
  '/static/css/main.css',
  '/offline.html',
];

// Cache strategies for different resource types
const CACHE_STRATEGIES = {
  pages: 'stale-while-revalidate',
  api: 'network-first',
  assets: 'cache-first',
  images: 'cache-first',
};

// Cache durations
const CACHE_DURATIONS = {
  pages: 24 * 60 * 60 * 1000, // 24 hours
  api: 5 * 60 * 1000, // 5 minutes
  assets: 30 * 24 * 60 * 60 * 1000, // 30 days
  images: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(PRECACHE_URLS);
        console.log('[SW] Precached resources');
        
        // Skip waiting to activate immediately
        await self.skipWaiting();
      } catch (error) {
        console.error('[SW] Install failed:', error);
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
          name.startsWith('pavemaster-') && name !== CACHE_NAME && name !== RUNTIME_CACHE
        );
        
        await Promise.all(
          oldCaches.map(cache => caches.delete(cache))
        );
        
        console.log(`[SW] Cleaned ${oldCaches.length} old caches`);
        
        // Take control of all pages
        await self.clients.claim();
      } catch (error) {
        console.error('[SW] Activation failed:', error);
      }
    })()
  );
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

// Handle fetch requests with appropriate strategies
async function handleFetch(request) {
  const url = new URL(request.url);
  const resourceType = getResourceType(url.pathname);
  const strategy = CACHE_STRATEGIES[resourceType] || 'network-first';
  
  try {
    switch (strategy) {
      case 'cache-first':
        return await cacheFirst(request);
      case 'network-first':
        return await networkFirst(request);
      case 'stale-while-revalidate':
        return await staleWhileRevalidate(request);
      default:
        return await fetch(request);
    }
  } catch (error) {
    console.warn('[SW] Fetch failed:', error);
    return await getOfflineFallback(request);
  }
}

// Cache first strategy
async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  
  if (cached && await isCacheValid(cached, request)) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Network first strategy
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached && await isCacheValid(cached, request)) {
      return cached;
    }
    throw error;
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  
  // Start network request
  const networkPromise = fetch(request).then(async (response) => {
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  });
  
  // Return cached version immediately if available
  if (cached && await isCacheValid(cached, request)) {
    // Don't await network request
    networkPromise.catch(console.warn);
    return cached;
  }
  
  // If no cache, wait for network
  return networkPromise;
}

// Check if cached response is still valid
async function isCacheValid(response, request) {
  const url = new URL(request.url);
  const resourceType = getResourceType(url.pathname);
  const maxAge = CACHE_DURATIONS[resourceType] || CACHE_DURATIONS.pages;
  
  const cachedDate = new Date(response.headers.get('date') || 0);
  const age = Date.now() - cachedDate.getTime();
  
  return age < maxAge;
}

// Get resource type from pathname
function getResourceType(pathname) {
  if (pathname.startsWith('/api/')) {
    return 'api';
  }
  
  if (pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/)) {
    return 'assets';
  }
  
  if (pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/)) {
    return 'images';
  }
  
  return 'pages';
}

// Get offline fallback
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  if (request.destination === 'document') {
    const cache = await caches.open(OFFLINE_CACHE);
    return await cache.match('/offline.html') || new Response('Offline');
  }
  
  if (request.destination === 'image') {
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" dominant-baseline="middle" fill="#999">Offline</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
  
  return new Response('Network error', { status: 408 });
}

// Message handling for cache management
self.addEventListener('message', (event) => {
  const { type, key, data } = event.data;
  
  switch (type) {
    case 'CACHE_GET':
      handleCacheGet(key, event);
      break;
      
    case 'CACHE_SET':
      handleCacheSet(key, data);
      break;
      
    case 'CACHE_DELETE':
      handleCacheDelete(key);
      break;
      
    case 'CACHE_CLEAR':
      handleCacheClear();
      break;
      
    case 'GET_CACHE_STATS':
      handleGetCacheStats(event);
      break;
      
    case 'PREFETCH':
      handlePrefetch(data);
      break;
  }
});

// Handle cache get request
async function handleCacheGet(key, event) {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    const response = await cache.match(key);
    
    if (response) {
      const data = await response.json();
      event.ports[0].postMessage({ data });
      
      // Send analytics
      self.postMessage({ type: 'CACHE_HIT' });
    } else {
      event.ports[0].postMessage({ data: null });
      self.postMessage({ type: 'CACHE_MISS' });
    }
  } catch (error) {
    event.ports[0].postMessage({ data: null });
    console.warn('[SW] Cache get error:', error);
  }
}

// Handle cache set request
async function handleCacheSet(key, data) {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    const response = new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Date': new Date().toISOString(),
      },
    });
    
    await cache.put(key, response);
  } catch (error) {
    console.warn('[SW] Cache set error:', error);
  }
}

// Handle cache delete request
async function handleCacheDelete(key) {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.delete(key);
  } catch (error) {
    console.warn('[SW] Cache delete error:', error);
  }
}

// Handle cache clear request
async function handleCacheClear() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(name => {
        if (name.startsWith('pavemaster-')) {
          return caches.delete(name);
        }
      })
    );
  } catch (error) {
    console.warn('[SW] Cache clear error:', error);
  }
}

// Handle get cache stats request
async function handleGetCacheStats(event) {
  try {
    const cacheNames = await caches.keys();
    const stats = {};
    
    for (const name of cacheNames) {
      if (name.startsWith('pavemaster-')) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        stats[name] = keys.length;
      }
    }
    
    event.ports[0].postMessage({ stats });
  } catch (error) {
    event.ports[0].postMessage({ stats: {} });
    console.warn('[SW] Cache stats error:', error);
  }
}

// Handle prefetch request
async function handlePrefetch(urls) {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    
    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.warn(`[SW] Prefetch failed for ${url}:`, error);
      }
    }
    
    self.postMessage({ type: 'PREFETCH_COMPLETE' });
  } catch (error) {
    console.warn('[SW] Prefetch error:', error);
  }
}

// Background sync for offline operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

// Handle background sync
async function handleBackgroundSync() {
  try {
    // Get pending operations from IndexedDB
    const db = await openSyncDB();
    const transaction = db.transaction(['sync'], 'readonly');
    const store = transaction.objectStore('sync');
    const operations = await getAllFromStore(store);
    
    for (const operation of operations) {
      try {
        await processOperation(operation);
        
        // Remove successful operation
        const deleteTransaction = db.transaction(['sync'], 'readwrite');
        const deleteStore = deleteTransaction.objectStore('sync');
        await deleteStore.delete(operation.id);
      } catch (error) {
        console.warn('[SW] Sync operation failed:', error);
        
        // Mark as failed or retry based on error type
        operation.retryCount = (operation.retryCount || 0) + 1;
        if (operation.retryCount < 3) {
          const updateTransaction = db.transaction(['sync'], 'readwrite');
          const updateStore = updateTransaction.objectStore('sync');
          await updateStore.put(operation);
        }
      }
    }
  } catch (error) {
    console.warn('[SW] Background sync error:', error);
  }
}

// Open sync database
function openSyncDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PaveMasterSync', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('sync')) {
        const store = db.createObjectStore('sync', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('type', 'type');
      }
    };
  });
}

// Get all items from store
function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Process sync operation
async function processOperation(operation) {
  const { type, data, url, method, headers } = operation;
  
  switch (type) {
    case 'api-request':
      const response = await fetch(url, {
        method: method || 'POST',
        headers: headers || { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
      
    default:
      console.warn('[SW] Unknown sync operation type:', type);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const payload = event.data.json();
    const options = {
      body: payload.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: payload.data,
      actions: payload.actions,
      tag: payload.tag || 'default',
      requireInteraction: payload.requireInteraction || false,
    };
    
    event.waitUntil(
      self.registration.showNotification(payload.title, options)
    );
  } catch (error) {
    console.warn('[SW] Push notification error:', error);
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const data = event.notification.data || {};
  const action = event.action;
  
  event.waitUntil(
    (async () => {
      if (action === 'open' || !action) {
        const url = data.url || '/';
        const windowClients = await self.clients.matchAll({ type: 'window' });
        
        // Check if window is already open
        for (const client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      }
      
      // Handle custom actions
      if (action && data.actions) {
        const actionConfig = data.actions.find(a => a.action === action);
        if (actionConfig && actionConfig.url) {
          return self.clients.openWindow(actionConfig.url);
        }
      }
    })()
  );
});

// Performance monitoring
let performanceMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  offlineFallbacks: 0,
  averageResponseTime: 0,
  responseTimeSamples: [],
};

// Track performance metrics
function trackPerformance(type, responseTime) {
  performanceMetrics[type]++;
  
  if (responseTime) {
    performanceMetrics.responseTimeSamples.push(responseTime);
    
    // Keep only last 100 samples
    if (performanceMetrics.responseTimeSamples.length > 100) {
      performanceMetrics.responseTimeSamples.shift();
    }
    
    // Calculate average
    const sum = performanceMetrics.responseTimeSamples.reduce((a, b) => a + b, 0);
    performanceMetrics.averageResponseTime = sum / performanceMetrics.responseTimeSamples.length;
  }
}

// Send performance data to main thread
setInterval(() => {
  self.postMessage({
    type: 'PERFORMANCE_METRICS',
    data: performanceMetrics,
  });
}, 30000); // Every 30 seconds

console.log('[SW] Service Worker initialized successfully');