'use client';

import { useState, useRef, useEffect } from 'react';
import { IoSend, IoRefreshOutline } from "react-icons/io5";
import { BsClock, BsThreeDotsVertical } from "react-icons/bs";
import { MdOutlineClearAll } from "react-icons/md";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}

const INITIAL_MESSAGES = [
  {
    id: 1,
    text: "Hello! How can I assist you today?",
    sender: "assistant" as const,
    timestamp: '',
  }
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const recommendedPrompts = [
    "How do I use the editor?",
    "What features are available?",
    "How to format text?",
    "Can I add images?",
  ];

  // Initialize messages with timestamps on client side
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('chatMessages');
      const savedInput = localStorage.getItem('chatInput');
      
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        setMessages(INITIAL_MESSAGES.map(msg => ({
          ...msg,
          timestamp: new Date().toLocaleTimeString()
        })));
      }
      
      if (savedInput) {
        setInputMessage(savedInput);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
    }
  }, [messages]);

  // Save input to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('chatInput', inputMessage);
    } catch (error) {
      console.error('Error saving input to localStorage:', error);
    }
  }, [inputMessage]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user" as const,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const assistantResponse = {
        id: messages.length + 2,
        text: "Thank you for your message! I'm processing your request.",
        sender: "assistant" as const,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, assistantResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInputMessage(prompt);
  };

  const handleClearChat = () => {
    try {
      setMessages(INITIAL_MESSAGES.map(msg => ({
        ...msg,
        timestamp: new Date().toLocaleTimeString()
      })));
      localStorage.removeItem('chatMessages');
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const handleRefresh = () => {
    try {
      const refreshedMessages = [{
        id: 1,
        text: "Chat refreshed. How can I help you?",
        sender: "assistant" as const,
        timestamp: new Date().toLocaleTimeString(),
      }];
      setMessages(refreshedMessages);
      localStorage.setItem('chatMessages', JSON.stringify(refreshedMessages));
    } catch (error) {
      console.error('Error refreshing chat:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-lg">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          AI Assistant
          {isTyping && (
            <span className="text-xs text-gray-500 animate-pulse">typing...</span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Refresh chat"
          >
            <IoRefreshOutline className="text-xl" />
          </button>
          <button
            onClick={handleClearChat}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Clear chat"
          >
            <MdOutlineClearAll className="text-xl" />
          </button>
          <button
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="More options"
          >
            <BsThreeDotsVertical />
          </button>
        </div>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                message.sender === "user" 
                  ? "bg-gray-700 text-white" 
                  : "bg-white border border-gray-200 text-gray-800"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              <div
                className={`flex items-center mt-2 text-xs ${
                  message.sender === "user" 
                    ? "text-gray-300" 
                    : "text-gray-500"
                }`}
              >
                <BsClock className="mr-1" />
                <span>{message.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
        <div className="flex flex-wrap gap-2 mb-4">
          {recommendedPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handlePromptClick(prompt)}
              className="px-4 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-full transition-colors duration-200 shadow-sm"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex items-end gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-1 resize-none rounded-2xl border border-gray-200 focus:ring-2 focus:ring-gray-400 focus:border-transparent p-4 max-h-32 min-h-[56px] text-gray-900 placeholder-gray-500 shadow-sm"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="p-4 bg-gray-700 text-white rounded-2xl hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <IoSend className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
}
