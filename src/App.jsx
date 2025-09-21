import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PhotoshootPlanner from './PhotoshootPlanner';
import ConversationalPlanner from './VirtualAgentPlanner';
import VirtualAgentPlanner from './VirtualAgentPlanner';
import { supabase } from './supabaseClient';
import { Routes, Route, useParams, useNavigate, Link, useLocation } from 'react-router-dom';

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

// --- BlogPostPage: dynamic blog post by slug ---
function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    setLoading(true);
    setError('');
    supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setError('Blog post not found.');
          setPost(null);
        } else {
          setPost(data);
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="text-[#F3E3C3] text-center py-10">Loading...</div>;
  if (error) return <div className="text-red-400 text-center py-10">{error}</div>;
  if (!post) return null;

  return (
    <div className="py-20 md:py-28 bg-[#212121]">
      <div className="container mx-auto px-6 max-w-3xl">
        <button onClick={() => navigate('/blog')} className="text-[#F3E3C3] mb-4 hover:underline">&larr; Back to Blog</button>
        <h1 className="text-4xl font-display mb-2 text-white">{post.title}</h1>
        <div className="text-xs text-[#F3E3C3]/60 mb-4">{post.author} &middot; {post.publish_date ? new Date(post.publish_date).toLocaleDateString() : ''}</div>
        <div className="text-[#F3E3C3]/80 mb-6">{post.excerpt}</div>
        <div className="prose prose-invert max-w-none text-[#F3E3C3]/90">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content || ''}
          </ReactMarkdown>
        </div>
        <div className="mt-8 text-xs text-[#F3E3C3]/60">
          Tags: {Array.isArray(post.tags) ? post.tags.join(', ') : (typeof post.tags === 'string' ? post.tags : '')}
        </div>
      </div>
    </div>
  );
}

// --- Page & Section Components --- //
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
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white md:hidden">
            {isMenuOpen ? <span>&#10005;</span> : <span>&#9776;</span>}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-[#232323]">
          <nav className="flex flex-col items-center py-4">
            {navLinks.map(link => <NavLink key={link.page} {...link} />)}
          </nav>
        </div>
      )}
    </header>
  );
};

const AboutPage = ({ content }) => (
  <div className="py-20 md:py-32 bg-[#212121]">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1">
          <h2 className="text-4xl md:text-5xl font-display mb-6">{content.title || 'About Studio37'}</h2>
          <div className="text-lg text-[#F3E3C3]/80 leading-relaxed">
            {content.bio ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content.bio}
              </ReactMarkdown>
            ) : (
              <p>Loading content...</p>
            )}
          </div>
        </div>
        <div className="order-1 md:order-2">
          {/* CMS-driven image will be added when available */}
          <div className="bg-[#262626] rounded-lg p-8 text-center">
            <h3 className="text-xl font-display text-white mb-4">Studio37 Team</h3>
            <p className="text-[#F3E3C3]/70">Professional photography and content strategy from Houston, TX</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);


// --- ServicesPage: Add missing package/service arrays ---
const proPackages = [
  {
    name: "Director Package",
    description: "Our most comprehensive package for brands and businesses. Includes full content strategy, creative direction, multi-location photo/video shoots, and post-production. Ideal for campaigns, launches, and ongoing brand storytelling.",
    price: "$2,000+"
  },
  {
    name: "Producer Package",
    description: "Perfect for small businesses and creators. Includes a half-day photo/video shoot, creative planning, and a set of edited images and short-form video content for social media and web.",
    price: "$1,200+"
  },
  {
    name: "Brand Builder",
    description: "A focused session for new businesses or rebrands. Includes headshots, team photos, and product or location images, plus a content strategy consult.",
    price: "$750+"
  },
  {
    name: "Content Day",
    description: "A quick, high-impact shoot for monthly content refreshes. Includes up to 2 hours on-site, 20 edited images, and 2 short video clips.",
    price: "$500+"
  }
];

const personalPackages = [
  {
    name: "Mini Reel",
    description: "A quick 15-minute session for individuals or couples. Includes 15 edited photos, a free 1-minute movie reel of your shoot, and a complimentary Polaroid print.",
    price: "$75"
  },
  {
    name: "Full Episode",
    description: "A 30-minute session for individuals, couples, or small families. Includes 30 edited photos, a free 1-minute movie reel of your shoot, and a complimentary Polaroid print.",
    price: "$150"
  },
  {
    name: "Movie Premier",
    description: "A deluxe 60-minute session for couples, families, or creative portraits. Includes 60 edited photos, a free 1-minute movie reel of your shoot, and a complimentary Polaroid print.",
    price: "$300"
  }
];

const otherServices = [
  {
    name: "Event Coverage",
    description: "Professional photography for events, parties, and gatherings. Includes candid and group shots, with fast turnaround on edited images.",
    price: "$500+"
  },
  {
    name: "Wedding & Engagement",
    description: "Custom packages for weddings and engagements. Includes planning consult, full-day coverage, and a highlight movie reel.",
    price: "Contact for Quote"
  },
  {
    name: "Real Estate & Architecture",
    description: "High-quality images and video for real estate listings, Airbnbs, and architectural projects. Includes drone options.",
    price: "$250+"
  }
];

// --- Fix: ServiceCard component ---
function ServiceCard({ name, description, price }) {
  return (
    <div className="bg-[#262626] rounded-lg shadow-lg p-6 flex flex-col items-start">
      <h4 className="text-xl font-display mb-2 text-white">{name}</h4>
      <div className="text-[#F3E3C3]/80 mb-4">{description}</div>
      {price && <div className="text-lg font-bold text-[#F3E3C3] mt-auto">{price}</div>}
    </div>
  );
}

const ServicesPage = () => (
  <div className="py-20 md:py-28">
    <div className="container mx-auto px-6">
      <section id="pro-packages" className="mb-20">
        <h3 className="text-3xl font-display text-center mb-10">Content & Marketing Packages</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {proPackages.map(p => <ServiceCard key={p.name} {...p} />)}
        </div>
      </section>
      <section id="personal-packages" className="mb-20">
        <h3 className="text-3xl font-display text-center mb-10">Portrait Packages</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {personalPackages.map(p => <ServiceCard key={p.name} {...p} />)}
        </div>
      </section>
      <section id="other-services">
        <h3 className="text-3xl font-display text-center mb-10">Additional Creative & Event Services</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherServices.map(s => <ServiceCard key={s.name} {...s} />)}
        </div>
      </section>
    </div>
  </div>
);

