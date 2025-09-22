import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const Studio37Chatbot = () => {
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

  // ...existing chatbot logic from previous implementation...

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
        </div>
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-br from-[#262626] to-[#1a1a1a] rounded-xl shadow-2xl w-96 max-h-[600px] flex flex-col z-50 border border-[#F3E3C3]/20">
          {/* ...existing chatbot UI... */}
        </div>
      )}
    </>
  );
};

export default Studio37Chatbot;
