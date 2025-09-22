// TEMPORARY REMOVAL - Service worker causing asset loading failures
// This file should be deleted to resolve NS_ERROR_CORRUPTED_CONTENT issues

// Immediately unregister any existing service worker
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Clear all caches
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Clearing cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Unregister this service worker
      return self.registration.unregister();
    })
  );
});

// Don't intercept any requests - let them pass through normally
self.addEventListener('fetch', (event) => {
  // Do nothing - let network handle all requests
  return;
});
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }
  
  // Handle other requests with cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        
        return fetch(request)
          .then((response) => {
            // Don't cache if not successful
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Cache successful responses
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => cache.put(request, responseToCache));
            
            return response;
          });
      })
  );
});

// Handle messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
