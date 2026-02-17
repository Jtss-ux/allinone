'use client';

import React from 'react';

interface SidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ currentSection, onSectionChange }: SidebarProps) {
  const sections = [
    {
      category: 'IMAGE',
      tools: [
        { id: 'ai-tools-hub', label: 'AI Tools Hub 🚀', icon: '🎛️' },
        { id: 'photo-effects', label: 'Film Effects', icon: '🎞️' },
        { id: 'image-generator', label: 'Image Generator', icon: '🎨' },
        { id: 'image-editor', label: 'Image Editor', icon: '✏️' },
        { id: 'image-upscaler', label: 'Image Upscaler', icon: '📈' },
        { id: 'image-extender', label: 'Image Extender', icon: '➕' },
        { id: 'variations', label: 'Variations', icon: '✨' },
        { id: 'bg-remover', label: 'Background Remover', icon: '🎯' },
        { id: 'skin-enhancer', label: 'Skin Enhancer', icon: '💄' },
        { id: 'photo-editor', label: 'Photo Editor', icon: '📸' },
        { id: 'meme-generator', label: 'Meme Generator 🧠', icon: '🧠' },
        { id: 'image-tool', label: 'Image Tools 🛠️', icon: '🛠️' },
        { id: 'file-converter', label: 'File Converter 🔄', icon: '🔄' },
        { id: 'text-handwriting', label: 'Text to Handwriting ✍️', icon: '✍️' },
      ],
    },
    {
      category: 'VIDEO',
      tools: [
        { id: 'video-generator', label: 'Video Generator 🚀', icon: '🎬' },
        { id: 'video-editor', label: 'Video Project Editor', icon: '🎞️' },
        { id: 'clip-editor', label: 'Clip Editor', icon: '✂️' },
        { id: 'video-upscaler', label: 'Video Upscaler', icon: '📺' },
        { id: 'lip-sync', label: 'Lip Sync', icon: '👄' },
      ],
    },
    {
      category: 'STREAMING',
      tools: [
        { id: 'iptv-player', label: 'IPTV Player 📺', icon: '📺' },
      ],
    },
    {
      category: 'AUDIO',
      tools: [
        { id: 'voice-generator', label: 'Voice Generator 🚀', icon: '🎤' },
        { id: 'sound-effects', label: 'Sound Effect Generator', icon: '🔊' },
        { id: 'music-generator', label: 'Music Generator', icon: '🎵' },
      ],
    },
    {
      category: 'UTILITIES',
      tools: [
        { id: 'calculator', label: 'Calculator 🧮', icon: '🧮' },
        { id: 'unit-converter', label: 'Unit Converter 📏', icon: '📏' },
        { id: 'color-tools', label: 'Color Tools 🎨', icon: '🎨' },
        { id: 'qr-code', label: 'QR Code Generator 📱', icon: '📱' },
        { id: 'developer-tools', label: 'Developer Tools ⚙️', icon: '⚙️' },
        { id: 'pomodoro', label: 'Pomodoro Timer ⏱️', icon: '⏱️' },
        { id: 'file-converter', label: 'File Converter 🔄', icon: '🔄' },
        { id: 'text-handwriting', label: 'Text to Handwriting ✍️', icon: '✍️' },
        { id: 'password-generator', label: 'Password Generator 🔐', icon: '🔐' },
        { id: 'lorem-ipsum', label: 'Lorem Ipsum 📝', icon: '📝' },
        { id: 'regex-tester', label: 'Regex Tester 🔍', icon: '🔍' },
      ],
    },
    {
      category: 'PRODUCTIVITY',
      tools: [
        { id: 'pdf-tools', label: 'PDF Tools 📄', icon: '📄' },
        { id: 'screen-recorder', label: 'Screen Recorder 🎥', icon: '🎥' },
        { id: 'whiteboard', label: 'Whiteboard 🎨', icon: '🎨' },
        { id: 'pomodoro', label: 'Pomodoro Timer ⏱️', icon: '⏱️' },
        { id: 'world-clock', label: 'World Clock 🌍', icon: '🌍' },
        { id: 'notes', label: 'Notes 📝', icon: '📝' },
        { id: 'calendar', label: 'Calendar 📅', icon: '📅' },
      ],
    },
    {
      category: 'GAMES',
      tools: [
        { id: 'games-hub', label: 'Games Hub 🎮', icon: '🎮' },
        { id: 'chess', label: 'Chess ♟️', icon: '♟️' },
        { id: 'snake', label: 'Snake 🐍', icon: '🐍' },
        { id: 'tetris', label: 'Tetris 🧱', icon: '🧱' },
        { id: 'game-2048', label: '2048 🔢', icon: '🔢' },
      ],
    },
    {
      category: 'AI ASSISTANT',
      tools: [
        { id: 'jarvis', label: 'J.A.R.V.I.S. 🤖', icon: '🤖' },
      ],
    },
    {
      category: 'OTHERS',
      tools: [
        { id: 'spaces', label: 'Spaces', icon: '🌐' },
        { id: 'design-editor', label: 'Design Editor', icon: '🖌️' },
        { id: 'mockup-generator', label: 'Mockup Generator', icon: '📱' },
        { id: 'icon-generator', label: 'Icon Generator', icon: '🔷' },
        { id: 'change-camera', label: 'Change Camera', icon: '📷' },
        { id: 'sketch-to-image', label: 'Sketch to Image', icon: '🎨' },
        { id: 'meme-generator', label: 'Meme Generator 🧠', icon: '🧠' },
        { id: 'image-tool', label: 'Image Tools 🛠️', icon: '🛠️' },
      ],
    },
  ];

  return (
    <div className="w-64 bg-gray-950 border-r border-gray-800 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-green-500">AI Studio</h1>
        <p className="text-gray-400 text-sm mt-1">Create with AI</p>
      </div>

      {sections.map((section) => (
        <div key={section.category} className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 mb-3">
            {section.category}
          </h3>
          <div className="space-y-1">
            {section.tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onSectionChange(tool.id)}
                className={`w-full text-left px-6 py-3 text-sm font-medium transition ${
                  currentSection === tool.id
                    ? 'bg-green-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="mr-3">{tool.icon}</span>
                {tool.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
