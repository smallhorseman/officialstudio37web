import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PhotoshootPlanner from './PhotoshootPlanner';
import ConversationalPlanner from './ConversationalPlanner';
import VirtualAgentPlanner from './VirtualAgentPlanner';
import { createClient } from '@supabase/supabase-js';
// --- Supabase Setup --- //
const SUPABASE_URL = 'https://sqfqlnodwjubacmaduzl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZnFsbm9kd2p1YmFjbWFkdXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzQ2ODUsImV4cCI6MjA3Mzc1MDY4NX0.OtEDSh5UCm8CxWufG_NBLDzgNFI3wnr-oAyaRib_4Mw';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  const [currentPage, setCurrentPage] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);

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
    if (currentPage === 'blog' || isAdmin) {
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
  }, [currentPage, isAdmin]);

  // --- Fetch Portfolio Images ---
  useEffect(() => {
    if (currentPage === 'portfolio' || isAdmin) {
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
  }, [currentPage, isAdmin]);

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
    setCurrentPage('adminDashboard');
  }

  // --- Navigation Handler ---
  function handleNav(page) {
    setCurrentPage(page);
    if (page !== 'adminDashboard') setIsAdmin(false);
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

  // --- Page Content Switcher ---
  function PageContent() {
    switch (currentPage) {
      case 'home': return <HomePage navigate={handleNav} />;
      case 'about': return <AboutPage content={siteContent.about} />;
      case 'services': return <ServicesPage />;
      case 'portfolio': return (
        <PortfolioPage
          isUnlocked={portfolioUnlocked}
          onUnlock={handlePortfolioUnlock}
          images={portfolioImages}
        />
      );
      case 'blog': return <BlogPage posts={blogPosts} loading={blogLoading} error={blogError} />;
      case 'contact': return <ContactPage />;
      case 'adminLogin': return <AdminLoginPage onLogin={handleAdminLogin} />;
      case 'adminDashboard':
        return isAdmin ? (
          <AdminDashboard
            leads={leads}
            updateLeadStatus={updateLeadStatus}
            content={siteContent}
            updateContent={updateContent}
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
        ) : <AdminLoginPage onLogin={handleAdminLogin} />;
      default: return <HomePage navigate={handleNav} />;
    }
  }

  // --- Render ---
  return (
    <div className="min-h-screen bg-[#181818] text-[#F3E3C3] font-sans antialiased transition-colors duration-300">
      {/* Chatbot Button is now global, not just homepage */}
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
        navigate={handleNav} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
        currentPage={currentPage}
        theme={theme}
        toggleTheme={toggleTheme}
        showAdminButton={currentPage !== 'adminDashboard'}
        onAdminLogin={() => setCurrentPage('adminLogin')}
      />
      <main className="pt-20">
        <PageContent />
      </main>
      <Footer navigate={handleNav} />
    </div>
  );
}

