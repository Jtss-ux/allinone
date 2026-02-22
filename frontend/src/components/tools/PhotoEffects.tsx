'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

interface EffectPreset {
  id: string;
  name: string;
  icon: string;
  params: {
    grain: number;
    sepia: number;
    contrast: number;
    brightness: number;
    saturation: number;
    vignette: number;
  };
}

const presets: EffectPreset[] = [
  { id: 'neutral', name: 'Neutral', icon: '⬜', params: { grain: 0, sepia: 0, contrast: 0, brightness: 0, saturation: 0, vignette: 0 }},
  { id: 'kodak', name: 'Kodak Gold', icon: '📷', params: { grain: 15, sepia: 10, contrast: 10, brightness: 5, saturation: 15, vignette: 20 }},
  { id: 'fuji', name: 'Fuji Superia', icon: '🎞️', params: { grain: 20, sepia: 5, contrast: 5, brightness: 10, saturation: 10, vignette: 15 }},
  { id: 'ilford', name: 'Ilford HP5', icon: '🏴', params: { grain: 25, sepia: 0, contrast: 15, brightness: 0, saturation: -10, vignette: 25 }},
  { id: 'cinematic', name: 'Cinematic', icon: '🎬', params: { grain: 10, sepia: 15, contrast: 20, brightness: -5, saturation: 10, vignette: 40 }},
  { id: 'vintage', name: 'Vintage 90s', icon: '📼', params: { grain: 30, sepia: 30, contrast: 15, brightness: 5, saturation: -15, vignette: 35 }},
  { id: 'polaroid', name: 'Polaroid', icon: '🖼️', params: { grain: 12, sepia: 8, contrast: -5, brightness: 15, saturation: -5, vignette: 30 }},
  { id: 'noir', name: 'Film Noir', icon: '🌑', params: { grain: 20, sepia: 0, contrast: 35, brightness: -10, saturation: -30, vignette: 50 }},
  { id: 'sunset', name: 'Golden Hour', icon: '🌅', params: { grain: 8, sepia: 25, contrast: 10, brightness: 15, saturation: 25, vignette: 20 }},
  { id: 'cool', name: 'Cool Tone', icon: '❄️', params: { grain: 5, sepia: 0, contrast: 5, brightness: 0, saturation: -10, vignette: 10 }},
  { id: 'warm', name: 'Warm Tone', icon: '🔥', params: { grain: 5, sepia: 20, contrast: 5, brightness: 10, saturation: 15, vignette: 10 }},
  { id: 'rose', name: 'Rose Gold', icon: '🌹', params: { grain: 10, sepia: 15, contrast: 0, brightness: 10, saturation: 20, vignette: 15 }},
];

export default function PhotoEffects() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  
  // Effect parameters
  const [grain, setGrain] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [vignette, setVignette] = useState(0);
  const [blur, setBlur] = useState(0);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const applyPreset = (preset: EffectPreset) => {
    setGrain(preset.params.grain);
    setSepia(preset.params.sepia);
    setContrast(preset.params.contrast);
    setBrightness(preset.params.brightness);
    setSaturation(preset.params.saturation);
    setVignette(preset.params.vignette);
  };

  const handleApply = async () => {
    if (!image) {
      setError('Please upload an image first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', image);
      
      const prompts: string[] = [];
      if (grain > 0) prompts.push(`${grain > 15 ? 'heavy' : grain > 5 ? 'moderate' : 'light'} film grain, realistic grain texture`);
      if (sepia > 0) prompts.push(`${sepia > 15 ? 'strong' : 'light'} sepia tone, vintage look`);
      if (contrast > 10) prompts.push('high contrast, dramatic');
      if (contrast < -5) prompts.push('low contrast, soft');
      if (brightness > 10) prompts.push('bright, luminous');
      if (brightness < -5) prompts.push('dark, moody');
      if (saturation > 10) prompts.push('vibrant colors, saturated');
      if (saturation < -10) prompts.push('desaturated, muted colors');
      if (vignette > 20) prompts.push('strong vignette, dark corners');
      
      const prompt = prompts.length > 0 ? prompts.join(', ') : 'enhanced, high quality photo';
      
      formData.append('prompt', prompt);
      formData.append('strength', (Math.max(grain, sepia, vignette) / 100 * 0.5 + 0.3).toString());

      const response = await axios.post(backendApi('/api/image/img2img'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to apply effects');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setGrain(0);
    setSepia(0);
    setContrast(0);
    setBrightness(0);
    setSaturation(0);
    setVignette(0);
    setBlur(0);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-2xl font-bold mb-2">🎞️ Film Grain & Effects</h3>
        <p className="text-gray-400 mb-6">Add realistic film grain and vintage effects to your photos</p>

        {/* Upload Area */}
        <div className="mb-6">
          <label className="block w-full p-8 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-green-500 transition">
            <input type="file" accept="image/png,image/jpeg" onChange={handleImageChange} className="hidden" />
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
            ) : (
              <div>
                <div className="text-4xl mb-2">📁</div>
                <p className="text-gray-400">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
              </div>
            )}
          </label>
        </div>

        {/* Presets */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">🎨 Quick Presets</h4>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-center transition"
                title={preset.name}
              >
                <div className="text-xl mb-1">{preset.icon}</div>
                <div className="text-xs text-gray-400 truncate">{preset.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Grain: {grain}</label>
            <input type="range" min="0" max="50" value={grain} onChange={(e) => setGrain(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sepia: {sepia}</label>
            <input type="range" min="0" max="50" value={sepia} onChange={(e) => setSepia(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contrast: {contrast}</label>
            <input type="range" min="-30" max="50" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Brightness: {brightness}</label>
            <input type="range" min="-30" max="50" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Saturation: {saturation}</label>
            <input type="range" min="-50" max="50" value={saturation} onChange={(e) => setSaturation(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vignette: {vignette}</label>
            <input type="range" min="0" max="80" value={vignette} onChange={(e) => setVignette(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Blur: {blur}</label>
            <input type="range" min="0" max="20" value={blur} onChange={(e) => setBlur(Number(e.target.value))} className="w-full" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button onClick={handleApply} disabled={loading || !image} className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50">
            {loading ? '⏳ Applying...' : '✨ Apply Effects'}
          </button>
          <button onClick={handleReset} className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition">
            🔄 Reset
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg">{error}</div>}

        {/* Result */}
        {result && result.success && result.imageBase64 && (
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Original</p>
                <img src={preview} alt="Original" className="w-full rounded-lg border border-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">With Effects</p>
                <img src={result.imageBase64} alt="Result" className="w-full rounded-lg border border-gray-600" />
              </div>
            </div>
            <a href={result.imageBase64} download={`film-effect-${result.jobId}.png`} className="inline-block w-full mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition">
              ⬇️ Download Image
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
