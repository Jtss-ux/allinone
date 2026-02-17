'use client';

import React, { useState } from 'react';
import QRCode from 'qrcode';

export default function QRCodeGenerator() {
  const [text, setText] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [size, setSize] = useState(256);
  const [color, setColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');

  const generateQR = async () => {
    if (!text) return;
    try {
      const url = await QRCode.toDataURL(text, {
        width: size,
        color: {
          dark: color,
          light: bgColor,
        },
      });
      setQrCode(url);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.png`;
    link.href = qrCode;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4">
          <h3 className="text-2xl font-bold">📱 QR Code Generator</h3>
          <p className="text-gray-200">Generate QR codes for URLs, text, WiFi, and more!</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left - Input */}
          <div className="p-6 border-r border-gray-700 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Enter text or URL:</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="https://example.com or any text..."
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Size: {size}px</label>
              <input
                type="range"
                min="128"
                max="1024"
                step="64"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">QR Color:</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-10 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Background:</label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-10 rounded"
                />
              </div>
            </div>

            <button
              onClick={generateQR}
              disabled={!text}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-bold transition disabled:opacity-50"
            >
              📱 Generate QR Code
            </button>
          </div>

          {/* Right - Preview */}
          <div className="p-6 bg-gray-900">
            <div className="flex flex-col items-center">
              {qrCode ? (
                <>
                  <img src={qrCode} alt="QR Code" className="bg-white p-4 rounded-lg" />
                  <button
                    onClick={downloadQR}
                    className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
                  >
                    ⬇️ Download PNG
                  </button>
                </>
              ) : (
                <div className="w-64 h-64 bg-gray-700 rounded-lg flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📱</div>
                    <p>Enter text to generate</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
