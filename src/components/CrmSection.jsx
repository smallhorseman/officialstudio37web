import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const CrmSection = ({ leads, updateLeadStatus }) => {
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [leadNotes, setLeadNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState({ 
    note: '', 
    follow_up_date: '', 
    priority: 'normal', 
    note_type: 'manual' 
  });

  const fetchLeadNotes = async (leadId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setLeadNotes(data);
      } else {
        setLeadNotes([]);
        if (error) console.error('Error fetching notes:', error);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      setLeadNotes([]);
    }
    setLoading(false);
  };

  const addNote = async () => {
    const sanitizedNote = newNote.note.replace(/<[^>]*>/g, '').trim();
    if (!sanitizedNote || !selectedLead) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('lead_notes').insert([{
        lead_id: selectedLead.id,
        note: sanitizedNote,
        note_type: newNote.note_type,
        priority: newNote.priority,
        follow_up_date: newNote.follow_up_date || null,
        status: 'Active'
      }]);
      
      if (error) {
        console.error('Note creation error:', error);
        alert('Failed to add note. Please try again.');
      } else {
        setNewNote({ note: '', follow_up_date: '', priority: 'normal', note_type: 'manual' });
        await fetchLeadNotes(selectedLead.id);
      }
    } catch (err) {
      console.error('Error adding note:', err);
      alert('Failed to add note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openLeadDetails = (lead) => {
    setSelectedLead(lead);
    setShowLeadDetails(true);
    fetchLeadNotes(lead.id);
  };

  if (!leads || leads.length === 0) {
    return (
      <div className="text-center text-[#F3E3C3]/70 py-8">
        <p>No leads found.</p>
        <p className="text-sm mt-2">Leads will appear here when customers submit contact forms.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="min-w-full divide-y divide-[#F3E3C3]/10">
          <thead className="bg-[#181818]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#F3E3C3]">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#F3E3C3]">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#F3E3C3]">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#F3E3C3]">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#F3E3C3]">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#F3E3C3]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3E3C3]/10">
            {leads.map(lead => (
              <tr key={lead.id} className="hover:bg-[#333] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#F3E3C3]">{lead.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#F3E3C3]/70">{lead.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#F3E3C3]/70">{lead.phone || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#F3E3C3]/70">{lead.service || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#F3E3C3]">{lead.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => updateLeadStatus(lead.id, lead.status === 'Completed' ? 'New' : 'Completed')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all mr-2 ${
                      lead.status === 'Completed' 
                        ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {lead status === 'Completed' ? 'Reopen' : 'Complete'}
                  </button>
                  <button
                    onClick={() => openLeadDetails(lead)}
                    className="px-3 py-1 bg-[#F3E3C3] text-[#1a1a1a] rounded-full text-xs font-semibold transition-transform hover:scale-105"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lead Details Modal */}
      {showLeadDetails && selectedLead && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#232323] rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h3 className="text-lg font-display">Lead Details: {selectedLead.name}</h3>
              <button 
                onClick={() => setShowLeadDetails(false)} 
                className="text-white text-xl hover:text-red-400 transition-colors"
              >
                &times;
              </button>
            </div>
            
            <div className="flex h-[calc(90vh-80px)]">
              <div className="w-1/3 p-6 border-r border-white/10 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[#F3E3C3]/60 uppercase font-semibold">Name</label>
                    <div className="text-[#F3E3C3]">{selectedLead.name}</div>
                  </div>
                  <div>
                    <label className="text-xs text-[#F3E3C3]/60 uppercase font-semibold">Email</label>
                    <div className="text-[#F3E3C3]">{selectedLead.email}</div>
                  </div>
                  <div>
                    <label className="text-xs text-[#F3E3C3]/60 uppercase font-semibold">Phone</label>
                    <div className="text-[#F3E3C3]">{selectedLead.phone || 'Not provided'}</div>
                  </div>
                  <div>
                    <label className="text-xs text-[#F3E3C3]/60 uppercase font-semibold">Service</label>
                    <div className="text-[#F3E3C3]">{selectedLead.service || 'Not specified'}</div>
                  </div>
                  <div>
                    <label className="text-xs text-[#F3E3C3]/60 uppercase font-semibold">Status</label>
                    <div className="text-[#F3E3C3]">{selectedLead.status}</div>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="p-6 border-b border-white/10">
                  <h4 className="font-semibold text-[#F3E3C3] mb-4">Notes</h4>
                  <div className="bg-[#181818] rounded-lg p-4 mb-4">
                    <textarea
                      value={newNote.note}
                      onChange={(e) => setNewNote({...newNote, note: e.target.value})}
                      placeholder="Add a note..."
                      className="w-full bg-transparent border-none resize-none focus:outline-none text-[#F3E3C3] text-sm placeholder-[#F3E3C3]/50"
                      rows="3"
                    />
                    <div className="flex gap-2 mt-2">
                      <select
                        value={newNote.note_type}
                        onChange={(e) => setNewNote({...newNote, note_type: e.target.value})}
                        className="bg-[#262626] border border-white/20 rounded px-2 py-1 text-xs text-[#F3E3C3]"
                      >
                        <option value="manual">Manual</option>
                        <option value="call">Call Note</option>
                        <option value="email">Email Note</option>
                        <option value="meeting">Meeting</option>
                      </select>
                      
                      <select
                        value={newNote.priority}
                        onChange={(e) => setNewNote({...newNote, priority: e.target.value})}
                        className="bg-[#262626] border border-white/20 rounded px-2 py-1 text-xs text-[#F3E3C3]"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                      </select>
                      
                      <button
                        onClick={addNote}
                        disabled={!newNote.note.trim() || loading}
                        className="bg-[#F3E3C3] text-[#1a1a1a] rounded px-3 py-1 text-xs font-semibold disabled:opacity-50"
                      >
                        {loading ? 'Adding...' : 'Add Note'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {loading && leadNotes.length === 0 && (
                    <div className="text-center text-[#F3E3C3]/70 py-4">Loading notes...</div>
                  )}
                  
                  {!loading && leadNotes.length === 0 && (
                    <div className="text-[#F3E3C3]/70 py-4 text-center text-sm">
                      No notes found. Add the first note above.
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {leadNotes.map(note => (
                      <div key={note.id} className="bg-[#181818] rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs text-[#F3E3C3]/60 uppercase font-medium">
                            {note.note_type || 'manual'}
                          </span>
                          {note.priority !== 'normal' && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              note.priority === 'high' ? 'bg-red-500 text-white' :
                              'bg-yellow-500 text-black'
                            }`}>
                              {note.priority}
                            </span>
                          )}
                        </div>
                        <div className="text-[#F3E3C3] text-sm mb-2">{note.note}</div>
                        <div className="text-xs text-[#F3E3C3]/40">
                          {new Date(note.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
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

export default CrmSection;
