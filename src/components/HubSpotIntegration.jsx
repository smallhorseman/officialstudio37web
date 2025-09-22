import { useEffect } from 'react';

// Disabled HubSpot integration due to loading issues
// Using Supabase-based CRM instead
const HubSpotIntegration = () => {
  useEffect(() => {
    console.log('HubSpot integration disabled - using Supabase CRM');
  }, []);

  return null;
};

// No-op tracking functions
export const trackHubSpotEvent = (eventName, properties = {}) => {
  console.log('HubSpot tracking disabled - event:', eventName, properties);
};

export const identifyHubSpotVisitor = (email, properties = {}) => {
  console.log('HubSpot identify disabled - visitor:', email, properties);
};

export default HubSpotIntegration;

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
