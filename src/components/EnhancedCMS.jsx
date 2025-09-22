import React, { useState, useMemo, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import CmsSection from './CmsSection';

const OptimizedImage = ({ src, alt, className, loading = "lazy", onError, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  const handleImageError = useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setError(false);
      setLoaded(false);
      // Retry with exponential backoff
      setTimeout(() => {
        const img = new Image();
        img.onload = () => setLoaded(true);
        img.onerror = () => setError(true);
        img.src = src;
      }, Math.pow(2, retryCount) * 1000);
    } else {
      setError(true);
      onError?.(new Error('Image failed to load after retries'));
    }
  }, [retryCount, src, onError, maxRetries]);

  // Add image optimization for Cloudinary URLs
  const optimizeImageUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    
    // Add auto optimization parameters
    const optimizedUrl = url.replace(
      '/upload/',
      '/upload/f_auto,q_auto:good,w_auto:breakpoints,c_scale/'
    );
    return optimizedUrl;
  };

  const optimizedSrc = optimizeImageUrl(src);

  return (
    <div className={`relative ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse rounded flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#F3E3C3] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={optimizedSrc}
        alt={alt}
        className={`${className} transition-all duration-500 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onLoad={() => setLoaded(true)}
        onError={handleImageError}
        loading={loading}
        decoding="async"
        crossOrigin="anonymous"
        {...props}
      />
      {error && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-gray-400 text-sm rounded">
          <div className="text-center p-4">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p>Image unavailable</p>
            {retryCount > 0 && <p className="text-xs mt-1">Retried {retryCount}x</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export function EnhancedCmsSection({ 
  portfolioImages, 
  addPortfolioImage, 
  deletePortfolioImage, 
  updatePortfolioImageOrder 
}) {
  const [view, setView] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [newImage, setNewImage] = useState({
    url: '',
    category: '',
    caption: '',
    alt_text: ''
  });
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const categories = ['Portraits', 'Events', 'Weddings', 'Commercial'];

  const filteredAndSortedImages = useMemo(() => {
    let filtered = portfolioImages?.filter(img => 
      filter === 'all' || img.category === filter
    ) || [];

    // Sort images
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_at':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'caption':
          return (a.caption || '').localeCompare(b.caption || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [portfolioImages, filter, sortBy]);

  const validateCloudinaryUrl = (url) => {
    return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
  };

  const handleAddImage = async () => {
    if (!newImage.url || !newImage.category) {
      alert('Please fill in URL and category');
      return;
    }

    if (!validateCloudinaryUrl(newImage.url)) {
      alert('Please enter a valid Cloudinary URL');
      return;
    }
    
    setUploading(true);
    try {
      await addPortfolioImage(newImage);
      setNewImage({ url: '', category: '', caption: '', alt_text: '' });
    } catch (error) {
      console.error('Error adding image:', error);
      alert('Failed to add image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelect = (imageId) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedImages.size} selected images?`)) {
      try {
        await Promise.all(
          Array.from(selectedImages).map(id => deletePortfolioImage(id))
        );
        setSelectedImages(new Set());
      } catch (error) {
        console.error('Error deleting images:', error);
        alert('Failed to delete some images. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-[#181818] rounded-lg p-4">
        <div className="flex gap-2 flex-wrap">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[#262626] border border-white/20 rounded px-3 py-2 text-sm text-[#F3E3C3]"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#262626] border border-white/20 rounded px-3 py-2 text-sm text-[#F3E3C3]"
          >
            <option value="created_at">Sort by Date</option>
            <option value="category">Sort by Category</option>
            <option value="caption">Sort by Caption</option>
          </select>
          
          <div className="flex border border-white/20 rounded overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-2 text-sm transition-colors ${
                view === 'grid' 
                  ? 'bg-[#F3E3C3] text-[#1a1a1a]' 
                  : 'bg-[#262626] hover:bg-[#333] text-[#F3E3C3]'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 text-sm transition-colors ${
                view === 'list' 
                  ? 'bg-[#F3E3C3] text-[#1a1a1a]' 
                  : 'bg-[#262626] hover:bg-[#333] text-[#F3E3C3]'
              }`}
            >
              List
            </button>
          </div>
        </div>

        {selectedImages.size > 0 && (
          <div className="flex gap-2 items-center">
            <span className="text-sm text-[#F3E3C3]">{selectedImages.size} selected</span>
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-3 py-2 rounded text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Image Form */}
        <div className="bg-[#262626] rounded-lg p-6">
          <h3 className="text-xl font-vintage mb-4">Add New Image</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#F3E3C3] mb-2">
                Image URL *
              </label>
              <input
                type="url"
                value={newImage.url}
                onChange={(e) => setNewImage({...newImage, url: e.target.value})}
                placeholder="https://res.cloudinary.com/..."
                className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-sm text-[#F3E3C3] focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F3E3C3] mb-2">
                Category *
              </label>
              <select
                value={newImage.category}
                onChange={(e) => setNewImage({...newImage, category: e.target.value})}
                className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-sm text-[#F3E3C3] focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F3E3C3] mb-2">
                Caption
              </label>
              <textarea
                value={newImage.caption}
                onChange={(e) => setNewImage({...newImage, caption: e.target.value})}
                placeholder="Image caption..."
                className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-sm text-[#F3E3C3] focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F3E3C3] mb-2">
                Alt Text (SEO)
              </label>
              <input
                type="text"
                value={newImage.alt_text}
                onChange={(e) => setNewImage({...newImage, alt_text: e.target.value})}
                placeholder="Descriptive alt text for accessibility..."
                className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-sm text-[#F3E3C3] focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
              />
            </div>

            {/* Preview */}
            {newImage.url && validateCloudinaryUrl(newImage.url) && (
              <div className="border border-white/20 rounded-lg p-3">
                <p className="text-xs text-[#F3E3C3]/70 mb-2">Preview:</p>
                <OptimizedImage
                  src={newImage.url}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            )}

            <button
              onClick={handleAddImage}
              disabled={!newImage.url || !newImage.category || uploading}
              className="w-full bg-[#F3E3C3] text-[#1a1a1a] rounded-md py-2 px-4 font-semibold transition-all hover:bg-[#E6D5B8] disabled:opacity-50"
            >
              {uploading ? 'Adding...' : 'Add Image'}
            </button>
          </div>
        </div>

        {/* Images Display */}
        <div className="lg:col-span-2">
          <div className="bg-[#262626] rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-display">
                Portfolio Images ({filteredAndSortedImages.length})
              </h3>
            </div>

            {view === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredAndSortedImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <div className="aspect-square relative">
                      <input
                        type="checkbox"
                        checked={selectedImages.has(img.id)}
                        onChange={() => handleImageSelect(img.id)}
                        className="absolute top-2 left-2 z-10 rounded"
                      />
                      
                      <OptimizedImage
                        src={img.url}
                        alt={img.alt_text || img.caption || `${img.category} image`}
                        className="w-full h-full object-cover rounded-lg shadow-md cursor-pointer"
                        onClick={() => setPreviewImage(img)}
                      />
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this image?')) {
                              deletePortfolioImage(img.id);
                            }
                          }}
                          className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          title="Delete"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-xs text-[#F3E3C3]/80 truncate">
                        {img.caption || 'No caption'}
                      </p>
                      <p className="text-xs text-[#F3E3C3]/60">
                        {img.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAndSortedImages.map(img => (
                  <div key={img.id} className="flex items-center gap-4 p-3 bg-[#181818] rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedImages.has(img.id)}
                      onChange={() => handleImageSelect(img.id)}
                      className="rounded"
                    />
                    
                    <OptimizedImage
                      src={img.url}
                      alt={img.alt_text || img.caption || `${img.category} image`}
                      className="w-16 h-16 object-cover rounded cursor-pointer"
                      onClick={() => setPreviewImage(img)}
                    />
                    
                    <div className="flex-1">
                      <div className="font-medium text-[#F3E3C3]">
                        {img.caption || 'Untitled'}
                      </div>
                      <div className="text-sm text-[#F3E3C3]/60">
                        {img.category} • {new Date(img.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this image?')) {
                          deletePortfolioImage(img.id);
                        }
                      }}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      title="Delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {filteredAndSortedImages.length === 0 && (
              <div className="text-center text-[#F3E3C3]/70 py-12">
                {filter === 'all' ? 'No images uploaded yet.' : `No images found in the ${filter} category.`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#232323] rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-display">Image Details</h3>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="text-white text-xl hover:text-red-400 transition-colors"
                >
                  &times;
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <OptimizedImage
                    src={previewImage.url}
                    alt={previewImage.alt_text || previewImage.caption || 'Portfolio image'}
                    className="w-full rounded-lg"
                  />
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-[#F3E3C3]/80">Caption</label>
                    <p className="text-[#F3E3C3]">{previewImage.caption || 'No caption'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-[#F3E3C3]/80">Category</label>
                    <p className="text-[#F3E3C3]">{previewImage.category}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-[#F3E3C3]/80">Alt Text</label>
                    <p className="text-[#F3E3C3]">{previewImage.alt_text || 'No alt text'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-[#F3E3C3]/80">Added</label>
                    <p className="text-[#F3E3C3]">{new Date(previewImage.created_at).toLocaleString()}</p>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(previewImage.url);
                        alert('URL copied to clipboard!');
                      }}
                      className="bg-[#F3E3C3] text-[#1a1a1a] px-3 py-2 rounded text-sm font-semibold hover:bg-[#E6D5B8] transition-colors"
                    >
                      Copy URL
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this image?')) {
                          deletePortfolioImage(previewImage.id);
                          setPreviewImage(null);
                        }
                      }}
                      className="bg-red-500 text-white px-3 py-2 rounded text-sm font-semibold hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const EnhancedCmsSectionWrapper = (props) => {
  return <CmsSection {...props} />;
};

export default EnhancedCmsSectionWrapper;
