import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, cachedQuery, trackAnalyticsEvent, createRealtimeSubscription } from '../supabaseClient';

// Advanced analytics hook
export const useAdvancedAnalytics = () => {
  const [metrics, setMetrics] = useState({
    realTimeVisitors: 0,
    conversionRate: 0,
    leadQuality: 0,
    performanceScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await cachedQuery('dashboard_metrics', async () => {
          const { data } = await supabase
            .from('dashboard_metrics')
            .select('*')
            .single();
          return data;
        });

        setMetrics({
          realTimeVisitors: data?.sessions_24h || 0,
          conversionRate: data?.leads_30d > 0 ? (data.leads_30d / data.sessions_24h * 100) : 0,
          leadQuality: data?.avg_lead_score || 0,
          performanceScore: 95
        });
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return { metrics, loading };
};

// Customer journey tracking
export const useJourneyTracking = () => {
  const sessionId = useRef(null);

  useEffect(() => {
    // Generate session ID
    sessionId.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const trackJourneyStep = useCallback((stage, touchpoint, data = {}) => {
    if (!sessionId.current) return;

    const journeyData = {
      session_id: sessionId.current,
      journey_stage: stage,
      touchpoint: touchpoint,
      interaction_type: data.type || 'page_view',
      page_url: window.location.href,
      content_engaged: data.content || {},
      time_spent: data.duration || 0,
      created_at: new Date().toISOString()
    };

    // Track to analytics
    trackAnalyticsEvent('journey_step', journeyData);
  }, []);

  return { trackJourneyStep };
};

// A/B Testing hook
export const useAbTest = (testName) => {
  const [variant, setVariant] = useState('control');

  useEffect(() => {
    // Simple A/B test assignment
    const hash = btoa(testName + navigator.userAgent).slice(0, 10);
    const hashSum = hash.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    setVariant(hashSum % 2 === 0 ? 'control' : 'variant_a');
  }, [testName]);

  return { variant };
};

// Real-time notifications
export const useRealtimeNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Subscribe to lead updates
    const unsubscribe = createRealtimeSubscription('leads', (payload) => {
      if (payload.eventType === 'INSERT') {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          message: `New lead: ${payload.new.name}`,
          type: 'success',
          timestamp: new Date()
        }]);
      }
    });

    return unsubscribe;
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notifications, dismissNotification };
};

// Performance monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    if ('performance' in window && 'memory' in performance) {
      const updateMetrics = () => {
        setMetrics({
          memory: {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
          },
          navigation: performance.getEntriesByType('navigation')[0],
          resources: performance.getEntriesByType('resource').length
        });
      };

      updateMetrics();
      const interval = setInterval(updateMetrics, 30000); // Update every 30s
      
      return () => clearInterval(interval);
    }
  }, []);

  return metrics;
};
// Real-time notifications
export const useRealtimeNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info') => {
    const notification = {
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismissNotification(notification.id);
    }, 5000);
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => {
    const subscription = createRealtimeSubscription(
      'leads',
      (payload) => {
        if (payload.eventType === 'INSERT') {
          addNotification(`New lead: ${payload.new.name}`, 'success');
        }
      }
    );

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [addNotification]);

  return { notifications, dismissNotification, addNotification };
};
