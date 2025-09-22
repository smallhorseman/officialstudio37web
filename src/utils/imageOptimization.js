// Advanced image optimization utilities for Studio37

export const optimizeCloudinaryUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  const {
    quality = 'auto:good',
    format = 'auto',
    width = 'auto:breakpoints',
    height,
    crop = 'scale',
    fetchFormat = 'auto',
    dpr = 'auto',
    gravity = 'auto',
    blur,
    sharpen,
  } = options;
  
  // Build transformation string with advanced optimizations
  const transformations = [
    `f_${format}`,
    `q_${quality}`,
    width && `w_${width}`,
    height && `h_${height}`,
    `c_${crop}`,
    `dpr_${dpr}`,
    gravity && `g_${gravity}`,
    blur && `blur:${blur}`,
    sharpen && `sharpen:${sharpen}`,
  ].filter(Boolean).join(',');
  
  // Insert transformations after /upload/
  return url.replace('/upload/', `/upload/${transformations}/`);
};

export const generateResponsiveImages = (baseUrl, breakpoints = {
  mobile: 400,
  tablet: 800,
  desktop: 1200,
  large: 1600
}) => {
  if (!baseUrl || !baseUrl.includes('cloudinary.com')) return { src: baseUrl, srcSet: '' };
  
  const srcSet = Object.entries(breakpoints)
    .map(([device, width]) => {
      const optimizedUrl = optimizeCloudinaryUrl(baseUrl, { 
        width: width,
        quality: device === 'mobile' ? 'auto:low' : 'auto:good'
      });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
    
  return {
    src: optimizeCloudinaryUrl(baseUrl, { width: 800 }),
    srcSet,
    sizes: '(max-width: 480px) 400px, (max-width: 768px) 800px, (max-width: 1024px) 1200px, 1600px'
  };
};

export const preloadCriticalImages = (urls) => {
  if (!Array.isArray(urls)) return;
  
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizeCloudinaryUrl(url, { width: 800, quality: 'auto:low' });
    link.crossOrigin = 'anonymous';
    
    // Add to document head if not already present
    if (!document.querySelector(`link[href="${link.href}"]`)) {
      document.head.appendChild(link);
    }
  });
};

// Advanced lazy loading with Intersection Observer
export class ImageLazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px 0px',
      threshold: 0.1,
      ...options
    };
    
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.options
    );
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;
        const srcSet = img.dataset.srcset;
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
        }
        
        if (srcSet) {
          img.srcSet = srcSet;
          img.removeAttribute('data-srcset');
        }
        
        img.classList.add('loaded');
        this.observer.unobserve(img);
      }
    });
  }
  
  observe(element) {
    this.observer.observe(element);
  }
  
  disconnect() {
    this.observer.disconnect();
  }
}

// Image compression for uploads
export const compressImage = (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// WebP detection and fallback
export const supportsWebP = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('webp') > 0;
};

export const getOptimalFormat = () => {
  if (supportsWebP()) return 'webp';
  return 'auto'; // Cloudinary auto format
};
