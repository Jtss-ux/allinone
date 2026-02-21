'use client';

import React, { useState, useRef } from 'react';

export default function ImageCompressor() {
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalUrl, setOriginalUrl] = useState('');
    const [compressedUrl, setCompressedUrl] = useState('');
    const [quality, setQuality] = useState(70);
    const [maxWidth, setMaxWidth] = useState(1920);
    const [originalSize, setOriginalSize] = useState(0);
    const [compressedSize, setCompressedSize] = useState(0);
    const [format, setFormat] = useState<'jpeg' | 'webp' | 'png'>('jpeg');
    const [processing, setProcessing] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleFile = (file: File) => {
        setOriginalFile(file);
        setOriginalSize(file.size);
        setOriginalUrl(URL.createObjectURL(file));
        setCompressedUrl('');
        setCompressedSize(0);
    };

    const compress = async () => {
        if (!originalFile) return;
        setProcessing(true);

        const img = new Image();
        img.src = originalUrl;
        await new Promise(resolve => { img.onload = resolve; });

        const canvas = canvasRef.current || document.createElement('canvas');
        let w = img.width;
        let h = img.height;

        if (w > maxWidth) {
            h = Math.round(h * (maxWidth / w));
            w = maxWidth;
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);

        const mimeType = format === 'webp' ? 'image/webp' : format === 'png' ? 'image/png' : 'image/jpeg';
        const q = format === 'png' ? undefined : quality / 100;

        canvas.toBlob((blob) => {
            if (blob) {
                setCompressedSize(blob.size);
                setCompressedUrl(URL.createObjectURL(blob));
            }
            setProcessing(false);
        }, mimeType, q);
    };

    const download = () => {
        if (!compressedUrl) return;
        const a = document.createElement('a');
        a.href = compressedUrl;
        a.download = `compressed_${originalFile?.name || 'image'}.${format}`;
        a.click();
    };

    const formatBytes = (b: number) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
    const savings = originalSize > 0 && compressedSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">🗜️</span>
                    <div>
                        <h3 className="text-xl font-semibold">Image Compressor</h3>
                        <p className="text-sm text-gray-400">Compress and optimize images — like TinyPNG, but right here</p>
                    </div>
                </div>

                {/* Upload */}
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-green-500 transition cursor-pointer mb-6"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                    <div className="text-4xl mb-2">📁</div>
                    <p className="text-gray-300">Drop an image or click to select</p>
                </div>

                {originalUrl && (
                    <>
                        {/* Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Quality: {quality}%</label>
                                <input type="range" min="10" max="100" value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Max Width: {maxWidth}px</label>
                                <input type="range" min="320" max="3840" step="160" value={maxWidth} onChange={e => setMaxWidth(Number(e.target.value))} className="w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Format</label>
                                <div className="flex gap-2">
                                    {(['jpeg', 'webp', 'png'] as const).map(f => (
                                        <button key={f} onClick={() => setFormat(f)}
                                            className={`flex-1 py-2 rounded-lg text-sm transition ${format === f ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                            {f.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button onClick={compress} disabled={processing}
                            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50 mb-6">
                            {processing ? '🗜️ Compressing...' : '🗜️ Compress Image'}
                        </button>

                        {/* Comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-gray-400 mb-1">Original — {formatBytes(originalSize)}</div>
                                <img src={originalUrl} alt="Original" className="w-full rounded-lg bg-gray-900 object-contain max-h-64" />
                            </div>
                            {compressedUrl && (
                                <div>
                                    <div className="text-sm mb-1 flex justify-between">
                                        <span className="text-gray-400">Compressed — {formatBytes(compressedSize)}</span>
                                        <span className={`font-bold ${savings > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {savings > 0 ? `−${savings}% saved!` : 'Larger'}
                                        </span>
                                    </div>
                                    <img src={compressedUrl} alt="Compressed" className="w-full rounded-lg bg-gray-900 object-contain max-h-64" />
                                </div>
                            )}
                        </div>

                        {compressedUrl && (
                            <button onClick={download} className="w-full mt-4 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition">
                                ⬇️ Download Compressed ({formatBytes(compressedSize)})
                            </button>
                        )}
                    </>
                )}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
}
