'use client';

import React, { useState } from 'react';

const ENEMIES = [
    { name: 'Slime', hp: 50, maxHp: 50, attack: 5, emoji: '🟢', xp: 20 },
    { name: 'Goblin', hp: 80, maxHp: 80, attack: 10, emoji: '👺', xp: 40 },
    { name: 'Skeleton', hp: 120, maxHp: 120, attack: 15, emoji: '💀', xp: 80 },
    { name: 'Dragon', hp: 300, maxHp: 300, attack: 30, emoji: '🐉', xp: 500 },
];

export default function RPGGame() {
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);
    const [hp, setHp] = useState(100);
    const [maxHp, setMaxHp] = useState(100);
    const [potions, setPotions] = useState(3);

    const [enemyIdx, setEnemyIdx] = useState(0);
    const [enemy, setEnemy] = useState({ ...ENEMIES[0] });
    const [log, setLog] = useState<string[]>(['A wild Slime appeared!']);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isVictory, setIsVictory] = useState(false);

    const addLog = (msg: string) => setLog(prev => [msg, ...prev].slice(0, 5));

    const attack = () => {
        if (isGameOver || isVictory) return;

        // Player attacks
        const damage = Math.floor(Math.random() * 10) + 10 + (level * 5);
        let newEnemyHp = enemy.hp - damage;
        addLog(`You dealt ${damage} damage to ${enemy.name}!`);

        if (newEnemyHp <= 0) {
            addLog(`You defeated the ${enemy.name}! Gained ${enemy.xp} XP.`);
            let currentXp = xp + enemy.xp;

            // Level up
            if (currentXp >= level * 100) {
                currentXp -= level * 100;
                setLevel(l => l + 1);
                setMaxHp(m => m + 20);
                setHp(m => m + 20);
                addLog(`LEVEL UP! You are now level ${level + 1}!`);
            }
            setXp(currentXp);

            // Next enemy
            if (enemyIdx + 1 < ENEMIES.length) {
                setEnemyIdx(i => i + 1);
                setEnemy({ ...ENEMIES[enemyIdx + 1] });
                addLog(`A wild ${ENEMIES[enemyIdx + 1].name} appears!`);
                // Reward
                if (Math.random() > 0.5) {
                    setPotions(p => p + 1);
                    addLog(`Found a potion!`);
                }
            } else {
                setIsVictory(true);
                addLog(`YOU DEFEATED THE DRAGON! YOU WIN!`);
            }
        } else {
            setEnemy({ ...enemy, hp: newEnemyHp });

            // Enemy counter attacks
            setTimeout(() => {
                const enemyDmg = Math.floor(Math.random() * enemy.attack) + Math.floor(enemy.attack / 2);
                setHp(prev => {
                    const newHp = prev - enemyDmg;
                    addLog(`${enemy.name} attacked for ${enemyDmg} damage!`);
                    if (newHp <= 0) {
                        setIsGameOver(true);
                        addLog('YOU DIED.');
                        return 0;
                    }
                    return newHp;
                });
            }, 500);
        }
    };

    const heal = () => {
        if (potions <= 0 || hp === maxHp || isGameOver || isVictory) return;
        setPotions(p => p - 1);
        setHp(prev => Math.min(maxHp, prev + 50));
        addLog('You drank a potion. Recovered 50 HP!');
    };

    return (
        <div className="max-w-2xl mx-auto bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700 font-mono">
            <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center px-8">
                <div>
                    <h2 className="text-2xl font-bold text-amber-500">🗡️ Hero</h2>
                    <div className="text-slate-300">Level {level}</div>
                    <div className="text-slate-400 text-sm">XP: {xp} / {level * 100}</div>
                </div>
                <div className="text-right">
                    <div className="text-red-400 font-bold text-xl">HP: {hp} / {maxHp}</div>
                    <div className="text-emerald-400">Potions: {potions}</div>
                </div>
            </div>

            <div className="p-12 text-center bg-slate-800/50 min-h-[250px] flex flex-col items-center justify-center relative">
                {isGameOver ? (
                    <div className="text-red-500 text-5xl font-black">GAME OVER</div>
                ) : isVictory ? (
                    <div className="text-yellow-400 text-5xl font-black">VICTORY!</div>
                ) : (
                    <div className="animate-bounce">
                        <div className="text-8xl drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{enemy.emoji}</div>
                        <div className="mt-4 text-2xl font-bold text-white">{enemy.name}</div>
                        <div className="w-48 h-4 bg-slate-700 rounded-full mx-auto mt-2 overflow-hidden border border-slate-600">
                            <div
                                className="h-full bg-red-500 transition-all duration-300"
                                style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                            />
                        </div>
                        <div className="text-sm text-slate-400 mt-1">{enemy.hp} / {enemy.maxHp} HP</div>
                    </div>
                )}
            </div>

            <div className="bg-slate-950 p-4 border-t border-slate-700">
                <div className="text-slate-400 text-sm mb-4 h-24 overflow-y-auto space-y-1 p-2 bg-slate-900 rounded border border-slate-800 font-sans">
                    {log.map((msg, i) => (
                        <div key={i} className={i === 0 ? 'text-white' : 'opacity-70'}>{msg}</div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={attack}
                        disabled={isGameOver || isVictory}
                        className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white py-4 rounded-lg font-bold text-xl uppercase tracking-widest transition"
                    >
                        Attack
                    </button>
                    <button
                        onClick={heal}
                        disabled={potions <= 0 || hp === maxHp || isGameOver || isVictory}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-4 rounded-lg font-bold text-xl uppercase tracking-widest transition"
                    >
                        Heal ({potions})
                    </button>
                </div>
            </div>
        </div>
    );
}
