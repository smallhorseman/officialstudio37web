import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PhotoshootPlanner from './PhotoshootPlanner';
import ConversationalPlanner from './ConversationalPlanner';
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
    const { data } = await supabase.from('portfolio_images').insert([image]).select();
    if (data && data[0]) setPortfolioImages(imgs => [data[0], ...imgs]);
  }
  async function deletePortfolioImage(id) {
    await supabase.from('portfolio_images').delete().eq('id', id);
    setPortfolioImages(imgs => imgs.filter(img => img.id !== id));
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
            <PortfolioPage
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
          <h2 className="text-4xl md:text-5xl font-display mb-6">{content.title || 'Loading...'}</h2>
          <p className="text-lg text-[#F3E3C3]/80 leading-relaxed">{content.bio || ''}</p>
        </div>
        <div className="order-1 md:order-2">
            <div className="polaroid mx-auto max-w-sm">
                <img src="https://placehold.co/500x500/cccccc/333333?text=Christian+%26+Caittie" alt="Christian and Caittie" className="w-full" />
                <p className="text-center text-black font-display text-lg mt-4">The Studio37 Team</p>
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

const PortfolioPage = ({ isUnlocked, onUnlock, images }) => {
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...new Set(images.map(img => img.category))];
  const filteredImages = filter === 'All' ? images : images.filter(img => img.category === filter);

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
                <div key={img.id} className="break-inside-avoid">
                  <img src={img.url} alt={`${img.category} photography`} className="w-full rounded-lg shadow-lg hover:opacity-90 transition-opacity" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

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

/* Removed duplicate ContactPage definition to resolve redeclaration error. */

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

// --- Site Map Tab with Flowchart and Live Preview (SINGLE DECLARATION) ---
const defaultSiteMapPages = [
  { key: 'home', label: 'Home' },
  { key: 'about', label: 'About' },
  { key: 'services', label: 'Services' },
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'blog', label: 'Blog' },
  { key: 'contact', label: 'Contact' },
];

