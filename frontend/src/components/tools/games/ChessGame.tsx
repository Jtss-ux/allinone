'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Chess, Square } from 'chess.js';

const PIECE_SYMBOLS: Record<string, Record<string, string>> = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};

export default function ChessGame() {
  const [chess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [gameMode, setGameMode] = useState<'pvp' | 'bot'>('bot');
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [gameOver, setGameOver] = useState(false);
  const [statusText, setStatusText] = useState('White to move');

  const updateGameStatus = useCallback(() => {
    setBoard(chess.board());

    let status = '';
    let moveColor = chess.turn() === 'w' ? 'White' : 'Black';

    if (chess.isCheckmate()) {
      status = `Game over, ${moveColor} is in checkmate.`;
      setGameOver(true);
    } else if (chess.isDraw()) {
      status = 'Game over, drawn position';
      setGameOver(true);
    } else {
      status = `${moveColor} to move`;
      if (chess.isCheck()) {
        status += ', ' + moveColor + ' is in check';
      }
    }
    setStatusText(status);
  }, [chess]);

  // Bot move logic (1-ply material evaluation)
  const makeBotMove = useCallback(() => {
    if (gameOver || gameMode !== 'bot') return;
    const botColor = playerColor === 'w' ? 'b' : 'w';
    if (chess.turn() !== botColor) return;

    const possibleMoves = chess.moves({ verbose: true });
    if (possibleMoves.length === 0) return;

    let bestMove = possibleMoves[0];
    let bestScore = -Infinity;

    for (const move of possibleMoves) {
      chess.move(move.san);

      let score = 0;
      if (chess.isCheckmate()) {
        score = 10000;
      } else if (chess.isDraw()) {
        score = -100;
      } else {
        const currentBoard = chess.board();
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const piece = currentBoard[r][c];
            if (piece) {
              const value = piece.type === 'p' ? 1 : piece.type === 'n' ? 3 : piece.type === 'b' ? 3 : piece.type === 'r' ? 5 : piece.type === 'q' ? 9 : 0;
              if (piece.color === botColor) {
                score += value;
              } else {
                score -= value;
              }
            }
          }
        }
      }

      chess.undo();
      score += Math.random() * 0.1; // small random tiebreaker

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    setTimeout(() => {
      chess.move(bestMove.san);
      updateGameStatus();
    }, 500);
  }, [chess, gameMode, gameOver, playerColor, updateGameStatus]);

  useEffect(() => {
    if (gameMode === 'bot' && chess.turn() !== playerColor && !gameOver) {
      makeBotMove();
    }
  }, [chess.turn(), gameMode, playerColor, gameOver, makeBotMove]);

  const getSquareInfo = (row: number, col: number): Square => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return `${files[col]}${8 - row}` as Square;
  };

  const handleSquareClick = (row: number, col: number) => {
    if (gameOver) return;

    // In bot mode, only allow the player to move
    if (gameMode === 'bot' && chess.turn() !== playerColor) return;

    const square = getSquareInfo(row, col);

    if (selectedSquare) {
      const moves = chess.moves({ square: selectedSquare, verbose: true });
      const move = moves.find(m => m.to === square);

      if (move) {
        // Move piece
        chess.move(move.san);
        setSelectedSquare(null);
        setValidMoves([]);
        updateGameStatus();
      } else {
        // Did they click another of their own pieces?
        const piece = chess.get(square);
        if (piece && piece.color === chess.turn()) {
          setSelectedSquare(square);
          setValidMoves(chess.moves({ square, verbose: true }).map(m => m.to));
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
        }
      }
    } else {
      const piece = chess.get(square);
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
        setValidMoves(chess.moves({ square, verbose: true }).map(m => m.to));
      }
    }
  };

  const resetGame = () => {
    chess.reset();
    setSelectedSquare(null);
    setValidMoves([]);
    setGameOver(false);
    updateGameStatus();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden flex flex-col items-center p-6">

        <div className="w-full flex justify-between items-center mb-6">
          <h3 className="text-3xl font-bold text-amber-500">♟️ Chess Master</h3>

          <div className="flex gap-2">
            <button
              onClick={() => { setGameMode('pvp'); resetGame(); }}
              className={`px-4 py-2 rounded-lg font-bold transition ${gameMode === 'pvp' ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              👥 PvP Mode
            </button>
            <button
              onClick={() => { setGameMode('bot'); resetGame(); }}
              className={`px-4 py-2 rounded-lg font-bold transition ${gameMode === 'bot' ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              🤖 vs Bot
            </button>
          </div>
        </div>

        <div className="mb-4 text-center">
          <div className="text-xl font-bold text-white bg-gray-900 px-6 py-2 rounded-lg border border-gray-700">
            {statusText}
          </div>
        </div>

        {/* Board */}
        <div className="inline-block border-4 border-amber-900 rounded shadow-2xl overflow-hidden bg-amber-100">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((piece, colIndex) => {
                const square = getSquareInfo(rowIndex, colIndex);
                const isLight = (rowIndex + colIndex) % 2 === 0;
                const isSelected = selectedSquare === square;
                const isValidMove = validMoves.includes(square);

                return (
                  <button
                    key={colIndex}
                    onClick={() => handleSquareClick(rowIndex, colIndex)}
                    className={`
                      w-14 h-14 flex items-center justify-center text-4xl
                      transition-all duration-75 relative
                      ${isLight ? 'bg-amber-200' : 'bg-amber-800'}
                      ${isSelected ? 'bg-yellow-400' : ''}
                      ${isValidMove && piece ? 'bg-red-400' : ''}
                      hover:brightness-110
                    `}
                  >
                    {piece && (
                      <span className={`${piece.color === 'w' ? 'text-white' : 'text-gray-900'} drop-shadow-md relative z-10`}>
                        {PIECE_SYMBOLS[piece.color][piece.type]}
                      </span>
                    )}
                    {isValidMove && !piece && (
                      <span className="absolute w-4 h-4 rounded-full bg-black/20 z-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          <button onClick={resetGame} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white font-medium transition">
            🔄 Restart Game
          </button>
          {gameMode === 'bot' && (
            <button
              onClick={() => {
                setPlayerColor(prev => prev === 'w' ? 'b' : 'w');
                resetGame();
              }}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white font-medium transition"
            >
              Swap Sides (Play as {playerColor === 'w' ? 'Black' : 'White'})
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
