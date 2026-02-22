'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
}

interface JarvisCapability {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const capabilities: JarvisCapability[] = [
  { id: 'chat', name: 'General Chat', icon: '💬', description: 'Answer questions and have conversations' },
  { id: 'code', name: 'Code Assistant', icon: '💻', description: 'Write, debug, and explain code' },
  { id: 'image', name: 'Image Generation', icon: '🎨', description: 'Create images from descriptions' },
  { id: 'voice', name: 'Voice Mode', icon: '🎤', description: 'Talk to me using voice' },
  { id: 'analysis', name: 'Data Analysis', icon: '📊', description: 'Analyze data and create visualizations' },
  { id: 'writing', name: 'Writing Assistant', icon: '✍️', description: 'Help with writing and editing' },
  { id: 'translation', name: 'Translator', icon: '🌐', description: 'Translate between languages' },
  { id: 'math', name: 'Math Solver', icon: '🔢', description: 'Solve mathematical problems' },
];

export default function JarvisAI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello, I'm JARVIS — your AI assistant powered by multiple AI models. How may I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState('chat');
  const [isListening, setIsListening] = useState(false);
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch available models on mount
  useEffect(() => {
    axios.get(backendApi('/api/models'))
      .then(res => {
        if (res.data.models) {
          setModels(res.data.models);
          if (res.data.models.length > 0) {
            setSelectedModel(res.data.models[0].id);
          }
        }
      })
      .catch(() => {
        // Fallback — always show Pollinations
        setModels([{ id: 'pollinations-openai', name: 'Free AI (Pollinations)', provider: 'pollinations' }]);
        setSelectedModel('pollinations-openai');
      });
  }, []);

  const buildSystemPrompt = (): string => {
    const modePrompts: Record<string, string> = {
      chat: 'You are JARVIS, a highly capable AI assistant. Provide clear, detailed, helpful responses.',
      code: 'You are JARVIS, an expert programming assistant. Write clean, well-commented code. When generating code, wrap it in markdown code blocks with the language specified.',
      analysis: 'You are JARVIS, a data analysis expert. Help analyze data, explain statistics, and suggest visualizations.',
      writing: 'You are JARVIS, a professional writing assistant. Help with drafting, editing, and improving written content.',
      translation: 'You are JARVIS, a professional translator. Translate text accurately while preserving meaning and tone.',
      math: 'You are JARVIS, a mathematics expert. Solve problems step by step, showing your work clearly.',
    };
    return modePrompts[activeMode] || modePrompts.chat;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);

    try {
      let aiResponse = '';

      if (activeMode === 'image') {
        // Use image generation endpoint
        const response = await axios.post(backendApi('/api/image/generate'), {
          prompt: userInput,
          num_inference_steps: 20,
        });
        if (response.data.success && response.data.imageUrl) {
          aiResponse = `I've generated an image based on your description. Here it is:\n\n[Image generated successfully — provider: ${response.data.provider || 'unknown'}]`;
          // Could render the image separately
        } else {
          aiResponse = "I couldn't generate the image right now. Please try again.";
        }
      } else if (activeMode === 'voice') {
        // Text-to-speech
        const response = await axios.post(backendApi('/api/audio/generate'), {
          text: userInput,
          voice: 'alloy',
        });
        if (response.data.success) {
          aiResponse = `I've converted your text to speech using ${response.data.provider || 'TTS'}. You can listen to the audio above.`;
        } else {
          aiResponse = "I couldn't generate the audio right now. Please try again.";
        }
      } else if (activeMode === 'translation') {
        // Use translation endpoint
        const response = await axios.post(backendApi('/api/translate'), {
          text: userInput,
          sourceLang: 'auto',
          targetLang: 'es',
        });
        if (response.data.success) {
          aiResponse = `**Translation (${response.data.provider}):**\n\n${response.data.translatedText}`;
        } else {
          aiResponse = "Translation failed. Please try again.";
        }
      } else {
        // General chat — use the real backend with selected model
        const chatMessages = [
          { role: 'system', content: buildSystemPrompt() },
          ...messages.filter(m => m.role === 'user' || m.role === 'assistant').slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
          { role: 'user', content: userInput },
        ];

        const response = await axios.post(backendApi('/api/chat'), {
          message: userInput,
          model: selectedModel,
          messages: chatMessages,
        });

        if (response.data.success) {
          const providerTag = response.data.provider ? `\n\n_— via ${response.data.provider}${response.data.model ? ` (${response.data.model})` : ''}_` : '';
          aiResponse = response.data.response + providerTag;
        } else {
          aiResponse = "I couldn't process your request. Please try again.";
        }
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      // Offline fallback
      const errorMessage: Message = {
        role: 'assistant',
        content: `⚠️ Could not reach the AI backend. Error: ${error.message || 'Connection failed'}. Please check that the backend is running.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognition.start();
    } else {
      alert('Voice recognition is not supported in your browser.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared. How can I help you?",
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-140px)]">
      <div className="bg-gray-800 rounded-lg overflow-hidden h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl">
                🤖
              </div>
              <div>
                <h3 className="text-2xl font-bold">J.A.R.V.I.S.</h3>
                <p className="text-sm text-gray-200">Just A Rather Very Intelligent System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Model selector */}
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-blue-700 text-white text-sm rounded px-2 py-1.5 border border-blue-500 focus:outline-none"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <button
                onClick={clearChat}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 rounded text-sm transition"
                title="Clear chat"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Capabilities */}
          <div className="w-64 bg-gray-900 border-r border-gray-700 overflow-y-auto hidden md:block">
            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                Capabilities
              </h4>
              <div className="space-y-1">
                {capabilities.map((cap) => (
                  <button
                    key={cap.id}
                    onClick={() => setActiveMode(cap.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition text-left ${activeMode === cap.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                      }`}
                  >
                    <span className="text-xl">{cap.icon}</span>
                    <div>
                      <div className="font-medium">{cap.name}</div>
                      <div className="text-xs opacity-70">{cap.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${message.role === 'user'
                      ? 'bg-blue-600'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      }`}
                  >
                    {message.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div
                    className={`max-w-[70%] p-4 rounded-2xl ${message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                      }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{message.content}</div>
                    <div className="text-xs opacity-50 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-lg">
                    🤖
                  </div>
                  <div className="bg-gray-700 p-4 rounded-2xl">
                    <div className="flex gap-2">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-700 bg-gray-800">
              <div className="flex gap-2">
                <button
                  onClick={startVoiceRecognition}
                  className={`p-3 rounded-lg transition ${isListening ? 'bg-red-600 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  title="Voice Input"
                >
                  {isListening ? '🔴' : '🎤'}
                </button>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message JARVIS... (${capabilities.find(c => c.id === activeMode)?.name} mode)`}
                  className="flex-1 p-3 bg-gray-700 text-white rounded-lg resize-none h-12 max-h-32"
                  rows={1}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold transition"
                >
                  Send
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send • Shift+Enter for new line • Model: {models.find(m => m.id === selectedModel)?.name || 'Auto'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
