'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

export default function YouTubeSummarizer() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleSummarize = async () => {
        if (!url.trim()) {
            setError('Please enter a YouTube URL');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await axios.post(backendApi('/api/youtube/summarize'), { url });
            setResult(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to summarize video');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="text-8xl text-red-600 font-bold italic">YT</span>
                </div>

                <h3 className="text-2xl font-extrabold mb-8 text-white flex items-center relative z-10">
                    <span className="mr-3 p-2 bg-red-600 rounded-lg shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                    </span>
                    YouTube AI Summarizer
                </h3>

                <div className="mb-8 relative z-10">
                    <label className="block text-sm font-bold mb-3 text-gray-400 uppercase tracking-widest px-1">Video Link</label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full p-5 pr-14 bg-gray-900/80 backdrop-blur text-white rounded-2xl border-2 border-gray-700 group-hover:border-red-500/50 focus:border-red-600 focus:outline-none focus:ring-4 focus:ring-red-600/10 transition-all font-medium"
                        />
                        {url && (
                            <button
                                onClick={() => setUrl('')}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                    <p className="mt-3 text-xs text-gray-500 px-2 italic">Works with any public video containing auto-generated or manual captions.</p>
                </div>

                {error && (
                    <div className="mb-8 p-5 bg-red-950/30 text-red-300 border border-red-900/50 rounded-2xl text-sm flex items-start gap-4 animate-in slide-in-from-top-2">
                        <span className="text-xl">⚠️</span>
                        <p className="leading-relaxed">{error}</p>
                    </div>
                )}

                <button
                    onClick={handleSummarize}
                    disabled={loading || !url}
                    className="w-full px-6 py-5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 rounded-2xl font-black text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl hover:shadow-red-600/20 active:scale-[0.98]"
                >
                    {loading ? (
                        <>
                            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                            <span>Transcribing & Analyzing...</span>
                        </>
                    ) : (
                        <>
                            <span>Generate AI Summary</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </>
                    )}
                </button>

                {result && (
                    <div className="mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
                        <div className="p-8 bg-gray-900/60 backdrop-blur rounded-3xl border border-gray-700/50 shadow-inner">
                            <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
                                <h4 className="text-xl font-bold text-white flex items-center">
                                    <span className="mr-3 text-red-500">✨</span> Video Summary
                                </h4>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(result.summary);
                                        alert('Summary copied to clipboard!');
                                    }}
                                    className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors border border-gray-700"
                                >
                                    Copy Text
                                </button>
                            </div>
                            <div className="text-gray-200 whitespace-pre-wrap leading-[1.8] text-sm sm:text-base selection:bg-red-600/30">
                                {result.summary}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Analysis Engine Active</span>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-full border border-gray-800 shadow-sm">
                                <span className="text-[10px] text-gray-500">POWERED BY</span>
                                <span className="text-xs font-black text-red-500">{result.provider.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
