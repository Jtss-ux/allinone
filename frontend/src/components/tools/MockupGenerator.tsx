'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { mlApi, mlAssetUrl } from '@/config/api';

export default function MockupGenerator() {
  const [product, setProduct] = useState('');
  const [context, setContext] = useState('展示架');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!product.trim()) {
      setError('Please describe your product');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const prompt = `${product}, ${context}, product photography, professional mockup, clean background, high quality, commercial photography`;
      const response = await axios.post(mlApi('/api/image/generate'), {
        prompt,
        negative_prompt: 'blurry, low quality, distorted, ugly, watermark, text',
        num_inference_steps: 25
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate mockup');
    } finally {
      setLoading(false);
    }
  };

  const contexts = [
    { id: '展示架', label: 'Display Stand' },
    { id: '海报', label: 'Poster' },
    { id: '包装盒', label: 'Package' },
    { id: 'T卹', label: 'T-Shirt' },
    { id: '杯子', label: 'Mug' },
    { id: '手机壳', label: 'Phone Case' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8">
        <h3 className="text-xl font-semibold mb-4">Mockup Generator</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">What do you want to create a mockup for?</label>
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="E.g., A logo, a design, a brand name, a pattern..."
            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Mockup Type</label>
          <div className="grid grid-cols-2 gap-2">
            {contexts.map((c) => (
              <button
                key={c.id}
                onClick={() => setContext(c.id)}
                className={`p-2 rounded-lg text-sm font-medium transition ${
                  context === c.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {c.label}
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
          {loading ? '📱 Generating Mockup...' : 'Generate Mockup'}
        </button>

        {result && result.success && result.imageBase64 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">✅ Mockup Generated</h4>
            <img src={result.imageBase64} alt="Mockup" className="w-full rounded-lg border border-gray-600" />
            <a
              href={result.imageBase64}
              download={`mockup-${result.jobId}.png`}
              className="inline-block w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition"
            >
              ⬇️ Download Mockup
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
