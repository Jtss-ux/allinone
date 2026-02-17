'use client';

import React, { useState, useRef } from 'react';
import axios from 'axios';
import { mlApi, mlAssetUrl } from '@/config/api';

export default function ImageEditor() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [strength, setStrength] = useState(0.75);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }
    if (!image) {
      setError('Please upload an image');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('image', image);
      formData.append('strength', strength.toString());

      const response = await axios.post(mlApi('/api/image/img2img'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to transform image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8">
        <h3 className="text-xl font-semibold mb-4">Transform Your Image</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
          />
        </div>

        {preview && (
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Preview:</p>
            <img src={preview} alt="Preview" className="w-48 h-48 object-cover rounded-lg border border-gray-600" />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">What do you want to transform it into?</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Turn this into a cyberpunk city, make it a painting, etc."
            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Transformation Strength: {strength}</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={strength}
            onChange={(e) => setStrength(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-400">Higher = more changed, Lower = more similar to original</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg text-sm">{error}</div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? '✏️ Transforming...' : 'Transform Image'}
        </button>

        {result && result.success && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">✅ Transformed Image</h4>
            {result.imageBase64 && (
              <img src={result.imageBase64} alt="Result" className="w-full rounded-lg border border-gray-600" />
            )}
            {result.imageBase64 && (
              <a
                href={result.imageBase64}
                download={`ai-edited-${result.jobId}.png`}
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
