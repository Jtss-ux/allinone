'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

const styles = ['modern', 'minimalist', 'vintage', 'playful', 'elegant', 'bold', 'geometric', 'hand-drawn', 'tech', 'organic'];

export default function LogoGenerator() {
    const [brandName, setBrandName] = useState('');
    const [style, setStyle] = useState('modern');
    const [colors, setColors] = useState('');
    const [industry, setIndustry] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!brandName.trim()) { setError('Please enter a brand name'); return; }
        setLoading(true); setError(''); setResult(null);
        try {
            const response = await axios.post(backendApi('/api/logo/generate'), { brandName, style, colors, industry });
            setResult(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to generate logo');
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8">
                <div className="text-center mb-6">
                    <div className="text-5xl mb-3">🎨</div>
                    <h3 className="text-2xl font-bold">AI Logo Generator</h3>
                    <p className="text-gray-400 mt-1">Generate professional logos with AI</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Brand Name *</label>
                        <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)}
                            placeholder="e.g., TechVault" className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Industry</label>
                        <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)}
                            placeholder="e.g., Technology, Food, Fashion" className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none" />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Style</label>
                    <div className="grid grid-cols-5 gap-2">
                        {styles.map((s) => (
                            <button key={s} onClick={() => setStyle(s)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${style === s ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Colors (optional)</label>
                    <input type="text" value={colors} onChange={(e) => setColors(e.target.value)}
                        placeholder="e.g., blue and white, red gradient" className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none" />
                </div>

                {error && <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg text-sm">{error}</div>}

                <button onClick={handleGenerate} disabled={loading}
                    className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50">
                    {loading ? '🎨 Generating Logo...' : '✨ Generate Logo'}
                </button>

                {result?.success && result.imageBase64 && (
                    <div className="mt-6 text-center">
                        <h4 className="font-semibold mb-3">✅ Your Logo</h4>
                        {result.provider && <span className="text-xs bg-gray-700 text-green-400 px-2 py-1 rounded mb-3 inline-block">🤖 {result.provider}</span>}
                        <img src={result.imageBase64} alt="Logo" className="max-w-md mx-auto rounded-lg border border-gray-600" />
                        <a href={result.imageBase64} download={`logo-${brandName}.png`}
                            className="inline-block w-full mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition">
                            ⬇️ Download Logo
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
