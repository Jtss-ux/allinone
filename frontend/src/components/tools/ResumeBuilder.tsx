'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

export default function ResumeBuilder() {
    const [name, setName] = useState('');
    const [title, setTitle] = useState('');
    const [experience, setExperience] = useState('');
    const [education, setEducation] = useState('');
    const [skills, setSkills] = useState('');
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!name.trim()) { setError('Name is required'); return; }
        setLoading(true); setError(''); setResult(null);
        try {
            const response = await axios.post(backendApi('/api/resume/generate'), { name, title, experience, education, skills, summary });
            setResult(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to generate resume');
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8">
                <div className="text-center mb-6">
                    <div className="text-5xl mb-3">📄</div>
                    <h3 className="text-2xl font-bold">AI Resume Builder</h3>
                    <p className="text-gray-400 mt-1">Generate a professional ATS-friendly resume</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Full Name *</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
                            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Job Title</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior Software Engineer"
                            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none" />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Experience</label>
                    <textarea value={experience} onChange={(e) => setExperience(e.target.value)}
                        placeholder="e.g., 5 years at Google as backend engineer, led a team of 10, built microservices..."
                        className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none" rows={3} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Education</label>
                        <textarea value={education} onChange={(e) => setEducation(e.target.value)}
                            placeholder="e.g., BS Computer Science from MIT, 2018"
                            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none" rows={2} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Skills</label>
                        <textarea value={skills} onChange={(e) => setSkills(e.target.value)}
                            placeholder="e.g., Python, React, AWS, Docker, Leadership"
                            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none" rows={2} />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Summary (optional)</label>
                    <textarea value={summary} onChange={(e) => setSummary(e.target.value)}
                        placeholder="Brief professional summary or objective..."
                        className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none" rows={2} />
                </div>

                {error && <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg text-sm">{error}</div>}

                <button onClick={handleGenerate} disabled={loading}
                    className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50">
                    {loading ? '📄 Building Resume...' : '✨ Generate Resume'}
                </button>

                {result?.success && result.resume && (
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold">✅ Your Resume</h4>
                            {result.provider && <span className="text-xs bg-gray-700 text-green-400 px-2 py-1 rounded">🤖 {result.provider}</span>}
                        </div>
                        <div className="bg-white text-gray-900 rounded-lg p-8 prose max-w-none whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
                            {result.resume}
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => navigator.clipboard.writeText(result.resume)}
                                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition">
                                📋 Copy Resume
                            </button>
                            <button onClick={() => {
                                const blob = new Blob([result.resume], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a'); a.href = url; a.download = `resume-${name}.txt`; a.click();
                            }} className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition">
                                ⬇️ Download .txt
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
