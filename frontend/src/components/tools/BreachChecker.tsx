'use client';

import React, { useState } from 'react';

export default function BreachChecker() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(false);
    const [breaches, setBreaches] = useState<Array<{ name: string; domain: string; date: string; count: number }>>([]);
    const [error, setError] = useState('');

    const checkBreaches = async () => {
        if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email'); return; }
        setLoading(true); setError(''); setBreaches([]);

        try {
            // Use the HIBP proxy-compatible endpoint
            const res = await fetch(`https://haveibeenpwned.com/unifiedsearch/${encodeURIComponent(email)}`, {
                headers: { 'Accept': 'application/json' }
            });

            if (res.status === 404) {
                setBreaches([]);
                setChecked(true);
            } else if (res.ok) {
                const data = await res.json();
                const breachList = (data.Breaches || []).map((b: any) => ({
                    name: b.Name || b.Title,
                    domain: b.Domain || '',
                    date: b.BreachDate || b.AddedDate || '',
                    count: b.PwnCount || 0,
                }));
                setBreaches(breachList);
                setChecked(true);
            } else {
                // Fallback: simulate check with known major breaches for demo
                setChecked(true);
                setBreaches([]);
                setError('Could not reach the breach database directly. For accurate results, visit haveibeenpwned.com');
            }
        } catch {
            setChecked(true);
            setBreaches([]);
            setError('Could not reach the breach database. Visit haveibeenpwned.com for accurate results');
        } finally { setLoading(false); }
    };

    const formatNumber = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n);

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">🔐</span>
                    <div>
                        <h3 className="text-xl font-semibold">Breach Checker</h3>
                        <p className="text-sm text-gray-400">Check if your email has been in a data breach</p>
                    </div>
                </div>

                <div className="flex gap-2 mb-6">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && checkBreaches()}
                        placeholder="Enter your email address..."
                        className="flex-1 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none" />
                    <button onClick={checkBreaches} disabled={loading}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition disabled:opacity-50">
                        {loading ? '...' : '🔍 Check'}
                    </button>
                </div>

                {error && <div className="p-3 bg-yellow-900 text-yellow-100 rounded-lg text-sm mb-4">{error}</div>}

                {checked && breaches.length === 0 && !error && (
                    <div className="p-6 bg-green-900/30 border border-green-700 rounded-xl text-center">
                        <div className="text-5xl mb-3">✅</div>
                        <h4 className="text-xl font-bold text-green-400">No breaches found!</h4>
                        <p className="text-gray-300 mt-2">Your email was not found in any known data breaches.</p>
                    </div>
                )}

                {breaches.length > 0 && (
                    <div>
                        <div className="p-4 bg-red-900/30 border border-red-700 rounded-xl mb-4 text-center">
                            <div className="text-5xl mb-2">⚠️</div>
                            <h4 className="text-xl font-bold text-red-400">Found in {breaches.length} breach{breaches.length > 1 ? 'es' : ''}!</h4>
                            <p className="text-gray-300 text-sm mt-1">Change your passwords on these services immediately.</p>
                        </div>
                        <div className="space-y-2">
                            {breaches.map((b, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                    <div>
                                        <div className="font-medium">{b.name}</div>
                                        <div className="text-xs text-gray-400">{b.domain} · {b.date}</div>
                                    </div>
                                    <div className="text-sm text-red-400">{formatNumber(b.count)} accounts</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                    <h5 className="font-semibold text-sm mb-2">🛡️ Security Tips</h5>
                    <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Use unique passwords for every account</li>
                        <li>• Enable two-factor authentication (2FA)</li>
                        <li>• Use a password manager like Bitwarden or KeePass</li>
                        <li>• Check <a href="https://haveibeenpwned.com" target="_blank" className="text-blue-400 underline">haveibeenpwned.com</a> regularly</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
