'use client';

import React, { useState } from 'react';

interface ServiceItem {
    name: string;
    url: string;
    description: string;
    icon: string;
    tags: string[];
    free?: boolean;
}

interface ServiceHubProps {
    title: string;
    subtitle: string;
    gradient: string;
    headerIcon: string;
    services: ServiceItem[];
}

export default function ServiceHub({ title, subtitle, gradient, headerIcon, services }: ServiceHubProps) {
    const [filter, setFilter] = useState('');
    const allTags = Array.from(new Set(services.flatMap(s => s.tags)));
    const [activeTag, setActiveTag] = useState('All');

    const filtered = services.filter(s => {
        const matchesSearch = !filter || s.name.toLowerCase().includes(filter.toLowerCase()) || s.description.toLowerCase().includes(filter.toLowerCase());
        const matchesTag = activeTag === 'All' || s.tags.includes(activeTag);
        return matchesSearch && matchesTag;
    });

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className={`bg-gradient-to-r ${gradient} p-6`}>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">{headerIcon}</span>
                        <div>
                            <h3 className="text-2xl font-bold">{title}</h3>
                            <p className="text-sm text-gray-200">{subtitle}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Search + Tags */}
                    <div className="mb-4">
                        <input type="text" value={filter} onChange={e => setFilter(e.target.value)}
                            placeholder="Search tools..." className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none mb-3" />
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => setActiveTag('All')}
                                className={`px-3 py-1 rounded-full text-xs transition ${activeTag === 'All' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>All</button>
                            {allTags.map(tag => (
                                <button key={tag} onClick={() => setActiveTag(tag)}
                                    className={`px-3 py-1 rounded-full text-xs transition ${activeTag === tag ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{tag}</button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(service => (
                            <a key={service.name} href={service.url} target="_blank" rel="noopener noreferrer"
                                className="group p-4 bg-gray-700 hover:bg-gray-600 rounded-xl transition border border-gray-600 hover:border-green-500">
                                <div className="flex items-start gap-3">
                                    <span className="text-3xl">{service.icon}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold group-hover:text-green-400 transition">{service.name}</h4>
                                            {service.free && <span className="text-xs bg-green-600/30 text-green-400 px-1.5 py-0.5 rounded">Free</span>}
                                        </div>
                                        <p className="text-sm text-gray-400 mt-1">{service.description}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {service.tags.map(tag => (
                                                <span key={tag} className="text-xs bg-gray-600 px-1.5 py-0.5 rounded">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-gray-500 group-hover:text-white transition">↗</span>
                                </div>
                            </a>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-8 text-gray-500">No matching tools found</div>
                    )}
                </div>
            </div>
        </div>
    );
}
