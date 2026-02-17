'use client';

import React, { useState } from 'react';

export default function UnitConverter() {
  const [category, setCategory] = useState('length');
  const [fromValue, setFromValue] = useState(1);
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [result, setResult] = useState<number | null>(null);

  const categories: Record<string, { name: string; units: Record<string, number> }> = {
    length: {
      name: 'Length',
      units: {
        m: 1,
        km: 1000,
        cm: 0.01,
        mm: 0.001,
        ft: 0.3048,
        in: 0.0254,
        yd: 0.9144,
        mi: 1609.34,
      },
    },
    weight: {
      name: 'Weight',
      units: {
        kg: 1,
        g: 0.001,
        mg: 0.000001,
        lb: 0.453592,
        oz: 0.0283495,
        ton: 1000,
      },
    },
    temperature: {
      name: 'Temperature',
      units: {
        c: 1,
        f: 1,
        k: 1,
      },
    },
    volume: {
      name: 'Volume',
      units: {
        l: 1,
        ml: 0.001,
        gal: 3.78541,
        qt: 0.946353,
        pt: 0.473176,
        cup: 0.24,
        floz: 0.0295735,
      },
    },
    area: {
      name: 'Area',
      units: {
        'm2': 1,
        'km2': 1000000,
        'ft2': 0.092903,
        'ac': 4046.86,
        'ha': 10000,
      },
    },
    speed: {
      name: 'Speed',
      units: {
        'm/s': 1,
        'km/h': 0.277778,
        'mph': 0.44704,
        'kn': 0.514444,
      },
    },
    time: {
      name: 'Time',
      units: {
        s: 1,
        min: 60,
        h: 3600,
        d: 86400,
        wk: 604800,
        mo: 2628000,
        y: 31536000,
      },
    },
    data: {
      name: 'Data',
      units: {
        b: 1,
        kb: 1024,
        mb: 1048576,
        gb: 1073741824,
        tb: 1099511627776,
      },
    },
  };

  const convert = () => {
    if (category === 'temperature') {
      let celsius = fromValue;
      if (fromUnit === 'f') celsius = (fromValue - 32) * 5/9;
      if (fromUnit === 'k') celsius = fromValue - 273.15;
      
      let final = celsius;
      if (toUnit === 'f') final = celsius * 9/5 + 32;
      if (toUnit === 'k') final = celsius + 273.15;
      
      setResult(final);
    } else {
      const fromRate = categories[category].units[fromUnit];
      const toRate = categories[category].units[toUnit];
      setResult((fromValue * fromRate) / toRate);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-4">
          <h3 className="text-2xl font-bold">📏 Unit Converter</h3>
          <p className="text-gray-200">Convert between different units of measurement</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Category:</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categories).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => {
                    setCategory(key);
                    setResult(null);
                    const units = Object.keys(cat.units);
                    setFromUnit(units[0]);
                    setToUnit(units[1] || units[0]);
                  }}
                  className={`px-4 py-2 rounded-lg transition ${
                    category === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Conversion Inputs */}
          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-2">From:</label>
              <input
                type="number"
                value={fromValue}
                onChange={(e) => setFromValue(Number(e.target.value))}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full mt-2 p-2 bg-gray-700 text-white rounded-lg border border-gray-600"
              >
                {Object.keys(categories[category].units).map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  const temp = fromUnit;
                  setFromUnit(toUnit);
                  setToUnit(temp);
                }}
                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full"
              >
                ⇄
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">To:</label>
              <div className="w-full p-3 bg-gray-900 text-white rounded-lg border border-gray-600 min-h-[46px]">
                {result !== null ? result.toFixed(6).replace(/\.?0+$/, '') : '-'}
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full mt-2 p-2 bg-gray-700 text-white rounded-lg border border-gray-600"
              >
                {Object.keys(categories[category].units).map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={convert}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 rounded-lg font-bold"
          >
            🔄 Convert
          </button>
        </div>
      </div>
    </div>
  );
}
