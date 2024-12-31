'use client';

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FiFile,
  FiLink,
  FiSearch,
  FiMoreVertical,
  FiPlus,
  FiSettings,
  FiRefreshCw,
  FiSend,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import axios from "axios";
import toast from 'react-hot-toast';

// Configure axios base URL
const api = axios.create({
  baseURL: 'http://127.0.0.1:8080/api/',
  headers: {
    'Accept': 'application/json',
  }
});

interface Source {
  id: number;
  name: string;
  type: 'pdf' | 'link';
  processed?: boolean;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Get cached value with expiry check
const getCachedValue = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const { value, timestamp } = JSON.parse(item);
    // Check if value is less than 24 hours old
    if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
      return value;
    }
    localStorage.removeItem(key);
    return null;
  } catch {
    return null;
  }
};

// Set cached value with timestamp
const setCachedValue = (key: string, value: string) => {
  try {
    const item = {
      value,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error('Error caching value:', error);
  }
};

// Loading dots animation component
const LoadingDots = () => {
  return (
    <div className="flex space-x-2 p-2">
      <div className="w-2 h-2 rounded-full bg-black dark:bg-white animate-[loading_0.8s_ease-in-out_infinite]" style={{ animationDelay: '0s' }} />
      <div className="w-2 h-2 rounded-full bg-black dark:bg-white animate-[loading_0.8s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }} />
      <div className="w-2 h-2 rounded-full bg-black dark:bg-white animate-[loading_0.8s_ease-in-out_infinite]" style={{ animationDelay: '0.4s' }} />
    </div>
  );
};

export default function Page() {
  const [isSourcesPanelOpen, setIsSourcesPanelOpen] = useState(true);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [assistantId, setAssistantId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userId] = useState<string>(() => {
    // Generate a random user ID if not exists
    const existingId = localStorage.getItem('userId');
    if (existingId) return existingId;
    const newId = `user_${Math.random().toString(36).substr(2, 8)}`;
    localStorage.setItem('userId', newId);
    return newId;
  });

  // Initialize chat on component mount
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Get cached assistant ID or create new one
        const assistantResponse = await api.post('pdf-chat/create-assistant');
        const currentAssistantId = assistantResponse.data.assistant_id;
        setAssistantId(currentAssistantId);

        try {
          // Try to get existing thread and messages
          const threadResponse = await api.get(`pdf-chat/get-thread/${userId}`);
          if (threadResponse.data.chat_history) {
            // Load existing chat history
            const formattedMessages = threadResponse.data.chat_history.map((msg: any) => ({
              role: msg.role,
              content: msg.content
            }));
            setMessages(formattedMessages);
          }
        } catch (threadError: any) {
          // If thread doesn't exist (404) or other error, create new thread
          if (threadError.response?.status === 404) {
            await api.post('pdf-chat/create-thread', { user_id: userId });
          } else {
            throw threadError; // Re-throw other errors
          }
        }
        setMounted(true);
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast.error('Failed to initialize chat');
      }
    };

    initializeChat();
  }, [userId]);

  // Fetch sources on component mount
  useEffect(() => {
    const fetchSources = async () => {
      try {
        setLoading(true);
        const processedResponse = await api.get('pdf/processed');
        
        // Convert processed PDFs to source format
        const processedSources: Source[] = (processedResponse.data.pdfs || []).map((pdf: any, index: number) => ({
          id: index,
          name: pdf.name,
          type: 'pdf',
          processed: true
        }));
        
        setSources(processedSources);
      } catch (err) {
        console.error('Error fetching sources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSources();
  }, []);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    if (!mounted) {
      toast.error('Chat is still initializing. Please wait...');
      return;
    }
    if (!assistantId) {
      toast.error('Assistant not initialized. Please refresh the page.');
      return;
    }

    // Check if a PDF is selected
    if (!selectedSource?.name) {
      toast.error('Please select a PDF first');
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await api.post('pdf-chat/chat', {
        user_id: userId,
        assistant_id: assistantId,
        message: inputMessage,
        pdf_name: selectedSource.name
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const handleStopResponse = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      toast.success('Response stopped');
    }
  };

  const handleSourceSelect = (source: Source) => {
    setSelectedSource(source);
    // Close sources panel on mobile after selection
    if (window.innerWidth < 768) {
      setIsSourcesPanelOpen(false);
    }
  };

  const filteredSources = useMemo(() => {
    return sources.filter(source => 
      source.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sources, searchQuery]);

  const suggestionQuestions = [
    "Summarize the main points",
    "Compare findings across sources",
    "Extract key statistics",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-screen bg-white-100 dark:bg-black text-black dark:text-white">
      {/* Sidebar */}
      <div
        className={`${
          isSourcesPanelOpen ? "w-80" : "w-0"
        } bg-white-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 overflow-hidden rounded-r-xl`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Sources</h2>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search sources..."
              className="w-full pl-10 pr-4 py-2 bg-white-100 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        <div className="overflow-y-auto h-full p-4">
          {loading ? (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredSources.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              {searchQuery ? 'No matching sources found' : 'No processed PDFs yet'}
            </div>
          ) : (
            filteredSources.map((source) => (
              <div
                key={source.id}
                onClick={() => handleSourceSelect(source)}
                className={`flex items-center justify-between p-3 mb-2 rounded-xl transition-colors cursor-pointer shadow-sm
                  ${
                    selectedSource?.id === source.id
                      ? "bg-gray-100 dark:bg-gray-800"
                      : "bg-white-100 dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
              >
                <div className="flex items-center">
                  <FiFile className="text-black dark:text-white-100 mr-3" />
                  <div className="flex flex-col">
                    <span className="truncate">{source.name}</span>
                    {source.processed && (
                      <span className="text-xs text-green-500">Processed</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
          <button
            onClick={() => setIsSourcesPanelOpen(!isSourcesPanelOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiChevronLeft size={20} className={`transform transition-transform ${isSourcesPanelOpen ? '' : 'rotate-180'}`} />
          </button>
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            onClick={() => toast.success('Refreshed successfully')}
          >
            <FiRefreshCw />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
          {messages.map((message, index) => (
            <div
              key={`message-${index}`}
              className={`mb-4 ${
                message.role === "user" ? "ml-auto" : "mr-auto"
              } max-w-3xl`}
            >
              <div
                className={`p-4 rounded-xl shadow-sm ${
                  message.role === "user"
                    ? "bg-black text-white-100 dark:bg-white-100 dark:text-black"
                    : "bg-white-100 dark:bg-gray-800 text-black dark:text-white-100 border border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold">
                    {message.role === "user" ? "You" : "Assistant"}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="mr-auto max-w-3xl">
              <div className="bg-white-100 dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold">Assistant</span>
                </div>
                <LoadingDots />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} /> {/* Scroll anchor */}
        </div>

        {/* Bottom Bar */}
        <div className="bg-white-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {suggestionQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors whitespace-nowrap shadow-sm"
              >
                {question}
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Ask a question about your sources..."
              className="flex-1 p-3 bg-white-100 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading}
            />
            <button
              onClick={isLoading ? handleStopResponse : handleSendMessage}
              className={`px-6 rounded-xl transition-colors flex items-center justify-center shadow-sm ${
                isLoading 
                  ? 'bg-red-600 hover:bg-red-700 text-white-100'
                  : 'bg-black dark:bg-white-100 text-white-100 dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
              }`}
              disabled={!inputMessage.trim() && !isLoading}
            >
              {isLoading ? (
                <FiX size={20} />
              ) : (
                <FiSend size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}