'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { mlApi, mlAssetUrl } from '@/config/api';

export default function SkinEnhancer() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [enhancement, setEnhancement] = useState(0.5);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleEnhance = async () => {
    if (!image) {
      setError('Please upload an image');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('prompt', 'smooth skin, perfect complexion, clear skin, beautiful skin, professional portrait retouching, enhanced skin texture');
      formData.append('strength', enhancement.toString());

      const response = await axios.post(mlApi('/api/image/img2img'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to enhance image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8">
        <h3 className="text-xl font-semibold mb-4">Skin Enhancer</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Upload Portrait Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
          />
        </div>

        {preview && (
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Original:</p>
            <img src={preview} alt="Preview" className="w-48 h-48 object-cover rounded-lg border border-gray-600" />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Enhancement Level: {Math.round(enhancement * 100)}%</label>
          <input
            type="range"
            min="0.1"
            max="0.8"
            step="0.1"
            value={enhancement}
            onChange={(e) => setEnhancement(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-400">Higher = more enhanced</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg text-sm">{error}</div>
        )}

        <button
          onClick={handleEnhance}
          disabled={loading}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? '💄 Enhancing...' : 'Enhance Skin'}
        </button>

        {result && result.success && result.imageBase64 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">✅ Enhanced Photo</h4>
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-2">Before</p>
                <img src={preview} alt="Before" className="w-full rounded-lg border border-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-2">After</p>
                <img src={result.imageBase64} alt="After" className="w-full rounded-lg border border-gray-600" />
              </div>
            </div>
            <a
              href={result.imageBase64}
              download={`ai-enhanced-${result.jobId}.png`}
              className="inline-block w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition"
            >
              ⬇️ Download Enhanced Image
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
