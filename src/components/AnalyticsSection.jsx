import React from 'react';

const AnalyticsSection = ({ leads = [], projects = [], blogPosts = [] }) => {
  const totalRevenue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const activeProjects = projects.filter(p => p.status === 'In Progress').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const newLeads = leads.filter(l => l.status === 'New').length;
  
  const recentLeads = leads
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const projectsByStatus = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {});

  const leadsByService = leads.reduce((acc, lead) => {
    const service = lead.service || 'Unknown';
    acc[service] = (acc[service] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1a1a1a] p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold text-[#F3E3C3]">Total Leads</h4>
            <svg className="text-[#F3E3C3]/60 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-[#F3E3C3]">{leads.length}</p>
          <p className="text-sm text-green-400">+{newLeads} new</p>
        </div>
        
        <div className="bg-[#1a1a1a] p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold text-[#F3E3C3]">Active Projects</h4>
            <svg className="text-[#F3E3C3]/60 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-[#F3E3C3]">{activeProjects}</p>
          <p className="text-sm text-blue-400">{completedProjects} completed</p>
        </div>
        
        <div className="bg-[#1a1a1a] p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold text-[#F3E3C3]">Total Revenue</h4>
            <svg className="text-[#F3E3C3]/60 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-[#F3E3C3]">${totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-[#F3E3C3]/60">Project pipeline</p>
        </div>
        
        <div className="bg-[#1a1a1a] p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold text-[#F3E3C3]">Content Items</h4>
            <svg className="text-[#F3E3C3]/60 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-[#F3E3C3]">{blogPosts.length}</p>
          <p className="text-sm text-[#F3E3C3]/60">Blog posts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-[#1a1a1a] rounded-lg p-6">
          <h4 className="text-lg font-semibold text-[#F3E3C3] mb-4">Recent Leads</h4>
          <div className="space-y-3">
            {recentLeads.map(lead => (
              <div key={lead.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                <div>
                  <p className="text-[#F3E3C3] font-medium">{lead.name}</p>
                  <p className="text-[#F3E3C3]/60 text-sm">{lead.email}</p>
                  <p className="text-[#F3E3C3]/60 text-xs">{lead.service || 'No service specified'}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    lead.status === 'New' ? 'bg-green-500 text-white' :
                    lead.status === 'Completed' ? 'bg-blue-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {lead.status}
                  </span>
                  <p className="text-[#F3E3C3]/60 text-xs mt-1">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {recentLeads.length === 0 && (
              <p className="text-[#F3E3C3]/60 text-center py-4">No leads yet</p>
            )}
          </div>
        </div>

        {/* Project Status Breakdown */}
        <div className="bg-[#1a1a1a] rounded-lg p-6">
          <h4 className="text-lg font-semibold text-[#F3E3C3] mb-4">Project Status</h4>
          <div className="space-y-3">
            {Object.entries(projectsByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-[#F3E3C3]">{status}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-[#262626] rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        status === 'Completed' ? 'bg-green-500' :
                        status === 'In Progress' ? 'bg-blue-500' :
                        status === 'On Hold' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`}
                      style={{ 
                        width: `${projects.length > 0 ? (count / projects.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-[#F3E3C3] text-sm w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
            {Object.keys(projectsByStatus).length === 0 && (
              <p className="text-[#F3E3C3]/60 text-center py-4">No projects yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Service Interest Breakdown */}
      <div className="bg-[#1a1a1a] rounded-lg p-6">
        <h4 className="text-lg font-semibold text-[#F3E3C3] mb-4">Service Interest</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(leadsByService).map(([service, count]) => (
            <div key={service} className="text-center">
              <p className="text-2xl font-bold text-[#F3E3C3]">{count}</p>
              <p className="text-sm text-[#F3E3C3]/70">{service}</p>
            </div>
          ))}
          {Object.keys(leadsByService).length === 0 && (
            <div className="col-span-full text-center text-[#F3E3C3]/60 py-4">
              No service data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;
