import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PhotoshootPlanner from './PhotoshootPlanner';
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
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
);
const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);
const SmsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
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
    <span className="text-2xl font-display font-bold text-white tracking-wider">
      Studio37
    </span>
  </div>
);


// --- Main Application Component --- //

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  // Planner page override if ?planner=1 or pathname includes /planner
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isPlanner = (typeof window !== 'undefined' && (window.location.pathname.includes('planner') || urlParams?.get('planner')));
  const [blogPosts, setBlogPosts] = useState([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogError, setBlogError] = useState('');
  // Blog admin state
  const [blogEdit, setBlogEdit] = useState(null); // {id, title, content, ...}
  const [blogSaving, setBlogSaving] = useState(false);
  const [blogAdminError, setBlogAdminError] = useState('');
  // --- Blog Fetch --- //
  // Fetch blog posts (on blog page or admin dashboard)
  useEffect(() => {
    if (currentPage === 'blog' || currentPage === 'adminDashboard') {
      setBlogLoading(true);
      setBlogError('');
      supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) setBlogError('Failed to load blog posts.');
          else setBlogPosts(data || []);
          setBlogLoading(false);
        });
    }
  }, [currentPage]);

  // Blog CRUD functions
  const createBlogPost = async (post) => {
    setBlogSaving(true);
    setBlogAdminError('');
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([{ ...post }])
      .select();
    setBlogSaving(false);
    if (error) {
      setBlogAdminError('Failed to create post.');
      return;
    }
    if (data && data[0]) setBlogPosts(posts => [data[0], ...posts]);
  };

  const updateBlogPost = async (id, updates) => {
    setBlogSaving(true);
    setBlogAdminError('');
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select();
    setBlogSaving(false);
    if (error) {
      setBlogAdminError('Failed to update post.');
      return;
    }
    if (data && data[0]) setBlogPosts(posts => posts.map(p => p.id === id ? data[0] : p));
  };

  const deleteBlogPost = async (id) => {
    setBlogSaving(true);
    setBlogAdminError('');
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);
    setBlogSaving(false);
    if (error) {
      setBlogAdminError('Failed to delete post.');
      return;
    }
    setBlogPosts(posts => posts.filter(p => p.id !== id));
  };
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPortfolioUnlocked, setIsPortfolioUnlocked] = useState(false);
  
  // --- CRM & CMS State (Simulated Backend) --- //
  // In a real app, this data would come from a database like Firestore.
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState('');
  // --- Fetch Leads from Supabase --- //
  useEffect(() => {
    setLeadsLoading(true);
    setLeadsError('');
    supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setLeadsError('Failed to load leads.');
        else if (data) setLeads(data);
        setLeadsLoading(false);
      });
  }, []);

  const [siteContent, setSiteContent] = useState({
    about: {
      title: '',
      bio: ''
    },
    portfolioImages: []
  });
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState('');
  // --- Fetch Portfolio Images from Supabase --- //
  useEffect(() => {
    setPortfolioLoading(true);
    setPortfolioError('');
    supabase
      .from('portfolio_images')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setPortfolioError('Failed to load portfolio images.');
        else if (data) setSiteContent(prev => ({ ...prev, portfolioImages: data }));
        setPortfolioLoading(false);
      });
  }, []);
  const [aboutLoading, setAboutLoading] = useState(false);
  const [aboutError, setAboutError] = useState('');
  // --- Fetch About Content from Supabase --- //
  useEffect(() => {
    setAboutLoading(true);
    setAboutError('');
    supabase
      .from('site_content')
      .select('content')
      .eq('section', 'about')
      .single()
      .then(({ data, error }) => {
        if (error) setAboutError('Failed to load about content.');
        else if (data && data.content) setSiteContent(prev => ({ ...prev, about: data.content }));
        setAboutLoading(false);
      });
  }, []);

  const handleNav = (page) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };
  
  // Add Lead to Supabase and local state
  const addLead = async (lead) => {
    const newLead = { ...lead, status: 'New' };
    const { data, error } = await supabase
      .from('leads')
      .insert([newLead])
      .select();
    if (!error && data && data[0]) {
      setLeads(prevLeads => [data[0], ...prevLeads]);
      setIsPortfolioUnlocked(true);
    }
  };

  // Update Lead Status in Supabase and local state
  const updateLeadStatus = async (id, status) => {
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id);
    if (!error) {
      setLeads(leads.map(lead => lead.id === id ? { ...lead, status } : lead));
    }
  };

  // Update About Content in Supabase and local state
  const updateSiteContent = async (section, key, value) => {
    if (section === 'about') {
      const newAbout = { ...siteContent.about, [key]: value };
      setSiteContent(prev => ({ ...prev, about: newAbout }));
      // Update in Supabase
      await supabase
        .from('site_content')
        .update({ content: newAbout })
        .eq('section', 'about');
    }
  };
  
  // Add Portfolio Image to Supabase and local state
  const addPortfolioImage = async (newImage) => {
    const { data, error } = await supabase
      .from('portfolio_images')
      .insert([{ ...newImage }])
      .select();
    if (!error && data && data[0]) {
      setSiteContent(prev => ({
        ...prev,
        portfolioImages: [data[0], ...prev.portfolioImages]
      }));
    }
  };

  // Delete Portfolio Image from Supabase and local state
  const deletePortfolioImage = async (id) => {
    const { error } = await supabase
      .from('portfolio_images')
      .delete()
      .eq('id', id);
    if (!error) {
      setSiteContent(prev => ({
        ...prev,
        portfolioImages: prev.portfolioImages.filter(img => img.id !== id)
      }));
    }
  };

  const PageContent = () => {
    if (isPlanner) return <PhotoshootPlanner />;
    switch(currentPage) {
      case 'home': return <HomePage navigate={handleNav} />;
      case 'about': return <AboutPage content={siteContent.about} />;
      case 'services': return <ServicesPage />;
      case 'portfolio': return <PortfolioPage isUnlocked={isPortfolioUnlocked} onUnlock={addLead} images={siteContent.portfolioImages} />;
      case 'blog': return <BlogPage posts={blogPosts} loading={blogLoading} error={blogError} />;
      case 'contact': return <ContactPage />;
      case 'adminLogin': return <AdminLoginPage onLogin={() => { setIsAdmin(true); handleNav('adminDashboard'); }} />;
      case 'adminDashboard': return isAdmin ? <AdminDashboard 
                                   leads={leads} 
                                   updateLeadStatus={updateLeadStatus}
                                   content={siteContent}
                                   updateContent={updateSiteContent}
                                   portfolioImages={siteContent.portfolioImages}
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
                                 /> : <AdminLoginPage onLogin={() => { setIsAdmin(true); handleNav('adminDashboard'); }} />;
      default: return <HomePage navigate={handleNav} />;
    }
  };

  return (
    <div className="bg-[#1a1a1a] text-[#E6D5B8] min-h-screen font-sans antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        h1, h2, h3, .font-display { font-family: 'Playfair Display', serif; }
        .polaroid {
            background: #fff;
            padding: 1rem;
            padding-bottom: 3rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transform: rotate(-2deg);
            transition: all 0.3s ease-in-out;
        }
        .polaroid:nth-child(2n) {
            transform: rotate(2deg);
        }
        .polaroid:hover {
            transform: scale(1.05) rotate(0deg);
            z-index: 10;
        }
      `}</style>
      
      <Header navigate={handleNav} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} currentPage={currentPage} />
      <main className="pt-20">
        <PageContent />
      </main>
      <Footer navigate={handleNav} />
    </div>
  );
}


// --- Page & Section Components --- //

const Header = ({ navigate, isMenuOpen, setIsMenuOpen, currentPage }) => {
  const navLinks = [
    { page: 'home', label: 'Home' },
    { page: 'about', label: 'About' },
    { page: 'services', label: 'Services' },
    { page: 'portfolio', label: 'Portfolio' },
    { page: 'blog', label: 'Blog' },
    { page: 'contact', label: 'Contact' },
  ];

  const NavLink = ({ page, label }) => (
    <button 
      onClick={() => navigate(page)} 
      className={`px-4 py-2 text-sm uppercase tracking-widest transition-colors duration-300 ${currentPage === page ? 'text-white' : 'text-[#E6D5B8]/70 hover:text-white'}`}
    >
      {label}
    </button>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a]/80 backdrop-blur-md shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <button onClick={() => navigate('home')}>
          <Logo />
        </button>
        <nav className="hidden md:flex items-center">
          {navLinks.map(link => <NavLink key={link.page} {...link} />)}
        </nav>
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
            {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-[#1a1a1a]">
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
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-display mb-4 leading-tight">Capture. Create. Captivate.</h1>
      <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-[#E6D5B8]/80">Vintage heart, modern vision. Full-service photography and content strategy for brands ready to conquer the world from Houston, TX.</p>
      <div className="space-x-4">
        <button onClick={() => navigate('portfolio')} className="group inline-flex items-center bg-[#E6D5B8] text-[#1a1a1a] font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105">
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
          <p className="text-lg text-[#E6D5B8]/80 leading-relaxed">{content.bio || ''}</p>
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

const ServicesPage = () => {
  const proPackages = [
    { name: 'Director', price: '$2,500/mo+', details: 'Full scope content & marketing solutions, SEO, weekly content, on-call consulting. For businesses ready to take on the world.' },
    { name: 'Producer', price: '$2,000/mo', details: 'Bi-weekly content, website creation & maintenance, reporting & strategy meetings, ad management, pro photo/video.' },
    { name: 'Executive Assistant', price: '$1000/mo ($500/mo w/ contract)', details: '5-page website, monthly content, social media scheduling, strategy calls, 40 photo/video credits.' },
    { name: 'Stage Hand', price: '$500/mo ($250/mo w/ contract)', details: 'Landing page, 1 post/week, quarterly strategy meeting, brand pack (logo, domain), 20 photo/video credits.' }
  ];

  const personalPackages = [
      {name: 'Movie Premier', price: '$300', details: '1 hour session, 60 edited photos, 1-min video reel, and a Polaroid printout.'},
      {name: 'Full Episode', price: '$150', details: '30 minute session, 30 edited photos, 1-min video reel, and a Polaroid printout.'},
      {name: 'Mini Reel', price: '$75', details: '15 minute session, 15 edited photos, 1-min video reel, and a Polaroid printout.'}
  ];

  const otherServices = [
      {name: 'Creative Services', details: 'YouTube filming & editing, podcast production, music recording.'},
      {name: 'Personal Shoots', details: 'Family, social media, headshots, nature, maternity, wedding/engagement.'},
      {name: 'Specialized Coverage', details: 'Art gallery shoots, real estate photography, and event coverage with included press-ready articles.'}
  ]
  
  const ServiceCard = ({ name, price, details }) => (
    <div className="bg-[#262626] rounded-lg shadow-xl p-8 border border-white/10 flex flex-col h-full">
      <h3 className="text-2xl font-display text-white">{name}</h3>
      {price && <p className="text-xl font-bold my-4 text-[#E6D5B8]">{price}</p>}
      <p className="text-[#E6D5B8]/70 flex-grow">{details}</p>
    </div>
  );

  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display">Our Services</h2>
          <p className="text-lg text-[#E6D5B8]/70 mt-4 max-w-2xl mx-auto">From comprehensive brand management to capturing your most precious personal moments.</p>
        </div>

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
};

const PortfolioPage = ({ isUnlocked, onUnlock, images }) => {
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...new Set(images.map(img => img.category))];

  const filteredImages = filter === 'All' ? images : images.filter(img => img.category === filter);

  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display">Our Work</h2>
          <p className="text-lg text-[#E6D5B8]/70 mt-4 max-w-2xl mx-auto">A curated selection of our favorite moments and projects.</p>
        </div>
        
        {!isUnlocked && <PortfolioGate onUnlock={onUnlock} />}

        {isUnlocked && (
          <div>
            <div className="flex justify-center flex-wrap gap-2 mb-12">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-6 py-2 text-sm font-semibold rounded-full transition-colors ${filter === cat ? 'bg-[#E6D5B8] text-[#1a1a1a]' : 'bg-[#262626] hover:bg-[#333]'}`}
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
          </div>
        )}
      </div>
    </div>
  );
};

