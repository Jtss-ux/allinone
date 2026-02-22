'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('blurry, ugly, distorted, low quality');
  const [steps, setSteps] = useState(15);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post(backendApi('/api/image/generate'), {
        prompt,
        negative_prompt: negativePrompt,
        num_inference_steps: steps,
        guidance_scale: 7.5
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const imageUrl = result?.imageUrl || result?.imageBase64;
    if (!imageUrl) return;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8">
        <h3 className="text-xl font-semibold mb-4">Generate an Image</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">What do you want to create?</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., A beautiful sunset over mountains, cyberpunk city, etc."
            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">What to avoid (negative prompt)</label>
          <input
            type="text"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Quality (steps): {steps}</label>
          <input
            type="range"
            min="10"
            max="50"
            value={steps}
            onChange={(e) => setSteps(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-400">Higher = better quality but slower</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '🎨 Generating Image...' : 'Generate Image'}
        </button>

        {loading && (
          <div className="mt-4 text-center text-gray-400">
            <div className="animate-pulse">⚡ Racing AI providers for the fastest result...</div>
            <p className="text-sm mt-2">Trying multiple models simultaneously</p>
          </div>
        )}

        {result && result.success && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">✅ Generated Image</h4>

            {(result.imageUrl || result.imageBase64) && (
              <div className="mb-4">
                <img
                  src={result.imageUrl || result.imageBase64}
                  alt="Generated"
                  className="w-full rounded-lg border border-gray-600"
                />
              </div>
            )}

            {(result.imageUrl || result.imageBase64) && (
              <button
                onClick={handleDownload}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition mb-4"
              >
                ⬇️ Download Image
              </button>
            )}

            {result.prompt && (
              <div className="p-3 bg-gray-700 rounded-lg space-y-1">
                <p className="text-sm text-gray-300">
                  <strong>Prompt:</strong> {result.prompt}
                </p>
                {result.provider && (
                  <p className="text-sm text-gray-300">
                    <strong>Model:</strong>{' '}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-900/50 text-purple-300 border border-purple-700/50">
                      🤖 {result.provider}
                    </span>
                    {result.tier && (
                      <span className={`ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${result.tier === 'fast' ? 'bg-green-900/50 text-green-300 border-green-700/50' :
                          result.tier === 'slow' ? 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50' :
                            'bg-blue-900/50 text-blue-300 border-blue-700/50'
                        }`}>
                        {result.tier === 'fast' ? '⚡' : result.tier === 'slow' ? '🐢' : '🆓'} {result.tier}
                      </span>
                    )}
                    {result.latency && (
                      <span className="ml-1.5 text-xs text-gray-500">{(result.latency / 1000).toFixed(1)}s</span>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {result && !result.success && (
          <div className="mt-4 p-3 bg-red-900/80 text-red-100 rounded-lg text-sm">
            {result.error || 'Failed to generate image'}
          </div>
        )}
      </div>
    </div>
  );
}
