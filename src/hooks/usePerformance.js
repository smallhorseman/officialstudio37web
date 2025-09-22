import { useEffect, useRef } from 'react';

export const usePerformanceMonitor = () => {
  const metricsRef = useRef({});

  useEffect(() => {
    // Web Vitals tracking
    const trackWebVitals = () => {
      // FCP - First Contentful Paint
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            metricsRef.current.fcp = entry.startTime;
            console.log('🎨 FCP:', entry.startTime + 'ms');
          }
        });
      });

      observer.observe({ entryTypes: ['paint'] });

      // LCP - Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metricsRef.current.lcp = lastEntry.startTime;
        console.log('🖼️ LCP:', lastEntry.startTime + 'ms');
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // CLS - Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        metricsRef.current.cls = clsValue;
        console.log('📐 CLS:', clsValue);
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });

      return () => {
        observer.disconnect();
        lcpObserver.disconnect();
        clsObserver.disconnect();
      };
    };

    // Memory usage tracking
    const trackMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = performance.memory;
        metricsRef.current.memory = {
          used: Math.round(memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(memory.totalJSHeapSize / 1048576), // MB
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
        };
        console.log('💾 Memory:', metricsRef.current.memory);
      }
    };

    // Bundle size tracking
    const trackBundleSize = () => {
      const resources = performance.getEntriesByType('resource');
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const cssResources = resources.filter(r => r.name.includes('.css'));
      
      metricsRef.current.bundleSize = {
        js: jsResources.reduce((total, r) => total + (r.transferSize || 0), 0),
        css: cssResources.reduce((total, r) => total + (r.transferSize || 0), 0)
      };
      
      console.log('📦 Bundle Size:', metricsRef.current.bundleSize);
    };

    const cleanup = trackWebVitals();
    trackMemoryUsage();
    trackBundleSize();

    // Track these every 30 seconds
    const interval = setInterval(() => {
      trackMemoryUsage();
    }, 30000);

    return () => {
      cleanup?.();
      clearInterval(interval);
    };
  }, []);

  return metricsRef.current;
};

// Performance budget warnings
export const usePerformanceBudget = (budgets = {
  fcp: 1800, // 1.8s
  lcp: 2500, // 2.5s
  cls: 0.1,  // 0.1
  jsSize: 500000, // 500KB
  cssSize: 100000  // 100KB
}) => {
  const metrics = usePerformanceMonitor();
  
  useEffect(() => {
    const checkBudgets = () => {
      Object.entries(budgets).forEach(([metric, budget]) => {
        const actual = metrics[metric] || (metrics.bundleSize && metrics.bundleSize[metric.replace('Size', '')]);
        
        if (actual > budget) {
          console.warn(`⚠️ Performance Budget Exceeded: ${metric}`, {
            actual,
            budget,
            overage: actual - budget
          });
        }
      });
    };

    if (Object.keys(metrics).length > 0) {
      checkBudgets();
    }
  }, [metrics, budgets]);

  return metrics;
};
