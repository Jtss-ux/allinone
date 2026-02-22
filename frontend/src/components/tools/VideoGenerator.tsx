'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState('');
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
      const response = await axios.post(backendApi('/api/video/generate'), {
        prompt,
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8">
        <h3 className="text-xl font-semibold mb-4">Generate a Video</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Describe your video</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., A cat running through a park, waves crashing on a beach, etc."
            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
            rows={4}
          />
        </div>

        <div className="mb-4 p-3 bg-yellow-900 text-yellow-100 rounded-lg text-sm">
          <strong>Note:</strong> Video generation takes 2-5 minutes. You'll receive a notification when ready.
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '🎬 Racing AI providers...' : 'Generate Video'}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <h4 className="font-semibold mb-2">Video Generation Status</h4>
            <p className="text-sm text-gray-300">
              <strong>Job ID:</strong> {result.jobId || result.prompt}
            </p>
            <p className="text-sm text-gray-300">
              <strong>Status:</strong> {result.message}
            </p>
            {result.provider && (
              <p className="text-sm text-gray-300 mt-1">
                <strong>Model:</strong>{' '}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-900/50 text-purple-300 border border-purple-700/50">
                  🤖 {result.provider}
                </span>
              </p>
            )}
            <p className="text-sm text-gray-300">
              <strong>Estimated Time:</strong> {result.estimatedTime || 'Depends on provider'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
