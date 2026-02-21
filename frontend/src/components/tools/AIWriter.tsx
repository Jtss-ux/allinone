'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

const CONTENT_TYPES = [
    { id: 'blog post', name: 'Blog Post', icon: '📝' },
    { id: 'article', name: 'Article', icon: '📰' },
    { id: 'story', name: 'Short Story', icon: '📖' },
    { id: 'essay', name: 'Essay', icon: '🎓' },
    { id: 'product description', name: 'Product Description', icon: '🛍️' },
    { id: 'social media post', name: 'Social Media Post', icon: '📱' },
    { id: 'press release', name: 'Press Release', icon: '📢' },
    { id: 'poem', name: 'Poem', icon: '🌸' },
];

const TONES = ['Informative', 'Professional', 'Casual', 'Humorous', 'Persuasive', 'Inspirational', 'Academic', 'Creative'];
const LENGTHS = [
    { id: 'short', name: 'Short (200-300 words)' },
    { id: 'medium', name: 'Medium (500-700 words)' },
    { id: 'long', name: 'Long (1000-1500 words)' },
];

export default function AIWriter() {
    const [topic, setTopic] = useState('');
    const [contentType, setContentType] = useState('blog post');
    const [tone, setTone] = useState('Informative');
    const [length, setLength] = useState('medium');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [provider, setProvider] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) { setError('Please enter a topic'); return; }
        setLoading(true); setError(''); setResult('');

        try {
            const response = await axios.post(backendApi('/api/content/generate'), {
                topic, type: contentType, tone: tone.toLowerCase(), length,
            });
            if (response.data.success) {
                setResult(response.data.content);
                setProvider(response.data.provider || '');
            } else { setError(response.data.error || 'Failed'); }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to generate content');
        } finally { setLoading(false); }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadAsFile = () => {
        const blob = new Blob([result], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${topic.replace(/[^a-z0-9]/gi, '_')}.md`;
        a.click(); URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl">✍️</div>
                    <div>
                        <h3 className="text-xl font-semibold">AI Content Writer</h3>
                        <p className="text-sm text-gray-400">Generate articles, stories, blog posts, and more with AI</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Topic / Subject</label>
                        <textarea
                            value={topic} onChange={(e) => setTopic(e.target.value)}
                            placeholder="E.g., The Future of AI in Healthcare, 10 Tips for Better Sleep..." rows={2}
                            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {CONTENT_TYPES.map((ct) => (
                            <button key={ct.id} onClick={() => setContentType(ct.id)}
                                className={`p-2 rounded-lg text-sm transition ${contentType === ct.id ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                                {ct.icon} {ct.name}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Tone</label>
                            <select value={tone} onChange={(e) => setTone(e.target.value)}
                                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none">
                                {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Length</label>
                            <select value={length} onChange={(e) => setLength(e.target.value)}
                                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none">
                                {LENGTHS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {error && <div className="p-3 bg-red-900 text-red-100 rounded-lg text-sm">{error}</div>}

                    <button onClick={handleGenerate} disabled={loading}
                        className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50 text-lg">
                        {loading ? '✍️ Writing...' : '✍️ Generate Content'}
                    </button>

                    {result && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">✅ Generated Content</h4>
                                <div className="flex gap-2">
                                    {provider && <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-400">via {provider}</span>}
                                    <button onClick={copyToClipboard} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">{copied ? '✅ Copied!' : '📋 Copy'}</button>
                                    <button onClick={downloadAsFile} className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm">⬇️ Download</button>
                                </div>
                            </div>
                            <div className="bg-gray-900 rounded-lg p-6 max-h-96 overflow-y-auto">
                                <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">{result}</div>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">{result.split(/\s+/).length} words</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
