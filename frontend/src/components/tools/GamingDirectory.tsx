'use client';
import React from 'react';
import ServiceHub from './ServiceHub';

const services = [
    { name: 'EmulatorJS', url: 'https://emulatorjs.org', description: 'Browser-based retro game emulator — play classic games online', icon: '🕹️', tags: ['Emulator', 'Browser'], free: true },
    { name: 'Itch.io', url: 'https://itch.io', description: 'Indie game marketplace with thousands of free games', icon: '🎮', tags: ['Marketplace', 'Indie'], free: true },
    { name: 'RetroArch', url: 'https://retroarch.com', description: 'All-in-one retro game emulator frontend with multiple cores', icon: '👾', tags: ['Emulator', 'Desktop'], free: true },
    { name: 'SteamDB', url: 'https://steamdb.info', description: 'Steam game database — track prices, sales, and player counts', icon: '💨', tags: ['Database', 'Steam'], free: true },
    { name: 'IGDB', url: 'https://igdb.com', description: 'Internet Game Database — comprehensive game information', icon: '📚', tags: ['Database', 'API'], free: true },
    { name: 'GOG Galaxy', url: 'https://gog.com/galaxy', description: 'DRM-free game launcher that unifies all your game libraries', icon: '🌌', tags: ['Launcher', 'DRM-Free'], free: true },
    { name: 'DOSBox-X', url: 'https://dosbox-x.com', description: 'Enhanced DOS emulator for classic PC games and apps', icon: '🖥️', tags: ['Emulator', 'DOS'], free: true },
    { name: 'PCGamingWiki', url: 'https://pcgamingwiki.com', description: 'Fixes and improvements for PC games — community wiki', icon: '🔧', tags: ['Wiki', 'Fixes'], free: true },
    { name: 'ProtonDB', url: 'https://protondb.com', description: 'Linux gaming compatibility reports for Steam games', icon: '🐧', tags: ['Linux', 'Compatibility'], free: true },
    { name: 'HowLongToBeat', url: 'https://howlongtobeat.com', description: 'Find out how long it takes to complete any game', icon: '⏱️', tags: ['Database', 'Time'], free: true },
];

export default function GamingDirectory() {
    return <ServiceHub title="Gaming Hub" subtitle="Emulators, databases, and tools for gamers"
        gradient="from-green-700 to-emerald-800" headerIcon="🎮" services={services} />;
}
