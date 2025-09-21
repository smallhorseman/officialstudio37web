import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const SmsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

export function EnhancedCrmSection({ leads, updateLeadStatus }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [leadNotes, setLeadNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState('');

  const fetchLeadNotes = async (leadId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      
      if (!error) setLeadNotes(data || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
    setLoading(false);
  };

  const addNote = async () => {
    if (!newNote.trim() || !selectedLead) return;
    
    try {
      await supabase.from('lead_notes').insert([{
        lead_id: selectedLead.id,
        note: newNote,
        note_type: 'manual',
        status: 'Active'
      }]);
      
      setNewNote('');
      await fetchLeadNotes(selectedLead.id);
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  const openLeadDetails = (lead) => {
    setSelectedLead(lead);
    setShowLeadDetails(true);
    fetchLeadNotes(lead.id);
  };

  if (!leads || leads.length === 0) {
    return <div className="text-[#F3E3C3]/70 py-8">No leads found.</div>;
  }

  return (
    <div>
      {/* Leads Table */}
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#F3E3C3]">{lead.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#F3E3C3]/70">{lead.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#F3E3C3]/70">{lead.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#F3E3C3]/70">{lead.service}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-[#F3E3C3]">{lead.status}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => updateLeadStatus(lead.id, lead.status === 'Archived' ? 'New' : 'Archived')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${lead.status === 'Archived' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                  >
                    {lead.status === 'Archived' ? 'Restore' : 'Archive'}
                  </button>
                  <button
                    onClick={() => openLeadDetails(lead)}
                    className="ml-2 px-3 py-1 bg-[#F3E3C3] text-[#1a1a1a] rounded-full text-xs font-semibold transition-transform hover:scale-105"
                  >
                    View
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
          <div className="bg-[#232323] rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h3 className="text-lg font-display">Lead Details: {selectedLead.name}</h3>
              <button 
                onClick={() => setShowLeadDetails(false)} 
                className="text-white text-xl hover:text-red-400"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-[#F3E3C3] mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-[#F3E3C3]/60">Email:</span> {selectedLead.email}</div>
                    <div><span className="text-[#F3E3C3]/60">Phone:</span> {selectedLead.phone}</div>
                    <div><span className="text-[#F3E3C3]/60">Service:</span> {selectedLead.service}</div>
                    <div><span className="text-[#F3E3C3]/60">Status:</span> {selectedLead.status}</div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-[#F3E3C3] mb-3">Quick Actions</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(`tel:${selectedLead.phone?.replace(/\D/g, '')}`)}
                        className="flex items-center gap-1 bg-green-500 text-white rounded px-3 py-1 text-xs"
                      >
                        <PhoneIcon /> Call
                      </button>
                      <button
                        onClick={() => window.open(`sms:${selectedLead.phone?.replace(/\D/g, '')}`)}
                        className="flex items-center gap-1 bg-blue-500 text-white rounded px-3 py-1 text-xs"
                      >
                        <SmsIcon /> Text
                      </button>
                      <button
                        onClick={() => window.open(`mailto:${selectedLead.email}`)}
                        className="flex items-center gap-1 bg-red-500 text-white rounded px-3 py-1 text-xs"
                      >
                        <MailIcon /> Email
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#F3E3C3] mb-3">Notes</h4>
                  
                  <div className="mb-3">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note..."
                      className="w-full bg-[#181818] border border-white/20 rounded p-2 text-sm"
                      rows="2"
                    />
                    <button
                      onClick={addNote}
                      disabled={!newNote.trim()}
                      className="mt-2 bg-[#F3E3C3] text-[#1a1a1a] rounded px-3 py-1 text-xs font-semibold disabled:opacity-50"
                    >
                      Add Note
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {loading && <div className="text-center text-[#F3E3C3]/70 py-2">Loading notes...</div>}
                    {!loading && leadNotes.length === 0 && (
                      <div className="text-[#F3E3C3]/70 py-2 text-center text-sm">No notes found.</div>
                    )}
                    {leadNotes.map(note => (
                      <div key={note.id} className="bg-[#181818] rounded p-3">
                        <div className="text-xs text-[#F3E3C3]/60 mb-1">
                          {new Date(note.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-[#F3E3C3] text-sm">{note.note}</div>
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
}
                        onClick={() => window.open(`tel:${selectedLead.phone?.replace(/\D/g, '')}`)}
                        className="w-full bg-green-500 text-white rounded-md py-2 px-3 text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        <PhoneIcon /> Call
                      </button>
                      <button
                        onClick={() => window.open(`sms:${selectedLead.phone?.replace(/\D/g, '')}`)}
                        className="w-full bg-blue-500 text-white rounded-md py-2 px-3 text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        <SmsIcon /> Text
                      </button>
                      <button
                        onClick={() => window.open(`mailto:${selectedLead.email}`)}
                        className="w-full bg-red-500 text-white rounded-md py-2 px-3 text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        <MailIcon /> Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="flex-1 flex flex-col">
                <div className="p-6 border-b border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-[#F3E3C3]">Notes & Follow-ups</h4>
                    <select 
                      value={filterNotes} 
                      onChange={(e) => setFilterNotes(e.target.value)}
                      className="bg-[#181818] border border-white/20 rounded px-2 py-1 text-xs"
                    >
                      <option value="all">All Notes</option>
                      <option value="manual">Manual</option>
                      <option value="system">System</option>
                      <option value="follow-up">Follow-ups</option>
                      <option value="high-priority">High Priority</option>
                    </select>
                  </div>

                  {/* Add Note Form */}
                  <div className="bg-[#181818] rounded-lg p-4 mb-4">
                    <textarea
                      value={newNote.note}
                      onChange={(e) => setNewNote({...newNote, note: e.target.value})}
                      placeholder="Add a note..."
                      className="w-full bg-transparent border-none resize-none focus:outline-none text-[#F3E3C3] text-sm"
                      rows="3"
                    />
                    
                    <div className="flex gap-2 mt-3">
                      <select
                        value={newNote.note_type}
                        onChange={(e) => setNewNote({...newNote, note_type: e.target.value})}
                        className="bg-[#262626] border border-white/20 rounded px-2 py-1 text-xs"
                      >
                        <option value="manual">Manual</option>
                        <option value="call">Call Note</option>
                        <option value="email">Email Note</option>
                        <option value="meeting">Meeting</option>
                      </select>
                      
                      <select
                        value={newNote.priority}
                        onChange={(e) => setNewNote({...newNote, priority: e.target.value})}
                        className="bg-[#262626] border border-white/20 rounded px-2 py-1 text-xs"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      
                      <input
                        type="datetime-local"
                        value={newNote.follow_up_date}
                        onChange={(e) => setNewNote({...newNote, follow_up_date: e.target.value})}
                        className="bg-[#262626] border border-white/20 rounded px-2 py-1 text-xs"
                        placeholder="Follow-up date"
                      />
                      
                      <button
                        onClick={addNote}
                        disabled={!newNote.note.trim()}
                        className="bg-[#F3E3C3] text-[#1a1a1a] rounded px-3 py-1 text-xs font-semibold disabled:opacity-50"
                      >
                        Add Note
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes List */}
                <div className="flex-1 overflow-y-auto p-6">
                  {loading && <div className="text-center text-[#F3E3C3]/70 py-4">Loading notes...</div>}
                  
                  {!loading && filteredNotes.length === 0 && (
                    <div className="text-[#F3E3C3]/70 py-4 text-center">No notes found.</div>
                  )}
                  
                  <div className="space-y-3">
                    {filteredNotes.map(note => (
                      <div key={note.id} className="bg-[#181818] rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${getPriorityColor(note.priority)}`}></span>
                            <span className="text-xs text-[#F3E3C3]/60 uppercase">{note.note_type}</span>
                            {note.follow_up_date && (
                              <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded">
                                Follow-up: {new Date(note.follow_up_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => deleteNote(note.id)}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Delete
                            </button>
                          </div>
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
}
