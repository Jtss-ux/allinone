'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

export default function SEOGenerator() {
    const [topic, setTopic] = useState('');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!topic.trim()) { setError('Please enter a topic'); return; }
        setLoading(true); setError(''); setResult(null);
        try {
            const response = await axios.post(backendApi('/api/seo/generate'), { topic, url });
            setResult(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to generate SEO meta');
        } finally { setLoading(false); }
    };

    const copyField = (text: string) => navigator.clipboard.writeText(text);

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8">
                <div className="text-center mb-6">
                    <div className="text-5xl mb-3">🔍</div>
                    <h3 className="text-2xl font-bold">SEO Meta Generator</h3>
                    <p className="text-gray-400 mt-1">Generate optimized meta tags, titles & keywords</p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Topic / Page Content *</label>
                    <textarea value={topic} onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., Online store selling handmade leather bags..." rows={3}
                        className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none" />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">URL (optional)</label>
                    <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com"
                        className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none" />
                </div>

                {error && <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg text-sm">{error}</div>}

                <button onClick={handleGenerate} disabled={loading}
                    className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50">
                    {loading ? '🔍 Generating SEO...' : '✨ Generate SEO Meta'}
                </button>

                {result?.success && result.seo && !result.seo.raw && (
                    <div className="mt-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold">✅ SEO Meta Tags</h4>
                            {result.provider && <span className="text-xs bg-gray-700 text-green-400 px-2 py-1 rounded">🤖 {result.provider}</span>}
                        </div>

                        {[
                            { label: 'Title Tag', value: result.seo.title, max: 60 },
                            { label: 'Meta Description', value: result.seo.description, max: 160 },
                            { label: 'H1 Heading', value: result.seo.h1 },
                            { label: 'URL Slug', value: result.seo.slug },
                            { label: 'OG Title', value: result.seo.og_title },
                            { label: 'OG Description', value: result.seo.og_description },
                        ].map((field) => field.value && (
                            <div key={field.label} className="bg-gray-900 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-400">{field.label}</span>
                                    <div className="flex gap-2 items-center">
                                        {field.max && <span className={`text-xs ${field.value.length > field.max ? 'text-red-400' : 'text-green-400'}`}>{field.value.length}/{field.max}</span>}
                                        <button onClick={() => copyField(field.value)} className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition">📋</button>
                                    </div>
                                </div>
                                <p className="text-white">{field.value}</p>
                            </div>
                        ))}

                        {result.seo.keywords && (
                            <div className="bg-gray-900 rounded-lg p-4">
                                <span className="text-sm font-medium text-gray-400">Keywords</span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {result.seo.keywords.map((kw: string, i: number) => (
                                        <span key={i} className="bg-gray-700 text-green-400 px-3 py-1 rounded-full text-sm">{kw}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
