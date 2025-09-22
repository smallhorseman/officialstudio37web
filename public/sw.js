// Disable service worker to prevent NS_ERROR_CORRUPTED_CONTENT errors
// This service worker immediately unregisters itself and clears all caches

self.addEventListener('install', () => {
  // Skip waiting and immediately activate
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Studio37 SW: Deactivating and clearing caches...');
  event.waitUntil(
    // Clear all existing caches
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Clearing cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('Service worker disabled - all caches cleared');
      // Take control of all clients
      return self.clients.claim();
    }).then(() => {
      // Unregister this service worker
      return self.registration.unregister();
    })
  );
});

// Don't intercept any requests - let all requests pass through to network
self.addEventListener('fetch', (event) => {
  // Simply return - don't intercept anything to prevent corruption
  return;
});
});

// Fetch event - Network first for API, Cache first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle API requests with network-first strategy
  if (url.pathname.includes('/api/') || url.origin.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request)
          .then(response => {
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(request, responseClone));
            }
            return response;
          });
      })
  );
});
