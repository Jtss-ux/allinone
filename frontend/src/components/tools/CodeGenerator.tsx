'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

const LANGUAGES = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go',
    'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'HTML/CSS', 'SQL', 'Bash',
];

export default function CodeGenerator() {
    const [prompt, setPrompt] = useState('');
    const [language, setLanguage] = useState('JavaScript');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [provider, setProvider] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please describe what code you want');
            return;
        }

        setLoading(true);
        setError('');
        setResult('');
        setProvider('');

        try {
            const response = await axios.post(backendApi('/api/code/generate'), {
                prompt,
                language: language.toLowerCase(),
            });

            if (response.data.success) {
                setResult(response.data.code);
                setProvider(response.data.provider || '');
            } else {
                setError(response.data.error || 'Failed to generate code');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to generate code');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl">💻</div>
                    <div>
                        <h3 className="text-xl font-semibold">AI Code Generator</h3>
                        <p className="text-sm text-gray-400">Generate code in any language using AI</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium mb-2">Describe what you want</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="E.g., A function that sorts an array using quicksort, A REST API endpoint for user authentication, A React component for a todo list..."
                            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Language</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                        >
                            {LANGUAGES.map((lang) => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Quick prompts */}
                <div className="mb-4 flex flex-wrap gap-2">
                    {[
                        'Fibonacci sequence',
                        'Binary search',
                        'REST API CRUD',
                        'Linked list',
                        'JWT authentication',
                        'Merge sort',
                    ].map((q) => (
                        <button
                            key={q}
                            onClick={() => setPrompt(q)}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-xs text-gray-300 transition"
                        >
                            {q}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg text-sm">{error}</div>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50"
                >
                    {loading ? '⚡ Generating Code...' : '⚡ Generate Code'}
                </button>

                {result && (
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">✅ Generated Code</h4>
                            <div className="flex items-center gap-2">
                                {provider && (
                                    <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                                        via {provider}
                                    </span>
                                )}
                                <button
                                    onClick={copyToClipboard}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition"
                                >
                                    {copied ? '✅ Copied!' : '📋 Copy'}
                                </button>
                            </div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-sm text-gray-200 whitespace-pre-wrap break-words">
                                <code>{result}</code>
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
