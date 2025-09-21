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

    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:site_name', 'Studio37', true);
    
    // Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    
    // Local business schema
    const localBusinessSchema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Studio37",
      "description": description,
      "telephone": "+1-832-713-9944",
      "email": "sales@studio37.cc",
      "url": "https://www.studio37.cc",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Houston",
        "addressRegion": "TX",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "29.7604",
        "longitude": "-95.3698"
      },
      "openingHours": "Mo-Fr 09:00-18:00",
      "priceRange": "$75-$2000+",
      "serviceArea": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": "29.7604",
          "longitude": "-95.3698"
        },
        "geoRadius": "80467"
      },
      "sameAs": [
        "https://www.instagram.com/studio37houston",
        "https://www.facebook.com/studio37houston"
      ]
    };

    // Update or create structured data
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

  }, [title, description, keywords, image, url]);

  return null;
};

export default SEOHead;
  return null;
};

export default SEOHead;
