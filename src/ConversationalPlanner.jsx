import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './supabaseClient'; // <-- create this shared file

const questions = [
  { key: 'date', prompt: 'What date are you considering for your photoshoot?' },
  { key: 'location', prompt: 'Do you have a preferred location or type of setting?' },
  { key: 'style', prompt: 'What style or vibe are you hoping for? (e.g. vintage, modern, candid)' },
  { key: 'inspiration', prompt: 'Any inspiration, Pinterest links, or ideas you want to share?' },
  { key: 'notes', prompt: 'Any other notes or special requests?' }
];

const ConversationalPlanner = ({ email, onComplete }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Great! Let's plan your perfect photoshoot. What style are you envisioning?", sender: 'bot' }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [sessionData, setSessionData] = useState({ email });
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiPlan, setAiPlan] = useState('');
  const messagesEndRef = useRef(null);

  const quickReplies = [
    "Classic portraits",
    "Modern lifestyle",
    "Vintage aesthetic", 
    "Candid moments",
    "Creative concepts"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const addMessage = (text, sender = 'user') => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSend = () => {
    if (currentMessage.trim()) {
      addMessage(currentMessage);
      setCurrentMessage('');
      
      // Simulate bot response
      setTimeout(() => {
        addMessage("That sounds wonderful! When are you hoping to schedule this session?", 'bot');
      }, 1000);
    }
  };

  const handleQuickReply = (reply) => {
    addMessage(reply);
    
    // Simulate bot response based on selection
    setTimeout(() => {
      if (reply.includes('Classic')) {
        addMessage("Excellent choice! Classic portraits are timeless. Are you looking for indoor studio work or outdoor natural lighting?", 'bot');
      } else if (reply.includes('Modern')) {
        addMessage("Love the modern approach! We can create some stunning contemporary shots. What's your preferred location?", 'bot');
      } else if (reply.includes('Vintage')) {
        addMessage("Perfect! Vintage aesthetics are our specialty at Studio37. Would you like to incorporate specific vintage elements or styling?", 'bot');
      } else {
        addMessage("Great selection! Let's discuss timing and location preferences.", 'bot');
      }
    }, 1000);
  };

  const handleNext = async (e) => {
    e.preventDefault();
    const key = questions[step].key;
    setAnswers(a => ({ ...a, [key]: input }));
    setInput('');
    if (step < questions.length - 1) {
      setStep(s => s + 1);
    } else {
      setSaving(true);
      // Save to Supabase
      await supabase.from('photoshoot_plans').insert([{ ...answers, [key]: input }]);
      setSaving(false);
      setSubmitted(true);
      // Simulate AI plan
      setTimeout(() => {
        setAiPlan(
          `Here's your custom plan!\n\n- Date: ${answers.date || input}\n- Location: ${answers.location}\n- Style: ${answers.style}\n- Inspiration: ${answers.inspiration}\n- Notes: ${answers.notes}\n\nWe'll reach out soon to finalize details and offer creative suggestions!`
        );
      }, 1200);
      if (onComplete) onComplete();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (submitted) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-display mb-4">Thank you!</h2>
        <div className="bg-[#181818] rounded p-4 text-left whitespace-pre-line text-[#E6D5B8] mt-2">{aiPlan || 'Generating your plan...'}</div>
      </div>
    );
  }

  return (
    <div className="h-96 flex flex-col bg-[#232323] text-[#F3E3C3] rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h3 className="font-vintage text-lg">Studio37 Planning Assistant</h3>
        <p className="text-sm text-[#F3E3C3]/70">Let's create something beautiful together</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                message.sender === 'user'
                  ? 'bg-[#F3E3C3] text-[#1a1a1a]'
                  : 'bg-[#1a1a1a] text-[#F3E3C3] border border-white/10'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-2">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => handleQuickReply(reply)}
              className="text-xs px-3 py-1 bg-[#1a1a1a] text-[#F3E3C3] rounded-full hover:bg-[#333] transition-colors border border-white/20"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex p-4 border-t border-white/10 gap-2">
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 bg-[#1a1a1a] border border-white/20 rounded-l-md py-2 px-3 text-[#F3E3C3] text-sm focus-ring placeholder-[#F3E3C3]/50"
        />
        <button
          onClick={handleSend}
          disabled={!currentMessage.trim()}
          className="bg-[#F3E3C3] text-[#1a1a1a] px-4 py-2 rounded-r-md font-semibold text-sm hover:bg-[#E6D5B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ConversationalPlanner;
