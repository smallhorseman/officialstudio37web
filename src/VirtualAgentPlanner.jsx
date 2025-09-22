import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './supabaseClient';

const VirtualAgentPlanner = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "👋 Hi! I'm your Studio37 virtual assistant. I can help you with:\n\n• Photography services & pricing\n• Booking consultations\n• Portfolio questions\n• Wedding & event photography\n• Commercial shoots\n\nWhat would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const predefinedResponses = {
    pricing: "Our photography packages start at $500 for portrait sessions and $2,500 for weddings. Each package is customized to your needs. Would you like to schedule a consultation to discuss your specific requirements?",
    services: "We offer:\n• Portrait Photography\n• Wedding Photography\n• Event Photography\n• Commercial Photography\n• Content Strategy\n\nWhich service interests you most?",
    booking: "Great! To book a session, you can:\n1. Call us at (832) 713-9944\n2. Email sales@studio37.cc\n3. Fill out our contact form\n\nWe typically respond within 24 hours. What type of session are you interested in?",
    portfolio: "You can view our complete portfolio by unlocking it on our portfolio page. Just provide your contact info and tell us about your project - it's free and gives you access to our full gallery!",
    wedding: "Our wedding packages include:\n• Full day coverage (8+ hours)\n• Engagement session\n• Online gallery\n• Print release\n• Starting at $2,500\n\nWould you like to schedule a consultation to discuss your wedding?",
    location: "We're based in Houston, TX but we travel for destination weddings and special events. Travel fees may apply for locations outside the Houston metro area.",
    turnaround: "Typical turnaround times:\n• Portrait sessions: 1-2 weeks\n• Weddings: 4-6 weeks\n• Commercial projects: 2-3 weeks\n\nRush delivery is available for an additional fee.",
    contact: "You can reach us:\n📞 Phone: (832) 713-9944\n📧 Email: sales@studio37.cc\n📍 Location: Houston, TX\n\nWe're here to help bring your vision to life!"
  };

  const getResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('price') || message.includes('cost') || message.includes('how much')) {
      return predefinedResponses.pricing;
    }
    if (message.includes('service') || message.includes('what do you')) {
      return predefinedResponses.services;
    }
    if (message.includes('book') || message.includes('schedule') || message.includes('appointment')) {
      return predefinedResponses.booking;
    }
    if (message.includes('portfolio') || message.includes('work') || message.includes('photos')) {
      return predefinedResponses.portfolio;
    }
    if (message.includes('wedding') || message.includes('marry') || message.includes('bride')) {
      return predefinedResponses.wedding;
    }
    if (message.includes('where') || message.includes('location') || message.includes('houston')) {
      return predefinedResponses.location;
    }
    if (message.includes('when') || message.includes('how long') || message.includes('turnaround')) {
      return predefinedResponses.turnaround;
    }
    if (message.includes('contact') || message.includes('phone') || message.includes('email')) {
      return predefinedResponses.contact;
    }
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! 👋 Welcome to Studio37. I'm here to help you with any questions about our photography services. What would you like to know?";
    }
    if (message.includes('thank') || message.includes('thanks')) {
      return "You're very welcome! Is there anything else I can help you with today? I'm here to make your Studio37 experience amazing! 😊";
    }
    
    // Default response
    return "I'd be happy to help with that! For specific questions, you can:\n\n📞 Call us at (832) 713-9944\n📧 Email sales@studio37.cc\n\nOr ask me about:\n• Pricing & packages\n• Services we offer\n• Booking a session\n• Our portfolio\n• Wedding photography\n\nWhat interests you most?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: getResponse(inputValue),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-96">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg text-sm whitespace-pre-line ${
                message.type === 'user'
                  ? 'bg-[#F3E3C3] text-[#1a1a1a]'
                  : 'bg-[#1a1a1a] text-[#F3E3C3] border border-white/10'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a1a] text-[#F3E3C3] border border-white/10 px-4 py-2 rounded-lg text-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[#F3E3C3] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#F3E3C3] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-[#F3E3C3] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-[#F3E3C3] text-sm focus:outline-none focus:ring-2 focus:ring-[#F3E3C3] placeholder-[#F3E3C3]/50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-[#F3E3C3] text-[#1a1a1a] px-4 py-2 rounded-md font-semibold text-sm hover:bg-[#E6D5B8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default VirtualAgentPlanner;
