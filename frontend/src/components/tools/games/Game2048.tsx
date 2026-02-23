'use client';

import React, { useState, useEffect, useCallback } from 'react';

const COLORS: Record<number, string> = {
    0: '#cdc1b4',
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e',
};

export default function Game2048() {
    const [board, setBoard] = useState<number[][]>(() => getEmptyBoard());
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    function getEmptyBoard() {
        return Array(4).fill(null).map(() => Array(4).fill(0));
    }

    const addRandomTile = useCallback((currentBoard: number[][]) => {
        const emptyCells: { r: number; c: number }[] = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (currentBoard[r][c] === 0) emptyCells.push({ r, c });
            }
        }
        if (emptyCells.length === 0) return currentBoard;

        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const newBoard = [...currentBoard.map(row => [...row])];
        newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
        return newBoard;
    }, []);

    const initGame = useCallback(() => {
        let b = getEmptyBoard();
        b = addRandomTile(b);
        b = addRandomTile(b);
        setBoard(b);
        setScore(0);
        setGameOver(false);
    }, [addRandomTile]);

    useEffect(() => {
        initGame();
    }, [initGame]);

    const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
        if (gameOver) return;

        let newBoard = [...board.map(row => [...row])];
        let moved = false;
        let newScore = score;

        const processLine = (line: number[]) => {
            let filtered = line.filter(val => val !== 0);
            for (let i = 0; i < filtered.length - 1; i++) {
                if (filtered[i] === filtered[i + 1]) {
                    filtered[i] *= 2;
                    newScore += filtered[i];
                    filtered.splice(i + 1, 1);
                }
            }
            while (filtered.length < 4) filtered.push(0);
            return filtered;
        };

        if (direction === 'LEFT' || direction === 'RIGHT') {
            for (let r = 0; r < 4; r++) {
                let row = newBoard[r];
                if (direction === 'RIGHT') row.reverse();
                const newRow = processLine(row);
                if (direction === 'RIGHT') newRow.reverse();
                if (newRow.join(',') !== newBoard[r].join(',')) moved = true;
                newBoard[r] = newRow;
            }
        } else {
            for (let c = 0; c < 4; c++) {
                let col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
                if (direction === 'DOWN') col.reverse();
                const newCol = processLine(col);
                if (direction === 'DOWN') newCol.reverse();
                for (let r = 0; r < 4; r++) {
                    if (newBoard[r][c] !== newCol[r]) moved = true;
                    newBoard[r][c] = newCol[r];
                }
            }
        }

        if (moved) {
            newBoard = addRandomTile(newBoard);
            setBoard(newBoard);
            setScore(newScore);

            // Check game over
            let hasMove = false;
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (newBoard[r][c] === 0) hasMove = true;
                    if (c < 3 && newBoard[r][c] === newBoard[r][c + 1]) hasMove = true;
                    if (r < 3 && newBoard[r][c] === newBoard[r + 1][c]) hasMove = true;
                }
            }
            if (!hasMove) setGameOver(true);
        }
    }, [board, gameOver, score, addRandomTile]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                if (e.key === 'ArrowUp') move('UP');
                if (e.key === 'ArrowDown') move('DOWN');
                if (e.key === 'ArrowLeft') move('LEFT');
                if (e.key === 'ArrowRight') move('RIGHT');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [move]);

    return (
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6 flex flex-col items-center">
            <div className="flex justify-between w-full items-center mb-6">
                <h2 className="text-4xl font-bold font-mono text-[#edc22e]">2048</h2>
                <div className="bg-[#bbada0] px-4 py-2 rounded font-bold text-white text-center">
                    <div className="text-xs uppercase text-[#eee4da]">Score</div>
                    <div className="text-xl">{score}</div>
                </div>
            </div>

            <div className="bg-[#bbada0] p-3 rounded-lg w-full max-w-[350px] aspect-square grid grid-cols-4 grid-rows-4 gap-3 relative">
                {board.map((row, r) =>
                    row.map((val, c) => (
                        <div
                            key={`${r}-${c}`}
                            className="rounded flex items-center justify-center font-bold text-2xl transition-all duration-100"
                            style={{
                                backgroundColor: COLORS[val as keyof typeof COLORS] || '#3c3a32',
                                color: val <= 4 ? '#776e65' : '#f9f6f2',
                                boxShadow: val > 0 ? '0 0 10px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            {val > 0 ? val : ''}
                        </div>
                    ))
                )}

                {gameOver && (
                    <div className="absolute inset-0 bg-[#eee4da]/70 flex flex-col items-center justify-center rounded-lg z-10 backdrop-blur-sm">
                        <h3 className="text-4xl font-bold text-[#776e65] mb-4">Game Over!</h3>
                        <button
                            onClick={initGame}
                            className="bg-[#8f7a66] hover:bg-[#9f8b77] text-white font-bold py-3 px-6 rounded transition"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-6 text-gray-400 text-sm text-center">
                Use <kbd className="bg-gray-700 px-2 py-1 rounded">Arrow Keys</kbd> to move tiles.
                <br />Tiles with the same number merge into one!
            </div>
        </div>
    );
}
