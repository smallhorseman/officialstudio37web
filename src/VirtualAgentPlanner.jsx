import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';

const steps = [
  { key: 'greet', prompt: "Hi! I'm your Studio37 virtual agent. Would you like to plan your photoshoot?", type: 'greet' },
  { key: 'name', prompt: 'Great! What is your name?', type: 'input' },
  { key: 'email', prompt: 'What is your email address?', type: 'input' },
  { key: 'phone', prompt: 'Phone number (optional):', type: 'input' },
  { key: 'date', prompt: 'What date are you considering for your photoshoot?', type: 'input' },
  { key: 'location', prompt: 'Preferred location or type of setting?', type: 'input' },
  { key: 'style', prompt: 'What style or vibe are you hoping for? (e.g. vintage, modern, candid)', type: 'input' },
  { key: 'inspiration', prompt: 'Any inspiration, Pinterest links, or ideas you want to share?', type: 'input' },
  { key: 'notes', prompt: 'Any other notes or special requests?', type: 'input' }
];

export default function VirtualAgentPlanner({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: steps[0].prompt }
  ]);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [leadId, setLeadId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate typing indicator
  const addBotMessage = (text, delay = 800) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(msgs => [...msgs, { from: 'bot', text }]);
    }, delay);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Handle greeting response
    if (step === 0) {
      if (input.toLowerCase().includes('no')) {
        setMessages(msgs => [...msgs, 
          { from: 'user', text: input }, 
          { from: 'bot', text: 'No problem! If you change your mind, just click the chat again. Have a great day! 📸' }
        ]);
        setInput('');
        setDone(true);
        return;
      }
    }

    setMessages(msgs => [...msgs, { from: 'user', text: input }]);
    const key = steps[step].key;
    setAnswers(a => ({ ...a, [key]: input }));
    setInput('');

    if (step < steps.length - 1) {
      addBotMessage(steps[step + 1].prompt);
      setStep(s => s + 1);
    } else {
      // Final step - save to database
      setSaving(true);
      addBotMessage('Perfect! Let me save all your details... 💾', 1000);
      
      try {
        // 1. Create lead
        const leadData = {
          name: answers.name || 'Anonymous',
          email: answers.email,
          phone: answers.phone,
          service: 'AI Photoshoot Planner',
          status: 'New'
        };

        const { data: newLead, error: leadError } = await supabase
          .from('leads')
          .insert([leadData])
          .select()
          .single();

        if (leadError) throw leadError;
        
        const newLeadId = newLead.id;
        setLeadId(newLeadId);

        // 2. Create project
        const projectData = {
          lead_id: newLeadId,
          name: `${answers.name || 'Anonymous'}'s Photoshoot`,
          client_name: answers.name,
          stage: 'Inquiry',
          status: 'Active',
          opportunity_amount: 0,
          notes: `AI Planner Session:\nDate: ${answers.date}\nLocation: ${answers.location}\nStyle: ${answers.style}\nInspiration: ${answers.inspiration}\nNotes: ${answers.notes}`
        };

        const { data: newProject, error: projectError } = await supabase
          .from('projects')
          .insert([projectData])
          .select()
          .single();

        if (projectError) throw projectError;
        
        setProjectId(newProject.id);

        // 3. Add detailed note
        const noteText = `🤖 AI Planner Session:\n📅 Preferred Date: ${answers.date}\n📍 Location: ${answers.location}\n🎨 Style: ${answers.style}\n💡 Inspiration: ${answers.inspiration}\n📝 Additional Notes: ${answers.notes}`;
        
        await supabase.from('lead_notes').insert([{
          lead_id: newLeadId,
          note: noteText,
          note_type: 'system',
          priority: 'normal',
          status: 'AI Planning Session'
        }]);

        setSaving(false);
        
        setTimeout(() => {
          addBotMessage("✨ All set! I've created your project and our team will reach out within 24 hours.", 500);
          setTimeout(() => {
            addBotMessage("You can continue chatting to add notes or update info. What would you like to do? 🤔\n\n• Type 'add note' to add additional details\n• Type 'update info' to change something\n• Type 'done' to finish", 1000);
            setStep(steps.length);
          }, 1500);
        }, 1000);

      } catch (error) {
        console.error('Error saving data:', error);
        setSaving(false);
        addBotMessage("Oops! There was an issue saving your information. Please try again or contact us directly at sales@studio37.cc", 500);
      }

      if (onComplete) onComplete();
    }
  };

  // Handle post-creation commands
  const handlePostCreation = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    setMessages(msgs => [...msgs, { from: 'user', text: input }]);
    setInput('');

    if (cmd === 'done' || cmd === 'exit' || cmd === 'close' || cmd === 'finish') {
      addBotMessage('🙏 Thank you for planning with Studio37! We\'re excited to work with you. You can close this chat anytime.');
      setDone(true);
      return;
    }

    if (cmd.includes('note') && cmd.includes('add')) {
      addBotMessage('📝 Great! Please type your additional note:');
      setStep('add_note');
      return;
    }

    if (cmd.includes('update') && cmd.includes('info')) {
      addBotMessage('🔄 What would you like to update?\n\n• name\n• email\n• phone\n• date\n• location\n• style\n• inspiration\n• notes');
      setStep('update_field');
      return;
    }

    // Handle unknown commands with helpful suggestions
    addBotMessage("🤔 I didn't quite understand that. Here's what you can do:\n\n• 'add note' - Add additional details\n• 'update info' - Change your information\n• 'done' - Finish our chat\n\nWhat would you like to try?");
  };

  // Handle adding notes
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!input.trim() || !leadId) return;

    setMessages(msgs => [...msgs, { from: 'user', text: input }]);
    
    try {
      await supabase.from('lead_notes').insert([{
        lead_id: leadId,
        note: `📝 Client Note: ${input}`,
        note_type: 'manual',
        priority: 'normal',
        status: 'Client Update'
      }]);

      addBotMessage('✅ Note added successfully! Anything else you\'d like to do?\n\n• add note\n• update info\n• done');
    } catch (error) {
      addBotMessage('❌ Sorry, there was an issue adding your note. Please try again.');
    }
    
    setInput('');
    setStep(steps.length);
  };

  // Handle field selection for updates
  const [updateField, setUpdateField] = useState('');

  const handleUpdateField = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const field = input.trim().toLowerCase();
    const validFields = ['name', 'email', 'phone', 'date', 'location', 'style', 'inspiration', 'notes'];
    
    setMessages(msgs => [...msgs, { from: 'user', text: input }]);

    if (validFields.includes(field)) {
      setUpdateField(field);
      addBotMessage(`🔄 What's the new value for ${field}?`);
      setStep('update_value');
    } else {
      addBotMessage('❌ That field isn\'t available to update. Please choose from:\n\n• name\n• email\n• phone\n• date\n• location\n• style\n• inspiration\n• notes');
    }
    
    setInput('');
  };

  // Handle updating field values
  const handleUpdateValue = async (e) => {
    e.preventDefault();
    if (!input.trim() || !leadId) return;

    setMessages(msgs => [...msgs, { from: 'user', text: input }]);
    
    try {
      // Update in leads table for basic fields
      if (['name', 'email', 'phone'].includes(updateField)) {
        await supabase.from('leads').update({ [updateField]: input }).eq('id', leadId);
      }
      
      // Add note for all updates
      await supabase.from('lead_notes').insert([{
        lead_id: leadId,
        note: `🔄 Updated ${updateField}: ${input}`,
        note_type: 'system',
        priority: 'normal',
        status: 'Information Update'
      }]);

      addBotMessage(`✅ Updated ${updateField} successfully! What else would you like to do?\n\n• add note\n• update info\n• done`);
    } catch (error) {
      addBotMessage('❌ Sorry, there was an issue updating that information. Please try again.');
    }
    
    setInput('');
    setStep(steps.length);
    setUpdateField('');
  };

  // Determine which handler to use
  let formHandler = handleSend;
  if (step === steps.length) formHandler = handlePostCreation;
  if (step === 'add_note') formHandler = handleAddNote;
  if (step === 'update_field') formHandler = handleUpdateField;
  if (step === 'update_value') formHandler = handleUpdateValue;

  return (
    <div className="flex flex-col h-[60vh] md:h-[70vh]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'bot' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
              msg.from === 'bot' 
                ? 'bg-[#262626] text-[#E6D5B8] rounded-bl-md' 
                : 'bg-[#E6D5B8] text-[#1a1a1a] rounded-br-md'
            }`}>
              <div className="whitespace-pre-line text-sm leading-relaxed">{msg.text}</div>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#262626] text-[#E6D5B8] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#E6D5B8] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#E6D5B8] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-[#E6D5B8] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!done && (
        <form onSubmit={formHandler} className="flex gap-3 p-4 border-t border-white/10 bg-[#1a1a1a]">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 bg-[#262626] border border-white/20 rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#E6D5B8] text-[#E6D5B8] placeholder-[#E6D5B8]/50"
            placeholder={saving ? "Saving..." : "Type your message..."}
            autoFocus
            disabled={saving || isTyping}
          />
          <button 
            type="submit" 
            className="bg-[#E6D5B8] text-[#1a1a1a] font-bold py-3 px-6 rounded-full hover:bg-[#D4C5A9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
            disabled={saving || !input.trim() || isTyping}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin"></div>
                Saving
              </>
            ) : (
              <>
                Send
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                </svg>
              </>
            )}
          </button>
        </form>
      )}

      {/* Status Messages */}
      {saving && (
        <div className="px-4 py-2 bg-[#262626] text-center text-[#E6D5B8]/70 text-sm">
          Creating your project and saving details...
        </div>
      )}
      
      {done && (
        <div className="px-4 py-2 bg-[#262626] text-center text-green-400 text-sm">
          ✅ Session completed! You can close this chat anytime.
        </div>
      )}
    </div>
  );
}
