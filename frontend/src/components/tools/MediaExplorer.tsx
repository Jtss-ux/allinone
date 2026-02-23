'use client';

import React, { useState } from 'react';
import axios from 'axios';

interface Movie {
    id: number;
    title?: string;
    name?: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    release_date?: string;
    first_air_date?: string;
    media_type?: string;
    genre_ids: number[];
}

const GENRES: Record<number, string> = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
    27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
    10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
    10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
    10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics',
};

const TMDB_IMG = 'https://image.tmdb.org/t/p';

export default function MediaExplorer() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState<Movie | null>(null);
    const [category, setCategory] = useState<'multi' | 'movie' | 'tv'>('multi');
    const [trending, setTrending] = useState<Movie[]>([]);

    const searchMedia = async () => {
        if (!query.trim()) return;
        setLoading(true); setError(''); setSelected(null);
        try {
            const res = await axios.get(`https://api.themoviedb.org/3/search/${category}`, {
                params: { api_key: '6e79e3b0d3ae9116b648e3cc97689b48', query, language: 'en-US', page: 1 }
            });
            setResults(res.data.results || []);
            if (res.data.results.length === 0) setError('No results found');
        } catch { setError('Search failed. Try again.'); }
        finally { setLoading(false); }
    };

    const loadTrending = async () => {
        try {
            const res = await axios.get('https://api.themoviedb.org/3/trending/all/week', {
                params: { api_key: '6e79e3b0d3ae9116b648e3cc97689b48' }
            });
            setTrending(res.data.results || []);
        } catch {
            // Fallback content if API fails
            setTrending([
                { id: 1, title: 'Inception', overview: 'A thief who steals corporate secrets...', poster_path: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=300', backdrop_path: 'https://images.unsplash.com/photo-1440407876336-62333a6f010c?auto=format&fit=crop&q=80&w=1280', vote_average: 8.8, release_date: '2010', media_type: 'movie', genre_ids: [28, 878] },
                { id: 2, title: 'Stranger Things', overview: 'When a young boy vanishes...', poster_path: 'https://images.unsplash.com/photo-1627404653243-162e245a190f?auto=format&fit=crop&q=80&w=300', backdrop_path: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1280', vote_average: 8.6, first_air_date: '2016', media_type: 'tv', genre_ids: [10765, 18] },
                { id: 3, title: 'The Dark Knight', overview: 'When the menace known as the Joker...', poster_path: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&q=80&w=300', backdrop_path: 'https://images.unsplash.com/photo-1478479405421-ce83c92fb3ba?auto=format&fit=crop&q=80&w=1280', vote_average: 9.0, release_date: '2008', media_type: 'movie', genre_ids: [28, 80, 18] },
                { id: 4, title: 'Breaking Bad', overview: 'A high school chemistry teacher...', poster_path: 'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?auto=format&fit=crop&q=80&w=300', backdrop_path: 'https://images.unsplash.com/photo-1533518463841-d62e1fc91373?auto=format&fit=crop&q=80&w=1280', vote_average: 9.5, first_air_date: '2008', media_type: 'tv', genre_ids: [18] }
            ] as unknown as Movie[]);
            setError('TMDB API connection failed. Showing sample fallback content.');
        }
    };

    React.useEffect(() => { loadTrending(); }, []);

    const getTitle = (m: Movie) => m.title || m.name || 'Unknown';
    const getYear = (m: Movie) => (m.release_date || m.first_air_date || '').substring(0, 4);
    const getType = (m: Movie) => m.media_type === 'tv' || m.first_air_date ? 'TV' : 'Movie';

    const displayList = results.length > 0 ? results : trending;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-700 via-pink-600 to-red-600 p-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">🎬</span>
                        <div>
                            <h3 className="text-2xl font-bold">Media Explorer</h3>
                            <p className="text-sm text-gray-200">Search movies, TV shows, and discover trending content</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Search */}
                    <div className="flex gap-2 mb-4">
                        <div className="flex bg-gray-700 rounded-lg">
                            {(['multi', 'movie', 'tv'] as const).map(c => (
                                <button key={c} onClick={() => setCategory(c)}
                                    className={`px-3 py-2 text-sm rounded-lg transition ${category === c ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'}`}>
                                    {c === 'multi' ? 'All' : c === 'movie' ? 'Movies' : 'TV Shows'}
                                </button>
                            ))}
                        </div>
                        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && searchMedia()}
                            placeholder="Search movies, TV shows..."
                            className="flex-1 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none" />
                        <button onClick={searchMedia} disabled={loading}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition disabled:opacity-50">
                            {loading ? '...' : '🔍'}
                        </button>
                    </div>

                    {error && <div className="p-3 bg-red-900 text-red-100 rounded-lg text-sm mb-4">{error}</div>}

                    {results.length === 0 && trending.length > 0 && !error && (
                        <h4 className="text-sm font-semibold text-gray-400 mb-3">🔥 Trending This Week</h4>
                    )}

                    {/* Detail Modal */}
                    {selected && (
                        <div className="mb-6 bg-gray-900 rounded-xl overflow-hidden">
                            {selected.backdrop_path && (
                                <div className="relative h-48 md:h-64">
                                    <img src={selected.backdrop_path.startsWith('http') ? selected.backdrop_path : `${TMDB_IMG}/w1280${selected.backdrop_path}`} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
                                </div>
                            )}
                            <div className="p-6 -mt-16 relative">
                                <div className="flex gap-4">
                                    {selected.poster_path && (
                                        <img src={selected.poster_path.startsWith('http') ? selected.poster_path : `${TMDB_IMG}/w300${selected.poster_path}`} alt="" className="w-32 rounded-lg shadow-xl flex-shrink-0 object-cover" />
                                    )}
                                    <div>
                                        <h3 className="text-2xl font-bold">{getTitle(selected)}</h3>
                                        <div className="flex gap-3 mt-2 text-sm text-gray-400">
                                            <span className="bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded">{getType(selected)}</span>
                                            {getYear(selected) && <span>{getYear(selected)}</span>}
                                            <span>⭐ {selected.vote_average.toFixed(1)}/10</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {selected.genre_ids.map(g => (
                                                <span key={g} className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">{GENRES[g] || 'Other'}</span>
                                            ))}
                                        </div>
                                        <p className="text-gray-300 text-sm mt-3 leading-relaxed">{selected.overview || 'No overview available.'}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelected(null)} className="absolute top-2 right-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm">✕ Close</button>
                            </div>
                        </div>
                    )}

                    {/* Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {displayList.slice(0, 20).map(m => (
                            <button key={m.id} onClick={() => setSelected(m)}
                                className="group bg-gray-900 rounded-lg overflow-hidden text-left hover:ring-2 hover:ring-purple-500 transition">
                                {m.poster_path ? (
                                    <img src={m.poster_path.startsWith('http') ? m.poster_path : `${TMDB_IMG}/w300${m.poster_path}`} alt={getTitle(m)} className="w-full aspect-[2/3] object-cover" />
                                ) : (
                                    <div className="w-full aspect-[2/3] bg-gray-700 flex items-center justify-center text-4xl">🎬</div>
                                )}
                                <div className="p-2">
                                    <div className="text-sm font-medium truncate">{getTitle(m)}</div>
                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                        <span>{getYear(m)}</span>
                                        <span>⭐ {m.vote_average.toFixed(1)}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
