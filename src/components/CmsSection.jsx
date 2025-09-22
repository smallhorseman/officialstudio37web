import React, { useState } from 'react';

const CmsSection = ({ 
  portfolioImages, 
  addPortfolioImage, 
  deletePortfolioImage, 
  updatePortfolioImageOrder 
}) => {
  const [view, setView] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [newImage, setNewImage] = useState({
    url: '',
    category: '',
    caption: '',
    alt_text: ''
  });
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const categories = ['Portraits', 'Events', 'Weddings', 'Commercial'];

  const filteredImages = portfolioImages?.filter(img => 
    filter === 'all' || img.category === filter
  ) || [];

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

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-[#181818] rounded-lg p-4">
        <div className="flex gap-2">
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
                <img
                  src={newImage.url}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
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
                Portfolio Images ({filteredImages.length})
              </h3>
            </div>

            {view === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <div className="aspect-square relative">
                      <img
                        src={img.url}
                        alt={img.alt_text || img.caption || `${img.category} image`}
                        className="w-full h-full object-cover rounded-lg shadow-md cursor-pointer"
                        onClick={() => setPreviewImage(img)}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjNDc0NzQ3Ii8+CjxwYXRoIGQ9Ik0xMiA5VjEzTTE0IDExSDEwIiBzdHJva2U9IiNBQUFBQUEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=';
                        }}
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
                {filteredImages.map(img => (
                  <div key={img.id} className="flex items-center gap-4 p-3 bg-[#181818] rounded-lg">
                    <img
                      src={img.url}
                      alt={img.alt_text || img.caption || `${img.category} image`}
                      className="w-16 h-16 object-cover rounded cursor-pointer"
                      onClick={() => setPreviewImage(img)}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,...';
                      }}
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

            {filteredImages.length === 0 && (
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
                  <img
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
};

export default CmsSection;
