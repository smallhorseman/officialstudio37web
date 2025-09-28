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
  const images = {};
  
  for (const [key, width] of Object.entries(breakpoints)) {
    images[key] = optimizeCloudinaryUrl(baseUrl, { width });
  }
  
  return images;
};

export const generateSrcSet = (baseUrl, sizes = [400, 800, 1200, 1600]) => {
  return sizes
    .map(size => `${optimizeCloudinaryUrl(baseUrl, { width: size })} ${size}w`)
    .join(', ');
};

export const lazyLoadImage = (imageElement) => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    
    imageObserver.observe(imageElement);
  }
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
export const getOptimalFormat = () => {
  if (supportsWebP()) return 'webp';
  return 'auto'; // Cloudinary auto format
};
