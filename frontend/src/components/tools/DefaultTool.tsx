'use client';

import React from 'react';

interface DefaultToolProps {
  toolName: string;
}

export default function DefaultTool({ toolName }: DefaultToolProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <div className="mb-4">
          <div className="text-6xl">🚀</div>
        </div>
        <h3 className="text-2xl font-semibold mb-2">Coming Soon</h3>
        <p className="text-gray-400 mb-6">
          The <span className="text-green-500 font-semibold">{toolName.replace(/-/g, ' ')}</span> tool is currently under development.
        </p>
        <div className="p-4 bg-gray-700 rounded-lg text-left text-sm">
          <p className="text-gray-300 mb-2">
            <strong>What to expect:</strong>
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>High-quality AI processing</li>
            <li>Fast generation times</li>
            <li>Multiple customization options</li>
            <li>Download and export results</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
