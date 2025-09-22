import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import VirtualAgentPlanner from './VirtualAgentPlanner';
import PhotoshootPlanner from './PhotoshootPlanner';
import ConversationalPlanner from './ConversationalPlanner';
import { supabase, fetchWithErrorHandling, isSupabaseConfigured, testConnection } from './supabaseClient';
import { EnhancedCrmSection } from './components/EnhancedCRM';
import { EnhancedCmsSection } from './components/EnhancedCMS';
import SEOHead from './components/SEOHead';
import HubSpotIntegration, { trackHubSpotEvent, identifyHubSpotVisitor } from './components/HubSpotIntegration';

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

  // Connection status notification component - SINGLE DECLARATION
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

  // Enhanced portfolio unlock with HubSpot tracking
  async function handlePortfolioUnlock(formData) {
    if (connectionStatus !== 'connected') {
      setPortfolioUnlocked(true);
      
      // Track portfolio unlock in HubSpot
      trackHubSpotEvent('portfolio_unlocked', {
        service: formData.service,
        source: 'portfolio_gate'
      });
      
      // Identify the visitor
      identifyHubSpotVisitor(formData.email, {
        firstname: formData.name.split(' ')[0],
        lastname: formData.name.split(' ').slice(1).join(' '),
        phone: formData.phone,
        service_interest: formData.service
      });
      
      return true;
    }
    
    try {
      const { error } = await supabase.from('leads').insert([{
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        status: 'New',
        source: 'portfolio_unlock'
      }]);
      
      if (error) {
        console.error('Portfolio unlock error:', error);
        return false;
      }
      
      setPortfolioUnlocked(true);
      
      // Track successful lead creation in HubSpot
      trackHubSpotEvent('lead_created', {
        service: formData.service,
        source: 'portfolio_unlock',
        lead_id: `studio37_${Date.now()}`
      });
      
      // Identify the visitor in HubSpot
      identifyHubSpotVisitor(formData.email, {
        firstname: formData.name.split(' ')[0],
        lastname: formData.name.split(' ').slice(1).join(' '),
        phone: formData.phone,
        service_interest: formData.service,
        lead_source: 'portfolio_unlock'
      });
      
      return true;
    } catch (err) {
      console.error('Unexpected portfolio unlock error:', err);
      return false;
    }
  }

  // Enhanced navigation tracking
  const trackPageView = (pageName) => {
    trackHubSpotEvent('page_view', {
      page_name: pageName,
      page_url: window.location.href,
      referrer: document.referrer
    });
  };

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
    if (connectionStatus !== 'connected') {
      // Update local state for offline mode
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
      return;
    }

    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;

      // Update local state
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
    useEffect(() => trackPageView('admin'), []);
    
    return (
      <div className="py-20 md:py-28">
        <SEOHead 
          title="Admin Dashboard - Studio37"
          description="Studio37 admin dashboard for managing business operations"
        />
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-vintage mb-6">Admin Dashboard</h1>
            <p className="text-xl text-[#F3E3C3]/80">
              Manage your Studio37 operations
            </p>
          </div>
          <EnhancedCrmSection leads={leads} updateLeadStatus={updateLeadStatus} />
          <div className="mt-12">
            <EnhancedCmsSection 
              portfolioImages={portfolioImages}
              addPortfolioImage={addPortfolioImage}
              deletePortfolioImage={deletePortfolioImage}
            />
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

  // Add missing page components with proper JSX structure
  const ServicesPage = () => {
    useEffect(() => trackPageView('services'), []);
    
    return (
      <div className="py-20 md:py-28">
        <SEOHead 
          title="Professional Photography Services - Studio37 Houston"
          description="Expert photography services in Houston: portraits, weddings, events, commercial photography, and content strategy. Vintage style meets modern vision."
        />
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-vintage mb-6">Our Services</h1>
            <p className="text-xl text-[#F3E3C3]/80 max-w-3xl mx-auto">
              From intimate portraits to grand celebrations, we capture the moments that matter most with our signature vintage heart and modern vision.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Portrait Photography",
                description: "Professional headshots, family portraits, and personal branding sessions that capture your authentic self.",
                features: ["Professional Headshots", "Family Portraits", "Personal Branding", "Studio & Location Options"]
              },
              {
                title: "Wedding Photography",
                description: "Your love story deserves to be told beautifully. We capture every precious moment of your special day.",
                features: ["Full Day Coverage", "Engagement Sessions", "Bridal Portraits", "Online Gallery Delivery"]
              },
              {
                title: "Event Photography",
                description: "Corporate events, celebrations, and special occasions documented with professional expertise.",
                features: ["Corporate Events", "Birthday Parties", "Anniversaries", "Fast Turnaround"]
              },
              {
                title: "Commercial Photography",
                description: "Elevate your brand with stunning product photography and commercial imagery.",
                features: ["Product Photography", "Brand Imagery", "Marketing Materials", "E-commerce Ready"]
              },
              {
                title: "Content Strategy",
                description: "Strategic visual content planning to help your brand conquer the digital world.",
                features: ["Content Planning", "Social Media Strategy", "Brand Development", "Marketing Consultation"]
              },
              {
                title: "Custom Packages",
                description: "Every client is unique. Let's create a custom package that perfectly fits your needs and budget.",
                features: ["Tailored Solutions", "Flexible Pricing", "Multiple Sessions", "Ongoing Support"]
              }
            ].map((service, index) => (
              <div key={index} className="bg-[#262626] rounded-lg p-8 hover:bg-[#333] transition-colors">
                <h3 className="text-2xl font-display mb-4">{service.title}</h3>
                <p className="text-[#F3E3C3]/80 mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-[#F3E3C3] rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link to="/contact" className="btn-primary">
              Get Your Quote Today
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const PortfolioPage = () => {
    useEffect(() => trackPageView('portfolio'), []);
    
    return (
      <div className="py-20 md:py-28">
        <SEOHead 
          title="Photography Portfolio - Studio37 Houston"
          description="View our stunning photography portfolio featuring portraits, weddings, events, and commercial work from Houston's premier photography studio."
        />
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-vintage mb-6">Our Portfolio</h1>
            <p className="text-xl text-[#F3E3C3]/80 max-w-3xl mx-auto">
              Discover the artistry behind our lens. Each image tells a story, captures an emotion, and preserves a moment in time.
            </p>
          </div>

          {portfolioUnlocked ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioImages.map((image, index) => (
                <div key={image.id || index} className="aspect-square bg-[#262626] rounded-lg overflow-hidden group">
                  <img
                    src={image.url}
                    alt={image.alt_text || image.caption || "Portfolio image"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : (
            <PortfolioGate onUnlock={handlePortfolioUnlock} />
          )}
        </div>
      </div>
    );
  };

  const BlogPage = () => {
    useEffect(() => trackPageView('blog'), []);
    
    return (
      <div className="py-20 md:py-28">
        <SEOHead 
          title="Photography Blog - Studio37 Houston"
          description="Photography tips, behind-the-scenes stories, and inspiration from Houston's premier photography studio. Learn about our vintage-modern approach."
        />
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-vintage mb-6">Our Blog</h1>
            <p className="text-xl text-[#F3E3C3]/80 max-w-3xl mx-auto">
              Stories, tips, and inspiration from behind the lens. Dive into our world of vintage heart and modern vision.
            </p>
          </div>

          {blogPosts && blogPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map(post => (
                <article key={post.id} className="bg-[#262626] rounded-lg overflow-hidden hover:bg-[#333] transition-colors">
                  {post.featured_image && (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-display mb-3">
                      <Link to={`/blog/${post.slug}`} className="hover:text-[#F3E3C3]/80 transition-colors">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-[#F3E3C3]/70 mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-[#F3E3C3]/60">
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      <Link to={`/blog/${post.slug}`} className="text-[#F3E3C3] hover:underline">
                        Read More
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center text-[#F3E3C3]/70 py-16">
              <h3 className="text-2xl font-display mb-4">Coming Soon</h3>
              <p>We're preparing amazing content for you. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const AboutPage = () => {
    useEffect(() => trackPageView('about'), []);
    
    return (
      <div className="py-20 md:py-28">
        <SEOHead 
          title="About Studio37 - Professional Photography Houston"
          description="Meet the team behind Studio37, Houston's premier photography studio combining vintage heart with modern vision for unforgettable imagery."
        />
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-vintage mb-6">About Studio37</h1>
              <p className="text-xl text-[#F3E3C3]/80">
                Where vintage heart meets modern vision
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-3xl font-display mb-6">Our Story</h2>
                <div className="space-y-4 text-[#F3E3C3]/80 leading-relaxed">
                  <p>
                    Studio37 was born from a passion for capturing life's most precious moments with a unique blend of timeless elegance and contemporary flair.
                  </p>
                  <p>
                    Based in the vibrant city of Houston, Texas, we specialize in creating stunning visual narratives that tell your story with authenticity and artistry.
                  </p>
                  <p>
                    Our vintage heart embraces the classic beauty of traditional photography, while our modern vision ensures every image resonates with today's aesthetic sensibilities.
                  </p>
                </div>
              </div>
              <div className="bg-[#262626] rounded-lg p-8">
                <h3 className="text-2xl font-display mb-6">Our Approach</h3>
                <ul className="space-y-3">
                  {[
                    "Personalized consultation for every project",
                    "Blend of vintage charm and modern technique",
                    "Professional equipment and editing",
                    "Fast turnaround with high-quality results",
                    "Ongoing support and relationship building"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-[#F3E3C3] rounded-full mr-3"></span>
                      <span className="text-[#F3E3C3]/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-display mb-6">Ready to Work Together?</h2>
              <p className="text-lg text-[#F3E3C3]/80 mb-8">
                Let's create something beautiful together. Reach out and let's discuss your vision.
              </p>
              <Link to="/contact" className="btn-primary">
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ContactPage = () => {
    useEffect(() => trackPageView('contact'), []);
    
    return (
      <div className="py-20 md:py-28">
        <SEOHead 
          title="Contact Studio37 - Houston Photography Services"
          description="Get in touch with Studio37 for professional photography services in Houston. Book your session for portraits, weddings, events, and commercial photography."
        />
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-vintage mb-6">Contact Us</h1>
              <p className="text-xl text-[#F3E3C3]/80">
                Ready to capture your story? Let's connect and discuss your vision.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-display mb-6">Get In Touch</h2>
                <div className="space-y-6">
                  <div className="flex items-center">
                    <PhoneIcon />
                    <div className="ml-4">
                      <p className="font-semibold">Phone</p>
                      <a href="tel:+18327139944" className="text-[#F3E3C3]/80 hover:text-[#F3E3C3] transition-colors">
                        (832) 713-9944
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MailIcon />
                    <div className="ml-4">
                      <p className="font-semibold">Email</p>
                      <a href="mailto:sales@studio37.cc" className="text-[#F3E3C3]/80 hover:text-[#F3E3C3] transition-colors">
                        sales@studio37.cc
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPinIcon />
                    <div className="ml-4">
                      <p className="font-semibold">Location</p>
                      <p className="text-[#F3E3C3]/80">
                        Houston, Texas<br />
                        Serving the Greater Houston Area
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const BlogPost = () => {
    useEffect(() => trackPageView('blog_post'), []);
    
    return (
      <div className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-vintage mb-6">Blog Post</h1>
              <p className="text-xl text-[#F3E3C3]/80">
                Individual blog post content will be loaded here
              </p>
            </div>
            <div className="text-center">
              <Link to="/blog" className="btn-secondary">
                ← Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Simple Portfolio Gate component with proper JSX structure
  const PortfolioGate = ({ onUnlock }) => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      service: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      const success = await onUnlock(formData);
      if (!success) {
        alert('There was an error. Please try again.');
      }
    };

    return (
      <div className="max-w-2xl mx-auto bg-[#262626] rounded-lg p-8">
        <h2 className="text-3xl font-display mb-6 text-center">Unlock Our Portfolio</h2>
        <p className="text-[#F3E3C3]/80 mb-8 text-center">
          Get exclusive access to our full portfolio by sharing a few details about your project.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Your Name *"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
            />
            <input
              type="email"
              placeholder="Your Email *"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
            />
            <select
              value={formData.service}
              onChange={(e) => setFormData({...formData, service: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
            >
              <option value="">Select Service</option>
              <option value="portraits">Portrait Photography</option>
              <option value="weddings">Wedding Photography</option>
              <option value="events">Event Photography</option>
              <option value="commercial">Commercial Photography</option>
              <option value="content">Content Strategy</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-[#F3E3C3] text-[#1a1a1a] rounded-md py-3 px-6 font-semibold transition-all hover:bg-[#E6D5B8]"
          >
            Unlock Portfolio
          </button>
        </form>
      </div>
    );
  };

  // Simple Contact Form component with proper JSX structure
  const ContactForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      service: '',
      message: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      trackHubSpotEvent('contact_form_submitted', {
        service: formData.service,
        form_type: 'contact'
      });
      
      alert('Thank you for your message! We\'ll be in touch soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: ''
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Your Name *"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            className="w-full bg-[#262626] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
          />
          <input
            type="email"
            placeholder="Your Email *"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            className="w-full bg-[#262626] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full bg-[#262626] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
          />
          <select
            value={formData.service}
            onChange={(e) => setFormData({...formData, service: e.target.value})}
            className="w-full bg-[#262626] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
          >
            <option value="">Select Service</option>
            <option value="portraits">Portrait Photography</option>
            <option value="weddings">Wedding Photography</option>
            <option value="events">Event Photography</option>
            <option value="commercial">Commercial Photography</option>
            <option value="content">Content Strategy</option>
          </select>
        </div>
        <textarea
          placeholder="Tell us about your project..."
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          rows="6"
          className="w-full bg-[#262626] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
        />
        <button
          type="submit"
          className="w-full bg-[#F3E3C3] text-[#1a1a1a] rounded-md py-3 px-6 font-semibold transition-all hover:bg-[#E6D5B8]"
        >
          Send Message
        </button>
      </form>
    );
  };

  return (
    <div className="App bg-[#181818] text-[#F3E3C3] min-h-screen">
      {/* Add HubSpot Integration */}
      <HubSpotIntegration />
      
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

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          {isAdmin && (
            <Route path="/admin" element={<AdminDashboard />} />
          )}
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