// Optimize portfolio images with lazy loading and intersection observer
const PortfolioPage = ({ isUnlocked, onUnlock, images }) => {
  const [filter, setFilter] = useState('All');
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());
  
  // Memoize filtered images
  const filteredImages = useMemo(() => {
    const validImages = images.filter(img => img.url && !imageLoadErrors.has(img.id));
    return filter === 'All' ? validImages : validImages.filter(img => img.category === filter);
  }, [images, filter, imageLoadErrors]);

  const categories = useMemo(() => 
    ['All', ...new Set(images.filter(img => !imageLoadErrors.has(img.id)).map(img => img.category))], 
    [images, imageLoadErrors]
  );

  const handleImageError = useCallback((imageId) => {
    setImageLoadErrors(prev => new Set([...prev, imageId]));
  }, []);

  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display">Our Work</h2>
          <p className="text-lg text-[#F3E3C3]/70 mt-4 max-w-2xl mx-auto mb-8">A curated selection of our favorite moments and projects.</p>
        </div>
        {!isUnlocked && <PortfolioGate onUnlock={onUnlock} />}
        {isUnlocked && (
          <>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-6 py-2 text-sm font-semibold rounded-full transition-colors ${filter === cat ? 'bg-[#F3E3C3] text-[#1a1a1a]' : 'bg-[#262626] hover:bg-[#333]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
              {filteredImages.map(img => (
                <div key={img.id} className="break-inside-avoid relative group">
                  <OptimizedImage
                    src={img.url} 
                    alt={img.caption || `${img.category} photography`} 
                    className="w-full rounded-lg shadow-lg hover:opacity-90 transition-opacity"
                    loading="lazy"
                    onError={() => handleImageError(img.id)}
                  />
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/75 backdrop-blur-sm p-3 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[#F3E3C3]/75 text-sm font-serif italic leading-relaxed">
                        {img.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {filteredImages.length === 0 && (
              <div className="text-center text-[#F3E3C3]/70 py-12">
                {imageLoadErrors.size > 0 ? 
                  'Some images failed to load. Please refresh the page.' : 
                  'No images available in this category.'
                }
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// --- Optimized Image Component with better error handling and loading ---
const OptimizedImage = ({ src, alt, className, loading = "lazy", ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  // Optimize Cloudinary URLs
  const optimizeCloudinaryUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    
    // Add automatic format and quality optimization
    const optimizedUrl = url.replace('/upload/', '/upload/f_auto,q_auto:good,w_auto:breakpoints,c_scale/');
    return optimizedUrl;
  };

  const handleImageError = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setError(false);
      setLoaded(false);
      // Retry after a short delay
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

// --- Enhanced HomePage with optimized hero image ---
const HomePage = () => {
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  
  const heroImageUrl = "https://res.cloudinary.com/dmjxho2rl/image/upload/f_auto,q_auto:good,w_auto:breakpoints,c_scale/a_vflip/l_image:upload:My%20Brand:IMG_2115_mtuowt/c_scale,fl_relative,w_0.35/o_100/fl_layer_apply,g_north,x_0.03,y_0.04/v1758172510/A4B03835-ED8B-4FBB-A27E-1F2EE6CA1A18_1_105_c_gstgil.jpg";

  return (
    <div className="relative h-screen flex items-center justify-center text-center text-white px-4 -mt-20">
      {!heroImageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black animate-pulse"></div>
      )}
      <img 
        src={heroImageUrl} 
        alt="Studio37 Hero" 
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${heroImageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setHeroImageLoaded(true)}
        loading="eager"
        decoding="async"
        crossOrigin="anonymous"
      />
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-0 pointer-events-none"></div>
      <div className="relative z-10">
        <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display mb-4 leading-tight break-words max-w-full">Capture. Create. Captivate.</h1>
        <p className="text-base sm:text-lg md:text-xl max-w-xs sm:max-w-2xl mx-auto mb-8 text-[#F3E3C3]/80">Vintage heart, modern vision. Full-service photography and content strategy for brands ready to conquer the world from Houston, TX.</p>
        <div className="space-y-4 sm:space-x-4 flex flex-col sm:flex-row items-center justify-center w-full">
          <Link to="/portfolio" className="group inline-flex items-center bg-[#F3E3C3] text-[#1a1a1a] font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105 w-full sm:w-auto">
            View Our Work <ArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

// --- Error Boundary Component ---
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

// --- Memoized components for performance ---
const MemoizedPortfolioPage = React.memo(PortfolioPage);

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

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    contactMethod: 'email'
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    
    // Save contact submission to Supabase
    await supabase.from('leads').insert([{
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      service: 'Contact Form',
      status: 'New'
    }]);

    // Add note with contact details
    const { data: leadData } = await supabase
      .from('leads')
      .select('id')
      .eq('email', formData.email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (leadData && leadData[0]) {
      await supabase.from('lead_notes').insert([{
        lead_id: leadData[0].id,
        note: `Contact Form: Preferred contact: ${formData.contactMethod}. Message: ${formData.message}`,
        status: 'Contact Form'
      }]);
    }

    setSending(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="py-20 md:py-28 bg-[#212121]">
        <div className="container mx-auto px-6 text-center">
          <div className="bg-[#262626] rounded-lg p-8 max-w-md mx-auto">
            <h2 className="text-3xl font-display text-white mb-4">Thank You!</h2>
            <p className="text-[#F3E3C3]/80">We've received your message and will get back to you soon!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 md:py-28 bg-[#212121]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display">Get In Touch</h2>
          <p className="text-lg text-[#F3E3C3]/70 mt-4 max-w-2xl mx-auto mb-8">Ready to start your project? Let's talk. We serve Houston, TX and the surrounding 50-mile radius.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <form onSubmit={handleSubmit} className="space-y-6">
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name" 
              className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]" 
              required 
            />
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email" 
              className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]" 
              required 
            />
            <input 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Your Phone (Optional)" 
              className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]" 
            />
            <div>
              <label className="block text-sm font-medium text-[#F3E3C3] mb-2">Preferred Contact Method</label>
              <select 
                name="contactMethod"
                value={formData.contactMethod}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
              >
                <option value="email">Email</option>
                <option value="phone">Phone Call</option>
                <option value="text">Text Message</option>
              </select>
            </div>
            <textarea 
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message" 
              rows="5" 
              className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
              required
            />
            <button 
              type="submit" 
              className="group inline-flex items-center justify-center bg-[#F3E3C3] text-[#1a1a1a] font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105"
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send Message'} <ArrowRight />
            </button>
          </form>
          <div className="text-[#F3E3C3]/80 space-y-6">
            <div>
              <h3 className="text-xl font-display text-white">Contact Info</h3>
              <p>Email: <a href="mailto:sales@studio37.cc" className="hover:text-white transition">sales@studio37.cc</a></p>
              <p>Phone: <a href="tel:1-832-713-9944" className="hover:text-white transition">(832) 713-9944</a></p>
              <p>Text: <a href="sms:1-832-713-9944" className="hover:text-white transition">(832) 713-9944</a></p>
            </div>
            <div>
              <h3 className="text-xl font-display text-white">Location</h3>
              <p>Serving the Greater Houston Area</p>
              <p>Based near Porter, TX 77362</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Admin Login Page ---
const AdminLoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (
      username.trim().toLowerCase() === 'admin' &&
      password.trim() === 'studio37admin'
    ) {
      onLogin();
      navigate('/admin/dashboard');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="py-20 md:py-32 flex items-center justify-center">
      <div className="bg-[#232323] rounded-lg shadow-xl p-8 md:p-12 max-w-md w-full border border-white/10">
        <h2 className="text-3xl font-display text-center mb-8">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required className="w-full bg-[#181818] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full bg-[#181818] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]" />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="w-full group inline-flex items-center justify-center bg-[#F3E3C3] text-[#232323] font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105">
            Login <ArrowRight />
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Add missing BlogPage component ---
const BlogPage = ({ posts, loading, error }) => {
  if (loading) {
    return (
      <div className="py-20 md:py-28 bg-[#212121]">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-display mb-8">Blog</h2>
            <div className="text-[#F3E3C3] py-10">Loading blog posts...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 md:py-28 bg-[#212121]">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-display mb-8">Blog</h2>
            <div className="text-red-400 py-10">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 md:py-28 bg-[#212121]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display">Blog</h2>
          <p className="text-lg text-[#F3E3C3]/70 mt-4 max-w-2xl mx-auto mb-8">
            Insights, tips, and stories from behind the lens.
          </p>
        </div>
        
        {posts && posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <article key={post.id} className="bg-[#262626] rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-display text-white mb-2">
                    <Link to={`/blog/${post.slug}`} className="hover:text-[#F3E3C3] transition">
                      {post.title}
                    </Link>
                  </h3>
                  <div className="text-xs text-[#F3E3C3]/60 mb-3">
                    {post.author} &middot; {post.publish_date ? new Date(post.publish_date).toLocaleDateString() : ''}
                  </div>
                  <p className="text-[#F3E3C3]/80 mb-4">{post.excerpt}</p>
                  <Link 
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center text-[#F3E3C3] hover:text-white transition group"
                  >
                    Read More <ArrowRight />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center text-[#F3E3C3]/70 py-10">
            No blog posts available yet.
          </div>
        )}
      </div>
    </div>
  );
};

// --- AdminDashboard Component (inline to avoid import issues) ---
function AdminDashboard({
  leads,
  updateLeadStatus,
  content,
  portfolioImages,
  addPortfolioImage,
  deletePortfolioImage,
  updatePortfolioImageOrder,
  blogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  blogEdit,
  setBlogEdit,
  blogSaving,
  blogAdminError,
  projects,
  projectsLoading
}) {
  const [activeTab, setActiveTab] = useState('crm');
  const [siteMapPage, setSiteMapPage] = useState('home');

  return (
    <div className="py-20 md:py-28 bg-[#212121]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display">Admin Dashboard</h2>
          <p className="text-lg text-[#F3E3C3]/70 mt-4">Manage your business operations</p>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {['crm', 'projects', 'cms', 'blog', 'sitemap', 'analytics'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-sm font-semibold rounded-full transition-colors ${
                activeTab === tab 
                  ? 'bg-[#F3E3C3] text-[#1a1a1a]' 
                  : 'bg-[#262626] hover:bg-[#333] text-[#F3E3C3]'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="bg-[#262626] rounded-lg shadow-lg p-6">
          {activeTab === 'crm' && (
            <div>
              <h3 className="text-2xl font-display mb-6">Customer Relationship Management</h3>
              <CrmSection leads={leads} updateLeadStatus={updateLeadStatus} />
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <h3 className="text-2xl font-display mb-6">Project Management</h3>
              <ProjectsSection projects={projects} projectsLoading={projectsLoading} />
            </div>
          )}
          
          {activeTab === 'cms' && (
            <div>
              <h3 className="text-2xl font-display mb-6">Content Management</h3>
              <CmsSection
                portfolioImages={portfolioImages}
                addPortfolioImage={addPortfolioImage}
                deletePortfolioImage={deletePortfolioImage}
                updatePortfolioImageOrder={updatePortfolioImageOrder}
              />
            </div>
          )}
          
          {activeTab === 'blog' && (
            <div>
              <h3 className="text-2xl font-display mb-6">Blog Management</h3>
              <BlogAdminSection
                blogPosts={blogPosts}
                createBlogPost={createBlogPost}
                updateBlogPost={updateBlogPost}
                deleteBlogPost={deleteBlogPost}
                blogEdit={blogEdit}
                setBlogEdit={setBlogEdit}
                blogSaving={blogSaving}
                blogAdminError={blogAdminError}
              />
            </div>
          )}

          {activeTab === 'sitemap' && (
            <div>
              <h3 className="text-2xl font-display mb-6">Site Map Editor</h3>
              <SiteMapTab 
                siteMapPage={siteMapPage} 
                setSiteMapPage={setSiteMapPage} 
                content={content}
                portfolioImages={portfolioImages}
                blogPosts={blogPosts}
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h3 className="text-2xl font-display mb-6">Analytics Dashboard</h3>
              <AnalyticsSection leads={leads} projects={projects} blogPosts={blogPosts} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Enhanced CRM Section with Call/Text/Email buttons ---
function CrmSection({ leads, updateLeadStatus }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [leadNotes, setLeadNotes] = useState([]);
  const [leadProjects, setLeadProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLeadNotes = async (leadId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      
      if (!error) setLeadNotes(data || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
    setLoading(false);
  };

  const fetchLeadProjects = async (leadId) => {
    try {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      
      setLeadProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !selectedLead) return;
    try {
      await supabase.from('lead_notes').insert([{
        lead_id: selectedLead.id,
        note: newNote,
        status: 'Manual'
      }]);
      setNewNote('');
      await fetchLeadNotes(selectedLead.id);
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  const openLeadDetails = (lead) => {
    setSelectedLead(lead);
    setShowLeadDetails(true);
    fetchLeadNotes(lead.id);
    fetchLeadProjects(lead.id);
  };

  if (!leads || leads.length === 0) {
    return <div className="text-[#F3E3C3]/70 py-8">No leads found.</div>;
  }

  const statuses = ['New', 'Contacted', 'Booked', 'Won', 'Lost', 'Archived'];

  return (
    <div>
      <div className="overflow-x-auto bg-[#262626] rounded-lg shadow-lg p-6 mb-6">
        <table className="w-full text-left">
          <thead className="border-b border-white/10">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Service</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead.id} className="border-b border-white/10 last:border-b-0">
                <td className="p-3 font-bold">{lead.name}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <a href={`mailto:${lead.email}`} className="text-[#F3E3C3] hover:underline">
                      {lead.email}
                    </a>
                    <a href={`mailto:${lead.email}?subject=Studio37 Follow-up`} className="text-blue-400 hover:text-blue-300" title="Send Email">
                      <MailIcon />
                    </a>
                  </div>
                </td>
                <td className="p-3">
                  {lead.phone ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[#F3E3C3]">{lead.phone}</span>
                      <a href={`tel:${lead.phone}`} className="text-green-400 hover:text-green-300" title="Call">
                        <PhoneIcon />
                      </a>
                      <a href={`sms:${lead.phone}`} className="text-purple-400 hover:text-purple-300" title="Text">
                        <SmsIcon />
                      </a>
                    </div>
                  ) : (
                    <span className="text-gray-500">No phone</span>
                  )}
                </td>
                <td className="p-3">{lead.service}</td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded bg-[#F3E3C3]/10 text-[#F3E3C3]">{lead.status}</span>
                </td>
                <td className="p-3 text-xs">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : ''}</td>
                <td className="p-3">
                  <div className="flex gap-1 flex-wrap">
                    <select
                      value={lead.status}
                      onChange={e => updateLeadStatus(lead.id, e.target.value)}
                      className="bg-[#181818] border border-white/20 rounded px-2 py-1 text-xs text-[#F3E3C3]"
                    >
                      {statuses.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => openLeadDetails(lead)}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                      title="View Details"
                    >
                      👁️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lead Details Modal */}
      {showLeadDetails && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232323] rounded-lg shadow-xl p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-display text-white">{selectedLead.name} - Lead Details</h3>
              <button
                onClick={() => setShowLeadDetails(false)}
                className="text-white text-2xl hover:text-gray-300"
              >
                &times;
              </button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-lg font-bold mb-3">Contact Information</h4>
                <div className="space-y-2 text-[#F3E3C3]/80">
                  <p><strong>Email:</strong> <a href={`mailto:${selectedLead.email}`} className="text-[#F3E3C3] hover:underline">{selectedLead.email}</a></p>
                  <p><strong>Phone:</strong> {selectedLead.phone || 'Not provided'}</p>
                  <p><strong>Service:</strong> {selectedLead.service || 'Not specified'}</p>
                  <p><strong>Status:</strong> <span className="px-2 py-1 rounded bg-[#F3E3C3]/10 text-[#F3E3C3]">{selectedLead.status}</span></p>
                  <p><strong>Created:</strong> {selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleDateString() : ''}</p>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <a href={`mailto:${selectedLead.email}?subject=Studio37 Follow-up`} className="bg-blue-500 text-white p-2 rounded" title="Email">
                    <MailIcon />
                  </a>
                  {selectedLead.phone && (
                    <>
                      <a href={`tel:${selectedLead.phone}`} className="bg-green-500 text-white p-2 rounded" title="Call">
                        <PhoneIcon />
                      </a>
                      <a href={`sms:${selectedLead.phone}`} className="bg-purple-500 text-white p-2 rounded" title="Text">
                        <SmsIcon />
                      </a>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold mb-3">Projects ({leadProjects.length})</h4>
                <div className="bg-[#181818] rounded p-4 max-h-64 overflow-y-auto">
                  {leadProjects.length > 0 ? (
                    leadProjects.map(project => (
                      <div key={project.id} className="mb-3 pb-3 border-b border-white/10 last:border-b-0">
                        <div className="flex justify-between items-start mb-1">
                          <h6 className="font-bold text-[#F3E3C3] text-sm">{project.name}</h6>
                          <span className="text-xs px-2 py-1 bg-[#F3E3C3]/10 rounded">
                            {project.stage}
                          </span>
                        </div>
                        {project.client && (
                          <p className="text-[#F3E3C3]/70 text-xs">Client: {project.client}</p>
                        )}
                        {project.opportunity_amount > 0 && (
                          <p className="text-green-400 text-xs font-bold">
                            ${project.opportunity_amount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-[#F3E3C3]/70">No projects yet</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold mb-3">Notes</h4>
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder="Add a note..."
                      className="flex-1 bg-[#181818] border border-white/20 rounded-md py-2 px-3"
                      onKeyPress={e => e.key === 'Enter' && addNote()}
                    />
                    <button
                      onClick={addNote}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      disabled={!newNote.trim() || loading}
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {leadNotes.map(note => (
                    <div key={note.id} className="bg-[#181818] rounded p-3">
                      <p className="text-[#F3E3C3]/90">{note.note}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-[#F3E3C3]/60">
                          {note.created_at ? new Date(note.created_at).toLocaleDateString() : ''}
                        </span>
                        <span className="text-xs px-2 py-1 bg-[#F3E3C3]/10 rounded">
                          {note.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Projects Section with Todo Lists ---
function ProjectsSection({ projects, projectsLoading }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    stage: 'Inquiry',
    opportunity_amount: '',
    notes: ''
  });
  const [projectTodos, setProjectTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);

  const stages = ['Inquiry', 'Proposal', 'Booked', 'In Progress', 'Completed', 'Won', 'Cancelled'];

  const fetchProjectTodos = async (projectId) => {
    try {
      const { data } = await supabase
        .from('project_todos')
        .select('*')
        .eq('project_id', projectId)
        .order('completed', { ascending: true })
        .order('created_at', { ascending: false });
      
      setProjectTodos(data || []);
    } catch (err) {
      console.error('Error fetching todos:', err);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim() || !selectedProject) return;
    try {
      await supabase.from('project_todos').insert([{
        project_id: selectedProject.id,
        task: newTodo,
        completed: false
      }]);
      setNewTodo('');
      await fetchProjectTodos(selectedProject.id);
    } catch (err) {
      console.error('Error adding todo:', err);
    }
  };

  const toggleTodo = async (todoId, completed) => {
    try {
      await supabase.from('project_todos').update({ completed }).eq('id', todoId);
      await fetchProjectTodos(selectedProject.id);
    } catch (err) {
      console.error('Error updating todo:', err);
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    try {
      await supabase.from('projects').insert([{
        ...newProject,
        opportunity_amount: parseFloat(newProject.opportunity_amount) || 0
      }]);
      setNewProject({ name: '', client: '', stage: 'Inquiry', opportunity_amount: '', notes: '' });
      setShowNewProjectForm(false);
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  const openProjectDetails = (project) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
    fetchProjectTodos(project.id);
  };

  if (projectsLoading) {
    return <div className="text-[#F3E3C3] py-8">Loading projects...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-xl font-display">Projects ({projects?.length || 0})</h4>
        <button
          onClick={() => setShowNewProjectForm(true)}
          className="bg-[#F3E3C3] text-[#1a1a1a] font-bold py-2 px-4 rounded-md"
        >
          Add Project
        </button>
      </div>

      {/* New Project Form */}
      {showNewProjectForm && (
        <form onSubmit={createProject} className="bg-[#232323] p-6 rounded mb-6">
          <h5 className="text-lg font-bold mb-4">Create New Project</h5>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              value={newProject.name}
              onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))}
              placeholder="Project Name"
              className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3"
              required
            />
            <input
              type="text"
              value={newProject.client}
              onChange={e => setNewProject(p => ({ ...p, client: e.target.value }))}
              placeholder="Client Name"
              className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3"
            />
            <select
              value={newProject.stage}
              onChange={e => setNewProject(p => ({ ...p, stage: e.target.value }))}
              className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3"
            >
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
            <input
              type="number"
              value={newProject.opportunity_amount}
              onChange={e => setNewProject(p => ({ ...p, opportunity_amount: e.target.value }))}
                           placeholder="Opportunity Amount"
              className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3"
            />
          </div>
          <textarea
            value={newProject.notes}
            onChange={e => setNewProject(p => ({ ...p, notes: e.target.value }))}
            placeholder="Project Notes"
            className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3 mt-4"
            rows={3}
          />
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-[#F3E3C3] text-[#1a1a1a] font-bold py-2 px-4 rounded-md">
              Create Project
            </button>
            <button 
              type="button" 
              onClick={() => setShowNewProjectForm(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded-md"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Projects List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map(project => (
          <div key={project.id} className="bg-[#232323] rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h5 className="text-lg font-bold text-white">{project.name}</h5>
              <span className={`text-xs px-2 py-1 rounded ${
                project.stage === 'Won' ? 'bg-green-500/20 text-green-400' :
                project.stage === 'Completed' ? 'bg-blue-500/20 text-blue-400' :
                project.stage === 'In Progress' ? 'bg-purple-500/20 text-purple-400' :
                project.stage === 'Cancelled' ? 'bg-red-500/20 text-red-400' :
                'bg-[#F3E3C3]/10 text-[#F3E3C3]'
              }`}>
                {project.stage}
              </span>
            </div>
            
            {project.client && (
              <p className="text-[#F3E3C3]/70 text-sm mb-2">Client: {project.client}</p>
            )}
            
            {project.opportunity_amount > 0 && (
              <p className="text-green-400 font-bold mb-2">
                ${project.opportunity_amount.toLocaleString()}
              </p>
            )}
            
            {project.notes && (
              <p className="text-[#F3E3C3]/60 text-sm mb-4">{project.notes}</p>
            )}
            
            <button
              onClick={() => openProjectDetails(project)}
              className="w-full bg-[#F3E3C3] text-[#1a1a1a] font-bold py-2 px-4 rounded-md"
            >
              View Details & Todos
            </button>
          </div>
        ))}
      </div>

      {/* Project Details Modal with Todos */}
      {showProjectDetails && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232323] rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-display text-white">{selectedProject.name}</h3>
              <button
                onClick={() => setShowProjectDetails(false)}
                className="text-white text-2xl hover:text-gray-300"
              >
                &times;
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-bold mb-3">Project Details</h4>
                <div className="space-y-2 text-[#F3E3C3]/80">
                  <p><strong>Client:</strong> {selectedProject.client || 'Not specified'}</p>
                  <p><strong>Stage:</strong> <span className="px-2 py-1 rounded bg-[#F3E3C3]/10 text-[#F3E3C3]">{selectedProject.stage}</span></p>
                  <p><strong>Value:</strong> {selectedProject.opportunity_amount > 0 ? `$${selectedProject.opportunity_amount.toLocaleString()}` : 'Not specified'}</p>
                  <p><strong>Created:</strong> {selectedProject.created_at ? new Date(selectedProject.created_at).toLocaleDateString() : ''}</p>
                  {selectedProject.notes && (
                    <div>
                      <strong>Notes:</strong>
                      <p className="mt-1 p-3 bg-[#181818] rounded">{selectedProject.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold mb-3">Todo List</h4>
                
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTodo}
                      onChange={e => setNewTodo(e.target.value)}
                      placeholder="Add a todo..."
                      className="flex-1 bg-[#181818] border border-white/20 rounded-md py-2 px-3"
                      onKeyPress={e => e.key === 'Enter' && addTodo()}
                    />
                    <button
                      onClick={addTodo}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      disabled={!newTodo.trim()}
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {projectTodos.map(todo => (
                    <div key={todo.id} className="flex items-center gap-3 p-3 bg-[#181818] rounded">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={e => toggleTodo(todo.id, e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className={`flex-1 ${todo.completed ? 'line-through text-[#F3E3C3]/50' : 'text-[#F3E3C3]'}`}>
                        {todo.task}
                      </span>
                    </div>
                  ))}
                  {projectTodos.length === 0 && (
                    <p className="text-[#F3E3C3]/70 text-center py-4">No todos yet. Add one above!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- CMS Section ---
function CmsSection({ portfolioImages, addPortfolioImage, deletePortfolioImage, updatePortfolioImageOrder }) {
  const [newImage, setNewImage] = useState({ url: '', category: '', caption: '' });
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', ...new Set(portfolioImages?.map(img => img.category) || [])];
  const filteredImages = selectedCategory === 'All' 
    ? portfolioImages 
    : portfolioImages?.filter(img => img.category === selectedCategory);

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (newImage.url && newImage.category) {
      await addPortfolioImage(newImage);
      setNewImage({ url: '', category: '', caption: '' });
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(filteredImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updates = items.map((item, index) => 
      updatePortfolioImageOrder(item.id, index, item.category)
    );
    
    await Promise.all(updates);
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xl font-bold mb-4">Add Portfolio Image</h4>
        <form onSubmit={handleAddImage} className="grid md:grid-cols-3 gap-4">
          <input
            type="url"
            value={newImage.url}
            onChange={e => setNewImage(img => ({ ...img, url: e.target.value }))}
            placeholder="Image URL"
            className="bg-[#181818] border border-white/20 rounded-md py-2 px-3"
            required
          />
          <input
            type="text"
            value={newImage.category}
            onChange={e => setNewImage(img => ({ ...img, category: e.target.value }))}
            placeholder="Category"
            className="bg-[#181818] border border-white/20 rounded-md py-2 px-3"
            required
          />
          <input
            type="text"
            value={newImage.caption}
            onChange={e => setNewImage(img => ({ ...img, caption: e.target.value }))}
            placeholder="Caption (optional)"
            className="bg-[#181818] border border-white/20 rounded-md py-2 px-3"
          />
          <button type="submit" className="bg-[#F3E3C3] text-[#1a1a1a] font-bold py-2 px-4 rounded-md">
            Add Image
          </button>
        </form>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-bold">Portfolio Images ({portfolioImages?.length || 0})</h4>
          <div className="flex gap-2">
            <label className="text-sm font-medium text-[#F3E3C3]">Filter by category:</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-[#181818] border border-white/20 rounded-md py-1 px-2 text-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="portfolio-images">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`grid md:grid-cols-2 lg:grid-cols-3 gap-4 ${
                  snapshot.isDraggingOver ? 'bg-blue-500/5 rounded-lg p-2' : ''
                }`}
              >
                {filteredImages?.map((img, index) => (
                  <Draggable key={img.id} draggableId={img.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-[#232323] rounded p-4 relative group ${
                          snapshot.isDragging ? 'rotate-2 shadow-2xl z-50' : ''
                        } transition-transform hover:scale-105`}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="absolute top-2 right-2 cursor-grab active:cursor-grabbing bg-[#F3E3C3] text-[#1a1a1a] rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Drag to reorder"
                        >
                          ⋮⋮
                        </div>
                        
                        <div className="relative">
                          <img 
                            src={img.url} 
                            alt={img.caption || img.category} 
                            className="w-full h-32 object-cover rounded mb-2" 
                          />
                          {img.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/75 p-1 rounded-b text-xs">
                              <p className="text-[#F3E3C3]/75 font-vintage-text italic leading-relaxed">
                                {img.caption}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-[#F3E3C3]/80">
                            <strong>Category:</strong> {img.category}
                          </p>
                          <p className="text-xs text-[#F3E3C3]/60">
                            <strong>Order:</strong> {img.order_index || 0}
                          </p>
                          {img.caption && (
                            <p className="text-xs text-[#F3E3C3]/60">
                              <strong>Caption:</strong> {img.caption}
                            </p>
                          )}
                        </div>
                        
                        <button
                          onClick={() => deletePortfolioImage(img.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs mt-3 w-full hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        
        {(!filteredImages || filteredImages.length === 0) && (
          <div className="text-center text-[#F3E3C3]/70 py-8">
            No images found for "{selectedCategory}" category.
          </div>
        )}
      </div>
    </div>
  );
}

// --- Blog Admin Section ---
function BlogAdminSection({ 
  blogPosts, 
  createBlogPost, 
  updateBlogPost, 
  deleteBlogPost, 
  blogEdit, 
  setBlogEdit, 
  blogSaving, 
  blogAdminError 
}) {
  const [newPost, setNewPost] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: 'Studio37',
    category: '',
    tags: '',
    publish_date: new Date().toISOString().split('T')[0]
  });

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const tagsArray = newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    await createBlogPost({ ...newPost, tags: tagsArray });
    setNewPost({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      author: 'Studio37',
      category: '',
      tags: '',
      publish_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (blogEdit) {
      const tagsArray = typeof blogEdit.tags === 'string' 
        ? blogEdit.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : blogEdit.tags || [];
      await updateBlogPost(blogEdit.id, { ...blogEdit, tags: tagsArray });
      setBlogEdit(null);
    }
  };

  return (
    <div className="space-y-6">
      {blogAdminError && (
        <div className="bg-red-500/20 text-red-400 p-4 rounded">{blogAdminError}</div>
      )}
      
      <div>
        <h4 className="text-xl font-bold mb-4">Create New Blog Post</h4>
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              value={newPost.title}
              onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
              placeholder="Post Title"
              className="bg-[#181818] border border-white/20 rounded-md py-2 px-3"
              required
            />
            <input
              type="text"
              value={newPost.slug}
              onChange={e => setNewPost(p => ({ ...p, slug: e.target.value }))}
              placeholder="URL Slug"
              className="bg-[#181818] border border-white/20 rounded-md py-2 px-3"
              required
            />
          </div>
          <textarea
            value={newPost.excerpt}
            onChange={e => setNewPost(p => ({ ...p, excerpt: e.target.value }))}
            placeholder="Post Excerpt"
            className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3"
            rows={2}
          />
          <textarea
            value={newPost.content}
            onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
            placeholder="Post Content (Markdown supported)"
            className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3"
            rows={8}
          />
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              value={newPost.category}
              onChange={e => setNewPost(p => ({ ...p, category: e.target.value }))}
              placeholder="Category"
              className="bg-[#181818] border border-white/20 rounded-md py-2 px-3"
            />
            <input
              type="text"
              value={newPost.tags}
              onChange={e => setNewPost(p => ({ ...p, tags: e.target.value }))}
              placeholder="Tags (comma separated)"
              className="bg-[#181818] border border-white/20 rounded-md py-2 px-3"
            />
            <input
              type="date"
              value={newPost.publish_date}
              onChange={e => setNewPost(p => ({ ...p, publish_date: e.target.value }))}
              className="bg-[#181818] border border-white/20 rounded-md py-2 px-3"
            />
          </div>
          <button 
            type="submit" 
            className="bg-[#F3E3C3] text-[#1a1a1a] font-bold py-2 px-4 rounded-md"
            disabled={blogSaving}
          >
            {blogSaving ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </div>

      <div>
        <h4 className="text-xl font-bold mb-4">Existing Blog Posts</h4>
        <div className="space-y-4">
          {blogPosts?.map(post => (
            <div key={post.id} className="bg-[#232323] rounded p-4">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-bold text-white">{post.title}</h5>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBlogEdit({
                      ...post,
                      tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || '')
                    })}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteBlogPost(post.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-[#F3E3C3]/80 text-sm">{post.excerpt}</p>
              <div className="text-xs text-[#F3E3C3]/60 mt-2">
                {post.publish_date ? new Date(post.publish_date).toLocaleDateString() : ''} | {post.category}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {blogEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232323] rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-display text-white mb-4">Edit Blog Post</h3>
            <form onSubmit={handleUpdatePost} className="space-y-4">
              <input
                type="text"
                value={blogEdit.title || ''}
                onChange={e => setBlogEdit(p => ({ ...p, title: e.target.value }))}
                placeholder="Post Title"
                className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3"
              />
              <textarea
                value={blogEdit.content || ''}
                onChange={e => setBlogEdit(p => ({ ...p, content: e.target.value }))}
                placeholder="Post Content"
                className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3"
                rows={12}
              />
              <div className="flex gap-2 mt-6">
                <button type="submit" className="bg-[#F3E3C3] text-[#1a1a1a] font-bold py-2 px-4 rounded-md">
                  Update Post
                </button>
                <button 
                  type="button" 
                  onClick={() => setBlogEdit(null)}
                  className="bg-gray-500 text-white py-2 px-4 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Site Map Tab ---
const SiteMapTab = ({ siteMapPage, setSiteMapPage, content, portfolioImages, blogPosts }) => {
  const [pages, setPages] = useState([
    { key: 'home', label: 'Home' },
    { key: 'about', label: 'About' },
    { key: 'services', label: 'Services' },
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'blog', label: 'Blog' },
    { key: 'contact', label: 'Contact' },
  ]);
  const [editingPage, setEditingPage] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleEditPage = (pageKey) => {
    setEditingPage(pageKey);
    setSaveError('');
    setSaveSuccess(false);
    
    let title = '', contentMd = '';
    switch (pageKey) {
      case 'about':
        title = content.about?.title || 'About Us';
        contentMd = content.about?.bio || '';
        break;
      case 'home':
        title = 'Capture. Create. Captivate.';
        contentMd = 'Vintage heart, modern vision. Full-service photography and content strategy for brands ready to conquer the world from Houston, TX.';
        break;
      default:
        title = pageKey.charAt(0).toUpperCase() + pageKey.slice(1);
        contentMd = `Content for ${pageKey} page.`;
    }
    setEditForm({ title, content: contentMd });
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      if (editingPage === 'about') {
        const { data: existingData } = await supabase
          .from('about')
          .select('id')
          .limit(1);

        if (existingData && existingData.length > 0) {
          const { error } = await supabase
            .from('about')
            .update({
              title: editForm.title,
              bio: editForm.content
            })
            .eq('id', existingData[0].id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('about')
            .insert([{
              title: editForm.title,
              bio: editForm.content
            }]);

          if (error) throw error;
        }

        setSaveSuccess(true);
        setTimeout(() => {
          setEditingPage(null);
          setSaveSuccess(false);
          window.location.reload();
        }, 1000);
      } else {
        setSaveError(`Saving for ${editingPage} page is not yet implemented. Only About page editing is currently supported.`);
      }
    } catch (error) {
      console.error('Error saving page content:', error);
      setSaveError(`Failed to save changes: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h4 className="text-xl font-bold mb-4">Site Structure</h4>
        <div className="space-y-2">
          {pages.map(page => (
            <div key={page.key} className="flex items-center justify-between p-3 bg-[#232323] rounded">
              <div>
                <button
                  onClick={() => setSiteMapPage(page.key)}
                  className={`font-bold ${siteMapPage === page.key ? 'text-[#F3E3C3]' : 'text-[#F3E3C3]/70'}`}
                >
                  {page.label}
                </button>
              </div>
              <button
                onClick={() => handleEditPage(page.key)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                disabled={saving}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-xl font-bold mb-4">Live Preview</h4>
        <div className="p-4 bg-[#232323] rounded min-h-64">
          <SiteMapPreview 
            page={siteMapPage} 
            content={content}
            portfolioImages={portfolioImages}
            blogPosts={blogPosts}
          />
        </div>
      </div>

      {/* Edit Modal */}
      {editingPage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232323] rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-display text-white mb-4">
              Edit {editingPage.charAt(0).toUpperCase() + editingPage.slice(1)} Page
            </h3>
            
            {saveSuccess && (
              <div className="bg-green-500/20 text-green-400 p-3 rounded mb-4">
                ✓ Changes saved successfully! Refreshing...
              </div>
            )}
            
            {saveError && (
              <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4">
                {saveError}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#F3E3C3] mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Page Title"
                  className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3 text-[#F3E3C3]"
                  disabled={saving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#F3E3C3] mb-2">
                  Page Content (Markdown supported)
                </label>
                <textarea
                  value={editForm.content}
                  onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Page Content (Markdown supported)"
                  rows={8}
                  className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3 text-[#F3E3C3]"
                  disabled={saving}
                />
              </div>
              
              {editingPage === 'about' && (
                <div className="bg-blue-500/20 text-blue-300 p-3 rounded text-sm">
                  <strong>Note:</strong> Changes to the About page will be saved to your database and will appear immediately on your live site.
                </div>
              )}
              
              {editingPage !== 'about' && (
                <div className="bg-yellow-500/20 text-yellow-300 p-3 rounded text-sm">
                  <strong>Note:</strong> Currently, only the About page can be edited and saved. Other pages require additional database setup.
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-6">
              <button 
                onClick={handleSaveChanges}
                className="bg-[#F3E3C3] text-[#1a1a1a] font-bold py-2 px-4 rounded-md hover:bg-[#F3E3C3]/90 transition disabled:opacity-50"
                disabled={saving || !editForm.title.trim()}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                onClick={() => setEditingPage(null)}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition"
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Enhanced Analytics Section with Win Rates ---
function AnalyticsSection({ leads, projects, blogPosts }) {
  const totalLeads = leads?.length || 0;
  const totalProjects = projects?.length || 0;
  const totalBlogPosts = blogPosts?.length || 0;
  
  const leadsByStatus = leads?.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {}) || {};

  const projectsByStage = projects?.reduce((acc, project) => {
    acc[project.stage] = (acc[project.stage] || 0) + 1;
    return acc;
  }, {}) || {};

  const totalRevenue = projects?.reduce((sum, project) => {
    return sum + (project.opportunity_amount || 0);
  }, 0) || 0;

  // Calculate win rates
  const wonLeads = leadsByStatus['Won'] || 0;
  const lostLeads = leadsByStatus['Lost'] || 0;
  const closedLeads = wonLeads + lostLeads;
  const leadWinRate = closedLeads > 0 ? ((wonLeads / closedLeads) * 100).toFixed(1) : 0;

  const wonProjects = projectsByStage['Won'] || 0;
  const cancelledProjects = projectsByStage['Cancelled'] || 0;
  const closedProjects = wonProjects + cancelledProjects;
  const projectWinRate = closedProjects > 0 ? ((wonProjects / closedProjects) * 100).toFixed(1) : 0;

  // Calculate won revenue
  const wonRevenue = projects?.reduce((sum, project) => {
    return project.stage === 'Won' ? sum + (project.opportunity_amount || 0) : sum;
  }, 0) || 0;

  // Calculate conversion funnel
  const newLeads = leadsByStatus['New'] || 0;
  const contactedLeads = leadsByStatus['Contacted'] || 0;
  const bookedLeads = leadsByStatus['Booked'] || 0;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Overview Card */}
      <div className="bg-[#232323] rounded-lg p-6">
        <h4 className="text-lg font-bold mb-4">Overview</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Total Leads:</span>
            <span className="font-bold text-[#F3E3C3]">{totalLeads}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Projects:</span>
            <span className="font-bold text-[#F3E3C3]">{totalProjects}</span>
          </div>
          <div className="flex justify-between">
            <span>Blog Posts:</span>
            <span className="font-bold text-[#F3E3C3]">{totalBlogPosts}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Revenue:</span>
            <span className="font-bold text-green-400">${totalRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Win Rates & Revenue Card */}
      <div className="bg-[#232323] rounded-lg p-6">
        <h4 className="text-lg font-bold mb-4">Performance Metrics</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Lead Win Rate:</span>
            <span className={`font-bold ${parseFloat(leadWinRate) >= 50 ? 'text-green-400' : parseFloat(leadWinRate) >= 25 ? 'text-yellow-400' : 'text-red-400'}`}>
              {leadWinRate}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Project Win Rate:</span>
            <span className={`font-bold ${parseFloat(projectWinRate) >= 50 ? 'text-green-400' : parseFloat(projectWinRate) >= 25 ? 'text-yellow-400' : 'text-red-400'}`}>
              {projectWinRate}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Won Revenue:</span>
            <span className="font-bold text-green-400">${wonRevenue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Won Leads:</span>
            <span className="text-green-400">{wonLeads}/{closedLeads}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Won Projects:</span>
            <span className="text-green-400">{wonProjects}/{closedProjects}</span>
          </div>
        </div>
      </div>

      {/* Conversion Funnel Card */}
      <div className="bg-[#232323] rounded-lg p-6">
        <h4 className="text-lg font-bold mb-4">Lead Funnel</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>New:</span>
            <span className="font-bold text-blue-400">{newLeads}</span>
          </div>
          <div className="flex justify-between">
            <span>Contacted:</span>
            <span className="font-bold text-purple-400">{contactedLeads}</span>
          </div>
          <div className="flex justify-between">
            <span>Booked:</span>
            <span className="font-bold text-yellow-400">{bookedLeads}</span>
          </div>
          <div className="flex justify-between">
            <span>Won:</span>
            <span className="font-bold text-green-400">{wonLeads}</span>
          </div>
          <div className="flex justify-between">
            <span>Lost:</span>
            <span className="font-bold text-red-400">{lostLeads}</span>
          </div>
          <div className="pt-2 border-t border-white/10">
            <div className="flex justify-between text-sm">
              <span>Conversion Rate:</span>
              <span className="text-[#F3E3C3]">
                {totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Leads by Status */}
      <div className="bg-[#232323] rounded-lg p-6">
        <h4 className="text-lg font-bold mb-4">Leads by Status</h4>
        <div className="space-y-2">
          {Object.entries(leadsByStatus).map(([status, count]) => (
            <div key={status} className="flex justify-between">
              <span className={status === 'Won' ? 'text-green-400' : status === 'Lost' ? 'text-red-400' : ''}>
                {status}:
              </span>
              <span className={`font-bold ${status === 'Won' ? 'text-green-400' : status === 'Lost' ? 'text-red-400' : 'text-[#F3E3C3]'}`}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Projects by Stage */}
      <div className="bg-[#232323] rounded-lg p-6">
        <h4 className="text-lg font-bold mb-4">Projects by Stage</h4>
        <div className="space-y-2">
          {Object.entries(projectsByStage).map(([stage, count]) => (
            <div key={stage} className="flex justify-between">
              <span className={stage === 'Won' ? 'text-green-400' : stage === 'Cancelled' ? 'text-red-400' : ''}>
                {stage}:
              </span>
              <span className={`font-bold ${stage === 'Won' ? 'text-green-400' : stage === 'Cancelled' ? 'text-red-400' : 'text-[#F3E3C3]'}`}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-[#232323] rounded-lg p-6">
        <h4 className="text-lg font-bold mb-4">Revenue Analysis</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Total Pipeline:</span>
            <span className="font-bold text-[#F3E3C3]">${totalRevenue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Won Revenue:</span>
            <span className="font-bold text-green-400">${wonRevenue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Pipeline Value:</span>
            <span className="font-bold text-blue-400">${(totalRevenue - wonRevenue).toLocaleString()}</span>
          </div>
          <div className="pt-2 border-t border-white/10">
            <div className="flex justify-between text-sm">
              <span>Avg Deal Size:</span>
              <span className="text-[#F3E3C3]">
                ${totalProjects > 0 ? Math.round(totalRevenue / totalProjects).toLocaleString() : 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Avg Won Deal:</span>
              <span className="text-green-400">
                ${wonProjects > 0 ? Math.round(wonRevenue / wonProjects).toLocaleString() : 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}