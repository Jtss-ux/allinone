'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

export default function ImageAnalyzer() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleAnalyze = async () => {
        if (!file) {
            setError('Please upload an image');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        const formData = new FormData();
        formData.append('image', file);
        formData.append('question', question);

        try {
            const response = await axios.post(backendApi('/api/image/analyze'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResult(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to analyze image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8 shadow-xl border border-gray-700">
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center">
                    <span className="mr-2 text-violet-400">👁️</span> AI Vision Analyzer
                </h3>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-gray-300">Upload Image</label>
                    <div className="flex items-center justify-center w-full mb-4">
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-600 border-dashed rounded-xl cursor-pointer bg-gray-900/50 hover:bg-gray-700 transition">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <p className="mb-2 text-sm text-gray-400 font-semibold">Click to upload image</p>
                                <p className="text-xs text-gray-500 uppercase tracking-tighter">Powered by Claude 3.5 Vision</p>
                            </div>
                            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                        </label>
                    </div>
                    {preview && (
                        <div className="mt-4 rounded-xl overflow-hidden border border-gray-700 max-h-48 flex justify-center bg-black/40 p-2">
                            <img src={preview} alt="Preview" className="h-full object-contain rounded" />
                        </div>
                    )}
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-gray-300">What should the AI look for?</label>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="E.g. What is the text in this image? or Describe the mood and objects visible."
                        className="w-full p-4 bg-gray-900 text-white rounded-xl border border-gray-600 focus:ring-2 focus:ring-violet-500 focus:outline-none transition resize-none"
                        rows={3}
                    />
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/50 text-red-200 border border-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleAnalyze}
                    disabled={loading || !file}
                    className="w-full px-6 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl font-bold text-white transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                            Claude is analyzing...
                        </span>
                    ) : 'Analyze with AI Vision'}
                </button>

                {result && (
                    <div className="mt-8 p-6 bg-gray-900/80 border border-violet-500/30 rounded-2xl animate-in fade-in zoom-in-95 duration-500">
                        <h4 className="font-bold text-violet-400 mb-4 flex items-center">
                            <span className="mr-2">📝</span> Analysis Result
                        </h4>
                        <div className="text-gray-200 leading-relaxed whitespace-pre-wrap text-sm sm:text-base selection:bg-violet-500/30">
                            {result.analysis}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest">
                            <span>Anthropic Vision Core</span>
                            <span className="bg-gray-800 px-2 py-0.5 rounded text-violet-300">Claude-3.5-Sonnet</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
