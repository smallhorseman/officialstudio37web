import { useEffect, useCallback } from 'react';

// Performance monitoring hook
export const usePerformance = () => {
  // Measure Core Web Vitals
  const measureWebVitals = useCallback(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    const observeLCP = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('LCP:', lastEntry.startTime);
          
          // Track in analytics
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              name: 'LCP',
              value: Math.round(lastEntry.startTime),
              event_category: 'performance'
            });
          }
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      }
    };

    // First Input Delay (FID)
    const observeFID = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            console.log('FID:', entry.processingStart - entry.startTime);
            
            if (window.gtag) {
              window.gtag('event', 'web_vitals', {
                name: 'FID',
                value: Math.round(entry.processingStart - entry.startTime),
                event_category: 'performance'
              });
            }
          });
        });
        
        observer.observe({ entryTypes: ['first-input'] });
      }
    };

    // Cumulative Layout Shift (CLS)
    const observeCLS = () => {
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        let sessionValue = 0;
        let sessionEntries = [];

        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

              if (sessionValue &&
                  entry.startTime - lastSessionEntry.startTime < 1000 &&
                  entry.startTime - firstSessionEntry.startTime < 5000) {
                sessionValue += entry.value;
                sessionEntries.push(entry);
              } else {
                sessionValue = entry.value;
                sessionEntries = [entry];
              }

              if (sessionValue > clsValue) {
                clsValue = sessionValue;
                console.log('CLS:', clsValue);
                
                if (window.gtag) {
                  window.gtag('event', 'web_vitals', {
                    name: 'CLS',
                    value: Math.round(clsValue * 1000),
                    event_category: 'performance'
                  });
                }
              }
            }
          });
        });

        observer.observe({ entryTypes: ['layout-shift'] });
      }
    };

    // Initialize observers
    observeLCP();
    observeFID();
    observeCLS();
  }, []);

  // Measure component render time
  const measureComponentRender = useCallback((componentName, startTime) => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    console.log(`${componentName} render time:`, renderTime);
    
    if (window.gtag) {
      window.gtag('event', 'component_render', {
        component_name: componentName,
        render_time: Math.round(renderTime),
        event_category: 'performance'
      });
    }
  }, []);

  // Memory usage monitoring
  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = performance.memory;
      console.log('Memory usage:', {
        used: Math.round(memory.usedJSHeapSize / 1048576),
        total: Math.round(memory.totalJSHeapSize / 1048576),
        limit: Math.round(memory.jsHeapSizeLimit / 1048576)
      });
    }
  }, []);

  useEffect(() => {
    measureWebVitals();
    
    // Measure memory every 30 seconds in development
    if (process.env.NODE_ENV === 'development') {
      const memoryInterval = setInterval(measureMemoryUsage, 30000);
      return () => clearInterval(memoryInterval);
    }
  }, [measureWebVitals, measureMemoryUsage]);

  return {
    measureComponentRender,
    measureMemoryUsage
  };
};
