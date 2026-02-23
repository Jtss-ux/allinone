'use client';

import React, { useState } from 'react';

const SUITS = ['♠', '♥', '♣', '♦'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

interface Card {
    suit: string;
    value: string;
    color: string;
    id: string;
}

export default function SolitaireGame() {
    const [deck, setDeck] = useState<Card[]>([]);
    const [drawn, setDrawn] = useState<Card[]>([]);

    const initGame = () => {
        const newDeck: Card[] = [];
        SUITS.forEach(suit => {
            VALUES.forEach(value => {
                newDeck.push({
                    suit,
                    value,
                    color: suit === '♥' || suit === '♦' ? 'text-red-600' : 'text-slate-900',
                    id: `${value}${suit}`
                });
            });
        });
        // Shuffle
        for (let i = newDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
        }
        setDeck(newDeck);
        setDrawn([]);
    };

    const drawCard = () => {
        if (deck.length > 0) {
            const card = deck[0];
            setDeck(prev => prev.slice(1));
            setDrawn(prev => [card, ...prev]);
        } else {
            // reshuffle drawn back to deck
            setDeck([...drawn].reverse());
            setDrawn([]);
        }
    };

    // Start game immediately
    React.useEffect(() => {
        initGame();
    }, []);

    const CardComponent = ({ card, hidden }: { card?: Card, hidden?: boolean }) => {
        if (hidden) {
            return (
                <div className="w-24 h-36 bg-blue-800 rounded-lg border-2 border-slate-300 shadow-md flex items-center justify-center cursor-pointer hover:-translate-y-1 transition transform bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-700 to-blue-900">
                    <div className="w-[80%] h-[80%] border-2 border-blue-400 border-dashed rounded opacity-50" />
                </div>
            );
        }

        if (!card) {
            return (
                <div className="w-24 h-36 rounded-lg border-2 border-slate-600/50 flex items-center justify-center" />
            );
        }

        return (
            <div className="w-24 h-36 bg-white rounded-lg border-2 border-slate-200 shadow-md flex flex-col justify-between p-2 cursor-pointer hover:-translate-y-1 transition transform">
                <div className={`text-lg font-bold ${card.color}`}>{card.value}{card.suit}</div>
                <div className={`text-4xl self-center ${card.color}`}>{card.suit}</div>
                <div className={`text-lg font-bold self-end rotate-180 ${card.color}`}>{card.value}{card.suit}</div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto rounded-xl p-6 bg-[#0f5132] shadow-2xl relative min-h-[600px] border-8 border-slate-800">
            <div className="flex justify-between items-center mb-8 border-b border-[#146c43] pb-4">
                <h2 className="text-3xl font-black text-emerald-100 flex items-center gap-2">
                    🃏 Solitaire <span className="text-sm font-normal text-emerald-300 ml-2">(Draw Mode Demo)</span>
                </h2>
                <div className="flex gap-4">
                    <button onClick={initGame} className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 rounded text-white font-bold">New Deal</button>
                </div>
            </div>

            <div className="flex justify-between">
                {/* Deck & Drawn pile */}
                <div className="flex gap-4">
                    <div onClick={drawCard}>
                        <CardComponent hidden={deck.length > 0} />
                    </div>
                    <div>
                        <CardComponent card={drawn[0]} />
                    </div>
                </div>

                {/* Foundation placeholders */}
                <div className="flex gap-4">
                    <CardComponent />
                    <CardComponent />
                    <CardComponent />
                    <CardComponent />
                </div>
            </div>

            {/* Tableau placeholders */}
            <div className="flex justify-between mt-12 px-2">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="relative">
                        <CardComponent />
                        {/* Mock stacked cards */}
                        {i > 0 && Array(i).fill(0).map((_, j) => (
                            <div key={j} className="absolute left-0" style={{ top: `${(j + 1) * 20}px` }}>
                                <CardComponent hidden={j !== i - 1} card={drawn[j] || { suit: '♠', value: 'A', color: '', id: 'a' }} />
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="absolute bottom-4 left-0 w-full text-center text-emerald-800 font-medium">
                (Basic layout demo. Full drag-and-drop Klondike logic is in progress!)
            </div>
        </div>
    );
}
