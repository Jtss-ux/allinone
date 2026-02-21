'use client';

import React, { useState } from 'react';

export default function TextDiff() {
    const [text1, setText1] = useState('');
    const [text2, setText2] = useState('');
    const [diffResult, setDiffResult] = useState<Array<{ type: 'same' | 'added' | 'removed'; line: string }>>([]);
    const [showDiff, setShowDiff] = useState(false);

    const computeDiff = () => {
        const lines1 = text1.split('\n');
        const lines2 = text2.split('\n');
        const result: Array<{ type: 'same' | 'added' | 'removed'; line: string }> = [];

        // Simple LCS-based diff
        const lcs = Array.from({ length: lines1.length + 1 }, () => Array(lines2.length + 1).fill(0));
        for (let i = 1; i <= lines1.length; i++) {
            for (let j = 1; j <= lines2.length; j++) {
                lcs[i][j] = lines1[i - 1] === lines2[j - 1] ? lcs[i - 1][j - 1] + 1 : Math.max(lcs[i - 1][j], lcs[i][j - 1]);
            }
        }

        let i = lines1.length, j = lines2.length;
        const stack: Array<{ type: 'same' | 'added' | 'removed'; line: string }> = [];
        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
                stack.push({ type: 'same', line: lines1[i - 1] });
                i--; j--;
            } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
                stack.push({ type: 'added', line: lines2[j - 1] });
                j--;
            } else {
                stack.push({ type: 'removed', line: lines1[i - 1] });
                i--;
            }
        }

        result.push(...stack.reverse());
        setDiffResult(result);
        setShowDiff(true);
    };

    const stats = {
        added: diffResult.filter(d => d.type === 'added').length,
        removed: diffResult.filter(d => d.type === 'removed').length,
        same: diffResult.filter(d => d.type === 'same').length,
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">📝</span>
                        <div>
                            <h3 className="text-xl font-bold">Text Diff Checker</h3>
                            <p className="text-sm text-gray-200">Compare two text blocks and see the differences</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Original Text</label>
                            <textarea value={text1} onChange={e => setText1(e.target.value)}
                                placeholder="Paste original text here..."
                                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none font-mono text-sm h-48" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Modified Text</label>
                            <textarea value={text2} onChange={e => setText2(e.target.value)}
                                placeholder="Paste modified text here..."
                                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none font-mono text-sm h-48" />
                        </div>
                    </div>

                    <button onClick={computeDiff} className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition">
                        🔍 Compare
                    </button>

                    {showDiff && (
                        <div className="mt-6">
                            <div className="flex gap-4 mb-3 text-sm">
                                <span className="text-green-400">+ {stats.added} added</span>
                                <span className="text-red-400">− {stats.removed} removed</span>
                                <span className="text-gray-400">{stats.same} unchanged</span>
                            </div>
                            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto">
                                {diffResult.map((d, idx) => (
                                    <div key={idx} className={`px-2 py-0.5 ${d.type === 'added' ? 'bg-green-900/40 text-green-300' :
                                            d.type === 'removed' ? 'bg-red-900/40 text-red-300' :
                                                'text-gray-400'
                                        }`}>
                                        <span className="inline-block w-6 text-right mr-2 opacity-50">
                                            {d.type === 'added' ? '+' : d.type === 'removed' ? '−' : ' '}
                                        </span>
                                        {d.line || ' '}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
