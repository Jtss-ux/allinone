'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

export default function StoryWriter() {
    const [prompt, setPrompt] = useState('');
    const [genre, setGenre] = useState('fantasy');
    const [length, setLength] = useState('medium');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const genres = ['fantasy', 'sci-fi', 'romance', 'horror', 'mystery', 'adventure', 'comedy', 'thriller', 'drama', 'fairy-tale'];

    const handleGenerate = async () => {
        if (!prompt.trim()) { setError('Please enter a story idea'); return; }
        setLoading(true); setError(''); setResult(null);
        try {
            const response = await axios.post(backendApi('/api/story/generate'), { prompt, genre, length });
            setResult(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to generate story');
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8">
                <div className="text-center mb-6">
                    <div className="text-5xl mb-3">📖</div>
                    <h3 className="text-2xl font-bold">AI Story Writer</h3>
                    <p className="text-gray-400 mt-1">Generate creative stories in any genre</p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Story Idea *</label>
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A wizard who discovers they can only use magic when they're asleep..."
                        className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none" rows={3} />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Genre</label>
                        <div className="grid grid-cols-5 gap-2">
                            {genres.map((g) => (
                                <button key={g} onClick={() => setGenre(g)}
                                    className={`px-2 py-1.5 rounded text-xs font-medium transition ${genre === g ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Length</label>
                        <div className="flex gap-2">
                            {['short', 'medium', 'long'].map((l) => (
                                <button key={l} onClick={() => setLength(l)}
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${length === l ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {error && <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg text-sm">{error}</div>}

                <button onClick={handleGenerate} disabled={loading}
                    className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50">
                    {loading ? '📝 Writing Story...' : '✨ Generate Story'}
                </button>

                {result?.success && result.story && (
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold">📖 Your {genre} Story</h4>
                            {result.provider && <span className="text-xs bg-gray-700 text-green-400 px-2 py-1 rounded">🤖 {result.provider}</span>}
                        </div>
                        <div className="bg-gray-900 rounded-lg p-6 prose prose-invert max-w-none whitespace-pre-wrap text-gray-200 leading-relaxed max-h-[600px] overflow-y-auto">
                            {result.story}
                        </div>
                        <button onClick={() => navigator.clipboard.writeText(result.story)}
                            className="w-full mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition">
                            📋 Copy Story
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
