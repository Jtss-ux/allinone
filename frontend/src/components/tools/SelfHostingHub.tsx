'use client';
import React from 'react';
import ServiceHub from './ServiceHub';

const services = [
    { name: 'Nextcloud', url: 'https://nextcloud.com', description: 'Self-hosted productivity platform — files, calendar, contacts, and more', icon: '☁️', tags: ['Files', 'Productivity'], free: true },
    { name: 'CasaOS', url: 'https://casaos.io', description: 'Simple personal cloud OS for home servers with app store', icon: '🏠', tags: ['OS', 'Dashboard'], free: true },
    { name: 'Umbrel', url: 'https://umbrel.com', description: 'Personal server OS for self-hosting with one-click app installs', icon: '☂️', tags: ['OS', 'Apps'], free: true },
    { name: 'TrueNAS', url: 'https://www.truenas.com', description: 'Enterprise-grade storage OS with ZFS support', icon: '💾', tags: ['Storage', 'NAS'], free: true },
    { name: 'Unraid', url: 'https://unraid.net', description: 'Flexible NAS OS with Docker and VM support', icon: '🖥️', tags: ['Storage', 'Docker'], free: false },
    { name: 'Jellyfin', url: 'https://jellyfin.org', description: 'Free media server — stream your movies, music, and photos', icon: '📺', tags: ['Media', 'Streaming'], free: true },
    { name: 'Plex', url: 'https://plex.tv', description: 'Premium media server with apps for every device', icon: '▶️', tags: ['Media', 'Streaming'], free: false },
    { name: 'Homarr', url: 'https://homarr.dev', description: 'Modern dashboard for your server with service integrations', icon: '📊', tags: ['Dashboard'], free: true },
    { name: 'Heimdall', url: 'https://heimdall.site', description: 'Elegant application dashboard with search and organization', icon: '🌈', tags: ['Dashboard'], free: true },
    { name: 'Dashy', url: 'https://dashy.to', description: 'Highly customizable self-hosted startpage and dashboard', icon: '🎛️', tags: ['Dashboard'], free: true },
    { name: 'YunoHost', url: 'https://yunohost.org', description: 'Simplified server administration with app catalog', icon: '🐧', tags: ['OS', 'Apps'], free: true },
    { name: 'Cosmos Cloud', url: 'https://cosmos-cloud.io', description: 'Self-hosted platform with built-in security and VPN', icon: '🌌', tags: ['OS', 'Security'], free: true },
];

export default function SelfHostingHub() {
    return <ServiceHub title="Self-Hosting Hub" subtitle="Tools and platforms for running your own personal server"
        gradient="from-blue-700 to-indigo-800" headerIcon="🏠" services={services} />;
}
