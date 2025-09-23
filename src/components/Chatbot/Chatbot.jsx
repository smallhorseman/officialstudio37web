import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import './Chatbot.css';

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
  const [leadData, setLeadData] = useState({
    name: '',
    email: '',
    phone: '',
    interests: [],
    conversationNotes: ''
  });
  const [conversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Pre-trained responses for Studio37 photography business
  const responses = {
    greetings: [
      "Hello! Welcome to Studio37. I'm here to help you with your photography needs.",
      "Hi there! Thanks for visiting Studio37. What kind of photography are you interested in?",
      "Welcome! I'd love to help you learn about our photography services."
    ],
    services: {
      portrait: "We specialize in professional portrait photography including headshots, family portraits, and personal branding sessions. Our sessions start at $300 and include professional editing.",
      wedding: "Our wedding photography packages range from $1,500 to $5,000 and include engagement sessions, full wedding day coverage, and edited galleries.",
      commercial: "We offer commercial photography for businesses including product photography, corporate headshots, and marketing materials. Let's discuss your specific needs!",
      content: "Our content strategy services help businesses create compelling visual stories. We combine photography with strategic planning for social media and marketing."
    },
    pricing: {
      general: "Our pricing varies by service type. Portrait sessions start at $300, commercial work is quoted per project, and wedding packages range from $1,500-$5,000. Would you like specific pricing for a particular service?",
      portrait: "Portrait sessions are $300 for a 1-hour session including 10 edited photos. Additional photos are $25 each.",
      wedding: "Wedding packages start at $1,500 for 6 hours of coverage and go up to $5,000 for full-day premium coverage with engagement session."
    },
    booking: "I'd love to help you book a session! Can you share your name, email, and what type of photography you're interested in? I'll have our team reach out within 24 hours.",
    location: "We're based in Houston, TX and serve the greater Houston area. We can also travel for destination sessions - travel fees may apply."
  };

  const detectIntent = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'greeting';
    }
    if (lowerMessage.includes('portrait') || lowerMessage.includes('headshot') || lowerMessage.includes('family photo')) {
      return 'portrait';
    }
    if (lowerMessage.includes('wedding') || lowerMessage.includes('bride') || lowerMessage.includes('marriage')) {
      return 'wedding';
    }
    if (lowerMessage.includes('commercial') || lowerMessage.includes('business') || lowerMessage.includes('product')) {
      return 'commercial';
    }
    if (lowerMessage.includes('content') || lowerMessage.includes('social media') || lowerMessage.includes('marketing')) {
      return 'content';
    }
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      return 'pricing';
    }
    if (lowerMessage.includes('book') || lowerMessage.includes('schedule') || lowerMessage.includes('appointment')) {
      return 'booking';
    }
    if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('houston')) {
      return 'location';
    }
    
    return 'general';
  };

  const extractLeadInfo = (message) => {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
    
    const email = message.match(emailRegex);
    const phone = message.match(phoneRegex);
    
    return {
      email: email ? email[0] : null,
      phone: phone ? phone[0] : null
    };
  };

  const generateResponse = (intent, userMessage) => {
    const leadInfo = extractLeadInfo(userMessage);
    
    // Update lead data if contact info found
    if (leadInfo.email || leadInfo.phone) {
      setLeadData(prev => ({
        ...prev,
        email: leadInfo.email || prev.email,
        phone: leadInfo.phone || prev.phone,
        conversationNotes: prev.conversationNotes + `\nUser provided: ${userMessage}`
      }));
    }

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
        return "I'd be happy to help you with information about our photography services, pricing, or booking. What specific questions do you have about Studio37?";
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
          lead_email: leadData.email,
          lead_phone: leadData.phone,
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

    // Generate bot response
    const intent = detectIntent(inputMessage);
    const botResponseText = generateResponse(intent, inputMessage);

    // Simulate typing delay
    setTimeout(async () => {
      const botMessage = {
        id: messages.length + 2,
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);

      // Save to Supabase
      await saveConversationToSupabase(inputMessage, botResponseText);
    }, 1000);

    setInputMessage('');
    
    // Update conversation notes
    setLeadData(prev => ({
      ...prev,
      conversationNotes: prev.conversationNotes + `\nUser: ${inputMessage}\nBot: ${botResponseText}`
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <div className={`chat-toggle ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.36 15.01 3.01 16.32L2 22L7.68 20.99C8.99 21.64 10.46 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="currentColor"/>
        </svg>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Studio37 Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="close-button">×</button>
          </div>
          
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  {message.text}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="message-content typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows="1"
            />
            <button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
