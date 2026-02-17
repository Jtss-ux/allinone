'use client';

import React, { useState } from 'react';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+': return firstValue + secondValue;
      case '-': return firstValue - secondValue;
      case '×': return firstValue * secondValue;
      case '÷': return firstValue / secondValue;
      case '%': return firstValue % secondValue;
      case '^': return Math.pow(firstValue, secondValue);
      default: return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const buttons = [
    { label: 'C', onClick: clear, className: 'bg-red-600' },
    { label: '±', onClick: () => setDisplay(String(-parseFloat(display))), className: 'bg-gray-700' },
    { label: '%', onClick: () => performOperation('%'), className: 'bg-gray-700' },
    { label: '÷', onClick: () => performOperation('÷'), className: 'bg-orange-600' },
    { label: '7', onClick: () => inputNumber('7'), className: 'bg-gray-600' },
    { label: '8', onClick: () => inputNumber('8'), className: 'bg-gray-600' },
    { label: '9', onClick: () => inputNumber('9'), className: 'bg-gray-600' },
    { label: '×', onClick: () => performOperation('×'), className: 'bg-orange-600' },
    { label: '4', onClick: () => inputNumber('4'), className: 'bg-gray-600' },
    { label: '5', onClick: () => inputNumber('5'), className: 'bg-gray-600' },
    { label: '6', onClick: () => inputNumber('6'), className: 'bg-gray-600' },
    { label: '-', onClick: () => performOperation('-'), className: 'bg-orange-600' },
    { label: '1', onClick: () => inputNumber('1'), className: 'bg-gray-600' },
    { label: '2', onClick: () => inputNumber('2'), className: 'bg-gray-600' },
    { label: '3', onClick: () => inputNumber('3'), className: 'bg-gray-600' },
    { label: '+', onClick: () => performOperation('+'), className: 'bg-orange-600' },
    { label: '0', onClick: () => inputNumber('0'), className: 'bg-gray-600 col-span-2' },
    { label: '.', onClick: inputDecimal, className: 'bg-gray-600' },
    { label: '=', onClick: performCalculation, className: 'bg-green-600' },
  ];

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-black p-4">
          <h3 className="text-2xl font-bold">🧮 Calculator</h3>
          <p className="text-gray-300">Scientific calculator</p>
        </div>

        <div className="p-6">
          {/* Display */}
          <div className="bg-black text-white text-right p-4 rounded-lg mb-4">
            <div className="text-3xl font-mono overflow-x-auto">{display}</div>
            {operation && (
              <div className="text-sm text-gray-400">{previousValue} {operation}</div>
            )}
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {buttons.map((btn, index) => (
              <button
                key={index}
                onClick={btn.onClick}
                className={`py-4 rounded-lg font-bold text-xl transition hover:opacity-80 ${btn.className} ${btn.className.includes('col-span') ? 'col-span-2' : ''}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
