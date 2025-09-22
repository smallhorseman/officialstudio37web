import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { supabase, testConnection, getConnectionStatus } from './supabaseClient';
import { useSupabaseQuery, useSupabaseMutation } from './hooks/useSupabaseQuery';
import SEOHead from './components/SEOHead';

// Centralized icon imports
import {
  Camera, Menu, X, Mail, Phone, PhoneIcon, MailIcon, MapPin, MapPinIcon,
  Instagram, ArrowRight, MessageCircle, Calendar, Users, DollarSign,
  AlertTriangle, CheckCircle, Info, Trash2, Plus, Edit, Eye, EyeOff
} from './components/Icons';

// Lazy load heavy components for better performance
const VirtualAgentPlanner = lazy(() => import('./VirtualAgentPlanner'));
const EnhancedCrmSection = lazy(() => import('./components/EnhancedCRM').then(module => ({ default: module.EnhancedCrmSection })));
const EnhancedCmsSection = lazy(() => import('./components/EnhancedCMS').then(module => ({ default: module.EnhancedCmsSection })));
const ProjectsSection = lazy(() => import('./components/ProjectsSection'));

// Enhanced error boundary for better UX
const ErrorFallback = ({ error, resetError }) => (
  <div className="min-h-screen flex items-center justify-center bg-[#181818] text-[#F3E3C3]">
    <div className="text-center p-8">
      <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="text-[#F3E3C3]/70 mb-6">{error?.message || 'An unexpected error occurred'}</p>
      <button
        onClick={resetError}
        className="bg-[#F3E3C3] text-[#1a1a1a] px-6 py-2 rounded-md hover:bg-[#E6D5B8] transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

// Loading component
const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-[#F3E3C3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-[#F3E3C3]/70">{message}</p>
    </div>
  </div>
);

// Enhanced analytics without HubSpot dependency
const trackEvent = (eventName, properties = {}) => {
  try {
    // Console logging for development
    if (import.meta.env.DEV) {
      console.log('📊 Event:', eventName, properties);
    }
    
    // Store in localStorage for offline analytics
    const events = JSON.parse(localStorage.getItem('studio37_events') || '[]');
    events.push({
      event: eventName,
      properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('studio37_events', JSON.stringify(events));
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State management
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [portfolioUnlocked, setPortfolioUnlocked] = useState(false);
  const [showChatWidget, setShowChatWidget] = useState(false);
  
  // Remove duplicate loading state - only keep connection status states
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('checking');

  // Replace manual data loading with optimized hooks
  const {
    data: portfolioImages = [],
    loading: portfolioLoading,
    error: portfolioError,
    refetch: refetchPortfolio
  } = useSupabaseQuery(
    () => supabase
      .from('portfolio_images')
      .select('*')
      .order('order_index', { ascending: true }),
    [],
    {
      enabled: true,
      staleTime: 10 * 60 * 1000, // 10 minutes
      realtime: true,
      realtimeTable: 'portfolio_images'
    }
  );

  const {
    data: leads = [],
    loading: leadsLoading,
    error: leadsError,
    refetch: refetchLeads
  } = useSupabaseQuery(
    () => supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false }),
    [isAdmin],
    {
      enabled: isAdmin && getConnectionStatus() === 'connected',
      staleTime: 5 * 60 * 1000, // 5 minutes
      realtime: isAdmin,
      realtimeTable: 'leads'
    }
  );

  const {
    data: projects = [],
    loading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects
  } = useSupabaseQuery(
    () => supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false }),
    [isAdmin],
    {
      enabled: isAdmin && getConnectionStatus() === 'connected',
      staleTime: 10 * 60 * 1000, // 10 minutes
      realtime: isAdmin,
      realtimeTable: 'projects'
    }
  );

  // Optimized mutations
  const addPortfolioMutation = useSupabaseMutation(
    async (imageData) => {
      const { data, error } = await supabase
        .from('portfolio_images')
        .insert([imageData])
        .select();
      
      if (error) throw error;
      return data[0];
    },
    {
      onSuccess: () => {
        clearTableCache('portfolio_images');
        refetchPortfolio();
      }
    }
  );

  const deletePortfolioMutation = useSupabaseMutation(
    async (imageId) => {
      const { error } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('id', imageId);
      
      if (error) throw error;
      return imageId;
    },
    {
      onSuccess: () => {
        clearTableCache('portfolio_images');
        refetchPortfolio();
      }
    }
  );

  const updateLeadMutation = useSupabaseMutation(
    async ({ leadId, status }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', leadId)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    {
      onSuccess: () => {
        clearTableCache('leads');
        refetchLeads();
      }
    }
  );

  // Test Supabase connection on mount with better error handling
  useEffect(() => {
    let mounted = true;
    
    const checkConnection = async () => {
      if (!mounted) return;
      
      setConnectionStatus('checking');
      
      try {
        const isConnected = await testConnection();
        if (mounted) {
          setConnectionStatus(isConnected ? 'connected' : 'error');
          if (!isConnected) {
            setError('Database connection failed. Some features may be limited.');
          }
        }
      } catch (error) {
        if (mounted) {
          setConnectionStatus('error');
          setError(`Connection error: ${error.message}`);
        }
      }
    };
    
    checkConnection();
    
    // Retry connection periodically if failed
    const retryInterval = setInterval(() => {
      if (getConnectionStatus() === 'error') {
        checkConnection();
      }
    }, 30000); // Retry every 30 seconds
    
    return () => {
      mounted = false;
      clearInterval(retryInterval);
    };
  }, []);

  // Enhanced performance monitoring
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          trackEvent('page_performance', {
            loadTime: entry.loadEventEnd - entry.loadEventStart,
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            firstPaint: entry.responseEnd - entry.requestStart
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['navigation'] });
    
    return () => observer.disconnect();
  }, []);

  // Computed loading state - rename to avoid conflict
  const isLoading = portfolioLoading || (isAdmin && (leadsLoading || projectsLoading));
  const hasErrors = portfolioError || (isAdmin && (leadsError || projectsError));

  // Connection status notification component
  const ConnectionStatusNotification = () => {
    const status = getConnectionStatus();
    
    if (status === 'connected') return null;
    
    const statusConfig = {
      checking: { 
        color: 'bg-blue-500/20 border-blue-500/30 text-blue-200',
        message: '🔄 Connecting to database...'
      },
      unconfigured: { 
        color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-200',
        message: '⚠️ Database not configured. Using offline mode with local storage.'
      },
      error: { 
        color: 'bg-red-500/20 border-red-500/30 text-red-200',
        message: '❌ Database connection failed. Operating in offline mode.'
      },
      mock: {
        color: 'bg-purple-500/20 border-purple-500/30 text-purple-200',
        message: '🔧 Running in mock mode with local storage.'
      }
    };
    
    const config = statusConfig[status] || statusConfig.error;
    
    return (
      <div className={`${config.color} border px-4 py-2 text-sm text-center`}>
        <strong>{config.message}</strong>
        {status === 'error' && (
          <button
            onClick={async () => {
              setConnectionStatus('checking');
              const isConnected = await testConnection();
              setConnectionStatus(isConnected ? 'connected' : 'error');
            }}
            className="ml-2 underline hover:no-underline"
          >
            Retry Connection
          </button>
        )}
      </div>
    );
  };

  // Admin Login Component
  const AdminLogin = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    const handleLogin = async (e) => {
      e.preventDefault();
      setLoginLoading(true);
      setLoginError('');

      // Simple admin credentials (in production, use proper authentication)
      const adminUsername = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'studio37admin';

      if (credentials.username === adminUsername && credentials.password === adminPassword) {
        setIsAdmin(true);
        navigate('/admin');
        trackEvent('admin_login', { timestamp: new Date().toISOString() });
      } else {
        setLoginError('Invalid username or password');
      }
      
      setLoginLoading(false);
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181818] py-12 px-4 sm:px-6 lg:px-8">
        <SEOHead title="Admin Login - Studio37" />
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center">
              <Camera className="h-12 w-12 text-[#F3E3C3]" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-vintage text-[#F3E3C3]">
              Admin Login
            </h2>
            <p className="mt-2 text-center text-sm text-[#F3E3C3]/70">
              Sign in to access the admin dashboard
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-white/20 placeholder-[#F3E3C3]/50 text-[#F3E3C3] bg-[#262626] rounded-t-md focus:outline-none focus:ring-[#F3E3C3] focus:border-[#F3E3C3] focus:z-10 sm:text-sm"
                  placeholder="Username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-white/20 placeholder-[#F3E3C3]/50 text-[#F3E3C3] bg-[#262626] rounded-b-md focus:outline-none focus:ring-[#F3E3C3] focus:border-[#F3E3C3] focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                />
              </div>
            </div>

            {loginError && (
              <div className="text-red-400 text-sm text-center" role="alert">
                {loginError}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loginLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-[#1a1a1a] bg-[#F3E3C3] hover:bg-[#E6D5B8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F3E3C3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loginLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Portfolio unlock function focusing on Supabase CRM
  const handlePortfolioUnlock = async (formData) => {
    if (getConnectionStatus() !== 'connected') {
      setPortfolioUnlocked(true);
      trackEvent('portfolio_unlocked', {
        service: formData.service,
        source: 'portfolio_gate',
        offline: true
      });
      return true;
    }
    
    try {
      // Remove 'source' field since it doesn't exist in database schema
      const { data, error } = await supabase.from('leads').insert([{
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        status: 'New',
        created_at: new Date().toISOString()
      }]).select();
      
      if (error) {
        console.error('Portfolio unlock error:', error);
        return false;
      }
      
      setPortfolioUnlocked(true);
      
      // Clear leads cache and refetch
      clearTableCache('leads');
      if (isAdmin) {
        refetchLeads();
      }
      
      trackEvent('lead_created', {
        service: formData.service,
        source: 'portfolio_unlock',
        lead_id: data[0].id
      });
      
      return true;
    } catch (err) {
      console.error('Unexpected portfolio unlock error:', err);
      return false;
    }
  };

  // Portfolio management functions with mutations
  const addPortfolioImage = async (imageData) => {
    return addPortfolioMutation.mutate(imageData);
  };

  const deletePortfolioImage = async (imageId) => {
    return deletePortfolioMutation.mutate(imageId);
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    return updateLeadMutation.mutate({ leadId, status: newStatus });
  };

  // Track page views without HubSpot
  const trackPageView = (pageName) => {
    trackEvent('page_view', {
      page_name: pageName,
      page_url: window.location.href,
      referrer: document.referrer
    });
  };

  // HomePage component
  const HomePage = () => {
    useEffect(() => trackPageView('home'), []);
    
    return (
      <div className="pt-20">
        <SEOHead />
        <ConnectionStatusNotification />
        <div className="section-padding-lg text-center">
          <h1 className="text-5xl md:text-7xl font-vintage mb-6 animate-fadeInUp">
            Vintage Heart, Modern Vision
          </h1>
          <p className="text-xl md:text-2xl text-[#F3E3C3]/80 mb-8 max-w-2xl mx-auto animate-fadeInUp">
            Professional photography and content strategy for brands ready to conquer the world from Houston, TX.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp max-w-md mx-auto">
            <Link to="/services" className="bg-[#F3E3C3] text-[#1a1a1a] px-8 py-4 rounded-md font-semibold hover:bg-[#E6D5B8] transition-all hover:scale-105">
              Our Services
            </Link>
            <Link to="/portfolio" className="border-2 border-[#F3E3C3] text-[#F3E3C3] px-8 py-4 rounded-md font-semibold hover:bg-[#F3E3C3] hover:text-[#1a1a1a] transition-all">
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
  };

  // Simple Portfolio Gate component
  const PortfolioGate = ({ onUnlock }) => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      service: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      const success = await onUnlock(formData);
      setSubmitting(false);
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
            disabled={submitting}
            className="w-full bg-[#F3E3C3] text-[#1a1a1a] rounded-md py-3 px-6 font-semibold transition-all hover:bg-[#E6D5B8] disabled:opacity-50"
          >
            {submitting ? 'Unlocking...' : 'Unlock Portfolio'}
          </button>
        </form>
      </div>
    );
  };

  // Basic Portfolio Page
  const PortfolioPage = () => {
    useEffect(() => trackPageView('portfolio'), []);
    
    return (
      <div className="pt-20 pb-20">
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

  // Contact Page
  const ContactPage = () => {
    useEffect(() => trackPageView('contact'), []);
    
    return (
      <div className="pt-20 pb-20">
        <SEOHead 
          title="Contact Studio37 - Professional Photography Houston"
          description="Get in touch with Studio37 for professional photography services in Houston, TX. We'd love to discuss your project and bring your vision to life."
        />
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-vintage mb-6">Let's Create Together</h1>
            <p className="text-xl text-[#F3E3C3]/80 max-w-3xl mx-auto">
              Ready to bring your vision to life? We'd love to hear about your project and discuss how we can help make it extraordinary.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <MailIcon className="w-6 h-6 text-[#F3E3C3] mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-[#F3E3C3] mb-2">Email Us</h3>
                  <p className="text-[#F3E3C3]/70">sales@studio37.cc</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <PhoneIcon className="w-6 h-6 text-[#F3E3C3] mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-[#F3E3C3] mb-2">Call Us</h3>
                  <p className="text-[#F3E3C3]/70">(832) 713-9944</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <MapPinIcon className="w-6 h-6 text-[#F3E3C3] mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-[#F3E3C3] mb-2">Location</h3>
                  <p className="text-[#F3E3C3]/70">Houston, TX</p>
                </div>
              </div>
            </div>

            <div className="bg-[#262626] rounded-lg p-8">
              <h3 className="text-2xl font-display mb-6">Send us a message</h3>
              <p className="text-[#F3E3C3]/70 mb-6">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
                />
                <select className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]">
                  <option value="">Select Service</option>
                  <option value="portraits">Portrait Photography</option>
                  <option value="weddings">Wedding Photography</option>
                  <option value="events">Event Photography</option>
                  <option value="commercial">Commercial Photography</option>
                  <option value="content">Content Strategy</option>
                </select>
                <textarea
                  rows="4"
                  placeholder="Tell us about your project..."
                  className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
                ></textarea>
                <button className="w-full bg-[#F3E3C3] text-[#1a1a1a] rounded-md py-3 px-6 font-semibold transition-all hover:bg-[#E6D5B8]">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Admin Dashboard with proper routing
  const AdminDashboard = () => {
    useEffect(() => trackPageView('admin'), []);
    const [activeTab, setActiveTab] = useState('dashboard');
    
    // Get tab from URL params
    useEffect(() => {
      const searchParams = new URLSearchParams(location.search);
      const tab = searchParams.get('tab');
      if (tab && ['dashboard', 'leads', 'crm', 'projects', 'cms', 'analytics'].includes(tab)) {
        setActiveTab(tab);
      }
    }, [location.search]);

    // Update URL when tab changes
    const handleTabChange = (tabId) => {
      setActiveTab(tabId);
      navigate(`/admin?tab=${tabId}`, { replace: true });
    };
    
    // Enhanced error boundary wrapper
    const withErrorBoundary = (Component) => {
      return (props) => (
        <Suspense fallback={<LoadingSpinner message="Loading component..." />}>
          <Component {...props} />
        </Suspense>
      );
    };

    // Optimized admin dashboard with code splitting
    const AdminDashboardContent = withErrorBoundary(() => {
      return (
        <div className="pt-20 pb-20 bg-[#212121] min-h-screen">
          <SEOHead title="Admin Dashboard - Studio37" />
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-vintage mb-6">Studio37 CRM Dashboard</h1>
              <p className="text-xl text-[#F3E3C3]/80">
                Supabase-powered business management
              </p>
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-3 h-3 rounded-full ${getConnectionStatus() === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-[#F3E3C3]/70">
                    Database: {getConnectionStatus() === 'connected' ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsAdmin(false);
                    navigate('/');
                  }}
                  className="text-sm text-[#F3E3C3]/60 hover:text-[#F3E3C3] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {[
                { id: 'dashboard', label: 'Overview', icon: DollarSign },
                { id: 'leads', label: 'Lead Management', icon: Users },
                { id: 'crm', label: 'CRM Tools', icon: Users },
                { id: 'projects', label: 'Projects', icon: Calendar },
                { id: 'cms', label: 'Portfolio', icon: Camera },
                { id: 'analytics', label: 'Analytics', icon: DollarSign }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 flex items-center gap-2 ${
                    activeTab === tab.id 
                      ? 'bg-[#F3E3C3] text-[#1a1a1a]' 
                      : 'bg-[#262626] hover:bg-[#333] text-[#F3E3C3]'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-[#262626] rounded-lg p-6">
              {activeTab === 'dashboard' && (
                <div>
                  <h3 className="text-2xl font-vintage mb-6 flex items-center gap-2">
                    <DollarSign size={24} />
                    Business Overview
                  </h3>
                  
                  {/* Enhanced statistics with better CRM focus */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-[#1a1a1a] p-6 rounded-lg border-l-4 border-green-500">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-[#F3E3C3]">Total Leads</h4>
                        <Users className="text-green-500" size={24} />
                      </div>
                      <p className="text-3xl font-bold text-[#F3E3C3]">{leads.length}</p>
                      <p className="text-sm text-green-400">
                        +{leads.filter(l => new Date(l.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} this month
                      </p>
                    </div>
                    
                    <div className="bg-[#1a1a1a] p-6 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-[#F3E3C3]">Active Projects</h4>
                        <Calendar className="text-blue-500" size={24} />
                      </div>
                      <p className="text-3xl font-bold text-[#F3E3C3]">
                        {projects.filter(p => p.status === 'In Progress').length}
                      </p>
                      <p className="text-sm text-blue-400">
                        {projects.filter(p => p.status === 'Completed').length} completed
                      </p>
                    </div>
                    
                    <div className="bg-[#1a1a1a] p-6 rounded-lg border-l-4 border-purple-500">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-[#F3E3C3]">Portfolio Images</h4>
                        <Camera className="text-purple-500" size={24} />
                      </div>
                      <p className="text-3xl font-bold text-[#F3E3C3]">{portfolioImages.length}</p>
                      <p className="text-sm text-[#F3E3C3]/60">Published</p>
                    </div>
                    
                    <div className="bg-[#1a1a1a] p-6 rounded-lg border-l-4 border-yellow-500">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-[#F3E3C3]">Conversion Rate</h4>
                        <DollarSign className="text-yellow-500" size={24} />
                      </div>
                      <p className="text-3xl font-bold text-[#F3E3C3]">
                        {leads.length > 0 ? Math.round((leads.filter(l => l.status === 'Converted').length / leads.length) * 100) : 0}%
                      </p>
                      <p className="text-sm text-yellow-400">
                        {leads.filter(l => l.status === 'Converted').length} converted
                      </p>
                    </div>
                  </div>
                  
                  {/* Enhanced Recent Activity with CRM focus */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-[#1a1a1a] rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-[#F3E3C3] mb-4 flex items-center gap-2">
                        <Users size={20} />
                        Recent Leads
                      </h4>
                      <div className="space-y-3">
                        {leads.slice(0, 5).map(lead => (
                          <div key={lead.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                            <div>
                              <p className="text-[#F3E3C3] font-medium">{lead.name}</p>
                              <p className="text-[#F3E3C3]/60 text-sm">{lead.email}</p>
                              <p className="text-[#F3E3C3]/40 text-xs">{lead.service || 'No service specified'}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                lead.status === 'New' ? 'bg-green-500 text-white' :
                                lead.status === 'Contacted' ? 'bg-blue-500 text-white' :
                                lead.status === 'Qualified' ? 'bg-yellow-500 text-black' :
                                lead.status === 'Converted' ? 'bg-purple-500 text-white' :
                                'bg-gray-500 text-white'
                              }`}>
                                {lead.status}
                              </span>
                              <p className="text-[#F3E3C3]/60 text-xs mt-1">
                                {new Date(lead.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        {leads.length === 0 && (
                          <p className="text-[#F3E3C3]/60 text-center py-4">No leads yet</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#1a1a1a] rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-[#F3E3C3] mb-4 flex items-center gap-2">
                        <Calendar size={20} />
                        Quick Actions
                      </h4>
                      <div className="space-y-3">
                        <button
                          onClick={() => handleTabChange('leads')}
                          className="w-full bg-[#262626] hover:bg-[#333] p-3 rounded-lg text-left transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Users size={20} className="text-green-500" />
                            <div>
                              <p className="text-[#F3E3C3] font-medium">Manage Leads</p>
                              <p className="text-[#F3E3C3]/60 text-sm">View and update lead status</p>
                            </div>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => handleTabChange('cms')}
                          className="w-full bg-[#262626] hover:bg-[#333] p-3 rounded-lg text-left transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Camera size={20} className="text-purple-500" />
                            <div>
                              <p className="text-[#F3E3C3] font-medium">Update Portfolio</p>
                              <p className="text-[#F3E3C3]/60 text-sm">Add or remove portfolio images</p>
                            </div>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => handleTabChange('analytics')}
                          className="w-full bg-[#262626] hover:bg-[#333] p-3 rounded-lg text-left transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <DollarSign size={20} className="text-yellow-500" />
                            <div>
                              <p className="text-[#F3E3C3] font-medium">View Analytics</p>
                              <p className="text-[#F3E3C3]/60 text-sm">Business performance metrics</p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Remove the Source column from leads table since it doesn't exist in database */}
              {activeTab === 'leads' && (
                <div>
                  <h3 className="text-2xl font-vintage mb-6 flex items-center gap-2">
                    <Users size={24} />
                    Lead Management System
                  </h3>
                  
                  {/* Lead Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#1a1a1a] p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-[#F3E3C3]/70">Total Leads</h4>
                      <p className="text-2xl font-bold text-[#F3E3C3]">{leads.length}</p>
                    </div>
                    <div className="bg-[#1a1a1a] p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-[#F3E3C3]/70">New Leads</h4>
                      <p className="text-2xl font-bold text-green-400">
                        {leads.filter(l => l.status === 'New').length}
                      </p>
                    </div>
                    <div className="bg-[#1a1a1a] p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-[#F3E3C3]/70">Converted</h4>
                      <p className="text-2xl font-bold text-purple-400">
                        {leads.filter(l => l.status === 'Converted').length}
                      </p>
                    </div>
                    <div className="bg-[#1a1a1a] p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-[#F3E3C3]/70">Conversion Rate</h4>
                      <p className="text-2xl font-bold text-blue-400">
                        {leads.length > 0 ? Math.round((leads.filter(l => l.status === 'Converted').length / leads.length) * 100) : 0}%
                      </p>
                    </div>
                  </div>

                  {/* Enhanced Lead Table - removed Source column */}
                  <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-[#262626]">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-[#F3E3C3]/70 uppercase tracking-wider">
                              Contact Info
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-[#F3E3C3]/70 uppercase tracking-wider">
                              Service Interest
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-[#F3E3C3]/70 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-[#F3E3C3]/70 uppercase tracking-wider">
                              Date Created
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-[#F3E3C3]/70 uppercase tracking-wider">
                              Quick Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-white/5">
                              <td className="px-4 py-4">
                                <div>
                                  <p className="text-sm font-medium text-[#F3E3C3]">{lead.name}</p>
                                  <p className="text-sm text-[#F3E3C3]/60">{lead.email}</p>
                                  {lead.phone && (
                                    <p className="text-sm text-[#F3E3C3]/60">{lead.phone}</p>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300">
                                  {lead.service || 'Not specified'}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <select
                                  value={lead.status}
                                  onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                  className={`text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-[#F3E3C3] ${
                                    lead.status === 'New' ? 'bg-green-500 text-white' :
                                    lead.status === 'Contacted' ? 'bg-blue-500 text-white' :
                                    lead.status === 'Qualified' ? 'bg-yellow-500 text-black' :
                                    lead.status === 'Converted' ? 'bg-purple-500 text-white' :
                                    lead.status === 'Lost' ? 'bg-red-500 text-white' :
                                    'bg-gray-500 text-white'
                                  }`}
                                >
                                  <option value="New">New</option>
                                  <option value="Contacted">Contacted</option>
                                  <option value="Qualified">Qualified</option>
                                  <option value="Converted">Converted</option>
                                  <option value="Lost">Lost</option>
                                </select>
                              </td>
                              <td className="px-4 py-4">
                                <div>
                                  <p className="text-sm text-[#F3E3C3]">
                                    {new Date(lead.created_at).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-[#F3E3C3]/60">
                                    {new Date(lead.created_at).toLocaleTimeString()}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex gap-2">
                                  <a
                                    href={`mailto:${lead.email}?subject=Follow up from Studio37&body=Hi ${lead.name},%0A%0AThank you for your interest in Studio37...`}
                                    className="text-blue-400 hover:text-blue-300 text-sm px-2 py-1 bg-blue-500/20 rounded"
                                    title="Send Email"
                                  >
                                    Email
                                  </a>
                                  {lead.phone && (
                                    <a
                                      href={`tel:${lead.phone}`}
                                      className="text-green-400 hover:text-green-300 text-sm px-2 py-1 bg-green-500/20 rounded"
                                      title="Call"
                                    >
                                      Call
                                    </a>
                                  )}
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(`${lead.name} - ${lead.email} - ${lead.phone || 'No phone'} - ${lead.service || 'No service'}`);
                                      alert('Lead info copied to clipboard!');
                                    }}
                                    className="text-[#F3E3C3]/60 hover:text-[#F3E3C3] text-sm px-2 py-1 bg-[#F3E3C3]/10 rounded"
                                    title="Copy Info"
                                  >
                                    Copy
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {leads.length === 0 && (
                      <div className="text-center py-12">
                        <Users size={48} className="mx-auto text-[#F3E3C3]/30 mb-4" />
                        <p className="text-[#F3E3C3]/70 text-lg">No leads found</p>
                        <p className="text-[#F3E3C3]/50 text-sm mt-2">Leads will appear here once visitors unlock the portfolio or submit contact forms</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Enhanced CRM section */}
              {activeTab === 'crm' && (
                <div>
                  <h3 className="text-2xl font-vintage mb-6 flex items-center gap-2">
                    <Users size={24} />
                    Enhanced CRM Tools
                  </h3>
                  <Suspense fallback={<LoadingSpinner message="Loading CRM tools..." />}>
                    <EnhancedCrmSection leads={leads} updateLeadStatus={updateLeadStatus} />
                  </Suspense>
                </div>
              )}

              {activeTab === 'projects' && (
                <div>
                  <h3 className="text-2xl font-vintage mb-6 flex items-center gap-2">
                    <Calendar size={24} />
                    Project Management
                  </h3>
                  <Suspense fallback={<LoadingSpinner message="Loading projects..." />}>
                    <ProjectsSection projects={projects} projectsLoading={isLoading} />
                  </Suspense>
                </div>
              )}
              
              {activeTab === 'cms' && (
                <div>
                  <h3 className="text-2xl font-vintage mb-6 flex items-center gap-2">
                    <Camera size={24} />
                    Portfolio Management
                  </h3>
                  <Suspense fallback={<LoadingSpinner message="Loading portfolio management..." />}>
                    <EnhancedCmsSection
                      portfolioImages={portfolioImages}
                      addPortfolioImage={addPortfolioImage}
                      deletePortfolioImage={deletePortfolioImage}
                    />
                  </Suspense>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div>
                  <h3 className="text-2xl font-vintage mb-6 flex items-center gap-2">
                    <DollarSign size={24} />
                    Supabase CRM Analytics
                  </h3>
                  
                  {/* Lead Analytics - Remove source analysis since column doesn't exist */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-[#1a1a1a] rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-[#F3E3C3] mb-4">Service Interest</h4>
                      <div className="space-y-3">
                        {Object.entries(leads.reduce((acc, lead) => {
                          const service = lead.service || 'Not specified';
                          acc[service] = (acc[service] || 0) + 1;
                          return acc;
                        }, {})).map(([service, count]) => (
                          <div key={service} className="flex justify-between items-center">
                            <span className="text-[#F3E3C3]">{service}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-[#262626] rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full bg-green-500"
                                  style={{ 
                                    width: `${leads.length > 0 ? (count / leads.length) * 100 : 0}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="text-[#F3E3C3] text-sm w-8 text-right">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#1a1a1a] rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-[#F3E3C3] mb-4">Lead Status Distribution</h4>
                      <div className="space-y-3">
                        {Object.entries(leads.reduce((acc, lead) => {
                          const status = lead.status || 'Unknown';
                          acc[status] = (acc[status] || 0) + 1;
                          return acc;
                        }, {})).map(([status, count]) => (
                          <div key={status} className="flex justify-between items-center">
                            <span className="text-[#F3E3C3]">{status}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-[#262626] rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    status === 'New' ? 'bg-green-500' :
                                    status === 'Contacted' ? 'bg-blue-500' :
                                    status === 'Qualified' ? 'bg-yellow-500' :
                                    status === 'Converted' ? 'bg-purple-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ 
                                    width: `${leads.length > 0 ? (count / leads.length) * 100 : 0}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="text-[#F3E3C3] text-sm w-8 text-right">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Monthly Lead Trend */}
                  <div className="bg-[#1a1a1a] rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-[#F3E3C3] mb-4">Lead Acquisition Trend (Last 6 Months)</h4>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {Array.from({length: 6}, (_, i) => {
                        const date = new Date();
                        date.setMonth(date.getMonth() - (5 - i));
                        const monthLeads = leads.filter(lead => {
                          const leadDate = new Date(lead.created_at);
                          return leadDate.getMonth() === date.getMonth() && leadDate.getFullYear() === date.getFullYear();
                        }).length;
                        
                        return (
                          <div key={i} className="text-center bg-[#262626] p-4 rounded-lg">
                            <p className="text-2xl font-bold text-[#F3E3C3]">{monthLeads}</p>
                            <p className="text-sm text-[#F3E3C3]/70">
                              {date.toLocaleDateString('en-US', { month: 'short' })}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    });

  return (
    <div className="App bg-[#181818] text-[#F3E3C3] min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#181818]/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6">
          <ConnectionStatusNotification />
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Camera className="h-8 w-8 text-[#F3E3C3]" />
              <span className="text-xl font-vintage">Studio37</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="hover:text-[#F3E3C3]/80 transition-colors">Home</Link>
              <Link to="/portfolio" className="hover:text-[#F3E3C3]/80 transition-colors">Portfolio</Link>
              <Link to="/contact" className="hover:text-[#F3E3C3]/80 transition-colors">Contact</Link>
              {!isAdmin ? (
                <Link 
                  to="/admin-login" 
                  className="bg-[#F3E3C3]/10 border border-[#F3E3C3]/30 text-[#F3E3C3] px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#F3E3C3]/20 hover:border-[#F3E3C3] transition-all"
                >
                  Admin Login
                </Link>
              ) : (
                <Link to="/admin" className="bg-[#F3E3C3] text-[#1a1a1a] px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#E6D5B8] transition-colors">
                  Dashboard
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col space-y-2">
                <Link to="/" className="block px-4 py-2 hover:bg-white/5 transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
                <Link to="/portfolio" className="block px-4 py-2 hover:bg-white/5 transition-colors" onClick={() => setIsMenuOpen(false)}>Portfolio</Link>
                <Link to="/contact" className="block px-4 py-2 hover:bg-white/5 transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                {!isAdmin ? (
                  <Link to="/admin-login" className="block px-4 py-2 text-[#F3E3C3]/60 hover:bg-white/5 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Admin Login
                  </Link>
                ) : (
                  <Link to="/admin" className="block px-4 py-2 bg-[#F3E3C3] text-[#1a1a1a] rounded-md mx-4 text-center font-semibold" onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin-login" element={!isAdmin ? <AdminLogin /> : <Navigate to="/admin" />} />
          <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/admin-login" />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] py-12">
        <div className="container mx-auto px-6">
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
                  className="text-[#F3E3C3] hover:text-[#F3E3C3]/80 transition-colors"
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

      {/* Enhanced Virtual Assistant Chat Widget */}
      {showChatWidget && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-[#262626] rounded-lg shadow-lg w-80 max-h-96 flex flex-col">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-vintage text-lg text-[#F3E3C3]">Studio37 Assistant</h3>
              <button 
                onClick={() => setShowChatWidget(false)}
                className="text-[#F3E3C3] hover:text-red-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Suspense fallback={<LoadingSpinner message="Loading assistant..." />}>
                <VirtualAgentPlanner />
              </Suspense>
            </div>
          </div>
        </div>
      )}

      {/* Chat widget button */}
      {!showChatWidget && (
        <button
          onClick={() => setShowChatWidget(true)}
          className="fixed bottom-6 right-6 bg-[#F3E3C3] text-[#1a1a1a] p-4 rounded-full shadow-lg hover:bg-[#E6D5B8] transition-all hover:scale-110 z-50 group"
          title="Chat with Studio37 Assistant"
        >
          <MessageCircle size={24} />
          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            Ask me anything!
          </span>
        </button>
      )}

      {/* Loading overlay - use renamed variable */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#F3E3C3] border-t-transparent rounded-full animate-spin mr-2"></div>
            <p className="text-[#F3E3C3]">
              {getConnectionStatus() === 'checking' ? 'Connecting to Studio37...' : 'Loading Studio37...'}
            </p>
            {portfolioLoading && <p className="text-[#F3E3C3]/70 text-sm">Loading portfolio...</p>}
            {isAdmin && leadsLoading && <p className="text-[#F3E3C3]/70 text-sm">Loading leads...</p>}
            {isAdmin && projectsLoading && <p className="text-[#F3E3C3]/70 text-sm">Loading projects...</p>}
          </div>
        </div>
      )}

      {/* Enhanced error notification */}
      {(error || hasErrors) && (
        <div className="fixed bottom-4 left-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-md">
          <p className="text-sm">
            {error || 'Some features may not work properly due to connection issues.'}
          </p>
          <div className="flex gap-2 mt-2">
            <button 
              onClick={() => {
                setError('');
                // Refetch all data
                refetchPortfolio();
                if (isAdmin) {
                  refetchLeads();
                  refetchProjects();
                }
              }}
              className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={() => setError('')}
              className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;