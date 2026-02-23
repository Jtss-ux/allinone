'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const pollStatus = async (jobId: string, provider: string) => {
    const interval = setInterval(async () => {
      try {
        const url = provider === 'ltx'
          ? `/api/video/status/${jobId}`
          : `/api/video/status/${provider}/${jobId}`;

        const response = await axios.get(backendApi(url));
        if (response.data.status === 'succeeded' || response.data.status === 'completed') {
          setResult({ ...response.data, success: true });
          setLoading(false);
          clearInterval(interval);
        } else if (response.data.status === 'failed') {
          setError('Video generation failed at the provider.');
          setLoading(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000); // Poll every 5 seconds

    // Stop polling after 10 minutes (safety)
    setTimeout(() => {
      clearInterval(interval);
      if (loading) {
        setLoading(false);
        setError('Generation timed out. Please check back later.');
      }
    }, 600000);
  };

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

      if (response.data.status === 'processing' && response.data.generationId) {
        setResult(response.data);
        pollStatus(response.data.generationId, response.data.provider);
      } else {
        setResult(response.data);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate video');
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
            
            {result.videoUrl ? (
              <div className="mt-4">
                <video src={result.videoUrl} controls className="w-full rounded-lg border border-gray-600 shadow-xl" />
                <a 
                  href={result.videoUrl} 
                  download 
                  className="mt-4 inline-block w-full text-center py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition"
                >
                  ⬇️ Download Video
                </a>
              </div>
            ) : result.imageUrl ? (
              <div className="mt-4">
                <p className="text-xs text-yellow-400 mb-2 font-mono">Status: {result.note || 'Processing first frame...'}</p>
                <img src={result.imageUrl} alt="First Frame" className="w-full rounded-lg border border-gray-600" />
              </div>
            ) : (
              <div className="flex flex-col items-center py-6">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-gray-300 font-medium">Generating your video via {result.provider}...</p>
                <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">Do not close this tab</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-600 text-xs text-gray-400">
              <p><strong>Job:</strong> {result.generationId || 'Local-Process'}</p>
              <p><strong>Provider:</strong> {result.provider}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
