'use client';

import React, { useState, useRef } from 'react';

type ConvertMode = 'video' | 'audio' | 'image' | 'document';

interface FormatOption {
  ext: string;
  label: string;
}

const formatOptions: Record<ConvertMode, FormatOption[]> = {
  video: [
    { ext: 'mp4', label: 'MP4' },
    { ext: 'webm', label: 'WebM' },
    { ext: 'mkv', label: 'MKV' },
    { ext: 'avi', label: 'AVI' },
    { ext: 'mov', label: 'MOV' },
    { ext: 'gif', label: 'GIF' },
  ],
  audio: [
    { ext: 'mp3', label: 'MP3' },
    { ext: 'wav', label: 'WAV' },
    { ext: 'flac', label: 'FLAC' },
    { ext: 'ogg', label: 'OGG' },
    { ext: 'aac', label: 'AAC' },
    { ext: 'm4a', label: 'M4A' },
  ],
  image: [
    { ext: 'png', label: 'PNG' },
    { ext: 'jpg', label: 'JPEG' },
    { ext: 'webp', label: 'WebP' },
    { ext: 'gif', label: 'GIF' },
    { ext: 'bmp', label: 'BMP' },
    { ext: 'ico', label: 'ICO' },
  ],
  document: [
    { ext: 'pdf', label: 'PDF' },
    { ext: 'docx', label: 'DOCX' },
    { ext: 'txt', label: 'TXT' },
    { ext: 'md', label: 'Markdown' },
  ],
};

export default function FileConverter() {
  const [mode, setMode] = useState<ConvertMode>('video');
  const [file, setFile] = useState<File | null>(null);
  const [selectedFormat, setSelectedFormat] = useState('mp4');
  const [converting, setConverting] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setConvertedUrl(null);
      setError('');
      
      // Auto-detect format
      const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
      if (['mp4', 'webm', 'mkv', 'avi', 'mov', 'gif'].includes(ext)) {
        setMode('video');
      } else if (['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a'].includes(ext)) {
        setMode('audio');
      } else if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'ico'].includes(ext)) {
        setMode('image');
      } else {
        setMode('document');
      }
    }
  };

  const convertFile = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setConverting(true);
    setError('');

    try {
      // For images - use canvas conversion
      if (mode === 'image') {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          
          let mimeType = 'image/png';
          if (selectedFormat === 'jpg' || selectedFormat === 'jpeg') mimeType = 'image/jpeg';
          else if (selectedFormat === 'webp') mimeType = 'image/webp';
          else if (selectedFormat === 'gif') mimeType = 'image/gif';
          else if (selectedFormat === 'bmp') mimeType = 'image/bmp';
          else if (selectedFormat === 'ico') mimeType = 'image/x-icon';
          
          const dataUrl = canvas.toDataURL(mimeType, 0.92);
          setConvertedUrl(dataUrl);
          setConverting(false);
        };
        img.onerror = () => {
          setError('Failed to load image');
          setConverting(false);
        };
        img.src = URL.createObjectURL(file);
        return;
      }

      // For other files - show info that WebAssembly conversion would happen
      // In a real implementation, you'd use ffmpeg.wasm or similar
      setError('Video/Audio/Document conversion requires ffmpeg.wasm. Try converting images for now!');
      setConverting(false);
      
    } catch (err) {
      setError('Conversion failed. Try a different file.');
      setConverting(false);
    }
  };

  const downloadConverted = () => {
    if (!convertedUrl) return;
    
    const link = document.createElement('a');
    link.href = convertedUrl;
    link.download = `converted.${selectedFormat}`;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4">
          <h3 className="text-2xl font-bold">🔄 File Converter (Like Vert.sh)</h3>
          <p className="text-gray-200">Convert video, audio, images & documents - All local!</p>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'video', icon: '🎬', label: 'Video' },
            { id: 'audio', icon: '🎵', label: 'Audio' },
            { id: 'image', icon: '🖼️', label: 'Image' },
            { id: 'document', icon: '📄', label: 'Document' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setMode(tab.id as ConvertMode); setSelectedFormat(formatOptions[tab.id as ConvertMode][0].ext); }}
              className={`flex-1 p-4 text-center font-semibold transition ${
                mode === tab.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span className="block text-2xl mb-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* File Upload */}
          <div className="mb-6">
            <label className="block w-full p-8 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-green-500 transition">
              <input 
                ref={fileInputRef}
                type="file" 
                accept={
                  mode === 'video' ? 'video/*' : 
                  mode === 'audio' ? 'audio/*' : 
                  mode === 'image' ? 'image/*' : '.pdf,.docx,.txt,.md'
                }
                onChange={handleFileChange} 
                className="hidden" 
              />
              {file ? (
                <div>
                  <div className="text-4xl mb-2">
                    {mode === 'video' ? '🎬' : mode === 'audio' ? '🎵' : mode === 'image' ? '🖼️' : '📄'}
                  </div>
                  <p className="font-medium text-white">{file.name}</p>
                  <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-2">📁</div>
                  <p className="text-gray-400">Click to select or drag & drop</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {mode === 'video' && 'MP4, WebM, MKV, AVI, MOV, GIF'}
                    {mode === 'audio' && 'MP3, WAV, FLAC, OGG, AAC, M4A'}
                    {mode === 'image' && 'PNG, JPG, WebP, GIF, BMP, ICO'}
                    {mode === 'document' && 'PDF, DOCX, TXT, Markdown'}
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Output Format */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Convert to:</label>
            <div className="flex flex-wrap gap-2">
              {formatOptions[mode].map((format) => (
                <button
                  key={format.ext}
                  onClick={() => setSelectedFormat(format.ext)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedFormat === format.ext
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {format.label} (.{format.ext})
                </button>
              ))}
            </div>
          </div>

          {/* Convert Button */}
          <div className="flex gap-3">
            <button
              onClick={convertFile}
              disabled={!file || converting}
              className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg font-bold transition disabled:opacity-50"
            >
              {converting ? '⏳ Converting...' : '🔄 Convert File'}
            </button>
            
            {convertedUrl && (
              <button
                onClick={downloadConverted}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition"
              >
                ⬇️ Download
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900/50 text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Preview */}
          {convertedUrl && mode === 'image' && (
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Preview:</h4>
              <img src={convertedUrl} alt="Converted" className="max-w-full rounded-lg border border-gray-600" />
            </div>
          )}

          {/* Info */}
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <h4 className="font-semibold mb-2">💡 How it works:</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Select a file to convert</li>
              <li>• Choose output format</li>
              <li>• Click convert - processing happens locally!</li>
              <li>• Download the converted file</li>
              <li>• For video/audio conversion, use ffmpeg.wasm (requires server setup)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
