import React, from 'react';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Import the Supabase client

// --- Helper Components & Icons (Keep these as they are) --- //

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
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

const Logo = ({ className }) => (
  <div className={`flex items-center ${className || ''}`}>
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white mr-2 flex-shrink-0">
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
  const [currentPost, setCurrentPost] = useState(null);
  const [session, setSession] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPortfolioUnlocked, setIsPortfolioUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // --- Data State from Supabase --- //
  const [leads, setLeads] = useState([]);
  const [siteContent, setSiteContent] = useState({ about: { title: '', bio: '' } });
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);

  // --- Data Fetching Effect --- //
  useEffect(() => {
    // Check for active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    async function fetchData() {
      setLoading(true);
      // Fetch all data in parallel
      const [leadsRes, contentRes, imagesRes, postsRes] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('site_content').select('content').eq('section', 'about').single(),
        supabase.from('portfolio_images').select('*').order('created_at', { ascending: false }),
        supabase.from('blog_posts').select('*').order('date', { ascending: false }),
      ]);

      if (leadsRes.data) setLeads(leadsRes.data);
      if (contentRes.data) setSiteContent({ about: contentRes.data.content });
      if (imagesRes.data) setPortfolioImages(imagesRes.data);
      if (postsRes.data) setBlogPosts(postsRes.data);

      setLoading(false);
    }

    fetchData();
    
    return () => subscription.unsubscribe();
  }, []);


  // --- Navigation Handlers --- //
  const handleNav = (page) => {
    setCurrentPage(page);
    setCurrentPost(null);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const viewPost = (post) => {
    setCurrentPost(post);
    setCurrentPage('blogPost');
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };
  
  // --- Supabase Data Manipulation Functions --- //

  const addLead = async (lead) => {
    const { data, error } = await supabase
      .from('leads')
      .insert([{ ...lead, status: 'New' }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding lead:', error);
    } else if (data) {
      setLeads(prevLeads => [data, ...prevLeads]);
      setIsPortfolioUnlocked(true);
    }
  };
  
  const updateLeadStatus = async (id, status) => {
    const { error } = await supabase.from('leads').update({ status }).eq('id', id);
    if (!error) {
      setLeads(leads.map(lead => lead.id === id ? { ...lead, status } : lead));
    }
  };

  const updateSiteContent = async (section, key, value) => {
    const newContent = { ...siteContent[section], [key]: value };
    const { error } = await supabase
      .from('site_content')
      .update({ content: newContent })
      .eq('section', section);
    
    if (!error) {
      setSiteContent(prev => ({ ...prev, [section]: newContent }));
    }
  };
  
  const addPortfolioImage = async (newImage) => {
    const { data, error } = await supabase.from('portfolio_images').insert([newImage]).select().single();
    if (!error && data) {
      setPortfolioImages(prev => [data, ...prev]);
    }
  };

  const deletePortfolioImage = async (id) => {
    const { error } = await supabase.from('portfolio_images').delete().eq('id', id);
    if (!error) {
      setPortfolioImages(prev => prev.filter(img => img.id !== id));
    }
  };
  
  const saveBlogPost = async (postToSave) => {
      const isUpdate = !!postToSave.id;
      const query = isUpdate
        ? supabase.from('blog_posts').update(postToSave).eq('id', postToSave.id)
        : supabase.from('blog_posts').insert([postToSave]);

      const { data, error } = await query.select().single();

      if (error) {
          console.error('Error saving post:', error);
      } else if (data) {
          if (isUpdate) {
              setBlogPosts(prev => prev.map(p => p.id === data.id ? data : p));
          } else {
              setBlogPosts(prev => [data, ...prev]);
          }
      }
  };

  const deleteBlogPost = async (id) => {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (!error) {
      setBlogPosts(prev => prev.filter(p => p.id !== id));
    }
  };


  const PageContent = () => {
    if (loading) {
        return <div className="py-40 text-center">Loading Content...</div>;
    }
    switch(currentPage) {
      case 'home': return <HomePage navigate={handleNav} />;
      case 'about': return <AboutPage content={siteContent.about} />;
      case 'services': return <ServicesPage />;
      case 'blog': return <BlogListPage posts={blogPosts} viewPost={viewPost} />;
      case 'blogPost': return <BlogPostPage post={currentPost} navigate={handleNav} />;
      case 'portfolio': return <PortfolioPage isUnlocked={isPortfolioUnlocked} onUnlock={addLead} images={portfolioImages} />;
      case 'contact': return <ContactPage />;
      case 'adminLogin': return <AdminLoginPage navigate={handleNav} />;
      case 'adminDashboard': return session ? <AdminDashboard 
                                                  leads={leads} 
                                                  updateLeadStatus={updateLeadStatus}
                                                  content={siteContent}
                                                  updateContent={updateSiteContent}
                                                  portfolioImages={portfolioImages}
                                                  addPortfolioImage={addPortfolioImage}
                                                  deletePortfolioImage={deletePortfolioImage}
                                                  blogPosts={blogPosts}
                                                  saveBlogPost={saveBlogPost}
                                                  deleteBlogPost={deleteBlogPost}
                                                  navigate={handleNav}
                                               /> : <AdminLoginPage navigate={handleNav} />;
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
            background: #fff; padding: 1rem; padding-bottom: 3rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transform: rotate(-2deg); transition: all 0.3s ease-in-out;
        }
        .polaroid:nth-child(2n) { transform: rotate(2deg); }
        .polaroid:hover { transform: scale(1.05) rotate(0deg); z-index: 10; }
        .prose-styles { white-space: pre-wrap; }
        .prose-styles p { margin-bottom: 1em; }
        .prose-styles h1, .prose-styles h2, .prose-styles h3 { margin-top: 1.5em; margin-bottom: 0.5em; }
      `}</style>
      
      <Header navigate={handleNav} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} currentPage={currentPage} />
      <main className="pt-20">
        <PageContent />
      </main>
      <Footer navigate={handleNav} />
    </div>
  );
}


// --- Page & Section Components (No major changes here, only Admin Login/Dashboard) --- //

const Header = ({ navigate, isMenuOpen, setIsMenuOpen, currentPage }) => {
    // ... (This component remains unchanged)
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
        <button onClick={() => navigate('home')}><Logo /></button>
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
    // ... (This component remains unchanged)
  <div className="relative h-screen flex items-center justify-center text-center text-white px-4 -mt-20 overflow-hidden">
    <img 
      src="https://res.cloudinary.com/dmjxho2rl/image/upload/a_vflip/l_image:upload:My%20Brand:IMG_2115_mtuowt/c_scale,fl_relative,w_0.35/o_100/fl_layer_apply,g_north,x_0.03,y_0.04/v1758172510/A4B03835-ED8B-4FBB-A27E-1F2EE6CA1A18_1_105_c_gstgil.jpg"
      alt="Photographer taking a picture in a studio setting"
      className="absolute inset-0 w-full h-full object-cover z-0"
    />
    <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
    <div className="relative z-20">
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-display mb-4 leading-tight">Capture. Create. Captivate.</h1>
      <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-[#E6D5B8]/80">Vintage heart, modern vision. Full-service photography and content strategy for brands ready to conquer the world from Houston, TX.</p>
      <button onClick={() => navigate('portfolio')} className="group inline-flex items-center bg-[#E6D5B8] text-[#1a1a1a] font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105">
        View Our Work <ArrowRight />
      </button>
    </div>
  </div>
);
const AboutPage = ({ content }) => (
    // ... (This component remains unchanged)
  <div className="py-20 md:py-32 bg-[#212121]">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1">
          <h2 className="text-4xl md:text-5xl font-display mb-6">{content.title}</h2>
          <p className="text-lg text-[#E6D5B8]/80 leading-relaxed">{content.bio}</p>
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
    // ... (This component remains unchanged)
    const servicePackages = [
        { name: 'Director', price: '$2,500/mo+', details: 'Full scope content & marketing solutions, SEO, weekly content, on-call consulting.' },
        { name: 'Producer', price: '$2,000/mo', details: 'Bi-weekly content, website creation & maintenance, reporting & strategy meetings.' },
    ];
    return (
    <div className="py-20 md:py-28">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-display">Our Services</h2>
        </div>
    </div>
    );
};
const BlogListPage = ({ posts, viewPost }) => (
    // ... (This component remains unchanged)
    <div className="py-20 md:py-28">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-display">The Studio37 Blog</h2>
                <p className="text-lg text-[#E6D5B8]/70 mt-4 max-w-2xl mx-auto">Insights, stories, and tips from the field.</p>
            </div>
            <div className="max-w-3xl mx-auto space-y-12">
                {posts.map(post => (
                    <div key={post.id} className="bg-[#262626] rounded-lg shadow-xl p-8 border border-white/10">
                        <h3 className="text-3xl font-display text-white mb-2">{post.title}</h3>
                        <p className="text-sm text-[#E6D5B8]/50 mb-4">By {post.author} on {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="text-[#E6D5B8]/80 mb-6">{post.excerpt}</p>
                        <button onClick={() => viewPost(post)} className="group inline-flex items-center font-bold text-[#E6D5B8] hover:text-white">
                            Read More <ArrowRight />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
const BlogPostPage = ({ post, navigate }) => {
    // ... (This component remains unchanged)
    if (!post) {
        return (
            <div className="py-20 md:py-28 text-center">
                <h2 className="text-3xl font-display mb-4">Post not found!</h2>
                <button onClick={() => navigate('blog')} className="text-[#E6D5B8] hover:text-white">
                    &larr; Back to the Blog
                </button>
            </div>
        );
    }

    return (
        <div className="py-20 md:py-28">
            <div className="container mx-auto px-6 max-w-3xl">
                <button onClick={() => navigate('blog')} className="text-[#E6D5B8] hover:text-white mb-8 inline-flex items-center">
                    &larr; Back to Blog
                </button>
                <article>
                    <h1 className="text-4xl md:text-6xl font-display mb-4">{post.title}</h1>
                    <p className="text-md text-[#E6D5B8]/60 mb-8">By {post.author} on {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <div className="text-lg text-[#E6D5B8]/80 leading-relaxed prose-styles">
                        {post.content}
                    </div>
                </article>
            </div>
        </div>
    );
};
const PortfolioPage = ({ isUnlocked, onUnlock, images }) => {
    // ... (This component remains unchanged)
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...new Set(images.map(img => img.category))];
  const filteredImages = filter === 'All' ? images : images.filter(img => img.category === filter);
  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display">Our Work</h2>
        </div>
        {!isUnlocked && <PortfolioGate onUnlock={onUnlock} />}
        {isUnlocked && (
          <div>
            <div className="flex justify-center flex-wrap gap-2 mb-12">
              {categories.map(cat => (
                <button key={cat} onClick={() => setFilter(cat)} className={`px-6 py-2 text-sm font-semibold rounded-full transition-colors ${filter === cat ? 'bg-[#E6D5B8] text-[#1a1a1a]' : 'bg-[#262626] hover:bg-[#333]'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                {filteredImages.map(img => (
                    <div key={img.id} className="break-inside-avoid">
                        <img src={img.url} alt={`${img.category} photography`} className="w-full rounded-lg shadow-lg" />
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
    // ... (This component remains unchanged)
  const [formData, setFormData] = useState({ name: '', email: ''});
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email) onUnlock(formData);
  };
  return (
    <div className="bg-[#262626] rounded-lg p-8 max-w-2xl mx-auto">
      <h3 className="text-3xl font-display text-center mb-2">Unlock the Portfolio</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="text" name="name" placeholder="Your Name" required onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#1a1a1a] rounded py-3 px-4" />
        <input type="email" name="email" placeholder="Your Email" required onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#1a1a1a] rounded py-3 px-4" />
        <button type="submit" className="w-full group inline-flex items-center justify-center bg-[#E6D5B8] text-[#1a1a1a] font-bold py-3 px-8 rounded-full">
          Unlock & Get Coupon <ArrowRight />
        </button>
      </form>
    </div>
  );
};
const ContactPage = () => (
    // ... (This component remains unchanged)
    <div className="py-20 md:py-28 bg-[#212121]">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-display">Get In Touch</h2>
        </div>
    </div>
);

const AdminLoginPage = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      navigate('adminDashboard');
    }
  };

  return (
    <div className="py-20 md:py-32 flex justify-center">
      <div className="bg-[#262626] p-8 max-w-md w-full rounded-lg shadow-xl">
        <h2 className="text-3xl font-display text-center mb-8">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full bg-[#1a1a1a] rounded py-3 px-4" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full bg-[#1a1a1a] rounded py-3 px-4" />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" className="w-full bg-[#E6D5B8] text-[#1a1a1a] font-bold py-3 px-8 rounded-full">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = (props) => {
    const [activeTab, setActiveTab] = useState('crm');
    const handleLogout = async () => {
        await supabase.auth.signOut();
        props.navigate('home');
    };
    return (
        <div className="py-20 md:py-28">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-4xl md:text-5xl font-display">Admin Dashboard</h2>
                    <button onClick={handleLogout} className="bg-red-500 text-white font-bold py-2 px-4 rounded-md">Logout</button>
                </div>
                <div className="flex border-b border-white/20 mb-8">
                    <button onClick={() => setActiveTab('crm')} className={`py-2 px-6 text-lg ${activeTab === 'crm' ? 'text-white border-b-2 border-[#E6D5B8]' : 'text-white/50'}`}>CRM</button>
                    <button onClick={() => setActiveTab('cms')} className={`py-2 px-6 text-lg ${activeTab === 'cms' ? 'text-white border-b-2 border-[#E6D5B8]' : 'text-white/50'}`}>CMS</button>
                </div>
                {activeTab === 'crm' && <CrmSection leads={props.leads} updateLeadStatus={props.updateLeadStatus} />}
                {activeTab === 'cms' && <CmsSection {...props} />}
            </div>
        </div>
    );
};

const CrmSection = ({ leads, updateLeadStatus }) => {
    // ... (This component remains largely the same, just fill in the table)
    return (
    <div>
        <h3 className="text-2xl font-display mb-6">Client Leads ({leads.length})</h3>
        <div className="bg-[#262626] rounded-lg overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
                <thead>
                    <tr className="border-b border-white/10">
                        <th className="p-4">Name</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {leads.map(lead => (
                        <tr key={lead.id} className="border-b border-white/5">
                            <td className="p-4">{lead.name}</td>
                            <td className="p-4 text-sm text-white/70">{lead.email}<br/>{lead.phone}</td>
                            <td className="p-4">
                                <select value={lead.status} onChange={e => updateLeadStatus(lead.id, e.target.value)} className="bg-[#1a1a1a] rounded p-2 text-sm">
                                    <option>New</option>
                                    <option>Contacted</option>
                                    <option>Booked</option>
                                    <option>Closed</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
    );
};
const CmsSection = (props) => {
    // ... (This component remains unchanged)
    const { content, updateContent, portfolioImages, addPortfolioImage, deletePortfolioImage, blogPosts, saveBlogPost, deleteBlogPost } = props;
    
    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <CmsAboutEditor aboutContent={content.about} updateContent={updateContent} />
                    <CmsPortfolioEditor portfolioImages={portfolioImages} addPortfolioImage={addPortfolioImage} deletePortfolioImage={deletePortfolioImage} />
                </div>
                <CmsBlogEditor blogPosts={blogPosts} saveBlogPost={saveBlogPost} deleteBlogPost={deleteBlogPost} />
            </div>
        </div>
    );
};
const CmsAboutEditor = ({ aboutContent, updateContent }) => {
    // ... (This component remains unchanged)
    return (
    <div className="bg-[#262626] p-6 rounded-lg mb-8">
        <h4 className="text-xl font-display mb-4">About Page Content</h4>
        <div className="space-y-4">
            <input type="text" value={aboutContent.title} onChange={e => updateContent('about', 'title', e.target.value)} className="w-full bg-[#1a1a1a] rounded p-2" />
            <textarea rows="5" value={aboutContent.bio} onChange={e => updateContent('about', 'bio', e.target.value)} className="w-full bg-[#1a1a1a] rounded p-2"></textarea>
        </div>
    </div>
    );
};
const CmsPortfolioEditor = ({ portfolioImages, addPortfolioImage, deletePortfolioImage }) => {
    // ... (This component remains unchanged)
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newImageCategory, setNewImageCategory] = useState('Portrait');
    
    const handleAddImage = (e) => {
        e.preventDefault();
        if(newImageUrl) {
            addPortfolioImage({ url: newImageUrl, category: newImageCategory });
            setNewImageUrl('');
        }
    }
    return (
        <div className="bg-[#262626] p-6 rounded-lg">
            <h4 className="text-xl font-display mb-4">Portfolio Images</h4>
            <form onSubmit={handleAddImage} className="flex gap-4 mb-6">
                <input type="text" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="Image URL" className="flex-grow bg-[#1a1a1a] rounded p-2" />
                <select value={newImageCategory} onChange={e => setNewImageCategory(e.target.value)} className="bg-[#1a1a1a] rounded p-2">
                    <option>Portrait</option>
                    <option>Event</option>
                    <option>Real Estate</option>
                </select>
                <button type="submit" className="bg-[#E6D5B8] text-[#1a1a1a] font-bold py-2 px-4 rounded-md">Add</button>
            </form>
            <div className="grid grid-cols-3 gap-4">
                {portfolioImages.map(img => (
                    <div key={img.id} className="relative group">
                        <img src={img.url} className="rounded-md" alt="Portfolio item" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => deletePortfolioImage(img.id)} className="bg-red-500 text-white rounded-full p-2"><TrashIcon /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
const CmsBlogEditor = ({ blogPosts, saveBlogPost, deleteBlogPost }) => {
    // ... (This component is updated slightly to handle dates/slugs better)
    const [editingPost, setEditingPost] = useState(null);

    const handleEdit = (post) => {
        setEditingPost(post ? {...post} : null);
    };
    
    const handleSave = (postToSave) => {
        const slug = postToSave.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        const finalPost = {
            ...postToSave,
            slug,
            author: postToSave.author || 'Studio37',
            date: postToSave.date || new Date().toISOString().split('T')[0], // YYYY-MM-DD
        };
        if (!finalPost.excerpt) {
            finalPost.excerpt = finalPost.content.substring(0, 150) + '...';
        }

        saveBlogPost(finalPost);
        setEditingPost(null);
    };

    if (editingPost) {
        return (
            <div className="bg-[#262626] p-6 rounded-lg">
                <h4 className="text-xl font-display mb-4">{editingPost.id ? 'Edit Post' : 'Create New Post'}</h4>
                <div className="space-y-4">
                    <input type="text" placeholder="Post Title" value={editingPost.title || ''} onChange={e => handleEdit({...editingPost, title: e.target.value})} className="w-full bg-[#1a1a1a] rounded p-2" />
                    <textarea rows="4" placeholder="Excerpt / Summary" value={editingPost.excerpt || ''} onChange={e => handleEdit({...editingPost, excerpt: e.target.value})} className="w-full bg-[#1a1a1a] rounded p-2" ></textarea>
                    <textarea rows="10" placeholder="Full Content" value={editingPost.content || ''} onChange={e => handleEdit({...editingPost, content: e.target.value})} className="w-full bg-[#1a1a1a] rounded p-2" ></textarea>
                </div>
                <div className="flex gap-4 mt-4">
                    <button onClick={() => handleSave(editingPost)} className="bg-[#E6D5B8] text-[#1a1a1a] font-bold py-2 px-4 rounded-md">Save Post</button>
                    <button onClick={() => setEditingPost(null)} className="bg-gray-500 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#262626] p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-display">Blog Posts</h4>
                <button onClick={() => handleEdit({})} className="bg-[#E6D5B8] text-[#1a1a1a] font-bold py-2 px-4 rounded-md">Create New</button>
            </div>
            <ul className="space-y-2">
                {blogPosts.map(post => (
                    <li key={post.id} className="flex justify-between items-center p-2 bg-[#1a1a1a] rounded">
                        <span>{post.title}</span>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(post)} className="text-sm text-blue-400 hover:underline">Edit</button>
                            <button onClick={() => window.confirm('Are you sure?') && deleteBlogPost(post.id)} className="text-sm text-red-400 hover:underline">Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
const Footer = ({ navigate }) => (
    // ... (This component remains unchanged)
  <footer className="bg-[#111] text-white/50 py-12">
    <div className="container mx-auto px-6 text-center">
      <div className="flex justify-center mb-4"><Logo /></div>
      <div className="flex justify-center gap-6 my-4">
        <button onClick={() => navigate('home')} className="hover:text-white">Home</button>
        <button onClick={() => navigate('blog')} className="hover:text-white">Blog</button>
        <button onClick={() => navigate('portfolio')} className="hover:text-white">Portfolio</button>
      </div>
      <p className="text-sm">&copy; {new Date().getFullYear()} Studio37. All Rights Reserved.</p>
      <button onClick={() => navigate('adminLogin')} className="text-xs mt-4">Admin Access</button>
    </div>
  </footer>
);
