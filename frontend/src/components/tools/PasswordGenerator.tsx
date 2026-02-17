'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Copy, RefreshCw, Check, Shield, Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
}

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordHistory, setPasswordHistory] = useState<string[]>([]);
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
  });

  const charset = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    similar: '0O1lI',
  };

  const generatePassword = useCallback(() => {
    let chars = '';
    if (options.uppercase) chars += charset.uppercase;
    if (options.lowercase) chars += charset.lowercase;
    if (options.numbers) chars += charset.numbers;
    if (options.symbols) chars += charset.symbols;

    if (chars === '') return;

    if (options.excludeSimilar) {
      charset.similar.split('').forEach(char => {
        chars = chars.replace(new RegExp(char, 'g'), '');
      });
    }

    let result = '';
    const array = new Uint32Array(options.length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < options.length; i++) {
      result += chars[array[i] % chars.length];
    }

    // Ensure at least one of each selected type
    let finalPassword = result;
    const positions: number[] = [];
    
    if (options.uppercase) {
      const pos = Math.floor(Math.random() * options.length);
      positions.push(pos);
      finalPassword = finalPassword.substring(0, pos) + 
        charset.uppercase[Math.floor(Math.random() * charset.uppercase.length)] + 
        finalPassword.substring(pos + 1);
    }
    if (options.lowercase) {
      let pos = Math.floor(Math.random() * options.length);
      while (positions.includes(pos)) pos = Math.floor(Math.random() * options.length);
      positions.push(pos);
      finalPassword = finalPassword.substring(0, pos) + 
        charset.lowercase[Math.floor(Math.random() * charset.lowercase.length)] + 
        finalPassword.substring(pos + 1);
    }
    if (options.numbers) {
      let pos = Math.floor(Math.random() * options.length);
      while (positions.includes(pos)) pos = Math.floor(Math.random() * options.length);
      positions.push(pos);
      finalPassword = finalPassword.substring(0, pos) + 
        charset.numbers[Math.floor(Math.random() * charset.numbers.length)] + 
        finalPassword.substring(pos + 1);
    }
    if (options.symbols) {
      let pos = Math.floor(Math.random() * options.length);
      while (positions.includes(pos)) pos = Math.floor(Math.random() * options.length);
      finalPassword = finalPassword.substring(0, pos) + 
        charset.symbols[Math.floor(Math.random() * charset.symbols.length)] + 
        finalPassword.substring(pos + 1);
    }

    setPassword(finalPassword);
    setPasswordHistory(prev => [finalPassword, ...prev].slice(0, 5));
  }, [options]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPasswordStrength = (pass: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^a-zA-Z0-9]/.test(pass)) score++;

    const strength = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong', 'Excellent'][score];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-500', 'bg-emerald-500'];
    
    return { score, label: strength, color: colors[score] };
  };

  const strength = getPasswordStrength(password);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Password Generator</h1>
        <p className="text-gray-400">Create strong, secure passwords instantly</p>
      </div>

      {/* Password Display */}
      <div className="bg-gray-900 rounded-xl p-6 mb-6">
        <div className="relative">
          <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-4">
            <Lock className="w-5 h-5 text-gray-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              readOnly
              className="flex-1 bg-transparent text-xl font-mono text-white outline-none"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 text-gray-500 hover:text-white transition"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <button
              onClick={copyToClipboard}
              className="p-2 text-gray-500 hover:text-green-500 transition"
            >
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Strength Indicator */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Password Strength</span>
            <span className="text-sm font-medium text-white">{strength.label}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${strength.color}`}
              style={{ width: `${((strength.score + 1) / 6) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="bg-gray-900 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Options</h2>

        {/* Length Slider */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Password Length</span>
            <span className="text-white font-medium">{options.length}</span>
          </div>
          <input
            type="range"
            min="4"
            max="64"
            value={options.length}
            onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>4</span>
            <span>64</span>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.uppercase}
              onChange={(e) => setOptions({ ...options, uppercase: e.target.checked })}
              className="w-5 h-5 rounded border-gray-600 text-green-500 focus:ring-green-500 bg-gray-700"
            />
            <span className="text-gray-300">Uppercase (A-Z)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.lowercase}
              onChange={(e) => setOptions({ ...options, lowercase: e.target.checked })}
              className="w-5 h-5 rounded border-gray-600 text-green-500 focus:ring-green-500 bg-gray-700"
            />
            <span className="text-gray-300">Lowercase (a-z)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.numbers}
              onChange={(e) => setOptions({ ...options, numbers: e.target.checked })}
              className="w-5 h-5 rounded border-gray-600 text-green-500 focus:ring-green-500 bg-gray-700"
            />
            <span className="text-gray-300">Numbers (0-9)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.symbols}
              onChange={(e) => setOptions({ ...options, symbols: e.target.checked })}
              className="w-5 h-5 rounded border-gray-600 text-green-500 focus:ring-green-500 bg-gray-700"
            />
            <span className="text-gray-300">Symbols (!@#$)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer col-span-2">
            <input
              type="checkbox"
              checked={options.excludeSimilar}
              onChange={(e) => setOptions({ ...options, excludeSimilar: e.target.checked })}
              className="w-5 h-5 rounded border-gray-600 text-green-500 focus:ring-green-500 bg-gray-700"
            />
            <span className="text-gray-300">Exclude Similar Characters (0, O, 1, l, I)</span>
          </label>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generatePassword}
        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition"
      >
        <RefreshCw className="w-5 h-5" />
        Generate New Password
      </button>

      {/* Password History */}
      {passwordHistory.length > 1 && (
        <div className="mt-6 bg-gray-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Passwords</h3>
          <div className="space-y-2">
            {passwordHistory.slice(1).map((pass, index) => (
              <div key={index} className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3">
                <span className="flex-1 font-mono text-gray-400 text-sm truncate">{pass}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(pass);
                  }}
                  className="p-1 text-gray-500 hover:text-green-500 transition"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
