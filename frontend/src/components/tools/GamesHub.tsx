'use client';

import React, { useState } from 'react';
import SnakeGame from './games/SnakeGame';
import TetrisGame from './games/TetrisGame';
import ChessGame from './games/ChessGame';

export default function GamesHub() {
  const [activeGame, setActiveGame] = useState<'menu' | 'snake' | 'tetris' | 'chess'>('menu');

  const games = [
    { id: 'snake', name: 'Snake', icon: '🐍', description: 'Classic snake game - eat food and grow!' },
    { id: 'tetris', name: 'Tetris', icon: '🧱', description: 'Stack blocks and clear lines' },
    { id: 'chess', name: 'Chess', icon: '♟️', description: 'Classic strategy game' },
  ];

  if (activeGame === 'snake') {
    return (
      <div>
        <button
          onClick={() => setActiveGame('menu')}
          className="mb-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
        >
          ← Back to Games
        </button>
        <SnakeGame />
      </div>
    );
  }

  if (activeGame === 'tetris') {
    return (
      <div>
        <button
          onClick={() => setActiveGame('menu')}
          className="mb-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
        >
          ← Back to Games
        </button>
        <TetrisGame />
      </div>
    );
  }

  if (activeGame === 'chess') {
    return (
      <div>
        <button
          onClick={() => setActiveGame('menu')}
          className="mb-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
        >
          ← Back to Games
        </button>
        <ChessGame />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4">
          <h3 className="text-2xl font-bold">🎮 Games Hub</h3>
          <p className="text-gray-200">Play classic games right in your browser</p>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => setActiveGame(game.id as any)}
                className="p-6 bg-gray-700 hover:bg-gray-600 rounded-xl text-center transition transform hover:scale-105"
              >
                <div className="text-5xl mb-3">{game.icon}</div>
                <h4 className="text-xl font-bold mb-2">{game.name}</h4>
                <p className="text-sm text-gray-400">{game.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-gray-700 rounded-lg">
            <h4 className="font-semibold mb-2">🎯 More Games Coming Soon:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-400">
              <div className="p-2 bg-gray-800 rounded">🎯 Memory Game</div>
              <div className="p-2 bg-gray-800 rounded">🃏 Solitaire</div>
              <div className="p-2 bg-gray-800 rounded">🎲 2048</div>
              <div className="p-2 bg-gray-800 rounded">🏓 Ping Pong</div>
              <div className="p-2 bg-gray-800 rounded">🎪 Flappy Bird</div>
              <div className="p-2 bg-gray-800 rounded">🏎️ Racing</div>
              <div className="p-2 bg-gray-800 rounded">🏹 Archery</div>
              <div className="p-2 bg-gray-800 rounded">⚔️ RPG</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
