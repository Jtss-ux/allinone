'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { mlApi, mlAssetUrl } from '@/config/api';

export default function SketchToImage() {
  const [sketch, setSketch] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSketch(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleGenerate = async () => {
    if (!sketch) {
      setError('Please upload a sketch');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', sketch);
      formData.append('prompt', prompt || 'a beautiful detailed illustration of the sketch');
      formData.append('strength', '0.85');

      const response = await axios.post(mlApi('/api/image/img2img'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8">
        <h3 className="text-xl font-semibold mb-4">Sketch to Image</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Upload Your Sketch</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
          />
        </div>

        {preview && (
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Your Sketch:</p>
            <img src={preview} alt="Sketch" className="w-48 h-48 object-contain rounded-lg border border-gray-600 bg-white" />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Description (optional)</label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., colorful, detailed, photorealistic..."
            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg text-sm">{error}</div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? '🎨 Generating from Sketch...' : 'Generate Image'}
        </button>

        {result && result.success && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">✅ Generated Image</h4>
            {result.imageBase64 && (
              <img src={result.imageBase64} alt="Result" className="w-full rounded-lg border border-gray-600" />
            )}
            {result.imageBase64 && (
              <a
                href={result.imageBase64}
                download={`ai-sketch-${result.jobId}.png`}
                className="inline-block w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition"
              >
                ⬇️ Download Image
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
