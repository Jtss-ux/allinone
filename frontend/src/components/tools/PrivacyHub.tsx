'use client';
import React from 'react';
import ServiceHub from './ServiceHub';

const services = [
    { name: 'Bitwarden', url: 'https://bitwarden.com', description: 'Open-source password manager with end-to-end encryption', icon: '🔐', tags: ['Passwords', 'Encryption'], free: true },
    { name: 'KeePassXC', url: 'https://keepassxc.org', description: 'Offline password manager — your passwords never leave your device', icon: '🔑', tags: ['Passwords', 'Offline'], free: true },
    { name: 'ProtonVPN', url: 'https://protonvpn.com', description: 'Secure VPN by the makers of ProtonMail — no-logs policy', icon: '🛡️', tags: ['VPN', 'Privacy'], free: true },
    { name: 'Tor Browser', url: 'https://torproject.org', description: 'Browse anonymously — protect your privacy online', icon: '🧅', tags: ['Browser', 'Anonymity'], free: true },
    { name: 'DuckDuckGo', url: 'https://duckduckgo.com', description: 'Privacy-focused search engine that does not track you', icon: '🦆', tags: ['Search', 'Privacy'], free: true },
    { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com', description: 'Check if your email has been compromised in a data breach', icon: '⚠️', tags: ['Breach', 'Email'], free: true },
    { name: 'VirusTotal', url: 'https://virustotal.com', description: 'Scan files and URLs for malware using 70+ antivirus engines', icon: '🦠', tags: ['Malware', 'Scanner'], free: true },
    { name: 'Cryptomator', url: 'https://cryptomator.org', description: 'Client-side encryption for your cloud files (Dropbox, Drive, etc.)', icon: '🔒', tags: ['Encryption', 'Files'], free: true },
    { name: 'Signal', url: 'https://signal.org', description: 'End-to-end encrypted messaging app', icon: '💬', tags: ['Messaging', 'Encryption'], free: true },
    { name: 'Standard Notes', url: 'https://standardnotes.com', description: 'Encrypted note-taking app with privacy by default', icon: '📝', tags: ['Notes', 'Encryption'], free: true },
];

export default function PrivacyHub() {
    return <ServiceHub title="Privacy & Security Hub" subtitle="Protect your data with these privacy-focused tools and services"
        gradient="from-red-700 to-rose-800" headerIcon="🛡️" services={services} />;
}
