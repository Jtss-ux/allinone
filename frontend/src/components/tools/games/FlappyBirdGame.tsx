'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

const GRAVITY = 0.5;
const FLAP_STRENGTH = -8;
const PIPE_SPEED = 3;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const BIRD_SIZE = 30;

interface Pipe {
    x: number;
    topHeight: number;
    passed: boolean;
}

export default function FlappyBirdGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);

    const state = useRef({
        birdY: CANVAS_HEIGHT / 2,
        birdVelocity: 0,
        pipes: [] as Pipe[],
        frameCount: 0
    });

    const jump = useCallback(() => {
        if (!isPlaying) {
            if (gameOver) {
                setGameOver(false);
                setScore(0);
                state.current = {
                    birdY: CANVAS_HEIGHT / 2,
                    birdVelocity: 0,
                    pipes: [],
                    frameCount: 0
                };
            }
            setIsPlaying(true);
        }
        state.current.birdVelocity = FLAP_STRENGTH;
    }, [isPlaying, gameOver]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                jump();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [jump]);

    useEffect(() => {
        if (!isPlaying) return;

        let animationId: number;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const gameLoop = () => {
            const s = state.current;
            s.frameCount++;

            // Physics
            s.birdVelocity += GRAVITY;
            s.birdY += s.birdVelocity;

            // Add pipes
            if (s.frameCount % 90 === 0) {
                const minHeight = 50;
                const maxHeight = CANVAS_HEIGHT - PIPE_GAP - minHeight - 50; // 50 for ground
                const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
                s.pipes.push({ x: CANVAS_WIDTH, topHeight, passed: false });
            }

            // Move pipes and collision check
            for (let i = s.pipes.length - 1; i >= 0; i--) {
                const p = s.pipes[i];
                p.x -= PIPE_SPEED;

                // Collision logic
                const birdLeft = CANVAS_WIDTH / 3;
                const birdRight = birdLeft + BIRD_SIZE;
                const birdTop = s.birdY;
                const birdBottom = s.birdY + BIRD_SIZE;

                const hitTopPipe = birdRight > p.x && birdLeft < p.x + PIPE_WIDTH && birdTop < p.topHeight;
                const hitBottomPipe = birdRight > p.x && birdLeft < p.x + PIPE_WIDTH && birdBottom > p.topHeight + PIPE_GAP;

                if (hitTopPipe || hitBottomPipe) {
                    endGame();
                    return;
                }

                // Score logic
                if (p.x + PIPE_WIDTH < birdLeft && !p.passed) {
                    setScore(prev => {
                        const newScore = prev + 1;
                        if (newScore > highScore) setHighScore(newScore);
                        return newScore;
                    });
                    p.passed = true;
                }

                // Remove off-screen pipes
                if (p.x + PIPE_WIDTH < 0) {
                    s.pipes.splice(i, 1);
                }
            }

            // Ground/Ceiling collision
            if (s.birdY + BIRD_SIZE > CANVAS_HEIGHT - 50 || s.birdY < 0) {
                endGame();
                return;
            }

            // Draw
            ctx.fillStyle = '#70c5ce'; // sky blue
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Draw pipes
            ctx.fillStyle = '#73bf2e'; // green
            ctx.strokeStyle = '#558b22';
            ctx.lineWidth = 4;

            s.pipes.forEach(p => {
                // Top pipe
                ctx.fillRect(p.x, 0, PIPE_WIDTH, p.topHeight);
                ctx.strokeRect(p.x, 0, PIPE_WIDTH, p.topHeight);
                // Bottom pipe
                const bottomY = p.topHeight + PIPE_GAP;
                const bottomHeight = CANVAS_HEIGHT - bottomY - 50;
                ctx.fillRect(p.x, bottomY, PIPE_WIDTH, bottomHeight);
                ctx.strokeRect(p.x, bottomY, PIPE_WIDTH, bottomHeight);
            });

            // Draw ground
            ctx.fillStyle = '#ded895';
            ctx.fillRect(0, CANVAS_HEIGHT - 50, CANVAS_WIDTH, 50);
            ctx.fillStyle = '#73bf2e';
            ctx.fillRect(0, CANVAS_HEIGHT - 50, CANVAS_WIDTH, 10);

            // Draw bird (simple yellow square for now, could use image)
            ctx.fillStyle = '#fce523';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.save();
            ctx.translate(CANVAS_WIDTH / 3 + BIRD_SIZE / 2, s.birdY + BIRD_SIZE / 2);
            ctx.rotate(Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (s.birdVelocity * 0.1))));
            ctx.fillRect(-BIRD_SIZE / 2, -BIRD_SIZE / 2, BIRD_SIZE, BIRD_SIZE);
            ctx.strokeRect(-BIRD_SIZE / 2, -BIRD_SIZE / 2, BIRD_SIZE, BIRD_SIZE);

            // Bird eye
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(8, -5, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(10, -5, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            animationId = requestAnimationFrame(gameLoop);
        };

        const endGame = () => {
            setIsPlaying(false);
            setGameOver(true);
            cancelAnimationFrame(animationId);
        };

        animationId = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(animationId);
    }, [isPlaying, highScore]);

    // Initial render
    useEffect(() => {
        if (isPlaying || gameOver) return;
        const canvas = canvasRef.current;
        if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;
        ctx.fillStyle = '#70c5ce'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = '#ded895'; ctx.fillRect(0, CANVAS_HEIGHT - 50, CANVAS_WIDTH, 50);
        ctx.fillStyle = '#73bf2e'; ctx.fillRect(0, CANVAS_HEIGHT - 50, CANVAS_WIDTH, 10);
        ctx.fillStyle = '#fce523'; ctx.fillRect(CANVAS_WIDTH / 3, CANVAS_HEIGHT / 2, BIRD_SIZE, BIRD_SIZE);
    }, [isPlaying, gameOver]);

    return (
        <div className="max-w-md mx-auto flex flex-col items-center select-none" onPointerDown={jump}>
            <div className="bg-white rounded-lg p-4 shadow-xl border border-gray-200">
                <div className="flex justify-between items-end mb-4 px-2">
                    <div>
                        <span className="text-gray-500 font-bold uppercase text-xs block">Score</span>
                        <span className="text-4xl font-black text-gray-800">{score}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-gray-500 font-bold uppercase text-xs block">Best</span>
                        <span className="text-2xl font-black text-gray-800">{highScore}</span>
                    </div>
                </div>

                <div className="relative rounded overflow-hidden shadow-inner border-2 border-slate-300">
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        className="block cursor-pointer bg-white"
                    />

                    {!isPlaying && !gameOver && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 pointer-events-none">
                            <div className="bg-white/90 p-6 rounded-xl text-center shadow-lg transform animate-bounce border-2 border-orange-400">
                                <div className="text-4xl mb-2">🦅</div>
                                <h3 className="text-2xl font-black text-slate-800 mb-2">FLAPPY BIRD</h3>
                                <p className="text-slate-600 font-bold text-sm">Click or Press Space/Up to Flap</p>
                            </div>
                        </div>
                    )}

                    {gameOver && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 pointer-events-none">
                            <div className="bg-white p-8 rounded-xl text-center shadow-2xl border-4 border-red-500">
                                <h3 className="text-4xl font-black text-red-500 mb-2">GAME OVER</h3>
                                <p className="text-xl text-slate-700 font-bold mb-6">Score: {score}</p>
                                <div className="bg-green-500 text-white px-6 py-2 rounded-full font-bold uppercase tracking-wider text-lg inline-block">
                                    Click to Restart
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
