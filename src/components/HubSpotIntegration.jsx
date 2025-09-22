import { useEffect, useRef } from 'react';

const HubSpotIntegration = () => {
  const hubspotLoaded = useRef(false);

  useEffect(() => {
    // Ensure HubSpot is only loaded once
    if (hubspotLoaded.current) return;
    
    const checkHubSpot = () => {
      if (window.hbspt) {
        hubspotLoaded.current = true;
        console.log('HubSpot loaded successfully');
        
        // Initialize HubSpot tracking
        if (window.hbspt.analytics) {
          window.hbspt.analytics.trackPageView();
        }
      } else {
        // Retry after a short delay
        setTimeout(checkHubSpot, 500);
      }
    };

    // Start checking for HubSpot
    checkHubSpot();
  }, []);

  return null;
};

// HubSpot Form Component
export const HubSpotForm = ({ 
  formId, 
  portalId = '242993708', 
  target = 'hubspot-form',
  onFormSubmit,
  className = ''
}) => {
  const formRef = useRef(null);

  useEffect(() => {
    const loadForm = () => {
      if (window.hbspt && window.hbspt.forms) {
        try {
          window.hbspt.forms.create({
            portalId: portalId,
            formId: formId,
            target: `#${target}`,
            onFormSubmit: (form) => {
              console.log('HubSpot form submitted', form);
              onFormSubmit?.(form);
            },
            onFormReady: (form) => {
              console.log('HubSpot form ready', form);
            }
          });
        } catch (error) {
          console.error('Error creating HubSpot form:', error);
        }
      } else {
        // Retry if HubSpot not loaded yet
        setTimeout(loadForm, 1000);
      }
    };

    if (formId) {
      loadForm();
    }
  }, [formId, portalId, target, onFormSubmit]);

  return (
    <div 
      id={target} 
      className={className}
      ref={formRef}
    />
  );
};

// Track custom events
export const trackHubSpotEvent = (eventName, properties = {}) => {
  if (window.hbspt && window.hbspt.analytics) {
    window.hbspt.analytics.trackEvent(eventName, properties);
  } else {
    console.warn('HubSpot analytics not loaded');
  }
};

// Identify visitors
export const identifyHubSpotVisitor = (email, properties = {}) => {
  if (window.hbspt && window.hbspt.analytics) {
    window.hbspt.analytics.identify(email, properties);
  } else {
    console.warn('HubSpot analytics not loaded');
  }
};

export default HubSpotIntegration;
