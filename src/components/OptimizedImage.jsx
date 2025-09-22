import React, { useState } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  priority = false,
  aspectRatio = 'auto',
  fallbackSrc = '/images/placeholder.jpg'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = () => setIsLoading(false);
  
  const handleError = () => {
    setIsLoading(false);
    if (currentSrc !== fallbackSrc && fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    auto: ''
  };

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${aspectRatioClasses[aspectRatio]} ${className}`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      )}
      
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center p-4">
            <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-400">Image unavailable</span>
          </div>
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
    </div>
  );
};

export const GalleryImage = ({ src, alt, onClick, ...props }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    aspectRatio="square"
    className="cursor-pointer hover:opacity-90 transition-opacity"
    onClick={onClick}
    {...props}
  />
);

export const HeroImage = ({ src, alt, ...props }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    priority={true}
    aspectRatio="landscape"
    className="w-full"
    {...props}
  />
);

export default OptimizedImage;
        />
      )}
    </div>
  );
};

// Gallery optimized version
export const GalleryImage = ({ src, alt, onClick, ...props }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    aspectRatio="square"
    className="cursor-pointer hover:opacity-90 transition-opacity"
    onClick={onClick}
    {...props}
  />
);

// Hero image version
export const HeroImage = ({ src, alt, ...props }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    priority={true}
    aspectRatio="landscape"
    className="w-full"
    {...props}
  />
);

export default OptimizedImage;
