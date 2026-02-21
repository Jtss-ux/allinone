'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

const filters = [
  { id: 'none', name: 'Original', params: { warmth: 0, tint: 0, fade: 0, sharpen: 0 }},
  { id: 'warm', name: 'Warm Sunset', params: { warmth: 30, tint: 10, fade: 0, sharpen: 10 }},
  { id: 'cool', name: 'Cool Blue', params: { warmth: -30, tint: -10, fade: 0, sharpen: 10 }},
  { id: 'vivid', name: 'Vivid Colors', params: { warmth: 10, tint: 0, fade: -10, sharpen: 20 }},
  { id: 'fade', name: 'Faded', params: { warmth: 5, tint: 0, fade: 40, sharpen: 0 }},
  { id: 'bw', name: 'B&W Classic', params: { warmth: 0, tint: 0, fade: 20, sharpen: 15 }},
  { id: 'dramatic', name: 'Dramatic', params: { warmth: -10, tint: 0, fade: -10, sharpen: 30 }},
  { id: 'moody', name: 'Moody', params: { warmth: -20, tint: -5, fade: 15, sharpen: 10 }},
];

const adjustments = [
  { id: 'exposure', name: 'Exposure', min: -100, max: 100, default: 0 },
  { id: 'contrast', name: 'Contrast', min: -100, max: 100, default: 0 },
  { id: 'highlights', name: 'Highlights', min: -100, max: 100, default: 0 },
  { id: 'shadows', name: 'Shadows', min: -100, max: 100, default: 0 },
  { id: 'whites', name: 'Whites', min: -100, max: 100, default: 0 },
  { id: 'blacks', name: 'Blacks', min: -100, max: 100, default: 0 },
  { id: 'vibrance', name: 'Vibrance', min: -100, max: 100, default: 0 },
  { id: 'saturation', name: 'Saturation', min: -100, max: 100, default: 0 },
  { id: 'warmth', name: 'Warmth', min: -100, max: 100, default: 0 },
  { id: 'tint', name: 'Tint', min: -100, max: 100, default: 0 },
];

export default function PhotoEditor() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  
  // Adjustment values
  const [values, setValues] = useState<Record<string, number>>({});
  const [selectedFilter, setSelectedFilter] = useState('none');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setValues({});
      setSelectedFilter('none');
    }
  };

  const handleAdjustmentChange = (id: string, value: number) => {
    setValues(prev => ({ ...prev, [id]: value }));
  };

  const applyFilter = (filter: typeof filters[0]) => {
    setSelectedFilter(filter.id);
    // Reset adjustments and apply filter params as base
    const newValues: Record<string, number> = {};
    Object.entries(filter.params).forEach(([key, value]) => {
      newValues[key] = value;
    });
    setValues(newValues);
  };

  const handleApply = async () => {
    if (!image) {
      setError('Please upload an image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', image);
      
      let prompt = 'professional photo edit';
      if (selectedFilter !== 'none') {
        prompt = `photo with ${selectedFilter} filter effect, professional color grading`;
      }
      if (values.contrast > 20) prompt += ', high contrast';
      if (values.contrast < -20) prompt += ', low contrast';
      if (values.saturation > 20) prompt += ', vibrant colors';
      if (values.saturation < -20) prompt += ', desaturated';
      if (values.warmth > 20) prompt += ', warm tones';
      if (values.warmth < -20) prompt += ', cool tones';
      
      formData.append('prompt', prompt);
      formData.append('strength', '0.4');

      const response = await axios.post(backendApi('/api/image/img2img'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to apply edits');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setValues({});
    setSelectedFilter('none');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-purple-900 to-pink-900">
          <h3 className="text-2xl font-bold">🎨 Photo Editor (Like Efecto)</h3>
          <p className="text-gray-300">Professional color grading and adjustments</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-0">
          {/* Left Panel - Preview */}
          <div className="lg:col-span-2 p-6">
            <label className="block w-full aspect-video bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition">
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              {result?.imageBase64 ? (
                <img src={result.imageBase64} alt="Result" className="w-full h-full object-contain rounded-lg" />
              ) : preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-gray-400">Click to upload image</p>
                  </div>
                </div>
              )}
            </label>

            {result && (
              <a href={result.imageBase64} download={`edited-${result.jobId}.png`} className="block mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition">
                ⬇️ Download Image
              </a>
            )}
          </div>

          {/* Right Panel - Controls */}
          <div className="bg-gray-900 p-4 overflow-y-auto max-h-[600px]">
            {/* Filters */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">🎞️ Filters</h4>
              <div className="grid grid-cols-4 gap-2">
                {filters.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => applyFilter(filter)}
                    className={`p-2 rounded-lg text-center transition ${
                      selectedFilter === filter.id ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="text-xs font-medium truncate">{filter.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Adjustments */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">⚡ Adjustments</h4>
              <div className="space-y-3">
                {adjustments.map(adj => (
                  <div key={adj.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{adj.name}</span>
                      <span className="text-gray-400">{values[adj.id] ?? adj.default}</span>
                    </div>
                    <input
                      type="range"
                      min={adj.min}
                      max={adj.max}
                      value={values[adj.id] ?? adj.default}
                      onChange={(e) => handleAdjustmentChange(adj.id, Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleApply}
                disabled={loading || !image}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {loading ? '⏳' : '✨'} Apply
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition"
              >
                🔄
              </button>
            </div>

            {error && <div className="mt-3 p-2 bg-red-900 text-red-100 rounded text-sm">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
