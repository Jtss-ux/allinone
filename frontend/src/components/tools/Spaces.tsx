'use client';

import React from 'react';

export default function Spaces() {
  const features = [
    { icon: '🎨', title: 'Image Generation', desc: 'Create stunning images from text descriptions' },
    { icon: '🎬', title: 'Video Generation', desc: 'Generate videos from prompts (GPU required)' },
    { icon: '🔊', title: 'Audio & Music', desc: 'Create voiceovers and background music' },
    { icon: '✨', title: 'Image Editing', desc: 'Transform, enhance, and edit your images' },
    { icon: '📱', title: 'Mockups', desc: 'Create product mockups instantly' },
    { icon: '🎤', title: 'Voice Synthesis', desc: 'Convert text to natural speech' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8">
        <h3 className="text-2xl font-semibold mb-2">AI Content Studio</h3>
        <p className="text-gray-400 mb-6">Your all-in-one AI content generation platform</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="p-4 bg-gray-700 rounded-lg text-center hover:bg-gray-600 transition cursor-pointer">
              <div className="text-3xl mb-2">{feature.icon}</div>
              <h4 className="font-semibold text-white">{feature.title}</h4>
              <p className="text-xs text-gray-400 mt-1">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-green-900/30 border border-green-700 rounded-lg">
          <h4 className="font-semibold text-green-400 mb-2">🚀 Ready to Use</h4>
          <p className="text-sm text-gray-300">
            All AI tools are available and ready to generate content. 
            Select a tool from the sidebar to get started!
          </p>
        </div>

        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
          <h4 className="font-semibold mb-2">📊 System Status</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">ML Service:</span>
              <span className="text-green-500 ml-2">● Running</span>
            </div>
            <div>
              <span className="text-gray-400">Backend:</span>
              <span className="text-green-500 ml-2">● Running</span>
            </div>
            <div>
              <span className="text-gray-400">Device:</span>
              <span className="text-yellow-500 ml-2">CPU Mode</span>
            </div>
            <div>
              <span className="text-gray-400">Models:</span>
              <span className="text-green-500 ml-2">Loaded</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
