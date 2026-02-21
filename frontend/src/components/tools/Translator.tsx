'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'tr', name: 'Turkish' },
    { code: 'pl', name: 'Polish' },
    { code: 'nl', name: 'Dutch' },
    { code: 'sv', name: 'Swedish' },
    { code: 'da', name: 'Danish' },
    { code: 'fi', name: 'Finnish' },
    { code: 'no', name: 'Norwegian' },
    { code: 'th', name: 'Thai' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'id', name: 'Indonesian' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'cs', name: 'Czech' },
    { code: 'el', name: 'Greek' },
    { code: 'he', name: 'Hebrew' },
    { code: 'ro', name: 'Romanian' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'bn', name: 'Bengali' },
    { code: 'ms', name: 'Malay' },
];

export default function Translator() {
    const [inputText, setInputText] = useState('');
    const [sourceLang, setSourceLang] = useState('auto');
    const [targetLang, setTargetLang] = useState('es');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [provider, setProvider] = useState('');
    const [error, setError] = useState('');

    const handleTranslate = async () => {
        if (!inputText.trim()) {
            setError('Please enter text to translate');
            return;
        }

        setLoading(true);
        setError('');
        setResult('');
        setProvider('');

        try {
            const response = await axios.post(backendApi('/api/translate'), {
                text: inputText,
                sourceLang,
                targetLang,
            });

            if (response.data.success) {
                setResult(response.data.translatedText);
                setProvider(response.data.provider || '');
            } else {
                setError(response.data.error || 'Translation failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Translation failed');
        } finally {
            setLoading(false);
        }
    };

    const swapLanguages = () => {
        if (sourceLang !== 'auto') {
            const temp = sourceLang;
            setSourceLang(targetLang);
            setTargetLang(temp);
            if (result) {
                setInputText(result);
                setResult('');
            }
        }
    };

    const copyResult = () => {
        navigator.clipboard.writeText(result);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl">🌐</div>
                    <div>
                        <h3 className="text-xl font-semibold">AI Translator</h3>
                        <p className="text-sm text-gray-400">Translate text between 30+ languages</p>
                    </div>
                </div>

                {/* Language selectors */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">From</label>
                        <select
                            value={sourceLang}
                            onChange={(e) => setSourceLang(e.target.value)}
                            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                        >
                            <option value="auto">Auto Detect</option>
                            {LANGUAGES.map((lang) => (
                                <option key={`src-${lang.code}`} value={lang.code}>{lang.name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={swapLanguages}
                        className="mt-6 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                        title="Swap languages"
                    >
                        🔄
                    </button>

                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">To</label>
                        <select
                            value={targetLang}
                            onChange={(e) => setTargetLang(e.target.value)}
                            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                        >
                            {LANGUAGES.map((lang) => (
                                <option key={`tgt-${lang.code}`} value={lang.code}>{lang.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Input / Output */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Original Text</label>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Enter text to translate..."
                            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none h-40"
                        />
                        <div className="text-xs text-gray-500 mt-1">{inputText.length} characters</div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium">Translation</label>
                            {result && (
                                <button
                                    onClick={copyResult}
                                    className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition"
                                >
                                    📋 Copy
                                </button>
                            )}
                        </div>
                        <div className="w-full p-3 bg-gray-900 text-gray-200 rounded-lg border border-gray-600 h-40 overflow-y-auto whitespace-pre-wrap">
                            {loading ? (
                                <span className="text-gray-500 animate-pulse">Translating...</span>
                            ) : result ? (
                                result
                            ) : (
                                <span className="text-gray-500">Translation will appear here</span>
                            )}
                        </div>
                        {provider && (
                            <div className="text-xs text-gray-500 mt-1">via {provider}</div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg text-sm">{error}</div>
                )}

                <button
                    onClick={handleTranslate}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50"
                >
                    {loading ? '🌐 Translating...' : '🌐 Translate'}
                </button>
            </div>
        </div>
    );
}
