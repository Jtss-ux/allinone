'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { mlApi, mlAssetUrl } from '@/config/api';

export default function SoundEffects() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please describe the sound effect');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Generate audio using TTS with sound effect description
      const response = await axios.post(mlApi('/api/audio/generate'), {
        text: `[Sound effect: ${prompt}]`,
        voice: 'en'
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate sound effect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8">
        <h3 className="text-xl font-semibold mb-4">Sound Effect Generator</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Describe the Sound Effect</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., thunder rumbling, bird chirping, car engine starting, rain falling..."
            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
            rows={3}
          />
        </div>

        <div className="mb-4 p-3 bg-gray-700 rounded-lg text-sm">
          <p className="text-gray-400 mb-2">Tips for better results:</p>
          <ul className="list-disc list-inside text-gray-400">
            <li>Be specific about the sound</li>
            <li>Include context (e.g., "distant thunder")</li>
            <li>Add adjectives (e.g., "loud", "soft", "dramatic")</li>
          </ul>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg text-sm">{error}</div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? '🔊 Generating...' : 'Generate Sound Effect'}
        </button>

        {result && result.success && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">✅ Sound Effect Generated</h4>
            {result.audioUrl && (
              <div className="mb-4">
                <audio controls className="w-full">
                  <source src={mlAssetUrl(result.audioUrl)} type="audio/mpeg" />
                </audio>
              </div>
            )}
            {result.audioUrl && (
              <a
                href={mlAssetUrl(result.audioUrl)}
                download={`sound-effect-${result.jobId}.mp3`}
                className="inline-block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition"
              >
                ⬇️ Download Sound Effect
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
