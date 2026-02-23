'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const CAR_WIDTH = 40;
const CAR_HEIGHT = 70;
const ROAD_SPEED = 5;

interface Obstacle {
    x: number;
    y: number;
    speed: number;
    color: string;
}

export default function RacingGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    const state = useRef({
        carX: CANVAS_WIDTH / 2 - CAR_WIDTH / 2,
        obstacles: [] as Obstacle[],
        frameCount: 0,
        roadOffset: 0
    });

    const startGame = () => {
        setScore(0);
        setGameOver(false);
        state.current = {
            carX: CANVAS_WIDTH / 2 - CAR_WIDTH / 2,
            obstacles: [],
            frameCount: 0,
            roadOffset: 0
        };
        setIsPlaying(true);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isPlaying || gameOver) return;
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                state.current.carX = Math.max(40, state.current.carX - 20);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                state.current.carX = Math.min(CANVAS_WIDTH - 40 - CAR_WIDTH, state.current.carX + 20);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, gameOver]);

    useEffect(() => {
        if (!isPlaying) return;

        let animationId: number;
        const canvas = canvasRef.current;
        if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;

        const gameLoop = () => {
            const s = state.current;
            s.frameCount++;
            s.roadOffset = (s.roadOffset + ROAD_SPEED) % 40;

            // Score
            if (s.frameCount % 10 === 0) setScore(prev => prev + 1);

            // Add obstacles
            if (s.frameCount % 60 === 0) {
                const laneIdx = Math.floor(Math.random() * 3);
                const lanes = [70, CANVAS_WIDTH / 2 - CAR_WIDTH / 2, CANVAS_WIDTH - 70 - CAR_WIDTH];
                const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];
                s.obstacles.push({
                    x: lanes[laneIdx],
                    y: -CAR_HEIGHT,
                    speed: ROAD_SPEED + Math.random() * 3,
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
            }

            // Move obstacles and check collisions
            for (let i = s.obstacles.length - 1; i >= 0; i--) {
                const obs = s.obstacles[i];
                obs.y += obs.speed;

                // Collision logic
                const hitX = s.carX < obs.x + CAR_WIDTH && s.carX + CAR_WIDTH > obs.x;
                const hitY = CANVAS_HEIGHT - 20 - CAR_HEIGHT < obs.y + CAR_HEIGHT && CANVAS_HEIGHT - 20 > obs.y;

                if (hitX && hitY) {
                    setIsPlaying(false);
                    setGameOver(true);
                    return;
                }

                if (obs.y > CANVAS_HEIGHT) s.obstacles.splice(i, 1);
            }

            // Draw Background / Grass
            ctx.fillStyle = '#65a30d';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Draw Road
            ctx.fillStyle = '#334155';
            ctx.fillRect(40, 0, CANVAS_WIDTH - 80, CANVAS_HEIGHT);

            // Draw Lane markers
            ctx.fillStyle = '#cbd5e1';
            for (let i = -40; i < CANVAS_HEIGHT; i += 40) {
                ctx.fillRect(CANVAS_WIDTH / 3, i + s.roadOffset, 5, 20);
                ctx.fillRect((CANVAS_WIDTH / 3) * 2, i + s.roadOffset, 5, 20);
            }

            // Draw Player Car
            ctx.fillStyle = '#10b981'; // emerald
            ctx.fillRect(s.carX, CANVAS_HEIGHT - 20 - CAR_HEIGHT, CAR_WIDTH, CAR_HEIGHT);
            ctx.fillStyle = '#0f172a'; // windows
            ctx.fillRect(s.carX + 5, CANVAS_HEIGHT - 10 - CAR_HEIGHT, CAR_WIDTH - 10, 15);
            ctx.fillRect(s.carX + 5, CANVAS_HEIGHT - 40, CAR_WIDTH - 10, 10);

            // Draw Obstacles
            s.obstacles.forEach(obs => {
                ctx.fillStyle = obs.color;
                ctx.fillRect(obs.x, obs.y, CAR_WIDTH, CAR_HEIGHT);
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(obs.x + 5, obs.y + 10, CAR_WIDTH - 10, 15);
                ctx.fillRect(obs.x + 5, obs.y + CAR_HEIGHT - 20, CAR_WIDTH - 10, 10);
            });

            animationId = requestAnimationFrame(gameLoop);
        };

        animationId = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(animationId);
    }, [isPlaying]);

    return (
        <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="bg-slate-900 rounded-xl p-4 shadow-2xl border border-slate-700 w-full text-center">
                <div className="flex justify-between items-center mb-4 px-4 h-12">
                    <h2 className="text-2xl font-black text-emerald-400 uppercase italic flex items-center gap-2">
                        🏎️ Turbo Racing
                    </h2>
                    <div className="text-right">
                        <span className="text-slate-400 font-bold uppercase text-xs block">Score</span>
                        <span className="text-2xl font-black text-white">{score}</span>
                    </div>
                </div>

                <div className="relative rounded-lg overflow-hidden border-4 border-slate-600 shadow-inner align-middle inline-block">
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        className="block"
                    />

                    {!isPlaying && !gameOver && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                            <button
                                onClick={startGame}
                                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white text-xl font-black rounded-lg shadow-lg transform transition hover:scale-105 uppercase tracking-widest"
                            >
                                Start Engine
                            </button>
                            <p className="mt-6 text-emerald-200 font-bold">Use Left/Right Arrows to steer</p>
                        </div>
                    )}

                    {gameOver && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
                            <h3 className="text-5xl font-black text-red-500 mb-2 rotate-[-5deg]">CRASH!</h3>
                            <p className="text-xl text-slate-300 font-bold mb-8">Final Score: {score}</p>
                            <button
                                onClick={startGame}
                                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white text-xl font-black rounded-lg shadow-lg uppercase tracking-widest"
                            >
                                Play Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
