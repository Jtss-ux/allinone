'use client';
import React from 'react';
import ServiceHub from './ServiceHub';

const services = [
    { name: 'JustWatch', url: 'https://justwatch.com', description: 'Find where to stream movies and TV shows across all platforms', icon: '🔍', tags: ['Search', 'Streaming'], free: true },
    { name: 'Letterboxd', url: 'https://letterboxd.com', description: 'Social film discovery — rate, review, and track films', icon: '🎞️', tags: ['Social', 'Movies'], free: true },
    { name: 'Trakt', url: 'https://trakt.tv', description: 'Automatically track TV and movies you watch', icon: '📊', tags: ['Tracking', 'TV'], free: true },
    { name: 'TMDB', url: 'https://www.themoviedb.org', description: 'The Movie Database — community-built movie and TV data', icon: '🎬', tags: ['Database', 'API'], free: true },
    { name: 'TV Time', url: 'https://tvtime.com', description: 'Track your favorite TV shows and discover new ones', icon: '📺', tags: ['Tracking', 'TV'], free: true },
    { name: 'Radarr', url: 'https://radarr.video', description: 'Automated movie collection manager for Usenet and BitTorrent', icon: '🎥', tags: ['Automation', 'Movies'], free: true },
    { name: 'Sonarr', url: 'https://sonarr.tv', description: 'Automated TV show collection manager', icon: '📡', tags: ['Automation', 'TV'], free: true },
    { name: 'Prowlarr', url: 'https://prowlarr.com', description: 'Indexer manager for Sonarr, Radarr, and other *arr apps', icon: '🔗', tags: ['Automation', 'Indexer'], free: true },
    { name: 'Bazarr', url: 'https://bazarr.media', description: 'Automated subtitle download manager', icon: '💬', tags: ['Automation', 'Subtitles'], free: true },
    { name: 'Overseerr', url: 'https://overseerr.dev', description: 'Media request management for Plex, Jellyfin, and Emby', icon: '📋', tags: ['Requests', 'Media'], free: true },
];

export default function MediaHub() {
    return <ServiceHub title="Media & Entertainment Hub" subtitle="Discover, track, and manage your movies and TV shows"
        gradient="from-purple-700 to-pink-700" headerIcon="🎬" services={services} />;
}
