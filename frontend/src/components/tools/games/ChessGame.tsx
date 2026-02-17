'use client';

import React, { useState, useEffect } from 'react';

type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
type PieceColor = 'white' | 'black';

interface Piece {
  type: PieceType;
  color: PieceColor;
}

interface Position {
  row: number;
  col: number;
}

const INITIAL_BOARD: (Piece | null)[][] = [
  [
    { type: 'rook', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'rook', color: 'black' },
  ],
  Array(8).fill(null).map(() => ({ type: 'pawn', color: 'black' })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'pawn', color: 'white' })),
  [
    { type: 'rook', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'rook', color: 'white' },
  ],
];

const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙',
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟',
  },
};

export default function ChessGame() {
  const [board, setBoard] = useState<(Piece | null)[][]>(
    INITIAL_BOARD.map((row) => [...row])
  );
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('white');
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [capturedPieces, setCapturedPieces] = useState<{ white: Piece[]; black: Piece[] }>({
    white: [],
    black: [],
  });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<PieceColor | null>(null);

  const isValidPosition = (row: number, col: number) => {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  };

  const getValidMoves = (piece: Piece, row: number, col: number): Position[] => {
    const moves: Position[] = [];
    const direction = piece.color === 'white' ? -1 : 1;

    switch (piece.type) {
      case 'pawn':
        // Forward move
        if (isValidPosition(row + direction, col) && !board[row + direction][col]) {
          moves.push({ row: row + direction, col });
          // Initial two-square move
          if (
            ((piece.color === 'white' && row === 6) || (piece.color === 'black' && row === 1)) &&
            !board[row + direction * 2][col]
          ) {
            moves.push({ row: row + direction * 2, col });
          }
        }
        // Captures
        [-1, 1].forEach((dc) => {
          const newCol = col + dc;
          if (isValidPosition(row + direction, newCol)) {
            const target = board[row + direction][newCol];
            if (target && target.color !== piece.color) {
              moves.push({ row: row + direction, col: newCol });
            }
          }
        });
        break;

      case 'rook':
        [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
          for (let i = 1; i < 8; i++) {
            const newRow = row + dr * i;
            const newCol = col + dc * i;
            if (!isValidPosition(newRow, newCol)) break;
            const target = board[newRow][newCol];
            if (!target) {
              moves.push({ row: newRow, col: newCol });
            } else {
              if (target.color !== piece.color) {
                moves.push({ row: newRow, col: newCol });
              }
              break;
            }
          }
        });
        break;

      case 'bishop':
        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
          for (let i = 1; i < 8; i++) {
            const newRow = row + dr * i;
            const newCol = col + dc * i;
            if (!isValidPosition(newRow, newCol)) break;
            const target = board[newRow][newCol];
            if (!target) {
              moves.push({ row: newRow, col: newCol });
            } else {
              if (target.color !== piece.color) {
                moves.push({ row: newRow, col: newCol });
              }
              break;
            }
          }
        });
        break;

      case 'queen':
        [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
          for (let i = 1; i < 8; i++) {
            const newRow = row + dr * i;
            const newCol = col + dc * i;
            if (!isValidPosition(newRow, newCol)) break;
            const target = board[newRow][newCol];
            if (!target) {
              moves.push({ row: newRow, col: newCol });
            } else {
              if (target.color !== piece.color) {
                moves.push({ row: newRow, col: newCol });
              }
              break;
            }
          }
        });
        break;

      case 'knight':
        [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]].forEach(([dr, dc]) => {
          const newRow = row + dr;
          const newCol = col + dc;
          if (isValidPosition(newRow, newCol)) {
            const target = board[newRow][newCol];
            if (!target || target.color !== piece.color) {
              moves.push({ row: newRow, col: newCol });
            }
          }
        });
        break;

      case 'king':
        [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
          const newRow = row + dr;
          const newCol = col + dc;
          if (isValidPosition(newRow, newCol)) {
            const target = board[newRow][newCol];
            if (!target || target.color !== piece.color) {
              moves.push({ row: newRow, col: newCol });
            }
          }
        });
        break;
    }

    return moves;
  };

  const handleSquareClick = (row: number, col: number) => {
    if (gameOver) return;

    const piece = board[row][col];

    // If a square is already selected
    if (selectedSquare) {
      // Check if clicking on a valid move
      const isValidMove = validMoves.some((move) => move.row === row && move.col === col);

      if (isValidMove) {
        // Make the move
        const newBoard = board.map((r) => [...r]);
        const movingPiece = newBoard[selectedSquare.row][selectedSquare.col];
        const capturedPiece = newBoard[row][col];

        if (capturedPiece) {
          setCapturedPieces((prev) => ({
            ...prev,
            [currentPlayer]: [...prev[currentPlayer], capturedPiece],
          }));

          // Check if king is captured
          if (capturedPiece.type === 'king') {
            setGameOver(true);
            setWinner(currentPlayer);
          }
        }

        newBoard[row][col] = movingPiece;
        newBoard[selectedSquare.row][selectedSquare.col] = null;

        // Pawn promotion
        if (movingPiece?.type === 'pawn' && (row === 0 || row === 7)) {
          newBoard[row][col] = { type: 'queen', color: movingPiece.color };
        }

        setBoard(newBoard);
        setSelectedSquare(null);
        setValidMoves([]);
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
      } else if (piece && piece.color === currentPlayer) {
        // Select different piece
        setSelectedSquare({ row, col });
        setValidMoves(getValidMoves(piece, row, col));
      } else {
        // Deselect
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } else if (piece && piece.color === currentPlayer) {
      // Select piece
      setSelectedSquare({ row, col });
      setValidMoves(getValidMoves(piece, row, col));
    }
  };

  const resetGame = () => {
    setBoard(INITIAL_BOARD.map((row) => [...row]));
    setSelectedSquare(null);
    setCurrentPlayer('white');
    setValidMoves([]);
    setCapturedPieces({ white: [], black: [] });
    setGameOver(false);
    setWinner(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 to-yellow-600 p-4">
          <h3 className="text-2xl font-bold">♟️ Chess</h3>
          <p className="text-gray-200">Classic strategy game</p>
        </div>

        <div className="p-4">
          {/* Game Status */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl">
              <span className={currentPlayer === 'white' ? 'text-white font-bold' : 'text-gray-500'}>
                ⚪ White
              </span>
              {' vs '}
              <span className={currentPlayer === 'black' ? 'text-gray-900 font-bold bg-gray-400 px-2 rounded' : 'text-gray-500'}>
                ⚫ Black
              </span>
            </div>
            <div className="text-lg">
              Turn: <span className="font-bold capitalize">{currentPlayer}</span>
            </div>
          </div>

          {/* Captured Pieces */}
          <div className="flex justify-between mb-4 text-sm">
            <div className="bg-gray-700 p-2 rounded">
              <span className="text-gray-400">White captured: </span>
              {capturedPieces.white.map((p, i) => (
                <span key={i}>{PIECE_SYMBOLS[p.color][p.type]}</span>
              ))}
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <span className="text-gray-400">Black captured: </span>
              {capturedPieces.black.map((p, i) => (
                <span key={i}>{PIECE_SYMBOLS[p.color][p.type]}</span>
              ))}
            </div>
          </div>

          {/* Chess Board */}
          <div className="flex justify-center">
            <div className="inline-block border-4 border-amber-800 rounded-lg overflow-hidden">
              {board.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((piece, colIndex) => {
                    const isSelected =
                      selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex;
                    const isValidMove = validMoves.some(
                      (move) => move.row === rowIndex && move.col === colIndex
                    );
                    const isLight = (rowIndex + colIndex) % 2 === 0;

                    return (
                      <button
                        key={colIndex}
                        onClick={() => handleSquareClick(rowIndex, colIndex)}
                        className={`
                          w-12 h-12 flex items-center justify-center text-3xl
                          transition-all duration-150
                          ${isLight ? 'bg-amber-100' : 'bg-amber-800'}
                          ${isSelected ? 'ring-4 ring-blue-500 z-10' : ''}
                          ${isValidMove ? 'ring-2 ring-green-400' : ''}
                          hover:opacity-80
                        `}
                      >
                        {piece && (
                          <span
                            className={`
                              ${piece.color === 'white' ? 'text-white' : 'text-gray-900'}
                              drop-shadow-lg
                            `}
                          >
                            {PIECE_SYMBOLS[piece.color][piece.type]}
                          </span>
                        )}
                        {isValidMove && !piece && (
                          <span className="w-3 h-3 bg-green-400 rounded-full opacity-50"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Game Over */}
          {gameOver && (
            <div className="mt-4 p-4 bg-green-900/30 border border-green-600 rounded-lg text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-xl font-bold text-green-400">
                {winner === 'white' ? 'White' : 'Black'} Wins!
              </div>
              <button
                onClick={resetGame}
                className="mt-3 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold"
              >
                🔄 New Game
              </button>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-4 text-center text-sm text-gray-400">
            <p>Click a piece to select it, then click a highlighted square to move</p>
          </div>
        </div>
      </div>
    </div>
  );
}
