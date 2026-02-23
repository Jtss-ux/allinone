'use client';

import React, { useState, useEffect, useRef } from 'react';
import Script from 'next/script';

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

const PLAYLIST_SOURCES = [
  { label: '🌍 All Channels', url: 'https://iptv-org.github.io/iptv/index.m3u' },
  { label: '🇺🇸 USA', url: 'https://iptv-org.github.io/iptv/countries/us.m3u' },
  { label: '🇬🇧 UK', url: 'https://iptv-org.github.io/iptv/countries/gb.m3u' },
  { label: '🇮🇳 India', url: 'https://iptv-org.github.io/iptv/countries/in.m3u' },
  { label: '🇫🇷 France', url: 'https://iptv-org.github.io/iptv/countries/fr.m3u' },
  { label: '🇩🇪 Germany', url: 'https://iptv-org.github.io/iptv/countries/de.m3u' },
  { label: '🇯🇵 Japan', url: 'https://iptv-org.github.io/iptv/countries/jp.m3u' },
  { label: '🇧🇷 Brazil', url: 'https://iptv-org.github.io/iptv/countries/br.m3u' },
  { label: '🇨🇦 Canada', url: 'https://iptv-org.github.io/iptv/countries/ca.m3u' },
  { label: '🇦🇺 Australia', url: 'https://iptv-org.github.io/iptv/countries/au.m3u' },
  { label: '🎬 Movies', url: 'https://iptv-org.github.io/iptv/categories/movies.m3u' },
  { label: '📰 News', url: 'https://iptv-org.github.io/iptv/categories/news.m3u' },
  { label: '⚽ Sports', url: 'https://iptv-org.github.io/iptv/categories/sports.m3u' },
  { label: '🎵 Music', url: 'https://iptv-org.github.io/iptv/categories/music.m3u' },
  { label: '👶 Kids', url: 'https://iptv-org.github.io/iptv/categories/kids.m3u' },
  { label: '📚 Education', url: 'https://iptv-org.github.io/iptv/categories/education.m3u' },
  { label: '🎭 Entertainment', url: 'https://iptv-org.github.io/iptv/categories/entertainment.m3u' },
];

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
  { id: 'education', name: 'Education', icon: '🎓' },
  { id: 'comedy', name: 'Comedy', icon: '😂' },
  { id: 'cooking', name: 'Cooking', icon: '🍳' },
  { id: 'travel', name: 'Travel', icon: '✈️' },
  { id: 'science', name: 'Science', icon: '🔬' },
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
      setPlaylistUrl(url);
    } catch (err) {
      setError('Failed to load playlist. Try another URL.');
    } finally {
      setLoading(false);
    }
  };

  const parseM3U = (content: string): Channel[] => {
    const lines = content.split('\n');
    const channels: Channel[] = [];
    let currentInfo: Partial<Channel> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('#EXTINF:')) {
        // Extract group-title
        const groupMatch = line.match(/group-title="([^"]*)"/);
        currentInfo.group = groupMatch ? groupMatch[1] : 'Uncategorized';

        // Extract tvg-logo
        const logoMatch = line.match(/tvg-logo="([^"]*)"/);
        currentInfo.logo = logoMatch ? logoMatch[1] : undefined;

        // Extract channel name (everything after the last comma)
        const commaIndex = line.lastIndexOf(',');
        if (commaIndex !== -1) {
          currentInfo.name = line.substring(commaIndex + 1).trim();
        }
      } else if (line.startsWith('http')) {
        currentInfo.url = line;
        if (currentInfo.name && currentInfo.url) {
          channels.push(currentInfo as Channel);
        }
        currentInfo = {};
      }
    }

    return channels;
  };

  const filterChannels = () => {
    let filtered = channels;

    // Filter by category
    if (selectedCategory !== 'all') {
      const categoryKeywords: Record<string, string[]> = {
        movies: ['movie', 'cinema', 'film', 'hbo', 'netflix', 'paramount', 'fox movie', 'action', 'thriller'],
        cartoon: ['cartoon', 'anime', 'disney', 'nickelodeon', 'cartoon network', 'boomerang', 'toonami'],
        music: ['music', 'mtv', 'vevo', 'concert', 'vh1', 'radio', 'hits'],
        sports: ['sport', 'espn', 'fox sports', 'bein', 'football', 'cricket', 'nba', 'nfl', 'tennis', 'golf', 'racing'],
        news: ['news', 'bbc', 'cnn', 'cnbc', 'msnbc', 'fox news', 'al jazeera', 'reuters', 'sky news', 'nbc'],
        entertainment: ['entertainment', 'tv', 'show', 'reality', 'comedy central', 'tbs', 'bravo', 'e!'],
        documentary: ['doc', 'discovery', 'national geographic', 'history', 'nature', 'planet', 'science channel'],
        kids: ['kids', 'baby', 'children', 'disney junior', 'disney xd', 'pbs kids', 'sprout', 'nick jr'],
        religious: ['church', 'religious', 'faith', 'god', 'christian', 'prayer', 'worship', 'biblical'],
        education: ['education', 'learn', 'school', 'university', 'ted', 'course', 'lecture'],
        comedy: ['comedy', 'funny', 'humor', 'stand-up', 'sitcom', 'laugh'],
        cooking: ['cook', 'food', 'chef', 'kitchen', 'recipe', 'culinary', 'bake'],
        travel: ['travel', 'adventure', 'explore', 'tourism', 'destination', 'world'],
        science: ['science', 'technology', 'tech', 'space', 'nasa', 'physics', 'engineering'],
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
    setError('');

    if (videoRef.current) {
      const video = videoRef.current;
      const hlsUrl = channel.url.includes('.m3u8') || channel.url.includes('.m3u');

      if (hlsUrl && (window as any).Hls) {
        const Hls = (window as any).Hls;
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(channel.url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => { });
          });
          hls.on(Hls.Events.ERROR, (event: any, data: any) => {
            if (data.fatal) {
              setError('Failed to play this channel. The stream may be offline or in an unsupported format.');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = channel.url;
          video.play().catch(() => { });
        }
      } else {
        video.src = channel.url;
        video.play().catch(() => { });
      }
    }
  };

  const handlePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPlaylist(playlistUrl);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Script
        src="https://cdn.jsdelivr.net/npm/hls.js@latest"
        strategy="lazyOnload"
      />
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 p-4">
          <h3 className="text-2xl font-bold">📺 IPTV Player</h3>
          <p className="text-gray-300">Watch live TV, Movies, Sports & More</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-0">
          {/* Left Panel - Channel List */}
          <div className="lg:col-span-1 border-r border-gray-700 max-h-[600px] flex flex-col">
            {/* Playlist Sources */}
            <div className="p-3 border-b border-gray-700">
              <div className="flex gap-2">
                <select
                  value={playlistUrl}
                  onChange={(e) => loadPlaylist(e.target.value)}
                  className="flex-1 p-2 bg-gray-700 text-white text-sm rounded border border-gray-600"
                >
                  {PLAYLIST_SOURCES.map(src => (
                    <option key={src.url} value={src.url}>{src.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="Custom M3U URL"
                  className="flex-1 p-2 bg-gray-700 text-white text-xs rounded border border-gray-600"
                />
                <button onClick={() => loadPlaylist(playlistUrl)} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs">
                  Load
                </button>
              </div>
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
                  className={`px-2 py-1 rounded text-xs whitespace-nowrap transition ${selectedCategory === cat.id
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
                      className={`w-full p-3 text-left hover:bg-gray-700 transition ${currentChannel?.url === channel.url ? 'bg-green-900' : ''
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
