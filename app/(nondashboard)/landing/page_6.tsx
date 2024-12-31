'use client';

import React, { useState } from 'react';
import { FiSend, FiFile, FiClock, FiMessageCircle } from 'react-icons/fi';

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function PDFChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I can help you understand your PDF documents. What would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    // Simulate assistant response
    const assistantMessage: Message = {
      id: messages.length + 2,
      type: 'assistant',
      content: 'This is a simulated response to your question. In a real implementation, this would be generated by an AI model.',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setInput('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            PDF Chat
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Chat with your documents using AI
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm h-[600px] flex flex-col">
          {/* Active Document */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3">
              <FiFile className="h-5 w-5 text-gray-400" />
              <span className="text-gray-900 dark:text-gray-50 font-medium">
                sample-document.pdf
              </span>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-lg p-4 ${
                  message.type === 'user'
                    ? 'bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900'
                    : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-50'
                }`}>
                  <p>{message.content}</p>
                  <div className={`mt-1 text-xs flex items-center ${
                    message.type === 'user'
                      ? 'text-gray-300 dark:text-gray-600'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <FiClock className="h-3 w-3 mr-1" />
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question about your document..."
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center ${
                  input.trim()
                    ? 'bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                }`}
              >
                <FiSend className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
