'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

const platforms = [
    { id: 'twitter', label: 'Twitter/X', icon: '🐦' },
    { id: 'instagram', label: 'Instagram', icon: '📸' },
    { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { id: 'facebook', label: 'Facebook', icon: '📘' },
    { id: 'tiktok', label: 'TikTok', icon: '🎵' },
];

export default function SocialPostGenerator() {
    const [topic, setTopic] = useState('');
    const [platform, setPlatform] = useState('twitter');
    const [tone, setTone] = useState('professional');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!topic.trim()) { setError('Please enter a topic'); return; }
        setLoading(true); setError(''); setResult(null);
        try {
            const response = await axios.post(backendApi('/api/social/generate'), { topic, platform, tone });
            setResult(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to generate post');
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8">
                <div className="text-center mb-6">
                    <div className="text-5xl mb-3">📱</div>
                    <h3 className="text-2xl font-bold">Social Media Post Generator</h3>
                    <p className="text-gray-400 mt-1">Create platform-specific posts with AI</p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">What's your post about? *</label>
                    <textarea value={topic} onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., Launching our new sustainable fashion collection..."
                        className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none" rows={3} />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Platform</label>
                    <div className="flex gap-2">
                        {platforms.map((p) => (
                            <button key={p.id} onClick={() => setPlatform(p.id)}
                                className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition ${platform === p.id ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                                {p.icon} {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Tone</label>
                    <div className="flex gap-2">
                        {['professional', 'casual', 'funny', 'inspirational', 'educational'].map((t) => (
                            <button key={t} onClick={() => setTone(t)}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition capitalize ${tone === t ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {error && <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg text-sm">{error}</div>}

                <button onClick={handleGenerate} disabled={loading}
                    className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50">
                    {loading ? '📝 Writing Post...' : '✨ Generate Post'}
                </button>

                {result?.success && result.post && (
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold">✅ {platforms.find(p => p.id === platform)?.icon} {platform} Post</h4>
                            {result.provider && <span className="text-xs bg-gray-700 text-green-400 px-2 py-1 rounded">🤖 {result.provider}</span>}
                        </div>
                        <div className="bg-gray-900 rounded-lg p-6 whitespace-pre-wrap text-gray-200 leading-relaxed">
                            {result.post}
                        </div>
                        <button onClick={() => navigator.clipboard.writeText(result.post)}
                            className="w-full mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition">
                            📋 Copy Post
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
