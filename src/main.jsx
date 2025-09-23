import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { initCleanup } from './utils/cleanup';
import './index.css';

// Clean up any service worker issues
initCleanup();

// Initialize the React application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
  // Immediately unregister all service workers
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    registrations.forEach(function(registration) {
      registration.unregister().then(function(success) {
        console.log('✅ Unregistered corrupted service worker:', registration.scope, success);
      }).catch(function(error) {
        console.log('❌ Failed to unregister service worker:', error);
      });
    });
  });

  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('🗑️ Clearing cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
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
  }
}
