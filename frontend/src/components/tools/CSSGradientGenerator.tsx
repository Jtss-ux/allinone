'use client';

import React, { useState } from 'react';

export default function CSSGradientGenerator() {
    const [color1, setColor1] = useState('#667eea');
    const [color2, setColor2] = useState('#764ba2');
    const [color3, setColor3] = useState('');
    const [angle, setAngle] = useState(135);
    const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
    const [copied, setCopied] = useState(false);

    const presets = [
        { name: 'Sunset', c1: '#f093fb', c2: '#f5576c' },
        { name: 'Ocean', c1: '#4facfe', c2: '#00f2fe' },
        { name: 'Forest', c1: '#38ef7d', c2: '#11998e' },
        { name: 'Lavender', c1: '#a18cd1', c2: '#fbc2eb' },
        { name: 'Fire', c1: '#f83600', c2: '#f9d423' },
        { name: 'Aurora', c1: '#667eea', c2: '#764ba2' },
        { name: 'Midnight', c1: '#232526', c2: '#414345' },
        { name: 'Peach', c1: '#ffecd2', c2: '#fcb69f' },
        { name: 'Neon', c1: '#00f260', c2: '#0575e6' },
        { name: 'Berry', c1: '#8e2de2', c2: '#4a00e0' },
    ];

    const buildGradient = () => {
        const colors = [color1, color2, ...(color3 ? [color3] : [])].join(', ');
        return gradientType === 'linear'
            ? `linear-gradient(${angle}deg, ${colors})`
            : `radial-gradient(circle, ${colors})`;
    };

    const cssCode = `background: ${buildGradient()};`;

    const tailwindCode = `bg-gradient-to-r from-[${color1}] to-[${color2}]${color3 ? ` via-[${color3}]` : ''}`;

    const copyCSS = () => {
        navigator.clipboard.writeText(cssCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl">🎨</div>
                    <div>
                        <h3 className="text-xl font-semibold">CSS Gradient Generator</h3>
                        <p className="text-sm text-gray-400">Create beautiful gradients with live preview</p>
                    </div>
                </div>

                {/* Preview */}
                <div className="w-full h-48 rounded-xl mb-6 border border-gray-600" style={{ background: buildGradient() }} />

                {/* Presets */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Presets</label>
                    <div className="flex flex-wrap gap-2">
                        {presets.map((p) => (
                            <button key={p.name} onClick={() => { setColor1(p.c1); setColor2(p.c2); setColor3(''); }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition">
                                <div className="w-4 h-4 rounded-full" style={{ background: `linear-gradient(135deg, ${p.c1}, ${p.c2})` }} />
                                {p.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <button onClick={() => setGradientType('linear')}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${gradientType === 'linear' ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                Linear
                            </button>
                            <button onClick={() => setGradientType('radial')}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${gradientType === 'radial' ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                Radial
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium mb-1">Color 1</label>
                                <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="w-full h-10 rounded cursor-pointer" />
                                <input type="text" value={color1} onChange={(e) => setColor1(e.target.value)}
                                    className="w-full mt-1 p-1 bg-gray-700 rounded text-xs text-center" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Color 2</label>
                                <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="w-full h-10 rounded cursor-pointer" />
                                <input type="text" value={color2} onChange={(e) => setColor2(e.target.value)}
                                    className="w-full mt-1 p-1 bg-gray-700 rounded text-xs text-center" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Color 3 (opt)</label>
                                <input type="color" value={color3 || '#ffffff'} onChange={(e) => setColor3(e.target.value)} className="w-full h-10 rounded cursor-pointer" />
                                <div className="flex gap-1 mt-1">
                                    <input type="text" value={color3} onChange={(e) => setColor3(e.target.value)}
                                        placeholder="none" className="w-full p-1 bg-gray-700 rounded text-xs text-center" />
                                    {color3 && <button onClick={() => setColor3('')} className="text-xs text-red-400">✕</button>}
                                </div>
                            </div>
                        </div>

                        {gradientType === 'linear' && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Angle: {angle}°</label>
                                <input type="range" min="0" max="360" value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-medium">CSS Code</label>
                                <button onClick={copyCSS} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs">
                                    {copied ? '✅ Copied!' : '📋 Copy'}
                                </button>
                            </div>
                            <div className="bg-gray-900 p-3 rounded-lg">
                                <code className="text-green-400 text-sm break-all">{cssCode}</code>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Tailwind</label>
                            <div className="bg-gray-900 p-3 rounded-lg">
                                <code className="text-cyan-400 text-sm break-all">{tailwindCode}</code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
