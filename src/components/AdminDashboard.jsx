import React, { useState, lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { simpleAuth } from '../utils/simpleAuth';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { supabase } from '../supabaseClient';
import CmsSection from './CmsSection';
import SiteMapTab from './SiteMapTab';

// --- AdminDashboard Component ---
const AdminDashboard = ({ 
  leads = [], 
  portfolioImages = [], 
  projects = [], 
  blogPosts = [],
  onAddPortfolioImage, 
  onDeletePortfolioImage,
  onUpdateLeadStatus,
  onUpdateProject,
  onCreateBlogPost,
  onUpdateBlogPost,
  onDeleteBlogPost
}) => {
  const [activeTab, setActiveTab] = useState('crm');
  const [siteMapPage, setSiteMapPage] = useState('home');

  // Use simpleAuth instead of checking localStorage directly
  const isAuthenticated = simpleAuth.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }

  const handleLogout = () => {
    simpleAuth.logout();
    window.location.href = '/admin/login';
  };

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

// Import other admin components here...
export default AdminDashboard;
