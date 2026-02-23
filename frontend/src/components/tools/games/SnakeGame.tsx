'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 25;
const INITIAL_SPEED = 150;

interface Position {
  x: number;
  y: number;
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const generateFood = useCallback(() => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection({ x: 1, y: 0 });
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling for game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          setIsPaused(!isPaused);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameOver, isPaused]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const gameInterval = setInterval(() => {
      setSnake((currentSnake) => {
        const newSnake = [...currentSnake];
        const head = { ...newSnake[0] };
        head.x += direction.x;
        head.y += direction.y;

        // Check wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
          return currentSnake;
        }

        // Check self collision
        if (newSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return currentSnake;
        }

        newSnake.unshift(head);

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          setScore((s) => {
            const newScore = s + 10;
            if (newScore > highScore) setHighScore(newScore);
            return newScore;
          });
          setFood(generateFood());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, Math.max(50, INITIAL_SPEED - score * 2));

    return () => clearInterval(gameInterval);
  }, [direction, food, gameOver, generateFood, highScore, isPaused, score]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#2a2a3e';
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#4ade80' : '#22c55e';
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });

    // Draw food
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, [snake, food]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4">
          <h3 className="text-2xl font-bold">🐍 Snake</h3>
          <p className="text-gray-200">Use arrow keys to move • Space to pause</p>
        </div>

        <div className="p-4">
          {/* Score Board */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl">
              <span className="text-green-400 font-bold">Score: {score}</span>
            </div>
            <div className="text-xl">
              <span className="text-yellow-400 font-bold">High Score: {highScore}</span>
            </div>
          </div>

          {/* Game Canvas */}
          <div className="relative flex justify-center">
            <canvas
              ref={canvasRef}
              width={GRID_SIZE * CELL_SIZE}
              height={GRID_SIZE * CELL_SIZE}
              className="border-4 border-gray-600 rounded-lg"
            />

            {gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl mb-2">💀</div>
                  <div className="text-2xl font-bold text-red-400 mb-4">Game Over!</div>
                  <div className="text-xl mb-4">Final Score: {score}</div>
                  <button
                    onClick={resetGame}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold"
                  >
                    🔄 Play Again
                  </button>
                </div>
              </div>
            )}

            {isPaused && !gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <div className="text-3xl font-bold">⏸️ Paused</div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-4 grid grid-cols-3 gap-2 max-w-xs mx-auto">
            <div></div>
            <button
              onClick={() => direction.y === 0 && setDirection({ x: 0, y: -1 })}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-2xl"
            >
              ⬆️
            </button>
            <div></div>
            <button
              onClick={() => direction.x === 0 && setDirection({ x: -1, y: 0 })}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-2xl"
            >
              ⬅️
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-xl font-bold"
            >
              ⏸️
            </button>
            <button
              onClick={() => direction.x === 0 && setDirection({ x: 1, y: 0 })}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-2xl"
            >
              ➡️
            </button>
            <div></div>
            <button
              onClick={() => direction.y === 0 && setDirection({ x: 0, y: 1 })}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-2xl"
            >
              ⬇️
            </button>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
