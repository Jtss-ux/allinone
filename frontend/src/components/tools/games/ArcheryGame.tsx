'use client';

import React, { useRef, useEffect, useState } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

export default function ArcheryGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [arrows, setArrows] = useState(5);
    const [message, setMessage] = useState('');

    const state = useRef({
        targetY: CANVAS_HEIGHT / 2,
        targetDir: 1,
        arrowX: 50,
        arrowY: CANVAS_HEIGHT / 2,
        isShooting: false,
        particles: [] as { x: number, y: number, vx: number, vy: number, life: number }[]
    });

    const shoot = () => {
        if (state.current.isShooting || arrows <= 0) return;
        state.current.isShooting = true;
        setArrows(prev => prev - 1);
        setMessage('');
    };

    const restart = () => {
        setScore(0);
        setArrows(5);
        setMessage('Shoot the center for 100 points!');
        state.current.isShooting = false;
        state.current.arrowX = 50;
    };

    useEffect(() => {
        let animationId: number;
        const canvas = canvasRef.current;
        if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;

        const loop = () => {
            const s = state.current;

            // Update target
            s.targetY += 3 * s.targetDir;
            if (s.targetY > CANVAS_HEIGHT - 50 || s.targetY < 50) s.targetDir *= -1;

            // Update arrow
            if (s.isShooting) {
                s.arrowX += 15;

                // Collision check
                if (s.arrowX > CANVAS_WIDTH - 80) {
                    const dist = Math.abs(s.arrowY - s.targetY);
                    s.isShooting = false;
                    s.arrowX = 50;

                    if (dist < 10) {
                        setScore(p => p + 100); setMessage('BULLSEYE! +100');
                        for (let i = 0; i < 20; i++) s.particles.push({ x: CANVAS_WIDTH - 70, y: s.targetY, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, life: 1 });
                    }
                    else if (dist < 40) { setScore(p => p + 50); setMessage('Good Hit! +50'); }
                    else if (dist < 80) { setScore(p => p + 10); setMessage('Outer Ring. +10'); }
                    else { setMessage('Missed!'); }
                }
            }

            // Update particles
            s.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.05; });
            s.particles = s.particles.filter(p => p.life > 0);

            // Draw
            ctx.fillStyle = '#86efac'; // green bg
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Draw target
            ctx.fillStyle = 'white';
            ctx.beginPath(); ctx.arc(CANVAS_WIDTH - 60, s.targetY, 80, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath(); ctx.arc(CANVAS_WIDTH - 60, s.targetY, 60, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'white';
            ctx.beginPath(); ctx.arc(CANVAS_WIDTH - 60, s.targetY, 40, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#eab308'; // gold bullseye
            ctx.beginPath(); ctx.arc(CANVAS_WIDTH - 60, s.targetY, 15, 0, Math.PI * 2); ctx.fill();

            // Draw arrow
            if (!s.isShooting) s.arrowY = s.targetY; // Follow target when not shooting

            ctx.fillStyle = '#475569';
            ctx.fillRect(s.arrowX, s.arrowY - 2, 60, 4);
            ctx.fillStyle = '#ef4444';
            ctx.beginPath(); ctx.moveTo(s.arrowX + 60, s.arrowY - 6); ctx.lineTo(s.arrowX + 75, s.arrowY); ctx.lineTo(s.arrowX + 60, s.arrowY + 6); ctx.fill();

            // Draw particles
            s.particles.forEach(p => {
                ctx.fillStyle = `rgba(234, 179, 8, ${p.life})`;
                ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
            });

            animationId = requestAnimationFrame(loop);
        };

        loop();
        return () => cancelAnimationFrame(animationId);
    }, []);

    return (
        <div className="max-w-3xl mx-auto flex flex-col items-center select-none" onPointerDown={shoot}>
            <div className="bg-white rounded-xl shadow-xl w-full text-center overflow-hidden border border-gray-200">
                <div className="bg-amber-600 p-4 text-white flex justify-between items-center">
                    <h2 className="text-2xl font-black italic">🏹 ARCHERY MASTER</h2>
                    <div className="flex gap-6 font-bold text-xl">
                        <div>Score: {score}</div>
                        <div>Arrows: {arrows}</div>
                    </div>
                </div>

                <div className="relative">
                    <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full cursor-crosshair block" />

                    <div className="absolute top-4 left-0 right-0 text-center pointer-events-none">
                        <span className="bg-black/50 text-white px-4 py-2 rounded-full font-bold shadow">{message || 'Click to Shoot!'}</span>
                    </div>

                    {arrows <= 0 && !state.current.isShooting && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm">
                            <h3 className="text-4xl font-black text-amber-400 mb-2">OUT OF ARROWS!</h3>
                            <p className="text-2xl text-white mb-6">Final Score: {score}</p>
                            <button onPointerDown={(e) => { e.stopPropagation(); restart(); }} className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-lg text-xl">PLAY AGAIN</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
