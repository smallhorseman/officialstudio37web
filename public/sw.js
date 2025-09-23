// Studio37 Service Worker - DISABLED to prevent asset corruption

console.log('Studio37 SW: Disabled service worker loading');

// Immediately unregister and clean up
self.addEventListener('install', (event) => {
  console.log('Studio37 SW: Install - immediately skip waiting');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Studio37 SW: Activate - clearing all caches and unregistering');
  event.waitUntil(
    Promise.all([
      // Clear all caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('Clearing cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('Studio37 SW: All caches cleared, unregistering...');
      // Unregister this service worker
      return self.registration.unregister();
    }).then(() => {
      console.log('Studio37 SW: Successfully unregistered');
    })
  );
});

// Completely remove fetch event listener to prevent ANY interception
// No fetch listener = no interception = no corruption

// Notify clients that SW is disabled
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
