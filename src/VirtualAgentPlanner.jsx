import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './supabaseClient';

const VirtualAgentPlanner = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your virtual photography planner. I can help you plan your perfect photo session!", sender: 'bot' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

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
    if (lowerMessage.match(/(service|offer|what do you do|photography type)/i)) return 'services';
    if (lowerMessage.match(/(book|schedule|appointment|consultation|hire)/i)) return 'booking';
    if (lowerMessage.match(/(portfolio|gallery|work|examples|samples)/i)) return 'portfolio';
    if (lowerMessage.match(/(wedding|bride|groom|engagement)/i)) return 'wedding';
    if (lowerMessage.match(/(location|where|houston|travel)/i)) return 'location';
    if (lowerMessage.match(/(turnaround|delivery|how long|when)/i)) return 'turnaround';
    if (lowerMessage.match(/(contact|phone|email|reach)/i)) return 'contact';
    
    return null;
  };

  const generateResponse = (message) => {
    const intent = detectIntent(message);
    
    if (intent && predefinedResponses[intent]) {
      return predefinedResponses[intent];
    }
    
    // Default response
    return "I'd be happy to help! Could you tell me more about what you're looking for? I can provide information about our services, pricing, booking, or answer any other questions you have about photography sessions.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMsg = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = generateResponse(inputMessage);
      const botMsg = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot'
      };
      
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-[#262626] rounded-lg">
      {/* Header */}
      <div className="bg-[#1a1a1a] p-4 rounded-t-lg border-b border-[#F3E3C3]/20">
        <h3 className="text-lg font-vintage text-[#F3E3C3]">Virtual Photography Planner</h3>
        <p className="text-sm text-[#F3E3C3]/70">Let's plan your perfect photo session!</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2 rounded-lg ${
              msg.sender === 'user' 
                ? 'bg-[#F3E3C3] text-[#1a1a1a]' 
                : 'bg-[#1a1a1a] text-[#F3E3C3] border border-[#F3E3C3]/20'
            }`}>
              <p className="whitespace-pre-line">{msg.text}</p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a1a] text-[#F3E3C3] px-4 py-2 rounded-lg border border-[#F3E3C3]/20">
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
      <form onSubmit={handleSubmit} className="p-4 border-t border-[#F3E3C3]/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about pricing, services, booking..."
            className="flex-1 bg-[#1a1a1a] text-[#F3E3C3] px-4 py-2 rounded-lg border border-[#F3E3C3]/30 focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]/50 placeholder-[#F3E3C3]/50"
          />
          <button
            type="submit"
            className="bg-[#F3E3C3] text-[#1a1a1a] px-4 py-2 rounded-lg hover:bg-[#E6D5B8] transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default VirtualAgentPlanner;
