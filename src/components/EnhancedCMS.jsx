import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { supabase } from '../supabaseClient';

const OptimizedImage = ({ src, alt, className, loading = "lazy", ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse rounded flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#F3E3C3] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-all duration-500 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading={loading}
        {...props}
      />
      {error && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-gray-400 text-sm rounded">
          <div className="text-center p-4">
            <p>Image unavailable</p>
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
    alt_text: '',
    tags: [],
    is_featured: false
  });
  const [bulkAction, setBulkAction] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState('');

  const categories = ['Portraits', 'Events', 'Weddings', 'Commercial', 'Personal'];
  
  const filteredAndSortedImages = useMemo(() => {
    let filtered = portfolioImages;
    
    if (filter !== 'all') {
      filtered = filtered.filter(img => img.category === filter);
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_at':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'caption':
          return (a.caption || '').localeCompare(b.caption || '');
        case 'featured':
          return b.is_featured - a.is_featured;
        default:
          return 0;
      }
    });
  }, [portfolioImages, filter, sortBy]);

  const handleImageChange = (field, value) => {
    setNewImage(prev => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (tagsString) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
    setNewImage(prev => ({ ...prev, tags }));
  };

  const validateCloudinaryUrl = (url) => {
    return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
  };

  const extractCloudinaryInfo = (url) => {
    const match = url.match(/\/v\d+\/(.+)\./);
    return match ? match[1] : null;
  };

  const handleAddImage = async () => {
    if (!newImage.url || !newImage.category) return;
    
    try {
      const imageData = {
        ...newImage,
        cloudinary_public_id: validateCloudinaryUrl(newImage.url) 
          ? extractCloudinaryInfo(newImage.url) 
          : null
      };
      
      await addPortfolioImage(imageData);
      
      setNewImage({
        url: '',
        category: '',
        caption: '',
        alt_text: '',
        tags: [],
        is_featured: false
      });
      setCloudinaryUrl('');
    } catch (error) {
      console.error('Error adding image:', error);
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

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-[#181818] rounded-lg p-4">
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[#262626] border border-white/20 rounded px-3 py-2 text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#262626] border border-white/20 rounded px-3 py-2 text-sm"
          >
            <option value="created_at">Date Added</option>
            <option value="category">Category</option>
            <option value="caption">Caption</option>
            <option value="featured">Featured First</option>
          </select>
          
          <div className="flex border border-white/20 rounded overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-2 text-sm ${view === 'grid' ? 'bg-[#F3E3C3] text-[#1a1a1a]' : 'bg-[#262626]'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 text-sm ${view === 'list' ? 'bg-[#F3E3C3] text-[#1a1a1a]' : 'bg-[#262626]'}`}
            >
              List
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedImages.size > 0 && (
          <div className="flex gap-2 items-center">
            <span className="text-sm text-[#F3E3C3]/70">
              {selectedImages.size} selected
            </span>
            <button
              onClick={() => {
                selectedImages.forEach(id => deletePortfolioImage(id));
                setSelectedImages(new Set());
              }}
              className="bg-red-500 text-white px-3 py-2 rounded text-sm font-semibold"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Image Form */}
        <div className="bg-[#262626] rounded-lg p-6">
          <h3 className="text-xl font-display mb-4">Add New Image</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#F3E3C3] mb-2">
                Cloudinary URL
              </label>
              <input
                type="url"
                value={cloudinaryUrl}
                onChange={(e) => {
                  setCloudinaryUrl(e.target.value);
                  handleImageChange('url', e.target.value);
                }}
                placeholder="https://res.cloudinary.com/..."
                className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-sm"
              />
              {cloudinaryUrl && !validateCloudinaryUrl(cloudinaryUrl) && (
                <p className="text-red-400 text-xs mt-1">Please enter a valid Cloudinary URL</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F3E3C3] mb-2">
                Category *
              </label>
              <select
                value={newImage.category}
                onChange={(e) => handleImageChange('category', e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-sm"
                required
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
                onChange={(e) => handleImageChange('caption', e.target.value)}
                placeholder="Image caption..."
                className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-sm"
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
                onChange={(e) => handleImageChange('alt_text', e.target.value)}
                placeholder="Descriptive alt text for accessibility..."
                className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={newImage.is_featured}
                onChange={(e) => handleImageChange('is_featured', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="featured" className="text-sm text-[#F3E3C3]">
                Mark as Featured
              </label>
            </div>

            {/* Preview */}
            {newImage.url && (
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
              disabled={!newImage.url || !newImage.category || !validateCloudinaryUrl(newImage.url)}
              className="w-full bg-[#F3E3C3] text-[#1a1a1a] rounded-md py-2 px-4 font-semibold transition-transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              Add Image
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
              <button
                onClick={() => setSelectedImages(new Set())}
                className="text-sm text-[#F3E3C3]/60 hover:text-[#F3E3C3]"
              >
                Clear Selection
              </button>
            </div>

            {view === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredAndSortedImages.map((img) => (
                  <div
                    key={img.id}
                    className={`relative group cursor-pointer ${
                      selectedImages.has(img.id) ? 'ring-2 ring-[#F3E3C3]' : ''
                    }`}
                  >
                    <div className="aspect-square relative">
                      <OptimizedImage
                        src={img.url}
                        alt={img.alt_text || img.caption}
                        className="w-full h-full object-cover rounded-lg shadow-md"
                        onClick={() => setPreviewImage(img)}
                      />
                      
                      {img.is_featured && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded">
                          ⭐ Featured
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageSelect(img.id);
                            }}
                            className={`p-2 rounded ${
                              selectedImages.has(img.id) 
                                ? 'bg-[#F3E3C3] text-[#1a1a1a]' 
                                : 'bg-white/20 text-white'
                            }`}
                          >
                            ✓
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePortfolioImage(img.id);
                            }}
                            className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            🗑️
                          </button>
                        </div>
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
              /* List View */
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
                      alt={img.alt_text || img.caption}
                      className="w-16 h-16 object-cover rounded"
                      onClick={() => setPreviewImage(img)}
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#F3E3C3]">
                          {img.caption || 'Untitled'}
                        </span>
                        {img.is_featured && (
                          <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-[#F3E3C3]/60">
                        {img.category} • {new Date(img.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deletePortfolioImage(img.id)}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
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
                  className="text-white text-xl hover:text-red-400"
                >
                  &times;
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <OptimizedImage
                    src={previewImage.url}
                    alt={previewImage.alt_text || previewImage.caption}
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
                      className="bg-[#F3E3C3] text-[#1a1a1a] px-3 py-2 rounded text-sm font-semibold"
                    >
                      Copy URL
                    </button>
                    <button
                      onClick={() => {
                        deletePortfolioImage(previewImage.id);
                        setPreviewImage(null);
                      }}
                      className="bg-red-500 text-white px-3 py-2 rounded text-sm font-semibold"
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
                  &times;
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={previewImage.url}
                    alt={previewImage.alt_text || previewImage.caption}
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
                  
                  {previewImage.tags && previewImage.tags.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-[#F3E3C3]/80">Tags</label>
                      <p className="text-[#F3E3C3]">{previewImage.tags.join(', ')}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-[#F3E3C3]/80">Added</label>
                    <p className="text-[#F3E3C3]">{new Date(previewImage.created_at).toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-[#F3E3C3]/80">URL</label>
                    <p className="text-[#F3E3C3]/60 text-xs break-all">{previewImage.url}</p>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(previewImage.url);
                        alert('URL copied to clipboard!');
                      }}
                      className="bg-[#F3E3C3] text-[#1a1a1a] px-3 py-2 rounded text-sm font-semibold"
                    >
                      Copy URL
                    </button>
                    <button
                      onClick={() => {
                        deletePortfolioImage(previewImage.id);
                        setPreviewImage(null);
                      }}
                      className="bg-red-500 text-white px-3 py-2 rounded text-sm font-semibold"
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
