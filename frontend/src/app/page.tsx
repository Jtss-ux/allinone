'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import { API_CONFIG } from '@/config/api';

export default function Home() {
  const [currentSection, setCurrentSection] = useState('image-generator');
  const [backendStatus, setBackendStatus] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [debugUrl, setDebugUrl] = useState('');

  useEffect(() => {
    // Check if backend is running using environment variable
    const checkBackend = async () => {
      try {
        // Use environment variable directly
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        setDebugUrl(backendUrl); // For debugging
        const response = await axios.get(`${backendUrl}/api/health`, { 
          timeout: 10000,
          withCredentials: false 
        });
        if (response.status === 200) {
          setBackendStatus(true);
        }
      } catch (error) {
        console.log('Backend connection failed:', error);
        setBackendStatus(false);
      }
    };
    
    // Initial check
    checkBackend();
    
    // Check again after a short delay
    const timer = setTimeout(checkBackend, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Close sidebar when clicking outside on mobile
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
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - Responsive */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:transform-none transition-transform duration-300
        w-64 h-full
      `}>
        <Sidebar currentSection={currentSection} onSectionChange={(section) => {
          setCurrentSection(section);
          setSidebarOpen(false);
        }} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header with Menu Button */}
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
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Status Bar - Responsive */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-2 sm:p-4 bg-gray-950 border-b border-gray-800">
          <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-800 rounded-lg border border-gray-700 text-xs sm:text-sm">
            <span className="text-gray-400">ML: </span>
            <span className="text-green-500 font-semibold">● Running</span>
          </div>
          <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-800 rounded-lg border border-gray-700 text-xs sm:text-sm">
            <span className="text-gray-400">Backend: </span>
            <span className={`font-semibold ${backendStatus ? 'text-green-500' : 'text-red-500'}`}>
              ● {backendStatus ? 'Running' : 'Disconnected'}
            </span>
          </div>
          {/* Debug: Show which URL is being used */}
          {debugUrl && (
            <div className="px-3 py-1 bg-gray-900 rounded text-xs text-gray-500">
              API: {debugUrl}
            </div>
          )}
        </div>
        
        {/* Dashboard - Scrollable */}
        <div className="flex-1 overflow-auto">
          <Dashboard section={currentSection} backendStatus={backendStatus} />
        </div>
      </div>
    </div>
  );
}
"// Build trigger" 
" " 
