'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Regex, Copy, Check, AlertCircle, BookOpen, X, ChevronRight } from 'lucide-react';

interface Match {
  text: string;
  index: number;
  groups: string[];
}

const regexCheatsheet = [
  { pattern: '.', desc: 'Any character except newline' },
  { pattern: '\\w', desc: 'Word character [a-zA-Z0-9_]' },
  { pattern: '\\W', desc: 'Non-word character' },
  { pattern: '\\d', desc: 'Digit [0-9]' },
  { pattern: '\\D', desc: 'Non-digit' },
  { pattern: '\\s', desc: 'Whitespace' },
  { pattern: '\\S', desc: 'Non-whitespace' },
  { pattern: '^', desc: 'Start of string' },
  { pattern: '$', desc: 'End of string' },
  { pattern: '\\b', desc: 'Word boundary' },
  { pattern: '[abc]', desc: 'Any of a, b, or c' },
  { pattern: '[^abc]', desc: 'Not a, b, or c' },
  { pattern: '[a-z]', desc: 'Character range' },
  { pattern: '(...)', desc: 'Capture group' },
  { pattern: '(?:...)', desc: 'Non-capturing group' },
  { pattern: '|', desc: 'Alternation (OR)' },
  { pattern: '*', desc: '0 or more' },
  { pattern: '+', desc: '1 or more' },
  { pattern: '?', desc: '0 or 1' },
  { pattern: '{n}', desc: 'Exactly n times' },
  { pattern: '{n,}', desc: 'n or more times' },
  { pattern: '{n,m}', desc: 'Between n and m times' },
];

