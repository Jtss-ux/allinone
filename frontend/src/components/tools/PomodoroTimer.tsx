'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'short' | 'long' | 'custom'>('work');
  const [cycles, setCycles] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(45);
  const audioRef = useRef<HTMLAudioElement>(null);

  const modes: Record<string, { time: number; label: string; color: string }> = {
    work: { time: 25 * 60, label: 'Work', color: 'from-red-600 to-orange-600' },
    short: { time: 5 * 60, label: 'Short Break', color: 'from-green-600 to-teal-600' },
    long: { time: 15 * 60, label: 'Long Break', color: 'from-blue-600 to-purple-600' },
    custom: { time: customMinutes * 60, label: 'Custom', color: 'from-yellow-600 to-pink-600' },
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      audioRef.current?.play();
      if (mode === 'work') {
        setCycles((prev) => prev + 1);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modes[mode].time);
  };

  const switchMode = (newMode: 'work' | 'short' | 'long' | 'custom') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'custom' ? customMinutes * 60 : modes[newMode].time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((modes[mode].time - timeLeft) / modes[mode].time) * 100;

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className={`bg-gradient-to-r ${modes[mode].color} p-4`}>
          <h3 className="text-2xl font-bold">⏱️ Pomodoro Timer</h3>
          <p className="text-gray-200">Stay focused and productive</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Mode Selection */}
          <div className="flex gap-2">
            {Object.entries(modes).map(([key, config]) => (
              <button
                key={key}
                onClick={() => switchMode(key as 'work' | 'short' | 'long' | 'custom')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode === key
                    ? 'bg-white text-gray-900'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
              >
                {config.label}
              </button>
            ))}
          </div>

          {/* Custom Time Input */}
          {mode === 'custom' && (
            <div className="flex items-center gap-3 mt-2">
              <label className="text-sm font-medium">Minutes:</label>
              <input
                type="number" min="1" max="240" value={customMinutes}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(240, Number(e.target.value)));
                  setCustomMinutes(val);
                  if (!isActive) setTimeLeft(val * 60);
                }}
                className="w-24 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 text-center focus:border-yellow-500 focus:outline-none"
              />
              <button
                onClick={() => { setIsActive(false); setTimeLeft(customMinutes * 60); }}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-semibold transition"
              >
                Set
              </button>
            </div>
          )}

          {/* Timer Display */}
          <div className="relative">
            <div className="text-8xl font-mono text-center py-8">
              {formatTime(timeLeft)}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button
              onClick={toggleTimer}
              className={`flex-1 py-4 rounded-lg font-bold text-xl transition ${isActive
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-green-600 hover:bg-green-700'
                }`}
            >
              {isActive ? '⏸️ Pause' : '▶️ Start'}
            </button>
            <button
              onClick={resetTimer}
              className="px-6 py-4 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold"
            >
              🔄
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-700 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{cycles}</div>
              <div className="text-sm text-gray-400">Sessions Completed</div>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {Math.floor(cycles * 25 / 60)}h {cycles * 25 % 60}m
              </div>
              <div className="text-sm text-gray-400">Total Focus Time</div>
            </div>
          </div>

          {/* Tips */}
          <div className="p-4 bg-gray-700 rounded-lg text-sm">
            <h4 className="font-semibold mb-2">💡 Pomodoro Technique:</h4>
            <ul className="text-gray-400 space-y-1">
              <li>• Work for 25 minutes</li>
              <li>• Take a 5-minute break</li>
              <li>• After 4 cycles, take a 15-minute break</li>
              <li>• Stay focused during work sessions</li>
            </ul>
          </div>
        </div>

        <audio ref={audioRef} src="/notification.mp3" />
      </div>
    </div>
  );
}
