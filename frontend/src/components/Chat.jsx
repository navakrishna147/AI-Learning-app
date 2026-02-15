import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const Chat = ({ documentId, documentTitle, documentContent }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [sessionActive, setSessionActive] = useState(true);
  const [aiStatus, setAiStatus] = useState({ available: false }); // ✅ Initialize with default
  const [aiReady, setAiReady] = useState(false); // ✅ Track initialization
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
    checkAIStatus();
  }, [documentId]);

  const checkAIStatus = async () => {
    try {
      const response = await api.get('/chat/status');
      setAiStatus(response.data.aiStatus);
      
      if (!response.data.apiAvailable) {
        setError('⚠️ AI service is not configured');
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Error checking AI status:', err);
      setError('⚠️ Unable to check AI status');
    } finally {
      setAiReady(true); // ✅ Mark initialization complete
    }
  };

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/chat/${documentId}`);

      if (response.data.chat) {
        setChatId(response.data.chat._id);
        setSessionActive(response.data.chat.isActive);
        setMessages(response.data.messages || []);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading chat history:', err);
      if (err.response?.status === 404) {
        setMessages([]);
      } else {
        setError('Failed to load chat history');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || loading) return;
    
    // ✅ Check if still initializing
    if (!aiReady) {
      setError('⏳ Initializing AI service... Please wait.');
      return;
    }
    
    if (!aiStatus?.available) {
      setError('❌ AI service is not available. Please try again later.');
      return;
    }

    const userMessage = input;
    setInput('');
    setError(null);
    setLoading(true);

    try {
      // Add user message to chat
      setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);

      // Call API with document context
      const response = await api.post(
        `/chat/${documentId}`,
        { message: userMessage, streaming: false }
      );

      if (response.data.success && response.data.message) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.data.message, 
          timestamp: new Date() 
        }]);
      } else {
        setError('⚠️ No response from AI');
      }
    } catch (err) {
      console.error('Chat error:', err);
      
      let errorMsg = 'Failed to get response';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.status === 503) {
        errorMsg = '⚠️ AI service temporarily unavailable. Please check API configuration.';
      }
      
      setError(errorMsg);
      setMessages(prev => prev.slice(0, -1)); // Remove user message on error
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear this chat?')) {
      try {
        await api.delete(`/chat/${documentId}`);
        setMessages([]);
        loadChatHistory();
      } catch (err) {
        setError('Failed to clear chat');
      }
    }
  };

  return (
    <div className="flex flex-col h-[700px] bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b p-4">
        <h3 className="font-bold text-lg">💬 {documentTitle}</h3>
        <p className="text-sm text-gray-600">Ask questions about this document</p>
        {aiStatus && (
          <p className={`text-xs mt-2 ${
            aiStatus.available ? 'text-green-600' : 'text-red-600'
          }`}>
            {aiStatus.available ? '✅ AI Service Ready' : '⚠️ AI Service Offline'}
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-gray-500">
            <div>
              <p className="mb-2">💬 No messages yet</p>
              <p className="text-xs">Ask a question about the document to get started.</p>
              <p className="text-xs mt-2">Example: "What is the main topic?"</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}
              >
                <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  msg.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                }`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 space-y-2">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the document..."
            disabled={loading || !sessionActive}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || !sessionActive}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? '...' : 'Send'}
          </button>
        </form>
        <button
          onClick={handleClearChat}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Clear Chat
        </button>
      </div>
    </div>
  );
};

export default Chat;
