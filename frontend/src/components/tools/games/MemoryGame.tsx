'use client';

import React, { useState, useEffect } from 'react';

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);

  const initGame = () => {
    const shuffledEmojis = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, maxIterations) => ({
        id: maxIterations,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledEmojis);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (index: number) => {
    if (
      flippedIndices.length === 2 ||
      cards[index].isFlipped ||
      cards[index].isMatched
    ) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    setCards(prev => prev.map((c, i) => i === index ? { ...c, isFlipped: true } : c));

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstIdx, secondIdx] = newFlipped;

      if (cards[firstIdx].emoji === cards[secondIdx].emoji) {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === firstIdx || i === secondIdx ? { ...c, isMatched: true, isFlipped: true } : c
          ));
          setFlippedIndices([]);
          setMatches(m => m + 1);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === firstIdx || i === secondIdx ? { ...c, isFlipped: false } : c
          ));
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  const isWin = matches === EMOJIS.length;

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-8 bg-gradient-to-r from-pink-600 to-purple-600 p-4 rounded-lg">
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-white">🎯 Memory Match</h3>
        <div className="flex gap-6 font-bold">
          <div className="text-pink-200">Moves: <span className="text-white text-xl">{moves}</span></div>
          <div className="text-purple-200">Matches: <span className="text-white text-xl">{matches}/{EMOJIS.length}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(index)}
            className={`
              aspect-square rounded-xl text-5xl flex justify-center items-center
              transition-all duration-300 transform perspective-1000
              ${card.isFlipped || card.isMatched ? 'bg-indigo-600 rotate-y-180' : 'bg-gray-700 hover:bg-gray-600 hover:scale-105 cursor-pointer'}
              ${card.isMatched ? 'opacity-50' : 'opacity-100'}
            `}
            style={{ minHeight: '100px' }}
          >
            <span className={`transition-opacity duration-300 ${card.isFlipped || card.isMatched ? 'opacity-100' : 'opacity-0'}`}>
              {card.emoji}
            </span>
          </button>
        ))}
      </div>

      {isWin && (
        <div className="text-center p-6 bg-green-900/50 rounded-lg border border-green-500 mb-6 animate-pulse">
          <h2 className="text-3xl font-bold text-green-400 mb-2">🎉 You Won! 🎉</h2>
          <p className="text-lg">Completed in {moves} moves</p>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={initGame}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-lg shadow-lg hover:scale-105 transition"
        >
          {isWin ? 'Play Again' : 'Restart Game'}
        </button>
      </div>
    </div>
  );
}
