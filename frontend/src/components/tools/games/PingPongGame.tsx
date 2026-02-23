'use client';

import React, { useRef, useEffect, useState } from 'react';

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

export default function PingPongGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState({ player: 0, ai: 0 });
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);

    // Game state refs (to avoid re-renders)
    const state = useRef({
        playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        aiY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        ballX: CANVAS_WIDTH / 2,
        ballY: CANVAS_HEIGHT / 2,
        ballSpeedX: 5,
        ballSpeedY: 5,
    });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            const relativeY = e.clientY - rect.top;
            // Keep paddle in bounds
            state.current.playerY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, relativeY - PADDLE_HEIGHT / 2));
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        if (!isPlaying || isGameOver) return;

        let animationId: number;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const gameLoop = () => {
            const s = state.current;

            // Move ball
            s.ballX += s.ballSpeedX;
            s.ballY += s.ballSpeedY;

            // Bounce off top/bottom
            if (s.ballY <= 0 || s.ballY + BALL_SIZE >= CANVAS_HEIGHT) {
                s.ballSpeedY = -s.ballSpeedY;
            }

            // Check paddle collisions
            // Player paddle (Left)
            if (s.ballX <= PADDLE_WIDTH && s.ballY + BALL_SIZE >= s.playerY && s.ballY <= s.playerY + PADDLE_HEIGHT) {
                s.ballSpeedX = -s.ballSpeedX;
                s.ballX = PADDLE_WIDTH; // snap to avoid getting stuck
                s.ballSpeedX *= 1.05; // speed up
            }

            // AI paddle (Right)
            if (s.ballX + BALL_SIZE >= CANVAS_WIDTH - PADDLE_WIDTH && s.ballY + BALL_SIZE >= s.aiY && s.ballY <= s.aiY + PADDLE_HEIGHT) {
                s.ballSpeedX = -s.ballSpeedX;
                s.ballX = CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE;
                s.ballSpeedX *= 1.05;
            }

            // Simple AI movement
            const aiCenter = s.aiY + PADDLE_HEIGHT / 2;
            const ballCenter = s.ballY + BALL_SIZE / 2;
            if (aiCenter < ballCenter - 10) s.aiY += 4;
            else if (aiCenter > ballCenter + 10) s.aiY -= 4;
            s.aiY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, s.aiY)); // Keep AI in bounds

            // Scoring
            if (s.ballX < 0 || s.ballX > CANVAS_WIDTH) {
                const isPlayerScore = s.ballX > CANVAS_WIDTH;
                if (isPlayerScore) setScore(prev => ({ ...prev, player: prev.player + 1 }));
                if (!isPlayerScore) setScore(prev => ({ ...prev, ai: prev.ai + 1 }));

                // Reset ball
                s.ballX = CANVAS_WIDTH / 2;
                s.ballY = CANVAS_HEIGHT / 2;
                s.ballSpeedX = (isPlayerScore ? -1 : 1) * 5;
                s.ballSpeedY = 5 * (Math.random() > 0.5 ? 1 : -1);
            }

            // Draw
            ctx.fillStyle = '#1e293b'; // slate-800
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Center line
            ctx.strokeStyle = '#475569';
            ctx.beginPath();
            ctx.setLineDash([10, 15]);
            ctx.moveTo(CANVAS_WIDTH / 2, 0);
            ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
            ctx.stroke();

            // Draw paddles
            ctx.fillStyle = '#3b82f6'; // Player blue
            ctx.fillRect(0, s.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

            ctx.fillStyle = '#ef4444'; // AI red
            ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, s.aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

            // Draw ball
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(s.ballX + BALL_SIZE / 2, s.ballY + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
            ctx.fill();

            animationId = requestAnimationFrame(gameLoop);
        };

        animationId = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(animationId);
    }, [isPlaying, isGameOver]);

    // Initial draw
    useEffect(() => {
        if (isPlaying) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(0, CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, BALL_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
    }, [isPlaying]);

    const startGame = () => {
        setScore({ player: 0, ai: 0 });
        state.current = {
            playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            aiY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            ballX: CANVAS_WIDTH / 2,
            ballY: CANVAS_HEIGHT / 2,
            ballSpeedX: 5 * (Math.random() > 0.5 ? 1 : -1),
            ballSpeedY: 5 * (Math.random() > 0.5 ? 1 : -1),
        };
        setIsPlaying(true);
        setIsGameOver(false);
    };

    return (
        <div className="max-w-3xl mx-auto flex flex-col items-center">
            <div className="w-full bg-slate-900 rounded-xl p-6 shadow-2xl border border-slate-700">
                <div className="flex justify-between items-center mb-6 px-8">
                    <div className="flex flex-col items-center">
                        <span className="text-blue-400 font-bold uppercase tracking-wider text-sm mb-1">Player</span>
                        <span className="text-5xl font-mono font-bold text-white">{score.player}</span>
                    </div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-400 italic mx-4">
                        PING PONG
                    </h2>
                    <div className="flex flex-col items-center">
                        <span className="text-red-400 font-bold uppercase tracking-wider text-sm mb-1">Bot</span>
                        <span className="text-5xl font-mono font-bold text-white">{score.ai}</span>
                    </div>
                </div>

                <div className="relative rounded-lg overflow-hidden border-4 border-slate-600 shadow-[0_0_30px_rgba(0,0,0,0.5)] mx-auto" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        className="w-full h-full cursor-none"
                    />

                    {!isPlaying && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-10">
                            <div className="text-6xl mb-6">🏓</div>
                            <button
                                onClick={startGame}
                                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xl font-bold rounded-full shadow-lg transform transition hover:scale-105"
                            >
                                START MATCH
                            </button>
                            <p className="mt-4 text-slate-300 font-medium">Move your mouse up and down to control the blue paddle</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
