const CACHE_NAME = 'pavemaster-suite-v1';
const STATIC_CACHE = 'pavemaster-static-v1';
const DYNAMIC_CACHE = 'pavemaster-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Assets to cache dynamically
const CACHE_ROUTES = [
  '/mobile-command',
  '/tracking',
  '/weather',
  '/materials',
  '/projects'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
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

  // Cache-first strategy for static assets
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request);
        })
    );
    return;
  }

  // Network-first strategy for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Return cached version if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Cache-first strategy for app routes
  if (CACHE_ROUTES.includes(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            // Serve from cache and update in background
            fetch(request)
              .then((fetchResponse) => {
                if (fetchResponse.status === 200) {
                  caches.open(DYNAMIC_CACHE)
                    .then((cache) => {
                      cache.put(request, fetchResponse.clone());
                    });
                }
              });
            return response;
          }
          
          // Not in cache, fetch and cache
          return fetch(request)
            .then((fetchResponse) => {
              if (fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone();
                caches.open(DYNAMIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return fetchResponse;
            });
        })
    );
    return;
  }

  // Default: network-first
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from PaveMaster Suite',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icon-192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('PaveMaster Suite', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.action);
  
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync offline data function
async function syncOfflineData() {
  try {
    // Get offline data from IndexedDB
    const offlineData = await getOfflineData();
    
    if (offlineData && offlineData.length > 0) {
      // Send data to server
      for (const data of offlineData) {
        await fetch('/api/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
      }
      
      // Clear offline data after successful sync
      await clearOfflineData();
      console.log('Service Worker: Offline data synced successfully');
    }
  } catch (error) {
    console.error('Service Worker: Offline sync failed', error);
  }
}

// IndexedDB helpers (simplified)
async function getOfflineData() {
  // This would integrate with your IndexedDB implementation
  return [];
}

async function clearOfflineData() {
  // This would clear synced data from IndexedDB
  return true;
}