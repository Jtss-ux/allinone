'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

export default function IconGenerator() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for the icon');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post(backendApi('/api/image/generate'), {
        prompt: `${prompt}, icon, flat design, simple, minimal, vector style, transparent background, square format`,
        negative_prompt: 'blurry, complex, detailed, photograph, 3d',
        num_inference_steps: 20
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate icon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8">
        <h3 className="text-xl font-semibold mb-4">Generate Icon</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">What icon do you want?</label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., A rocket ship, coffee cup, camera, musical note..."
            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
          />
        </div>

        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-400">Tips:</p>
          <ul className="text-xs text-gray-400 mt-1">
            <li>• Use simple, recognizable subjects</li>
            <li>• Add "icon", "flat", "minimal" to your prompt</li>
            <li>• Works best with simple shapes</li>
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
          {loading ? '🔷 Generating Icon...' : 'Generate Icon'}
        </button>

        {result && result.success && result.imageBase64 && (
          <div className="mt-6 text-center">
            <h4 className="font-semibold mb-2">✅ Generated Icon</h4>
            <img src={result.imageBase64} alt="Icon" className="w-48 h-48 mx-auto rounded-lg border border-gray-600" />
            <a
              href={result.imageBase64}
              download={`ai-icon-${result.jobId}.png`}
              className="inline-block w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition"
            >
              ⬇️ Download Icon
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
