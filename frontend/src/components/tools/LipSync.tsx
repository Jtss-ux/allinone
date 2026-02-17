'use client';

import React from 'react';

export default function LipSync() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">👄</div>
          <h3 className="text-xl font-semibold">Lip Sync</h3>
        </div>
        
        <div className="p-6 bg-yellow-900/30 border border-yellow-700 rounded-lg mb-4">
          <h4 className="font-semibold text-yellow-400 mb-2">⚠️ Requires GPU</h4>
          <p className="text-gray-300 text-sm">
            Lip syncing uses specialized AI models (like Wav2Lip) that require GPU acceleration.
          </p>
        </div>

        <div className="p-4 bg-gray-700 rounded-lg">
          <h4 className="font-semibold mb-2">How it works:</h4>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Upload a video of a person</li>
            <li>• Add audio or voiceover</li>
            <li>• AI syncs the lip movements to match the audio</li>
            <li>• Perfect for dubbing, translations, and content creation</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
          <p className="text-sm text-gray-300">
            💡 <strong>Alternative:</strong> Try our Voice Generator to create audio, then use lip sync once you have a GPU!
          </p>
        </div>
      </div>
    </div>
  );
}
