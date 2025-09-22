export class PerformanceMonitor {
  static trackPageLoad(pageName) {
    if ('performance' in window) {
      try {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.fetchStart;
          console.log(`Page ${pageName} loaded in ${loadTime}ms`);
          
          // Track Core Web Vitals safely
          this.trackCoreWebVitals();
        }
      } catch (error) {
        console.warn('Performance tracking failed:', error);
      }
    }
  }
  
  static trackCoreWebVitals() {
    try {
      // LCP - Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            console.log('LCP:', lastEntry.startTime);
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // FID - First Input Delay
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.processingStart && entry.startTime) {
              console.log('FID:', entry.processingStart - entry.startTime);
            }
          });
        }).observe({ entryTypes: ['first-input'] });
        
        // CLS - Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (!entry.hadRecentInput && entry.value) {
              clsValue += entry.value;
            }
          });
          console.log('CLS:', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
      }
    } catch (error) {
      console.warn('Core Web Vitals tracking failed:', error);
    }
  }
  
  static trackImageLoading(imageUrl) {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      console.log(`Image loaded in ${endTime - startTime}ms: ${imageUrl}`);
    };
  }
}
