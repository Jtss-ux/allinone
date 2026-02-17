'use client';

import React from 'react';

export default function ClipEditor() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">✂️</div>
          <h3 className="text-xl font-semibold">Clip Editor</h3>
        </div>
        
        <div className="p-6 bg-yellow-900/30 border border-yellow-700 rounded-lg mb-4">
          <h4 className="font-semibold text-yellow-400 mb-2">⚠️ Requires GPU</h4>
          <p className="text-gray-300 text-sm">
            Video clip editing requires GPU acceleration for real-time processing.
          </p>
        </div>

        <div className="p-4 bg-gray-700 rounded-lg">
          <h4 className="font-semibold mb-2">Features:</h4>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Cut and trim clips</li>
            <li>• Join multiple clips</li>
            <li>• Add transitions</li>
            <li>• Apply effects</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
