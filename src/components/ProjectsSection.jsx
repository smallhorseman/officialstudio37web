import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const ProjectsSection = ({ projects = [], projectsLoading = false }) => {
  const [newProject, setNewProject] = useState({
    title: '',
    client: '',
    description: '',
    status: 'Planning',
    budget: '',
    deadline: '',
    type: 'Photography'
  });
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');

  const projectStatuses = ['Planning', 'In Progress', 'Review', 'Completed', 'On Hold'];
  const projectTypes = ['Photography', 'Video', 'Content Strategy', 'Marketing', 'Design'];

  const handleAddProject = async () => {
    if (!newProject.title || !newProject.client) {
      alert('Please fill in title and client name');
      return;
    }
    
    try {
      const projectData = {
        ...newProject,
        budget: parseFloat(newProject.budget) || 0
      };
      
      const { error } = await supabase
        .from('projects')
        .insert([projectData]);
      
      if (error) throw error;
      
      setNewProject({
        title: '',
        client: '',
        description: '',
        status: 'Planning',
        budget: '',
        deadline: '',
        type: 'Photography'
      });
      
      alert('Project added successfully!');
    } catch (error) {
      console.error('Error adding project:', error);
      alert('Failed to add project. Please try again.');
    }
  };

  const updateProjectStatus = async (projectId, newStatus) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.status === filter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'created_at':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'deadline':
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      case 'budget':
        return (b.budget || 0) - (a.budget || 0);
      default:
        return 0;
    }
  });

  if (projectsLoading) {
    return (
      <div className="text-center text-[#F3E3C3]/70 py-8">
        <div className="w-8 h-8 border-2 border-[#F3E3C3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        Loading projects...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center bg-[#181818] rounded-lg p-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-[#262626] border border-white/20 rounded px-3 py-2 text-sm text-[#F3E3C3]"
        >
          <option value="all">All Projects</option>
          {projectStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-[#262626] border border-white/20 rounded px-3 py-2 text-sm text-[#F3E3C3]"
        >
          <option value="created_at">Sort by Date</option>
          <option value="deadline">Sort by Deadline</option>
          <option value="budget">Sort by Budget</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Project Form */}
        <div className="bg-[#181818] rounded-lg p-6">
          <h4 className="text-xl font-display mb-4">Add New Project</h4>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Project Title *"
              value={newProject.title}
              onChange={(e) => setNewProject({...newProject, title: e.target.value})}
              className="w-full bg-[#262626] border border-white/20 rounded px-3 py-2 text-[#F3E3C3]"
            />
            <input
              type="text"
              placeholder="Client Name *"
              value={newProject.client}
              onChange={(e) => setNewProject({...newProject, client: e.target.value})}
              className="w-full bg-[#262626] border border-white/20 rounded px-3 py-2 text-[#F3E3C3]"
            />
            <select
              value={newProject.type}
              onChange={(e) => setNewProject({...newProject, type: e.target.value})}
              className="w-full bg-[#262626] border border-white/20 rounded px-3 py-2 text-[#F3E3C3]"
            >
              {projectTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={newProject.status}
              onChange={(e) => setNewProject({...newProject, status: e.target.value})}
              className="w-full bg-[#262626] border border-white/20 rounded px-3 py-2 text-[#F3E3C3]"
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
              className="w-full bg-[#262626] border border-white/20 rounded px-3 py-2 text-[#F3E3C3]"
            />
            <input
              type="date"
              value={newProject.deadline}
              onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
              className="w-full bg-[#262626] border border-white/20 rounded px-3 py-2 text-[#F3E3C3]"
            />
            <textarea
              placeholder="Project Description"
              value={newProject.description}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              className="w-full bg-[#262626] border border-white/20 rounded px-3 py-2 text-[#F3E3C3]"
              rows="3"
            />
            <button
              onClick={handleAddProject}
              disabled={!newProject.title || !newProject.client}
              className="w-full bg-[#F3E3C3] text-[#1a1a1a] px-4 py-2 rounded font-semibold disabled:opacity-50"
            >
              Add Project
            </button>
          </div>
        </div>

        {/* Projects List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredProjects.map(project => (
            <div key={project.id} className="bg-[#181818] rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h5 className="text-lg font-semibold text-[#F3E3C3]">{project.title}</h5>
                  <p className="text-[#F3E3C3]/70">Client: {project.client}</p>
                </div>
                <div className="text-right">
                  <select
                    value={project.status}
                    onChange={(e) => updateProjectStatus(project.id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.status === 'Completed' ? 'bg-green-500 text-white' :
                      project.status === 'In Progress' ? 'bg-blue-500 text-white' :
                      project.status === 'On Hold' ? 'bg-red-500 text-white' :
                      'bg-yellow-500 text-black'
                    }`}
                  >
                    {projectStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
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
                  <span className={`${
                    new Date(project.deadline) < new Date() ? 'text-red-400' : ''
                  }`}>
                    Due: {new Date(project.deadline).toLocaleDateString()}
                  </span>
                )}
                <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          
          {filteredProjects.length === 0 && (
            <div className="text-center text-[#F3E3C3]/70 py-8">
              {filter === 'all' ? 'No projects yet. Add your first project!' : `No ${filter} projects found.`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsSection;
