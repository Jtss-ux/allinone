'use client';

import React, { useState } from 'react';

export default function Pastebin() {
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [language, setLanguage] = useState('plaintext');
    const [pastes, setPastes] = useState<Array<{ id: string; title: string; content: string; language: string; created: Date }>>([]);
    const [viewingPaste, setViewingPaste] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const LANGUAGES = ['plaintext', 'javascript', 'python', 'html', 'css', 'json', 'typescript', 'bash', 'sql', 'markdown', 'java', 'cpp', 'csharp', 'go', 'rust', 'xml', 'yaml'];

    const createPaste = () => {
        if (!content.trim()) return;
        const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
        const paste = { id, title: title || `Paste ${pastes.length + 1}`, content, language, created: new Date() };
        setPastes([paste, ...pastes]);
        setContent('');
        setTitle('');
        setViewingPaste(id);
    };

    const copyContent = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const currentPaste = pastes.find(p => p.id === viewingPaste);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-4">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">📋</span>
                        <div>
                            <h3 className="text-xl font-bold">Pastebin</h3>
                            <p className="text-sm text-gray-200">Share code and text snippets with syntax highlighting</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {!viewingPaste ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Title (optional)</label>
                                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="My Paste"
                                        className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Language</label>
                                    <select value={language} onChange={e => setLanguage(e.target.value)}
                                        className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none">
                                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                            </div>

                            <textarea value={content} onChange={e => setContent(e.target.value)}
                                placeholder="Paste your code or text here..."
                                className="w-full p-4 bg-gray-900 text-green-400 rounded-lg border border-gray-600 font-mono text-sm h-64 focus:outline-none" />

                            <button onClick={createPaste} disabled={!content.trim()}
                                className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition disabled:opacity-50">
                                📋 Create Paste
                            </button>

                            {pastes.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Recent Pastes</h4>
                                    <div className="space-y-2">
                                        {pastes.map(p => (
                                            <button key={p.id} onClick={() => setViewingPaste(p.id)}
                                                className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
                                                <div className="flex justify-between">
                                                    <span className="font-medium">{p.title}</span>
                                                    <span className="text-xs text-gray-400">{p.language}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">{p.created.toLocaleString()}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : currentPaste ? (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <button onClick={() => setViewingPaste(null)} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">← Back</button>
                                <div className="flex gap-2">
                                    <span className="text-xs bg-gray-700 px-2 py-1 rounded">{currentPaste.language}</span>
                                    <button onClick={() => copyContent(currentPaste.content)}
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">{copied ? '✅ Copied!' : '📋 Copy'}</button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold mb-2">{currentPaste.title}</h3>
                            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{currentPaste.content}</pre>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">Created: {currentPaste.created.toLocaleString()} · {currentPaste.content.length} characters</div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
