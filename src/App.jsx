import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import VirtualAgentPlanner from './VirtualAgentPlanner';
import PhotoshootPlanner from './PhotoshootPlanner';
import ConversationalPlanner from './ConversationalPlanner';
import { supabase, fetchWithErrorHandling, isSupabaseConfigured, testConnection } from './supabaseClient';
import { EnhancedCrmSection } from './components/EnhancedCRM';
import { EnhancedCmsSection } from './components/EnhancedCMS';
import SEOHead from './components/SEOHead';
import HubSpotIntegration, { trackHubSpotEvent, identifyHubSpotVisitor } from './components/HubSpotIntegration';

// Icon Components - Add all missing icons
const Camera = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
    <circle cx="12" cy="13" r="3"></circle>
  </svg>
);

const Menu = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const X = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const Mail = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const Phone = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

// ADD THE MISSING PhoneIcon that's causing the error
const PhoneIcon = ({ className, size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const MailIcon = ({ className, size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const MapPin = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const MapPinIcon = ({ className, size = 20 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const Instagram = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const ArrowRight = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12,5 19,12 12,19"></polyline>
  </svg>
);

const MessageCircle = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

// Project Management Icons
const Calendar = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const CheckCircle = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22,4 12,14.01 9,11.01"></polyline>
  </svg>
);

const Clock = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12,6 12,12 16,14"></polyline>
  </svg>
);

const DollarSign = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const Users = ({ className, size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State management
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [portfolioUnlocked, setPortfolioUnlocked] = useState(false);
  const [showChatWidget, setShowChatWidget] = useState(false);
  const [showPlanner, setShowPlanner] = useState(null);
  
  // Data states
  const [leads, setLeads] = useState([]);
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('checking');
  
  // Loading states
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogError, setBlogError] = useState('');

  // Test Supabase connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus('checking');
      
      if (!isSupabaseConfigured()) {
        setConnectionStatus('unconfigured');
        console.log('Supabase not configured - check environment variables');
        setLoading(false);
        return;
      }
      
      const isConnected = await testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'error');
      
      if (isConnected) {
        loadInitialData();
      } else {
        setLoading(false);
        setError('Database connection failed. Some features may not work properly.');
      }
    };
    
    checkConnection();
  }, []);

  // Fix missing error handling in useEffect hooks
  useEffect(() => {
    if (location.pathname === '/blog' || isAdmin) {
      setBlogLoading(true);
      setBlogError('');
      
      fetchWithErrorHandling(
        supabase
          .from('blog_posts')
          .select('id, title, publish_date, created_at, slug, excerpt, author, content, tags, category')
          .order('publish_date', { ascending: false })
          .limit(10)
      ).then((data) => {
        if (!data || !Array.isArray(data)) {
          setBlogError('No blog posts found.');
          setBlogPosts([]);
        } else {
          setBlogPosts(data);
        }
      }).catch((error) => {
        console.error('Blog posts fetch error:', error);
        setBlogError('Failed to load blog posts.');
        setBlogPosts([]);
      }).finally(() => {
        setBlogLoading(false);
      });
    }
  }, [location.pathname, isAdmin]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load portfolio images
      const portfolioData = await fetchWithErrorHandling(
        supabase
          .from('portfolio_images')
          .select('*')
          .order('order_index', { ascending: true })
      );
      if (portfolioData) setPortfolioImages(portfolioData);

      // Load leads if admin
      if (isAdmin) {
        const leadsData = await fetchWithErrorHandling(
          supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })
        );
        if (leadsData) setLeads(leadsData);
      }
      
      // Load projects for admin dashboard
      const projectsData = await fetchWithErrorHandling(
        supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
      );
      if (projectsData) setProjects(projectsData);
      
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load application data.');
    } finally {
      setLoading(false);
    }
  };

  // Connection status notification component - SINGLE DECLARATION
  const ConnectionStatusNotification = () => {
    if (connectionStatus === 'connected') return null;
    
    const statusConfig = {
      checking: { 
        color: 'bg-blue-500/20 border-blue-500/30 text-blue-200',
        message: '🔄 Connecting to database...'
      },
      unconfigured: { 
        color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-200',
        message: '⚠️ Database not configured. Using offline mode.'
      },
      error: { 
        color: 'bg-red-500/20 border-red-500/30 text-red-200',
        message: '❌ Database connection failed. Limited functionality.'
      }
    };
    
    const config = statusConfig[connectionStatus];
    
    return (
      <div className={`${config.color} border px-4 py-2 text-sm text-center`}>
        <strong>{config.message}</strong>
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
        loadInitialData(); // Reload data with admin access
        navigate('/admin');
        
        // Track admin login
        trackHubSpotEvent('admin_login', {
          timestamp: new Date().toISOString()
        });
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
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
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
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
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

  // Enhanced portfolio unlock with HubSpot tracking
  async function handlePortfolioUnlock(formData) {
    if (connectionStatus !== 'connected') {
      setPortfolioUnlocked(true);
      
      // Track portfolio unlock in HubSpot
      trackHubSpotEvent('portfolio_unlocked', {
        service: formData.service,
        source: 'portfolio_gate'
      });
      
      // Identify the visitor
      identifyHubSpotVisitor(formData.email, {
        firstname: formData.name.split(' ')[0],
        lastname: formData.name.split(' ').slice(1).join(' '),
        phone: formData.phone,
        service_interest: formData.service
      });
      
      return true;
    }
    
    try {
      // Remove 'source' field that's causing database error
      const { error } = await supabase.from('leads').insert([{
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        status: 'New'
        // Removed 'source' field that doesn't exist in schema
      }]);
      
      if (error) {
        console.error('Portfolio unlock error:', error);
        return false;
      }
      
      setPortfolioUnlocked(true);
      trackHubSpotEvent('lead_created', {
        service: formData.service,
        source: 'portfolio_unlock',
        lead_id: `studio37_${Date.now()}`
      });
      
      identifyHubSpotVisitor(formData.email, {
        firstname: formData.name.split(' ')[0],
        lastname: formData.name.split(' ').slice(1).join(' '),
        phone: formData.phone,
        service_interest: formData.service,
        lead_source: 'portfolio_unlock'
      });
      
      return true;
    } catch (err) {
      console.error('Unexpected portfolio unlock error:', err);
      return false;
    }
  }

  // Built-in Project Management Component
  const ProjectManagement = () => {
    const [newProject, setNewProject] = useState({
      title: '',
      client: '',
      description: '',
      status: 'Planning',
      budget: '',
      deadline: '',
      type: 'Photography'
    });

    const projectStatuses = ['Planning', 'In Progress', 'Review', 'Completed', 'On Hold'];
    const projectTypes = ['Photography', 'Video', 'Content Strategy', 'Marketing', 'Design'];

    const handleAddProject = async () => {
      if (!newProject.title || !newProject.client) return;
      
      try {
        const projectData = {
          ...newProject,
          created_at: new Date().toISOString(),
          budget: parseFloat(newProject.budget) || 0
        };
        
        if (connectionStatus === 'connected') {
          const { data, error } = await supabase
            .from('projects')
            .insert([projectData])
            .select();
          
          if (error) throw error;
          if (data && data[0]) {
            setProjects(prev => [data[0], ...prev]);
          }
        } else {
          const mockProject = {
            ...projectData,
            id: Date.now(),
          };
          setProjects(prev => [mockProject, ...prev]);
        }
        
        setNewProject({
          title: '',
          client: '',
          description: '',
          status: 'Planning',
          budget: '',
          deadline: '',
          type: 'Photography'
        });
      } catch (error) {
        console.error('Error adding project:', error);
      }
    };

    return (
      <div className="space-y-6">
        {/* Add Project Form */}
        <div className="bg-[#181818] rounded-lg p-6">
          <h4 className="text-xl font-display mb-4">Add New Project</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Project Title *"
              value={newProject.title}
              onChange={(e) => setNewProject({...newProject, title: e.target.value})}
              className="bg-[#262626] border border-white/20 rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Client Name *"
              value={newProject.client}
              onChange={(e) => setNewProject({...newProject, client: e.target.value})}
              className="bg-[#262626] border border-white/20 rounded px-3 py-2"
            />
            <select
              value={newProject.type}
              onChange={(e) => setNewProject({...newProject, type: e.target.value})}
              className="bg-[#262626] border border-white/20 rounded px-3 py-2"
            >
              {projectTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={newProject.status}
              onChange={(e) => setNewProject({...newProject, status: e.target.value})}
              className="bg-[#262626] border border-white/20 rounded px-3 py-2"
            >
              {projectStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Budget ($)"
              value={newProject.budget}
              onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
              className="bg-[#262626] border border-white/20 rounded px-3 py-2"
            />
            <input
              type="date"
              value={newProject.deadline}
              onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
              className="bg-[#262626] border border-white/20 rounded px-3 py-2"
            />
          </div>
          <textarea
            placeholder="Project Description"
            value={newProject.description}
            onChange={(e) => setNewProject({...newProject, description: e.target.value})}
            className="w-full mt-4 bg-[#262626] border border-white/20 rounded px-3 py-2"
            rows="3"
          />
          <button
            onClick={handleAddProject}
            disabled={!newProject.title || !newProject.client}
            className="mt-4 bg-[#F3E3C3] text-[#1a1a1a] px-4 py-2 rounded font-semibold disabled:opacity-50"
          >
            Add Project
          </button>
        </div>

        {/* Projects List */}
        <div className="grid gap-4">
          {projects.map(project => (
            <div key={project.id} className="bg-[#181818] rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h5 className="text-lg font-semibold text-[#F3E3C3]">{project.title}</h5>
                  <p className="text-[#F3E3C3]/70">Client: {project.client}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    project.status === 'Completed' ? 'bg-green-500 text-white' :
                    project.status === 'In Progress' ? 'bg-blue-500 text-white' :
                    project.status === 'On Hold' ? 'bg-red-500 text-white' :
                    'bg-yellow-500 text-black'
                  }`}>
                    {project.status}
                  </span>
                  {project.budget > 0 && (
                    <p className="text-[#F3E3C3]/70 mt-1">${project.budget.toLocaleString()}</p>
                  )}
                </div>
              </div>
              
              {project.description && (
                <p className="text-[#F3E3C3]/80 mb-4">{project.description}</p>
              )}
              
              <div className="flex justify-between items-center text-sm text-[#F3E3C3]/60">
                <span>Type: {project.type}</span>
                {project.deadline && (
                  <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                )}
                <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          
          {projects.length === 0 && (
            <div className="text-center text-[#F3E3C3]/70 py-8">
              No projects yet. Add your first project above.
            </div>
          )}
        </div>
      </div>
    );
  };

  // Enhanced Admin Dashboard with all built-in tools
  const AdminDashboard = () => {
    useEffect(() => trackPageView('admin'), []);
    const [activeTab, setActiveTab] = useState('crm');
    
    return (
      <div className="pt-20 pb-20 bg-[#212121] min-h-screen">
        <SEOHead 
          title="Admin Dashboard - Studio37"
          description="Studio37 admin dashboard for managing business operations"
        />
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-vintage mb-6">Admin Dashboard</h1>
            <p className="text-xl text-[#F3E3C3]/80">
              Your complete business management suite
            </p>
            <button
              onClick={() => {
                setIsAdmin(false);
                navigate('/');
              }}
              className="mt-4 text-sm text-[#F3E3C3]/60 hover:text-[#F3E3C3] transition-colors"
            >
              Sign Out
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {[
              { id: 'crm', label: 'CRM', icon: Users },
              { id: 'projects', label: 'Projects', icon: Calendar },
              { id: 'cms', label: 'CMS', icon: Camera },
              { id: 'analytics', label: 'Analytics', icon: DollarSign }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
            {activeTab === 'crm' && (
              <div>
                <h3 className="text-2xl font-vintage mb-6 flex items-center gap-2">
                  <Users size={24} />
                  Customer Relationship Management
                </h3>
                <EnhancedCrmSection leads={leads} updateLeadStatus={updateLeadStatus} />
              </div>
            )}

            {activeTab === 'projects' && (
              <div>
                <h3 className="text-2xl font-vintage mb-6 flex items-center gap-2">
                  <Calendar size={24} />
                  Project Management
                </h3>
                <ProjectManagement />
              </div>
            )}
            
            {activeTab === 'cms' && (
              <div>
                <h3 className="text-2xl font-vintage mb-6 flex items-center gap-2">
                  <Camera size={24} />
                  Content Management System
                </h3>
                <EnhancedCmsSection
                  portfolioImages={portfolioImages}
                  addPortfolioImage={addPortfolioImage}
                  deletePortfolioImage={deletePortfolioImage}
                />
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-2xl font-vintage mb-6 flex items-center gap-2">
                  <DollarSign size={24} />
                  Business Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-[#1a1a1a] p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-[#F3E3C3]">Total Leads</h4>
                      <Users className="text-[#F3E3C3]/60" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-[#F3E3C3]">{leads.length}</p>
                    <p className="text-sm text-[#F3E3C3]/60">All time</p>
                  </div>
                  
                  <div className="bg-[#1a1a1a] p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-[#F3E3C3]">Active Projects</h4>
                      <Calendar className="text-[#F3E3C3]/60" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-[#F3E3C3]">
                      {projects.filter(p => p.status === 'In Progress').length}
                    </p>
                    <p className="text-sm text-[#F3E3C3]/60">In progress</p>
                  </div>
                  
                  <div className="bg-[#1a1a1a] p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-[#F3E3C3]">Portfolio Images</h4>
                      <Camera className="text-[#F3E3C3]/60" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-[#F3E3C3]">{portfolioImages.length}</p>
                    <p className="text-sm text-[#F3E3C3]/60">Published</p>
                  </div>
                  
                  <div className="bg-[#1a1a1a] p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-2"></div>
                      <h4 className="text-lg font-semibold text-[#F3E3C3]">Revenue Pipeline</h4>
                      <DollarSign className="text-[#F3E3C3]/60" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-[#F3E3C3]">
                      ${projects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-[#F3E3C3]/60">Total project value</p>
                  </div>
                </div>
                
                {/* Recent Activity */}
                <div className="bg-[#1a1a1a] rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-[#F3E3C3] mb-4">Recent Activity</h4>
                  <div className="space-y-3">
                    {leads.slice(0, 5).map(lead => (
                      <div key={lead.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                        <div>
                          <p className="text-[#F3E3C3]">New lead: {lead.name}</p>
                          <p className="text-[#F3E3C3]/60 text-sm">{lead.email}</p>
                        </div>
                        <span className="text-[#F3E3C3]/60 text-sm">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {leads.length === 0 && (
                      <p className="text-[#F3E3C3]/60 text-center py-4">No recent activity</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- HomePage Component ---
  const HomePage = () => (
    <div>
      <SEOHead />
      <ConnectionStatusNotification />
      <div className="section-padding-lg text-center">
        <h1 className="responsive-heading font-vintage mb-6 animate-fadeInUp">
          Vintage Heart, Modern Vision
        </h1>
        <p className="responsive-subheading text-[#F3E3C3]/80 mb-8 max-w-2xl mx-auto animate-fadeInUp">
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

  // Add missing page components with proper JSX structure
  const ServicesPage = () => {
    useEffect(() => trackPageView('services'), []);
    
    return (
      <div className="py-20 md:py-28">
        <SEOHead 
          title="Professional Photography Services - Studio37 Houston"
          description="Expert photography services in Houston: portraits, weddings, events, commercial photography, and content strategy. Vintage style meets modern vision."
        />
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-vintage mb-6">Our Services</h1>
            <p className="text-xl text-[#F3E3C3]/80 max-w-3xl mx-auto">
              From intimate portraits to grand celebrations, we capture the moments that matter most with our signature vintage heart and modern vision.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Portrait Photography",
                description: "Professional headshots, family portraits, and personal branding sessions that capture your authentic self.",
                features: ["Professional Headshots", "Family Portraits", "Personal Branding", "Studio & Location Options"]
              },
              {
                title: "Wedding Photography",
                description: "Your love story deserves to be told beautifully. We capture every precious moment of your special day.",
                features: ["Full Day Coverage", "Engagement Sessions", "Bridal Portraits", "Online Gallery Delivery"]
              },
              {
                title: "Event Photography",
                description: "Corporate events, celebrations, and special occasions documented with professional expertise.",
                features: ["Corporate Events", "Birthday Parties", "Anniversaries", "Fast Turnaround"]
              },
              {
                title: "Commercial Photography",
                description: "Elevate your brand with stunning product photography and commercial imagery.",
                features: ["Product Photography", "Brand Imagery", "Marketing Materials", "E-commerce Ready"]
              },
              {
                title: "Content Strategy",
                description: "Strategic visual content planning to help your brand conquer the digital world.",
                features: ["Content Planning", "Social Media Strategy", "Brand Development", "Marketing Consultation"]
              },
              {
                title: "Custom Packages",
                description: "Every client is unique. Let's create a custom package that perfectly fits your needs and budget.",
                features: ["Tailored Solutions", "Flexible Pricing", "Multiple Sessions", "Ongoing Support"]
              }
            ].map((service, index) => (
              <div key={index} className="bg-[#262626] rounded-lg p-8 hover:bg-[#333] transition-colors">
                <h3 className="text-2xl font-display mb-4">{service.title}</h3>
                <p className="text-[#F3E3C3]/80 mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-[#F3E3C3] rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link to="/contact" className="btn-primary">
              Get Your Quote Today
            </Link>
          </div>
        </div>
      </div>
    );
  };

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

  const BlogPage = () => {
    useEffect(() => trackPageView('blog'), []);
    
    return (
      <div className="py-20 md:py-28">
        <SEOHead 
          title="Photography Blog - Studio37 Houston"
          description="Photography tips, behind-the-scenes stories, and inspiration from Houston's premier photography studio. Learn about our vintage-modern approach."
        />
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-vintage mb-6">Our Blog</h1>
            <p className="text-xl text-[#F3E3C3]/80 max-w-3xl mx-auto">
              Stories, tips, and inspiration from behind the lens. Dive into our world of vintage heart and modern vision.
            </p>
          </div>

          {blogPosts && blogPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map(post => (
                <article key={post.id} className="bg-[#262626] rounded-lg overflow-hidden hover:bg-[#333] transition-colors">
                  {post.featured_image && (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-display mb-3">
                      <Link to={`/blog/${post.slug}`} className="hover:text-[#F3E3C3]/80 transition-colors">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-[#F3E3C3]/70 mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-[#F3E3C3]/60">
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      <Link to={`/blog/${post.slug}`} className="text-[#F3E3C3] hover:underline">
                        Read More
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center text-[#F3E3C3]/70 py-16">
              <h3 className="text-2xl font-display mb-4">Coming Soon</h3>
              <p>We're preparing amazing content for you. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const AboutPage = () => {
    useEffect(() => trackPageView('about'), []);
    
    return (
      <div className="py-20 md:py-28">
        <SEOHead 
          title="About Studio37 - Professional Photography Houston"
          description="Meet the team behind Studio37, Houston's premier photography studio combining vintage heart with modern vision for unforgettable imagery."
        />
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-vintage mb-6">About Studio37</h1>
              <p className="text-xl text-[#F3E3C3]/80">
                Where vintage heart meets modern vision
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-3xl font-display mb-6">Our Story</h2>
                <div className="space-y-4 text-[#F3E3C3]/80 leading-relaxed">
                  <p>
                    Studio37 was born from a passion for capturing life's most precious moments with a unique blend of timeless elegance and contemporary flair.
                  </p>
                  <p>
                    Based in the vibrant city of Houston, Texas, we specialize in creating stunning visual narratives that tell your story with authenticity and artistry.
                  </p>
                  <p>
                    Our vintage heart embraces the classic beauty of traditional photography, while our modern vision ensures every image resonates with today's aesthetic sensibilities.
                  </p>
                </div>
              </div>
              <div className="bg-[#262626] rounded-lg p-8">
                <h3 className="text-2xl font-display mb-6">Our Approach</h3>
                <ul className="space-y-3">
                  {[
                    "Personalized consultation for every project",
                    "Blend of vintage charm and modern technique",
                    "Professional equipment and editing",
                    "Fast turnaround with high-quality results",
                    "Ongoing support and relationship building"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-[#F3E3C3] rounded-full mr-3"></span>
                      <span className="text-[#F3E3C3]/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-display mb-6">Ready to Work Together?</h2>
              <p className="text-lg text-[#F3E3C3]/80 mb-8">
                Let's create something beautiful together. Reach out and let's discuss your vision.
              </p>
              <Link to="/contact" className="btn-primary">
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ContactPage = () => {
    useEffect(() => trackPageView('contact'), []);
    
    return (
      <div className="py-20 md:py-28">
        <SEOHead 
          title="Contact Studio37 - Houston Photography Services"
          description="Get in touch with Studio37 for professional photography services in Houston. Book your session for portraits, weddings, events, and commercial photography."
        />
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-vintage mb-6">Contact Us</h1>
              <p className="text-xl text-[#F3E3C3]/80">
                Ready to capture your story? Let's connect and discuss your vision.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-display mb-6">Get In Touch</h2>
                <div className="space-y-6">
                  <div className="flex items-center">
                    <PhoneIcon />
                    <div className="ml-4">
                      <p className="font-semibold">Phone</p>
                      <a href="tel:+18327139944" className="text-[#F3E3C3]/80 hover:text-[#F3E3C3] transition-colors">
                        (832) 713-9944
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MailIcon />
                    <div className="ml-4">
                      <p className="font-semibold">Email</p>
                      <a href="mailto:sales@studio37.cc" className="text-[#F3E3C3]/80 hover:text-[#F3E3C3] transition-colors">
                        sales@studio37.cc
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPinIcon />
                    <div className="ml-4">
                      <p className="font-semibold">Location</p>
                      <p className="text-[#F3E3C3]/80">
                        Houston, Texas<br />
                        Serving the Greater Houston Area
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const BlogPost = () => {
    useEffect(() => trackPageView('blog_post'), []);
    
    return (
      <div className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-vintage mb-6">Blog Post</h1>
              <p className="text-xl text-[#F3E3C3]/80">
                Individual blog post content will be loaded here
              </p>
            </div>
            <div className="text-center">
              <Link to="/blog" className="btn-secondary">
                ← Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Simple Portfolio Gate component with proper JSX structure
  const PortfolioGate = ({ onUnlock }) => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      service: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      const success = await onUnlock(formData);
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
            className="w-full bg-[#F3E3C3] text-[#1a1a1a] rounded-md py-3 px-6 font-semibold transition-all hover:bg-[#E6D5B8]"
          >
            Unlock Portfolio
          </button>
        </form>
      </div>
    );
  };

  // Simple Contact Form component with proper JSX structure
  const ContactForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      service: '',
      message: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      trackHubSpotEvent('contact_form_submitted', {
        service: formData.service,
        form_type: 'contact'
      });
      
      alert('Thank you for your message! We\'ll be in touch soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: ''
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Your Name *"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            className="w-full bg-[#262626] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
          />
          <input
            type="email"
            placeholder="Your Email *"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            className="w-full bg-[#262626] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full bg-[#262626] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
          />
          <select
            value={formData.service}
            onChange={(e) => setFormData({...formData, service: e.target.value})}
            className="w-full bg-[#262626] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
          >
            <option value="">Select Service</option>
            <option value="portraits">Portrait Photography</option>
            <option value="weddings">Wedding Photography</option>
            <option value="events">Event Photography</option>
            <option value="commercial">Commercial Photography</option>
            <option value="content">Content Strategy</option>
          </select>
        </div>
        <textarea
          placeholder="Tell us about your project..."
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          rows="6"
          className="w-full bg-[#262626] border border-white/20 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
        />
        <button
          type="submit"
          className="w-full bg-[#F3E3C3] text-[#1a1a1a] rounded-md py-3 px-6 font-semibold transition-all hover:bg-[#E6D5B8]"
        >
          Send Message
        </button>
      </form>
    );
  };

  return (
    <div className="App bg-[#181818] text-[#F3E3C3] min-h-screen">
      {/* Only add HubSpot for the virtual assistant, not to replace existing functionality */}
      <HubSpotIntegration />
      
      {/* Navigation with improved accessibility */}
      <nav className="fixed top-0 w-full z-50 bg-[#181818]/95 backdrop-blur-custom border-b border-white/10" role="navigation" aria-label="Main navigation">
        <div className="container-custom">
          <ConnectionStatusNotification />
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 focus-ring rounded-md">
              <Camera className="h-8 w-8 text-[#F3E3C3]" />
              <span className="text-xl font-vintage">Studio37</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/about" className="nav-link">About</Link>
              <Link to="/services" className="nav-link">Services</Link>
              <Link to="/portfolio" className="nav-link">Portfolio</Link>
              <Link to="/blog" className="nav-link">Blog</Link>
              <Link to="/contact" className="nav-link">Contact</Link>
              {isAdmin && (
                <Link to="/admin/dashboard" className="nav-link text-[#F3E3C3]">Admin</Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden focus-ring p-2"
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col space-y-2">
                <Link to="/" className="nav-link block px-4 py-2" onClick={() => setIsMenuOpen(false)}>Home</Link>
                <Link to="/about" className="nav-link block px-4 py-2" onClick={() => setIsMenuOpen(false)}>About</Link>
                <Link to="/services" className="nav-link block px-4 py-2" onClick={() => setIsMenuOpen(false)}>Services</Link>
                <Link to="/portfolio" className="nav-link block px-4 py-2" onClick={() => setIsMenuOpen(false)}>Portfolio</Link>
                <Link to="/blog" className="nav-link block px-4 py-2" onClick={() => setIsMenuOpen(false)}>Blog</Link>
                <Link to="/contact" className="nav-link block px-4 py-2" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                {isAdmin && (
                  <Link to="/admin/dashboard" className="nav-link block px-4 py-2" onClick={() => setIsMenuOpen(false)}>Admin</Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin-login" element={!isAdmin ? <AdminLogin /> : <Navigate to="/admin" />} />
          <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/admin-login" />} />
        </Routes>
      </main>

      {/* Virtual Assistant Chat Widget (HubSpot integration for questions only) */}
      {showChatWidget && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-[#262626] rounded-lg shadow-lg w-80">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-vintage text-lg">Studio37 Assistant</h3>
              <button 
                onClick={() => setShowChatWidget(false)}
                className="text-white text-xl hover:text-red-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <VirtualAgentPlanner />
          </div>
        </div>
      )}

      {!showChatWidget && (
        <button
          onClick={() => setShowChatWidget(true)}
          className="fixed bottom-6 right-6 bg-[#F3E3C3] text-[#1a1a1a] p-4 rounded-full shadow-lg hover:bg-[#E6D5B8] transition-all hover:scale-110 z-50"
          title="Chat with Studio37 Assistant"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Loading overlay with connection status */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-[#F3E3C3]">
              {connectionStatus === 'checking' ? 'Connecting to Studio37...' : 'Loading Studio37...'}
            </p>
          </div>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="fixed bottom-4 left-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-md">
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => setError('')}
            className="absolute top-1 right-2 text-white hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;