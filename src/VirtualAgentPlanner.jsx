import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './supabaseClient';

const VirtualAgentPlanner = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'agent',
      text: "Hi! I'm your Studio37 planning assistant. I'll help you plan the perfect photoshoot. What type of session are you interested in?",
      timestamp: new Date()
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionData, setSessionData] = useState({
    type: '',
    location: '',
    date: '',
    budget: '',
    participants: '',
    style: '',
    email: '',
    phone: ''
  });
  const [currentStep, setCurrentStep] = useState('type');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const steps = {
    type: {
      question: "What type of photoshoot would you like?",
      options: ["Portrait Session", "Wedding", "Event", "Commercial/Branding", "Family Session", "Other"]
    },
    style: {
      question: "What style are you looking for?",
      options: ["Classic & Timeless", "Modern & Clean", "Vintage & Artistic", "Candid & Natural", "Creative & Bold"]
    },
    participants: {
      question: "How many people will be in the shoot?",
      options: ["Just me (1)", "Couple (2)", "Small group (3-5)", "Large group (6+)", "It varies"]
    },
    location: {
      question: "Where would you like the shoot?",
      options: ["Studio", "Outdoor location", "Your venue/home", "Multiple locations", "Not sure yet"]
    },
    budget: {
      question: "What's your approximate budget?",
      options: ["$75-150 (Mini session)", "$300-500 (Standard)", "$750-1200 (Premium)", "$1200+ (Luxury)", "Let's discuss"]
    },
    date: {
      question: "When are you hoping to schedule this?",
      options: ["This week", "Next week", "This month", "Next month", "I'm flexible"]
    },
    contact: {
      question: "Great! Let me get your contact info so we can finalize details.",
      isForm: true
    }
  };

  const addMessage = (text, type = 'agent') => {
    const newMessage = {
      id: Date.now(),
      type,
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleOptionClick = (option) => {
    addMessage(option, 'user');
    setSessionData(prev => ({ ...prev, [currentStep]: option }));
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      moveToNextStep();
    }, 1000);
  };

  const moveToNextStep = () => {
    const stepOrder = ['type', 'style', 'participants', 'location', 'budget', 'date', 'contact'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      setCurrentStep(nextStep);
      
      setTimeout(() => {
        addMessage(steps[nextStep].question);
      }, 500);
    } else {
      // Complete the session
      handleComplete();
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const phone = formData.get('phone');

    if (!email) return;

    setSessionData(prev => ({ ...prev, email, phone }));
    addMessage(`Email: ${email}${phone ? `, Phone: ${phone}` : ''}`, 'user');
    
    setIsTyping(true);
    setTimeout(async () => {
      setIsTyping(false);
      await saveSession({ ...sessionData, email, phone });
      addMessage("Perfect! I've saved all your details. Someone from Studio37 will contact you within 24 hours to finalize your shoot details and schedule. We can't wait to work with you! 📸");
    }, 1000);
  };

  const saveSession = async (data) => {
    try {
      // Save to leads table
      await supabase.from('leads').insert([{
        name: 'Virtual Agent Lead',
        email: data.email,
        phone: data.phone || null,
        service: data.type,
        status: 'New'
      }]);

      // Save session details
      const sessionDetails = `
Virtual Agent Session:
Type: ${data.type}
Style: ${data.style}
Participants: ${data.participants}
Location: ${data.location}
Budget: ${data.budget}
Preferred Date: ${data.date}
      `.trim();

      const { data: leadData } = await supabase
        .from('leads')
        .select('id')
        .eq('email', data.email)
        .order('created_at', { ascending: false })
        .limit(1);

      if (leadData && leadData[0]) {
        await supabase.from('lead_notes').insert([{
          lead_id: leadData[0].id,
          note: sessionDetails,
          note_type: 'virtual_agent',
          priority: 'medium',
          status: 'New Lead'
        }]);
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const handleComplete = () => {
    setCurrentStep('contact');
    setTimeout(() => {
      addMessage(steps.contact.question);
    }, 500);
  };

  return (
    <div className="h-96 flex flex-col bg-[#232323] text-[#F3E3C3]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                message.type === 'user'
                  ? 'bg-[#F3E3C3] text-[#1a1a1a]'
                  : 'bg-[#1a1a1a] text-[#F3E3C3]'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a1a] text-[#F3E3C3] px-4 py-2 rounded-lg text-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[#F3E3C3] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#F3E3C3] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-[#F3E3C3] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Options or Form */}
      <div className="border-t border-white/10 p-4">
        {currentStep !== 'contact' && steps[currentStep] && !steps[currentStep].isForm ? (
          <div className="space-y-2">
            <p className="text-sm text-[#F3E3C3]/70 mb-3">Choose an option:</p>
            <div className="grid grid-cols-1 gap-2">
              {steps[currentStep].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  className="text-left p-2 bg-[#1a1a1a] hover:bg-[#333] rounded text-sm transition-colors border border-white/10"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : currentStep === 'contact' ? (
          <form onSubmit={handleFormSubmit} className="space-y-3">
            <input
              name="email"
              type="email"
              placeholder="Your email address *"
              required
              className="w-full bg-[#1a1a1a] border border-white/20 rounded px-3 py-2 text-sm text-[#F3E3C3] placeholder-[#F3E3C3]/50"
            />
            <input
              name="phone"
              type="tel"
              placeholder="Your phone number (optional)"
              className="w-full bg-[#1a1a1a] border border-white/20 rounded px-3 py-2 text-sm text-[#F3E3C3] placeholder-[#F3E3C3]/50"
            />
            <button
              type="submit"
              className="w-full bg-[#F3E3C3] text-[#1a1a1a] py-2 px-4 rounded font-semibold text-sm hover:bg-[#E6D5B8] transition-colors"
            >
              Complete Planning Session
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
};

export default VirtualAgentPlanner;
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
