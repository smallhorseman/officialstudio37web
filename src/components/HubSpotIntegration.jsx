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
        console.log('HubSpot failed to load (503 error) - using fallback');
        // Set a flag that HubSpot failed to load
        window.hubSpotFailed = true;
      };
      
      document.head.appendChild(script);
      
      // Set a timeout to detect if HubSpot never loads
      setTimeout(() => {
        if (!window.hbspt) {
          console.log('HubSpot timeout - service may be down');
          window.hubSpotFailed = true;
        }
      }, 5000);
    }
  }, []);

  return null;
};

// Minimal tracking functions - fallback if HubSpot doesn't load
export const trackHubSpotEvent = (eventName, properties = {}) => {
  // Check if HubSpot failed to load
  if (window.hubSpotFailed) {
    console.log('HubSpot unavailable - tracking event locally:', eventName, properties);
    return;
  }
  
  if (typeof window !== 'undefined' && window._hsq) {
    try {
      window._hsq.push(['trackEvent', {
        id: eventName,
        properties: properties
      }]);
    } catch (error) {
      console.log('HubSpot tracking fallback:', eventName, properties);
    }
  } else {
    console.log('HubSpot not loaded - event:', eventName);
  }
};

export const identifyHubSpotVisitor = (email, properties = {}) => {
  // Check if HubSpot failed to load
  if (window.hubSpotFailed) {
    console.log('HubSpot unavailable - visitor identification local:', email, properties);
    return;
  }
  
  if (typeof window !== 'undefined' && window._hsq) {
    try {
      window._hsq.push(['identify', {
        email: email,
        ...properties
      }]);
    } catch (error) {
      console.log('HubSpot identify fallback:', email, properties);
    }
  } else {
    console.log('HubSpot not loaded - identify:', email);
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
