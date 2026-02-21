'use client';

import React, { useState } from 'react';

const OPERATIONS = [
    { id: 'base64enc', name: 'Base64 Encode', cat: 'Encoding', fn: (s: string) => btoa(unescape(encodeURIComponent(s))) },
    { id: 'base64dec', name: 'Base64 Decode', cat: 'Encoding', fn: (s: string) => decodeURIComponent(escape(atob(s))) },
    { id: 'urlenc', name: 'URL Encode', cat: 'Encoding', fn: (s: string) => encodeURIComponent(s) },
    { id: 'urldec', name: 'URL Decode', cat: 'Encoding', fn: (s: string) => decodeURIComponent(s) },
    { id: 'hexenc', name: 'To Hex', cat: 'Encoding', fn: (s: string) => Array.from(s).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ') },
    { id: 'hexdec', name: 'From Hex', cat: 'Encoding', fn: (s: string) => s.replace(/\s/g, '').match(/.{1,2}/g)?.map(h => String.fromCharCode(parseInt(h, 16))).join('') || '' },
    { id: 'binenc', name: 'To Binary', cat: 'Encoding', fn: (s: string) => Array.from(s).map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ') },
    { id: 'bindec', name: 'From Binary', cat: 'Encoding', fn: (s: string) => s.trim().split(/\s+/).map(b => String.fromCharCode(parseInt(b, 2))).join('') },
    { id: 'rot13', name: 'ROT13', cat: 'Cipher', fn: (s: string) => s.replace(/[a-zA-Z]/g, c => String.fromCharCode(c.charCodeAt(0) + (c.toLowerCase() < 'n' ? 13 : -13))) },
    { id: 'reverse', name: 'Reverse', cat: 'Text', fn: (s: string) => s.split('').reverse().join('') },
    { id: 'upper', name: 'UPPERCASE', cat: 'Text', fn: (s: string) => s.toUpperCase() },
    { id: 'lower', name: 'lowercase', cat: 'Text', fn: (s: string) => s.toLowerCase() },
    { id: 'title', name: 'Title Case', cat: 'Text', fn: (s: string) => s.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase()) },
    { id: 'len', name: 'Character Count', cat: 'Analysis', fn: (s: string) => `Characters: ${s.length}\nWords: ${s.trim().split(/\s+/).filter(Boolean).length}\nLines: ${s.split('\n').length}\nBytes: ${new Blob([s]).size}` },
    { id: 'jsonpretty', name: 'JSON Prettify', cat: 'Data', fn: (s: string) => JSON.stringify(JSON.parse(s), null, 2) },
    { id: 'jsonmin', name: 'JSON Minify', cat: 'Data', fn: (s: string) => JSON.stringify(JSON.parse(s)) },
    { id: 'jwt', name: 'JWT Decode', cat: 'Data', fn: (s: string) => { const p = s.split('.'); return JSON.stringify({ header: JSON.parse(atob(p[0])), payload: JSON.parse(atob(p[1].replace(/-/g, '+').replace(/_/g, '/'))) }, null, 2); } },
    { id: 'htmlenc', name: 'HTML Encode', cat: 'Encoding', fn: (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') },
    { id: 'htmldec', name: 'HTML Decode', cat: 'Encoding', fn: (s: string) => { const t = document.createElement('textarea'); t.innerHTML = s; return t.value; } },
    { id: 'escape', name: 'Escape String', cat: 'Text', fn: (s: string) => JSON.stringify(s) },
    { id: 'unescape', name: 'Unescape String', cat: 'Text', fn: (s: string) => JSON.parse(s) },
    { id: 'unixts', name: 'Unix Timestamp', cat: 'Data', fn: (s: string) => { const n = Number(s); return isNaN(n) ? `Current: ${Math.floor(Date.now() / 1000)}` : new Date(n * 1000).toISOString(); } },
    { id: 'md5sim', name: 'Simple Hash', cat: 'Hash', fn: (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; } return `Hash: ${(h >>> 0).toString(16).padStart(8, '0')}\nNote: For real MD5/SHA, use Web Crypto API`; } },
    { id: 'lorem', name: 'Lorem Ipsum', cat: 'Generate', fn: () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' },
    { id: 'uuid', name: 'Generate UUID', cat: 'Generate', fn: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); }) },
];

export default function CyberChef() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [activeOp, setActiveOp] = useState('base64enc');
    const [filterCat, setFilterCat] = useState('All');
    const [error, setError] = useState('');

    const categories = ['All', ...Array.from(new Set(OPERATIONS.map(o => o.cat)))];

    const runOperation = (opId: string) => {
        setActiveOp(opId);
        const op = OPERATIONS.find(o => o.id === opId);
        if (!op) return;
        try {
            setError('');
            setOutput(op.fn(input));
        } catch (err: any) {
            setError(`Error: ${err.message}`);
            setOutput('');
        }
    };

    const filtered = filterCat === 'All' ? OPERATIONS : OPERATIONS.filter(o => o.cat === filterCat);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🔧</span>
                        <div>
                            <h3 className="text-xl font-bold">CyberChef</h3>
                            <p className="text-sm text-gray-200">The Swiss Army Knife for data — encode, decode, transform, analyze</p>
                        </div>
                    </div>
                </div>

                <div className="flex h-[calc(100vh-250px)]">
                    {/* Operations sidebar */}
                    <div className="w-56 bg-gray-900 border-r border-gray-700 overflow-y-auto">
                        <div className="p-3">
                            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                                className="w-full p-2 bg-gray-700 text-sm rounded text-white border-none focus:outline-none mb-2">
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <div className="space-y-1">
                                {filtered.map(op => (
                                    <button key={op.id} onClick={() => runOperation(op.id)}
                                        className={`w-full text-left px-3 py-2 rounded text-sm transition ${activeOp === op.id ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                                        {op.name}
                                        <span className="text-xs text-gray-500 ml-1">({op.cat})</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* I/O area */}
                    <div className="flex-1 flex flex-col">
                        <div className="flex-1 flex">
                            <div className="flex-1 flex flex-col border-r border-gray-700">
                                <div className="px-3 py-2 bg-gray-900 text-xs text-gray-400 font-semibold border-b border-gray-700">INPUT</div>
                                <textarea value={input} onChange={e => { setInput(e.target.value); }}
                                    placeholder="Paste your text here..."
                                    className="flex-1 p-3 bg-gray-900 text-white font-mono text-sm resize-none focus:outline-none" />
                            </div>
                            <div className="flex-1 flex flex-col">
                                <div className="px-3 py-2 bg-gray-900 text-xs text-gray-400 font-semibold border-b border-gray-700 flex justify-between">
                                    <span>OUTPUT</span>
                                    {output && <button onClick={() => navigator.clipboard.writeText(output)} className="text-emerald-400 hover:text-emerald-300">📋 Copy</button>}
                                </div>
                                <textarea value={output} readOnly className="flex-1 p-3 bg-gray-950 text-green-400 font-mono text-sm resize-none focus:outline-none" />
                            </div>
                        </div>
                        {error && <div className="p-2 bg-red-900 text-red-200 text-sm">{error}</div>}
                        <div className="p-2 bg-gray-900 border-t border-gray-700 flex justify-between text-xs text-gray-500">
                            <span>Operation: {OPERATIONS.find(o => o.id === activeOp)?.name}</span>
                            <span>Input: {input.length} chars → Output: {output.length} chars</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
