'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, RotateCcw, Undo } from 'lucide-react';

const GRID_SIZE = 4;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;

export default function Game2048() {
  const [board, setBoard] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [previousBoard, setPreviousBoard] = useState<number[] | null>(null);
  const [previousScore, setPreviousScore] = useState<number>(0);

  // Initialize game
  const initializeBoard = useCallback(() => {
    const newBoard = Array(CELL_COUNT).fill(0);
    const boardWithTiles = addRandomTile(addRandomTile(newBoard));
    setBoard(boardWithTiles);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setPreviousBoard(null);
    setPreviousScore(0);
  }, []);

  // Add random tile
  const addRandomTile = (currentBoard: number[]): number[] => {
    const emptyCells = currentBoard.map((cell, index) => cell === 0 ? index : -1).filter(i => i !== -1);
    if (emptyCells.length === 0) return currentBoard;
    
    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = [...currentBoard];
    newBoard[randomIndex] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  };

  // Check for moves
  const hasMoves = (currentBoard: number[]): boolean => {
    // Check for empty cells
    if (currentBoard.some(cell => cell === 0)) return true;
    
    // Check for horizontal merges
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 1; col++) {
        if (currentBoard[row * GRID_SIZE + col] === currentBoard[row * GRID_SIZE + col + 1]) {
          return true;
        }
      }
    }
    
    // Check for vertical merges
    for (let row = 0; row < GRID_SIZE - 1; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (currentBoard[row * GRID_SIZE + col] === currentBoard[(row + 1) * GRID_SIZE + col]) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Slide and merge
  const slideRow = (row: number[]): { newRow: number[], score: number } => {
    let newRow = row.filter(val => val !== 0);
    let score = 0;
    
    for (let i = 0; i < newRow.length - 1; i++) {
      if (newRow[i] === newRow[i + 1]) {
        newRow[i] *= 2;
        score += newRow[i];
        if (newRow[i] === 2048) setWon(true);
        newRow.splice(i + 1, 1);
      }
    }
    
    while (newRow.length < GRID_SIZE) {
      newRow.push(0);
    }
    
    return { newRow, score };
  };

  // Move functions
  const moveLeft = (currentBoard: number[]): { newBoard: number[], score: number } => {
    let newBoard = [...currentBoard];
    let totalScore = 0;
    
    for (let row = 0; row < GRID_SIZE; row++) {
      const rowStart = row * GRID_SIZE;
      const rowData = currentBoard.slice(rowStart, rowStart + GRID_SIZE);
      const { newRow, score } = slideRow(rowData);
      totalScore += score;
      
      for (let col = 0; col < GRID_SIZE; col++) {
        newBoard[rowStart + col] = newRow[col];
      }
    }
    
    return { newBoard, score: totalScore };
  };

  const moveRight = (currentBoard: number[]): { newBoard: number[], score: number } => {
    let newBoard = [...currentBoard];
    let totalScore = 0;
    
    for (let row = 0; row < GRID_SIZE; row++) {
      const rowStart = row * GRID_SIZE;
      const rowData = currentBoard.slice(rowStart, rowStart + GRID_SIZE).reverse();
      const { newRow, score } = slideRow(rowData);
      totalScore += score;
      
      for (let col = 0; col < GRID_SIZE; col++) {
        newBoard[rowStart + col] = newRow[GRID_SIZE - 1 - col];
      }
    }
    
    return { newBoard, score: totalScore };
  };

  const moveUp = (currentBoard: number[]): { newBoard: number[], score: number } => {
    let newBoard = [...currentBoard];
    let totalScore = 0;
    
    for (let col = 0; col < GRID_SIZE; col++) {
      const colData: number[] = [];
      for (let row = 0; row < GRID_SIZE; row++) {
        colData.push(currentBoard[row * GRID_SIZE + col]);
      }
      
      const { newRow, score } = slideRow(colData);
      totalScore += score;
      
      for (let row = 0; row < GRID_SIZE; row++) {
        newBoard[row * GRID_SIZE + col] = newRow[row];
      }
    }
    
    return { newBoard, score: totalScore };
  };

  const moveDown = (currentBoard: number[]): { newBoard: number[], score: number } => {
    let newBoard = [...currentBoard];
    let totalScore = 0;
    
    for (let col = 0; col < GRID_SIZE; col++) {
      const colData: number[] = [];
      for (let row = 0; row < GRID_SIZE; row++) {
        colData.push(currentBoard[row * GRID_SIZE + col]);
      }
      
      const { newRow, score } = slideRow(colData.reverse());
      totalScore += score;
      
      for (let row = 0; row < GRID_SIZE; row++) {
        newBoard[row * GRID_SIZE + col] = newRow[GRID_SIZE - 1 - row];
      }
    }
    
    return { newBoard, score: totalScore };
  };

  // Handle move
  const handleMove = useCallback((direction: string) => {
    if (gameOver || board.length === 0) return;
    
    setPreviousBoard([...board]);
    setPreviousScore(score);
    
    let result: { newBoard: number[], score: number };
    
    switch (direction) {
      case 'ArrowLeft':
        result = moveLeft(board);
        break;
      case 'ArrowRight':
        result = moveRight(board);
        break;
      case 'ArrowUp':
        result = moveUp(board);
        break;
      case 'ArrowDown':
        result = moveDown(board);
        break;
      default:
        return;
    }
    
    if (JSON.stringify(result.newBoard) !== JSON.stringify(board)) {
      const newBoardWithTile = addRandomTile(result.newBoard);
      setBoard(newBoardWithTile);
      const newScore = score + result.score;
      setScore(newScore);
      
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('2048-best-score', newScore.toString());
      }
      
      if (!hasMoves(newBoardWithTile)) {
        setGameOver(true);
      }
    }
  }, [board, gameOver, score, bestScore]);

  // Undo move
  const handleUndo = () => {
    if (previousBoard) {
      setBoard(previousBoard);
      setScore(previousScore);
      setPreviousBoard(null);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        handleMove(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  // Load best score
  useEffect(() => {
    const saved = localStorage.getItem('2048-best-score');
    if (saved) {
      setBestScore(parseInt(saved));
    }
    initializeBoard();
  }, [initializeBoard]);

  // Get cell color
  const getCellColor = (value: number): string => {
    const colors: Record<number, string> = {
      0: 'bg-gray-800/50',
      2: 'bg-gray-200 text-gray-900',
      4: 'bg-gray-300 text-gray-900',
      8: 'bg-orange-200 text-gray-900',
      16: 'bg-orange-300 text-gray-900',
      32: 'bg-orange-400 text-white',
      64: 'bg-orange-500 text-white',
      128: 'bg-yellow-200 text-gray-900',
      256: 'bg-yellow-300 text-gray-900',
      512: 'bg-yellow-400 text-gray-900',
      1024: 'bg-yellow-500 text-white',
      2048: 'bg-green-500 text-white',
    };
    return colors[value] || 'bg-green-600 text-white';
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-white">2048</h1>
          <p className="text-gray-400 text-sm">Join the numbers, get to 2048!</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-gray-800 rounded-lg px-4 py-2 text-center">
            <div className="text-xs text-gray-400 uppercase">Score</div>
            <div className="text-xl font-bold text-white">{score}</div>
          </div>
          <div className="bg-gray-800 rounded-lg px-4 py-2 text-center">
            <div className="text-xs text-gray-400 uppercase">Best</div>
            <div className="text-xl font-bold text-yellow-500">{bestScore}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleUndo}
          disabled={!previousBoard}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition"
        >
          <Undo className="w-4 h-4" />
          Undo
        </button>
        <button
          onClick={initializeBoard}
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
        >
          <RotateCcw className="w-4 h-4" />
          New Game
        </button>
      </div>

      {/* Game Board */}
      <div className="bg-gray-800 p-4 rounded-xl shadow-2xl">
        <div className="grid grid-cols-4 gap-3">
          {board.map((cell, index) => (
            <div
              key={index}
              className={`aspect-square flex items-center justify-center rounded-lg text-2xl font-bold transition-all duration-150 ${
                getCellColor(cell)
              } ${cell > 0 ? 'scale-100' : 'scale-95'}`}
            >
              {cell !== 0 && cell}
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center text-gray-400 text-sm">
        <p>Use arrow keys to move tiles</p>
      </div>

      {/* Game Over Modal */}
      {(gameOver || won) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-2xl text-center max-w-md mx-4">
            {won && !gameOver && (
              <>
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">You Won!</h2>
                <p className="text-gray-400 mb-6">You reached 2048! Keep playing to get a higher score.</p>
                <button
                  onClick={() => setWon(false)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition"
                >
                  Continue Playing
                </button>
              </>
            )}
            {gameOver && (
              <>
                <div className="text-6xl mb-4">🎮</div>
                <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
                <p className="text-gray-400 mb-2">No more moves available.</p>
                <p className="text-xl font-bold text-green-500 mb-6">Final Score: {score}</p>
                <button
                  onClick={initializeBoard}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
