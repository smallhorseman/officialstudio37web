import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEOHead = ({ 
  title = "Studio37 - Professional Photography & Content Strategy in Houston, TX",
  description = "Vintage heart, modern vision. Full-service photography and content strategy for brands ready to conquer the world from Houston, TX.",
  keywords = "photography, Houston, content strategy, professional photographer, portraits, weddings, events",
  image = "https://www.studio37.cc/og-image.jpg",
  type = "website"
}) => {
  const location = useLocation();
  const canonicalUrl = `https://www.studio37.cc${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: 'Studio37' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: 'Studio37' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ];

    metaTags.forEach(({ name, property, content }) => {
      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
      let element = document.querySelector(selector);
      
      if (!element) {
        element = document.createElement('meta');
        if (name) element.setAttribute('name', name);
        if (property) element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    });

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // Add structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Studio37",
      "description": "Professional photography and content strategy services in Houston, TX",
      "url": "https://www.studio37.cc",
      "telephone": "(832) 713-9944",
      "email": "sales@studio37.cc",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Houston",
        "addressRegion": "TX",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 29.7604,
        "longitude": -95.3698
      },
      "serviceArea": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": 29.7604,
          "longitude": -95.3698
        },
        "geoRadius": "80467" // 50 miles in meters
      },
      "priceRange": "$75-$2000+",
      "image": image,
      "sameAs": [
        "https://www.instagram.com/studio37houston",
        "https://www.facebook.com/studio37houston"
      ]
    };

    let jsonLd = document.querySelector('#structured-data');
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.id = 'structured-data';
      jsonLd.type = 'application/ld+json';
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify(structuredData);

  }, [title, description, keywords, image, canonicalUrl, type]);

  return null;
};

export default SEOHead;
