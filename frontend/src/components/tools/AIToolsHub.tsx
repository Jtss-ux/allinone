'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PhotoEffects from './PhotoEffects';
import { Sliders, Film, Image as ImageIcon, Scissors, Mic, Lock, Zap, Gift } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function AIToolsHub() {
  const [activeTab, setActiveTab] = useState('effects');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-8">
          <h2 className="text-4xl font-bold mb-2 flex items-center"><Sliders className="w-10 h-10 mr-4" /> AI Tools Hub</h2>
          <p className="text-gray-300 text-lg">All your AI tools in one place - Generate, Edit, Enhance</p>
        </div>

        {/* Quick Access Grid */}
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Access</h3>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <motion.a variants={item} href="#effects" className="p-6 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl hover:scale-105 transition">
              <div className="mb-2"><Film className="w-8 h-8" /></div>
              <div className="font-bold">Film Effects</div>
              <div className="text-sm opacity-80">Grain, vintage, cinematic</div>
            </motion.a>
            <motion.a variants={item} href="#generate" className="p-6 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl hover:scale-105 transition">
              <div className="mb-2"><ImageIcon className="w-8 h-8" /></div>
              <div className="font-bold">Image Gen</div>
              <div className="text-sm opacity-80">Text to image</div>
            </motion.a>
            <motion.a variants={item} href="#edit" className="p-6 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl hover:scale-105 transition">
              <div className="mb-2"><Scissors className="w-8 h-8" /></div>
              <div className="font-bold">Background</div>
              <div className="text-sm opacity-80">Remove, change</div>
            </motion.a>
            <motion.a variants={item} href="#audio" className="p-6 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl hover:scale-105 transition">
              <div className="mb-2"><Mic className="w-8 h-8" /></div>
              <div className="font-bold">Voice AI</div>
              <div className="text-sm opacity-80">TTS, voiceover</div>
            </motion.a>
          </motion.div>
        </div>

        {/* Tool Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 space-y-8"
          id="effects"
        >
          <div>
            <h3 className="text-2xl font-bold mb-4 flex items-center"><Film className="w-6 h-6 mr-3" /> Photo Effects (Like Grainrad)</h3>
            <PhotoEffects />
          </div>
        </motion.div>

        {/* Info Section */}
        <div className="p-6 bg-gray-700">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4">
              <div className="mb-2 flex justify-center"><Lock className="w-8 h-8 text-green-400" /></div>
              <div className="font-semibold">100% Private</div>
              <div className="text-sm text-gray-400">Your photos never leave your device</div>
            </div>
            <div className="p-4">
              <div className="mb-2 flex justify-center"><Zap className="w-8 h-8 text-yellow-400" /></div>
              <div className="font-semibold">Fast Processing</div>
              <div className="text-sm text-gray-400">AI-powered in seconds</div>
            </div>
            <div className="p-4">
              <div className="mb-2 flex justify-center"><Gift className="w-8 h-8 text-pink-400" /></div>
              <div className="font-semibold">Free Forever</div>
              <div className="text-sm text-gray-400">No watermarks, unlimited use</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
