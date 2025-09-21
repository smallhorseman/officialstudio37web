import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PhotoshootPlanner from './PhotoshootPlanner';
import ConversationalPlanner from './ConversationalPlanner';
import VirtualAgentPlanner from './VirtualAgentPlanner';
import SEOHead from './components/SEOHead';
import { supabase } from './supabaseClient';
import { Routes, Route, useParams, useNavigate, Link, useLocation } from 'react-router-dom';

// Import the enhanced components
import { EnhancedCrmSection } from './components/EnhancedCRM';
import { EnhancedCmsSection } from './components/EnhancedCMS';

// --- Helper Components & Icons --- //

const ArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>

  </svg>);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const SmsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const Logo = ({ className }) => (
  <div className={`flex items-center ${className || ''}`}>
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white mr-2 flex-shrink-0">
      {/* Simple Polaroid Camera Icon */}
      <path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V5Z" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="7" y="7" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 11.5C12.8284 11.5 13.5 10.8284 13.5 10C13.5 9.17157 12.8284 8.5 12 8.5C11.1716 8.5 10.5 9.17157 10.5 10C10.5 10.8284 11.1716 11.5 12 11.5Z" fill="currentColor"/>
      <line x1="6" y1="16" x2="18" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  </div>
);

// --- Main Application Component --- //

