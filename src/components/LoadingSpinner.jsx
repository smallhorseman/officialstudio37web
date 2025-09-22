import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-black ${sizeClasses[size]}`} />
      {text && (
        <p className="mt-3 text-sm text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Gallery loading skeleton
export const GalleryLoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-gray-200 animate-pulse rounded-lg aspect-square" />
    ))}
  </div>
);

// Contact form loading
export const FormLoadingSpinner = () => (
  <div className="flex items-center justify-center py-2">
    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
    <span className="ml-2 text-sm">Sending...</span>
  </div>
);

export default LoadingSpinner;
