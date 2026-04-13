'use client';

import React, { useState } from 'react';
import { backendApi } from '@/config/api';

export default function BreachChecker() {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState<'email' | 'password'>('email');
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(false);
    const [breachCount, setBreachCount] = useState(0);
    const [breaches, setBreaches] = useState<Array<{ name: string; domain: string; date: string; count: number }>>([]);
    const [error, setError] = useState('');

    // SHA-1 hash helper (for k-anonymity API)
    const sha1 = async (text: string): Promise<string> => {
        const data = new TextEncoder().encode(text);
        const hash = await crypto.subtle.digest('SHA-1', data);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    };

    // Check password against HIBP k-anonymity API (free, no CORS issues)
    const checkPassword = async () => {
        const hash = await sha1(input);
        const prefix = hash.substring(0, 5);
        const suffix = hash.substring(5);

        const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        if (!res.ok) throw new Error('HIBP API unavailable');

        const text = await res.text();
        const lines = text.split('\n');
        let found = 0;
        for (const line of lines) {
            const [hashSuffix, count] = line.split(':');
            if (hashSuffix.trim() === suffix) {
                found = parseInt(count.trim(), 10);
                break;
            }
        }
        return found;
    };

    // Check email via multiple free breach APIs
    const checkEmail = async () => {
        // Try XposedOrNot API (free, CORS-friendly)
        try {
            const res = await fetch(`https://api.xposedornot.com/v1/check-email/${encodeURIComponent(input)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.breaches && data.breaches.length > 0) {
                    return data.breaches.map((b: any) => ({
                        name: b.breach || b.name || 'Unknown',
                        domain: b.domain || '',
                        date: b.xposed_date || b.date || '',
                        count: b.xposed_records || 0,
                    }));
                }
                return [];
            }
            if (res.status === 404) return []; // Not found = safe
        } catch (e) {
            console.log('XposedOrNot failed, trying alternative...');
        }

        // Try breach directory API via backend proxy
        try {
            const res = await fetch(backendApi(`/api/breach/check?term=${encodeURIComponent(input)}`));
            if (res.ok) {
                const data = await res.json();
                if (data.result && data.result.length > 0) {
                    return data.result.map((b: any) => ({
                        name: b.sources?.join(', ') || 'Unknown Breach',
                        domain: '',
                        date: '',
                        count: 0,
                    }));
                }
                return [];
            }
        } catch (e) {
            console.log('BreachDirectory failed');
        }

        return null; // All APIs failed
    };

    const handleCheck = async () => {
        if (!input.trim()) { setError('Please enter a value'); return; }
        if (mode === 'email' && !input.includes('@')) { setError('Please enter a valid email'); return; }
        setLoading(true); setError(''); setBreaches([]); setBreachCount(0); setChecked(false);

        try {
            if (mode === 'password') {
                const count = await checkPassword();
                setBreachCount(count);
                setChecked(true);
            } else {
                const result = await checkEmail();
                if (result === null) {
                    setError('Could not reach breach databases. For accurate results, visit haveibeenpwned.com');
                    setChecked(true);
                } else {
                    setBreaches(result);
                    setChecked(true);
                }
            }
        } catch {
            setError('Failed to check. Try again later or visit haveibeenpwned.com');
            setChecked(true);
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
                        <p className="text-sm text-gray-400">Check if your email or password has been in a data breach</p>
                    </div>
                </div>

                {/* Mode Toggle */}
                <div className="flex gap-2 mb-4">
                    <button onClick={() => { setMode('email'); setInput(''); setChecked(false); setError(''); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode === 'email' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        📧 Check Email
                    </button>
                    <button onClick={() => { setMode('password'); setInput(''); setChecked(false); setError(''); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode === 'password' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        🔑 Check Password
                    </button>
                </div>

                <div className="flex gap-2 mb-6">
                    <input type={mode === 'password' ? 'password' : 'email'} value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleCheck()}
                        placeholder={mode === 'email' ? 'Enter your email address...' : 'Enter a password to check...'}
                        className="flex-1 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none" />
                    <button onClick={handleCheck} disabled={loading}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition disabled:opacity-50">
                        {loading ? '...' : '🔍 Check'}
                    </button>
                </div>

                {mode === 'password' && (
                    <p className="text-xs text-gray-500 -mt-4 mb-4">🔒 Your password is hashed locally. Only the first 5 chars of the hash are sent (k-anonymity).</p>
                )}

                {error && <div className="p-3 bg-yellow-900 text-yellow-100 rounded-lg text-sm mb-4">{error}</div>}

                {/* Password Result */}
                {checked && mode === 'password' && (
                    breachCount === 0 ? (
                        <div className="p-6 bg-green-900/30 border border-green-700 rounded-xl text-center">
                            <div className="text-5xl mb-3">✅</div>
                            <h4 className="text-xl font-bold text-green-400">Password is safe!</h4>
                            <p className="text-gray-300 mt-2">This password was not found in any known data breaches.</p>
                        </div>
                    ) : (
                        <div className="p-6 bg-red-900/30 border border-red-700 rounded-xl text-center">
                            <div className="text-5xl mb-3">⚠️</div>
                            <h4 className="text-xl font-bold text-red-400">Password compromised!</h4>
                            <p className="text-gray-300 mt-2">This password has been seen <span className="text-red-400 font-bold">{formatNumber(breachCount)}</span> times in data breaches.</p>
                            <p className="text-gray-400 text-sm mt-1">Change it immediately on all accounts.</p>
                        </div>
                    )
                )}

                {/* Email Result */}
                {checked && mode === 'email' && breaches.length === 0 && !error && (
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
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {breaches.map((b, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                    <div>
                                        <div className="font-medium">{b.name}</div>
                                        <div className="text-xs text-gray-400">{b.domain}{b.date ? ` · ${b.date}` : ''}</div>
                                    </div>
                                    {b.count > 0 && <div className="text-sm text-red-400">{formatNumber(b.count)} accounts</div>}
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
