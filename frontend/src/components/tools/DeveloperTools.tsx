'use client';

import React, { useState } from 'react';

export default function DeveloperTools() {
  const [activeTool, setActiveTool] = useState<'base64' | 'json' | 'url' | 'hex' | 'hash' | 'password'>('base64');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [passwordLength, setPasswordLength] = useState(16);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);

  // Unicode-safe Base64 encode/decode
  const encodeBase64 = () => {
    try {
      const bytes = new TextEncoder().encode(input);
      const binary = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
      setOutput(btoa(binary));
    } catch {
      setOutput('Error: Invalid input for Base64 encoding');
    }
  };

  const decodeBase64 = () => {
    try {
      const binary = atob(input.trim());
      const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
      setOutput(new TextDecoder().decode(bytes));
    } catch {
      setOutput('Error: Invalid Base64 string');
    }
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch (err: any) {
      setOutput(`Error: ${err.message}`);
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
    } catch (err: any) {
      setOutput(`Error: ${err.message}`);
    }
  };

  const encodeURL = () => {
    setOutput(encodeURIComponent(input));
  };

  const decodeURL = () => {
    try {
      setOutput(decodeURIComponent(input));
    } catch {
      setOutput('Error: Invalid URL encoding');
    }
  };

  const encodeHex = () => {
    const hex = Array.from(new TextEncoder().encode(input)).map(b => b.toString(16).padStart(2, '0')).join(' ');
    setOutput(hex);
  };

  const decodeHex = () => {
    try {
      const bytes = input.trim().split(/\s+/).map(h => parseInt(h, 16));
      setOutput(new TextDecoder().decode(new Uint8Array(bytes)));
    } catch {
      setOutput('Error: Invalid hex string');
    }
  };

  const generateHash = async () => {
    try {
      const data = new TextEncoder().encode(input);
      const [md5Style, sha256, sha512] = await Promise.all([
        crypto.subtle.digest('SHA-1', data),
        crypto.subtle.digest('SHA-256', data),
        crypto.subtle.digest('SHA-512', data),
      ]);
      const toHex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
      setOutput(`SHA-1:   ${toHex(md5Style)}\nSHA-256: ${toHex(sha256)}\nSHA-512: ${toHex(sha512)}`);
    } catch {
      setOutput('Error: Could not generate hash');
    }
  };

  const generatePassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = lowercase + uppercase;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;

    let password = '';
    for (let i = 0; i < passwordLength; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setOutput(password);
  };

  const tools = [
    { id: 'base64', name: 'Base64', icon: '🔐' },
    { id: 'json', name: 'JSON', icon: '📋' },
    { id: 'url', name: 'URL', icon: '🔗' },
    { id: 'hex', name: 'Hex', icon: '🔢' },
    { id: 'hash', name: 'Hash', icon: '🔏' },
    { id: 'password', name: 'Password', icon: '🔑' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-4">
          <h3 className="text-2xl font-bold">🛠️ Developer Tools</h3>
          <p className="text-gray-300">Essential tools for developers</p>
        </div>

        {/* Tool Tabs */}
        <div className="flex border-b border-gray-700">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => { setActiveTool(tool.id as any); setInput(''); setOutput(''); }}
              className={`flex-1 p-4 text-center font-semibold transition ${activeTool === tool.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
            >
              <span className="block text-2xl mb-1">{tool.icon}</span>
              {tool.name}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {activeTool === 'password' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Password Length: {passwordLength}</label>
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={passwordLength}
                  onChange={(e) => setPasswordLength(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Include Numbers</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeSymbols}
                    onChange={(e) => setIncludeSymbols(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Include Symbols</span>
                </label>
              </div>
              <button
                onClick={generatePassword}
                className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold"
              >
                🔑 Generate Password
              </button>
            </div>
          ) : (
            <>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Enter ${activeTool === 'base64' ? 'text to encode/decode' : activeTool === 'json' ? 'JSON to format' : activeTool === 'hex' ? 'text or hex to convert' : activeTool === 'hash' ? 'text to hash' : 'URL to encode'}...`}
                className="w-full p-4 bg-gray-700 text-white rounded-lg border border-gray-600 h-32 focus:border-green-500 focus:outline-none"
              />

              <div className="flex gap-2">
                {activeTool === 'base64' && (
                  <>
                    <button onClick={encodeBase64} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
                      Encode
                    </button>
                    <button onClick={decodeBase64} className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg">
                      Decode
                    </button>
                  </>
                )}
                {activeTool === 'json' && (
                  <>
                    <button onClick={formatJSON} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
                      Format
                    </button>
                    <button onClick={minifyJSON} className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg">
                      Minify
                    </button>
                  </>
                )}
                {activeTool === 'url' && (
                  <>
                    <button onClick={encodeURL} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
                      Encode
                    </button>
                    <button onClick={decodeURL} className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg">
                      Decode
                    </button>
                  </>
                )}
                {activeTool === 'hex' && (
                  <>
                    <button onClick={encodeHex} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
                      Text → Hex
                    </button>
                    <button onClick={decodeHex} className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg">
                      Hex → Text
                    </button>
                  </>
                )}
                {activeTool === 'hash' && (
                  <button onClick={generateHash} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
                    🔏 Generate Hashes
                  </button>
                )}
              </div>
            </>
          )}

          {/* Output */}
          {output && (
            <div className="relative">
              <textarea
                value={output}
                readOnly
                className="w-full p-4 bg-gray-900 text-green-400 rounded-lg border border-gray-600 h-32 font-mono"
              />
              <button
                onClick={() => navigator.clipboard.writeText(output)}
                className="absolute top-2 right-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              >
                Copy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
