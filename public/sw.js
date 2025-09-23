// Service Worker completely removed to prevent asset corruption
// This file intentionally left minimal to avoid any caching issues

console.log('Studio37: Service Worker disabled - no caching active');

// Immediately skip waiting and unregister
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names => 
      Promise.all(names.map(name => caches.delete(name)))
    ).then(() => {
      self.clients.claim();
      return self.registration.unregister();
    })
  );
});
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
