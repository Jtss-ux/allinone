'use client';

import React, { useState } from 'react';

export default function WaybackMachine() {
    const [url, setUrl] = useState('');
    const [snapshots, setSnapshots] = useState<Array<{ timestamp: string; url: string; status: string }>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [checked, setChecked] = useState(false);

    const lookup = async () => {
        if (!url.trim()) { setError('Please enter a URL'); return; }
        setLoading(true); setError(''); setSnapshots([]);

        const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

        try {
            // Use Wayback CDX API to find snapshots
            const res = await fetch(`https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(cleanUrl)}&output=json&limit=20&fl=timestamp,original,statuscode&sort=desc`);

            if (res.ok) {
                const data = await res.json();
                // First row is headers
                const rows = data.slice(1).map((row: string[]) => ({
                    timestamp: row[0],
                    url: row[1],
                    status: row[2],
                }));
                setSnapshots(rows);
                setChecked(true);
            } else {
                setError('Could not reach the Wayback Machine API');
                setChecked(true);
            }
        } catch {
            setError('Failed to lookup. Make sure you have internet access.');
            setChecked(true);
        } finally { setLoading(false); }
    };

    const formatDate = (ts: string) => {
        if (ts.length < 14) return ts;
        return `${ts.substring(0, 4)}-${ts.substring(4, 6)}-${ts.substring(6, 8)} ${ts.substring(8, 10)}:${ts.substring(10, 12)}`;
    };

    const openSnapshot = (ts: string, originalUrl: string) => {
        window.open(`https://web.archive.org/web/${ts}/${originalUrl}`, '_blank');
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">🕰️</span>
                    <div>
                        <h3 className="text-xl font-semibold">Wayback Machine</h3>
                        <p className="text-sm text-gray-400">Look up archived versions of any website</p>
                    </div>
                </div>

                <div className="flex gap-2 mb-6">
                    <input type="text" value={url} onChange={e => setUrl(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && lookup()}
                        placeholder="Enter a URL (e.g., google.com, reddit.com)..."
                        className="flex-1 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none" />
                    <button onClick={lookup} disabled={loading}
                        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition disabled:opacity-50">
                        {loading ? '...' : '🔍 Lookup'}
                    </button>
                </div>

                {error && <div className="p-3 bg-red-900 text-red-100 rounded-lg text-sm mb-4">{error}</div>}

                {checked && snapshots.length === 0 && !error && (
                    <div className="p-6 bg-gray-700 rounded-xl text-center">
                        <div className="text-4xl mb-2">🤷</div>
                        <p className="text-gray-300">No archived snapshots found for this URL.</p>
                    </div>
                )}

                {snapshots.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-3">📸 {snapshots.length} Snapshots Found</h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {snapshots.map((snap, i) => (
                                <button key={i} onClick={() => openSnapshot(snap.timestamp, snap.url)}
                                    className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition flex justify-between items-center group">
                                    <div>
                                        <div className="font-medium text-sm">{formatDate(snap.timestamp)}</div>
                                        <div className="text-xs text-gray-400 truncate max-w-md">{snap.url}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-0.5 rounded ${snap.status === '200' ? 'bg-green-600/30 text-green-400' : 'bg-yellow-600/30 text-yellow-400'}`}>
                                            {snap.status}
                                        </span>
                                        <span className="text-gray-500 group-hover:text-white transition">→</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-3 text-center">Click any snapshot to view it on the Wayback Machine</p>
                    </div>
                )}
            </div>
        </div>
    );
}
