'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

export default function ChangeCamera() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [effect, setEffect] = useState('wide-angle');
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

  const handleApply = async () => {
    if (!image) {
      setError('Please upload an image');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const promptMap: { [key: string]: string } = {
      'wide-angle': 'wide angle lens, expanded view, panoramic perspective, wide field of view',
      'portrait': 'portrait photography, professional headshot, studio lighting, bokeh background',
      'fisheye': 'fisheye lens effect, curved perspective, 180 degree view, dramatic distortion',
      'aerial': 'aerial view, drone perspective, bird eye view, from above',
      'macro': 'macro photography, extreme close-up, detailed texture, shallow depth of field',
    };

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('prompt', promptMap[effect]);
      formData.append('strength', '0.6');

      const response = await axios.post(backendApi('/api/image/img2img'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to apply camera effect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8">
        <h3 className="text-xl font-semibold mb-4">Change Camera Effect</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Upload Photo</label>
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
            <img src={preview} alt="Preview" className="w-48 h-48 object-cover rounded-lg border border-gray-600" />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Camera Effect</label>
          <select
            value={effect}
            onChange={(e) => setEffect(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
          >
            <option value="wide-angle">Wide Angle</option>
            <option value="portrait">Portrait/Studio</option>
            <option value="fisheye">Fisheye</option>
            <option value="aerial">Aerial/Drone</option>
            <option value="macro">Macro/Close-up</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg text-sm">{error}</div>
        )}

        <button
          onClick={handleApply}
          disabled={loading}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? '📷 Applying Effect...' : 'Apply Camera Effect'}
        </button>

        {result && result.success && result.imageBase64 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">✅ Camera Effect Applied</h4>
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
              download={`camera-effect-${result.jobId}.png`}
              className="inline-block w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition"
            >
              ⬇️ Download Image
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
