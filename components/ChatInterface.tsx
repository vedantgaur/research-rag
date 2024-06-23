import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/types';

interface ChatInterfaceProps {
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatHistory, onSendMessage }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="mt-8 border-t border-zinc-700 pt-8">
      <h2 className="text-2xl mb-4">Chat about the research</h2>
      <div className="h-64 overflow-auto mb-4 p-4 bg-zinc-800 rounded">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded ${msg.role === 'user' ? 'bg-blue-500' : 'bg-zinc-700'}`}>
              {msg.content}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow p-2 bg-zinc-700 rounded-l text-white"
          placeholder="Ask about the research..."
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-r">Send</button>
      </form>
    </div>
  );
};
