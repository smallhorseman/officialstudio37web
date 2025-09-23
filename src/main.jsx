import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Disable service worker registration completely
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister().then(() => {
        console.log('Studio37: Service Worker unregistered successfully');
      });
    }
  });
}

// Clear all caches
if ('caches' in window) {
  caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        console.log('🗑️ Clearing cache:', cacheName);
        return caches.delete(cacheName);
      })
    ).then(function() {
      console.log('✅ All caches cleared - asset corruption prevented');
      // Force reload to ensure clean state
      if (window.location.search.includes('sw-cleared')) {
        // Already cleared, don't loop
      } else {
        window.location.search = '?sw-cleared=true';
      }
    }).catch(function(error) {
      console.log('❌ Cache clearing failed:', error);
    });
  });
}
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