const PortfolioGate = ({ onUnlock }) => {
  const [formData, setFormData] = useState({ name: '', email: '', service: '', phone: '' });
  const [submitted, setSubmitted] = useState(false);

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
          <div className="text-center bg-[#262626] rounded-lg p-8 max-w-lg mx-auto">
            <h3 className="text-2xl font-display text-white mb-2">Thank You!</h3>
            <p className="text-[#E6D5B8]/80">The portfolio is now unlocked. Check your email for a 10% off coupon!</p>
            <p className="text-[#E6D5B8]/80 mt-4">Want to plan your shoot? <a href={`/planner?email=${encodeURIComponent(formData.email)}`} className="underline text-[#E6D5B8]">Try our Photoshoot AI Planner</a></p>
          </div>
      );
  }

  return (
    <div className="bg-[#262626] rounded-lg shadow-xl p-8 md:p-12 max-w-2xl mx-auto border border-white/10">
      <h3 className="text-2xl md:text-3xl font-display text-center text-white mb-2">Unlock the Portfolio</h3>
      <p className="text-center text-[#E6D5B8]/70 mb-8">Submit your info to view our work and receive a 10% off coupon for your first service!</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="text" name="name" placeholder="Your Name" required onChange={handleChange} className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#E6D5B8]" />
        <input type="email" name="email" placeholder="Your Email" required onChange={handleChange} className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#E6D5B8]" />
        <input type="tel" name="phone" placeholder="Your Phone (Optional)" onChange={handleChange} className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#E6D5B8]" />
        <select name="service" onChange={handleChange} className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#E6D5B8]">
            <option value="">Service of Interest (Optional)</option>
            <option>Director Package</option>
            <option>Producer Package</option>
            <option>Wedding</option>
            <option>Portrait</option>
            <option>Other</option>
        </select>
        <button type="submit" className="w-full group inline-flex items-center justify-center bg-[#E6D5B8] text-[#1a1a1a] font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105">
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
                <p className="text-lg text-[#E6D5B8]/70 mt-4 max-w-2xl mx-auto">Ready to start your project? Let's talk. We serve Houston, TX and the surrounding 50-mile radius.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-start">
                <form className="space-y-6">
                    <input type="text" placeholder="Your Name" className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#E6D5B8]" />
                    <input type="email" placeholder="Your Email" className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#E6D5B8]" />
                    <textarea placeholder="Your Message" rows="5" className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#E6D5B8]"></textarea>
                    <button type="submit" className="group inline-flex items-center bg-[#E6D5B8] text-[#1a1a1a] font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105">
                        Send Message <ArrowRight />
                    </button>
                </form>
                <div className="text-[#E6D5B8]/80 space-y-6">
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
    // In a real app, this would be a secure API call.
    if (username === 'admin' && password === 'studio37admin') {
      onLogin();
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="py-20 md:py-32 flex items-center justify-center">
      <div className="bg-[#262626] rounded-lg shadow-xl p-8 md:p-12 max-w-md w-full border border-white/10">
        <h2 className="text-3xl font-display text-center text-white mb-8">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#E6D5B8]" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#E6D5B8]" />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="w-full group inline-flex items-center justify-center bg-[#E6D5B8] text-[#1a1a1a] font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105">
            Login <ArrowRight />
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = ({
  leads, updateLeadStatus, content, updateContent, portfolioImages, addPortfolioImage, deletePortfolioImage,
  blogPosts, createBlogPost, updateBlogPost, deleteBlogPost, blogEdit, setBlogEdit, blogSaving, blogAdminError
}) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTodos, setProjectTodos] = useState([]);
  const [todosLoading, setTodosLoading] = useState(false);
  const [newTodo, setNewTodo] = useState('');

  // Fetch todos for selected project
  useEffect(() => {
    if (selectedProject) {
      setTodosLoading(true);
      supabase.from('project_todos').select('*').eq('project_id', selectedProject.id).order('created_at', { ascending: true }).then(({ data }) => {
        setProjectTodos(data || []);
        setTodosLoading(false);
      });
    }
  }, [selectedProject]);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const { data, error } = await supabase.from('project_todos').insert([{ project_id: selectedProject.id, task: newTodo }]).select();
    if (!error && data && data[0]) {
      setProjectTodos(t => [...t, data[0]]);
      setNewTodo('');
    }
  };

  const handleToggleTodo = async (todoId, completed) => {
    await supabase.from('project_todos').update({ completed: !completed }).eq('id', todoId);
    setProjectTodos(todos => todos.map(t => t.id === todoId ? { ...t, completed: !completed } : t));
  };

  const handleDeleteTodo = async (todoId) => {
    await supabase.from('project_todos').delete().eq('id', todoId);
    setProjectTodos(todos => todos.filter(t => t.id !== todoId));
  };
  const [activeTab, setActiveTab] = useState('crm');
  const [siteMapPage, setSiteMapPage] = useState('home');
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', client: '', opportunity_amount: '', stage: 'Inquiry', notes: '' });
  const projectStages = ['Inquiry', 'Proposal', 'Booked', 'In Progress', 'Delivered', 'Closed'];

  // Fetch projects from Supabase
  useEffect(() => {
    if (activeTab === 'projects') {
      setProjectsLoading(true);
      supabase.from('projects').select('*').order('created_at', { ascending: false }).then(({ data }) => {
        setProjects(data || []);
        setProjectsLoading(false);
      });
    }
  }, [activeTab]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('projects').insert([{ ...newProject, opportunity_amount: parseFloat(newProject.opportunity_amount) || 0 }]).select();
    if (!error && data && data[0]) {
      setProjects(p => [data[0], ...p]);
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

  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-display mb-10">Admin Dashboard</h2>
        <div className="flex border-b border-white/20 mb-8 flex-wrap">
          <button onClick={() => setActiveTab('crm')} className={`py-2 px-6 text-lg ${activeTab === 'crm' ? 'text-white border-b-2 border-[#E6D5B8]' : 'text-white/50'}`}>CRM (Leads)</button>
          <button onClick={() => setActiveTab('cms')} className={`py-2 px-6 text-lg ${activeTab === 'cms' ? 'text-white border-b-2 border-[#E6D5B8]' : 'text-white/50'}`}>CMS (Content)</button>
          <button onClick={() => setActiveTab('blog')} className={`py-2 px-6 text-lg ${activeTab === 'blog' ? 'text-white border-b-2 border-[#E6D5B8]' : 'text-white/50'}`}>Blog</button>
          <button onClick={() => setActiveTab('sitemap')} className={`py-2 px-6 text-lg ${activeTab === 'sitemap' ? 'text-white border-b-2 border-[#E6D5B8]' : 'text-white/50'}`}>Site Map</button>
          <button onClick={() => setActiveTab('analytics')} className={`py-2 px-6 text-lg ${activeTab === 'analytics' ? 'text-white border-b-2 border-[#E6D5B8]' : 'text-white/50'}`}>Analytics</button>
          <button onClick={() => setActiveTab('projects')} className={`py-2 px-6 text-lg ${activeTab === 'projects' ? 'text-white border-b-2 border-[#E6D5B8]' : 'text-white/50'}`}>Projects</button>
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
          <div className="bg-[#262626] p-8 rounded-lg grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-display mb-4">Leads & Conversion</h4>
              <div className="text-4xl font-bold mb-2">{totalLeads}</div>
              <div className="text-[#E6D5B8]/70 mb-2">Total Leads</div>
              <div className="text-2xl font-bold mb-2">{conversionRate}%</div>
              <div className="text-[#E6D5B8]/70 mb-2">Conversion Rate (Booked)</div>
              <div className="text-lg font-bold mb-2">{mostPopularService}</div>
              <div className="text-[#E6D5B8]/70">Most Popular Service</div>
            </div>
            <div>
              <h4 className="text-xl font-display mb-4">Content Stats</h4>
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-3xl font-bold">{blogCount}</span>
                  <span className="ml-2 text-[#E6D5B8]/70">Blog Posts</span>
                </div>
                <div>
                  <span className="text-3xl font-bold">{portfolioCount}</span>
                  <span className="ml-2 text-[#E6D5B8]/70">Portfolio Images</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'projects' && (
          <div className="bg-[#262626] p-8 rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-display">Projects</h4>
              <button onClick={() => setShowProjectForm(f => !f)} className="bg-[#E6D5B8] text-[#1a1a1a] font-bold py-2 px-4 rounded-md">{showProjectForm ? 'Cancel' : 'New Project'}</button>
            </div>
            {showProjectForm && (
              <form onSubmit={handleCreateProject} className="mb-8 grid md:grid-cols-2 gap-4">
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
            {projectsLoading ? (
              <div className="text-[#E6D5B8]">Loading projects...</div>
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

            {/* Project Detail Modal */}
            {selectedProject && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-[#232323] p-8 rounded-lg shadow-lg w-full max-w-2xl relative">
                  <button onClick={() => setSelectedProject(null)} className="absolute top-2 right-2 text-white text-xl">&times;</button>
                  <h4 className="text-2xl font-display mb-2">{selectedProject.name}</h4>
                  <div className="mb-2 text-[#E6D5B8]/80">Client: {selectedProject.client || 'N/A'}</div>
                  <div className="mb-2 text-[#E6D5B8]/80">Opportunity: ${selectedProject.opportunity_amount?.toLocaleString?.() ?? ''}</div>
                  <div className="mb-2 text-[#E6D5B8]/80">Stage: {selectedProject.stage}</div>
                  <div className="mb-4 text-[#E6D5B8]/80">Notes: {selectedProject.notes}</div>
                  <h5 className="text-lg font-display mb-2 mt-4">Project Todo List</h5>
                  <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
                    <input type="text" value={newTodo} onChange={e => setNewTodo(e.target.value)} placeholder="Add a task..." className="flex-grow bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3" />
                    <button type="submit" className="bg-[#E6D5B8] text-[#1a1a1a] font-bold py-2 px-4 rounded-md">Add</button>
                  </form>
                  {todosLoading ? (
                    <div className="text-[#E6D5B8]">Loading tasks...</div>
                  ) : (
                    <ul className="space-y-2">
                      {projectTodos.map(todo => (
                        <li key={todo.id} className="flex items-center gap-2 bg-[#1a1a1a] rounded p-2">
                          <input type="checkbox" checked={!!todo.completed} onChange={() => handleToggleTodo(todo.id, todo.completed)} />
                          <span className={todo.completed ? 'line-through text-[#E6D5B8]/50' : ''}>{todo.task}</span>
                          <button onClick={() => handleDeleteTodo(todo.id)} className="ml-auto text-red-400 hover:text-red-600 text-xs">Delete</button>
                        </li>
                      ))}
                      {projectTodos.length === 0 && <li className="text-[#E6D5B8]/60">No tasks yet.</li>}
                    </ul>
                  )}
                </div>
              </div>
            )}
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

  // Save order to Supabase
  const saveOrder = async (newPages) => {
    // Update each row's order_index
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

  if (loading) return <div className="text-[#E6D5B8]">Loading site map...</div>;
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
                          className={`px-4 py-2 rounded-full font-bold transition-colors ${siteMapPage === page.key ? 'bg-[#E6D5B8] text-[#1a1a1a]' : 'bg-[#262626] text-[#E6D5B8] hover:bg-[#E6D5B8]/30'}`}
                        >
                          {page.label}
                        </button>
                        {idx < pages.length - 1 && <span className="text-[#E6D5B8]">→</span>}
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
          <SiteMapPreview page={siteMapPage} content={content} portfolioImages={portfolioImages} blogPosts={blogPosts} />
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
          <p className="text-[#E6D5B8]/80 mb-4">Vintage heart, modern vision. Full-service photography and content strategy for brands ready to conquer the world from Houston, TX.</p>
        </div>
      );
    case 'about':
      return (
        <div>
          <h2 className="text-2xl font-display mb-2">{content.about.title}</h2>
          <p className="text-[#E6D5B8]/80">{content.about.bio}</p>
        </div>
      );
    case 'services':
      return <div><h2 className="text-2xl font-display mb-2">Our Services</h2><p className="text-[#E6D5B8]/80">From comprehensive brand management to capturing your most precious personal moments.</p></div>;
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
              <li key={post.id} className="text-[#E6D5B8]/80">{post.title}</li>
            ))}
          </ul>
        </div>
      );
    case 'contact':
      return (
        <div>
          <h2 className="text-2xl font-display mb-2">Get In Touch</h2>
          <p className="text-[#E6D5B8]/80">Ready to start your project? Let's talk. We serve Houston, TX and the surrounding 50-mile radius.</p>
        </div>
      );
    default:
      return null;
  }
};
// --- Blog Admin Section --- //
const BlogAdminSection = ({ blogPosts, createBlogPost, updateBlogPost, deleteBlogPost, blogEdit, setBlogEdit, blogSaving, blogAdminError }) => {
  const [form, setForm] = useState({
    title: '',
    slug: '',
    author: '',
    excerpt: '',
    content: '',
    publish_date: '',
    tags: [],
    category: ''
  });
  useEffect(() => {
    if (blogEdit) setForm({
      ...blogEdit,
      tags: blogEdit.tags || [],
      category: blogEdit.category || '',
      publish_date: blogEdit.publish_date ? blogEdit.publish_date.slice(0, 16) : ''
    });
    else setForm({ title: '', slug: '', author: '', excerpt: '', content: '', publish_date: '', tags: [], category: '' });
  }, [blogEdit]);

  const handleChange = e => {
    const { name, value, type } = e.target;
    if (name === 'tags') {
      setForm(f => ({ ...f, tags: Array.from(e.target.selectedOptions, o => o.value) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };
  const handleSubmit = e => {
    e.preventDefault();
    if (blogEdit) updateBlogPost(blogEdit.id, form).then(() => setBlogEdit(null));
    else createBlogPost(form);
  };
  const handleEdit = post => setBlogEdit(post);
  const handleDelete = id => { if (window.confirm('Delete this post?')) deleteBlogPost(id); };
  const handleCancel = () => setBlogEdit(null);

  // Example tag/category options
  const tagOptions = ['Tips', 'Behind the Scenes', 'Gear', 'Events', 'Portraits', 'Business', 'Personal'];
  const categoryOptions = ['General', 'Portrait', 'Event', 'Business', 'Wedding', 'Real Estate', 'Nature'];

  return (
    <div className="bg-[#262626] p-6 rounded-lg">
      <h4 className="text-xl font-display mb-4">{blogEdit ? 'Edit Blog Post' : 'New Blog Post'}</h4>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3" required />
        <input name="slug" value={form.slug} onChange={handleChange} placeholder="Slug (unique, e.g. my-post)" className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3" required />
        <input name="author" value={form.author} onChange={handleChange} placeholder="Author" className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3" />
        <input name="excerpt" value={form.excerpt} onChange={handleChange} placeholder="Excerpt" className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3" />
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs mb-1 text-[#E6D5B8]/70">Publish Date</label>
            <input type="datetime-local" name="publish_date" value={form.publish_date} onChange={handleChange} className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3" />
          </div>
          <div className="flex-1">
            <label className="block text-xs mb-1 text-[#E6D5B8]/70">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3">
              <option value="">Select category</option>
              {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs mb-1 text-[#E6D5B8]/70">Tags</label>
            <select name="tags" multiple value={form.tags} onChange={handleChange} className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 h-24">
              {tagOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
        <label className="block text-xs mb-1 text-[#E6D5B8]/70">Content (Markdown supported)</label>
        <div className="grid md:grid-cols-2 gap-4">
          <textarea name="content" value={form.content} onChange={handleChange} placeholder="Write your post in Markdown..." rows={10} className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 font-mono" required />
          <div className="bg-[#181818] border border-white/10 rounded-md p-3 overflow-auto min-h-[200px]">
            <div className="text-xs text-[#E6D5B8]/60 mb-1">Live Preview</div>
            <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert max-w-none text-[#E6D5B8]/90">
              {form.content || 'Nothing to preview.'}
            </ReactMarkdown>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-[#E6D5B8] text-[#1a1a1a] font-bold py-2 px-4 rounded-md" disabled={blogSaving}>{blogEdit ? 'Update' : 'Create'}</button>
          {blogEdit && <button type="button" onClick={handleCancel} className="bg-gray-500 text-white py-2 px-4 rounded-md">Cancel</button>}
        </div>
        {blogAdminError && <div className="text-red-400">{blogAdminError}</div>}
      </form>
      <h4 className="text-lg font-display mb-2">All Blog Posts</h4>
      <div className="space-y-4">
        {blogPosts.map(post => (
          <div key={post.id} className="bg-[#1a1a1a] p-4 rounded flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-bold text-white">{post.title}</div>
              <div className="text-xs text-[#E6D5B8]/60">/{post.slug} &middot; {post.author} &middot; {post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}</div>
              <div className="text-[#E6D5B8]/80 text-sm mt-1">{post.excerpt}</div>
              <div className="text-xs text-[#E6D5B8]/60 mt-1">{post.category} {post.tags && post.tags.length > 0 && <> &middot; {post.tags.join(', ')}</>}</div>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button onClick={() => handleEdit(post)} className="bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
              <button onClick={() => handleDelete(post.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CrmSection = ({ leads, updateLeadStatus }) => {
  const [openLeadId, setOpenLeadId] = React.useState(null);
  const [notes, setNotes] = React.useState({}); // {leadId: [notes]}
  const [loadingNotes, setLoadingNotes] = React.useState(false);
  const [noteInput, setNoteInput] = React.useState('');
  const [noteStatus, setNoteStatus] = React.useState('');
  const [addingNote, setAddingNote] = React.useState(false);

  // Fetch notes for a lead when opened
  const fetchNotes = async (leadId) => {
    setLoadingNotes(true);
    const { data, error } = await supabase
      .from('lead_notes')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });
    if (!error) setNotes(prev => ({ ...prev, [leadId]: data }));
    setLoadingNotes(false);
  };

  const handleOpenNotes = (leadId) => {
    setOpenLeadId(openLeadId === leadId ? null : leadId);
    if (openLeadId !== leadId) fetchNotes(leadId);
  };

  const handleAddNote = async (leadId) => {
    setAddingNote(true);
    const { data, error } = await supabase
      .from('lead_notes')
      .insert([{ lead_id: leadId, note: noteInput, status: noteStatus }]);
    setAddingNote(false);
    setNoteInput('');
    setNoteStatus('');
    if (!error) fetchNotes(leadId);
  };

  return (
    <div>
      <h3 className="text-2xl font-display mb-6">Client Leads ({leads.length})</h3>
      <div className="bg-[#262626] rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-white/10">
            <tr>
              <th className="p-4 uppercase text-sm font-bold tracking-wider">Name</th>
              <th className="p-4 uppercase text-sm font-bold tracking-wider">Contact</th>
              <th className="p-4 uppercase text-sm font-bold tracking-wider">Service</th>
              <th className="p-4 uppercase text-sm font-bold tracking-wider">Status</th>
              <th className="p-4 uppercase text-sm font-bold tracking-wider">Actions</th>
              <th className="p-4 uppercase text-sm font-bold tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <React.Fragment key={lead.id}>
                <tr className="border-b border-white/10 last:border-b-0">
                  <td className="p-4">{lead.name}</td>
                  <td className="p-4">
                    <div className="text-sm">{lead.email}</div>
                    {lead.phone && <div className="text-xs text-white/60">{lead.phone}</div>}
                  </td>
                  <td className="p-4">{lead.service || 'N/A'}</td>
                  <td className="p-4">
                    <select 
                      value={lead.status} 
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                      className="bg-[#1a1a1a] border border-white/20 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-[#E6D5B8]"
                    >
                      <option>New</option>
                      <option>Contacted</option>
                      <option>Booked</option>
                      <option>Closed</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <a href={`mailto:${lead.email}`} title="Email" className="text-[#E6D5B8] hover:text-white">
                        <MailIcon />
                      </a>
                      {lead.phone && (
                        <>
                          <a href={`tel:${lead.phone}`} title="Call" className="text-[#E6D5B8] hover:text-white">
                            <PhoneIcon />
                          </a>
                          <a href={`sms:${lead.phone}`} title="SMS" className="text-[#E6D5B8] hover:text-white">
                            <SmsIcon />
                          </a>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleOpenNotes(lead.id)} className="bg-[#E6D5B8] text-[#1a1a1a] px-3 py-1 rounded-full text-xs font-bold hover:bg-[#e6d5b8]/80">{openLeadId === lead.id ? 'Hide' : 'Show'} Notes</button>
                  </td>
                </tr>
                {openLeadId === lead.id && (
                  <tr>
                    <td colSpan={6} className="bg-[#232323] p-4">
                      <div className="mb-2 font-bold text-[#E6D5B8]">Notes & Status History</div>
                      {loadingNotes ? (
                        <div className="text-[#E6D5B8]">Loading...</div>
                      ) : (
                        <div className="space-y-2 mb-4">
                          {(notes[lead.id] || []).length === 0 && <div className="text-[#E6D5B8]/60">No notes yet.</div>}
                          {(notes[lead.id] || []).map(note => (
                            <div key={note.id} className="bg-[#1a1a1a] rounded p-2 text-sm flex flex-col md:flex-row md:items-center md:gap-4">
                              <span className="text-[#E6D5B8]">{note.status && <span className="font-bold">[{note.status}] </span>}{note.note}</span>
                              <span className="text-xs text-[#E6D5B8]/60 md:ml-auto">{new Date(note.created_at).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <form onSubmit={e => { e.preventDefault(); handleAddNote(lead.id); }} className="flex flex-col md:flex-row gap-2 items-start md:items-end">
                        <input type="text" value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="Add note..." className="bg-[#1a1a1a] border border-white/20 rounded-md py-1 px-2 w-full md:w-1/2" />
                        <select value={noteStatus} onChange={e => setNoteStatus(e.target.value)} className="bg-[#1a1a1a] border border-white/20 rounded-md py-1 px-2">
                          <option value="">Status (optional)</option>
                          <option>New</option>
                          <option>Contacted</option>
                          <option>Booked</option>
                          <option>Closed</option>
                        </select>
                        <button type="submit" className="bg-[#E6D5B8] text-[#1a1a1a] px-3 py-1 rounded-md font-bold" disabled={addingNote || (!noteInput && !noteStatus)}>{addingNote ? 'Adding...' : 'Add'}</button>
                      </form>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CmsSection = ({ content, updateContent, portfolioImages, addPortfolioImage, deletePortfolioImage }) => {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCategory, setNewImageCategory] = useState('Portrait');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]); // for bulk delete
  const [editingImage, setEditingImage] = useState(null); // {id, url, category, caption}
  const [editFields, setEditFields] = useState({ url: '', category: '', caption: '' });

  // Drag-and-drop reordering
  const [images, setImages] = useState([]);
  useEffect(() => {
    setImages([...portfolioImages].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)));
  }, [portfolioImages]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(images);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setImages(reordered);
    // Persist new order to Supabase
    for (let i = 0; i < reordered.length; i++) {
      await supabase.from('portfolio_images').update({ order_index: i }).eq('id', reordered[i].id);
    }
  };

  const handleAddImage = (e) => {
    e.preventDefault();
    if(newImageUrl) {
      addPortfolioImage({ url: newImageUrl, category: newImageCategory, caption: newImageCaption });
      setNewImageUrl('');
      setNewImageCaption('');
      setShowPreview(false);
    }
  }

  const handleUrlChange = (e) => {
    setNewImageUrl(e.target.value);
    setShowPreview(!!e.target.value);
  };

  const handleSelectImage = (id) => {
    setSelectedImages(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]);
  };

  const handleBulkDelete = async () => {
    for (const id of selectedImages) {
      await deletePortfolioImage(id);
    }
    setSelectedImages([]);
  };

  const handleEditImage = (img) => {
    setEditingImage(img);
    setEditFields({ url: img.url, category: img.category, caption: img.caption || '' });
  };

  const handleEditFieldChange = (e) => {
    setEditFields(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSaveEdit = async () => {
    await supabase.from('portfolio_images').update({
      url: editFields.url,
      category: editFields.category,
      caption: editFields.caption
    }).eq('id', editingImage.id);
    setEditingImage(null);
  };

  return (
    <div>
      <h3 className="text-2xl font-display mb-6">Website Content</h3>

      {/* About Page Editor */}
      <div className="bg-[#262626] p-6 rounded-lg mb-8">
        <h4 className="text-xl font-display mb-4">About Page Content</h4>
        <div className="space-y-4">
          <input 
            type="text"
            value={content.about.title}
            onChange={e => updateContent('about', 'title', e.target.value)}
            className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3"
          />
          <textarea 
            rows="5"
            value={content.about.bio}
            onChange={e => updateContent('about', 'bio', e.target.value)}
            className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3"
          ></textarea>
        </div>
      </div>

      {/* Portfolio Manager */}
      <div className="bg-[#262626] p-6 rounded-lg">
        <h4 className="text-xl font-display mb-4">Portfolio Images</h4>
        <form onSubmit={handleAddImage} className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          <input type="text" value={newImageUrl} onChange={handleUrlChange} placeholder="Image URL (e.g., from placehold.co or Cloudinary)" className="flex-grow bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3" />
          <select value={newImageCategory} onChange={e => setNewImageCategory(e.target.value)} className="bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3">
            <option>Portrait</option>
            <option>Event</option>
            <option>Professional</option>
            <option>Wedding</option>
            <option>Real Estate</option>
            <option>Nature</option>
          </select>
          <input type="text" value={newImageCaption} onChange={e => setNewImageCaption(e.target.value)} placeholder="Caption (optional)" className="bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3" />
          <button type="submit" className="bg-[#E6D5B8] text-[#1a1a1a] font-bold py-2 px-4 rounded-md">Add Image</button>
        </form>
        {showPreview && newImageUrl && (
          <div className="mb-6 flex flex-col items-center">
            <span className="text-[#E6D5B8]/70 text-xs mb-2">Image Preview:</span>
            <img src={newImageUrl} alt="Preview" className="max-h-40 rounded shadow border border-white/10" onError={e => {e.target.style.display='none';}} />
          </div>
        )}

        <div className="mb-4 flex gap-2">
          <button onClick={handleBulkDelete} className="bg-red-500 text-white px-4 py-2 rounded-md font-bold" disabled={selectedImages.length === 0}>Delete Selected</button>
          <span className="text-[#E6D5B8]/70 text-xs">(Select images below to delete in bulk)</span>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="portfolioImages" direction="horizontal">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {images.map((img, idx) => (
                  <Draggable key={img.id} draggableId={img.id.toString()} index={idx}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`relative group bg-[#1a1a1a] rounded-md p-2 border border-white/10 ${snapshot.isDragging ? 'opacity-80' : ''}`}
                      >
                        <input type="checkbox" checked={selectedImages.includes(img.id)} onChange={() => handleSelectImage(img.id)} className="absolute top-2 left-2 z-10" />
                        <img src={img.url} className="rounded-md mb-2 w-full h-32 object-cover" />
                        <div className="text-xs text-[#E6D5B8]/80 mb-1">{img.category}</div>
                        {img.caption && <div className="text-xs text-[#E6D5B8]/60 mb-1 italic">{img.caption}</div>}
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleEditImage(img)} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Edit</button>
                          <button onClick={() => deletePortfolioImage(img.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">Delete</button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Edit Modal */}
        {editingImage && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#232323] p-8 rounded-lg shadow-lg w-full max-w-md relative">
              <button onClick={() => setEditingImage(null)} className="absolute top-2 right-2 text-white text-xl">&times;</button>
              <h4 className="text-xl font-display mb-4">Edit Image</h4>
              <div className="space-y-4">
                <input type="text" name="url" value={editFields.url} onChange={handleEditFieldChange} placeholder="Image URL" className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3" />
                <select name="category" value={editFields.category} onChange={handleEditFieldChange} className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3">
                  <option>Portrait</option>
                  <option>Event</option>
                  <option>Professional</option>
                  <option>Wedding</option>
                  <option>Real Estate</option>
                  <option>Nature</option>
                </select>
                <input type="text" name="caption" value={editFields.caption} onChange={handleEditFieldChange} placeholder="Caption (optional)" className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3" />
                <img src={editFields.url} alt="Preview" className="max-h-40 rounded shadow border border-white/10 mx-auto" />
                <button onClick={handleSaveEdit} className="bg-[#E6D5B8] text-[#1a1a1a] font-bold py-2 px-4 rounded-md w-full">Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const Footer = ({ navigate }) => (
  <footer className="bg-[#111] text-white/50 py-12">
    <div className="container mx-auto px-6 text-center">
      <div className="flex justify-center mb-4">
        <Logo />
      </div>
      <div className="flex justify-center gap-6 my-4">
        <button onClick={() => navigate('home')} className="hover:text-white transition">Home</button>
        <button onClick={() => navigate('about')} className="hover:text-white transition">About</button>
        <button onClick={() => navigate('services')} className="hover:text-white transition">Services</button>
        <button onClick={() => navigate('portfolio')} className="hover:text-white transition">Portfolio</button>
        <button onClick={() => navigate('blog')} className="hover:text-white transition">Blog</button>
      </div>
      <p className="text-sm">&copy; {new Date().getFullYear()} Studio37 Photography & Content. All Rights Reserved.</p>
      <button onClick={() => navigate('adminLogin')} className="text-xs mt-4 hover:text-white transition">Admin Access</button>
    </div>
  </footer>
);
// --- Blog Page Component --- //
const BlogPage = ({ posts, loading, error }) => (
  <div className="py-20 md:py-28 min-h-[60vh]">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-display">Blog</h2>
        <p className="text-lg text-[#E6D5B8]/70 mt-4 max-w-2xl mx-auto">Stories, tips, and behind-the-scenes from Studio37.</p>
      </div>
      {loading && <div className="text-center text-[#E6D5B8]">Loading...</div>}
      {error && <div className="text-center text-red-400">{error}</div>}
      {!loading && !error && posts.length === 0 && (
        <div className="text-center text-[#E6D5B8]/70">No blog posts yet.</div>
      )}
      <div className="space-y-10 max-w-2xl mx-auto">
        {posts.map(post => (
          <article key={post.id} className="bg-[#262626] rounded-lg shadow-lg p-8 border border-white/10">
            <h3 className="text-2xl font-display text-white mb-2">{post.title}</h3>
            <div className="text-xs text-[#E6D5B8]/60 mb-4">{new Date(post.created_at).toLocaleDateString()}</div>
            <div className="prose prose-invert max-w-none text-[#E6D5B8]/90">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content || ''}</ReactMarkdown>
            </div>
          </article>
        ))}
      </div>
    </div>
  </div>
);
