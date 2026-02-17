'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Point {
  x: number;
  y: number;
}

interface DrawingPath {
  points: Point[];
  color: string;
  width: number;
}

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState(3);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const point = getCoordinates(e);
    setCurrentPath({
      points: [point],
      color: tool === 'eraser' ? '#ffffff' : color,
      width: brushWidth,
    });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentPath) return;
    
    const point = getCoordinates(e);
    const newPath = {
      ...currentPath,
      points: [...currentPath.points, point],
    };
    setCurrentPath(newPath);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.strokeStyle = newPath.color;
      ctx.lineWidth = newPath.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      const lastPoint = newPath.points[newPath.points.length - 2];
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (currentPath) {
      setPaths([...paths, currentPath]);
    }
    setIsDrawing(false);
    setCurrentPath(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    setPaths([]);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const colors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
    '#ffc0cb', '#a52a2a', '#808080', '#008000', '#000080',
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-4">
          <h3 className="text-2xl font-bold">🎨 Whiteboard</h3>
          <p className="text-gray-200">Draw, sketch, and collaborate</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-700 border-b border-gray-600">
          {/* Tools */}
          <div className="flex gap-2">
            <button
              onClick={() => setTool('brush')}
              className={`p-2 rounded-lg ${tool === 'brush' ? 'bg-blue-600' : 'bg-gray-600'}`}
            >
              🖌️ Brush
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`p-2 rounded-lg ${tool === 'eraser' ? 'bg-blue-600' : 'bg-gray-600'}`}
            >
              🧹 Eraser
            </button>
          </div>

          {/* Colors */}
          <div className="flex flex-wrap gap-1 max-w-xs">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => { setColor(c); setTool('brush'); }}
                className={`w-8 h-8 rounded border-2 ${color === c ? 'border-white' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Brush Size */}
          <div className="flex items-center gap-2">
            <span className="text-sm">Size:</span>
            <input
              type="range"
              min="1"
              max="50"
              value={brushWidth}
              onChange={(e) => setBrushWidth(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm w-8">{brushWidth}px</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={clearCanvas}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
            >
              🗑️ Clear
            </button>
            <button
              onClick={downloadCanvas}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
            >
              ⬇️ Save
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="p-4 bg-gray-900">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full h-[500px] bg-white rounded-lg cursor-crosshair shadow-lg"
            style={{ touchAction: 'none' }}
          />
        </div>

        {/* Instructions */}
        <div className="p-4 bg-gray-800 text-sm text-gray-400">
          <p>💡 Tip: Use the brush to draw, eraser to remove, and clear to start fresh. Download your drawing when finished!</p>
        </div>
      </div>
    </div>
  );
}