// --- Page & Section Components --- //
const Header = ({ navigate, isMenuOpen, setIsMenuOpen, currentPage, theme, toggleTheme, showAdminButton, onAdminLogin }) => {
  const navLinks = [
    { page: 'home', label: 'Home' },
    { page: 'about', label: 'About' },
    { page: 'services', label: 'Services' },
    { page: 'portfolio', label: 'Portfolio' },
    { page: 'blog', label: 'Blog' },
    { page: 'contact', label: 'Contact' },
    { page: 'book', label: 'Book a Session', external: true, url: 'https://book.usesession.com/i/sbDooN5rcH' }
  ];

  const NavLink = ({ page, label, external, url }) => (
    external ? (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={
          `px-4 py-2 text-sm uppercase tracking-widest transition-colors duration-300 
          text-[#F3E3C3]/70 hover:text-white`
        }
        style={label === 'Book a Session' ? { fontWeight: 'bold' } : {}}
      >
        {label}
      </a>
    ) : (
      <button 
        onClick={() => navigate(page)} 
        className={`px-4 py-2 text-sm uppercase tracking-widest transition-colors duration-300 ${currentPage === page ? 'text-white' : 'text-[#F3E3C3]/70 hover:text-white'}`}
      >
        {label}
      </button>
    )
  );

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-[#232323] shadow-lg">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="font-display text-xl font-bold tracking-tight text-white">Studio37</span>
        </div>
        <nav className="hidden md:flex gap-2 items-center">
          {navLinks.map(link => <NavLink key={link.page} {...link} />)}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="text-[#F3E3C3] text-xl px-2" aria-label="Toggle Theme">
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          {showAdminButton && (
            <button
              onClick={onAdminLogin}
              className="text-xs px-2 py-1 rounded bg-transparent text-[#F3E3C3]/60 hover:text-[#F3E3C3] border border-transparent hover:border-[#F3E3C3]/30 transition"
              style={{ fontSize: '0.85rem' }}
              aria-label="Admin Login"
            >
              Admin
            </button>
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

const HomePage = ({ navigate }) => (
  <div className="relative h-screen flex items-center justify-center text-center text-white px-4 -mt-20">
    <img src="https://res.cloudinary.com/dmjxho2rl/image/upload/a_vflip/l_image:upload:My%20Brand:IMG_2115_mtuowt/c_scale,fl_relative,w_0.35/o_100/fl_layer_apply,g_north,x_0.03,y_0.04/v1758172510/A4B03835-ED8B-4FBB-A27E-1F2EE6CA1A18_1_105_c_gstgil.jpg" alt="Studio37 Hero" className="absolute inset-0 w-full h-full object-cover"/>
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-0 pointer-events-none"></div>
    <div className="relative z-10">
      <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display mb-4 leading-tight break-words max-w-full">Capture. Create. Captivate.</h1>
      <p className="text-base sm:text-lg md:text-xl max-w-xs sm:max-w-2xl mx-auto mb-8 text-[#F3E3C3]/80">Vintage heart, modern vision. Full-service photography and content strategy for brands ready to conquer the world from Houston, TX.</p>
      <div className="space-y-4 sm:space-x-4 flex flex-col sm:flex-row items-center justify-center w-full">
        <button onClick={() => navigate('portfolio')} className="group inline-flex items-center bg-[#F3E3C3] text-[#1a1a1a] font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105 w-full sm:w-auto">
          View Our Work <ArrowRight />
        </button>
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
          <p className="text-lg text-[#F3E3C3]/70 mt-4 max-w-2xl mx-auto">A curated selection of our favorite moments and projects.</p>
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

const ContactPage = () => (
    <div className="py-20 md:py-28 bg-[#212121]">
        <div className="container mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-display">Get In Touch</h2>
                <p className="text-lg text-[#F3E3C3]/70 mt-4 max-w-2xl mx-auto">Ready to start your project? Let's talk. We serve Houston, TX and the surrounding 50-mile radius.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-start">
                <form className="space-y-6">
                    <input type="text" placeholder="Your Name" className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]" />
                    <input type="email" placeholder="Your Email" className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]" />
                    <textarea placeholder="Your Message" rows="5" className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"></textarea>
                    <button type="submit" className="group inline-flex items-center bg-[#F3E3C3] text-[#1a1a1a] font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105">
                        Send Message <ArrowRight />
                    </button>
                </form>
                <div className="text-[#F3E3C3]/80 space-y-6">
                    <div>
                        <h3 className="text-xl font-display text-white">Contact Info</h3>
                        <p>Email: <a href="mailto:sales@studio37.cc" className="hover:text-white transition">sales@studio37.cc</a></p>
                        <p>Phone: <a href="tel:1-832-713-9944" className="hover:text-white transition">(832) 713-9944</a></p>
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
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const AdminLoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Fix: trim and lowercase for robustness
    if (
      username.trim().toLowerCase() === 'admin' &&
      password.trim() === 'studio37admin'
    ) {
      onLogin();
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

const AdminDashboard = ({
  leads, updateLeadStatus, content, updateContent, portfolioImages, addPortfolioImage, deletePortfolioImage,
  blogPosts, createBlogPost, updateBlogPost, deleteBlogPost, blogEdit, setBlogEdit, blogSaving, blogAdminError, projects, projectsLoading
}) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTodos, setProjectTodos] = useState([]);
  const [todosLoading, setTodosLoading] = useState(false);
  const [newTodo, setNewTodo] = useState('');
  const [activeTab, setActiveTab] = useState('crm');
  const [siteMapPage, setSiteMapPage] = useState('home');
  const [internalProjects, setInternalProjects] = useState([]);
  const [internalProjectsLoading, setInternalProjectsLoading] = useState(false);
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

  const handleCreateProject = async (e, isInternal = false) => {
    e.preventDefault();
    const { data, error } = await supabase.from('projects').insert([{ ...newProject, is_internal: isInternal, opportunity_amount: parseFloat(newProject.opportunity_amount) || 0 }]).select();
    if (!error && data && data[0]) {
      if (isInternal) setInternalProjects(p => [data[0], ...p]);
      else {
        // projects is a prop, so can't setProjects directly; just reload via parent effect
      }
      setShowProjectForm(false);
      setNewProject({ name: '', client: '', opportunity_amount: '', stage: 'Inquiry', notes: '' });
    }
  };

  // --- Analytics calculations --- //
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
          <button onClick={() => setActiveTab('cms')} className={`py-2 px-6 text-lg ${activeTab === 'cms' ? 'text-white border-b-2 border-[#F3E3C3]' : 'text-white/50'}`}>CMS (Content)</button>
          <button onClick={() => setActiveTab('blog')} className={`py-2 px-6 text-lg ${activeTab === 'blog' ? 'text-white border-b-2 border-[#F3E3C3]' : 'text-white/50'}`}>Blog</button>
          <button onClick={() => setActiveTab('sitemap')} className={`py-2 px-6 text-lg ${activeTab === 'sitemap' ? 'text-white border-b-2 border-[#F3E3C3]' : 'text-white/50'}`}>Site Map</button>
          <button onClick={() => setActiveTab('analytics')} className={`py-2 px-6 text-lg ${activeTab === 'analytics' ? 'text-white border-b-2 border-[#F3E3C3]' : 'text-white/50'}`}>Analytics</button>
          <button onClick={() => setActiveTab('projects')} className={`py-2 px-6 text-lg ${activeTab === 'projects' ? 'text-white border-b-2 border-[#F3E3C3]' : 'text-white/50'}`}>Projects</button>
        </div>
        {activeTab === 'crm' && <CrmSection leads={leads} updateLeadStatus={updateLeadStatus} />}
        {activeTab === 'cms' && <CmsSection 
          content={content} 
          updateContent={updateContent} 
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
                <h4 className="text-xl font-display">Projects</h4>
                <p className="text-xs text-[#F3E3C3]/70">Client projects and deliverables</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowProjectForm(f => !f)} className="bg-[#F3E3C3] text-[#1a1a1a] font-bold py-2 px-4 rounded-md">{showProjectForm ? 'Cancel' : 'New Project'}</button>
                <button onClick={() => setShowProjectForm(true)} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md">+ Internal Project</button>
              </div>
            </div>
            {showProjectForm && (
              <form onSubmit={e => handleCreateProject(e, false)} className="mb-8 grid md:grid-cols-2 gap-4">
                <input type="text" value={newProject.name} onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))} placeholder="Project Name" className="bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3" required />
                <input type="text" value={newProject.client} onChange={e => setNewProject(p => ({ ...p, client: e.target.value }))} placeholder="Client Name" className="bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3" />
                <input type="number" value={newProject.opportunity_amount} onChange={e => setNewProject(p => ({ ...p, opportunity_amount: e.target.value }))} placeholder="Opportunity Amount ($)" className="bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3" />
                <select value={newProject.stage} onChange={e => setNewProject(p => ({ ...p, stage: e.target.value }))} className="bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3">
                  {projectStages.map(stage => <option key={stage}>{stage}</option>)}
                </select>
                <textarea value={newProject.notes} onChange={e => setNewProject(p => ({ ...p, notes: e.target.value }))} placeholder="Notes" className="bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 md:col-span-2" />
                <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md md:col-span-2">Create Project</button>
              </form>
            )}
            <div className="mb-10">
              <h5 className="text-lg font-display mb-2">Internal Projects</h5>
              {internalProjectsLoading ? (
                <div className="text-[#F3E3C3]">Loading internal projects...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-white/10">
                      <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">Completion</th>
                        <th className="p-3">Notes</th>
                        <th className="p-3">Created</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {internalProjects.map(proj => (
                        <tr key={proj.id} className="border-b border-white/10 last:border-b-0">
                          <td className="p-3 font-bold">{proj.name}</td>
                          <td className="p-3">
                            {/* You can add a completion component or percent here */}
                            {proj.completion || '-'}
                          </td>
                          <td className="p-3">{proj.notes}</td>
                          <td className="p-3 text-xs">{proj.created_at ? new Date(proj.created_at).toLocaleDateString() : ''}</td>
                          <td className="p-3">
                            <button onClick={() => setSelectedProject(proj)} className="bg-blue-500 text-white px-3 py-1 rounded text-xs">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="mb-10">
              <h5 className="text-lg font-display mb-2">Client Projects</h5>
              {projectsLoading ? (
                <div className="text-[#F3E3C3]">Loading projects...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-white/10">
                      <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">Client</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Stage</th>
                        <th className="p-3">Notes</th>
                        <th className="p-3">Created</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map(proj => (
                        <tr key={proj.id} className="border-b border-white/10 last:border-b-0">
                          <td className="p-3 font-bold">{proj.name}</td>
                          <td className="p-3">{proj.client}</td>
                          <td className="p-3">${proj.opportunity_amount?.toLocaleString?.() ?? ''}</td>
                          <td className="p-3">{proj.stage}</td>
                          <td className="p-3">{proj.notes}</td>
                          <td className="p-3 text-xs">{proj.created_at ? new Date(proj.created_at).toLocaleDateString() : ''}</td>
                          <td className="p-3">
                            <button onClick={() => setSelectedProject(proj)} className="bg-blue-500 text-white px-3 py-1 rounded text-xs">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {/* Project Detail Modal */}
            {/* You can add a modal here for selectedProject if needed */}
          </div>
        )}
      </div>
    </div>
  );
};
// --- Site Map Tab with Flowchart and Live Preview --- //
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
    // Simulate fetching content for the page (replace with your CMS logic as needed)
    let title = '';
    let contentMd = '';
    if (pageKey === 'about') {
      title = content.about.title;
      contentMd = content.about.bio;
    } else if (pageKey === 'services') {
      title = 'Our Services';
      contentMd = 'From comprehensive brand management to capturing your most precious personal moments.';
    } else if (pageKey === 'home') {
      title = 'Capture. Create. Captivate.';
      contentMd = 'Vintage heart, modern vision. Full-service photography and content strategy for brands ready to conquer the world from Houston, TX.';
    } else if (pageKey === 'contact') {
      title = 'Get In Touch';
      contentMd = "Ready to start your project? Let's talk. We serve Houston, TX and the surrounding 50-mile radius.";
    } else if (pageKey === 'blog') {
      title = 'Blog';
      contentMd = 'Stories, tips, and behind-the-scenes from Studio37.';
    }
    setEditForm({ title, content: contentMd });
  };

  // Save page content (simulate CMS update)
  const handleSavePage = async () => {
    setSaving(true);
    // Only About page is editable in DB for now
    if (editingPage === 'about') {
      await supabase.from('site_content').update({
        about_title: editForm.title,
        about_bio: editForm.content
      }).eq('id', 1);
    }
    // Add logic for other pages if you store them in DB
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
    <div className="flex flex-col md:flex-row gap-8">
      <div className="md:w-1/3">
        <h4 className="text-xl font-display mb-4">Website Map</h4>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="siteMapPages">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col items-start gap-4">
                {pages.map((page, idx) => (
                  <Draggable key={page.key} draggableId={page.key} index={idx}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`flex items-center gap-2 ${snapshot.isDragging ? 'opacity-80' : ''}`}
                      >
                        <button
                          onClick={() => setSiteMapPage(page.key)}
                          className={`px-4 py-2 rounded-full font-bold transition-colors ${siteMapPage === page.key ? 'bg-[#F3E3C3] text-[#1a1a1a]' : 'bg-[#262626] text-[#F3E3C3] hover:bg-[#F3E3C3]/30'}`}
                        >
                          {page.label}
                        </button>
                        {/* Only allow editing for About, Home, Services, Contact for now */}
                        {['about', 'home', 'services', 'contact'].includes(page.key) && (
                          <button
                            className="ml-1 text-xs px-2 py-1 bg-[#F3E3C3] text-[#1a1a1a] rounded hover:bg-[#f3e3c3cc] transition"
                            onClick={() => handleEditPage(page.key)}
                            type="button"
                          >
                            Edit
                          </button>
                        )}
                        {idx < pages.length - 1 && <span className="text-[#F3E3C3]">→</span>}
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
      <div className="md:w-2/3">
        <h4 className="text-xl font-display mb-4">Live Preview</h4>
        <div className="bg-[#181818] rounded-lg shadow-lg p-6 min-h-[300px]">
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
              <label className="block text-xs mb-1 text-[#F3E3C3]/70">Page Content (Markdown supported)</label>
              <div className="grid md:grid-cols-2 gap-4">
                <textarea
                  value={editForm.content}
                  onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Write your content in Markdown..."
                  rows={10}
                  className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 font-mono"
                  required
                />
                <div className="bg-[#232323] border border-white/10 rounded-md p-3 overflow-auto min-h-[200px]">
                  <div className="text-xs text-[#F3E3C3]/60 mb-1">Live Preview</div>
                  <div className="prose prose-invert max-w-none text-[#F3E3C3]/90">
                    <h2 className="font-display">{editForm.title}</h2>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {editForm.content || 'Nothing to preview.'}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-[#F3E3C3] text-[#1a1a1a] font-bold py-2 px-4 rounded-md"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
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
            <SiteMapPreview page={siteMapPage} content={content} portfolioImages={portfolioImages} blogPosts={blogPosts} />
          )}
        </div>
      </div>
    </div>
  );
};

// --- Live Preview Renderer for Each Page --- //
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
              <a href={`/blog/${post.slug}`} className="text-[#F3E3C3] hover:underline mt-auto">Read More</a>
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
function Footer({ navigate }) {
  return (
    <footer className="bg-[#232323] text-[#F3E3C3] py-8 mt-20">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-lg">Studio37</span>
          <span className="text-xs">&copy; {new Date().getFullYear()}</span>
        </div>
        <nav className="flex gap-4">
          <button onClick={() => navigate('home')} className="hover:underline">Home</button>
          <button onClick={() => navigate('about')} className="hover:underline">About</button>
          <button onClick={() => navigate('services')} className="hover:underline">Services</button>
          <button onClick={() => navigate('portfolio')} className="hover:underline">Portfolio</button>
          <button onClick={() => navigate('blog')} className="hover:underline">Blog</button>
          <button onClick={() => navigate('contact')} className="hover:underline">Contact</button>
        </nav>
      </div>
    </footer>
  );
}

// --- CRM Section (Leads Table) ---
function CrmSection({ leads, updateLeadStatus }) {
  if (!leads || leads.length === 0) {
    return <div className="text-[#F3E3C3]/70 py-8">No leads found.</div>;
  }
  const statuses = ['New', 'Contacted', 'Booked', 'Lost', 'Archived'];
  return (
    <div className="overflow-x-auto bg-[#262626] rounded-lg shadow-lg p-6">
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
              <td className="p-3">{lead.email}</td>
              <td className="p-3">{lead.phone}</td>
              <td className="p-3">{lead.service}</td>
              <td className="p-3">
                <span className="px-2 py-1 rounded bg-[#F3E3C3]/10 text-[#F3E3C3]">{lead.status}</span>
              </td>
              <td className="p-3 text-xs">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : ''}</td>
              <td className="p-3">
                <select
                  value={lead.status}
                  onChange={e => updateLeadStatus(lead.id, e.target.value)}
                  className="bg-[#181818] border border-white/20 rounded px-2 py-1 text-xs text-[#F3E3C3]"
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- CMS Section (Content & Portfolio Management) ---
function CmsSection({ content, updateContent, portfolioImages, addPortfolioImage, deletePortfolioImage }) {
  const [aboutTitle, setAboutTitle] = useState(content.about.title || '');
  const [aboutBio, setAboutBio] = useState(content.about.bio || '');
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageCategory, setImageCategory] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [addingImage, setAddingImage] = useState(false);

  const handleSaveAbout = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateContent({ about: { title: aboutTitle, bio: aboutBio } });
    setSaving(false);
  };

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
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h4 className="text-xl font-display mb-4">Edit About Content</h4>
        <form onSubmit={handleSaveAbout} className="space-y-4">
          <input
            type="text"
            value={aboutTitle}
            onChange={e => setAboutTitle(e.target.value)}
            placeholder="About Title"
            className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 font-bold"
            required
          />
          <textarea
            value={aboutBio}
            onChange={e => setAboutBio(e.target.value)}
            placeholder="About Bio"
            rows={6}
            className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3"
            required
          />
          <button
            type="submit"
            className="bg-[#F3E3C3] text-[#1a1a1a] font-bold py-2 px-4 rounded-md"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
      <div>
        <h4 className="text-xl font-display mb-4">Portfolio Images</h4>
        <form onSubmit={handleAddImage} className="flex flex-col gap-2 mb-4">
          <input
            type="url"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="Image URL"
            className="bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3"
            required
          />
          <input
            type="text"
            value={imageCategory}
            onChange={e => setImageCategory(e.target.value)}
            placeholder="Category"
            className="bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3"
          />
          <input
            type="text"
            value={imageCaption}
            onChange={e => setImageCaption(e.target.value)}
            placeholder="Caption"
            className="bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3"
          />
          <button
            type="submit"
            className="bg-[#F3E3C3] text-[#1a1a1a] font-bold py-2 px-4 rounded-md"
            disabled={addingImage || !imageUrl}
          >
            {addingImage ? 'Adding...' : 'Add Image'}
          </button>
        </form>
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {portfolioImages.map(img => (
            <div key={img.id} className="relative group">
              <img src={img.url} alt={img.category} className="w-full h-24 object-cover rounded" />
              <button
                onClick={() => deletePortfolioImage(img.id)}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-80 group-hover:opacity-100"
                title="Delete"
              >
                &times;
              </button>
              <div className="text-xs text-[#F3E3C3]">{img.category}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Blog Admin Section (Blog CRUD for Admin) ---
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
      {blogAdminError && <div className="text-red-400 mb-2">{blogAdminError}</div>}
      {editForm ? (
        <form onSubmit={handleUpdate} className="space-y-2 mb-8 bg-[#232323] p-4 rounded">
          <input name="title" value={editForm.title} onChange={handleEditChange} placeholder="Title" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" required />
          <input name="slug" value={editForm.slug} onChange={handleEditChange} placeholder="Slug" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" required />
          <input name="author" value={editForm.author} onChange={handleEditChange} placeholder="Author" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" />
          <input name="publish_date" value={editForm.publish_date} onChange={handleEditChange} placeholder="Publish Date" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" type="date" />
          <input name="category" value={editForm.category} onChange={handleEditChange} placeholder="Category" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" />
          <input name="tags" value={editForm.tags} onChange={handleEditChange} placeholder="Tags (comma separated)" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" />
          <textarea name="excerpt" value={editForm.excerpt} onChange={handleEditChange} placeholder="Excerpt" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" />
          <textarea name="content" value={editForm.content} onChange={handleEditChange} placeholder="Content (Markdown supported)" rows={6} className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" />
          <div className="flex gap-2">
            <button type="submit" className="bg-[#F3E3C3] text-[#1a1a1a] font-bold py-2 px-4 rounded-md">Save</button>
            <button type="button" onClick={() => setBlogEdit(null)} className="bg-gray-500 text-white py-2 px-4 rounded-md">Cancel</button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleCreate} className="space-y-2 mb-8 bg-[#232323] p-4 rounded">
          <input name="title" value={newPost.title} onChange={handleNewChange} placeholder="Title" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" required />
          <input name="slug" value={newPost.slug} onChange={handleNewChange} placeholder="Slug" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" required />
          <input name="author" value={newPost.author} onChange={handleNewChange} placeholder="Author" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" />
          <input name="publish_date" value={newPost.publish_date} onChange={handleNewChange} placeholder="Publish Date" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" type="date" />
          <input name="category" value={newPost.category} onChange={handleNewChange} placeholder="Category" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" />
          <input name="tags" value={newPost.tags} onChange={handleNewChange} placeholder="Tags (comma separated)" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" />
          <textarea name="excerpt" value={newPost.excerpt} onChange={handleNewChange} placeholder="Excerpt" className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" />
          <textarea name="content" value={newPost.content} onChange={handleNewChange} placeholder="Content (Markdown supported)" rows={6} className="w-full bg-[#181818] border border-white/20 rounded-md py-2 px-3" />
          <button type="submit" className="bg-[#F3E3C3] text-[#1a1a1a] font-bold py-2 px-4 rounded-md">Create Post</button>
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
                  {
                    Array.isArray(post.tags)
                      ? post.tags.join(', ')
                      : (typeof post.tags === 'string' ? post.tags : '')
                  }
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