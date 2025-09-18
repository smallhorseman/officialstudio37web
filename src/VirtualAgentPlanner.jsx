import React, { useState } from 'react';

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

  const handleSend = async (e) => {
    e.preventDefault();
    if (step === 0 && input.toLowerCase().includes('no')) {
      setMessages(msgs => [...msgs, { from: 'user', text: input }, { from: 'bot', text: 'No problem! If you change your mind, just click the chat again.' }]);
      setInput('');
      setDone(true);
      return;
    }
    setMessages(msgs => [...msgs, { from: 'user', text: input }]);
    const key = steps[step].key;
    setAnswers(a => ({ ...a, [key]: input }));
    setInput('');
    if (step < steps.length - 1) {
      setTimeout(() => {
        setMessages(msgs => [...msgs, { from: 'bot', text: steps[step + 1].prompt }]);
        setStep(s => s + 1);
      }, 500);
    } else {
      setSaving(true);
      // Save to Supabase: create lead, project, and note
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        'https://sqfqlnodwjubacmaduzl.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZnFsbm9kd2p1YmFjbWFkdXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzQ2ODUsImV4cCI6MjA3Mzc1MDY4NX0.OtEDSh5UCm8CxWufG_NBLDzgNFI3wnr-oAyaRib_4Mw'
      );
      // 1. Create lead
      const { data: leadData, error: leadError } = await supabase.from('leads').insert([
        {
          name: answers.name,
          email: answers.email,
          phone: answers.phone,
          service: 'Photoshoot',
          status: 'New'
        }
      ]).select();
      let leadId = leadData && leadData[0]?.id;
      // 2. Create project (Inquiry status)
      let projectId = null;
      if (leadId) {
        const { data: projData } = await supabase.from('projects').insert([
          {
            lead_id: leadId,
            name: `${answers.name}'s Photoshoot`,
            client: answers.name,
            opportunity_amount: 0,
            stage: 'Inquiry',
            notes: answers.notes
          }
        ]).select();
        projectId = projData && projData[0]?.id;
      }
      // 3. Add AI-generated note to lead_notes
      if (leadId) {
        const noteText = `AI Planner: Date: ${answers.date}; Location: ${answers.location}; Style: ${answers.style}; Inspiration: ${answers.inspiration}; Notes: ${answers.notes}`;
        await supabase.from('lead_notes').insert([
          { lead_id: leadId, note: noteText, status: 'Inquiry' }
        ]);
      }

      setSaving(false);
      setMessages(msgs => [
        ...msgs,
        { from: 'bot', text: "You're all set! We've created your project and will reach out soon. You can continue planning here or close this chat." },
        { from: 'bot', text: "What would you like to do next? (Type: add note, add todo, update info, or 'done' to finish)" }
      ]);
      setDone(false); // allow further interaction
      setStep(steps.length); // move past initial flow
      if (onComplete) onComplete();
    }
  };

  // Handle post-creation actions
  const handlePostCreation = async (e) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    setMessages(msgs => [...msgs, { from: 'user', text: input }]);
    setInput('');
    if (cmd === 'done' || cmd === 'exit' || cmd === 'close') {
      setMessages(msgs => [...msgs, { from: 'bot', text: 'Thank you for planning with Studio37! You can close this chat anytime.' }]);
      setDone(true);
      return;
    }
    if (cmd.includes('note')) {
      setMessages(msgs => [...msgs, { from: 'bot', text: 'Please type your note:' }]);
      setStep('add_note');
      return;
    }
    if (cmd.includes('todo')) {
      setMessages(msgs => [...msgs, { from: 'bot', text: 'Please type your todo/task:' }]);
      setStep('add_todo');
      return;
    }
    if (cmd.includes('update')) {
      setMessages(msgs => [...msgs, { from: 'bot', text: 'What info would you like to update? (name, email, phone, date, location, style, inspiration, notes)' }]);
      setStep('update_field');
      return;
    }
    setMessages(msgs => [...msgs, { from: 'bot', text: "Sorry, I didn't understand. Type: add note, add todo, update info, or 'done'." }]);
  };

  // Add note, todo, or update info
  const [postField, setPostField] = useState('');
  const [leadId, setLeadId] = useState(null);
  const [projectId, setProjectId] = useState(null);

  // Save leadId/projectId after creation
  React.useEffect(() => {
    if (!leadId && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.text.includes("We've created your project")) {
        // Try to fetch latest lead/project for this email
        (async () => {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(
            'https://sqfqlnodwjubacmaduzl.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZnFsbm9kd2p1YmFjbWFkdXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzQ2ODUsImV4cCI6MjA3Mzc1MDY4NX0.OtEDSh5UCm8CxWufG_NBLDzgNFI3wnr-oAyaRib_4Mw'
          );
          const { data: leads } = await supabase.from('leads').select('id').eq('email', answers.email).order('created_at', { ascending: false }).limit(1);
          if (leads && leads[0]) setLeadId(leads[0].id);
          const { data: projects } = await supabase.from('projects').select('id').eq('client', answers.name).order('created_at', { ascending: false }).limit(1);
          if (projects && projects[0]) setProjectId(projects[0].id);
        })();
      }
    }
  }, [messages, answers.email, answers.name, leadId, projectId]);

  // Handle add note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!leadId) {
      setMessages(msgs => [...msgs, { from: 'bot', text: 'Lead not found. Please try again later.' }]);
      setStep(steps.length);
      return;
    }
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      'https://sqfqlnodwjubacmaduzl.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZnFsbm9kd2p1YmFjbWFkdXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzQ2ODUsImV4cCI6MjA3Mzc1MDY4NX0.OtEDSh5UCm8CxWufG_NBLDzgNFI3wnr-oAyaRib_4Mw'
    );
    await supabase.from('lead_notes').insert([{ lead_id: leadId, note: input, status: 'Update' }]);
    setMessages(msgs => [...msgs, { from: 'user', text: input }, { from: 'bot', text: 'Note added! What next? (add note, add todo, update info, done)' }]);
    setInput('');
    setStep(steps.length);
  };

  // Handle add todo (project_todos)
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!projectId) {
      setMessages(msgs => [...msgs, { from: 'bot', text: 'Project not found. Please try again later.' }]);
      setStep(steps.length);
      return;
    }
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      'https://sqfqlnodwjubacmaduzl.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZnFsbm9kd2p1YmFjbWFkdXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzQ2ODUsImV4cCI6MjA3Mzc1MDY4NX0.OtEDSh5UCm8CxWufG_NBLDzgNFI3wnr-oAyaRib_4Mw'
    );
    await supabase.from('project_todos').insert([{ project_id: projectId, task: input }]);
    setMessages(msgs => [...msgs, { from: 'user', text: input }, { from: 'bot', text: 'Todo added! What next? (add note, add todo, update info, done)' }]);
    setInput('');
    setStep(steps.length);
  };

  // Handle update info
  const handleUpdateField = async (e) => {
    e.preventDefault();
    const field = input.trim().toLowerCase();
    setPostField(field);
    setMessages(msgs => [...msgs, { from: 'user', text: input }, { from: 'bot', text: `What is the new value for ${field}?` }]);
    setInput('');
    setStep('update_value');
  };

  const handleUpdateValue = async (e) => {
    e.preventDefault();
    if (!leadId) {
      setMessages(msgs => [...msgs, { from: 'bot', text: 'Lead not found. Please try again later.' }]);
      setStep(steps.length);
      return;
    }
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      'https://sqfqlnodwjubacmaduzl.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZnFsbm9kd2p1YmFjbWFkdXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzQ2ODUsImV4cCI6MjA3Mzc1MDY4NX0.OtEDSh5UCm8CxWufG_NBLDzgNFI3wnr-oAyaRib_4Mw'
    );
    await supabase.from('leads').update({ [postField]: input }).eq('id', leadId);
    setMessages(msgs => [...msgs, { from: 'user', text: input }, { from: 'bot', text: `${postField} updated! What next? (add note, add todo, update info, done)` }]);
    setInput('');
    setStep(steps.length);
  };

  let formHandler = handleSend;
  if (step === steps.length) formHandler = handlePostCreation;
  if (step === 'add_note') formHandler = handleAddNote;
  if (step === 'add_todo') formHandler = handleAddTodo;
  if (step === 'update_field') formHandler = handleUpdateField;
  if (step === 'update_value') formHandler = handleUpdateValue;

  return (
    <div className="flex flex-col h-[60vh] md:h-[70vh]">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={`max-w-[80%] ${msg.from === 'bot' ? 'ml-0 mr-auto bg-[#262626] text-[#E6D5B8]' : 'ml-auto mr-0 bg-[#E6D5B8] text-[#1a1a1a]'} rounded-lg px-4 py-2 shadow`}>{msg.text}</div>
        ))}
      </div>
      {!done && (
        <form onSubmit={formHandler} className="flex gap-2 p-4 border-t border-white/10">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3"
            placeholder="Type your answer..."
            autoFocus
            disabled={saving}
          />
          <button type="submit" className="bg-[#E6D5B8] text-[#1a1a1a] font-bold py-2 px-4 rounded-md" disabled={saving || !input}>Send</button>
        </form>
      )}
      {saving && <div className="text-center text-[#E6D5B8] py-2">Saving your info...</div>}
    </div>
  );
}
