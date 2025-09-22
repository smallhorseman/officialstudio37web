import { useState, useRef, useEffect, useCallback } from 'react';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = null,
  threshold = 0.1,
  onLoad = () => {},
  onError = () => {},
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef();
  const observerRef = useRef();

  // Optimized intersection observer
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // Use native lazy loading if supported
    if ('loading' in HTMLImageElement.prototype) {
      img.loading = 'lazy';
      setIsInView(true);
      return;
    }

    // Fallback to Intersection Observer
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observerRef.current?.unobserve(img);
            }
          });
        },
        {
          threshold,
          rootMargin: '50px'
        }
      );

      observerRef.current.observe(img);
    } else {
      // Fallback for older browsers
      setIsInView(true);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold]);

  // Optimized image loading with retry logic
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setError(false);
    onLoad();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setError(true);
    onError();
  }, [onError]);

  // Preload critical images
  const preloadImage = useCallback((imageSrc) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = imageSrc;
    document.head.appendChild(link);
  }, []);

  // Generate optimized Cloudinary URL
  const optimizeCloudinaryUrl = useCallback((url, options = {}) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    
    const {
      quality = 'auto:good',
      format = 'auto',
      width = 'auto:breakpoints',
      crop = 'scale',
      dpr = 'auto'
    } = options;
    
    const transformations = [
      `f_${format}`,
      `q_${quality}`,
      `w_${width}`,
      `c_${crop}`,
      `dpr_${dpr}`
    ].join(',');
    
    return url.replace('/upload/', `/upload/${transformations}/`);
  }, []);

  const optimizedSrc = optimizeCloudinaryUrl(src);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {!isLoaded && placeholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          {placeholder}
        </div>
      )}
      
      {/* Default loading skeleton */}
      {!isLoaded && !placeholder && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#F3E3C3] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={isInView ? optimizedSrc : undefined}
        alt={alt}
        className={`transition-all duration-500 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
        {...props}
      />

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-gray-400 text-sm">
          <div className="text-center p-4">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p>Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
