import React, { useState, useRef, useEffect } from 'react';

const ChatInterface = ({ setProgress }) => {
  const [messages, setMessages] = useState([
    { role: 'agent', text: 'Hello! I am your AI Learning Companion powered by Google Cloud. What would you like to learn today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Accessibility: auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Efficiency: using fetch API for minimal payload overhead
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text, sessionId: 'default-session' })
      });
      
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'agent', text: data.response }]);
      if (data.progress) {
        setProgress(data.progress);
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
      setMessages(prev => [...prev, { role: 'agent', text: 'Sorry, I encountered a network error. Ensure the backend is running.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="chat-window" aria-live="polite">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <span className="message-meta">{msg.role === 'user' ? 'You' : 'AI Companion'}</span>
            <div className="message-content">{msg.text}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message agent">
            <span className="message-meta">AI Companion</span>
            <div className="message-content">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <div className="input-wrapper">
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            aria-label="Message Input"
            disabled={isLoading}
          />
        </div>
        <button 
          className="send-btn" 
          onClick={handleSend} 
          disabled={isLoading || !input.trim()}
          aria-label="Send Message"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </>
  );
};

export default ChatInterface;
