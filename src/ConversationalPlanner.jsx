import React, { useState, useRef, useEffect } from 'react';
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: currentMessage,
      sender: 'user'
    };
    setMessages(prev => [...prev, userMessage]);

    // Save response
    const currentQuestion = questions[currentQuestionIndex];
    setSessionData(prev => ({
      ...prev,
      [currentQuestion.key]: currentMessage
    }));

    setCurrentMessage('');

    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      const nextQuestion = questions[currentQuestionIndex + 1];
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: nextQuestion.prompt,
          sender: 'bot'
        }]);
      }, 500);
    } else {
      // Save to Supabase
      try {
        await supabase.from('planning_sessions').insert([{
          ...sessionData,
          [currentQuestion.key]: currentMessage,
          created_at: new Date().toISOString()
        }]);
        
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            text: "Perfect! I've saved all your preferences. Our team will review this and get back to you within 24 hours with a customized proposal. 🎯",
            sender: 'bot'
          }]);
        }, 500);

        if (onComplete) {
          onComplete(sessionData);
        }
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }
  };

  return (
    <div className="conversational-planner max-w-2xl mx-auto">
      <div className="bg-[#262626] rounded-lg p-4 h-96 overflow-y-auto mb-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block max-w-xs px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-[#F3E3C3] text-[#1a1a1a]'
                  : 'bg-[#1a1a1a] text-[#F3E3C3]'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your answer..."
          className="flex-1 bg-[#1a1a1a] border border-white/20 rounded-md py-2 px-4 text-[#F3E3C3] focus:outline-none focus:ring-2 focus:ring-[#F3E3C3]"
        />
        <button
          onClick={handleSendMessage}
          disabled={!currentMessage.trim()}
          className="bg-[#F3E3C3] text-[#1a1a1a] px-6 py-2 rounded-md font-semibold hover:bg-[#E6D5B8] disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ConversationalPlanner;
