import React from 'react';
import { Helmet } from 'react-helmet';

const SEOHead = ({ 
  title = "Studio37 Photography - Professional Photography Houston, TX",
  description = "Studio37 offers professional photography and content strategy services in Houston, Texas. Specializing in portraits, weddings, events, and commercial photography.",
  keywords = "photography, Houston photographer, professional photography, portrait photography, wedding photography, commercial photography, content strategy, Studio37",
  image = "https://www.studio37.cc/og-image.jpg",
  url = "https://www.studio37.cc",
  type = "website"
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Studio37 Photography" />
      <link rel="canonical" href={url} />
      
      {/* Local Business Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "http://schema.org",
          "@type": "LocalBusiness",
          "name": "Studio37 Photography",
          "description": description,
          "url": url,
          "telephone": "(832) 713-9944",
          "email": "sales@studio37.cc",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Houston",
            "addressRegion": "TX",
            "addressCountry": "US"
          },
          "priceRange": "$300-$5000",
          "openingHours": "Mo-Fr 09:00-18:00",
          "sameAs": [
            "https://instagram.com/studio37houston"
          ]
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;
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

      // Add preconnect links (remove HubSpot)
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

      // REMOVE HubSpot tracking - service is failing with 503 errors
    });

  }, [title, description, keywords, image, url]);

  return null;
};

export default SEOHead;
