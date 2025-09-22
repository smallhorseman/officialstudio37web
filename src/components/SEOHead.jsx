import { useEffect, useRef } from 'react';

const SEOHead = ({ 
  title = "Studio37 - Professional Photography & Content Strategy in Houston, TX",
  description = "Vintage heart, modern vision. Full-service photography and content strategy for brands ready to conquer the world from Houston, TX.",
  keywords = "photography Houston, professional photographer Houston, content strategy, portraits, weddings, events",
  image = "https://www.studio37.cc/og-image.jpg",
  url = "https://www.studio37.cc"
}) => {
  const previousValues = useRef({});

  useEffect(() => {
    // Prevent unnecessary DOM updates
    const hasChanged = (key, value) => {
      if (previousValues.current[key] !== value) {
        previousValues.current[key] = value;
        return true;
      }
      return false;
    };

    // Update document title only if changed
    if (hasChanged('title', title)) {
      document.title = title;
    }

    // Batch DOM updates for better performance
    const updateMetaTag = (property, content, isProperty = false) => {
      if (!hasChanged(`${property}_${isProperty}`, content)) return;
      
      const attribute = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, property);
        document.head.appendChild(tag);
      }
      
      tag.setAttribute('content', content);
    };

    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      // Basic meta tags
      updateMetaTag('description', description);
      updateMetaTag('keywords', keywords);
      updateMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
      updateMetaTag('theme-color', '#F3E3C3');
      updateMetaTag('color-scheme', 'dark light');
      
      // Open Graph tags
      updateMetaTag('og:title', title, true);
      updateMetaTag('og:description', description, true);
      updateMetaTag('og:image', image, true);
      updateMetaTag('og:image:width', '1200', true);
      updateMetaTag('og:image:height', '630', true);
      updateMetaTag('og:image:alt', 'Studio37 Professional Photography Houston TX', true);
      updateMetaTag('og:url', url, true);
      updateMetaTag('og:type', 'website', true);
      updateMetaTag('og:site_name', 'Studio37', true);
      updateMetaTag('og:locale', 'en_US', true);
      
      // Twitter Card tags
      updateMetaTag('twitter:card', 'summary_large_image');
      updateMetaTag('twitter:title', title);
      updateMetaTag('twitter:description', description);
      updateMetaTag('twitter:image', image);
      updateMetaTag('twitter:image:alt', 'Studio37 Professional Photography Houston TX');
      updateMetaTag('twitter:site', '@studio37houston');
      updateMetaTag('twitter:creator', '@studio37houston');

      // Update structured data only if content changed
      const schemaKey = `${title}_${description}_${url}`;
      if (hasChanged('schema', schemaKey)) {
        const localBusinessSchema = {
          "@context": "https://schema.org",
          "@type": ["LocalBusiness", "ProfessionalService", "Photographer"],
          "name": "Studio37",
          "alternateName": "Studio 37 Photography",
          "description": description,
          "telephone": "+1-832-713-9944",
          "email": "sales@studio37.cc",
          "url": url,
          "logo": "https://www.studio37.cc/logo.png",
          "image": image,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Houston",
            "addressRegion": "TX",
            "addressCountry": "US",
            "areaServed": {
              "@type": "GeoCircle",
              "geoMidpoint": {
                "@type": "GeoCoordinates", 
                "latitude": "29.7604",
                "longitude": "-95.3698"
              },
              "geoRadius": "80467"
            }
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "29.7604",
            "longitude": "-95.3698"
          },
          "openingHours": ["Mo-Fr 09:00-18:00", "Sa 10:00-16:00"],
          "priceRange": "$75-$2000+",
          "paymentAccepted": ["Cash", "Credit Card", "PayPal", "Venmo"],
          "currenciesAccepted": "USD",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "47"
          },
          "sameAs": [
            "https://www.instagram.com/studio37houston",
            "https://www.facebook.com/studio37houston",
            "https://www.linkedin.com/company/studio37houston"
          ]
        };

        let structuredDataScript = document.getElementById('structured-data');
        if (!structuredDataScript) {
          structuredDataScript = document.createElement('script');
          structuredDataScript.id = 'structured-data';
          structuredDataScript.type = 'application/ld+json';
          document.head.appendChild(structuredDataScript);
        }
        structuredDataScript.textContent = JSON.stringify(localBusinessSchema);
      }

      // Update canonical URL only if changed
      if (hasChanged('canonical', url)) {
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
          canonicalLink = document.createElement('link');
          canonicalLink.rel = 'canonical';
          document.head.appendChild(canonicalLink);
        }
        canonicalLink.href = url;
      }

      // Add HubSpot preconnect links only once
      if (!hasChanged('hubspot-preconnects', 'added')) {
        const hubspotPreconnectLinks = [
          'https://js-na2.hs-scripts.com',
          'https://forms.hubspot.com',
          'https://api.hubapi.com'
        ];

        hubspotPreconnectLinks.forEach(href => {
          if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = href;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
          }
        });
      }

      // Add preconnect links only once
      if (!hasChanged('preconnects', 'added')) {
        const preconnectLinks = [
          'https://fonts.googleapis.com',
          'https://fonts.gstatic.com',
          'https://res.cloudinary.com'
        ];

        preconnectLinks.forEach(href => {
          if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = href;
            if (href.includes('gstatic')) link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
          }
        });
      }

      // Add HubSpot tracking attributes for better integration
      if (!hasChanged('hubspot-attrs', 'added')) {
        document.body.setAttribute('data-hubspot-portal', '242993708');
        document.body.setAttribute('data-hubspot-enabled', 'true');
      }
    });

  }, [title, description, keywords, image, url]);

  return null;
};

export default SEOHead;
