// Service worker cleanup utility

export const cleanupServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    for (const registration of registrations) {
      await registration.unregister();
    }
    
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    console.log('Service workers cleaned up');
  }
};

// Call this once on app initialization
export const initCleanup = () => {
  if (typeof window !== 'undefined') {
    cleanupServiceWorker();
    
    // Clear any corrupted storage
    try {
      localStorage.removeItem('sw-cleared');
    } catch (e) {
      console.warn('Storage cleanup failed:', e);
    }
  }
};
