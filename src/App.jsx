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

const HomePage = () => (
  <div className="relative h-screen flex items-center justify-center text-center text-white px-4 -mt-20">
    <img src="https://res.cloudinary.com/dmjxho2rl/image/upload/a_vflip/l_image:upload:My%20Brand:IMG_2115_mtuowt/c_scale,fl_relative,w_0.35/o_100/fl_layer_apply,g_north,x_0.03,y_0.04/v1758172510/A4B03835-ED8B-4FBB-A27E-1F2EE6CA1A18_1_105_c_gstgil.jpg" alt="Studio37 Hero" className="absolute inset-0 w-full h-full object-cover"/>
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
  
  // Memoize filtered images
  const filteredImages = useMemo(() => {
    const categories = ['All', ...new Set(images.map(img => img.category))];
    return filter === 'All' ? images : images.filter(img => img.category === filter);
  }, [images, filter]);

  const categories = useMemo(() => 
    ['All', ...new Set(images.map(img => img.category))], 
    [images]
  );

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
                  />
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/75 backdrop-blur-sm p-3 rounded-b-lg">
                      <p className="text-[#F3E3C3]/75 text-sm font-serif italic leading-relaxed">
                        {img.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Add performance monitoring and error boundaries
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

// --- Add missing Footer component ---
const Footer = () => (
  <footer className="bg-[#232323] text-[#F3E3C3] py-12">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <Logo />
            <span className="font-display text-xl font-bold tracking-tight text-white">Studio37</span>
          </div>
          <p className="text-[#F3E3C3]/70">
            Vintage heart, modern vision. Full-service photography and content strategy.
          </p>
        </div>
        <div>
          <h4 className="font-display text-lg mb-4">Quick Links</h4>
          <div className="space-y-2">
            <Link to="/about" className="block text-[#F3E3C3]/70 hover:text-white transition">About</Link>
            <Link to="/services" className="block text-[#F3E3C3]/70 hover:text-white transition">Services</Link>
            <Link to="/portfolio" className="block text-[#F3E3C3]/70 hover:text-white transition">Portfolio</Link>
            <Link to="/blog" className="block text-[#F3E3C3]/70 hover:text-white transition">Blog</Link>
            <Link to="/contact" className="block text-[#F3E3C3]/70 hover:text-white transition">Contact</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-lg mb-4">Contact Info</h4>
          <div className="space-y-2 text-[#F3E3C3]/70">
            <p>Email: sales@studio37.cc</p>
            <p>Phone: (832) 713-9944</p>
            <p>Serving Greater Houston Area</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 mt-8 pt-8 text-center text-[#F3E3C3]/60">
        <p>&copy; 2024 Studio37. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

const OptimizedImage = ({ src, alt, className, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-300 animate-pulse rounded" />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
        {...props}
      />
      {error && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
          Failed to load image
        </div>
      )}
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

// --- Site Map Preview ---
function SiteMapPreview({ page, content, portfolioImages, blogPosts }) {
  switch (page) {
    case 'about':
      return (
        <div>
          <h3 className="text-lg font-bold mb-2">{content.about?.title || 'About Us'}</h3>
          <div className="text-[#F3E3C3]/80">
            {content.about?.bio ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm prose-invert max-w-none">
                {content.about.bio}
              </ReactMarkdown>
            ) : (
              <p>About content...</p>
            )}
          </div>
        </div>
      );
    case 'portfolio':
      return (
        <div>
          <h3 className="text-lg font-bold mb-2">Portfolio</h3>
          <div className="grid grid-cols-3 gap-2">
            {portfolioImages?.slice(0, 6).map(img => (
              <div key={img.id} className="relative">
                <img 
                  src={img.url} 
                  alt={img.category} 
                  className="w-full h-16 object-cover rounded" 
                />
                {img.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/75 p-1 rounded-b text-xs">
                    <p className="text-[#F3E3C3]/75 font-vintage-text italic leading-relaxed">
                      {img.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-[#F3E3C3]/60 mt-2">{portfolioImages?.length || 0} images</p>
        </div>
      );
    case 'blog':
      return (
        <div>
          <h3 className="text-lg font-bold mb-2">Blog</h3>
          <div className="space-y-2">
            {blogPosts?.slice(0, 3).map(post => (
              <div key={post.id} className="bg-[#181818] p-2 rounded text-xs">
                <div className="font-bold">{post.title}</div>
                <div className="text-[#F3E3C3]/60">{post.excerpt?.substring(0, 60)}...</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#F3E3C3]/60 mt-2">{blogPosts?.length || 0} posts</p>
        </div>
      );
    default:
      return (
        <div>
          <h3 className="text-lg font-bold mb-2">{page.charAt(0).toUpperCase() + page.slice(1)}</h3>
          <p className="text-[#F3E3C3]/70">Preview for {page} page...</p>
        </div>
      );
  }
}