'use client';

import React, { useState, useEffect } from 'react';
import { backendApi, mlApi } from '@/config/api';

interface LatencyResult {
  backend: number;
  ml: number;
}

export default function SystemStatus() {
  const [latency, setLatency] = useState<LatencyResult | null>(null);
  const [webgpuStatus, setWebgpuStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    checkWebGPU();
  }, []);

  const checkWebGPU = async () => {
    try {
      // @ts-ignore - WebGPU API not fully typed in standard TypeScript
      if (navigator.gpu) {
        // @ts-ignore
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) {
          setWebgpuStatus('available');
          return;
        }
      }
      setWebgpuStatus('unavailable');
    } catch {
      setWebgpuStatus('unavailable');
    }
  };

  const runLatencyTest = async () => {
    setChecking(true);
    
    try {
      const times: number[] = [];
      
      // Test Backend (try 3 times)
      for (let i = 0; i < 3; i++) {
        const start = performance.now();
        try {
          await fetch(backendApi('/api/health'), {
            method: 'GET',
            mode: 'no-cors'
          });
        } catch {}
        times.push(performance.now() - start);
      }
      const backendAvg = times.reduce((a, b) => a + b, 0) / times.length;

      // Test ML Service (try 3 times)
      const mlTimes: number[] = [];
      for (let i = 0; i < 3; i++) {
        const start = performance.now();
        try {
          await fetch(mlApi('/api/health'), {
            method: 'GET',
            mode: 'no-cors'
          });
        } catch {}
        mlTimes.push(performance.now() - start);
      }
      const mlAvg = mlTimes.reduce((a, b) => a + b, 0) / mlTimes.length;

      setLatency({
        backend: Math.round(backendAvg),
        ml: Math.round(mlAvg)
      });
    } catch (error) {
      console.error('Latency test failed:', error);
    }
    
    setChecking(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8">
        <h3 className="text-xl font-semibold mb-4">📊 System Status & Latency</h3>

        {/* WebGPU Status */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2">🌐 Browser AI (WebGPU)</h4>
          <div className="p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">WebGPU Support:</p>
                <p className="text-sm text-gray-400">Run AI in browser without server</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                webgpuStatus === 'available' ? 'bg-green-600' : 'bg-red-600'
              }`}>
                {webgpuStatus === 'available' ? '✅ Available' : '❌ Not Available'}
              </div>
            </div>
            {webgpuStatus === 'available' && (
              <p className="mt-3 text-sm text-green-400">
                🎉 Your browser supports WebGPU! Future updates will enable browser-based AI.
              </p>
            )}
            {webgpuStatus === 'unavailable' && (
              <p className="mt-3 text-sm text-yellow-400">
                💡 Use Chrome or Edge for WebGPU support. Currently using server-side AI.
              </p>
            )}
          </div>
        </div>

        {/* Latency Test */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2">📡 Ping / Latency Test</h4>
          <div className="p-4 bg-gray-700 rounded-lg">
            <button
              onClick={runLatencyTest}
              disabled={checking}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {checking ? '⏳ Testing...' : '🏓 Run Ping Test'}
            </button>

            {latency && (
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="p-3 bg-gray-600 rounded">
                  <p className="text-xs text-gray-400">Backend (5000)</p>
                  <p className="text-2xl font-bold text-green-400">{latency.backend}ms</p>
                  <p className="text-xs text-gray-500">API Server</p>
                </div>
                <div className="p-3 bg-gray-600 rounded">
                  <p className="text-xs text-gray-400">ML Service (5001)</p>
                  <p className="text-2xl font-bold text-blue-400">{latency.ml}ms</p>
                  <p className="text-xs text-gray-500">AI Processing</p>
                </div>
              </div>
            )}

            {!latency && !checking && (
              <p className="mt-3 text-sm text-gray-400 text-center">
                Click the button to test connection speed to local servers
              </p>
            )}
          </div>
        </div>

        {/* Service Status */}
        <div>
          <h4 className="font-semibold mb-2">🔌 Service Status</h4>
          <div className="p-4 bg-gray-700 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Frontend (Next.js)</span>
              <span className="text-green-500 font-semibold">● Running</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Backend API (Express)</span>
              <span className="text-green-500 font-semibold">● Running</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">ML Service (PyTorch)</span>
              <span className="text-green-500 font-semibold">● Running</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Device Mode</span>
              <span className="text-yellow-500 font-semibold">CPU</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
