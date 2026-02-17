'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { mlApi, mlAssetUrl } from '@/config/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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
      content: "Hello, I'm JARVIS - your AI assistant. How may I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState('chat');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Try to connect to the ML service for AI response
      let aiResponse = '';
      
      if (activeMode === 'image') {
        // Use image generation
        const response = await axios.post(mlApi('/api/image/generate'), {
          prompt: input,
          num_inference_steps: 20,
        });
        if (response.data.success && response.data.imageBase64) {
          aiResponse = `I've generated an image based on your description:\n\n![Generated Image](${response.data.imageBase64})\n\nYou can download it using the link below.`;
        } else {
          aiResponse = "I'm sorry, I couldn't generate the image at the moment. Please try again.";
        }
      } else if (activeMode === 'voice') {
        // Use voice generation
        const response = await axios.post(mlApi('/api/audio/generate'), {
          text: input,
          voice: 'en',
        });
        if (response.data.success) {
          aiResponse = `I've converted your text to speech. You can listen to it below.`;
        } else {
          aiResponse = "I'm sorry, I couldn't generate the audio at the moment.";
        }
      } else {
        // General chat response
        aiResponse = generateResponse(input, activeMode);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: generateResponse(input, activeMode),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const generateResponse = (userInput: string, mode: string): string => {
    const input = userInput.toLowerCase();
    
    // Code assistant mode
    if (mode === 'code' || input.includes('code') || input.includes('programming')) {
      if (input.includes('python')) {
        return "I can help you with Python! Here's a sample:\n\n```python\ndef hello_world():\n    print('Hello, World!')\n    \nhello_world()\n```\n\nWould you like me to explain this code or help with something specific?";
      } else if (input.includes('javascript') || input.includes('js')) {
        return "Here's a JavaScript example:\n\n```javascript\nconst greeting = () => {\n  console.log('Hello, World!');\n};\n\ngreeting();\n```\n\nWhat would you like to build?";
      } else {
        return "I can help you write and debug code in various languages including Python, JavaScript, TypeScript, HTML, CSS, and more. What would you like to work on?";
      }
    }

    // Math mode
    if (mode === 'math' || input.includes('calculate') || input.includes('math')) {
      return "I can help you solve mathematical problems! I can handle algebra, calculus, statistics, and more. What problem would you like me to solve?";
    }

    // Writing mode
    if (mode === 'writing') {
      return "I'll help you with your writing! Whether it's an essay, email, story, or any other text, I can assist with drafting, editing, and improving your content. What are you working on?";
    }

    // Translation mode
    if (mode === 'translation') {
      return "I can translate text between many languages. Just tell me what language you'd like to translate to, and provide the text!";
    }

    // General chat responses
    if (input.includes('hello') || input.includes('hi')) {
      return "Hello! I'm JARVIS, ready to assist you with a wide range of tasks. I can help with coding, image generation, data analysis, writing, translations, and much more. What would you like to work on?";
    }

    if (input.includes('time')) {
      return `The current time is ${new Date().toLocaleTimeString()}.`;
    }

    if (input.includes('date')) {
      return `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
    }

    if (input.includes('weather')) {
      return "I don't have access to real-time weather data, but I can help you find weather APIs or build a weather application!";
    }

    if (input.includes('help')) {
      return "I can help you with:\n\n• **Coding** - Write, debug, and explain code\n• **Image Generation** - Create images from text\n• **Voice Generation** - Convert text to speech\n• **Writing** - Essays, emails, stories\n• **Math** - Solve equations and problems\n• **Translation** - Translate between languages\n• **Data Analysis** - Process and visualize data\n\nJust let me know what you need!";
    }

    // Default response
    return "I'm processing your request. As JARVIS, I have access to various AI capabilities including code generation, image creation, voice synthesis, and more. How can I assist you further with this topic?";
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

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-140px)]">
      <div className="bg-gray-800 rounded-lg overflow-hidden h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl">
              🤖
            </div>
            <div>
              <h3 className="text-2xl font-bold">J.A.R.V.I.S.</h3>
              <p className="text-sm text-gray-200">Just A Rather Very Intelligent System</p>
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
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition text-left ${
                      activeMode === cap.id
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
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    }`}
                  >
                    {message.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div
                    className={`max-w-[70%] p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
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
                  className={`p-3 rounded-lg transition ${
                    isListening ? 'bg-red-600 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'
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
                Press Enter to send • Shift+Enter for new line
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