// Remove the lazy imports that are causing the build error
// const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
// const BlogAdminSection = lazy(() => import('./components/BlogAdminSection'));

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  // --- Theme ---
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    }
  }, [theme]);
  // Optionally, force dark theme only:
  // useEffect(() => { document.documentElement.classList.add('dark'); }, []);
  // const toggleTheme = () => {}; // Disable theme toggle if you want only dark
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  // --- Blog ---
  const [blogPosts, setBlogPosts] = useState([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogError, setBlogError] = useState('');

  // --- Portfolio Unlock ---
  const [portfolioUnlocked, setPortfolioUnlocked] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  // --- Leads (CRM) ---
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  // --- Content (CMS) ---
  const [siteContent, setSiteContent] = useState({ about: { title: '', bio: '' } });

  // --- Projects ---
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // --- Blog Admin ---
  const [blogEdit, setBlogEdit] = useState(null);
  const [blogSaving, setBlogSaving] = useState(false);
  const [blogAdminError, setBlogAdminError] = useState('');

  // --- Floating Chat Bot ---
  const [showChatBot, setShowChatBot] = useState(false);

  // --- Fetch Blog Posts ---
  useEffect(() => {
    if (location.pathname === '/blog' || isAdmin) {
      setBlogLoading(true);
      setBlogError('');
      supabase
        .from('blog_posts')
        .select('id, title, publish_date, created_at, slug, excerpt, author, content, tags, category')
        .order('publish_date', { ascending: false })
        .limit(10)
        .then(({ data, error }) => {
          if (error) {
            setBlogError('Failed to load blog posts.');
            setBlogPosts([]);
          } else if (!data || !Array.isArray(data)) {
            setBlogError('No blog posts found.');
            setBlogPosts([]);
          } else {
            setBlogPosts(data);
          }
          setBlogLoading(false);
        });
    }
  }, [location.pathname, isAdmin]);

  // --- Fetch Portfolio Images ---
  useEffect(() => {
    if (location.pathname === '/portfolio' || isAdmin) {
      setPortfolioLoading(true);
      supabase
        .from('portfolio_images')
        .select('id, url, category, caption, created_at')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(24)
        .then(({ data, error }) => {
          if (error) {
            setPortfolioImages([]);
          } else {
            setPortfolioImages(data || []);
          }
          setPortfolioLoading(false);
        });
    }
  }, [location.pathname, isAdmin]);

  // --- Fetch Leads (CRM) ---
  useEffect(() => {
    if (isAdmin) {
      setLeadsLoading(true);
      supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          setLeads(data || []);
          setLeadsLoading(false);
        });
    }
  }, [isAdmin]);

  // --- Fetch Site Content (CMS) ---
  useEffect(() => {
    supabase
      .from('about')
      .select('id, title, bio, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (error || !data || !data[0]) {
          setSiteContent({ about: { title: 'About', bio: 'Content not available.' } });
        } else {
          setSiteContent({ about: { title: data[0].title, bio: data[0].bio } });
        }
      });
  }, []);

  // --- Fetch Site Map Order ---
  const [siteMapOrder, setSiteMapOrder] = useState([]);
  useEffect(() => {
    supabase
      .from('site_map_order')
      .select('id, page_key, page_label, order_index')
      .order('order_index', { ascending: true })
      .order('id', { ascending: true })
      .limit(100)
      .then(({ data, error }) => {
        if (!error && Array.isArray(data)) setSiteMapOrder(data);
      });
  }, []);

  // --- Projects ---
  useEffect(() => {
    if (isAdmin) {
      setProjectsLoading(true);
      supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          setProjects(data || []);
          setProjectsLoading(false);
        });
    }
  }, [isAdmin]);

  // --- Portfolio Unlock Handler ---
  async function handlePortfolioUnlock(formData) {
    // Save lead to Supabase
    await supabase.from('leads').insert([{
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      service: formData.service,
      status: 'New'
    }]);
    setPortfolioUnlocked(true);
  }

  // --- Admin Login Handler ---
  function handleAdminLogin() {
    setIsAdmin(true);
  }

  // --- Update Lead Status (CRM) ---
  async function updateLeadStatus(leadId, status) {
    await supabase.from('leads').update({ status }).eq('id', leadId);
    setLeads(leads => leads.map(l => l.id === leadId ? { ...l, status } : l));
  }

  // --- Update Content (CMS) ---
  async function updateContent(newContent) {
    await supabase.from('site_content').update({
      about_title: newContent.about.title,
      about_bio: newContent.about.bio
    }).eq('id', 1);
    setSiteContent(newContent);
  }

  // --- Add/Delete Portfolio Image (CMS) ---
  async function addPortfolioImage(image) {
    // Get the highest order_index for the category
    const { data: existingImages } = await supabase
      .from('portfolio_images')
      .select('order_index')
      .eq('category', image.category)
      .order('order_index', { ascending: false })
      .limit(1);
    
    const nextOrderIndex = existingImages && existingImages[0] ? existingImages[0].order_index + 1 : 0;
    
    const { data } = await supabase
      .from('portfolio_images')
      .insert([{ ...image, order_index: nextOrderIndex }])
      .select();
    
    if (data && data[0]) setPortfolioImages(imgs => [...imgs, data[0]]);
  }
  async function deletePortfolioImage(id) {
    await supabase.from('portfolio_images').delete().eq('id', id);
    setPortfolioImages(imgs => imgs.filter(img => img.id !== id));
  }

  // --- Update Portfolio Image Order ---
  async function updatePortfolioImageOrder(imageId, newOrderIndex, category) {
    await supabase
      .from('portfolio_images')
      .update({ order_index: newOrderIndex })
      .eq('id', imageId);
    
    // Refresh the images to reflect new order
    const { data } = await supabase
      .from('portfolio_images')
      .select('id, url, category, caption, created_at, order_index')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(24);
    
    if (data) setPortfolioImages(data);
  }

  // --- Blog Admin CRUD ---
  async function createBlogPost(post) {
    setBlogSaving(true);
    const { data, error } = await supabase.from('blog_posts').insert([post]).select();
    if (error) setBlogAdminError('Failed to create post.');
    else setBlogPosts(posts => [data[0], ...posts]);
    setBlogSaving(false);
  }
  async function updateBlogPost(id, post) {
    setBlogSaving(true);
    await supabase.from('blog_posts').update(post).eq('id', id);
    setBlogPosts(posts => posts.map(p => p.id === id ? { ...p, ...post } : p));
    setBlogSaving(false);
  }
  async function deleteBlogPost(id) {
    await supabase.from('blog_posts').delete().eq('id', id);
    setBlogPosts(posts => posts.filter(p => p.id !== id));
  }

  // --- Render ---
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#181818] text-[#F3E3C3] font-sans antialiased transition-colors duration-300">
        {/* Chatbot Button */}
        <button
          onClick={() => setShowChatBot(true)}
          className="fixed bottom-6 right-6 z-50 bg-[#F3E3C3] text-[#1a1a1a] rounded-full shadow-lg p-4 flex items-center gap-2 hover:scale-105 transition-transform"
          aria-label="Open Photoshoot Planner Chat Bot"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          <span className="font-bold hidden md:inline">Plan My Shoot</span>
        </button>
        {showChatBot && (
          <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-[100]">
            <div className="bg-[#232323] dark:bg-white rounded-t-2xl md:rounded-lg shadow-2xl w-full max-w-md mx-auto p-0 md:p-0 relative animate-fadeInUp">
              <button onClick={() => setShowChatBot(false)} className="absolute top-2 right-4 text-white dark:text-black text-2xl">&times;</button>
              <div className="p-4 border-b border-white/10 flex items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                <span className="font-display text-lg font-bold">Photoshoot Planner</span>
              </div>
              <VirtualAgentPlanner />
            </div>
          </div>
        )}
        <Header 
          isMenuOpen={isMenuOpen} 
          setIsMenuOpen={setIsMenuOpen}
          theme={theme}
          toggleTheme={toggleTheme}
          showAdminButton={!location.pathname.includes('admin')}
        />
        <main className="pt-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage content={siteContent.about} />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/portfolio" element={
              <MemoizedPortfolioPage
                isUnlocked={portfolioUnlocked}
                onUnlock={handlePortfolioUnlock}
                images={portfolioImages}
              />
            } />
            <Route path="/blog" element={<BlogPage posts={blogPosts} loading={blogLoading} error={blogError} />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin" element={<AdminLoginPage onLogin={handleAdminLogin} />} />
            <Route path="/admin/dashboard" element={
              isAdmin ? (
                <AdminDashboard
                  leads={leads}
                  updateLeadStatus={updateLeadStatus}
                  content={siteContent}
                  portfolioImages={portfolioImages}
                  addPortfolioImage={addPortfolioImage}
                  deletePortfolioImage={deletePortfolioImage}
                  updatePortfolioImageOrder={updatePortfolioImageOrder}
                  blogPosts={blogPosts}
                  createBlogPost={createBlogPost}
                  updateBlogPost={updateBlogPost}
                  deleteBlogPost={deleteBlogPost}
                  blogEdit={blogEdit}
                  setBlogEdit={setBlogEdit}
                  blogSaving={blogSaving}
                  blogAdminError={blogAdminError}
                  projects={projects}
                  projectsLoading={projectsLoading}
                />
              ) : <AdminLoginPage onLogin={handleAdminLogin} />
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

// --- Error Boundary Component (must be declared first) ---
const ErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error) => {
      console.error('Application error:', error);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-[#181818] text-[#F3E3C3]">
        <div className="text-center">
          <h2 className="text-2xl font-display mb-4">Something went wrong</h2>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#F3E3C3] text-[#1a1a1a] px-4 py-2 rounded"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// --- OptimizedImage Component (declare early) ---
const OptimizedImage = ({ src, alt, className, loading = "lazy", ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  const optimizeCloudinaryUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    const optimizedUrl = url.replace('/upload/', '/upload/f_auto,q_auto:good,w_auto:breakpoints,c_scale/');
    return optimizedUrl;
  };

  const handleImageError = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setError(false);
      setLoaded(false);
      setTimeout(() => {
        const img = new Image();
        img.onload = () => setLoaded(true);
        img.onerror = () => setError(true);
        img.src = optimizeCloudinaryUrl(src);
      }, 1000 * (retryCount + 1));
    } else {
      setError(true);
    }
  };

  const optimizedSrc = optimizeCloudinaryUrl(src);

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
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
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

// --- Portfolio Gate Component (declare before use) ---
const PortfolioGate = ({ onUnlock }) => {
  const [formData, setFormData] = useState({ name: '', email: '', service: '', phone: '' });
  const [submitted, setSubmitted] = useState(false);
  const [showPlanner, setShowPlanner] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      onUnlock(formData);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="text-center bg-[#262626] rounded-lg p-8 max-w-lg mx-auto relative">
        <h3 className="text-2xl font-display text-white mb-2">Thank You!</h3>
        <p className="text-[#F3E3C3]/80">The portfolio is now unlocked. Check your email for a 10% off coupon!</p>
        <p className="text-[#F3E3C3]/80 mt-4">Want to plan your shoot?{' '}
          <button onClick={() => setShowPlanner(true)} className="underline text-[#F3E3C3]">Try our Conversational AI Planner</button>
        </p>
        {showPlanner && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#232323] rounded-lg shadow-lg max-w-md w-full relative">
              <button onClick={() => setShowPlanner(false)} className="absolute top-2 right-2 text-white text-xl">&times;</button>
              <ConversationalPlanner email={formData.email} onComplete={() => {}} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#262626] rounded-lg shadow-xl p-8 md:p-12 max-w-2xl mx-auto border border-white/10">
      <h3 className="text-2xl md:text-3xl font-display text-center text-white mb-2">Unlock the Portfolio</h3>
      <p className="text-center text-[#F3E3C3]/70 mb-8">Submit your info to view our work and receive a 10% off coupon for your first service!</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="text" name="name" placeholder="Your Name" required onChange={handleChange} className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]" />
        <input type="email" name="email" placeholder="Your Email" required onChange={handleChange} className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]" />
        <input type="tel" name="phone" placeholder="Your Phone (Optional)" onChange={handleChange} className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]" />
        <select name="service" onChange={handleChange} className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]">
          <option value="">Service of Interest (Optional)</option>
          <option>Director Package</option>
          <option>Producer Package</option>
          <option>Wedding</option>
          <option>Portrait</option>
          <option>Other</option>
        </select>
        <button type="submit" className="w-full group inline-flex items-center justify-center bg-[#F3E3C3] text-[#1a1a1a] font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105">
          Unlock & Get Coupon <ArrowRight />
        </button>
      </form>
    </div>
  );
};

