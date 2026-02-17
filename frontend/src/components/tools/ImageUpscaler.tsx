'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { mlApi, mlAssetUrl } from '@/config/api';

export default function ImageUpscaler() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [scale, setScale] = useState(2);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpscale = async () => {
    if (!image) {
      setError('Please upload an image');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Use img2img with upscaling prompt
      const formData = new FormData();
      formData.append('image', image);
      formData.append('prompt', 'high quality, detailed, sharp, high resolution, enhanced');
      formData.append('strength', '0.3');

      const response = await axios.post(mlApi('/api/image/img2img'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upscale image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8">
        <h3 className="text-xl font-semibold mb-4">Image Upscaler</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Upload Image to Upscale</label>
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
            <img src={preview} alt="Preview" className="w-48 h-48 object-contain rounded-lg border border-gray-600" />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Upscale Factor: {scale}x</label>
          <input
            type="range"
            min="2"
            max="4"
            step="1"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg text-sm">{error}</div>
        )}

        <button
          onClick={handleUpscale}
          disabled={loading}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? '📈 Upscaling...' : 'Upscale Image'}
        </button>

        {result && result.success && result.imageBase64 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">✅ Upscaled Image</h4>
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-2">Original</p>
                <img src={preview} alt="Original" className="w-full rounded-lg border border-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-2">Upscaled ({scale}x)</p>
                <img src={result.imageBase64} alt="Upscaled" className="w-full rounded-lg border border-gray-600" />
              </div>
            </div>
            <a
              href={result.imageBase64}
              download={`ai-upscaled-${result.jobId}.png`}
              className="inline-block w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition"
            >
              ⬇️ Download Upscaled Image
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