const commonPatterns = [
  { name: 'Email', pattern: '^[\\w.-]+@[\\w.-]+\\.\\w+$' },
  { name: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)' },
  { name: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}' },
  { name: 'IP Address', pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$' },
  { name: 'Date (MM/DD/YYYY)', pattern: '^(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/\\d{4}$' },
  { name: 'Hex Color', pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$' },
  { name: 'Strong Password', pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$' },
  { name: 'Credit Card', pattern: '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9]{2})[0-9]{12}|3[47][0-9]{13})$' },
];

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCheatsheet, setShowCheatsheet] = useState(false);

  const testRegex = useCallback(() => {
    if (!pattern || !testString) {
      setMatches([]);
      setError(null);
      return;
    }

    try {
      const flagString = Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag]) => flag)
        .join('');
      
      const regex = new RegExp(pattern, flagString);
      const foundMatches: Match[] = [];
      
      if (flags.g) {
        let match;
        while ((match = regex.exec(testString)) !== null) {
          foundMatches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          if (match.index === regex.lastIndex) regex.lastIndex++;
        }
      } else {
        const match = regex.exec(testString);
        if (match) {
          foundMatches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }
      
      setMatches(foundMatches);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid regex pattern');
      setMatches([]);
    }
  }, [pattern, flags, testString]);

  useEffect(() => {
    testRegex();
  }, [testRegex]);

  const copyPattern = () => {
    const flagString = Object.entries(flags)
      .filter(([_, enabled]) => enabled)
      .map(([flag]) => flag)
      .join('');
    navigator.clipboard.writeText(`/${pattern}/${flagString}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightMatches = () => {
    if (matches.length === 0 || !testString) return testString;

    const parts: JSX.Element[] = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${i}`}>{testString.slice(lastIndex, match.index)}</span>
        );
      }
      parts.push(
        <mark key={`match-${i}`} className="bg-green-500/30 text-green-300 px-0.5 rounded">
          {match.text}
        </mark>
      );
      lastIndex = match.index + match.text.length;
    });

    if (lastIndex < testString.length) {
      parts.push(<span key="text-end">{testString.slice(lastIndex)}</span>);
    }

    return parts;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
          <Regex className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Regex Tester</h1>
        <p className="text-gray-400">Test and debug regular expressions</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Testing Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pattern Input */}
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-gray-400">Regular Expression</label>
              <button
                onClick={copyPattern}
                className="text-sm text-green-500 hover:text-green-400 flex items-center gap-1"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <div className="flex gap-2">
              <span className="text-green-500 text-xl font-mono">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-green-500"
              />
              <span className="text-green-500 text-xl font-mono">/</span>
              <input
                type="text"
                value={Object.entries(flags)
                  .filter(([_, enabled]) => enabled)
                  .map(([flag]) => flag)
                  .join('')}
                readOnly
                className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-white font-mono text-center"
              />
            </div>

            {/* Flags */}
            <div className="flex gap-4 mt-4">
              {[
                { key: 'g', label: 'g - Global', desc: 'Find all matches' },
                { key: 'i', label: 'i - Ignore Case', desc: 'Case insensitive' },
                { key: 'm', label: 'm - Multiline', desc: '^ and $ match lines' },
                { key: 's', label: 's - Dot All', desc: '. matches newlines' },
              ].map(({ key, label, desc }) => (
                <label
                  key={key}
                  className="flex items-center gap-2 cursor-pointer"
                  title={desc}
                >
                  <input
                    type="checkbox"
                    checked={flags[key as keyof typeof flags]}
                    onChange={(e) => setFlags({ ...flags, [key]: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 text-green-500 focus:ring-green-500 bg-gray-700"
                  />
                  <span className="text-sm text-gray-400">{label}</span>
                </label>
              ))}
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          {/* Test String */}
          <div className="bg-gray-900 rounded-xl p-6">
            <label className="text-sm font-medium text-gray-400 block mb-3">Test String</label>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter text to test against the regex..."
              rows={8}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-green-500 resize-none"
            />
          </div>

          {/* Results */}
          {testString && (
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-400">Results</label>
                <span className={`text-sm font-medium ${matches.length > 0 ? 'text-green-500' : 'text-gray-500'}`}>
                  {matches.length} {matches.length === 1 ? 'match' : 'matches'} found
                </span>
              </div>

              {/* Highlighted Text */}
              <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap mb-4">
                {highlightMatches()}
              </div>

              {/* Match Details */}
              {matches.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-400">Match Details:</h4>
                  {matches.map((match, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-500 font-mono">Match {index + 1}:</span>
                        <span className="font-mono text-white">&quot;{match.text}&quot;</span>
                        <span className="text-gray-500">at position {match.index}</span>
                      </div>
                      {match.groups.length > 0 && (
                        <div className="mt-2 pl-4 border-l-2 border-gray-700">
                          <span className="text-xs text-gray-500">Groups:</span>
                          <div className="flex gap-2 mt-1">
                            {match.groups.map((group, gi) => (
                              <span key={gi} className="text-xs font-mono bg-gray-700 px-2 py-1 rounded">
                                ${gi + 1}: &quot;{group || 'undefined'}&quot;
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Common Patterns */}
          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Common Patterns</h3>
            <div className="space-y-2">
              {commonPatterns.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setPattern(item.pattern);
                    setFlags({ g: true, i: false, m: false, s: false });
                  }}
                  className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium">{item.name}</span>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-green-500" />
                  </div>
                  <code className="text-xs text-gray-500 mt-1 block truncate">
                    {item.pattern}
                  </code>
                </button>
              ))}
            </div>
          </div>

          {/* Cheatsheet Toggle */}
          <button
            onClick={() => setShowCheatsheet(!showCheatsheet)}
            className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl transition"
          >
            <BookOpen className="w-4 h-4" />
            {showCheatsheet ? 'Hide Cheatsheet' : 'Show Cheatsheet'}
          </button>
        </div>
      </div>

      {/* Cheatsheet Modal */}
      {showCheatsheet && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">Regex Cheatsheet</h3>
              <button
                onClick={() => setShowCheatsheet(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4">
                {regexCheatsheet.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setPattern((prev) => prev + item.pattern);
                    }}
                    className="p-3 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-700 transition"
                  >
                    <code className="text-green-500 font-mono text-lg">{item.pattern}</code>
                    <p className="text-gray-400 text-sm mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
