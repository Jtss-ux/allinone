'use client';

import React, { useState } from 'react';

export default function ColorTools() {
  const [hexColor, setHexColor] = useState('#4ade80');
  const [rgb, setRgb] = useState({ r: 74, g: 222, b: 128 });
  const [hsl, setHsl] = useState({ h: 142, s: 71, l: 58 });
  const [copied, setCopied] = useState('');

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const handleHexChange = (hex: string) => {
    setHexColor(hex);
    const newRgb = hexToRgb(hex);
    setRgb(newRgb);
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const generateRandomColor = () => {
    const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    handleHexChange(randomHex);
  };

  const shades = Array.from({ length: 9 }, (_, i) => {
    const factor = (i + 1) * 10;
    const r = Math.round(rgb.r + (255 - rgb.r) * (factor / 100));
    const g = Math.round(rgb.g + (255 - rgb.g) * (factor / 100));
    const b = Math.round(rgb.b + (255 - rgb.b) * (factor / 100));
    return `rgb(${r}, ${g}, ${b})`;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-4">
          <h3 className="text-2xl font-bold">🎨 Color Tools</h3>
          <p className="text-gray-200">Color picker, converter, and palette generator</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Color Picker */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Pick Color:</label>
              <input
                type="color"
                value={hexColor}
                onChange={(e) => handleHexChange(e.target.value)}
                className="w-full h-16 rounded-lg cursor-pointer"
              />
              <button
                onClick={generateRandomColor}
                className="w-full mt-2 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
              >
                🎲 Random Color
              </button>
            </div>

            <div 
              className="rounded-lg flex items-center justify-center"
              style={{ backgroundColor: hexColor, minHeight: '100px' }}
            >
              <span className="text-2xl font-bold" style={{ 
                color: (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) > 186 ? '#000' : '#fff'
              }}>
                Preview
              </span>
            </div>
          </div>

          {/* Color Values */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <label className="block text-sm font-medium mb-2">HEX</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hexColor}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="flex-1 p-2 bg-gray-800 rounded"
                />
                <button
                  onClick={() => copyToClipboard(hexColor, 'HEX')}
                  className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700"
                >
                  {copied === 'HEX' ? '✓' : '📋'}
                </button>
              </div>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
              <label className="block text-sm font-medium mb-2">RGB</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}
                  readOnly
                  className="flex-1 p-2 bg-gray-800 rounded"
                />
                <button
                  onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'RGB')}
                  className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700"
                >
                  {copied === 'RGB' ? '✓' : '📋'}
                </button>
              </div>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
              <label className="block text-sm font-medium mb-2">HSL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`}
                  readOnly
                  className="flex-1 p-2 bg-gray-800 rounded"
                />
                <button
                  onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'HSL')}
                  className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700"
                >
                  {copied === 'HSL' ? '✓' : '📋'}
                </button>
              </div>
            </div>
          </div>

          {/* Color Shades */}
          <div>
            <h4 className="font-semibold mb-3">Color Shades</h4>
            <div className="grid grid-cols-9 gap-1">
              {shades.map((shade, i) => (
                <div
                  key={i}
                  onClick={() => copyToClipboard(shade, `shade-${i}`)}
                  className="h-16 rounded cursor-pointer hover:scale-110 transition relative group"
                  style={{ backgroundColor: shade }}
                  title={shade}
                >
                  {copied === `shade-${i}` && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xs rounded">
                      ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
