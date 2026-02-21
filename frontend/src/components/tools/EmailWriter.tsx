'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

const TONES = ['Professional', 'Friendly', 'Formal', 'Casual', 'Urgent', 'Apologetic', 'Thankful', 'Persuasive'];

const QUICK_TEMPLATES = [
    { label: 'Follow Up', prompt: 'Follow up on a previous conversation or meeting' },
    { label: 'Thank You', prompt: 'Thank someone for their help or time' },
    { label: 'Introduction', prompt: 'Introduce myself and my company/project' },
    { label: 'Request', prompt: 'Request information or a meeting' },
    { label: 'Apology', prompt: 'Apologize for a delay or mistake' },
    { label: 'Invitation', prompt: 'Invite someone to an event or meeting' },
    { label: 'Feedback', prompt: 'Provide constructive feedback' },
    { label: 'Application', prompt: 'Apply for a job or opportunity' },
];

export default function EmailWriter() {
    const [purpose, setPurpose] = useState('');
    const [recipient, setRecipient] = useState('');
    const [tone, setTone] = useState('Professional');
    const [context, setContext] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!purpose.trim()) { setError('Please describe the email purpose'); return; }
        setLoading(true); setError(''); setResult('');

        try {
            const response = await axios.post(backendApi('/api/email/generate'), {
                purpose, tone: tone.toLowerCase(), recipient, context,
            });
            if (response.data.success) { setResult(response.data.email); }
            else { setError(response.data.error || 'Failed'); }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl">📧</div>
                    <div>
                        <h3 className="text-xl font-semibold">AI Email Writer</h3>
                        <p className="text-sm text-gray-400">Compose professional emails in seconds</p>
                    </div>
                </div>

                {/* Quick Templates */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Quick Templates</label>
                    <div className="flex flex-wrap gap-2">
                        {QUICK_TEMPLATES.map((qt) => (
                            <button key={qt.label} onClick={() => setPurpose(qt.prompt)}
                                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-full text-xs text-gray-300 transition">
                                {qt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Email Purpose</label>
                        <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)}
                            placeholder="E.g., Ask my professor for an extension on the assignment deadline..."
                            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none" rows={2} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Recipient (optional)</label>
                            <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)}
                                placeholder="E.g., my manager, hiring team, client..."
                                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Tone</label>
                            <select value={tone} onChange={(e) => setTone(e.target.value)}
                                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none">
                                {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Additional Context (optional)</label>
                        <input type="text" value={context} onChange={(e) => setContext(e.target.value)}
                            placeholder="E.g., We met at the conference last week, The deadline is Friday..."
                            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none" />
                    </div>

                    {error && <div className="p-3 bg-red-900 text-red-100 rounded-lg text-sm">{error}</div>}

                    <button onClick={handleGenerate} disabled={loading}
                        className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50">
                        {loading ? '📧 Writing Email...' : '📧 Generate Email'}
                    </button>

                    {result && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">✅ Generated Email</h4>
                                <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">{copied ? '✅ Copied!' : '📋 Copy'}</button>
                            </div>
                            <div className="bg-gray-900 rounded-lg p-6 overflow-y-auto max-h-96">
                                <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">{result}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
