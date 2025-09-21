// Image optimization utilities

export const optimizeCloudinaryUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  const {
    quality = 'auto:good',
    format = 'auto',
    width = 'auto:breakpoints',
    crop = 'scale',
    fetchFormat = 'auto',
    dpr = 'auto'
  } = options;
  
  // Build transformation string
  const transformations = [
    `f_${format}`,
    `q_${quality}`,
    `w_${width}`,
    `c_${crop}`,
    `dpr_${dpr}`
  ].join(',');
  
  // Insert transformations after /upload/
  return url.replace('/upload/', `/upload/${transformations}/`);
};

export const generateSrcSet = (baseUrl, sizes = [400, 800, 1200, 1600]) => {
  if (!baseUrl || !baseUrl.includes('cloudinary.com')) return '';
  
  return sizes
    .map(size => {
      const optimizedUrl = optimizeCloudinaryUrl(baseUrl, { width: size });
      return `${optimizedUrl} ${size}w`;
    })
    .join(', ');
};

export const preloadCriticalImages = (urls) => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizeCloudinaryUrl(url, { width: 800, quality: 'auto:low' });
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

export const lazyLoadImages = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          if (src) {
            img.src = optimizeCloudinaryUrl(src);
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
};
