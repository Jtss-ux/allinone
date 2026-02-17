'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 25;

// Tetromino shapes
const TETROMINOS = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
};

const COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000',
};

type TetrominoType = keyof typeof TETROMINOS;

interface Piece {
  type: TetrominoType;
  x: number;
  y: number;
  shape: number[][];
}

export default function TetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [board, setBoard] = useState<(string | null)[][]>(
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lines, setLines] = useState(0);

  const createPiece = useCallback((): Piece => {
    const types = Object.keys(TETROMINOS) as TetrominoType[];
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      type,
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0,
      shape: TETROMINOS[type],
    };
  }, []);

  const resetGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
    setCurrentPiece(createPiece());
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
  };

  const rotatePiece = (piece: Piece): Piece => {
    const rotated = piece.shape[0].map((_, i) =>
      piece.shape.map((row) => row[i]).reverse()
    );
    return { ...piece, shape: rotated };
  };

  const isValidMove = (piece: Piece, newX: number, newY: number, newShape?: number[][]): boolean => {
    const shape = newShape || piece.shape;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = newX + x;
          const boardY = newY + y;
          if (
            boardX < 0 ||
            boardX >= BOARD_WIDTH ||
            boardY >= BOARD_HEIGHT ||
            (boardY >= 0 && board[boardY][boardX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const lockPiece = (piece: Piece) => {
    const newBoard = board.map((row) => [...row]);
    piece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell && piece.y + y >= 0) {
          newBoard[piece.y + y][piece.x + x] = COLORS[piece.type];
        }
      });
    });

    // Check for completed lines
    let linesCleared = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every((cell) => cell !== null)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(null));
        linesCleared++;
        y++;
      }
    }

    if (linesCleared > 0) {
      setLines((l) => l + linesCleared);
      setScore((s) => s + linesCleared * 100 * level);
      setLevel(Math.floor(lines / 10) + 1);
    }

    setBoard(newBoard);
    const newPiece = createPiece();
    if (!isValidMove(newPiece, newPiece.x, newPiece.y)) {
      setGameOver(true);
    } else {
      setCurrentPiece(newPiece);
    }
  };

  const movePiece = (dx: number, dy: number) => {
    if (!currentPiece || gameOver || isPaused) return;
    if (isValidMove(currentPiece, currentPiece.x + dx, currentPiece.y + dy)) {
      setCurrentPiece({ ...currentPiece, x: currentPiece.x + dx, y: currentPiece.y + dy });
    } else if (dy > 0) {
      lockPiece(currentPiece);
    }
  };

  const rotate = () => {
    if (!currentPiece || gameOver || isPaused) return;
    const rotated = rotatePiece(currentPiece);
    if (isValidMove(currentPiece, currentPiece.x, currentPiece.y, rotated.shape)) {
      setCurrentPiece(rotated);
    }
  };

  const hardDrop = () => {
    if (!currentPiece || gameOver || isPaused) return;
    let dropY = currentPiece.y;
    while (isValidMove(currentPiece, currentPiece.x, dropY + 1)) {
      dropY++;
    }
    setCurrentPiece({ ...currentPiece, y: dropY });
    lockPiece({ ...currentPiece, y: dropY });
  };

  useEffect(() => {
    if (!currentPiece && !gameOver) {
      setCurrentPiece(createPiece());
    }
  }, [createPiece, currentPiece, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      switch (e.key) {
        case 'ArrowLeft':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          movePiece(0, 1);
          setScore((s) => s + 1);
          break;
        case 'ArrowUp':
          rotate();
          break;
        case ' ':
          hardDrop();
          break;
        case 'p':
        case 'P':
          setIsPaused(!isPaused);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPiece, gameOver, isPaused]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const dropInterval = setInterval(() => {
      movePiece(0, 1);
    }, Math.max(100, 1000 - (level - 1) * 100));

    return () => clearInterval(dropInterval);
  }, [currentPiece, gameOver, isPaused, level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw board
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          ctx.fillStyle = cell;
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
        }
      });
    });

    // Draw current piece
    if (currentPiece) {
      ctx.fillStyle = COLORS[currentPiece.type];
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell && currentPiece.y + y >= 0) {
            ctx.fillRect(
              (currentPiece.x + x) * CELL_SIZE,
              (currentPiece.y + y) * CELL_SIZE,
              CELL_SIZE - 1,
              CELL_SIZE - 1
            );
          }
        });
      });
    }

    // Draw grid
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= BOARD_WIDTH; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }
    for (let i = 0; i <= BOARD_HEIGHT; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(BOARD_WIDTH * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }
  }, [board, currentPiece]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
          <h3 className="text-2xl font-bold">🧱 Tetris</h3>
          <p className="text-gray-200">Stack blocks and clear lines!</p>
        </div>

        <div className="p-4">
          {/* Stats */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl">
              <span className="text-blue-400 font-bold">Score: {score}</span>
            </div>
            <div className="text-xl">
              <span className="text-purple-400 font-bold">Level: {level}</span>
            </div>
            <div className="text-xl">
              <span className="text-green-400 font-bold">Lines: {lines}</span>
            </div>
          </div>

          {/* Game Canvas */}
          <div className="relative flex justify-center">
            <canvas
              ref={canvasRef}
              width={BOARD_WIDTH * CELL_SIZE}
              height={BOARD_HEIGHT * CELL_SIZE}
              className="border-4 border-gray-600 rounded-lg"
            />
            
            {(gameOver || isPaused) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg">
                <div className="text-center">
                  {gameOver ? (
                    <>
                      <div className="text-4xl mb-2">💀</div>
                      <div className="text-2xl font-bold text-red-400 mb-4">Game Over!</div>
                      <div className="text-xl mb-4">Final Score: {score}</div>
                      <button
                        onClick={resetGame}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
                      >
                        🔄 Play Again
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl mb-2">⏸️</div>
                      <div className="text-2xl font-bold">Paused</div>
                      <div className="text-sm text-gray-400 mt-2">Press P to resume</div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-4 text-center text-sm text-gray-400">
            <p>← → Move • ↓ Soft Drop • ↑ Rotate • Space Hard Drop • P Pause</p>
          </div>
        </div>
      </div>
    </div>
  );
}
