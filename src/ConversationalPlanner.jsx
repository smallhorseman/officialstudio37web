import React, { useState } from 'react';
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

  const quickReplies = [
    "Classic portraits",
    "Modern lifestyle",
    "Vintage aesthetic", 
    "Candid moments",
    "Creative concepts"
  ];

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

  if (submitted) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-display mb-4">Thank you!</h2>
        <div className="bg-[#181818] rounded p-4 text-left whitespace-pre-line text-[#E6D5B8] mt-2">{aiPlan || 'Generating your plan...'}</div>
      </div>
    );
  }

  return (
    <div className="h-96 flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-[#F3E3C3] text-[#1a1a1a]'
                  : 'bg-[#1a1a1a] text-[#F3E3C3]'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Replies */}
      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-2">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => handleQuickReply(reply)}
              className="text-xs px-3 py-1 bg-[#1a1a1a] text-[#F3E3C3] rounded-full hover:bg-[#333] transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex p-4 border-t border-white/10">
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          className="flex-1 bg-[#1a1a1a] border border-white/20 rounded-l-md py-2 px-3 text-[#F3E3C3] text-sm"
        />
        <button
          onClick={handleSend}
          className="bg-[#F3E3C3] text-[#1a1a1a] px-4 py-2 rounded-r-md font-semibold text-sm hover:bg-[#E6D5B8] transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ConversationalPlanner;
