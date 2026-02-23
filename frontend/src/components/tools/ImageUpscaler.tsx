'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

export default function ImageUpscaler() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpscale = async () => {
    if (!file) {
      setError('Please select an image file');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(backendApi('/api/image/upscale'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
      <div className="bg-gray-800 rounded-lg p-8 shadow-xl border border-gray-700">
        <h3 className="text-2xl font-bold mb-6 text-white flex items-center">
          <span className="mr-2">📈</span> 4K Image Upscaler
        </h3>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-gray-300">Select Image to Enhance</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-600 border-dashed rounded-xl cursor-pointer bg-gray-900/50 hover:bg-gray-700 transition-all group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-600/20 transition-colors">
                  <span className="text-2xl">📁</span>
                </div>
                <p className="mb-2 text-sm text-gray-300">
                  <span className="font-bold text-blue-400">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Aura-SR Neural Engine</p>
              </div>
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </label>
          </div>
          {preview && (
            <div className="mt-6 p-4 bg-black/30 rounded-lg border border-gray-700">
              <p className="text-xs font-bold text-gray-500 uppercase mb-3 px-1">Source Preview</p>
              <img src={preview} alt="Source" className="max-h-64 mx-auto rounded-lg shadow-2xl" />
              <p className="text-center text-xs text-gray-500 mt-2">{file?.name} ({Math.round(file!.size / 1024 / 1024 * 100) / 100}MB)</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-100 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleUpscale}
          disabled={loading || !file}
          className="w-full px-4 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl font-bold text-white transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Processing 4K Neural Upscale...
            </span>
          ) : 'Upscale to 4K Ultra HD'}
        </button>

        {result?.imageUrl && (
          <div className="mt-10 animate-in fade-in slide-in-from-bottom-4">
            <h4 className="font-bold mb-4 text-center text-green-400 flex items-center justify-center">
              <span className="mr-2">✨</span> 4K Enhancement Complete
            </h4>
            <div className="rounded-xl overflow-hidden border-2 border-blue-500/30 shadow-2xl ring-4 ring-blue-500/10">
              <img src={result.imageUrl} alt="Upscaled" className="w-full h-auto" />
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <a
                href={result.imageUrl}
                download="ghelper_upscaled_4k.png"
                className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-bold shadow-lg transition transform hover:translate-y-[-2px] active:translate-y-0"
              >
                Download 4K Image
              </a>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4 italic">
              Processed via Fal.ai Aura-SR Engine
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
