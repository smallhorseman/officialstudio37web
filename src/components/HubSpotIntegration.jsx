import { useEffect } from 'react';

// Minimal HubSpot integration - ONLY for virtual assistant, not replacing existing CRM/CMS
const HubSpotIntegration = () => {
  useEffect(() => {
    // Only load HubSpot for chatflow/virtual assistant
    if (typeof window !== 'undefined' && !window.hbspt) {
      const script = document.createElement('script');
      script.src = 'https://js-na2.hs-scripts.com/242993708.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('HubSpot loaded for virtual assistant');
      };
      
      script.onerror = () => {
        console.log('HubSpot failed to load - using fallback');
      };
      
      document.head.appendChild(script);
    }
  }, []);

  return null;
};

// Minimal tracking functions - fallback if HubSpot doesn't load
export const trackHubSpotEvent = (eventName, properties = {}) => {
  if (typeof window !== 'undefined' && window._hsq) {
    try {
      window._hsq.push(['trackEvent', {
        id: eventName,
        properties: properties
      }]);
    } catch (error) {
      console.log('HubSpot tracking fallback:', eventName, properties);
    }
  }
};

export const identifyHubSpotVisitor = (email, properties = {}) => {
  if (typeof window !== 'undefined' && window._hsq) {
    try {
      window._hsq.push(['identify', {
        email: email,
        ...properties
      }]);
    } catch (error) {
      console.log('HubSpot identify fallback:', email, properties);
    }
  }
};

export default HubSpotIntegration;

// Track custom events
export const trackHubSpotEvent = (eventName, properties = {}) => {
  if (window.hbspt && window.hbspt.analytics) {
    try {
      window.hbspt.analytics.trackEvent(eventName, properties);
    } catch (error) {
      console.warn('HubSpot event tracking failed:', error);
    }
  } else {
    console.warn('HubSpot analytics not loaded');
  }
};

// Identify visitors
export const identifyHubSpotVisitor = (email, properties = {}) => {
  if (window.hbspt && window.hbspt.analytics) {
    try {
      window.hbspt.analytics.identify(email, properties);
    } catch (error) {
      console.warn('HubSpot visitor identification failed:', error);
    }
  } else {
    console.warn('HubSpot analytics not loaded');
  }
};

export default HubSpotIntegration;
