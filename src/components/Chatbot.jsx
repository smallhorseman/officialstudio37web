// DELETE THIS FILE - Use Studio37Chatbot.jsx instead
import { supabase } from '../supabaseClient';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hi! I'm Studio37's AI assistant. I can help you with:\n\n📸 Photography services & pricing\n📅 Booking sessions\n❓ General questions\n\nHow can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [collectingInfo, setCollectingInfo] = useState(false);
  const [infoStep, setInfoStep] = useState('name');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced responses with quick actions
  const responses = {
    greetings: [
      "Hello! Welcome to Studio37 Photography! 🎯 I'm here to help you capture your perfect moments. What type of photography are you interested in?",
      "Hi there! 📷 Thanks for visiting Studio37. I can help you with our services, pricing, or booking. What would you like to know?",
      "Welcome to Studio37! ✨ I'd love to help you find the perfect photography solution. What brings you here today?"
    ],
    services: {
      portrait: {
        text: "🎭 **Portrait Photography**\n\n• Professional headshots: $300\n• Family portraits: $400\n• Personal branding: $500\n• Corporate headshots: $350\n\nAll sessions include professional editing and high-res images. Would you like to book a consultation?",
        quickActions: ['Book Portrait Session', 'View Portfolio', 'Get Pricing Details']
      },
      wedding: {
        text: "💒 **Wedding Photography**\n\n• Engagement sessions: $800\n• Wedding day (6 hrs): $1,500\n• Full day coverage: $2,500\n• Premium package: $5,000\n\nIncludes edited gallery, USB drive, and print release. Interested in learning more?",
        quickActions: ['View Wedding Gallery', 'Book Consultation', 'Download Pricing Guide']
      },
      commercial: {
        text: "🏢 **Commercial Photography**\n\n• Product photography: Starting $200/product\n• Corporate events: $150/hour\n• Real estate: $300/property\n• Marketing campaigns: Custom quotes\n\nProfessional quality for your business needs. Ready to discuss your project?",
        quickActions: ['Request Quote', 'View Commercial Work', 'Schedule Call']
      },
      content: {
        text: "📱 **Content Strategy Services**\n\n• Social media content: $600/month\n• Brand photography: $800/session\n• Content planning: $400/month\n• Full strategy package: $1,200/month\n\nBoost your online presence with professional content. Want to get started?",
        quickActions: ['See Content Examples', 'Book Strategy Call', 'Get Custom Quote']
      }
    },
    pricing: {
      general: "💰 **Studio37 Pricing Overview**\n\nPortraits: $300-500\nWeddings: $1,500-5,000\nCommercial: $150-300/hr\nContent Strategy: $400-1,200/month\n\nAll packages include professional editing. Which service interests you most?"
    }
  };

  const detectIntent = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.match(/(hello|hi|hey|greetings|good morning|good afternoon)/)) {
      return 'greeting';
    }
    if (lowerMessage.match(/(portrait|headshot|family photo|personal branding)/)) {
      return 'portrait';
    }
    if (lowerMessage.match(/(wedding|bride|groom|marriage|engagement)/)) {
      return 'wedding';
    }
    if (lowerMessage.match(/(commercial|business|corporate|product photo|real estate)/)) {
      return 'commercial';
    }
    if (lowerMessage.match(/(content|social media|marketing|brand|instagram)/)) {
      return 'content';
    }
    if (lowerMessage.match(/(price|cost|how much|pricing|budget|rate)/)) {
      return 'pricing';
    }
    if (lowerMessage.match(/(book|schedule|appointment|reserve|hire)/)) {
      return 'booking';
    }
    
    return 'general';
  };

  const generateResponse = (intent, userMessage) => {
    switch (intent) {
      case 'greeting':
        return {
          text: responses.greetings[Math.floor(Math.random() * responses.greetings.length)],
          quickActions: ['Portrait Photography', 'Wedding Photography', 'Commercial Services', 'Pricing Info']
        };
      case 'portrait':
        return responses.services.portrait;
      case 'wedding':
        return responses.services.wedding;
      case 'commercial':
        return responses.services.commercial;
      case 'content':
        return responses.services.content;
      case 'pricing':
        return {
          text: responses.pricing.general,
          quickActions: ['Portrait Pricing', 'Wedding Packages', 'Commercial Rates', 'Book Consultation']
        };
      case 'booking':
        setCollectingInfo(true);
        setInfoStep('name');
        return {
          text: "📅 **Ready to Book?**\n\nI'd love to help you schedule! What's your name?",
          quickActions: []
        };
      default:
        return {
          text: "I'd be happy to help! I can assist with:\n\n📸 Photography services\n💰 Pricing information\n📅 Booking sessions\n\nWhat would you like to know more about?",
          quickActions: ['See All Services', 'Get Pricing', 'Book Now']
        };
    }
  };

  const handleInfoCollection = (message) => {
    switch (infoStep) {
      case 'name':
        setUserName(message);
        setInfoStep('email');
        return `Nice to meet you, ${message}! 😊 What's your email address?`;
      case 'email':
        setUserEmail(message);
        setInfoStep('service');
        return `Perfect! What type of photography session interests you?\n\n📸 Portrait\n💒 Wedding\n🏢 Commercial\n📱 Content Creation`;
      case 'service':
        setCollectingInfo(false);
        createLead(userName, userEmail, message);
        return `Excellent choice! 🎉\n\nI've saved your information:\n• Name: ${userName}\n• Email: ${userEmail}\n• Service: ${message}\n\nOur team will contact you within 24 hours. Is there anything else I can help you with?`;
      default:
        return "I'm here to help with any other questions!";
    }
  };

  const createLead = async (name, email, service) => {
    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          name: name,
          email: email,
          service: service,
          status: 'New',
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating lead:', error);
      } else {
        console.log('Lead created successfully');
      }
    } catch (error) {
      console.error('Error creating lead:', error);
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

    let botResponseText;
    let quickActions = [];

    if (collectingInfo) {
      botResponseText = handleInfoCollection(inputMessage);
    } else {
      const intent = detectIntent(inputMessage);
      const response = generateResponse(intent, inputMessage);
      botResponseText = response.text || response;
      quickActions = response.quickActions || [];
    }

    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
        quickActions: quickActions
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1200);

    setInputMessage('');
  };

  const handleQuickAction = (action) => {
    setInputMessage(action);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
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
        className="fixed bottom-6 right-6 bg-gradient-to-r from-[#F3E3C3] to-[#E6D5B8] text-[#1a1a1a] p-4 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110 z-50 animate-pulse"
        style={{ display: isOpen ? 'none' : 'flex' }}
        title="Chat with Studio37 AI Assistant"
      >
        <div className="relative">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.36 15.01 3.01 16.32L2 22L7.68 20.99C8.99 21.64 10.46 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="currentColor"/>
          </svg>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-br from-[#262626] to-[#1a1a1a] rounded-xl shadow-2xl w-96 max-h-[600px] flex flex-col z-50 border border-[#F3E3C3]/20">
          <div className="p-4 border-b border-[#F3E3C3]/20 flex justify-between items-center bg-gradient-to-r from-[#F3E3C3] to-[#E6D5B8] rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center">
                <span className="text-[#F3E3C3] font-bold text-lg">S37</span>
              </div>
              <div>
                <h3 className="font-vintage text-lg text-[#1a1a1a]">Studio37 AI</h3>
                <p className="text-xs text-[#1a1a1a]/70">Photography Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-[#1a1a1a] hover:text-red-600 transition-colors text-xl font-bold"
            >
              ×
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-[#F3E3C3] to-[#E6D5B8] text-[#1a1a1a] rounded-br-md'
                      : 'bg-[#1a1a1a] text-[#F3E3C3] border border-[#F3E3C3]/20 rounded-bl-md'
                  }`}>
                    <div className="whitespace-pre-line">{message.text}</div>
                  </div>
                </div>

                {message.sender === 'bot' && message.quickActions && message.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 ml-2">
                    {message.quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickAction(action)}
                        className="px-3 py-1 bg-[#F3E3C3]/10 hover:bg-[#F3E3C3]/20 text-[#F3E3C3] border border-[#F3E3C3]/30 rounded-full text-xs transition-all hover:scale-105"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#1a1a1a] text-[#F3E3C3] border border-[#F3E3C3]/20 px-4 py-3 rounded-2xl rounded-bl-md text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#F3E3C3] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#F3E3C3] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-[#F3E3C3] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs">AI thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-[#F3E3C3]/20">
            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={collectingInfo ? 
                  infoStep === 'name' ? "Enter your name..." :
                  infoStep === 'email' ? "Enter your email..." :
                  "Tell me about your needs..." :
                  "Ask me about photography services..."
                }
                rows="1"
                className="flex-1 bg-[#1a1a1a] border border-[#F3E3C3]/30 rounded-xl py-3 px-4 text-[#F3E3C3] text-sm focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]/50 placeholder-[#F3E3C3]/40 resize-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-[#F3E3C3] to-[#E6D5B8] text-[#1a1a1a] px-4 py-3 rounded-xl font-semibold text-sm hover:from-[#E6D5B8] hover:to-[#D4C5A8] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 flex items-center"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                </svg>
              </button>
            </div>
            
            <div className="flex justify-between items-center mt-2 text-xs text-[#F3E3C3]/50">
              <span>Press Enter to send</span>
              {userName && <span>👋 Hi, {userName}!</span>}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
