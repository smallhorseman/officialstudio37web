import { useEffect } from 'react';

const SEOHead = ({ 
  title = "Studio37 - Professional Photography & Content Strategy in Houston, TX",
  description = "Vintage heart, modern vision. Full-service photography and content strategy for brands ready to conquer the world from Houston, TX.",
  keywords = "photography Houston, professional photographer Houston, content strategy, portraits, weddings, events",
  image = "https://www.studio37.cc/og-image.jpg",
  url = "https://www.studio37.cc"
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Function to update or create meta tag
    const updateMetaTag = (property, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, property);
        document.head.appendChild(tag);
      }
      
      tag.setAttribute('content', content);
    };

    // ACCESSIBILITY IMPROVEMENTS
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
    updateMetaTag('theme-color', '#F3E3C3');
    updateMetaTag('color-scheme', 'dark light');
    
    // IMPROVED OPEN GRAPH
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
    
    // ENHANCED TWITTER CARDS
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:image:alt', 'Studio37 Professional Photography Houston TX');
    updateMetaTag('twitter:site', '@studio37houston');
    updateMetaTag('twitter:creator', '@studio37houston');
    
    // ENHANCED LOCAL BUSINESS SCHEMA
    const localBusinessSchema = {
      "@context": "https://schema.org",
      "@type": ["LocalBusiness", "ProfessionalService", "Photographer"],
      "name": "Studio37",
      "alternateName": "Studio 37 Photography",
      "description": description,
      "telephone": "+1-832-713-9944",
      "email": "sales@studio37.cc",
      "url": "https://www.studio37.cc",
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
      "serviceArea": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": "29.7604", 
          "longitude": "-95.3698"
        },
        "geoRadius": "80467"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Photography Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Wedding Photography",
              "description": "Professional wedding photography services"
            }
          },
          {
            "@type": "Offer", 
            "itemOffered": {
              "@type": "Service",
              "name": "Portrait Photography",
              "description": "Individual and family portrait sessions"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service", 
              "name": "Commercial Photography",
              "description": "Business and brand photography services"
            }
          }
        ]
      },
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

    // Update structured data
    let structuredDataScript = document.getElementById('structured-data');
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.id = 'structured-data';
      structuredDataScript.type = 'application/ld+json';
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(localBusinessSchema);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = url;

    // ADD PRECONNECT FOR PERFORMANCE
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

  }, [title, description, keywords, image, url]);

  return null;
};

export default SEOHead;
