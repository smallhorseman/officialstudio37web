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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage = { 
      id: messages.length + 1, 
      text: inputMessage, 
      sender: 'user' 
    };
    
    setMessages([...messages, newMessage]);
    setIsTyping(true);
    
    setTimeout(() => {
      const botResponse = { 
        id: messages.length + 2, 
        text: "Thanks for your message! A team member will respond shortly.", 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
    
    setInputMessage('');
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <div className="p-4 bg-[#F3E3C3] rounded-t-lg">
        <h3 className="text-lg font-bold">Virtual Planner</h3>
      </div>
      
      <div className="h-96 overflow-y-auto p-4 space-y-3">
        {messages.map(message => (
          <div key={message.id} className={`${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg ${
              message.sender === 'user' 
                ? 'bg-[#F3E3C3] text-[#1a1a1a]' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {message.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="text-left">
            <div className="inline-block p-3 rounded-lg bg-gray-100">
              <span className="animate-pulse">Typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-[#F3E3C3] text-[#1a1a1a] rounded-lg hover:bg-[#E6D5B8] transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default VirtualAgentPlanner;
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
        </div>
      </form>
    </div>
  );
};

export default VirtualAgentPlanner;
