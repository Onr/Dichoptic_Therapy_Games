/**
 * Service Worker for Dichoptic Therapy Games
 * Provides offline functionality, caching, and performance optimizations
 */

const CACHE_NAME = 'dichoptic-therapy-v1.3.0';
const STATIC_CACHE = 'static-resources-v1.3.0';
const DYNAMIC_CACHE = 'dynamic-resources-v1.3.0';
const SCOPE_URL = new URL('./', self.location.href);

// Files to cache immediately
const STATIC_ASSET_PATHS = [
  './',
  'index.html',
  'memory_game.html',
  'ball_game.html',
  'static_ball_game.html',
  'fusion_quest.html',
  'progress.html',
  'styles.css',
  'game.js',
  'favicon.ico',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'manifest.json',
  'src/production.js',
  'src/utils/logger.js',
  'src/utils/alerts.js',
  'src/utils/performance.js',
  'src/utils/health.js',
  'src/utils/errorHandler.js',
  'src/utils/environment.js',
  'src/utils/userCounter.js',
  'src/utils/adminPanel.js',
  'src/utils/progressTracker.js',
  'src/utils/gameHelpers.js',
  'src/utils/fusionScoring.js',
  'src/utils/registerServiceWorker.js',
  'assets/anaglyph-glasses.jpg'
];
const STATIC_ASSETS = STATIC_ASSET_PATHS.map((path) => new URL(path, SCOPE_URL).href);

// Network-first resources (analytics, etc.)
const NETWORK_FIRST = [
  'https://www.googletagmanager.com/',
  'https://www.google-analytics.com/',
  'https://analytics.google.com/'
];

// Cache-first resources (fonts, images)
const CACHE_FIRST = [
  'https://fonts.googleapis.com/',
  'https://fonts.gstatic.com/'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirst(request));
  } else if (isNetworkFirst(request.url)) {
    event.respondWith(networkFirst(request));
  } else if (isCacheFirst(request.url)) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Caching strategies
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return getOfflineFallback(request);
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network first fallback to cache for:', request.url);
    const cachedResponse = await caches.match(request);
    return cachedResponse || getOfflineFallback(request);
  }
}

async function staleWhileRevalidate(request) {
  try {
    const cachedResponse = await caches.match(request);
    const networkPromise = fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        const cache = caches.open(DYNAMIC_CACHE);
        cache.then(c => c.put(request, networkResponse.clone()));
      }
      return networkResponse;
    });
    
    return cachedResponse || networkPromise;
  } catch (error) {
    console.error('Stale while revalidate failed:', error);
    return getOfflineFallback(request);
  }
}

function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  if (request.destination === 'document') {
    return caches.match(new URL('index.html', SCOPE_URL).href);
  }
  
  if (request.destination === 'image') {
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="#ccc"><rect width="100%" height="100%"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">Offline</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
  
  return new Response('Offline', { 
    status: 503, 
    statusText: 'Service Unavailable' 
  });
}

// Helper functions
function isStaticAsset(url) {
  try {
    const path = new URL(url).pathname;
    return STATIC_ASSETS.some(asset => path === new URL(asset).pathname);
  } catch {
    return false;
  }
}

function isNetworkFirst(url) {
  return NETWORK_FIRST.some(pattern => url.includes(pattern));
}

function isCacheFirst(url) {
  return CACHE_FIRST.some(pattern => url.includes(pattern));
}

// Background sync for analytics when online
self.addEventListener('sync', (event) => {
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }
});

async function syncAnalytics() {
  try {
    // Get pending analytics data from IndexedDB
    const pendingData = await getPendingAnalytics();
    
    if (pendingData.length > 0) {
      console.log('Service Worker: Syncing', pendingData.length, 'analytics events');
      
      for (const data of pendingData) {
        try {
          await fetch('https://www.google-analytics.com/collect', {
            method: 'POST',
            body: data.payload
          });
        } catch (error) {
          console.error('Failed to sync analytics event:', error);
        }
      }
      
      // Clear synced data
      await clearPendingAnalytics();
    }
  } catch (error) {
    console.error('Analytics sync failed:', error);
  }
}

// IndexedDB helpers for offline analytics
async function getPendingAnalytics() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('therapy-analytics', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pending'], 'readonly');
      const store = transaction.objectStore('pending');
      const getAll = store.getAll();
      
      getAll.onsuccess = () => resolve(getAll.result || []);
      getAll.onerror = () => reject(getAll.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pending')) {
        db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function clearPendingAnalytics() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('therapy-analytics', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pending'], 'readwrite');
      const store = transaction.objectStore('pending');
      const clear = store.clear();
      
      clear.onsuccess = () => resolve();
      clear.onerror = () => reject(clear.error);
    };
  });
}

// Push notifications (for therapy reminders)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Time for your therapy session!',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      tag: 'therapy-reminder',
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Start Session'
        },
        {
          action: 'dismiss',
          title: 'Later'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Therapy Reminder', options)
    );
  } catch (error) {
    console.error('Push notification error:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync for health checks
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'health-check') {
    event.waitUntil(performHealthCheck());
  }
});

async function performHealthCheck() {
  try {
    // Simple connectivity check
    const response = await fetch('/', { method: 'HEAD' });
    
    if (response.ok) {
      console.log('Service Worker: Health check passed');
    } else {
      console.warn('Service Worker: Health check failed', response.status);
    }
  } catch (error) {
    console.error('Service Worker: Health check error:', error);
  }
}

// Cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'CACHE_CLEAR':
        event.waitUntil(clearAllCaches());
        break;
      case 'CACHE_UPDATE':
        event.waitUntil(updateCaches());
        break;
      case 'GET_CACHE_STATUS':
        event.waitUntil(getCacheStatus().then(status => {
          event.ports[0].postMessage(status);
        }));
        break;
    }
  }
});

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('Service Worker: All caches cleared');
}

async function updateCaches() {
  const cache = await caches.open(STATIC_CACHE);
  await cache.addAll(STATIC_ASSETS);
  console.log('Service Worker: Caches updated');
}

async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};
  
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    status[name] = keys.length;
  }
  
  return status;
}

console.log('Service Worker: Loaded');
