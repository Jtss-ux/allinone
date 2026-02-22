'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

export default function ImageExtender() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [direction, setDirection] = useState('right');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleExtend = async () => {
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
      formData.append('prompt', 'seamless extension, continuation of scene, natural extension, high quality');
      formData.append('strength', '0.5');

      const response = await axios.post(backendApi('/api/image/img2img'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to extend image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8">
        <h3 className="text-xl font-semibold mb-4">Image Extender (Outpainting)</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Upload Image to Extend</label>
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleImageChange}
            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
          />
        </div>

        {preview && (
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Original:</p>
            <img src={preview} alt="Preview" className="w-48 h-48 object-contain rounded-lg border border-gray-600" />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Extend Direction</label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
          >
            <option value="right">Extend Right</option>
            <option value="bottom">Extend Bottom</option>
            <option value="both">Extend Both Sides</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg text-sm">{error}</div>
        )}

        <button
          onClick={handleExtend}
          disabled={loading}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? '➕ Extending...' : 'Extend Image'}
        </button>

        {result && result.success && result.imageBase64 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">✅ Extended Image</h4>
            <img src={result.imageBase64} alt="Extended" className="w-full rounded-lg border border-gray-600" />
            <a
              href={result.imageBase64}
              download={`ai-extended-${result.jobId}.png`}
              className="inline-block w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition"
            >
              ⬇️ Download Extended Image
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
