'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

const PLATFORMS = ['Instagram', 'Twitter/X', 'TikTok', 'LinkedIn', 'YouTube', 'Facebook'];

export default function HashtagGenerator() {
    const [topic, setTopic] = useState('');
    const [platform, setPlatform] = useState('Instagram');
    const [count, setCount] = useState(30);
    const [loading, setLoading] = useState(false);
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) { setError('Please enter a topic'); return; }
        setLoading(true); setError(''); setHashtags([]);

        try {
            const response = await axios.post(backendApi('/api/hashtags/generate'), {
                topic, platform: platform.toLowerCase(), count,
            });
            if (response.data.success) {
                setHashtags(response.data.hashtags || []);
            } else { setError(response.data.error || 'Failed'); }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed');
        } finally { setLoading(false); }
    };

    const copyAll = () => {
        navigator.clipboard.writeText(hashtags.join(' '));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl">#️⃣</div>
                    <div>
                        <h3 className="text-xl font-semibold">Hashtag Generator</h3>
                        <p className="text-sm text-gray-400">Generate trending hashtags for any social media platform</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Topic / Content Description</label>
                        <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                            placeholder="E.g., fitness motivation, travel photography, tech startup..."
                            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none" />
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {PLATFORMS.map((p) => (
                            <button key={p} onClick={() => setPlatform(p)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${platform === p ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}>
                                {p}
                            </button>
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Number of hashtags: {count}</label>
                        <input type="range" min="10" max="50" value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full" />
                    </div>

                    {error && <div className="p-3 bg-red-900 text-red-100 rounded-lg text-sm">{error}</div>}

                    <button onClick={handleGenerate} disabled={loading}
                        className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50">
                        {loading ? '#️⃣ Generating...' : '#️⃣ Generate Hashtags'}
                    </button>

                    {hashtags.length > 0 && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold">✅ {hashtags.length} Hashtags Generated</h4>
                                <button onClick={copyAll} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">
                                    {copied ? '✅ Copied All!' : '📋 Copy All'}
                                </button>
                            </div>
                            <div className="bg-gray-900 rounded-lg p-4 flex flex-wrap gap-2">
                                {hashtags.map((tag, i) => (
                                    <button key={i} onClick={() => navigator.clipboard.writeText(tag)}
                                        className="px-3 py-1.5 bg-blue-900/40 text-blue-300 rounded-full text-sm hover:bg-blue-800/50 transition cursor-pointer">
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
