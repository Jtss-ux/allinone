'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi, mlApi } from '@/config/api';

export default function BackgroundRemover() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
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

  const handleRemove = async () => {
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

      let response;
      try {
        response = await axios.post(backendApi('/api/image/remove-background'), formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } catch {
        formData.append('prompt', 'transparent background, white background, clean background');
        formData.append('strength', '0.3');
        response = await axios.post(mlApi('/api/image/img2img'), formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8">
        <h3 className="text-xl font-semibold mb-4">Remove Background</h3>
        
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
            <p className="text-sm text-gray-400 mb-2">Original:</p>
            <img src={preview} alt="Preview" className="w-48 h-48 object-cover rounded-lg border border-gray-600" />
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg text-sm">{error}</div>
        )}

        <button
          onClick={handleRemove}
          disabled={loading}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? '🎯 Removing Background...' : 'Remove Background'}
        </button>

        {result && result.success && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">✅ Background Removed</h4>
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-2">Original</p>
                <img src={preview} alt="Original" className="w-full rounded-lg border border-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-2">Result</p>
                {(result.imageUrl || result.imageBase64) && (
                  <img src={result.imageUrl || result.imageBase64} alt="Result" className="w-full rounded-lg border border-gray-600" />
                )}
              </div>
            </div>
            {(result.imageUrl || result.imageBase64) && (
              <a
                href={result.imageUrl || result.imageBase64}
                download={`ai-nobg-${Date.now()}.png`}
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
