'use client';

import React, { useState, useRef } from 'react';

interface HandwritingStyle {
  id: string;
  name: string;
  font: string;
}

const handwritingStyles: HandwritingStyle[] = [
  { id: 'cursive', name: 'Cursive', font: 'Brush Script MT, cursive' },
  { id: 'print', name: 'Print', font: 'Comic Sans MS, cursive' },
  { id: 'marker', name: 'Marker', font: 'Marker Felt, fantasy' },
  { id: 'pencil', name: 'Pencil', font: 'Courier New, monospace' },
  { id: 'fountain', name: 'Fountain Pen', font: 'Lucida Handwriting, cursive' },
  { id: 'neat', name: 'Neat', font: 'Segoe Print, cursive' },
];

const paperTypes = [
  { id: 'lined', name: 'Lined Paper', color: '#fffaf0', lines: true },
  { id: 'blank', name: 'Blank', color: '#ffffff', lines: false },
  { id: 'grid', name: 'Grid Paper', color: '#f0f8ff', lines: 'grid' },
  { id: 'dark', name: 'Dark Mode', color: '#1a1a2e', lines: false },
];

export default function TextToHandwriting() {
  const [text, setText] = useState('Hello World!\nThis is your handwriting.\nMake it look handwritten!');
  const [style, setStyle] = useState('cursive');
  const [fontSize, setFontSize] = useState(24);
  const [inkColor, setInkColor] = useState('#000000');
  const [paper, setPaper] = useState('lined');
  const [spacing, setSpacing] = useState(1.5);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateHandwriting = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 1000;

    // Get paper settings
    const paperSetting = paperTypes.find(p => p.id === paper) || paperTypes[0];

    // Draw background
    ctx.fillStyle = paperSetting.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw lines if needed
    if (paperSetting.lines === true) {
      ctx.strokeStyle = '#a0c0e0';
      ctx.lineWidth = 1;
      for (let y = 80; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(canvas.width - 40, y);
        ctx.stroke();
      }
      // Draw margin
      ctx.strokeStyle = '#ff9999';
      ctx.beginPath();
      ctx.moveTo(100, 0);
      ctx.lineTo(100, canvas.height);
      ctx.stroke();
    } else if (paperSetting.lines === 'grid') {
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw text
    const handwritingFont = handwritingStyles.find(s => s.id === style)?.font || 'cursive';
    ctx.font = `${fontSize}px ${handwritingFont}`;
    ctx.fillStyle = inkColor;
    ctx.textBaseline = 'top';

    // Handle multi-line text
    const lines = text.split('\n');
    let y = 40;

    lines.forEach(line => {
      // Add slight rotation for realism
      ctx.save();
      
      // Add slight random offset for handwriting effect
      const offsetX = Math.random() * 2 - 1;
      const offsetY = Math.random() * 2 - 1;
      
      // Draw with slight shadow for depth
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 1;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      ctx.fillText(line, 120 + offsetX, y + offsetY);
      ctx.restore();
      
      y += fontSize * spacing;
    });
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `handwriting-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const copyToClipboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.toBlob(blob => {
      if (blob) {
        navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        alert('Copied to clipboard!');
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
          <h3 className="text-2xl font-bold">✍️ Text to Handwriting</h3>
          <p className="text-gray-200">Convert your text to handwritten notes!</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left - Controls */}
          <div className="p-6 border-r border-gray-700 space-y-6">
            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Enter your text:</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your text here..."
                className="w-full p-4 bg-gray-700 text-white rounded-lg border border-gray-600 h-40 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{text.length} characters</p>
            </div>

            {/* Handwriting Style */}
            <div>
              <label className="block text-sm font-medium mb-2">Handwriting Style:</label>
              <div className="grid grid-cols-3 gap-2">
                {handwritingStyles.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`p-3 rounded-lg text-center transition ${
                      style === s.id
                        ? 'bg-purple-600 ring-2 ring-purple-400'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    style={{ fontFamily: s.font }}
                  >
                    <span className="text-lg">Aa</span>
                    <span className="block text-xs mt-1 text-gray-400">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium mb-2">Font Size: {fontSize}px</label>
              <input
                type="range"
                min="12"
                max="48"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Ink Color */}
            <div>
              <label className="block text-sm font-medium mb-2">Ink Color:</label>
              <div className="flex flex-wrap gap-2">
                {['#000000', '#1a1a1a', '#333333', '#0066cc', '#cc0000', '#006600', '#660066', '#ff6600'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setInkColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${inkColor === color ? 'border-white' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Paper Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Paper Type:</label>
              <div className="grid grid-cols-2 gap-2">
                {paperTypes.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPaper(p.id)}
                    className={`p-3 rounded-lg text-center transition ${
                      paper === p.id
                        ? 'bg-purple-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <span className="text-sm">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Line Spacing */}
            <div>
              <label className="block text-sm font-medium mb-2">Line Spacing: {spacing}x</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={spacing}
                onChange={(e) => setSpacing(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={generateHandwriting}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg font-bold transition"
            >
              ✍️ Generate Handwriting
            </button>
          </div>

          {/* Right - Preview */}
          <div className="p-6 bg-gray-900">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">Preview</h4>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                >
                  📋 Copy
                </button>
                <button
                  onClick={downloadImage}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                  ⬇️ Download
                </button>
              </div>
            </div>

            {/* Canvas Preview */}
            <div className="bg-white rounded-lg overflow-hidden shadow-lg">
              <canvas
                ref={canvasRef}
                className="w-full"
                style={{ minHeight: '400px' }}
              />
            </div>

            {/* Tips */}
            <div className="mt-4 p-3 bg-gray-800 rounded-lg text-sm text-gray-400">
              <p>💡 Tips:</p>
              <ul className="mt-1 space-y-1">
                <li>• Use \n for new lines</li>
                <li>• Longer text will create a longer page</li>
                <li>• Download as PNG to use anywhere</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
