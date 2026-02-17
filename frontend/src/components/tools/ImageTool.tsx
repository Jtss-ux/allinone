'use client';

import React, { useState, useRef, useEffect } from 'react';

type ToolMode = 'resize' | 'crop' | 'rotate' | 'flip' | 'compress';

export default function ImageTool() {
  const [mode, setMode] = useState<ToolMode>('resize');
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [originalSize, setOriginalSize] = useState<{width: number, height: number} | null>(null);
  
  // Resize options
  const [newWidth, setNewWidth] = useState(800);
  const [newHeight, setNewHeight] = useState(600);
  const [maintainAspect, setMaintainAspect] = useState(true);
  
  // Crop options
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
  
  // Rotate options
  const [rotation, setRotation] = useState(0);
  
  // Flip options
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  
  // Compress options
  const [compression, setCompression] = useState(80);
  const [format, setFormat] = useState('image/jpeg');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setOriginalSize({ width: img.width, height: img.height });
          setNewWidth(img.width);
          setNewHeight(img.height);
        };
        setImage(event.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (image && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        canvasRef.current!.width = img.width;
        canvasRef.current!.height = img.height;
        const ctx = canvasRef.current!.getContext('2d');
        ctx?.drawImage(img, 0, 0);
      };
      img.src = image;
    }
  }, [image]);

  const processImage = () => {
    if (!image || !canvasRef.current) return;
    
    setLoading(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas size based on mode
      if (mode === 'resize') {
        canvas.width = newWidth;
        canvas.height = newHeight;
      } else if (mode === 'crop') {
        canvas.width = cropArea.width;
        canvas.height = cropArea.height;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }
      
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Save context state
      ctx.save();
      
      // Apply transformations
      if (mode === 'rotate' || mode === 'flip') {
        ctx.translate(canvas.width / 2, canvas.height / 2);
      }
      
      // Rotation
      if (mode === 'rotate') {
        ctx.rotate((rotation * Math.PI) / 180);
      }
      
      // Flip
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      
      if (mode === 'rotate' || mode === 'flip') {
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }
      
      // Draw image
      if (mode === 'crop') {
        ctx.drawImage(img, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 0, 0, cropArea.width, cropArea.height);
      } else if (mode === 'resize') {
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
      } else {
        ctx.drawImage(img, 0, 0);
      }
      
      ctx.restore();
      
      // Get processed image
      const quality = mode === 'compress' ? compression / 100 : 0.92;
      const result = canvas.toDataURL(format, quality);
      setProcessedImage(result);
      setLoading(false);
    };
    
    img.src = image;
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.download = `processed-${Date.now()}.${format === 'image/png' ? 'png' : 'jpg'}`;
    link.href = processedImage;
    link.click();
  };

  const resetImage = () => {
    setImage(null);
    setProcessedImage(null);
    setOriginalSize(null);
    setNewWidth(800);
    setNewHeight(600);
    setCropArea({ x: 0, y: 0, width: 100, height: 100 });
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const presetSizes = [
    { name: 'HD (1280x720)', width: 1280, height: 720 },
    { name: 'Full HD (1920x1080)', width: 1920, height: 1080 },
    { name: '4K (3840x2160)', width: 3840, height: 2160 },
    { name: 'Instagram (1080x1080)', width: 1080, height: 1080 },
    { name: 'Twitter (1600x900)', width: 1600, height: 900 },
    { name: 'YouTube Thumb (1280x720)', width: 1280, height: 720 },
    { name: 'Passport 2x2', width: 600, height: 600 },
    { name: 'Profile 400x400', width: 400, height: 400 },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4">
          <h3 className="text-2xl font-bold">🛠️ Image Tools (Like imResizer)</h3>
          <p className="text-gray-200">Resize, Crop, Rotate, Flip & Compress - All in one place!</p>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'resize', icon: '📏', label: 'Resize' },
            { id: 'crop', icon: '✂️', label: 'Crop' },
            { id: 'rotate', icon: '🔄', label: 'Rotate' },
            { id: 'flip', icon: '↔️', label: 'Flip' },
            { id: 'compress', icon: '📦', label: 'Compress' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id as ToolMode)}
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

        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left - Upload & Preview */}
          <div className="p-4 border-r border-gray-700">
            {/* Upload */}
            {!image && (
              <label className="block w-full p-12 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-green-500 transition">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <div className="text-5xl mb-4">📁</div>
                <p className="text-gray-400">Click to upload or drag & drop</p>
                <p className="text-sm text-gray-500 mt-2">JPG, PNG, WEBP, GIF supported</p>
              </label>
            )}

            {/* Preview */}
            {image && (
              <div className="space-y-4">
                <div className="relative bg-gray-900 rounded-lg p-2 min-h-[300px] flex items-center justify-center">
                  <img 
                    src={processedImage || image} 
                    alt="Preview" 
                    className="max-w-full max-h-[400px] object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={resetImage} className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg">
                    🔄 New Image
                  </button>
                  {processedImage && (
                    <button onClick={downloadImage} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
                      ⬇️ Download
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right - Controls */}
          <div className="p-4 bg-gray-900">
            {mode === 'resize' && (
              <div className="space-y-4">
                <h4 className="font-bold text-lg">📏 Resize Image</h4>
                
                {/* Preset Sizes */}
                <div>
                  <label className="block text-sm font-medium mb-2">Quick Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {presetSizes.map((size) => (
                      <button
                        key={size.name}
                        onClick={() => { setNewWidth(size.width); setNewHeight(size.height); }}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Width (px)</label>
                    <input
                      type="number"
                      value={newWidth}
                      onChange={(e) => {
                        setNewWidth(Number(e.target.value));
                        if (maintainAspect && originalSize) {
                          const ratio = originalSize.height / originalSize.width;
                          setNewHeight(Math.round(Number(e.target.value) * ratio));
                        }
                      }}
                      className="w-full p-2 bg-gray-700 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Height (px)</label>
                    <input
                      type="number"
                      value={newHeight}
                      onChange={(e) => {
                        setNewHeight(Number(e.target.value));
                        if (maintainAspect && originalSize) {
                          const ratio = originalSize.width / originalSize.height;
                          setNewWidth(Math.round(Number(e.target.value) * ratio));
                        }
                      }}
                      className="w-full p-2 bg-gray-700 rounded"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={maintainAspect}
                    onChange={(e) => setMaintainAspect(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Maintain aspect ratio</span>
                </label>

                {originalSize && (
                  <p className="text-sm text-gray-400">Original: {originalSize.width} x {originalSize.height}</p>
                )}
              </div>
            )}

            {mode === 'crop' && (
              <div className="space-y-4">
                <h4 className="font-bold text-lg">✂️ Crop Image</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">X Position</label>
                    <input
                      type="number"
                      value={cropArea.x}
                      onChange={(e) => setCropArea({...cropArea, x: Number(e.target.value)})}
                      className="w-full p-2 bg-gray-700 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Y Position</label>
                    <input
                      type="number"
                      value={cropArea.y}
                      onChange={(e) => setCropArea({...cropArea, y: Number(e.target.value)})}
                      className="w-full p-2 bg-gray-700 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Width</label>
                    <input
                      type="number"
                      value={cropArea.width}
                      onChange={(e) => setCropArea({...cropArea, width: Number(e.target.value)})}
                      className="w-full p-2 bg-gray-700 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Height</label>
                    <input
                      type="number"
                      value={cropArea.height}
                      onChange={(e) => setCropArea({...cropArea, height: Number(e.target.value)})}
                      className="w-full p-2 bg-gray-700 rounded"
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Drag crop area in a real app, or use AI-powered smart crop
                </div>
              </div>
            )}

            {mode === 'rotate' && (
              <div className="space-y-4">
                <h4 className="font-bold text-lg">🔄 Rotate Image</h4>
                <div>
                  <label className="block text-sm font-medium mb-2">Rotation: {rotation}°</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 90, 180, 270].map((angle) => (
                    <button
                      key={angle}
                      onClick={() => setRotation(angle)}
                      className={`py-2 rounded ${rotation === angle ? 'bg-green-600' : 'bg-gray-700'}`}
                    >
                      {angle}°
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mode === 'flip' && (
              <div className="space-y-4">
                <h4 className="font-bold text-lg">↔️ Flip Image</h4>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setFlipH(!flipH)}
                    className={`p-6 rounded-lg text-center transition ${
                      flipH ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="text-3xl mb-2">↔️</div>
                    <div>Flip Horizontal</div>
                  </button>
                  <button
                    onClick={() => setFlipV(!flipV)}
                    className={`p-6 rounded-lg text-center transition ${
                      flipV ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="text-3xl mb-2">↕️</div>
                    <div>Flip Vertical</div>
                  </button>
                </div>
                {(flipH || flipV) && (
                  <button
                    onClick={() => { setFlipH(false); setFlipV(false); }}
                    className="w-full py-2 bg-gray-600 rounded"
                  >
                    Reset Flip
                  </button>
                )}
              </div>
            )}

            {mode === 'compress' && (
              <div className="space-y-4">
                <h4 className="font-bold text-lg">📦 Compress Image</h4>
                <div>
                  <label className="block text-sm font-medium mb-2">Quality: {compression}%</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={compression}
                    onChange={(e) => setCompression(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Smallest</span>
                    <span>Best Quality</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Output Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full p-2 bg-gray-700 rounded"
                  >
                    <option value="image/jpeg">JPEG (.jpg)</option>
                    <option value="image/png">PNG (.png)</option>
                    <option value="image/webp">WebP (.webp)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Process Button */}
            {image && (
              <button
                onClick={processImage}
                disabled={loading}
                className="w-full mt-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition disabled:opacity-50"
              >
                {loading ? '⏳ Processing...' : `✨ ${mode.charAt(0).toUpperCase() + mode.slice(1)} Image`}
              </button>
            )}

            {/* Hidden Canvas */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      </div>
    </div>
  );
}
