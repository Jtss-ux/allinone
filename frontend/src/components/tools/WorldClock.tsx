'use client';

import React, { useState, useEffect } from 'react';

interface City {
  name: string;
  timezone: string;
  country: string;
}

const cities: City[] = [
  { name: 'New York', timezone: 'America/New_York', country: '🇺🇸' },
  { name: 'London', timezone: 'Europe/London', country: '🇬🇧' },
  { name: 'Paris', timezone: 'Europe/Paris', country: '🇫🇷' },
  { name: 'Tokyo', timezone: 'Asia/Tokyo', country: '🇯🇵' },
  { name: 'Sydney', timezone: 'Australia/Sydney', country: '🇦🇺' },
  { name: 'Dubai', timezone: 'Asia/Dubai', country: '🇦🇪' },
  { name: 'Singapore', timezone: 'Asia/Singapore', country: '🇸🇬' },
  { name: 'Mumbai', timezone: 'Asia/Kolkata', country: '🇮🇳' },
  { name: 'Los Angeles', timezone: 'America/Los_Angeles', country: '🇺🇸' },
  { name: 'Chicago', timezone: 'America/Chicago', country: '🇺🇸' },
  { name: 'Berlin', timezone: 'Europe/Berlin', country: '🇩🇪' },
  { name: 'Moscow', timezone: 'Europe/Moscow', country: '🇷🇺' },
  { name: 'Beijing', timezone: 'Asia/Shanghai', country: '🇨🇳' },
  { name: 'Hong Kong', timezone: 'Asia/Hong_Kong', country: '🇭🇰' },
  { name: 'Seoul', timezone: 'Asia/Seoul', country: '🇰🇷' },
  { name: 'Bangkok', timezone: 'Asia/Bangkok', country: '🇹🇭' },
  { name: 'Istanbul', timezone: 'Europe/Istanbul', country: '🇹🇷' },
  { name: 'Cairo', timezone: 'Africa/Cairo', country: '🇪🇬' },
  { name: 'Johannesburg', timezone: 'Africa/Johannesburg', country: '🇿🇦' },
  { name: 'São Paulo', timezone: 'America/Sao_Paulo', country: '🇧🇷' },
  { name: 'Mexico City', timezone: 'America/Mexico_City', country: '🇲🇽' },
  { name: 'Toronto', timezone: 'America/Toronto', country: '🇨🇦' },
  { name: 'Vancouver', timezone: 'America/Vancouver', country: '🇨🇦' },
  { name: 'Madrid', timezone: 'Europe/Madrid', country: '🇪🇸' },
];

export default function WorldClock() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedCities, setSelectedCities] = useState<City[]>([
    cities[0], cities[1], cities[3], cities[4]
  ]);
  const [showCitySelector, setShowCitySelector] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getCityTime = (timezone: string) => {
    return new Date(currentTime.toLocaleString('en-US', { timeZone: timezone }));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeDiff = (timezone: string) => {
    const cityTime = getCityTime(timezone);
    const localTime = currentTime;
    const diff = (cityTime.getTime() - localTime.getTime()) / (1000 * 60 * 60);
    const hours = Math.round(diff);
    return hours === 0 ? 'Same time' : hours > 0 ? `+${hours}h` : `${hours}h`;
  };

  const toggleCity = (city: City) => {
    if (selectedCities.find((c) => c.name === city.name)) {
      setSelectedCities(selectedCities.filter((c) => c.name !== city.name));
    } else {
      setSelectedCities([...selectedCities, city]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4">
          <h3 className="text-2xl font-bold">🌍 World Clock</h3>
          <p className="text-gray-200">Current time across the globe</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Local Time */}
          <div className="text-center p-6 bg-gradient-to-r from-blue-900 to-cyan-900 rounded-lg">
            <h4 className="text-lg text-gray-300 mb-2">Your Local Time</h4>
            <div className="text-5xl font-mono font-bold">{formatTime(currentTime)}</div>
            <div className="text-xl text-gray-300 mt-2">{formatDate(currentTime)}</div>
          </div>

          {/* Add City Button */}
          <button
            onClick={() => setShowCitySelector(!showCitySelector)}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
          >
            {showCitySelector ? '✕ Close Selector' : '➕ Add/Remove Cities'}
          </button>

          {/* City Selector */}
          {showCitySelector && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Select Cities:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                {cities.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => toggleCity(city)}
                    className={`p-2 rounded text-left text-sm transition ${
                      selectedCities.find((c) => c.name === city.name)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  >
                    <span className="text-lg mr-1">{city.country}</span>
                    {city.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* World Clocks Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedCities.map((city) => {
              const cityTime = getCityTime(city.timezone);
              return (
                <div key={city.name} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{city.country}</span>
                      <div>
                        <div className="font-bold">{city.name}</div>
                        <div className="text-xs text-gray-400">{getTimeDiff(city.timezone)}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleCity(city)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="text-3xl font-mono">{formatTime(cityTime)}</div>
                  <div className="text-sm text-gray-400">{formatDate(cityTime)}</div>
                </div>
              );
            })}
          </div>

          {/* Meeting Planner */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">📅 Meeting Planner</h4>
            <p className="text-sm text-gray-400 mb-4">
              Find the best time for a meeting across time zones
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-green-900/30 rounded text-center">
                <div className="font-semibold text-green-400">Best Time</div>
                <div>9:00 AM - 5:00 PM</div>
                <div className="text-xs text-gray-500">Business hours overlap</div>
              </div>
              <div className="p-2 bg-yellow-900/30 rounded text-center">
                <div className="font-semibold text-yellow-400">Avoid</div>
                <div>10:00 PM - 6:00 AM</div>
                <div className="text-xs text-gray-500">Night time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