const SiteMapTab = ({ siteMapPage, setSiteMapPage, content, portfolioImages, blogPosts }) => {
  const [pages, setPages] = React.useState(defaultSiteMapPages);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [editingPage, setEditingPage] = React.useState(null);
  const [editForm, setEditForm] = React.useState({ title: '', content: '' });
  const [saving, setSaving] = React.useState(false);

  // Load order from Supabase
  React.useEffect(() => {
    setLoading(true);
    setError('');
    supabase
      .from('site_map_order')
      .select('*')
      .order('order_index', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError('Failed to load site map order.');
        else if (data && data.length > 0) {
          setPages(data.map(row => ({ key: row.page_key, label: row.page_label })));
        }
        setLoading(false);
      });
  }, []);

  // Load page content for editing
  const handleEditPage = async (pageKey) => {
    setEditingPage(pageKey);
    setSaving(false);
    let title = '';
    let contentMd = '';
    
    switch (pageKey) {
      case 'about':
        title = content.about.title || 'About Us';
        contentMd = content.about.bio || '';
        break;
      case 'services':
        title = 'Our Services';
        contentMd = 'From comprehensive brand management to capturing your most precious personal moments.\n\n## Content & Marketing Packages\n- Director Package ($2,000+)\n- Producer Package ($1,200+)\n- Brand Builder ($750+)\n- Content Day ($500+)\n\n## Portrait Packages\n- Mini Reel ($75)\n- Full Episode ($150)\n- Movie Premier ($300)';
        break;
      case 'home':
        title = 'Capture. Create. Captivate.';
        contentMd = 'Vintage heart, modern vision. Full-service photography and content strategy for brands ready to conquer the world from Houston, TX.\n\n**Ready to start your project?** [View Our Work](/portfolio) or [Get In Touch](/contact)';
        break;
      case 'contact':
        title = 'Get In Touch';
        contentMd = "Ready to start your project? Let's talk. We serve Houston, TX and the surrounding 50-mile radius.\n\n**Contact Information:**\n- Email: sales@studio37.cc\n- Phone: (832) 713-9944\n- Location: Greater Houston Area";
        break;
      case 'blog':
        title = 'Blog';
        contentMd = 'Stories, tips, and behind-the-scenes from Studio37.\n\nDiscover photography techniques, client stories, and creative inspiration.';
        break;
      case 'portfolio':
        title = 'Our Work';
        contentMd = 'A curated selection of our favorite moments and projects.\n\nFrom intimate portraits to grand brand campaigns, each image tells a story.';
        break;
      default:
        title = pageKey.charAt(0).toUpperCase() + pageKey.slice(1);
        contentMd = `Content for ${pageKey} page.`;
    }
    
    setEditForm({ title, content: contentMd });
  };

  // Save page content
  const handleSavePage = async () => {
    setSaving(true);
    try {
      if (editingPage === 'about') {
        await supabase.from('site_content').update({
          about_title: editForm.title,
          about_bio: editForm.content
        }).eq('id', 1);
      }
    } catch (error) {
      console.error('Error saving page:', error);
    }
    setSaving(false);
    setEditingPage(null);
  };

  // Save order to Supabase
  const saveOrder = async (newPages) => {
    for (let i = 0; i < newPages.length; i++) {
      await supabase
        .from('site_map_order')
        .update({ order_index: i })
        .eq('page_key', newPages[i].key);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(pages);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setPages(reordered);
    saveOrder(reordered);
  };

  if (loading) return <div className="text-[#F3E3C3]">Loading site map...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-8">
        <div>
          <h4 className="text-xl font-display mb-4">Page Navigation</h4>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="siteMapPages">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                  {pages.map((page, idx) => (
                    <Draggable key={page.key} draggableId={page.key} index={idx}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex items-center justify-between p-3 rounded ${snapshot.isDragging ? 'opacity-80 bg-[#333]' : 'bg-[#262626]'}`}
                        >
                          <button
                            onClick={() => setSiteMapPage(page.key)}
                            className={`flex-1 text-left px-2 py-1 rounded transition-colors ${siteMapPage === page.key ? 'bg-[#F3E3C3] text-[#1a1a1a] font-bold' : 'text-[#F3E3C3] hover:bg-[#F3E3C3]/10'}`}
                          >
                            {page.label}
                          </button>
                          <button
                            className="ml-2 text-xs px-2 py-1 bg-[#F3E3C3] text-[#1a1a1a] rounded hover:bg-[#f3e3c3cc] transition"
                            onClick={() => handleEditPage(page.key)}
                            type="button"
                          >
                            Edit
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
        </div>

        <div className="md:col-span-2">
          <h4 className="text-xl font-display mb-4">
            {editingPage ? `Editing: ${pages.find(p => p.key === editingPage)?.label}` : 'Page Preview'}
          </h4>
          
          {editingPage ? (
            <form
              className="space-y-4"
              onSubmit={e => {
                e.preventDefault();
                handleSavePage();
              }}
            >
              <input
                type="text"
                value={editForm.title}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Page Title"
                className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 font-bold"
                required
              />
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-[#F3E3C3]/70">Content (Markdown)</label>
                  <textarea
                    value={editForm.content}
                    onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
                    placeholder="Write your content in Markdown..."
                    rows={15}
                    className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 font-mono text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-2 text-[#F3E3C3]/70">Live Preview</label>
                  <div className="bg-[#232323] border border-white/10 rounded-md p-4 min-h-[400px] overflow-auto">
                    <div className="prose prose-invert prose-sm max-w-none text-[#F3E3C3]/90">
                      <h1 className="font-display text-xl">{editForm.title}</h1>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {editForm.content || 'Nothing to preview...'}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-[#F3E3C3] text-[#1a1a1a] font-bold py-2 px-4 rounded-md"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="bg-gray-500 text-white py-2 px-4 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-[#181818] rounded-lg p-6 min-h-[400px]">
              <SiteMapPreview page={siteMapPage} content={content} portfolioImages={portfolioImages} blogPosts={blogPosts} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Live Preview Renderer for Each Page (SINGLE DECLARATION) ---
const SiteMapPreview = ({ page, content, portfolioImages, blogPosts }) => {
  switch (page) {
    case 'home':
      return (
        <div>
          <h1 className="text-3xl font-display mb-2">Capture. Create. Captivate.</h1>
          <p className="text-[#F3E3C3]/80 mb-4">Vintage heart, modern vision. Full-service photography and content strategy for brands ready to conquer the world from Houston, TX.</p>
        </div>
      );
    case 'about':
      return (
        <div>
          <h2 className="text-2xl font-display mb-2">{content.about.title}</h2>
          <p className="text-[#F3E3C3]/80">{content.about.bio}</p>
        </div>
      );
    case 'services':
      return <div><h2 className="text-2xl font-display mb-2">Our Services</h2><p className="text-[#F3E3C3]/80">From comprehensive brand management to capturing your most precious personal moments.</p></div>;
    case 'portfolio':
      return (
        <div>
          <h2 className="text-2xl font-display mb-2">Our Work</h2>
          <div className="flex flex-wrap gap-2">
            {portfolioImages.slice(0, 4).map(img => (
              <img key={img.id} src={img.url} alt={img.category} className="w-20 h-20 object-cover rounded" />
            ))}
          </div>
        </div>
      );
    case 'blog':
      return (
        <div>
          <h2 className="text-2xl font-display mb-2">Blog</h2>
          <ul className="list-disc ml-6">
            {blogPosts.slice(0, 3).map(post => (
              <li key={post.id} className="text-[#F3E3C3]/80">{post.title}</li>
            ))}
          </ul>
        </div>
      );
    case 'contact':
      return (
        <div>
          <h2 className="text-2xl font-display mb-2">Get In Touch</h2>
          <p className="text-[#F3E3C3]/80">Ready to start your project? Let's talk. We serve Houston, TX and the surrounding 50-mile radius.</p>
        </div>
      );
    default:
      return null;
  }
};

// --- BlogPage Component (add this before App or near other page components) ---
function BlogPage({ posts, loading, error }) {
  if (loading) {
    return <div className="text-[#F3E3C3] text-center py-10">Loading blog posts...</div>;
  }
  if (error) {
    return <div className="text-red-400 text-center py-10">{error}</div>;
  }
  if (!posts || posts.length === 0) {
    return <div className="text-[#F3E3C3]/70 text-center py-10">No blog posts found.</div>;
  }
  return (
    <div className="py-20 md:py-28 bg-[#212121]">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-display mb-10">Blog</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <div key={post.id} className="bg-[#262626] rounded-lg shadow-lg p-6 flex flex-col">
              <h3 className="text-2xl font-bold mb-2 text-white">{post.title}</h3>
              <div className="text-xs text-[#F3E3C3]/60 mb-2">{post.author} &middot; {post.publish_date ? new Date(post.publish_date).toLocaleDateString() : ''}</div>
              <div className="text-[#F3E3C3]/80 mb-4">{post.excerpt}</div>
              {/* Use Link for internal navigation */}
              <Link to={`/blog/${post.slug}`} className="text-[#F3E3C3] hover:underline mt-auto">Read More</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Error Fallback UI ---
function ErrorFallback({ message }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
      <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
      <p className="text-[#F3E3C3]/80">{message || 'An unexpected error occurred. Please try again later.'}</p>
    </div>
  );
}

// --- Footer Component (add this at the end of the file) ---
function Footer() {
  return (
    <footer className="bg-[#232323] text-[#F3E3C3] py-8 mt-20">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-lg">Studio37</span>
          <span className="text-xs">&copy; {new Date().getFullYear()}</span>
        </div>
        <nav className="flex gap-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/about" className="hover:underline">About</Link>
          <Link to="/services" className="hover:underline">Services</Link>
          <Link to="/portfolio" className="hover:underline">Portfolio</Link>
          <Link to="/blog" className="hover:underline">Blog</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}

// --- Enhanced CRM Section with SMS and improved functionality ---
function CrmSection({ leads, updateLeadStatus }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const [showContactHistory, setShowContactHistory] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [newContact, setNewContact] = useState({ type: 'email', subject: '', message: '' });
  const [leadNotes, setLeadNotes] = useState([]);
  const [contactHistory, setContactHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLeadNotes = async (leadId) => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching lead notes:', error);
        setError('Failed to load notes');
        setLeadNotes([]);
      } else {
        setLeadNotes(data || []);
      }
    } catch (err) {
      console.error('Exception fetching lead notes:', err);
      setError('Failed to load notes');
      setLeadNotes([]);
    }
    setLoading(false);
  };

  const fetchContactHistory = async (leadId) => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('contact_history')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching contact history:', error);
        setError('Failed to load contact history');
        setContactHistory([]);
      } else {
        setContactHistory(data || []);
      }
    } catch (err) {
      console.error('Exception fetching contact history:', err);
      setError('Failed to load contact history');
      setContactHistory([]);
    }
    setLoading(false);
  };

  const addNote = async () => {
    if (!newNote.trim() || !selectedLead) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('lead_notes').insert([{
        lead_id: selectedLead.id,
        note: newNote,
        status: 'Manual'
      }]);
      
      if (error) {
        console.error('Error adding note:', error);
        setError('Failed to add note: ' + error.message);
      } else {
        setNewNote('');
        await fetchLeadNotes(selectedLead.id);
        setError(''); // Clear any previous errors
      }
    } catch (err) {
      console.error('Exception adding note:', err);
      setError('Failed to add note');
    }
    setLoading(false);
  };

  const sendSms = (lead) => {
    if (!lead.phone) {
      alert('No phone number available for this lead');
      return;
    }
    setSelectedLead(lead);
    setShowSmsModal(true);
    setSmsMessage(`Hi ${lead.name}, this is Studio37. `);
  };

  const handleSendSms = () => {
    if (!selectedLead || !selectedLead.phone || !smsMessage.trim()) return;
    
    // Open SMS app with pre-filled message
    const smsUrl = `sms:${selectedLead.phone}?body=${encodeURIComponent(smsMessage)}`;
    window.open(smsUrl, '_blank');
    
    // Log the SMS in contact history
    supabase.from('contact_history').insert([{
      lead_id: selectedLead.id,
      contact_type: 'text',
      subject: 'SMS Sent',
      message: smsMessage,
      status: 'Sent'
    }]);
    
    setShowSmsModal(false);
    setSmsMessage('');
  };

  const addContactEntry = async () => {
    if (!newContact.subject.trim() || !selectedLead) return;
    try {
      const { error } = await supabase.from('contact_history').insert([{
        lead_id: selectedLead.id,
        contact_type: newContact.type,
        subject: newContact.subject,
        message: newContact.message,
        status: 'Sent'
      }]);
      
      if (error) {
        console.error('Error adding contact entry:', error);
        setError('Failed to log contact');
      } else {
        setNewContact({ type: 'email', subject: '', message: '' });
        fetchContactHistory(selectedLead.id);
      }
    } catch (err) {
      console.error('Exception adding contact entry:', err);
      setError('Failed to log contact');
    }
  };

  const openLeadDetails = (lead) => {
    setSelectedLead(lead);
    setError('');
    fetchLeadNotes(lead.id);
    fetchContactHistory(lead.id);
  };

  if (!leads || leads.length === 0) {
    return <div className="text-[#F3E3C3]/70 py-8">No leads found.</div>;
  }

  const statuses = ['New', 'Contacted', 'Booked', 'Lost', 'Archived'];

  return (
    <div>
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded mb-4">
          {error}
          <button onClick={() => setError('')} className="ml-2 text-red-200 hover:text-white">✕</button>
        </div>
      )}
      
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
                  <a href={`mailto:${lead.email}`} className="text-[#F3E3C3] hover:underline">
                    {lead.email}
                  </a>
                </td>
                <td className="p-3">
                  {lead.phone ? (
                    <div className="flex items-center gap-2">
                      <a href={`tel:${lead.phone}`} className="text-[#F3E3C3] hover:underline">
                        {lead.phone}
                      </a>
                      <button
                        onClick={() => sendSms(lead)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                        title="Send SMS"
                      >
                        💬
                      </button>
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
                    <button
                      onClick={() => {
                        setSelectedLead(lead);
                        setShowNotes(true);
                        setError('');
                        fetchLeadNotes(lead.id);
                      }}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                      title="Notes"
                    >
                      📝
                    </button>
                    <a
                      href={`mailto:${lead.email}?subject=Studio37 Follow-up`}
                      className="bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600"
                      title="Email"
                    >
                      📧
                    </a>
                    {lead.phone && (
                      <button
                        onClick={() => sendSms(lead)}
                        className="bg-blue-400 text-white px-2 py-1 rounded text-xs hover:bg-blue-500"
                        title="Send SMS"
                      >
                        💬
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SMS Modal */}
      {showSmsModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232323] rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-display text-white">Send SMS to {selectedLead.name}</h3>
              <button
                onClick={() => {
                  setShowSmsModal(false);
                  setSmsMessage('');
                }}
                className="text-white text-2xl hover:text-gray-300"
              >
                &times;
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-[#F3E3C3]/80 mb-2">Phone: {selectedLead.phone}</p>
              <textarea
                value={smsMessage}
                onChange={e => setSmsMessage(e.target.value)}
                placeholder="Type your message..."
                rows={4}
                className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3"
              />
              <div className="text-xs text-[#F3E3C3]/60 mt-1">
                {smsMessage.length}/160 characters
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSendSms}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={!smsMessage.trim()}
              >
                Send SMS
              </button>
              <button
                onClick={() => {
                  setShowSmsModal(false);
                  setSmsMessage('');
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal - Fixed */}
      {showNotes && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232323] rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-display text-white">Notes for {selectedLead.name}</h3>
              <button
                onClick={() => {
                  setShowNotes(false);
                  setError('');
                }}
                className="text-white text-2xl hover:text-gray-300"
              >
                &times;
              </button>
            </div>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 px-3 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}
            
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
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <p className="text-[#F3E3C3]/70">Loading notes...</p>
              ) : leadNotes.length > 0 ? (
                leadNotes.map(note => (
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
                ))
              ) : (
                <p className="text-[#F3E3C3]/70">No notes yet. Add one above!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact History Modal */}
      {showContactHistory && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232323] rounded-lg shadow-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-display text-white">Contact History for {selectedLead.name}</h3>
              <button
                onClick={() => {
                  setShowContactHistory(false);
                  setError('');
                }}
                className="text-white text-2xl hover:text-gray-300"
              >
                &times;
              </button>
            </div>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 px-3 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}
            
            <div className="mb-6 bg-[#181818] rounded p-4">
              <h4 className="text-lg font-bold mb-3">Log New Contact</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <select
                  value={newContact.type}
                  onChange={e => setNewContact(c => ({ ...c, type: e.target.value }))}
                  className="bg-[#262626] border border-white/20 rounded-md py-2 px-3"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone Call</option>
                  <option value="text">Text Message</option>
                  <option value="meeting">Meeting</option>
                </select>
                <input
                  type="text"
                  value={newContact.subject}
                  onChange={e => setNewContact(c => ({ ...c, subject: e.target.value }))}
                  placeholder="Subject/Topic"
                  className="bg-[#262626] border border-white/20 rounded-md py-2 px-3"
                />
              </div>
              <textarea
                value={newContact.message}
                onChange={e => setNewContact(c => ({ ...c, message: e.target.value }))}
                placeholder="Contact details/message..."
                rows={3}
                className="w-full mt-3 bg-[#262626] border border-white/20 rounded-md py-2 px-3"
              />
              <button
                onClick={addContactEntry}
                className="mt-3 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                disabled={!newContact.subject.trim() || loading}
              >
                {loading ? 'Logging...' : 'Log Contact'}
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <p className="text-[#F3E3C3]/70">Loading contact history...</p>
              ) : contactHistory.length > 0 ? (
                contactHistory.map(contact => (
                  <div key={contact.id} className="bg-[#181818] rounded p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-bold text-[#F3E3C3]">{contact.subject}</h5>
                      <span className="text-xs px-2 py-1 bg-[#F3E3C3]/10 rounded">
                        {contact.contact_type}
                      </span>
                    </div>
                    {contact.message && (
                      <p className="text-[#F3E3C3]/80 mb-2">{contact.message}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#F3E3C3]/60">
                        {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : ''}
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                        {contact.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[#F3E3C3]/70">No contact history yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ...existing lead details modal code... */}
    </div>
  );
}

// --- Enhanced CMS Section (Portfolio Management Only) ---
function CmsSection({ portfolioImages, addPortfolioImage, deletePortfolioImage }) {
  const [imageUrl, setImageUrl] = useState('');
  const [imageCategory, setImageCategory] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [addingImage, setAddingImage] = useState(false);
  const [showPortfolioPreview, setShowPortfolioPreview] = useState(false);

  const handleAddImage = async (e) => {
    e.preventDefault();
    setAddingImage(true);
    await addPortfolioImage({
      url: imageUrl,
      category: imageCategory,
      caption: imageCaption,
      order_index: portfolioImages.length,
      created_at: new Date().toISOString()
    });
    setImageUrl('');
    setImageCategory('');
    setImageCaption('');
    setAddingImage(false);
  };

  return (
    <div>
      <h4 className="text-xl font-display mb-6">Portfolio Management</h4>
      
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-lg font-bold">Add New Image</h5>
            <button
              onClick={() => setShowPortfolioPreview(true)}
              className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
            >
              Preview Gallery
            </button>
          </div>
          <form onSubmit={handleAddImage} className="space-y-4">
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="Image URL"
              className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3"
              required
            />
            <input
              type="text"
              value={imageCategory}
              onChange={e => setImageCategory(e.target.value)}
              placeholder="Category"
              className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3"
            />
            <input
              type="text"
              value={imageCaption}
              onChange={e => setImageCaption(e.target.value)}
              placeholder="Caption"
              className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3"
            />
            <button
              type="submit"
              className="w-full bg-[#F3E3C3] text-[#1a1a1a] font-bold py-2 px-4 rounded-md"
              disabled={addingImage || !imageUrl}
            >
              {addingImage ? 'Adding...' : 'Add Image'}
            </button>
          </form>
        </div>

        <div>
          <h5 className="text-lg font-bold mb-4">Current Images ({portfolioImages.length})</h5>
          <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
            {portfolioImages.map(img => (
              <div key={img.id} className="relative group">
                <img src={img.url} alt={img.category} className="w-full h-20 object-cover rounded" />
                <button
                  onClick={() => deletePortfolioImage(img.id)}
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 py-1 rounded opacity-80 group-hover:opacity-100"
                  title="Delete"
                >
                  &times;
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b truncate">
                  {img.category || 'No category'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Preview Modal */}
      {showPortfolioPreview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#232323] rounded-lg shadow-xl p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-display text-white">Portfolio Gallery Preview</h3>
              <button
                onClick={() => setShowPortfolioPreview(false)}
                className="text-white text-2xl hover:text-gray-300"
              >
                &times;
              </button>
            </div>
            
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {portfolioImages.map(img => (
                <div key={img.id} className="break-inside-avoid group relative">
                  <img src={img.url} alt={img.category} className="w-full rounded-lg shadow-lg hover:opacity-90 transition-opacity" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-between p-3">
                    <span className="text-white text-sm bg-black/50 px-2 py-1 rounded self-start">
                      {img.category || 'No category'}
                    </span>
                    {img.caption && (
                      <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                        {img.caption}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// --- Admin Dashboard Component ---
const AdminDashboard = ({
  leads, updateLeadStatus, content, portfolioImages, addPortfolioImage, deletePortfolioImage,
  blogPosts, createBlogPost, updateBlogPost, deleteBlogPost, blogEdit, setBlogEdit, blogSaving, blogAdminError, projects, projectsLoading
}) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTodos, setProjectTodos] = useState([]);
  const [todosLoading, setTodosLoading] = useState(false);
  const [newTodo, setNewTodo] = useState('');
  const [activeTab, setActiveTab] = useState('crm');
  const [allProjects, setAllProjects] = useState([]); // New state for all projects
  const [allProjectsLoading, setAllProjectsLoading] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', client: '', opportunity_amount: '', stage: 'Inquiry', notes: '' });
  const projectStages = ['Inquiry', 'Proposal', 'Booked', 'In Progress', 'Delivered', 'Closed'];

  // Fetch internal projects only (client projects come from props)
  useEffect(() => {
    if (activeTab === 'projects') {
      setInternalProjectsLoading(true);
      supabase.from('projects').select('*').eq('is_internal', true).order('created_at', { ascending: false }).then(({ data }) => {
        setInternalProjects(data || []);
        setInternalProjectsLoading(false);
      });
    }
  }, [activeTab]);

  // Fetch ALL projects when projects tab is active
  useEffect(() => {
    if (activeTab === 'projects') {
      setAllProjectsLoading(true);
      supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching projects:', error);
            setAllProjects([]);
          } else {
            console.log('Fetched projects:', data); // Debug log
            setAllProjects(data || []);
          }
          setAllProjectsLoading(false);
        });
    }
  }, [activeTab]);

  const handleCreateProject = async (e, isInternal = false) => {
    e.preventDefault();
    const { data, error } = await supabase.from('projects').insert([{ ...newProject, is_internal: isInternal, opportunity_amount: parseFloat(newProject.opportunity_amount) || 0 }]).select();
    if (!error && data && data[0]) {
      if (isInternal) setInternalProjects(p => [data[0], ...p]);
      setShowProjectForm(false);
      setNewProject({ name: '', client: '', opportunity_amount: '', stage: 'Inquiry', notes: '' });
    }
  };

  // Analytics calculations
  const totalLeads = leads.length;
  const bookedLeads = leads.filter(l => l.status === 'Booked').length;
  const conversionRate = totalLeads > 0 ? ((bookedLeads / totalLeads) * 100).toFixed(1) : '0.0';
  const serviceCounts = leads.reduce((acc, l) => {
    if (l.service) acc[l.service] = (acc[l.service] || 0) + 1;
    return acc;
  }, {});
  const mostPopularService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  const blogCount = blogPosts.length;
  const portfolioCount = portfolioImages.length;
  const potentialRevenue = projects.reduce((sum, p) => sum + (parseFloat(p.opportunity_amount) || 0), 0);

  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-display mb-10">Admin Dashboard</h2>
        <div className="flex border-b border-white/20 mb-8 flex-wrap">
          <button onClick={() => setActiveTab('crm')} className={`py-2 px-6 text-lg ${activeTab === 'crm' ? 'text-white border-b-2 border-[#F3E3C3]' : 'text-white/50'}`}>CRM (Leads)</button>
          <button onClick={() => setActiveTab('cms')} className={`py-2 px-6 text-lg ${activeTab === 'cms' ? 'text-white border-b-2 border-[#F3E3C3]' : 'text-white/50'}`}>CMS (Portfolio)</button>
          <button onClick={() => setActiveTab('blog')} className={`py-2 px-6 text-lg ${activeTab === 'blog' ? 'text-white border-b-2 border-[#F3E3C3]' : 'text-white/50'}`}>Blog</button>
          <button onClick={() => setActiveTab('sitemap')} className={`py-2 px-6 text-lg ${activeTab === 'sitemap' ? 'text-white border-b-2 border-[#F3E3C3]' : 'text-white/50'}`}>Pages & Content</button>
          <button onClick={() => setActiveTab('analytics')} className={`py-2 px-6 text-lg ${activeTab === 'analytics' ? 'text-white border-b-2 border-[#F3E3C3]' : 'text-white/50'}`}>Analytics</button>
          <button onClick={() => setActiveTab('projects')} className={`py-2 px-6 text-lg ${activeTab === 'projects' ? 'text-white border-b-2 border-[#F3E3C3]' : 'text-white/50'}`}>Projects</button>
        </div>
        
        {activeTab === 'crm' && <CrmSection leads={leads} updateLeadStatus={updateLeadStatus} />}
        {activeTab === 'cms' && <CmsSection 
          portfolioImages={portfolioImages}
          addPortfolioImage={addPortfolioImage}
          deletePortfolioImage={deletePortfolioImage} 
        />}
        {activeTab === 'blog' && <BlogAdminSection 
          blogPosts={blogPosts}
          createBlogPost={createBlogPost}
          updateBlogPost={updateBlogPost}
          deleteBlogPost={deleteBlogPost}
          blogEdit={blogEdit}
          setBlogEdit={setBlogEdit}
          blogSaving={blogSaving}
          blogAdminError={blogAdminError}
        />}
        {activeTab === 'sitemap' && <SiteMapTab siteMapPage={siteMapPage} setSiteMapPage={setSiteMapPage} content={content} portfolioImages={portfolioImages} blogPosts={blogPosts} />}
        {activeTab === 'analytics' && (
          <div className="bg-[#262626] p-8 rounded-lg grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xl font-display mb-4">Leads & Conversion</h4>
              <div className="text-4xl font-bold mb-2">{totalLeads}</div>
              <div className="text-[#F3E3C3]/70 mb-2">Total Leads</div>
              <div className="text-2xl font-bold mb-2">{conversionRate}%</div>
              <div className="text-[#F3E3C3]/70 mb-2">Conversion Rate (Booked)</div>
              <div className="text-lg font-bold mb-2">{mostPopularService}</div>
              <div className="text-[#F3E3C3]/70">Most Popular Service</div>
            </div>
            <div>
              <h4 className="text-xl font-display mb-4">Content Stats</h4>
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-3xl font-bold">{blogCount}</span>
                  <span className="ml-2 text-[#F3E3C3]/70">Blog Posts</span>
                </div>
                <div>
                  <span className="text-3xl font-bold">{portfolioCount}</span>
                  <span className="ml-2 text-[#F3E3C3]/70">Portfolio Images</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-display mb-4">Potential Revenue</h4>
              <div className="text-4xl font-bold mb-2">${potentialRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              <div className="text-[#F3E3C3]/70 mb-2">Sum of all project opportunity values</div>
            </div>
          </div>
        )}
        {activeTab === 'projects' && (
          <div className="bg-[#262626] p-8 rounded-lg">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
              <div>
                <h4 className="text-xl font-display">Project Management</h4>
                <p className="text-xs text-[#F3E3C3]/70">Manage client projects and internal tasks</p>
                <p className="text-xs text-[#F3E3C3]/60">Total projects in database: {allProjects.length}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowProjectForm('client')} className="bg-[#F3E3C3] text-[#1a1a1a] font-bold py-2 px-4 rounded-md">+ Client Project</button>
                <button onClick={() => setShowProjectForm('internal')} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md">+ Internal Project</button>
              </div>
            </div>
            
            {/* Debug info */}
            {allProjectsLoading && (
              <div className="text-[#F3E3C3] mb-4">Loading all projects...</div>
            )}
            
            {!allProjectsLoading && allProjects.length === 0 && (
              <div className="bg-[#181818] p-4 rounded mb-4">
                <p className="text-[#F3E3C3]/70">No projects found in database.</p>
                <p className="text-xs text-[#F3E3C3]/60">Create a new project above to get started.</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h5 className="text-lg font-display mb-4">
                  Client Projects ({allProjects.filter(p => !p.is_internal).length})
                </h5>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {allProjects.filter(p => !p.is_internal).map(proj => (
                    <div key={proj.id} className="bg-[#181818] rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h6 className="font-bold text-[#F3E3C3]">{proj.name}</h6>
                        <span className="text-xs px-2 py-1 bg-[#F3E3C3]/10 rounded">{proj.stage}</span>
                      </div>
                      <p className="text-sm text-[#F3E3C3]/70">{proj.client}</p>
                      {proj.opportunity_amount > 0 && (
                        <p className="text-sm font-bold text-green-400">
                          ${proj.opportunity_amount?.toLocaleString?.()}
                        </p>
                      )}
                      <p className="text-xs text-[#F3E3C3]/60 mt-2">{proj.notes}</p>
                      <p className="text-xs text-[#F3E3C3]/40 mt-1">
                        {proj.created_at ? new Date(proj.created_at).toLocaleDateString() : ''}
                      </p>
                    </div>
                  ))}
                  {allProjects.filter(p => !p.is_internal).length === 0 && (
                    <p className="text-[#F3E3C3]/60 text-center py-4">No client projects yet.</p>
                  )}
                </div>
              </div>

              <div>
                <h5 className="text-lg font-display mb-4">
                  Internal Projects ({allProjects.filter(p => p.is_internal).length})
                </h5>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {allProjects.filter(p => p.is_internal).map(proj => (
                    <div key={proj.id} className="bg-[#181818] rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h6 className="font-bold text-[#F3E3C3]">{proj.name}</h6>
                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                          Internal
                        </span>
                      </div>
                      <p className="text-xs text-[#F3E3C3]/60">{proj.notes}</p>
                      <p className="text-xs text-[#F3E3C3]/40 mt-1">
                        {proj.created_at ? new Date(proj.created_at).toLocaleDateString() : ''}
                      </p>
                    </div>
                  ))}
                  {allProjects.filter(p => p.is_internal).length === 0 && (
                    <p className="text-[#F3E3C3]/60 text-center py-4">No internal projects yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* ...existing other tabs... */}
      </div>
    </div>
  );
};

// --- Enhanced Contact Page with Text Option ---
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
              className="group inline-flex items-center bg-[#F3E3C3] text-[#1a1a1a] font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105"
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
            <div className="mt-4">
              <iframe
                title="Map of Houston"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d111049.9644254322!2d-95.469384!3d29.817478!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8640b8b1b8b1b8b1%3A0x8b1b8b1b8b1b8b1b!2sHouston%2C%20TX!5e0!3m2!1sen!2sus!4v1631910000000!5m2!1sen!2sus"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Blog Admin Section (Fixed) ---
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
    author: '',
    publish_date: '',
    tags: '',
    category: ''
  });

  const handleNewChange = e => {
    const { name, value } = e.target;
    setNewPost(p => ({ ...p, [name]: value }));
  };

  const handleCreate = async e => {
    e.preventDefault();
    await createBlogPost({
      ...newPost,
      tags: typeof newPost.tags === 'string'
        ? newPost.tags.split(',').map(t => t.trim()).filter(Boolean)
        : Array.isArray(newPost.tags)
          ? newPost.tags
          : [],
      publish_date: newPost.publish_date || new Date().toISOString()
    });
    setNewPost({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      author: '',
      publish_date: '',
      tags: '',
      category: ''
    });
  };

  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    if (blogEdit) {
      const post = blogPosts.find(p => p.id === blogEdit) || null;
      if (post) {
        setEditForm({
          ...post,
          tags: Array.isArray(post.tags)
            ? post.tags.join(', ')
            : (typeof post.tags === 'string' ? post.tags : '')
        });
      } else {
        setEditForm(null);
      }
    } else {
      setEditForm(null);
    }
  }, [blogEdit, blogPosts]);

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  };

  const handleUpdate = async e => {
    e.preventDefault();
    await updateBlogPost(editForm.id, {
      ...editForm,
      tags: typeof editForm.tags === 'string'
        ? editForm.tags.split(',').map(t => t.trim()).filter(Boolean)
        : Array.isArray(editForm.tags)
          ? editForm.tags
          : []
    });
    setBlogEdit(null);
  };

  if (blogSaving) {
    return <div className="text-[#F3E3C3] py-8">Saving...</div>;
  }

  return (
    <div>
      <h4 className="text-xl font-display mb-4">Blog Posts</h4>
      {blogAdminError && <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded mb-4">{blogAdminError}</div>}
      
      {editForm ? (
        <form onSubmit={handleUpdate} className="space-y-4 mb-8 bg-[#232323] p-6 rounded">
          <h5 className="text-lg font-bold mb-4">Edit Post</h5>
          <input name="title" value={editForm.title} onChange={handleEditChange} placeholder="Title" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" required />
          <input name="slug" value={editForm.slug} onChange={handleEditChange} placeholder="Slug" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" required />
          <div className="grid md:grid-cols-2 gap-4">
            <input name="author" value={editForm.author} onChange={handleEditChange} placeholder="Author" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" />
            <input name="publish_date" value={editForm.publish_date} onChange={handleEditChange} placeholder="Publish Date" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" type="date" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <input name="category" value={editForm.category} onChange={handleEditChange} placeholder="Category" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" />
            <input name="tags" value={editForm.tags} onChange={handleEditChange} placeholder="Tags (comma separated)" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" />
          </div>
          <textarea name="excerpt" value={editForm.excerpt} onChange={handleEditChange} placeholder="Excerpt" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" rows={2} />
          <textarea name="content" value={editForm.content} onChange={handleEditChange} placeholder="Content (Markdown supported)" rows={8} className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" />
          <div className="flex gap-2">
            <button type="submit" className="bg-[#F3E3C3] text-[#1a1a1a] font-bold py-2 px-4 rounded-md" disabled={blogSaving}>
              {blogSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => setBlogEdit(null)} className="bg-gray-500 text-white py-2 px-4 rounded-md">Cancel</button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleCreate} className="space-y-4 mb-8 bg-[#232323] p-6 rounded">
          <h5 className="text-lg font-bold mb-4">Create New Post</h5>
          <input name="title" value={newPost.title} onChange={handleNewChange} placeholder="Title" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" required />
          <input name="slug" value={newPost.slug} onChange={handleNewChange} placeholder="Slug" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" required />
          <div className="grid md:grid-cols-2 gap-4">
            <input name="author" value={newPost.author} onChange={handleNewChange} placeholder="Author" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" />
            <input name="publish_date" value={newPost.publish_date} onChange={handleNewChange} placeholder="Publish Date" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" type="date" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <input name="category" value={newPost.category} onChange={handleNewChange} placeholder="Category" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" />
            <input name="tags" value={newPost.tags} onChange={handleNewChange} placeholder="Tags (comma separated)" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" />
          </div>
          <textarea name="excerpt" value={newPost.excerpt} onChange={handleNewChange} placeholder="Excerpt" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" rows={2} />
          <textarea name="content" value={newPost.content} onChange={handleNewChange} placeholder="Content (Markdown supported)" rows={8} className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" />
          <button type="submit" className="bg-[#F3E3C3] text-[#1a1a1a] font-bold py-2 px-4 rounded-md" disabled={blogSaving}>
            {blogSaving ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-white/10">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Author</th>
              <th className="p-3">Date</th>
              <th className="p-3">Category</th>
              <th className="p-3">Tags</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogPosts.map(post => (
              <tr key={post.id} className="border-b border-white/10 last:border-b-0">
                <td className="p-3 font-bold">{post.title}</td>
                <td className="p-3">{post.author}</td>
                <td className="p-3 text-xs">{post.publish_date ? new Date(post.publish_date).toLocaleDateString() : ''}</td>
                <td className="p-3">{post.category}</td>
                <td className="p-3">
                  {Array.isArray(post.tags) ? post.tags.join(', ') : (typeof post.tags === 'string' ? post.tags : '')}
                </td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => setBlogEdit(post.id)} className="bg-blue-500 text-white px-3 py-1 rounded text-xs">Edit</button>
                  <button onClick={() => deleteBlogPost(post.id)} className="bg-red-600 text-white px-3 py-1 rounded text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ...existing code for other components...