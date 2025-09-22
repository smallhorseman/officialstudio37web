import React, { useState, useEffect, useRef } from 'react';

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
    location: "We're based in Houston, TX but we travel for destinations weddings and special events. Travel fees may apply for locations outside the Houston metro area.",
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

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: getResponse(userMessage.content),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { label: "View Pricing", action: () => setInputValue("What are your prices?") },
    { label: "Book Session", action: () => setInputValue("How do I book a session?") },
    { label: "Wedding Packages", action: () => setInputValue("Tell me about wedding photography") },
    { label: "Contact Info", action: () => setInputValue("How can I contact you?") }
  ];

  return (
    <div className="flex flex-col h-80">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-[#F3E3C3] text-[#1a1a1a]'
                  : 'bg-[#1a1a1a] text-[#F3E3C3] border border-white/10'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a1a] text-[#F3E3C3] border border-white/10 px-4 py-2 rounded-lg">
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

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-white/10">
        <div className="flex flex-wrap gap-1">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="text-xs px-2 py-1 bg-[#F3E3C3]/10 text-[#F3E3C3] rounded hover:bg-[#F3E3C3]/20 transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about Studio37..."
            className="flex-1 bg-[#1a1a1a] border border-white/20 text-[#F3E3C3] px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#F3E3C3] placeholder-[#F3E3C3]/50"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-[#F3E3C3] text-[#1a1a1a] px-3 py-2 rounded-md hover:bg-[#E6D5B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VirtualAgentPlanner;
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
