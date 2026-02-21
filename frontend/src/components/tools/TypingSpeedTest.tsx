'use client';

import React, { useState, useEffect } from 'react';

export default function TypingSpeedTest() {
    const texts = [
        "The quick brown fox jumps over the lazy dog near the riverbank while the sun sets gently behind the mountains casting long shadows across the valley floor.",
        "Technology advances rapidly every year bringing new innovations that change how we work and live in ways we never imagined possible just a decade ago.",
        "Programming is the art of telling a computer what to do through carefully crafted instructions that must be precise logical and well organized to function correctly.",
        "Artificial intelligence is transforming industries worldwide from healthcare to education creating opportunities and challenges that society must navigate thoughtfully.",
        "The ocean covers more than seventy percent of our planet providing habitat for millions of species and playing a crucial role in regulating the global climate system.",
    ];

    const [selectedText, setSelectedText] = useState('');
    const [userInput, setUserInput] = useState('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [elapsed, setElapsed] = useState(0);

    const startTest = () => {
        const randomText = texts[Math.floor(Math.random() * texts.length)];
        setSelectedText(randomText);
        setUserInput('');
        setStartTime(null);
        setEndTime(null);
        setIsActive(true);
        setWpm(0);
        setAccuracy(100);
        setElapsed(0);
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && startTime && !endTime) {
            interval = setInterval(() => {
                setElapsed(Math.floor((Date.now() - startTime) / 1000));
            }, 200);
        }
        return () => clearInterval(interval);
    }, [isActive, startTime, endTime]);

    const handleInput = (value: string) => {
        if (!isActive) return;
        if (!startTime) setStartTime(Date.now());
        setUserInput(value);

        // Calculate accuracy
        let correct = 0;
        for (let i = 0; i < value.length; i++) {
            if (value[i] === selectedText[i]) correct++;
        }
        const acc = value.length > 0 ? Math.round((correct / value.length) * 100) : 100;
        setAccuracy(acc);

        // Calculate WPM
        const timeInMinutes = (Date.now() - (startTime || Date.now())) / 60000;
        if (timeInMinutes > 0) {
            const words = value.trim().split(/\s+/).length;
            setWpm(Math.round(words / timeInMinutes));
        }

        // Check if completed
        if (value.length >= selectedText.length) {
            setEndTime(Date.now());
            setIsActive(false);
        }
    };

    const getCharClass = (index: number): string => {
        if (index >= userInput.length) return 'text-gray-500';
        return userInput[index] === selectedText[index] ? 'text-green-400' : 'text-red-400 bg-red-900/30';
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl">⌨️</div>
                    <div>
                        <h3 className="text-xl font-semibold">Typing Speed Test</h3>
                        <p className="text-sm text-gray-400">Test your typing speed and accuracy</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-700 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-400">{wpm}</div>
                        <div className="text-xs text-gray-400">WPM</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-blue-400">{accuracy}%</div>
                        <div className="text-xs text-gray-400">Accuracy</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-yellow-400">{elapsed}s</div>
                        <div className="text-xs text-gray-400">Time</div>
                    </div>
                </div>

                {!isActive && !endTime && (
                    <button onClick={startTest} className="w-full px-4 py-4 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-lg transition">
                        ▶️ Start Typing Test
                    </button>
                )}

                {isActive && selectedText && (
                    <div className="space-y-4">
                        <div className="bg-gray-900 rounded-lg p-4 text-lg leading-relaxed font-mono">
                            {selectedText.split('').map((char, i) => (
                                <span key={i} className={getCharClass(i)}>{char}</span>
                            ))}
                        </div>
                        <textarea
                            value={userInput}
                            onChange={(e) => handleInput(e.target.value)}
                            autoFocus
                            placeholder="Start typing here..."
                            className="w-full p-4 bg-gray-700 text-white rounded-lg border-2 border-green-500 focus:outline-none font-mono text-lg"
                            rows={3}
                        />
                    </div>
                )}

                {endTime && (
                    <div className="space-y-4">
                        <div className="bg-green-900/30 border border-green-700 rounded-lg p-6 text-center">
                            <h4 className="text-xl font-bold text-green-400 mb-2">🎉 Test Complete!</h4>
                            <p className="text-gray-300">You typed at <strong className="text-green-400">{wpm} WPM</strong> with <strong className="text-blue-400">{accuracy}%</strong> accuracy in <strong className="text-yellow-400">{elapsed}s</strong></p>
                            <p className="text-sm text-gray-400 mt-2">
                                {wpm >= 80 ? '🏆 Expert typist!' : wpm >= 50 ? '👍 Great speed!' : wpm >= 30 ? '📈 Keep practicing!' : '💪 You can improve!'}
                            </p>
                        </div>
                        <button onClick={startTest} className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition">
                            🔄 Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
