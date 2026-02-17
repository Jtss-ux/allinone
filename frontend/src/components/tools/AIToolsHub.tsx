'use client';

import React, { useState } from 'react';
import PhotoEffects from './PhotoEffects';

export default function AIToolsHub() {
  const [activeTab, setActiveTab] = useState('effects');

  const toolCategories = [
    { id: 'effects', label: 'Photo Effects', icon: '🎨', desc: 'Film grain, vintage, cinematic' },
    { id: 'generate', label: 'AI Generate', icon: '🤖', desc: 'Text to image, sketches' },
    { id: 'edit', label: 'AI Edit', icon: '✏️', desc: 'Remove bg, enhance, upscale' },
    { id: 'audio', label: 'AI Audio', icon: '🔊', desc: 'Voice, music, sounds' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-8">
          <h2 className="text-4xl font-bold mb-2">🎛️ AI Tools Hub</h2>
          <p className="text-gray-300 text-lg">All your AI tools in one place - Generate, Edit, Enhance</p>
        </div>

        {/* Quick Access Grid */}
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Access</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="#effects" className="p-6 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl hover:scale-105 transition">
              <div className="text-3xl mb-2">🎞️</div>
              <div className="font-bold">Film Effects</div>
              <div className="text-sm opacity-80">Grain, vintage, cinematic</div>
            </a>
            <a href="#generate" className="p-6 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl hover:scale-105 transition">
              <div className="text-3xl mb-2">🖼️</div>
              <div className="font-bold">Image Gen</div>
              <div className="text-sm opacity-80">Text to image</div>
            </a>
            <a href="#edit" className="p-6 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl hover:scale-105 transition">
              <div className="text-3xl mb-2">✂️</div>
              <div className="font-bold">Background</div>
              <div className="text-sm opacity-80">Remove, change</div>
            </a>
            <a href="#audio" className="p-6 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl hover:scale-105 transition">
              <div className="text-3xl mb-2">🎤</div>
              <div className="font-bold">Voice AI</div>
              <div className="text-sm opacity-80">TTS, voiceover</div>
            </a>
          </div>
        </div>

        {/* Tool Sections */}
        <div className="p-6 space-y-8" id="effects">
          <div>
            <h3 className="text-2xl font-bold mb-4">🎞️ Photo Effects (Like Grainrad)</h3>
            <PhotoEffects />
          </div>
        </div>

        {/* Info Section */}
        <div className="p-6 bg-gray-700">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4">
              <div className="text-3xl mb-2">🔒</div>
              <div className="font-semibold">100% Private</div>
              <div className="text-sm text-gray-400">Your photos never leave your device</div>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">⚡</div>
              <div className="font-semibold">Fast Processing</div>
              <div className="text-sm text-gray-400">AI-powered in seconds</div>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">🎁</div>
              <div className="font-semibold">Free Forever</div>
              <div className="text-sm text-gray-400">No watermarks, unlimited use</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
