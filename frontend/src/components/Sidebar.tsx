'use client';

import React, { useState } from 'react';
import {
  Rocket, Film, Palette, Edit2, TrendingUp, Plus, Sparkles, Target, Highlighter,
  Camera, Brain, Wrench, RefreshCw, PenTool, Video, Scissors, Tv, Mic, Volume2,
  Music, Calculator, Ruler, Smartphone, Settings, Timer, Lock, FileText, Search,
  Globe, Keyboard, Image as ImageIcon, Clipboard, Clock, ShieldCheck, Gamepad2,
  Bot, Mail, BarChart, Hash, BookOpen, Layers, LayoutTemplate, Box, Server, Eye, Youtube,
  X
} from 'lucide-react';

interface SidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ currentSection, onSectionChange }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    {
      category: 'IMAGE',
      tools: [
        { id: 'photo-effects', label: 'Film Effects', icon: <Film className="w-5 h-5" /> },
        { id: 'image-generator', label: 'Image Generator', icon: <Palette className="w-5 h-5" /> },
        { id: 'image-editor', label: 'Image Editor', icon: <Edit2 className="w-5 h-5" /> },
        { id: 'image-upscaler', label: 'Image Upscaler', icon: <TrendingUp className="w-5 h-5" /> },
        { id: 'image-analyzer', label: 'AI Vision Analyzer', icon: <Eye className="w-5 h-5 text-violet-400" /> },
        { id: 'image-extender', label: 'Image Extender', icon: <Plus className="w-5 h-5" /> },
        { id: 'variations', label: 'Variations', icon: <Sparkles className="w-5 h-5" /> },
        { id: 'bg-remover', label: 'Background Remover', icon: <Target className="w-5 h-5" /> },
        { id: 'skin-enhancer', label: 'Skin Enhancer', icon: <Highlighter className="w-5 h-5" /> },
        { id: 'photo-editor', label: 'Photo Editor', icon: <Camera className="w-5 h-5" /> },
        { id: 'meme-generator', label: 'Meme Generator', icon: <Brain className="w-5 h-5" /> },
        { id: 'image-tool', label: 'Image Tools', icon: <Wrench className="w-5 h-5" /> },
        { id: 'file-converter', label: 'File Converter', icon: <RefreshCw className="w-5 h-5" /> },
        { id: 'text-handwriting', label: 'Text to Handwriting', icon: <PenTool className="w-5 h-5" /> },
      ],
    },
    {
      category: 'VIDEO',
      tools: [
        { id: 'video-generator', label: 'Video Generator', icon: <Video className="w-5 h-5" /> },
        { id: 'video-editor', label: 'Video Project Editor', icon: <Film className="w-5 h-5" /> },
        { id: 'clip-editor', label: 'Clip Editor', icon: <Scissors className="w-5 h-5" /> },
        { id: 'video-upscaler', label: 'Video Upscaler', icon: <Tv className="w-5 h-5" /> },
      ],
    },
    {
      category: 'STREAMING',
      tools: [
        { id: 'iptv-player', label: 'IPTV Player', icon: <Tv className="w-5 h-5" /> },
      ],
    },
    {
      category: 'AUDIO',
      tools: [
        { id: 'voice-generator', label: 'Voice Generator', icon: <Mic className="w-5 h-5" /> },
        { id: 'sound-effects', label: 'Sound Effect Generator', icon: <Volume2 className="w-5 h-5" /> },
        { id: 'music-generator', label: 'Music Generator', icon: <Music className="w-5 h-5" /> },
      ],
    },
    {
      category: 'UTILITIES',
      tools: [
        { id: 'calculator', label: 'Calculator', icon: <Calculator className="w-5 h-5" /> },
        { id: 'unit-converter', label: 'Unit Converter', icon: <Ruler className="w-5 h-5" /> },
        { id: 'color-tools', label: 'Color Tools', icon: <Palette className="w-5 h-5" /> },
        { id: 'qr-code', label: 'QR Code Generator', icon: <Smartphone className="w-5 h-5" /> },
        { id: 'developer-tools', label: 'Developer Tools', icon: <Settings className="w-5 h-5" /> },
        { id: 'pomodoro', label: 'Pomodoro Timer', icon: <Timer className="w-5 h-5" /> },
        { id: 'password-generator', label: 'Password Generator', icon: <Lock className="w-5 h-5" /> },
        { id: 'lorem-ipsum', label: 'Lorem Ipsum', icon: <FileText className="w-5 h-5" /> },
        { id: 'regex-tester', label: 'Regex Tester', icon: <Search className="w-5 h-5" /> },
        { id: 'markdown-editor', label: 'Markdown Editor', icon: <FileText className="w-5 h-5" /> },
        { id: 'translator', label: 'Translator', icon: <Globe className="w-5 h-5" /> },
        { id: 'css-gradient', label: 'CSS Gradient', icon: <Palette className="w-5 h-5" /> },
        { id: 'typing-test', label: 'Typing Test', icon: <Keyboard className="w-5 h-5" /> },
        { id: 'cyberchef', label: 'CyberChef', icon: <Wrench className="w-5 h-5" /> },
        { id: 'text-diff', label: 'Text Diff', icon: <FileText className="w-5 h-5" /> },
        { id: 'speed-test', label: 'Speed Test', icon: <Globe className="w-5 h-5" /> },
        { id: 'pastebin', label: 'Pastebin', icon: <Clipboard className="w-5 h-5" /> },
        { id: 'wayback-machine', label: 'Wayback Machine', icon: <Clock className="w-5 h-5" /> },
        { id: 'exif-viewer', label: 'EXIF Viewer', icon: <Camera className="w-5 h-5" /> },
        { id: 'breach-checker', label: 'Breach Checker', icon: <ShieldCheck className="w-5 h-5" /> },
      ],
    },
    {
      category: 'PRODUCTIVITY',
      tools: [
        { id: 'pdf-tools', label: 'PDF Tools', icon: <FileText className="w-5 h-5" /> },
        { id: 'whiteboard', label: 'Whiteboard', icon: <Edit2 className="w-5 h-5" /> },
        { id: 'world-clock', label: 'World Clock', icon: <Globe className="w-5 h-5" /> },
        { id: 'notes', label: 'Notes', icon: <FileText className="w-5 h-5" /> },
      ],
    },
    {
      category: 'GAMES',
      tools: [
        { id: 'chess', label: 'Chess', icon: <Gamepad2 className="w-5 h-5" /> },
        { id: 'snake', label: 'Snake', icon: <Gamepad2 className="w-5 h-5" /> },
        { id: 'tetris', label: 'Tetris', icon: <Gamepad2 className="w-5 h-5" /> },
        { id: 'game-2048', label: '2048', icon: <Gamepad2 className="w-5 h-5" /> },
        { id: 'game-2048', label: '2048', icon: <Gamepad2 className="w-5 h-5" /> },
      ],
    },
    {
      category: 'AI ASSISTANT',
      tools: [
        { id: 'jarvis', label: 'J.A.R.V.I.S.', icon: <Bot className="w-5 h-5" /> },
        { id: 'code-generator', label: 'Code Generator', icon: <FileText className="w-5 h-5" /> },
        { id: 'ai-writer', label: 'AI Writer', icon: <PenTool className="w-5 h-5" /> },
        { id: 'email-writer', label: 'Email Writer', icon: <Mail className="w-5 h-5" /> },
        { id: 'ppt-generator', label: 'PPT Generator', icon: <BarChart className="w-5 h-5" /> },
        { id: 'youtube-summarizer', label: 'YouTube Summarizer', icon: <Youtube className="w-5 h-5 text-red-500" /> },
        { id: 'hashtag-generator', label: 'Hashtag Generator', icon: <Hash className="w-5 h-5" /> },
        { id: 'social-post', label: 'Social Post Writer', icon: <Smartphone className="w-5 h-5" /> },
        { id: 'seo-generator', label: 'SEO Meta Generator', icon: <Search className="w-5 h-5" /> },
        { id: 'story-writer', label: 'Story Writer', icon: <BookOpen className="w-5 h-5" /> },
        { id: 'resume-builder', label: 'Resume Builder', icon: <FileText className="w-5 h-5" /> },
      ],
    },
    {
      category: 'OTHERS',
      tools: [
        { id: 'spaces', label: 'Spaces', icon: <Layers className="w-5 h-5" /> },
        { id: 'design-editor', label: 'Design Editor', icon: <LayoutTemplate className="w-5 h-5" /> },
        { id: 'mockup-generator', label: 'Mockup Generator', icon: <Smartphone className="w-5 h-5" /> },
        { id: 'icon-generator', label: 'Icon Generator', icon: <Box className="w-5 h-5" /> },
        { id: 'change-camera', label: 'Change Camera', icon: <Camera className="w-5 h-5" /> },
        { id: 'logo-generator', label: 'Logo Generator', icon: <Palette className="w-5 h-5" /> },
        { id: 'image-compressor', label: 'Image Compressor', icon: <ImageIcon className="w-5 h-5" /> },
      ],
    },
    {
      category: 'AI DIRECTORY',
      tools: [
        { id: 'awesome-llm-apps', label: 'Awesome LLM Apps', icon: <Layers className="w-5 h-5" /> },
      ],
    },
  ];

  const filteredSections = sections
    .map(section => ({
      ...section,
      tools: section.tools.filter(tool =>
        tool.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }))
    .filter(section => section.tools.length > 0);

  return (
    <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col h-full">
      <div className="p-6 border-b border-gray-900">
        <h1 className="text-2xl font-bold text-green-500">AI Studio</h1>
        <p className="text-gray-400 text-sm mt-1">Create with AI</p>
      </div>

      <div className="px-4 py-3 border-b border-gray-900 bg-gray-950/50">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-green-500 transition-colors" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 text-gray-200 text-xs rounded-lg pl-9 pr-8 py-2.5 border border-gray-800 focus:outline-none focus:border-green-500 transition-all font-medium placeholder:text-gray-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-800 rounded-md text-gray-500 hover:text-white transition-all underline decoration-dotted underline-offset-4"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="py-4">
          {filteredSections.map((section) => (
            <div key={section.category} className="mb-6 last:mb-0">
              <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] px-6 mb-3">
                {section.category}
              </h3>
              <div className="space-y-0.5">
                {section.tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => onSectionChange(tool.id)}
                    className={`w-full flex items-center px-6 py-2.5 text-sm font-semibold transition-all group ${currentSection === tool.id
                      ? 'bg-green-600/10 text-green-400 border-r-4 border-green-500'
                      : 'text-gray-400 hover:text-white hover:bg-gray-900'
                      }`}
                  >
                    <div className={`mr-3 transition-colors ${currentSection === tool.id ? 'text-green-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                      {tool.icon}
                    </div>
                    <span className="truncate">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {filteredSections.length === 0 && (
            <div className="px-6 py-10 text-center">
              <p className="text-gray-600 text-xs font-medium">No tools found for "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-[10px] font-bold text-green-500 uppercase tracking-widest hover:text-green-400 transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
