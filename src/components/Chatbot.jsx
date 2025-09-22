import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Studio37's assistant. I can help you learn about our photography services, book sessions, or answer questions about pricing. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const responses = {
    greetings: [
      "Hello! Welcome to Studio37. I'm here to help you with your photography needs.",
      "Hi there! Thanks for visiting Studio37. What kind of photography are you interested in?",
      "Welcome! I'd love to help you learn about our photography services."
    ],
    services: {
      portrait: "We specialize in professional portrait photography including headshots, family portraits, and personal branding sessions. Our sessions start at $300.",
      wedding: "Our wedding photography packages range from $1,500 to $5,000 and include engagement sessions, full wedding day coverage, and edited galleries.",
      commercial: "We offer commercial photography for businesses including product photography, corporate headshots, and marketing materials.",
      content: "Our content strategy services help businesses create compelling visual stories for social media and marketing."
    },
    pricing: {
      general: "Our pricing varies by service type. Portrait sessions start at $300, wedding packages range from $1,500-$5,000. Would you like specific pricing?",
      portrait: "Portrait sessions are $300 for a 1-hour session including 10 edited photos.",
      wedding: "Wedding packages start at $1,500 for 6 hours of coverage."
    },
    booking: "I'd love to help you book a session! Can you share your name, email, and what type of photography you're interested in?",
    location: "We're based in Houston, TX and serve the greater Houston area."
  };

  const detectIntent = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'greeting';
    }
    if (lowerMessage.includes('portrait') || lowerMessage.includes('headshot')) {
      return 'portrait';
    }
    if (lowerMessage.includes('wedding') || lowerMessage.includes('bride')) {
      return 'wedding';
    }
    if (lowerMessage.includes('commercial') || lowerMessage.includes('business')) {
      return 'commercial';
    }
    if (lowerMessage.includes('content') || lowerMessage.includes('social media')) {
      return 'content';
    }
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      return 'pricing';
    }
    if (lowerMessage.includes('book') || lowerMessage.includes('schedule')) {
      return 'booking';
    }
    if (lowerMessage.includes('location') || lowerMessage.includes('where')) {
      return 'location';
    }
    
    return 'general';
  };

  const generateResponse = (intent, userMessage) => {
    switch (intent) {
      case 'greeting':
        return responses.greetings[Math.floor(Math.random() * responses.greetings.length)];
      case 'portrait':
        return responses.services.portrait;
      case 'wedding':
        return responses.services.wedding;
      case 'commercial':
        return responses.services.commercial;
      case 'content':
        return responses.services.content;
      case 'pricing':
        if (userMessage.includes('portrait')) return responses.pricing.portrait;
        if (userMessage.includes('wedding')) return responses.pricing.wedding;
        return responses.pricing.general;
      case 'booking':
        return responses.booking;
      case 'location':
        return responses.location;
      default:
        return "I'd be happy to help you with information about our photography services, pricing, or booking. What questions do you have?";
    }
  };

  const saveConversationToSupabase = async (userMessage, botResponse) => {
    try {
      const { error } = await supabase
        .from('chatbot_conversations')
        .insert({
          conversation_id: conversationId,
          user_message: userMessage,
          bot_response: botResponse,
          created_at: new Date().toISOString()
        });

      if (error) console.error('Error saving conversation:', error);
    } catch (error) {
      console.error('Error saving to Supabase:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const intent = detectIntent(inputMessage);
    const botResponseText = generateResponse(intent, inputMessage);

    setTimeout(async () => {
      const botMessage = {
        id: messages.length + 2,
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);

      await saveConversationToSupabase(inputMessage, botResponseText);
    }, 1000);

    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-[#F3E3C3] text-[#1a1a1a] p-4 rounded-full shadow-lg hover:bg-[#E6D5B8] transition-all hover:scale-110 z-50"
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.36 15.01 3.01 16.32L2 22L7.68 20.99C8.99 21.64 10.46 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="currentColor"/>
        </svg>
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 bg-[#262626] rounded-lg shadow-lg w-80 max-h-96 flex flex-col z-50">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-vintage text-lg text-[#F3E3C3]">Studio37 Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-[#F3E3C3] hover:text-red-400">×</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-64">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                  message.sender === 'user'
                    ? 'bg-[#F3E3C3] text-[#1a1a1a]'
                    : 'bg-[#1a1a1a] text-[#F3E3C3]'
                }`}>
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#1a1a1a] text-[#F3E3C3] px-4 py-2 rounded-lg text-sm">
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

          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                rows="1"
                className="flex-1 bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-3 text-[#F3E3C3] text-sm focus:outline-none focus:ring-2 focus:ring-[#F3E3C3] resize-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-[#F3E3C3] text-[#1a1a1a] px-4 py-2 rounded-md font-semibold text-sm hover:bg-[#E6D5B8] disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
