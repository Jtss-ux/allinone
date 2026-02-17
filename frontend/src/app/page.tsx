'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [currentSection, setCurrentSection] = useState('image-generator');
  const [backendStatus, setBackendStatus] = useState(false);

  useEffect(() => {
    // Check if backend is running
    axios.get('http://localhost:5000/api/health')
      .then(() => setBackendStatus(true))
      .catch(() => setBackendStatus(false));
  }, []);

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar currentSection={currentSection} onSectionChange={setCurrentSection} />
      <div className="flex-1 overflow-auto">
        {/* Status Bar */}
        <div className="fixed top-4 right-4 z-50 flex gap-3">
          <div className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
            <span className="text-sm text-gray-400">ML: </span>
            <span className="text-sm text-green-500 font-semibold">● Running</span>
          </div>
          <div className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
            <span className="text-sm text-gray-400">Backend: </span>
            <span className={`text-sm font-semibold ${backendStatus ? 'text-green-500' : 'text-red-500'}`}>
              ● {backendStatus ? 'Running' : 'Disconnected'}
            </span>
          </div>
        </div>
        <Dashboard section={currentSection} backendStatus={backendStatus} />
      </div>
    </div>
  );
}
"// Build trigger" 
" " 
