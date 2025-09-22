import React, { useState, useRef, useEffect } from 'react';
import { optimizeCloudinaryUrl, generateResponsiveImages, ImageLazyLoader } from '../utils/imageOptimization';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  priority = false,
  aspectRatio = 'auto',
  fallbackSrc = '/images/placeholder.jpg',
  lazy = true,
  quality = 'auto:good',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  const aspectRatioClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    wide: 'aspect-[16/9]',
    auto: ''
  };

  // Generate responsive images for Cloudinary
  const responsiveImages = src ? generateResponsiveImages(src) : null;

  useEffect(() => {
    if (priority || !lazy || !src) {
      // Load immediately for priority or non-lazy images
      setCurrentSrc(responsiveImages?.src || src);
      return;
    }

    // Set up lazy loading
    if (!observerRef.current) {
      observerRef.current = new ImageLazyLoader({
        rootMargin: '100px 0px',
        threshold: 0.1
      });
    }

    const img = imgRef.current;
    if (img && observerRef.current) {
      // Set data attributes for lazy loading
      img.dataset.src = responsiveImages?.src || src;
      if (responsiveImages?.srcSet) {
        img.dataset.srcset = responsiveImages.srcSet;
      }
      
      observerRef.current.observe(img);
    }

    return () => {
      if (observerRef.current && img) {
        observerRef.current.observer.unobserve(img);
      }
    };
  }, [src, priority, lazy, responsiveImages]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };
  
  const handleError = () => {
    setIsLoading(false);
    if (currentSrc !== fallbackSrc && fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
  };

  // Enhanced loading skeleton with Studio37 branding
  const LoadingSkeleton = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-[#262626] via-[#1a1a1a] to-[#262626] animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#F3E3C3]/30 border-t-[#F3E3C3] rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-xs text-[#F3E3C3]/40">Loading...</span>
        </div>
      </div>
    </div>
  );

  // Enhanced error fallback
  const ErrorFallback = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#262626] to-[#1a1a1a]">
      <div className="text-center p-4">
        <svg className="w-12 h-12 text-[#F3E3C3]/30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-xs text-[#F3E3C3]/40">Image unavailable</span>
      </div>
    </div>
  );

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-[#262626] to-[#1a1a1a] ${aspectRatioClasses[aspectRatio]} ${className}`}>
      {isLoading && !hasError && <LoadingSkeleton />}
      
      {hasError ? (
        <ErrorFallback />
      ) : (
        <img
          ref={imgRef}
          src={priority || !lazy ? (responsiveImages?.src || currentSrc) : undefined}
          srcSet={priority || !lazy ? responsiveImages?.srcSet : undefined}
          sizes={responsiveImages?.sizes}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
};

// Specialized image components for different use cases
export const HeroImage = ({ src, alt, ...props }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    priority={true}
    aspectRatio="wide"
    className="w-full h-[60vh] md:h-[80vh]"
    quality="auto:best"
    lazy={false}
    {...props}
  />
);

export const GalleryImage = ({ src, alt, onClick, ...props }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    aspectRatio="square"
    className="cursor-pointer hover:opacity-90 transition-all duration-300 hover:scale-105"
    onClick={onClick}
    quality="auto:good"
    {...props}
  />
);

export const ThumbnailImage = ({ src, alt, ...props }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    aspectRatio="square"
    className="w-16 h-16"
    quality="auto:low"
    {...props}
  />
);

export const PortfolioImage = ({ src, alt, ...props }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    aspectRatio="auto"
    className="w-full"
    quality="auto:good"
    {...props}
  />
);

export default OptimizedImage;
