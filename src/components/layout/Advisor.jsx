import React, { useState, useEffect } from 'react';
import './Advisor.css';
import address from '../../api/axiosConfig';
import ReactMarkdown from 'react-markdown';

const Advisor = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  
  useEffect(() => {
    // Fetch conversation history when component mounts
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${address}/api/advisor/history`);
        const data = await res.json();
        
        if (data && data.success && Array.isArray(data.history) && data.history.length > 0) {
          // Format the history data into messages based on the actual response structure
          const formattedHistory = data.history.map(item => ({
            from: item.role === 'user' ? 'user' : 'bot',
            text: item.message
          }));
          setMessages(formattedHistory);
        } else {
          // If no history, set default welcome message
          setMessages([
            { from: 'bot', text: 'Hi! I am your Advisor. How can I help you today?' }
          ]);
        }
      } catch (err) {
        console.error('Error fetching conversation history:', err);
        // Set default message if fetch fails
        setMessages([
          { from: 'bot', text: 'Hi! I am your Advisor. How can I help you today?' }
        ]);
      }
      setHistoryLoaded(true);
      setLoading(false);
    };
    
    fetchHistory();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setLoading(true);
    try {
      const res = await fetch(`${address}/api/advisor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input, sessionId: null })
      });
      setInput('');
      const data = await res.json();
      
      // Handle various response formats - looking for message in the format we know from history
      let botResponse = 'Sorry, I did not understand that.';
      if (data && data.success && data.reply) {
        botResponse = data.advice;
      }
      
      setMessages((msgs) => [...msgs, { from: 'bot', text: botResponse }]);
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages((msgs) => [...msgs, { from: 'bot', text: 'Error connecting to advisor.' }]);
    }
    setInput('');
    setLoading(false);
  };

  return (
    <div className="advisor-bg min-h-screen flex flex-col items-center justify-center p-4">
      <div className="advisor-chatbox bg-white bg-opacity-80 rounded-lg shadow-2xl p-6 max-w-lg w-full relative">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Advisor Chat</h2>
        <div className="advisor-messages overflow-y-auto mb-4" style={{ maxHeight: 300 }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-2 flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 rounded-lg ${msg.from === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                {msg.from === 'bot' ? (
                  <div className="markdown-content">
                    <ReactMarkdown>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          {loading && <div className="text-gray-400 text-sm">Advisor is typing...</div>}
        </div>
        <form onSubmit={sendMessage} className="flex">
          <input
            className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Advisor;
