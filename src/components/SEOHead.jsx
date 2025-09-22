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
