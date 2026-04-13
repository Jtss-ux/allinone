'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';
import { Globe, Search, Link as LinkIcon, Loader2, FileText, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function WebResearch() {
  const [mode, setMode] = useState<'search' | 'scrape'>('search');
  const [query, setQuery] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleResearch = async () => {
    const targetValue = mode === 'search' ? query : url;
    if (!targetValue.trim()) {
      setError(`Please enter a ${mode === 'search' ? 'search query' : 'URL'}`);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post(backendApi('/api/web/research'), {
        mode,
        query: mode === 'search' ? query : undefined,
        url: mode === 'scrape' ? url : undefined,
      });

      if (response.data.success) {
        setResult(response.data);
      } else {
        setError(response.data.error || 'Research failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to connect to research service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl tv:max-w-[1600px] mx-auto space-y-6">
      <div className="bg-gray-800/80 backdrop-blur border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Web Researcher</h2>
              <p className="text-green-100 opacity-80">Powered by Firecrawl — Fast, Clean Web Context</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 space-y-6">
          <div className="flex gap-2 p-1 bg-gray-900 rounded-xl w-fit">
            <button
              onClick={() => setMode('search')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                mode === 'search' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="font-semibold text-sm">Web Search</span>
            </button>
            <button
              onClick={() => setMode('scrape')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                mode === 'scrape' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span className="font-semibold text-sm">URL Scrape</span>
            </button>
          </div>

          <div className="space-y-4">
            {mode === 'search' ? (
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
                  placeholder="What would you like to research?"
                  className="w-full bg-gray-900 text-white rounded-xl pl-12 pr-4 py-4 border border-gray-700 focus:border-green-500 focus:outline-none transition-all placeholder:text-gray-600"
                />
              </div>
            ) : (
              <div className="relative group">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
                  placeholder="Enter URL to scrape (e.g., https://firecrawl.dev)"
                  className="w-full bg-gray-900 text-white rounded-xl pl-12 pr-4 py-4 border border-gray-700 focus:border-green-500 focus:outline-none transition-all placeholder:text-gray-600"
                />
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-900/30 border border-red-500/50 text-red-200 rounded-xl text-sm flex items-center gap-3">
                <div className="p-1 bgColor-red-500 rounded-full">!</div>
                {error}
              </div>
            )}

            <button
              onClick={handleResearch}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {mode === 'search' ? 'Searching the web...' : 'Scraping content...'}
                </>
              ) : (
                <>
                  {mode === 'search' ? <Search className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
                  {mode === 'search' ? 'Start Research' : 'Scrape Webpage'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              Research Results
            </h3>
            <span className="text-xs font-mono text-gray-500 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
              Provider: {result.provider}
            </span>
          </div>

          <div className="grid gap-6">
            {mode === 'search' ? (
              result.data.map((item: any, idx: number) => (
                <div key={idx} className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
                  <div className="p-6 border-b border-gray-700 bg-gray-800/50">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-lg font-bold text-green-400 mb-1 leading-tight">{item.title || 'Untitled'}</h4>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-gray-400 hover:text-green-500 flex items-center gap-1 transition-colors"
                        >
                          {item.url}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="px-3 py-1 bg-green-900/30 text-green-400 text-[10px] font-bold rounded-full border border-green-500/30 uppercase tracking-wider">
                        Result {idx + 1}
                      </div>
                    </div>
                  </div>
                  <div className="p-6 prose prose-invert prose-sm max-w-none prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700">
                    <ReactMarkdown>{item.markdown || item.description || ''}</ReactMarkdown>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
                 <div className="p-6 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center border border-green-500/20">
                        <LinkIcon className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{result.data.metadata?.title || 'Scraped Content'}</h4>
                        <p className="text-xs text-gray-400">{url}</p>
                      </div>
                    </div>
                    {result.data.metadata?.sourceURL && (
                      <a 
                        href={result.data.metadata.sourceURL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-900 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-all border border-gray-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                 </div>
                 <div className="p-8 prose prose-invert max-w-none prose-headings:text-green-400 prose-a:text-green-400 prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-800 prose-pre:p-6 prose-pre:rounded-xl">
                    <ReactMarkdown>{result.data.markdown || ''}</ReactMarkdown>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <div className="py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto border border-gray-700 shadow-xl">
            <Globe className="w-10 h-10 text-gray-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-400">Ready to research</h3>
            <p className="text-gray-600 max-w-xs mx-auto text-sm italic">
              "The web is your database. Let Firecrawl extract the knowledge for you."
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