// --- Header Component (declare before use in other components) ---
const Header = ({ isMenuOpen, setIsMenuOpen, theme, toggleTheme, showAdminButton }) => {
  const location = useLocation();
  
  const navLinks = [
    { page: '/', label: 'Home' },
    { page: '/about', label: 'About' },
    { page: '/services', label: 'Services' },
    { page: '/portfolio', label: 'Portfolio' },
    { page: '/blog', label: 'Blog' },
    { page: '/contact', label: 'Contact' },
    { page: 'book', label: 'Book a Session', external: true, url: 'https://book.usesession.com/i/sbDooN5rcH' }
  ];

  const NavLink = ({ page, label, external, url }) => (
    external ? (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 text-sm uppercase tracking-widest transition-colors duration-300 text-[#F3E3C3]/70 hover:text-white font-bold"
      >
        {label}
      </a>
    ) : (
      <Link 
        to={page}
        className={`px-4 py-2 text-sm uppercase tracking-widest transition-colors duration-300 ${location.pathname === page ? 'text-white' : 'text-[#F3E3C3]/70 hover:text-white'}`}
      >
        {label}
      </Link>
    )
  );

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-[#232323] shadow-lg">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-4">
          <Logo />
          <span className="font-display text-xl font-bold tracking-tight text-white">Studio37</span>
        </Link>
        <nav className="hidden md:flex gap-2 items-center">
          {navLinks.map(link => <NavLink key={link.page} {...link} />)}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="text-[#F3E3C3] text-xl px-2" aria-label="Toggle Theme">
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
                    {showAdminButton && (
                      <Link
                        to="/admin"
                        className="text-xs px-2 py-1 rounded bg-transparent text-[#F3E3C3]/60 hover:text-[#F3E3C3] border border-transparent hover:border-[#F3E3C3]/30 transition"
                        style={{ fontSize: '0.85rem' }}
                        aria-label="Admin Login"
                      >
                        Admin
                      </Link>
                    )}
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-[#F3E3C3] text-xl px-2" aria-label="Toggle Menu">
                      ☰
                    </button>
                  </div>
                </div>
              </header>
            );
          };