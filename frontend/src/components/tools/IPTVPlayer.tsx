'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Channel {
  name: string;
  url: string;
  group: string;
  logo?: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

const defaultPlaylist = 'https://iptv-org.github.io/iptv/index.m3u';

const categories: Category[] = [
  { id: 'all', name: 'All Channels', icon: '📺' },
  { id: 'movies', name: 'Movies', icon: '🎬' },
  { id: 'cartoon', name: 'Cartoons', icon: '🎨' },
  { id: 'music', name: 'Music', icon: '🎵' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'news', name: 'News', icon: '📰' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎭' },
  { id: 'documentary', name: 'Documentary', icon: '📚' },
  { id: 'kids', name: 'Kids', icon: '👶' },
  { id: 'religious', name: 'Religious', icon: '✝️' },
  { id: 'local', name: 'Local', icon: '🏠' },
  { id: 'regional', name: 'Regional', icon: '🌍' },
];

export default function IPTVPlayer() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [playlistUrl, setPlaylistUrl] = useState(defaultPlaylist);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    loadPlaylist(playlistUrl);
  }, []);

  useEffect(() => {
    filterChannels();
  }, [channels, selectedCategory, searchQuery]);

  const loadPlaylist = async (url: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(url);
      const text = await response.text();
      const parsed = parseM3U(text);
      setChannels(parsed);
      setFilteredChannels(parsed);
    } catch (err) {
      setError('Failed to load playlist. Try another URL.');
    } finally {
      setLoading(false);
    }
  };

  const parseM3U = (content: string): Channel[] => {
    const lines = content.split('\n');
    const channels: Channel[] = [];
    let currentChannel: Partial<Channel> = {};

    for (const line of lines) {
      if (line.startsWith('#EXTINF:')) {
        const match = line.match(/group-title="([^"]*)"/);
        currentChannel.group = match ? match[1] : 'Uncategorized';
      } else if (line.startsWith('http')) {
        currentChannel.url = line.trim();
        if (currentChannel.name) {
          channels.push(currentChannel as Channel);
          currentChannel = {};
        }
      } else if (line.trim() && !line.startsWith('#')) {
        currentChannel.name = line.trim();
      }
    }

    return channels;
  };

  const filterChannels = () => {
    let filtered = channels;

    // Filter by category
    if (selectedCategory !== 'all') {
      const categoryKeywords: Record<string, string[]> = {
        movies: ['movie', 'cinema', 'film', 'hbo', 'netflix'],
        cartoon: ['cartoon', 'anime', 'disney', 'nickelodeon', 'cartoon network'],
        music: ['music', ' MTV', ' Vevo', 'concert'],
        sports: ['sport', 'espn', 'fox sports', 'bein', 'football'],
        news: ['news', 'bbc', 'cnn', 'cnbc'],
        entertainment: ['entertainment', 'tv', 'show'],
        documentary: ['doc', 'discovery', 'national geographic', 'history'],
        kids: ['kids', 'baby', 'children', 'disney junior'],
        religious: ['church', 'religious', 'faith', 'god'],
        local: ['local', 'municipal'],
        regional: ['regional', 'province', 'state'],
      };

      const keywords = categoryKeywords[selectedCategory] || [];
      filtered = filtered.filter(ch => 
        keywords.some(kw => ch.name.toLowerCase().includes(kw.toLowerCase())) ||
        ch.group?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(ch => 
        ch.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredChannels(filtered);
  };

  const playChannel = (channel: Channel) => {
    setCurrentChannel(channel);
    if (videoRef.current) {
      videoRef.current.src = channel.url;
      videoRef.current.play().catch(() => {});
    }
  };

  const handlePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPlaylist(playlistUrl);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 p-4">
          <h3 className="text-2xl font-bold">📺 IPTV Player</h3>
          <p className="text-gray-300">Watch live TV, Movies, Sports & More</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-0">
          {/* Left Panel - Channel List */}
          <div className="lg:col-span-1 border-r border-gray-700 max-h-[600px] flex flex-col">
            {/* Playlist URL Input */}
            <div className="p-3 border-b border-gray-700">
              <form onSubmit={handlePlaylistSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="M3U Playlist URL"
                  className="flex-1 p-2 bg-gray-700 text-white text-sm rounded border border-gray-600"
                />
                <button type="submit" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm">
                  Load
                </button>
              </form>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-gray-700">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search channels..."
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
              />
            </div>

            {/* Categories */}
            <div className="p-2 border-b border-gray-700 overflow-x-auto flex gap-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2 py-1 rounded text-xs whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {/* Channel List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-400">Loading channels...</div>
              ) : error ? (
                <div className="p-4 text-center text-red-400">{error}</div>
              ) : filteredChannels.length === 0 ? (
                <div className="p-4 text-center text-gray-400">No channels found</div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {filteredChannels.map((channel, index) => (
                    <button
                      key={index}
                      onClick={() => playChannel(channel)}
                      className={`w-full p-3 text-left hover:bg-gray-700 transition ${
                        currentChannel?.url === channel.url ? 'bg-green-900' : ''
                      }`}
                    >
                      <div className="font-medium text-white truncate">{channel.name}</div>
                      <div className="text-xs text-gray-400">{channel.group || 'Uncategorized'}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-black aspect-video flex items-center justify-center">
              {currentChannel ? (
                <div className="w-full h-full">
                  <video
                    ref={videoRef}
                    controls
                    autoPlay
                    className="w-full h-full"
                    onError={() => setError('Failed to play this channel. It may be offline.')}
                  />
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">📺</div>
                  <p>Select a channel to start watching</p>
                </div>
              )}
            </div>

            {/* Now Playing Info */}
            {currentChannel && (
              <div className="p-4">
                <h4 className="font-bold text-lg text-white">{currentChannel.name}</h4>
                <p className="text-gray-400 text-sm">{currentChannel.group}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="p-4 bg-gray-900 border-t border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-2xl font-bold text-green-400">{channels.length}</div>
              <div className="text-gray-400">Total Channels</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{filteredChannels.length}</div>
              <div className="text-gray-400">Showing</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{categories.length}</div>
              <div className="text-gray-400">Categories</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
