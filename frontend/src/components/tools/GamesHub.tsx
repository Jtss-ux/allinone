'use client';

import React, { useState } from 'react';
import SnakeGame from './games/SnakeGame';
import TetrisGame from './games/TetrisGame';
import ChessGame from './games/ChessGame';
import Game2048 from './games/Game2048';
import MemoryGame from './games/MemoryGame';
import PingPongGame from './games/PingPongGame';
import FlappyBirdGame from './games/FlappyBirdGame';
import RacingGame from './games/RacingGame';
import ArcheryGame from './games/ArcheryGame';
import RPGGame from './games/RPGGame';
import SolitaireGame from './games/SolitaireGame';

// Placeholders for new games
const Placeholder = ({ name, onBack }: { name: string, onBack: () => void }) => (
  <div className="max-w-2xl mx-auto text-center p-12 bg-gray-800 rounded-lg">
    <h2 className="text-3xl font-bold text-white mb-4">{name}</h2>
    <p className="text-gray-400 mb-8">This game is currently under construction. Check back soon!</p>
    <button onClick={onBack} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold">
      ← Back to Games
    </button>
  </div>
);

export default function GamesHub() {
  const [activeGame, setActiveGame] = useState<string>('menu');

  const games = [
    { id: 'snake', name: 'Snake', icon: '🐍', description: 'Classic snake game - eat food and grow!' },
    { id: 'tetris', name: 'Tetris', icon: '🧱', description: 'Stack blocks and clear lines' },
    { id: 'chess', name: 'Chess', icon: '♟️', description: 'Classic strategy game' },
    { id: 'memory', name: 'Memory', icon: '🎯', description: 'Find the matching pairs' },
    { id: 'solitaire', name: 'Solitaire', icon: '🃏', description: 'Classic card game' },
    { id: '2048', name: '2048', icon: '🎲', description: 'Join the numbers to get to 2048' },
    { id: 'pingpong', name: 'Ping Pong', icon: '🏓', description: 'Table tennis classic' },
    { id: 'flappy', name: 'Flappy Bird', icon: '🎪', description: 'Dodge the pipes' },
    { id: 'racing', name: 'Racing', icon: '🏎️', description: 'High speed car racing' },
    { id: 'archery', name: 'Archery', icon: '🏹', description: 'Hit the bullseye' },
    { id: 'rpg', name: 'RPG', icon: '⚔️', description: 'Adventure role-playing game' },
  ];

  const renderGame = () => {
    switch (activeGame) {
      case 'snake': return <SnakeGame />;
      case 'tetris': return <TetrisGame />;
      case 'chess': return <ChessGame />;
      case '2048': return <Game2048 />;
      case 'memory': return <MemoryGame />;
      case 'pingpong': return <PingPongGame />;
      case 'flappy': return <FlappyBirdGame />;
      case 'racing': return <RacingGame />;
      case 'archery': return <ArcheryGame />;
      case 'rpg': return <RPGGame />;
      case 'solitaire': return <SolitaireGame />;
      default: return <Placeholder name={games.find(g => g.id === activeGame)?.name || 'Game'} onBack={() => setActiveGame('menu')} />;
    }
  };

  if (activeGame !== 'menu') {
    return (
      <div>
        {activeGame !== 'menu' ? (
          <button onClick={() => setActiveGame('menu')} className="mb-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg border border-gray-500 shadow-md">
            ← Back to Games Menu
          </button>
        ) : null}
        {renderGame()}
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => setActiveGame(game.id)}
                className="p-6 bg-gray-700 hover:bg-gray-600 rounded-xl text-center transition transform hover:scale-105 flex flex-col items-center justify-center h-full"
              >
                <div className="text-5xl mb-3">{game.icon}</div>
                <h4 className="text-lg font-bold mb-1">{game.name}</h4>
                <p className="text-xs text-gray-400 line-clamp-2">{game.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
