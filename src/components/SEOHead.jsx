import React from 'react';
import { Helmet } from 'react-helmet';

const SEOHead = ({ 
  title = "Studio37 - Professional Photography Houston TX",
  description = "Professional photography and content strategy in Houston, TX. Vintage-inspired, modern approach for portraits, weddings, commercial, and content creation.",
  keywords = "photography, Houston, TX, professional photographer, portraits, weddings, commercial photography, content strategy",
  image = "/og-image.jpg",
  url = "https://www.studio37.cc"
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={url} />
      
      {/* JSON-LD Schema */}
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
