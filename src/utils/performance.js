export class PerformanceMonitor {
  static trackPageLoad(pageName) {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0];
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      
      // Track Core Web Vitals
      this.trackCoreWebVitals();
      
      console.log(`Page ${pageName} loaded in ${loadTime}ms`);
    }
  }
  
  static trackCoreWebVitals() {
    // LCP - Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // FID - First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        console.log('FID:', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });
    
    // CLS - Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      console.log('CLS:', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }
  
  static trackImageLoading(imageUrl) {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      console.log(`Image loaded in ${endTime - startTime}ms: ${imageUrl}`);
    };
  }
}
