'use client';

import React, { useState, useEffect } from 'react';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = ['🎮', '🎯', '🎲', '🎸', '🎺', '🎻', '🎹', '🎬', '🎨', '🎭', '🎪', '🎟️'];

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  const getCardCount = () => {
    switch (difficulty) {
      case 'easy': return 8;
      case 'medium': return 12;
      case 'hard': return 16;
      default: return 8;
    }
  };

  const initializeGame = () => {
    const cardCount = getCardCount();
    const selectedEmojis = EMOJIS.slice(0, cardCount / 2);
    const gameCards: Card[] = [];

    selectedEmojis.forEach((emoji, index) => {
      gameCards.push(
        { id: index * 2, emoji, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, emoji, isFlipped: false, isMatched: false }
      );
    });

    // Shuffle
    for (let i = gameCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
    }

    setCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameWon(false);
  };

  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;
    if (cards.find(c => c.id === id)?.isMatched) return;
    if (flippedCards.includes(id)) return;

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, isFlipped: true } : card
    ));

    if (newFlippedCards.length === 2) {
      setMoves(m => m + 1);
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard?.emoji === secondCard?.emoji) {
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId
              ? { ...card, isMatched: true }
              : card
          ));
          setMatches(m => {
            const newMatches = m + 1;
            if (newMatches === getCardCount() / 2) {
              setGameWon(true);
            }
            return newMatches;
          });
          setFlippedCards([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
          <h3 className="text-2xl font-bold">🧠 Memory Game</h3>
          <p className="text-gray-200">Match the pairs!</p>
        </div>

        <div className="p-6">
          {/* Stats */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg">
              <span className="text-purple-400 font-bold">Moves: {moves}</span>
            </div>
            <div className="text-lg">
              <span className="text-pink-400 font-bold">Matches: {matches}/{getCardCount() / 2}</span>
            </div>
          </div>

          {/* Difficulty */}
          <div className="flex gap-2 mb-4 justify-center">
            {(['easy', 'medium', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  difficulty === diff
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Game Grid */}
          <div className={`grid gap-2 mb-4 mx-auto max-w-md ${
            difficulty === 'easy' ? 'grid-cols-4' : difficulty === 'medium' ? 'grid-cols-4' : 'grid-cols-4'
          }`}>
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`aspect-square rounded-lg text-3xl transition-all duration-300 ${
                  card.isFlipped || card.isMatched
                    ? 'bg-white rotate-0'
                    : 'bg-gradient-to-br from-purple-600 to-pink-600 rotate-180'
                } ${card.isMatched ? 'opacity-50' : ''}`}
                disabled={card.isMatched}
              >
                {(card.isFlipped || card.isMatched) ? card.emoji : '?'}
              </button>
            ))}
          </div>

          {/* Win Message */}
          {gameWon && (
            <div className="text-center p-4 bg-green-900/30 border border-green-600 rounded-lg">
              <div className="text-4xl mb-2">🎉</div>
              <div className="text-2xl font-bold text-green-400">You Won!</div>
              <div className="text-lg">Completed in {moves} moves</div>
            </div>
          )}

          {/* Reset Button */}
          <button
            onClick={initializeGame}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold"
          >
            🔄 New Game
          </button>
        </div>
      </div>
    </div>
  );
}
