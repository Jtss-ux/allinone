'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';

type DotStyle = 'square' | 'dots' | 'rounded' | 'diamond' | 'star';
type CornerStyle = 'square' | 'rounded' | 'dot' | 'diamond';

const DOT_STYLES: { id: DotStyle; label: string; icon: string }[] = [
  { id: 'square', label: 'Square', icon: '⬛' },
  { id: 'dots', label: 'Dots', icon: '⚫' },
  { id: 'rounded', label: 'Rounded', icon: '🔵' },
  { id: 'diamond', label: 'Diamond', icon: '💎' },
  { id: 'star', label: 'Star', icon: '⭐' },
];

const CORNER_STYLES: { id: CornerStyle; label: string; icon: string }[] = [
  { id: 'square', label: 'Square', icon: '⬛' },
  { id: 'rounded', label: 'Rounded', icon: '🔵' },
  { id: 'dot', label: 'Circle', icon: '⚫' },
  { id: 'diamond', label: 'Diamond', icon: '💎' },
];

export default function QRCodeGenerator() {
  const [text, setText] = useState('');
  const [size, setSize] = useState(300);
  const [color, setColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [dotStyle, setDotStyle] = useState<DotStyle>('square');
  const [cornerStyle, setCornerStyle] = useState<CornerStyle>('square');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generated, setGenerated] = useState(false);

  const drawDot = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, cellSize: number, style: DotStyle, fillColor: string) => {
    ctx.fillStyle = fillColor;
    const padding = cellSize * 0.1;
    const s = cellSize - padding * 2;
    const cx = x + cellSize / 2;
    const cy = y + cellSize / 2;
    const r = s / 2;

    switch (style) {
      case 'dots':
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'rounded':
        ctx.beginPath();
        const rr = s * 0.3;
        ctx.roundRect(x + padding, y + padding, s, s, rr);
        ctx.fill();
        break;
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(cx, y + padding);
        ctx.lineTo(x + padding + s, cy);
        ctx.lineTo(cx, y + padding + s);
        ctx.lineTo(x + padding, cy);
        ctx.closePath();
        ctx.fill();
        break;
      case 'star':
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const px = cx + r * Math.cos(angle);
          const py = cy + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        break;
      default: // square
        ctx.fillRect(x + padding, y + padding, s, s);
    }
  }, []);

  const drawCorner = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, cellSize: number, style: CornerStyle, fillColor: string) => {
    const outerSize = cellSize * 7;
    const innerOffset = cellSize;
    const innerSize = cellSize * 5;
    const coreOffset = cellSize * 2;
    const coreSize = cellSize * 3;

    // Outer border
    ctx.fillStyle = fillColor;
    switch (style) {
      case 'rounded':
        ctx.beginPath();
        ctx.roundRect(x, y, outerSize, outerSize, cellSize * 1.5);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(x + innerOffset, y + innerOffset, innerSize, innerSize, cellSize);
        ctx.fill();
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.roundRect(x + coreOffset, y + coreOffset, coreSize, coreSize, cellSize * 0.8);
        ctx.fill();
        break;
      case 'dot':
        ctx.beginPath();
        ctx.arc(x + outerSize / 2, y + outerSize / 2, outerSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x + outerSize / 2, y + outerSize / 2, innerSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(x + outerSize / 2, y + outerSize / 2, coreSize / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'diamond':
        const cx = x + outerSize / 2, cy = y + outerSize / 2;
        const drawDiamond = (size: number, col: string) => {
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.moveTo(cx, cy - size / 2);
          ctx.lineTo(cx + size / 2, cy);
          ctx.lineTo(cx, cy + size / 2);
          ctx.lineTo(cx - size / 2, cy);
          ctx.closePath();
          ctx.fill();
        };
        drawDiamond(outerSize, fillColor);
        drawDiamond(innerSize, '#ffffff');
        drawDiamond(coreSize, fillColor);
        break;
      default: // square
        ctx.fillRect(x, y, outerSize, outerSize);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + innerOffset, y + innerOffset, innerSize, innerSize);
        ctx.fillStyle = fillColor;
        ctx.fillRect(x + coreOffset, y + coreOffset, coreSize, coreSize);
    }
  }, []);

  const generateQR = useCallback(async () => {
    if (!text || !canvasRef.current) return;

    const qrData = await QRCode.create(text, { errorCorrectionLevel: errorLevel });
    const modules = qrData.modules;
    const moduleCount = modules.size;
    const cellSize = size / (moduleCount + 2); // +2 for quiet zone
    const canvas = canvasRef.current;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    const offset = cellSize; // quiet zone

    // Finder pattern positions (top-left, top-right, bottom-left)
    const finderPositions = [
      { row: 0, col: 0 },
      { row: 0, col: moduleCount - 7 },
      { row: moduleCount - 7, col: 0 },
    ];

    const isInFinder = (row: number, col: number) => {
      for (const fp of finderPositions) {
        if (row >= fp.row && row < fp.row + 7 && col >= fp.col && col < fp.col + 7) return true;
      }
      return false;
    };

    // Draw data dots (skip finder patterns)
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (modules.get(row, col) && !isInFinder(row, col)) {
          drawDot(ctx, offset + col * cellSize, offset + row * cellSize, cellSize, dotStyle, color);
        }
      }
    }

    // Draw finder patterns with corner style
    for (const fp of finderPositions) {
      // Clear the area first
      ctx.fillStyle = bgColor;
      ctx.fillRect(offset + fp.col * cellSize, offset + fp.row * cellSize, cellSize * 7, cellSize * 7);
      // Draw custom corner
      drawCorner(ctx, offset + fp.col * cellSize, offset + fp.row * cellSize, cellSize, cornerStyle, color);
    }

    setGenerated(true);
  }, [text, size, color, bgColor, dotStyle, cornerStyle, errorLevel, drawDot, drawCorner]);

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const downloadSVG = () => {
    if (!canvasRef.current) return;
    // Convert to SVG-compatible data URL
    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.jpg`;
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  // Auto-regenerate when settings change
  useEffect(() => {
    if (text && generated) {
      const timer = setTimeout(() => generateQR(), 200);
      return () => clearTimeout(timer);
    }
  }, [dotStyle, cornerStyle, color, bgColor, size, errorLevel, text, generated, generateQR]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4">
          <h3 className="text-2xl font-bold">📱 QR Code Generator</h3>
          <p className="text-gray-200">Custom shapes, colors, and styles</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left - Controls */}
          <div className="p-6 border-r border-gray-700 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Enter text or URL:</label>
              <textarea value={text} onChange={(e) => setText(e.target.value)}
                placeholder="https://example.com or any text..."
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 h-20 focus:border-blue-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Dot Shape</label>
              <div className="flex gap-2">
                {DOT_STYLES.map((s) => (
                  <button key={s.id} onClick={() => setDotStyle(s.id)}
                    className={`flex-1 px-2 py-2 rounded-lg text-sm font-medium transition ${dotStyle === s.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                    <div>{s.icon}</div>
                    <div className="text-xs mt-1">{s.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Corner Shape</label>
              <div className="flex gap-2">
                {CORNER_STYLES.map((s) => (
                  <button key={s.id} onClick={() => setCornerStyle(s.id)}
                    className={`flex-1 px-2 py-2 rounded-lg text-sm font-medium transition ${cornerStyle === s.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                    <div>{s.icon}</div>
                    <div className="text-xs mt-1">{s.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Size: {size}px</label>
              <input type="range" min="200" max="1024" step="50" value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">QR Color:</label>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-10 rounded cursor-pointer" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Background:</label>
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10 rounded cursor-pointer" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Error Correction</label>
              <div className="flex gap-2">
                {(['L', 'M', 'Q', 'H'] as const).map((level) => (
                  <button key={level} onClick={() => setErrorLevel(level)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${errorLevel === level ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                    {level} {level === 'L' ? '(7%)' : level === 'M' ? '(15%)' : level === 'Q' ? '(25%)' : '(30%)'}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generateQR} disabled={!text}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-bold transition disabled:opacity-50">
              📱 Generate QR Code
            </button>
          </div>

          {/* Right - Preview */}
          <div className="p-6 bg-gray-900 flex flex-col items-center justify-center">
            <canvas ref={canvasRef} className="rounded-lg" style={{ maxWidth: '100%', background: bgColor }} />
            {!generated && (
              <div className="w-64 h-64 bg-gray-700 rounded-lg flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📱</div>
                  <p>Enter text to generate</p>
                </div>
              </div>
            )}
            {generated && (
              <div className="flex gap-3 mt-4 w-full">
                <button onClick={downloadQR}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition">
                  ⬇️ Download PNG
                </button>
                <button onClick={downloadSVG}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition">
                  ⬇️ Download JPG
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
