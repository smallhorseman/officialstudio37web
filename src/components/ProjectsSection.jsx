import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const ProjectsSection = ({ projects, projectsLoading }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    client_name: '',
    project_type: '',
    status: 'Planning',
    budget: '',
    start_date: '',
    end_date: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const projectTypes = ['Portrait', 'Wedding', 'Event', 'Commercial', 'Content Strategy'];
  const statusOptions = ['Planning', 'In Progress', 'Review', 'Completed', 'On Hold', 'Cancelled'];

  const statusColors = {
    'Planning': 'bg-blue-500',
    'In Progress': 'bg-yellow-500',
    'Review': 'bg-purple-500',
    'Completed': 'bg-green-500',
    'On Hold': 'bg-gray-500',
    'Cancelled': 'bg-red-500'
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...newProject,
          budget: newProject.budget ? parseFloat(newProject.budget) : null
        }])
        .select();

      if (error) throw error;

      // Reset form
      setNewProject({
        title: '',
        description: '',
        client_name: '',
        project_type: '',
        status: 'Planning',
        budget: '',
        start_date: '',
        end_date: ''
      });
      setShowAddForm(false);
      window.location.reload(); // Simple reload to refresh projects
    } catch (error) {
      console.error('Error adding project:', error);
      alert('Failed to add project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateProjectStatus = async (projectId, newStatus) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      if (error) throw error;
      
      window.location.reload(); // Simple reload to refresh projects
    } catch (error) {
      console.error('Error updating project status:', error);
      alert('Failed to update project status.');
    }
  };

  if (projectsLoading) {
    return (
      <div className="text-center text-[#F3E3C3]/70 py-8">
        <div className="w-6 h-6 border-2 border-[#F3E3C3] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        Loading projects...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-display">Projects Overview</h3>
          <p className="text-[#F3E3C3]/70">Manage your photography projects and client work</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-[#F3E3C3] text-[#1a1a1a] px-4 py-2 rounded-md font-semibold hover:bg-[#E6D5B8] transition-colors"
        >
          Add Project
        </button>
      </div>

      {/* Add Project Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#232323] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-display">Add New Project</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-white text-xl hover:text-red-400 transition-colors"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddProject} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#F3E3C3] mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={newProject.title}
                      onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                      required
                      className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-sm text-[#F3E3C3] focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#F3E3C3] mb-2">
                      Client Name
                    </label>
                    <input
                      type="text"
                      value={newProject.client_name}
                      onChange={(e) => setNewProject({...newProject, client_name: e.target.value})}
                      className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-sm text-[#F3E3C3] focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F3E3C3] mb-2">
                    Description
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    rows="3"
                    className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-sm text-[#F3E3C3] focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#F3E3C3] mb-2">
                      Project Type
                    </label>
                    <select
                      value={newProject.project_type}
                      onChange={(e) => setNewProject({...newProject, project_type: e.target.value})}
                      className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-sm text-[#F3E3C3] focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
                    >
                      <option value="">Select Type</option>
                      {projectTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#F3E3C3] mb-2">
                      Status
                    </label>
                    <select
                      value={newProject.status}
                      onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                      className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-sm text-[#F3E3C3] focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#F3E3C3] mb-2">
                      Budget ($)
                    </label>
                    <input
                      type="number"
                      value={newProject.budget}
                      onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                      className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-sm text-[#F3E3C3] focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#F3E3C3] mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newProject.start_date}
                      onChange={(e) => setNewProject({...newProject, start_date: e.target.value})}
                      className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-sm text-[#F3E3C3] focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#F3E3C3] mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={newProject.end_date}
                      onChange={(e) => setNewProject({...newProject, end_date: e.target.value})}
                      className="w-full bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-sm text-[#F3E3C3] focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-[#262626] text-[#F3E3C3] py-2 px-4 rounded-md font-semibold hover:bg-[#333] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !newProject.title}
                    className="flex-1 bg-[#F3E3C3] text-[#1a1a1a] py-2 px-4 rounded-md font-semibold hover:bg-[#E6D5B8] disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Adding...' : 'Add Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="bg-[#181818] rounded-lg p-6 hover:bg-[#222] transition-colors">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-semibold text-[#F3E3C3] truncate">
                  {project.title}
                </h4>
                <span className={`px-2 py-1 rounded text-xs font-medium text-white ${statusColors[project.status] || 'bg-gray-500'}`}>
                  {project.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-[#F3E3C3]/70">
                {project.client_name && (
                  <div>
                    <span className="font-medium">Client:</span> {project.client_name}
                  </div>
                )}
                {project.project_type && (
                  <div>
                    <span className="font-medium">Type:</span> {project.project_type}
                  </div>
                )}
                {project.budget && (
                  <div>
                    <span className="font-medium">Budget:</span> ${project.budget.toLocaleString()}
                  </div>
                )}
                {project.start_date && (
                  <div>
                    <span className="font-medium">Start:</span> {new Date(project.start_date).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setShowProjectDetails(true);
                  }}
                  className="text-[#F3E3C3] hover:text-[#F3E3C3]/80 text-sm font-medium"
                >
                  View Details
                </button>
                
                <select
                  value={project.status}
                  onChange={(e) => updateProjectStatus(project.id, e.target.value)}
                  className="bg-[#262626] border border-white/20 rounded px-2 py-1 text-xs text-[#F3E3C3]"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-[#F3E3C3]/70 py-12">
          <div className="mb-4">
            <svg className="w-12 h-12 mx-auto text-[#F3E3C3]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <p className="text-lg">No projects found</p>
          <p className="text-sm mt-2">Create your first project to get started</p>
        </div>
      )}

      {/* Project Details Modal */}
      {showProjectDetails && selectedProject && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#232323] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-display">{selectedProject.title}</h3>
                <button
                  onClick={() => setShowProjectDetails(false)}
                  className="text-white text-xl hover:text-red-400 transition-colors"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-[#F3E3C3] mb-2">Status</h4>
                  <span className={`px-3 py-1 rounded text-sm font-medium text-white ${statusColors[selectedProject.status] || 'bg-gray-500'}`}>
                    {selectedProject.status}
                  </span>
                </div>

                {selectedProject.description && (
                  <div>
                    <h4 className="font-semibold text-[#F3E3C3] mb-2">Description</h4>
                    <p className="text-[#F3E3C3]/80">{selectedProject.description}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    {selectedProject.client_name && (
                      <div>
                        <h4 className="font-semibold text-[#F3E3C3]">Client</h4>
                        <p className="text-[#F3E3C3]/80">{selectedProject.client_name}</p>
                      </div>
                    )}
                    
                    {selectedProject.project_type && (
                      <div>
                        <h4 className="font-semibold text-[#F3E3C3]">Type</h4>
                        <p className="text-[#F3E3C3]/80">{selectedProject.project_type}</p>
                      </div>
                    )}
                    
                    {selectedProject.budget && (
                      <div>
                        <h4 className="font-semibold text-[#F3E3C3]">Budget</h4>
                        <p className="text-[#F3E3C3]/80">${selectedProject.budget.toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {selectedProject.start_date && (
                      <div>
                        <h4 className="font-semibold text-[#F3E3C3]">Start Date</h4>
                        <p className="text-[#F3E3C3]/80">{new Date(selectedProject.start_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    
                    {selectedProject.end_date && (
                      <div>
                        <h4 className="font-semibold text-[#F3E3C3]">End Date</h4>
                        <p className="text-[#F3E3C3]/80">{new Date(selectedProject.end_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-semibold text-[#F3E3C3]">Created</h4>
                      <p className="text-[#F3E3C3]/80">{new Date(selectedProject.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsSection;
