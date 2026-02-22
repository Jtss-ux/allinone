'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

export default function AudioGenerator() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('en');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Please enter text to convert');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post(backendApi('/api/audio/generate'), {
        text,
        voice,
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate audio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8">
        <h3 className="text-xl font-semibold mb-4">Text to Speech</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Text to Convert to Speech</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter the text you want to convert to speech..."
            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
            rows={4}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Language</label>
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
            <option value="ru">Russian</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="zh">Chinese</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '🔊 Racing TTS providers...' : 'Generate Audio'}
        </button>

        {result && result.success && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">✅ Audio Generated</h4>

            {result.audioUrl && (
              <div className="mb-4">
                <audio controls className="w-full">
                  <source src={result.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {result.audioUrl && (
              <a
                href={result.audioUrl}
                download={`ai-audio-${result.jobId}.mp3`}
                className="inline-block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition mb-4"
              >
                ⬇️ Download Audio
              </a>
            )}

            <div className="p-3 bg-gray-700 rounded-lg space-y-1">
              <p className="text-sm text-gray-300">
                <strong>Job ID:</strong> {result.jobId}
              </p>
              <p className="text-sm text-gray-300">
                <strong>Text:</strong> {result.text}
              </p>
              <p className="text-sm text-gray-300">
                <strong>Language:</strong> {result.voice}
              </p>
              {result.provider && (
                <p className="text-sm text-gray-300">
                  <strong>Model:</strong>{' '}
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-900/50 text-purple-300 border border-purple-700/50">
                    🤖 {result.provider}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}

        {result && !result.success && (
          <div className="mt-4 p-3 bg-red-900 text-red-100 rounded-lg">
            {result.error}
          </div>
        )}
      </div>
    </div>
  );
}
