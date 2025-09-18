import React, { useState, useEffect } from 'react';

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

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
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
  const [currentPost, setCurrentPost] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPortfolioUnlocked, setIsPortfolioUnlocked] = useState(false);
  
  // --- CRM & CMS State (Simulated Backend) --- //
  const [leads, setLeads] = useState([
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', phone: '555-123-4567', service: 'Wedding', status: 'Contacted' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', phone: '555-987-6543', service: 'Director Package', status: 'New' },
    { id: 3, name: 'Sam Wilson', email: 'sam.wilson@example.com', phone: '', service: 'Real Estate', status: 'Booked' },
  ]);

  const [siteContent, setSiteContent] = useState({
    about: {
      title: "Houston's Visionaries in Content & Photography",
      bio: "Studio37 is the creative partnership of Christian and Caittie, a fiancé duo with a shared passion for storytelling. With a combined 20 years in photography and videography, 14 years in sales and marketing, and a lifetime of entrepreneurial spirit, we bring a unique blend of artistry and strategy to every project. We're not just creating content; we're building brands and capturing memories with a style inspired by cinema, classic Hollywood, and the vibrant culture of Houston, Texas."
    },
    portfolioImages: [
        { id: 1, category: 'Portrait', url: 'https://placehold.co/600x800/262626/E6D5B8?text=Portrait+1' },
        { id: 2, category: 'Event', url: 'https://placehold.co/800x600/262626/E6D5B8?text=Event+1' },
    ],
    blogPosts: [
        {
            id: 1,
            slug: 'welcome-to-the-new-studio37-blog',
            title: 'Welcome to the New Studio37 Blog!',
            author: 'Christian & Caittie',
            date: 'September 18, 2025',
            excerpt: 'We are thrilled to launch our new blog! This is a space where we will share insights, behind-the-scenes stories, photography tips, and much more...',
            content: `We are thrilled to launch our new blog! This is a space where we will share insights, behind-the-scenes stories, photography tips, and much more.
            
Our journey as Studio37 has been incredible, and we wanted to create a platform to connect with our clients and community on a deeper level. Expect to see posts about our latest projects, our creative process, and the things that inspire us every day.

Thank you for being a part of our story. We can't wait to share more with you.`
        },
        {
            id: 2,
            slug: '5-tips-for-stunning-portraits',
            title: '5 Tips for Stunning Portraits in the Houston Heat',
            author: 'Caittie',
            date: 'September 15, 2025',
            excerpt: 'Taking portraits in Houston comes with its own unique challenge: the heat! Here are our top 5 tips for getting amazing shots without melting.',
            content: `Taking portraits in Houston comes with its own unique challenge: the heat! Here are our top 5 tips for getting amazing shots without melting.

1.  **Golden Hour is Your Best Friend:** Schedule shoots for early morning or late afternoon to avoid the harshest sunlight and temperatures. The light is softer and more flattering too!
2.  **Find Shade:** Open shade from buildings, trees, or underpasses can provide beautiful, diffused light and relief from the sun.
3.  **Stay Hydrated:** This is for both the photographer and the subject! Bring plenty of water. A happy, hydrated client is a photogenic client.
4.  **Embrace the Indoors:** Houston has countless beautiful indoor locations, from cafes to museums. Don't be afraid to find an air-conditioned spot.
5.  **Work Quickly & Efficiently:** Plan your shots in advance. Knowing what you want to capture helps keep the session moving and minimizes time in the heat.`
        }
    ]
  });

  const handleNav = (page) => {
    setCurrentPage(page);
    setCurrentPost(null); // Clear selected post when navigating to a main page
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const viewPost = (post) => {
    setCurrentPost(post);
    setCurrentPage('blogPost');
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };
  
  const addLead = (lead) => {
      const newLead = { ...lead, id: leads.length + 1, status: 'New' };
      setLeads(prevLeads => [...prevLeads, newLead]);
      setIsPortfolioUnlocked(true);
  };
  
  const updateLeadStatus = (id, status) => {
      setLeads(leads.map(lead => lead.id === id ? { ...lead, status } : lead));
  };

  const updateSiteContent = (section, key, value) => {
      setSiteContent(prev => ({
          ...prev,
          [section]: {
              ...prev[section],
              [key]: value
          }
      }));
  };
  
  const addPortfolioImage = (newImage) => {
    const image = { ...newImage, id: siteContent.portfolioImages.length + 1 };
    setSiteContent(prev => ({ ...prev, portfolioImages: [...prev.portfolioImages, image] }));
  };

  const deletePortfolioImage = (id) => {
    setSiteContent(prev => ({ ...prev, portfolioImages: prev.portfolioImages.filter(img => img.id !== id) }));
  };
  
  const saveBlogPost = (postToSave) => {
      setSiteContent(prev => {
          const existingPost = prev.blogPosts.find(p => p.id === postToSave.id);
          let updatedPosts;
          if (existingPost) {
              // Update existing post
              updatedPosts = prev.blogPosts.map(p => p.id === postToSave.id ? postToSave : p);
          } else {
              // Add new post
              updatedPosts = [...prev.blogPosts, postToSave];
          }
          return { ...prev, blogPosts: updatedPosts };
      });
  };

  const deleteBlogPost = (id) => {
      setSiteContent(prev => ({...prev, blogPosts: prev.blogPosts.filter(p => p.id !== id) }));
  };


  const PageContent = () => {
    switch(currentPage) {
      case 'home': return <HomePage navigate={handleNav} />;
      case 'about': return <AboutPage content={siteContent.about} />;
      case 'services': return <ServicesPage />;
      case 'blog': return <BlogListPage posts={siteContent.blogPosts} viewPost={viewPost} />;
      case 'blogPost': return <BlogPostPage post={currentPost} navigate={handleNav} />;
      case 'portfolio': return <PortfolioPage isUnlocked={isPortfolioUnlocked} onUnlock={addLead} images={siteContent.portfolioImages} />;
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
                                                  blogPosts={siteContent.blogPosts}
                                                  saveBlogPost={saveBlogPost}
                                                  deleteBlogPost={deleteBlogPost}
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
                        <p className="text-sm text-[#E6D5B8]/50 mb-4">By {post.author} on {post.date}</p>
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
                    <p className="text-md text-[#E6D5B8]/60 mb-8">By {post.author} on {post.date}</p>
                    <div className="text-lg text-[#E6D5B8]/80 leading-relaxed prose-styles">
                        {post.content}
                    </div>
                </article>
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
    <div className="py-20 md:py-28 bg-[#212121]">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-display">Get In Touch</h2>
        </div>
    </div>
);

const AdminLoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'studio37admin') onLogin();
  };
  return (
    <div className="py-20 md:py-32 flex justify-center">
      <div className="bg-[#262626] p-8 max-w-md w-full">
        <h2 className="text-3xl font-display text-center mb-8">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required className="w-full bg-[#1a1a1a] rounded py-3 px-4" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full bg-[#1a1a1a] rounded py-3 px-4" />
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
    return (
        <div className="py-20 md:py-28">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl md:text-5xl font-display mb-10">Admin Dashboard</h2>
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

const CrmSection = ({ leads, updateLeadStatus }) => (
    <div>
        <h3 className="text-2xl font-display mb-6">Client Leads ({leads.length})</h3>
        <div className="bg-[#262626] rounded-lg overflow-x-auto">
            <table className="w-full text-left">
                {/* table content */}
            </table>
        </div>
    </div>
);

const CmsSection = (props) => {
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

const CmsAboutEditor = ({ aboutContent, updateContent }) => (
    <div className="bg-[#262626] p-6 rounded-lg mb-8">
        <h4 className="text-xl font-display mb-4">About Page Content</h4>
        <div className="space-y-4">
            <input type="text" value={aboutContent.title} onChange={e => updateContent('about', 'title', e.target.value)} className="w-full bg-[#1a1a1a] rounded p-2" />
            <textarea rows="5" value={aboutContent.bio} onChange={e => updateContent('about', 'bio', e.target.value)} className="w-full bg-[#1a1a1a] rounded p-2"></textarea>
        </div>
    </div>
);

const CmsPortfolioEditor = ({ portfolioImages, addPortfolioImage, deletePortfolioImage }) => {
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
                <button type="submit" className="bg-[#E6D5B8] text-[#1a1a1a] font-bold py-2 px-4 rounded-md">Add</button>
            </form>
            <div className="grid grid-cols-3 gap-4">
                {portfolioImages.map(img => (
                    <div key={img.id} className="relative group">
                        <img src={img.url} className="rounded-md" alt="Portfolio item" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <button onClick={() => deletePortfolioImage(img.id)} className="bg-red-500 text-white rounded-full p-2"><TrashIcon /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CmsBlogEditor = ({ blogPosts, saveBlogPost, deleteBlogPost }) => {
    const [editingPost, setEditingPost] = useState(null);

    const handleEdit = (post) => {
        setEditingPost(post ? {...post} : null);
    };
    
    const handleSave = (postToSave) => {
        // Simple slug generation
        const slug = postToSave.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        const finalPost = {
            ...postToSave,
            slug,
            id: postToSave.id || Date.now(), // Assign new ID if it's a new post
            author: 'Studio37', // Or get from logged in user
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
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

