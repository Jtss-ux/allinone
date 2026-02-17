'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { mlApi, mlAssetUrl } from '@/config/api';

export default function MusicGenerator() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please describe the music you want');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Generate audio with music description
      const response = await axios.post(mlApi('/api/audio/generate'), {
        text: `Music: ${prompt}. instrumental, melody, harmony, rhythm. [background music]`,
        voice: 'en'
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate music');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8">
        <h3 className="text-xl font-semibold mb-4">Music Generator</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Describe the Music</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., upbeat electronic dance music with strong bass, calm acoustic guitar melody, dramatic orchestral soundtrack..."
            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
            rows={3}
          />
        </div>

        <div className="mb-4 p-3 bg-gray-700 rounded-lg text-sm">
          <p className="text-gray-400 mb-2">Music styles you can request:</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {['Electronic', 'Classical', 'Jazz', 'Rock', 'Pop', 'Ambient', 'Cinematic', 'Acoustic'].map((style) => (
              <button
                key={style}
                onClick={() => setPrompt(prompt + (prompt ? ', ' : '') + style)}
                className="px-3 py-1 bg-gray-600 rounded-full text-xs text-gray-300 hover:bg-gray-500"
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg text-sm">{error}</div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? '🎵 Generating Music...' : 'Generate Music'}
        </button>

        {result && result.success && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">✅ Music Generated</h4>
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
                download={`ai-music-${result.jobId}.mp3`}
                className="inline-block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition"
              >
                ⬇️ Download Music
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
