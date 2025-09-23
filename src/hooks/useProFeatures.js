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
          performanceScore: 95 // Calculate based on your metrics
        });
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, []);

  return { metrics, loading };
};

// A/B Testing hook
export const useAbTest = (testName) => {
  const [variant, setVariant] = useState('control');
  const [loading, setLoading] = useState(true);
  const sessionId = useRef(null);

  useEffect(() => {
    const assignVariant = async () => {
      try {
        // Get or create session ID
        if (!sessionId.current) {
          sessionId.current = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        }

        // Check existing assignment
        const { data: existing } = await supabase
          .from('ab_test_assignments')
          .select('variant')
          .eq('session_id', sessionId.current)
          .eq('test_id', testName)
          .single();

        if (existing) {
          setVariant(existing.variant);
        } else {
          // Get test configuration
          const { data: test } = await supabase
            .from('ab_tests')
            .select('*')
            .eq('test_name', testName)
            .eq('status', 'active')
            .single();

          if (test) {
            // Assign variant based on allocation
            const rand = Math.random();
            const allocation = test.allocation;
            let assignedVariant = 'control';
            
            let cumulative = 0;
            for (const [variantName, probability] of Object.entries(allocation)) {
              cumulative += probability;
              if (rand <= cumulative) {
                assignedVariant = variantName;
                break;
              }
            }

            // Save assignment
            await supabase.from('ab_test_assignments').insert({
              test_id: test.id,
              session_id: sessionId.current,
              variant: assignedVariant
            });

            setVariant(assignedVariant);
          }
        }
      } catch (error) {
        console.error('A/B test assignment failed:', error);
      } finally {
        setLoading(false);
      }
    };

    assignVariant();
  }, [testName]);

  const trackConversion = useCallback(async (value = null) => {
    try {
      await supabase
        .from('ab_test_assignments')
        .update({ 
          converted: true, 
          conversion_value: value 
        })
        .eq('session_id', sessionId.current)
        .eq('variant', variant);

      trackAnalyticsEvent('ab_test_conversion', {
        test_name: testName,
        variant,
        conversion_value: value
      });
    } catch (error) {
      console.error('Failed to track A/B test conversion:', error);
    }
  }, [testName, variant]);

  return { variant, loading, trackConversion };
};

// Customer journey tracking
export const useJourneyTracking = () => {
  const trackJourneyStep = useCallback((stage, touchpoint, data) => {
    const journeyData = {
      stage,
      touchpoint,
      data,
      timestamp: new Date().toISOString(),
      sessionId: sessionStorage.getItem('sessionId') || 'anonymous'
    };
    
    // Store in localStorage for offline tracking
    const journeyHistory = JSON.parse(localStorage.getItem('journeyHistory') || '[]');
    journeyHistory.push(journeyData);
    
    // Keep only last 50 events
    if (journeyHistory.length > 50) {
      journeyHistory.splice(0, journeyHistory.length - 50);
    }
    
    localStorage.setItem('journeyHistory', JSON.stringify(journeyHistory));
    
    console.log('Journey Step:', journeyData);
  }, []);

  return { trackJourneyStep };
};

// Real-time notifications
export const useRealtimeNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismissNotification(notification.id);
    }, 5000);
  }, [dismissNotification]);

  useEffect(() => {
    const subscription = createRealtimeSubscription(
      'leads',
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [...prev, {
            id: Date.now(),
            type: 'new_lead',
            message: `New lead: ${payload.new.name}`,
            data: payload.new,
            timestamp: new Date()
          }]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { notifications, dismissNotification, addNotification };
};
