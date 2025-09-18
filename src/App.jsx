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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPortfolioUnlocked, setIsPortfolioUnlocked] = useState(false);
  
  // --- CRM & CMS State (Simulated Backend) --- //
  // In a real app, this data would come from a database like Firestore.
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
        { id: 3, category: 'Professional', url: 'https://placehold.co/800x600/262626/E6D5B8?text=Pro+Headshot' },
        { id: 4, category: 'Wedding', url: 'https://placehold.co/600x800/262626/E6D5B8?text=Wedding' },
        { id: 5, category: 'Portrait', url: 'https://placehold.co/600x800/262626/E6D5B8?text=Portrait+2' },
        { id: 6, category: 'Real Estate', url: 'https://placehold.co/800x600/262626/E6D5B8?text=Real+Estate' },
        { id: 7, category: 'Event', url: 'https://placehold.co/800x600/262626/E6D5B8?text=Event+2' },
        { id: 8, category: 'Nature', url: 'https://placehold.co/600x800/262626/E6D5B8?text=Nature' },
    ]
  });

  const handleNav = (page) => {
    setCurrentPage(page);
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
    setSiteContent(prev => ({
        ...prev,
        portfolioImages: [...prev.portfolioImages, image]
    }));
  };

  const deletePortfolioImage = (id) => {
    setSiteContent(prev => ({
        ...prev,
        portfolioImages: prev.portfolioImages.filter(img => img.id !== id)
    }));
  };

  const PageContent = () => {
    switch(currentPage) {
      case 'home': return <HomePage navigate={handleNav} />;
      case 'about': return <AboutPage content={siteContent.about} />;
      case 'services': return <ServicesPage />;
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
    <div className="absolute inset-0 bg-black opacity-60 z-0"></div>
    <img src="https://res.cloudinary.com/dmjxho2rl/image/upload/a_vflip/l_image:upload:My Brand:IMG_2115_mtuowt/c_scale,fl_relative,w_0.35/o_100/fl_layer_apply,g_north,x_0.03,y_0.04/v1758172510/A4B03835-ED8B-4FBB-A27E-1F2EE6CA1A18_1_105_c_gstgil.jpg"/>
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
                        <img src="https://placehold.co/600x400/333333/555555?text=Map+of+Houston+Area" alt="Map of Houston" className="rounded-lg shadow-lg w-full" />
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

const AdminDashboard = ({ leads, updateLeadStatus, content, updateContent, portfolioImages, addPortfolioImage, deletePortfolioImage }) => {
    const [activeTab, setActiveTab] = useState('crm');
    
    return (
        <div className="py-20 md:py-28">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl md:text-5xl font-display mb-10">Admin Dashboard</h2>
                <div className="flex border-b border-white/20 mb-8">
                    <button onClick={() => setActiveTab('crm')} className={`py-2 px-6 text-lg ${activeTab === 'crm' ? 'text-white border-b-2 border-[#E6D5B8]' : 'text-white/50'}`}>CRM (Leads)</button>
                    <button onClick={() => setActiveTab('cms')} className={`py-2 px-6 text-lg ${activeTab === 'cms' ? 'text-white border-b-2 border-[#E6D5B8]' : 'text-white/50'}`}>CMS (Content)</button>
                </div>

                {activeTab === 'crm' && <CrmSection leads={leads} updateLeadStatus={updateLeadStatus} />}
                {activeTab === 'cms' && <CmsSection 
                                            content={content} 
                                            updateContent={updateContent} 
                                            portfolioImages={portfolioImages}
                                            addPortfolioImage={addPortfolioImage}
                                            deletePortfolioImage={deletePortfolioImage} 
                                        />}
            </div>
        </div>
    );
};

const CrmSection = ({ leads, updateLeadStatus }) => (
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
                    </tr>
                </thead>
                <tbody>
                    {leads.map(lead => (
                        <tr key={lead.id} className="border-b border-white/10 last:border-b-0">
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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const CmsSection = ({ content, updateContent, portfolioImages, addPortfolioImage, deletePortfolioImage }) => {
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
                <form onSubmit={handleAddImage} className="flex gap-4 mb-6">
                    <input type="text" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="Image URL (e.g., from placehold.co)" className="flex-grow bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3" />
                    <select value={newImageCategory} onChange={e => setNewImageCategory(e.target.value)} className="bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3">
                        <option>Portrait</option>
                        <option>Event</option>
                        <option>Professional</option>
                        <option>Wedding</option>
                        <option>Real Estate</option>
                        <option>Nature</option>
                    </select>
                    <button type="submit" className="bg-[#E6D5B8] text-[#1a1a1a] font-bold py-2 px-4 rounded-md">Add Image</button>
                </form>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {portfolioImages.map(img => (
                        <div key={img.id} className="relative group">
                            <img src={img.url} className="rounded-md" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => deletePortfolioImage(img.id)} className="bg-red-500 text-white rounded-full p-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
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
      </div>
      <p className="text-sm">&copy; {new Date().getFullYear()} Studio37 Photography & Content. All Rights Reserved.</p>
      <button onClick={() => navigate('adminLogin')} className="text-xs mt-4 hover:text-white transition">Admin Access</button>
    </div>
  </footer>
);


