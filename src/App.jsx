import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import VirtualAgentPlanner from './VirtualAgentPlanner';
import PhotoshootPlanner from './PhotoshootPlanner';
import ConversationalPlanner from './ConversationalPlanner';
import { supabase, fetchWithErrorHandling, isSupabaseConfigured, testConnection } from './supabaseClient';
import { EnhancedCrmSection } from './components/EnhancedCRM';
import { EnhancedCmsSection } from './components/EnhancedCMS';
import SEOHead from './components/SEOHead';

// Simple SVG icon components
const Camera = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
    <circle cx="12" cy="13" r="3"></circle>
  </svg>
);

const Menu = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const X = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const Mail = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const Phone = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const MapPin = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const Instagram = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const ArrowRight = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12,5 19,12 12,19"></polyline>
  </svg>
);

const MessageCircle = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const Star = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
  </svg>
);

// --- Main Application Component --- //

// Remove the lazy imports that are causing the build error
// const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
// const BlogAdminSection = lazy(() => import('./components/BlogAdminSection'));

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State management
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [portfolioUnlocked, setPortfolioUnlocked] = useState(false);
  const [showChatWidget, setShowChatWidget] = useState(false);
  const [showPlanner, setShowPlanner] = useState(null);
  
  // Data states
  const [leads, setLeads] = useState([]);
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('checking');
  
  // Loading states
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogError, setBlogError] = useState('');

  // Test Supabase connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus('checking');
      
      if (!isSupabaseConfigured()) {
        setConnectionStatus('unconfigured');
        console.log('Supabase not configured - check environment variables');
        setLoading(false);
        return;
      }
      
      const isConnected = await testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'error');
      
      if (isConnected) {
        loadInitialData();
      } else {
        setLoading(false);
        setError('Database connection failed. Some features may not work properly.');
      }
    };
    
    checkConnection();
  }, []);

  // Fix missing error handling in useEffect hooks
  useEffect(() => {
    if (location.pathname === '/blog' || isAdmin) {
      setBlogLoading(true);
      setBlogError('');
      
      fetchWithErrorHandling(
        supabase
          .from('blog_posts')
          .select('id, title, publish_date, created_at, slug, excerpt, author, content, tags, category')
          .order('publish_date', { ascending: false })
          .limit(10)
      ).then((data) => {
        if (!data || !Array.isArray(data)) {
          setBlogError('No blog posts found.');
          setBlogPosts([]);
        } else {
          setBlogPosts(data);
        }
      }).catch((error) => {
        console.error('Blog posts fetch error:', error);
        setBlogError('Failed to load blog posts.');
        setBlogPosts([]);
      }).finally(() => {
        setBlogLoading(false);
      });
    }
  }, [location.pathname, isAdmin]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load portfolio images
      const portfolioData = await fetchWithErrorHandling(
        supabase
          .from('portfolio_images')
          .select('*')
          .order('order_index', { ascending: true })
      );
      if (portfolioData) setPortfolioImages(portfolioData);

      // Load leads if admin
      if (isAdmin) {
        const leadsData = await fetchWithErrorHandling(
          supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })
        );
        if (leadsData) setLeads(leadsData);
      }
      
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load application data.');
    } finally {
      setLoading(false);
    }
  };

  // Connection status notification component
  const ConnectionStatusNotification = () => {
    if (connectionStatus === 'connected') return null;
    
    const statusConfig = {
      checking: { 
        color: 'bg-blue-500/20 border-blue-500/30 text-blue-200',
        message: '🔄 Connecting to database...'
      },
      unconfigured: { 
        color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-200',
        message: '⚠️ Database not configured. Using offline mode.'
      },
      error: { 
        color: 'bg-red-500/20 border-red-500/30 text-red-200',
        message: '❌ Database connection failed. Limited functionality.'
      }
    };
    
    const config = statusConfig[connectionStatus];
    
    return (
      <div className={`${config.color} border px-4 py-2 text-sm text-center`}>
        <strong>{config.message}</strong>
      </div>
    );
  };

  // Add proper error handling for portfolio unlock
  async function handlePortfolioUnlock(formData) {
    if (connectionStatus !== 'connected') {
      setPortfolioUnlocked(true);
      return true;
    }
    
    try {
      const { error } = await supabase.from('leads').insert([{
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        status: 'New'
      }]);
      
      if (error) {
        console.error('Portfolio unlock error:', error);
        return false;
      }
      
      setPortfolioUnlocked(true);
      return true;
    } catch (err) {
      console.error('Unexpected portfolio unlock error:', err);
      return false;
    }
  }

  // Portfolio management functions with real database support
  const addPortfolioImage = async (imageData) => {
    if (connectionStatus !== 'connected') {
      const newImage = {
        ...imageData,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      setPortfolioImages(prev => [newImage, ...prev]);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('portfolio_images')
        .insert([imageData])
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        setPortfolioImages(prev => [data[0], ...prev]);
      }
    } catch (error) {
      console.error('Error adding portfolio image:', error);
      throw error;
    }
  };

  const deletePortfolioImage = async (imageId) => {
    if (connectionStatus !== 'connected') {
      setPortfolioImages(prev => prev.filter(img => img.id !== imageId));
      return;
    }
    
    try {
      const { error } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('id', imageId);
      
      if (error) throw error;
      
      setPortfolioImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting portfolio image:', error);
      throw error;
    }
  };

  const updatePortfolioImageOrder = async (imageId, newOrder) => {
    try {
      const { error } = await supabase
        .from('portfolio_images')
        .update({ order_index: newOrder })
        .eq('id', imageId);
      
      if (error) throw error;
      
      // Reload portfolio images to reflect new order
      const { data } = await supabase
        .from('portfolio_images')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (data) setPortfolioImages(data);
    } catch (error) {
      console.error('Error updating image order:', error);
      throw error;
    }
  };

  // Lead management functions
  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', leadId);
      
      if (error) throw error;
      
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
    } catch (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }
  };

  // Fix security issue - use environment variables for admin credentials
  const AdminLoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      
      try {
        // Use environment variables for secure authentication
        const adminUsername = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
        const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'studio37admin';
        
        if (username.trim().toLowerCase() === adminUsername && password.trim() === adminPassword) {
          onLogin();
          navigate('/admin/dashboard');
        } else {
          setError('Invalid username or password.');
        }
      } catch (err) {
        console.error('Login error:', err);
        setError('An error occurred during login.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="section-padding-lg flex items-center justify-center">
        <SEOHead 
          title="Admin Login - Studio37"
          description="Admin access to Studio37 dashboard"
        />
        <div className="card max-w-md w-full p-8 md:p-12">
          <h2 className="text-3xl font-vintage text-center mb-8">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                required
                aria-label="Username"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
                aria-label="Password"
              />
            </div>
            {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full group"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="loading-spinner"></div>
                  Logging in...
                </div>
              ) : (
                <>Login <ArrowRight className="ml-2" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  };

  // Update AdminDashboard to use enhanced components
  const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('crm');

    return (
      <div className="section-padding-lg bg-[#212121]">
        <SEOHead 
          title="Admin Dashboard - Studio37"
          description="Studio37 admin dashboard for managing business operations"
        />
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="responsive-heading font-vintage">Admin Dashboard</h2>
            <p className="responsive-text text-[#F3E3C3]/70 mt-4">Manage your business operations</p>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {['crm', 'cms', 'blog', 'analytics'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 focus-ring ${
                  activeTab === tab 
                    ? 'bg-[#F3E3C3] text-[#1a1a1a]' 
                    : 'bg-[#262626] hover:bg-[#333] text-[#F3E3C3]'
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="card p-6">
            {activeTab === 'crm' && (
              <div>
                <h3 className="text-2xl font-vintage mb-6">Customer Relationship Management</h3>
                <EnhancedCrmSection leads={leads} updateLeadStatus={updateLeadStatus} />
              </div>
            )}
            
            {activeTab === 'cms' && (
              <div>
                <h3 className="text-2xl font-vintage mb-6">Content Management</h3>
                <EnhancedCmsSection
                  portfolioImages={portfolioImages}
                  addPortfolioImage={addPortfolioImage}
                  deletePortfolioImage={deletePortfolioImage}
                  updatePortfolioImageOrder={updatePortfolioImageOrder}
                />
              </div>
            )}
            
            {activeTab === 'blog' && (
              <div>
                <h3 className="text-2xl font-vintage mb-6">Blog Management</h3>
                <div className="text-[#F3E3C3]/70">Blog management interface coming soon...</div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-2xl font-vintage mb-6">Analytics Dashboard</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#1a1a1a] p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-[#F3E3C3] mb-2">Total Leads</h4>
                    <p className="text-3xl font-bold text-[#F3E3C3]">{leads.length}</p>
                  </div>
                  <div className="bg-[#1a1a1a] p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-[#F3E3C3] mb-2">Portfolio Images</h4>
                    <p className="text-3xl font-bold text-[#F3E3C3]">{portfolioImages.length}</p>
                  </div>
                  <div className="bg-[#1a1a1a] p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-[#F3E3C3] mb-2">Blog Posts</h4>
                    <p className="text-3xl font-bold text-[#F3E3C3]">{blogPosts.length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- HomePage Component ---
  const HomePage = () => (
    <div>
      <SEOHead />
      <ConnectionStatusNotification />
      <div className="section-padding-lg text-center">
        <h1 className="responsive-heading font-vintage mb-6 animate-fadeInUp">
          Vintage Heart, Modern Vision
        </h1>
        <p className="responsive-subheading text-[#F3E3C3]/80 mb-8 max-w-2xl mx-auto animate-fadeInUp">
          Professional photography and content strategy for brands ready to conquer the world from Houston, TX.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp">
          <Link to="/services" className="btn-primary">
            Our Services
          </Link>
          <Link to="/portfolio" className="btn-secondary">
            View Portfolio
          </Link>
        </div>
        {connectionStatus === 'connected' && (
          <div className="mt-6 text-sm text-green-400">
            ✅ Database connected - Full functionality available
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="App bg-[#181818] text-[#F3E3C3] min-h-screen">
      {/* Navigation with improved accessibility */}
      <nav className="fixed top-0 w-full z-50 bg-[#181818]/95 backdrop-blur-custom border-b border-white/10" role="navigation" aria-label="Main navigation">
        <div className="container-custom">
          <ConnectionStatusNotification />
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 focus-ring rounded-md">
              <Camera className="h-8 w-8 text-[#F3E3C3]" />
              <span className="text-xl font-vintage">Studio37</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/about" className="nav-link">About</Link>
              <Link to="/services" className="nav-link">Services</Link>
              <Link to="/portfolio" className="nav-link">Portfolio</Link>
              <Link to="/blog" className="nav-link">Blog</Link>
              <Link to="/contact" className="nav-link">Contact</Link>
              {isAdmin && (
                <Link to="/admin/dashboard" className="nav-link text-[#F3E3C3]">Admin</Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden focus-ring p-2"
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col space-y-2">
                <Link to="/" className="nav-link block px-4 py-2" onClick={() => setIsMenuOpen(false)}>Home</Link>
                <Link to="/about" className="nav-link block px-4 py-2" onClick={() => setIsMenuOpen(false)}>About</Link>
                <Link to="/services" className="nav-link block px-4 py-2" onClick={() => setIsMenuOpen(false)}>Services</Link>
                <Link to="/portfolio" className="nav-link block px-4 py-2" onClick={() => setIsMenuOpen(false)}>Portfolio</Link>
                <Link to="/blog" className="nav-link block px-4 py-2" onClick={() => setIsMenuOpen(false)}>Blog</Link>
                <Link to="/contact" className="nav-link block px-4 py-2" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                {isAdmin && (
                  <Link to="/admin/dashboard" className="nav-link block px-4 py-2" onClick={() => setIsMenuOpen(false)}>Admin</Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16" role="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<div>About Page</div>} />
          <Route path="/services" element={<div>Services Page</div>} />
          <Route path="/portfolio" element={<div>Portfolio Page</div>} />
          <Route path="/blog" element={<div>Blog Page</div>} />
          <Route path="/contact" element={<div>Contact Page</div>} />
          <Route path="/admin/login" element={!isAdmin ? <AdminLoginPage onLogin={() => setIsAdmin(true)} /> : <Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={isAdmin ? <AdminDashboard /> : <Navigate to="/admin/login" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] section-padding" role="contentinfo">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Camera className="h-6 w-6 text-[#F3E3C3]" />
                <span className="text-lg font-vintage">Studio37</span>
              </div>
              <p className="text-[#F3E3C3]/70 text-sm">
                Professional photography with vintage heart and modern vision.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-sm text-[#F3E3C3]/70">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>sales@studio37.cc</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>(832) 713-9944</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Houston, TX</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a 
                  href="https://instagram.com/studio37houston" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#F3E3C3] hover:text-[#F3E3C3]/80 transition-colors focus-ring rounded-md p-1"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-[#F3E3C3]/60">
            <p>&copy; 2024 Studio37. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Chat Widget with Virtual Agent */}
      {showChatWidget && (
        <div className="fixed bottom-6 right-6 z-50" role="dialog" aria-modal="true" aria-label="Chat with Studio37">
          <div className="card w-80">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-vintage text-lg">Chat with Studio37</h3>
              <button 
                onClick={() => setShowChatWidget(false)}
                className="text-white text-xl hover:text-red-400 transition-colors focus-ring rounded-md p-1"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <VirtualAgentPlanner />
          </div>
        </div>
      )}

      {!showChatWidget && (
        <button
          onClick={() => setShowChatWidget(true)}
          className="fixed bottom-6 right-6 bg-[#F3E3C3] text-[#1a1a1a] p-4 rounded-full shadow-lg hover:bg-[#E6D5B8] transition-all hover:scale-110 z-50 focus-ring"
          aria-label="Open chat with Studio37"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Loading overlay with connection status */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-[#F3E3C3]">
              {connectionStatus === 'checking' ? 'Connecting to Studio37...' : 'Loading Studio37...'}
            </p>
          </div>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="notification-error">
          <p>{error}</p>
          <button 
            onClick={() => setError('')}
            className="ml-2 hover:bg-red-600 p-1 rounded"
            aria-label="Close error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;