'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import { backendApi } from '@/config/api';

export default function Home() {
  const [currentSection, setCurrentSection] = useState('image-generator');
  const [backendStatus, setBackendStatus] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(backendApi('/api/health'));
        setBackendStatus(response.ok);
      } catch (err) {
        setBackendStatus(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:transform-none transition-transform duration-300
        w-64 h-screen overflow-y-auto
      `}>
        <Sidebar currentSection={currentSection} onSectionChange={(section) => {
          setCurrentSection(section);
          setSidebarOpen(false);
        }} />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <div className="lg:hidden flex items-center justify-between p-4 bg-gray-950 border-b border-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 bg-gray-800 rounded-lg text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-white font-bold">AI Studio</h1>
          <div className="w-10" />
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-4 p-3 sm:p-4 bg-gray-950 border-b border-gray-800 items-center">
          <div className="px-3 py-2 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">ML: Running</span>
          </div>
          <div className="px-3 py-2 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${backendStatus ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">
              Backend: {backendStatus ? 'Online' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Dashboard
            section={currentSection}
            backendStatus={backendStatus}
            onSectionChange={(section) => setCurrentSection(section)}
          />
        </div>
      </div>
    </div>
  );
}
