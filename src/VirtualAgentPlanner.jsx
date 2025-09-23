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

  const detectIntent = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Detect various intents
    if (lowerMessage.match(/(price|pricing|cost|how much|rate)/i)) return 'pricing';
    if (lowerMessage.match(/(service|offer|what do you do)/i)) return 'services';
    if (lowerMessage.match(/(book|schedule|appointment|consultation)/i)) return 'booking';
    if (lowerMessage.match(/(portfolio|work|gallery|examples)/i)) return 'portfolio';
    if (lowerMessage.match(/(wedding|engagement|bride|groom)/i)) return 'wedding';
    if (lowerMessage.match(/(where|location|houston|address)/i)) return 'location';
    if (lowerMessage.match(/(turnaround|delivery|how long)/i)) return 'turnaround';
    if (lowerMessage.match(/(contact|phone|email|reach)/i)) return 'contact';
    
    return 'general';
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Detect intent and generate response
    const intent = detectIntent(inputValue);
    const response = predefinedResponses[intent] || "I'd be happy to help! Could you tell me more about what you're looking for?";

    // Simulate typing delay
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="virtual-agent-planner bg-[#262626] rounded-lg p-6 max-w-2xl mx-auto">
      <div className="chat-header mb-4">
        <h2 className="text-2xl font-display text-[#F3E3C3]">Studio37 Virtual Assistant</h2>
        <p className="text-[#F3E3C3]/60 text-sm">Ask me anything about our services!</p>
      </div>

      <div className="chat-messages bg-[#1a1a1a] rounded-lg p-4 h-96 overflow-y-auto mb-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block max-w-xs px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-[#F3E3C3] text-[#1a1a1a]'
                  : 'bg-[#262626] text-[#F3E3C3]'
              }`}
            >
              <p className="whitespace-pre-line">{message.content}</p>
              <p className="text-xs opacity-60 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="text-left mb-4">
            <div className="inline-block bg-[#262626] text-[#F3E3C3] px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[#F3E3C3] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#F3E3C3] rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-[#F3E3C3] rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-4 text-[#F3E3C3] focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isTyping}
          className="bg-[#F3E3C3] text-[#1a1a1a] px-4 py-2 rounded-md font-semibold hover:bg-[#E6D5B8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default VirtualAgentPlanner;
