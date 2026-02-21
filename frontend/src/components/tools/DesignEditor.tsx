'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

export default function DesignEditor() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('modern');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a design description');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const fullPrompt = `${prompt}, ${style} design, graphic design, clean, professional, high quality`;
      const response = await axios.post(backendApi('/api/image/generate'), {
        prompt: fullPrompt,
        negative_prompt: 'blurry, low quality, distorted, ugly',
        num_inference_steps: 20
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate design');
    } finally {
      setLoading(false);
    }
  };

  const styles = [
    { id: 'modern', label: 'Modern' },
    { id: 'minimalist', label: 'Minimalist' },
    { id: 'vintage', label: 'Vintage' },
    { id: 'corporate', label: 'Corporate' },
    { id: 'creative', label: 'Creative' },
    { id: 'tech', label: 'Tech' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8">
        <h3 className="text-xl font-semibold mb-4">Design Editor</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">What do you want to design?</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., A logo for a coffee shop, a poster for a music festival, a business card design..."
            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Design Style</label>
          <div className="grid grid-cols-3 gap-2">
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`p-2 rounded-lg text-sm font-medium transition ${
                  style === s.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {s.label}
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
          {loading ? '🖌️ Generating Design...' : 'Generate Design'}
        </button>

        {result && result.success && result.imageBase64 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">✅ Generated Design</h4>
            <img src={result.imageBase64} alt="Design" className="w-full rounded-lg border border-gray-600" />
            <a
              href={result.imageBase64}
              download={`ai-design-${result.jobId}.png`}
              className="inline-block w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition"
            >
              ⬇️ Download Design
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
