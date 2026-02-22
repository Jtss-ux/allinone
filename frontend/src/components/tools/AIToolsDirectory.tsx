'use client';

import React, { useState } from 'react';

interface AITool {
    id: number;
    name: string;
    category: string;
    link: string;
    description: string;
    icon: string;
    free: boolean;
    hasApi: boolean;
    tags: string[];
}

const AI_TOOLS: AITool[] = [
    // --- Text-to-Video ---
    { id: 1, name: 'Pika', category: 'Text-to-Video', link: 'https://pika.art', description: 'Cinematic clips from text prompts with free tier', icon: '🎬', free: true, hasApi: false, tags: ['Video', 'Cinematic', 'Free Tier'] },
    { id: 2, name: 'Runway Gen-2', category: 'Text-to-Video', link: 'https://runwayml.com', description: 'Studio-grade video generation with free credits on signup', icon: '🎥', free: true, hasApi: true, tags: ['Video', 'Studio', 'Credits'] },
    { id: 3, name: 'Luma Dream Machine', category: 'Text-to-Video', link: 'https://lumalabs.ai/dream-machine', description: 'Realistic motion with daily free credits', icon: '✨', free: true, hasApi: false, tags: ['Video', 'Realistic', 'Daily Credits'] },
    { id: 4, name: 'Kling AI', category: 'Text-to-Video', link: 'https://klingai.com', description: 'Long cinematic shots with strong realism', icon: '🎞️', free: false, hasApi: false, tags: ['Video', 'Cinematic', 'Long-form'] },
    { id: 5, name: 'Kaiber AI', category: 'Text-to-Video', link: 'https://kaiber.ai', description: 'AI-powered music videos and creative visual styles', icon: '🎵', free: false, hasApi: true, tags: ['Video', 'Music Video', 'Creative'] },

    // --- Open-Source Video Models ---
    { id: 6, name: 'Open-Sora 2.0', category: 'Open-Source Video', link: 'https://github.com/hpcaitech/Open-Sora', description: '11B params, fully open-source, $200K to train', icon: '🔓', free: true, hasApi: false, tags: ['Open-Source', 'Video', 'Self-Host'] },
    { id: 7, name: 'HunyuanVideo', category: 'Open-Source Video', link: 'https://hunyuan.tencent.com', description: "Tencent's open-source video model", icon: '🀄', free: true, hasApi: false, tags: ['Open-Source', 'Video', 'Tencent'] },
    { id: 8, name: 'Mochi 1', category: 'Open-Source Video', link: 'https://genmo.ai', description: '10B params, Apache 2.0, smooth 30 FPS output', icon: '🍡', free: true, hasApi: false, tags: ['Open-Source', 'Video', '30FPS'] },
    { id: 9, name: 'LTX-Video', category: 'Open-Source Video', link: 'https://github.com/Lightricks/LTX-Video', description: 'Fastest open-source video model, runs on 12GB VRAM', icon: '⚡', free: true, hasApi: true, tags: ['Open-Source', 'Video', 'Fast', '12GB'] },
    { id: 10, name: 'CogVideoX', category: 'Open-Source Video', link: 'https://github.com/THUDM/CogVideo', description: 'Beginner-friendly, runs on 8-12GB VRAM', icon: '🧠', free: true, hasApi: false, tags: ['Open-Source', 'Video', 'Beginner'] },
    { id: 11, name: 'Wan 2.1', category: 'Open-Source Video', link: 'https://github.com/Wan-Video/Wan2.1', description: 'Top benchmarks with efficient hardware usage', icon: '🏆', free: true, hasApi: false, tags: ['Open-Source', 'Video', 'Efficient'] },
    { id: 12, name: 'Pyramid Flow', category: 'Open-Source Video', link: 'https://pyramid-flow.github.io', description: 'ICLR 2025 paper — progressive generation approach', icon: '🔺', free: true, hasApi: false, tags: ['Open-Source', 'Video', 'Research'] },
    { id: 13, name: 'SkyReels V2', category: 'Open-Source Video', link: 'https://skyreels.ai', description: 'Infinite-length video generation', icon: '🌌', free: true, hasApi: false, tags: ['Open-Source', 'Video', 'Infinite'] },

    // --- Specialized Video ---
    { id: 14, name: 'Reeroll', category: 'Specialized Video', link: 'https://reeroll.com', description: 'Text to motion graphics templates', icon: '🎨', free: false, hasApi: false, tags: ['Video', 'Motion Graphics', 'Templates'] },
    { id: 15, name: 'Golpo AI', category: 'Specialized Video', link: 'https://video.golpoai.com', description: 'Whiteboard explainer videos from text or PDF', icon: '📋', free: true, hasApi: false, tags: ['Video', 'Whiteboard', 'Explainer'] },
    { id: 16, name: 'Boba AI', category: 'Specialized Video', link: 'https://boba.video', description: 'Anime-style video generation with lip-sync', icon: '🍵', free: false, hasApi: false, tags: ['Video', 'Anime', 'Lip-Sync'] },
    { id: 17, name: 'Hera', category: 'Specialized Video', link: 'https://hera.video', description: 'AI-powered motion design assistant', icon: '🎭', free: false, hasApi: false, tags: ['Video', 'Motion Design', 'AI'] },
    { id: 18, name: 'Bazaar', category: 'Specialized Video', link: 'https://bazaar.it', description: 'Turns app screenshots into polished demo videos', icon: '📱', free: false, hasApi: false, tags: ['Video', 'Demo', 'App'] },

    // --- Blog/Article to Video ---
    { id: 19, name: 'Lumen5', category: 'Blog to Video', link: 'https://lumen5.com', description: 'Paste a URL, get a video — AI blog-to-video converter', icon: '📰', free: true, hasApi: false, tags: ['Video', 'Blog', 'Content'] },

    // --- 3D Generation ---
    { id: 20, name: 'Marble', category: '3D Generation', link: 'https://marble.worldlabs.ai', description: 'Explorable 3D environments from text descriptions', icon: '🌍', free: false, hasApi: false, tags: ['3D', 'Environment', 'Text-to-3D'] },
    { id: 21, name: 'Shap-E', category: '3D Generation', link: 'https://github.com/openai/shap-e', description: "OpenAI's 3D object generator from text or images", icon: '🧊', free: true, hasApi: false, tags: ['3D', 'OpenAI', 'Open-Source'] },

    // --- Run AI Locally ---
    { id: 22, name: 'Ollama', category: 'Run AI Locally', link: 'https://ollama.com', description: 'Run LLMs locally with a huge model library', icon: '🦙', free: true, hasApi: true, tags: ['Local AI', 'LLM', 'Self-Host'] },
    { id: 23, name: 'Stability Matrix', category: 'Run AI Locally', link: 'https://github.com/LykosAI/StabilityMatrix', description: 'One-click installer for Stable Diffusion UIs', icon: '🎯', free: true, hasApi: false, tags: ['Local AI', 'Stable Diffusion', 'Installer'] },
    { id: 24, name: 'Pinokio', category: 'Run AI Locally', link: 'https://pinokio.co', description: 'Run any AI app with a single click', icon: '🤖', free: true, hasApi: false, tags: ['Local AI', 'One-Click', 'Universal'] },

    // --- Open-Source Editors ---
    { id: 25, name: 'ComfyUI', category: 'Open-Source Editors', link: 'https://comfy.org', description: 'Node-based UI for video, image, and audio generation', icon: '🔗', free: true, hasApi: false, tags: ['Editor', 'Node-based', 'Open-Source'] },
    { id: 26, name: 'Motionity', category: 'Open-Source Editors', link: 'https://github.com/alyssaxuu/motionity', description: 'After Effects meets Canva — free web motion editor', icon: '🎬', free: true, hasApi: false, tags: ['Editor', 'Motion', 'Free'] },

    // --- Image Editing ---
    { id: 27, name: 'Qwen Image Edit', category: 'Image Editing', link: 'https://huggingface.co/Qwen/Qwen-Image-Edit-2511', description: 'Instruction-based image editing with natural language', icon: '✏️', free: true, hasApi: true, tags: ['Image', 'Editing', 'AI'] },
    { id: 28, name: 'Generative Refocusing', category: 'Image Editing', link: 'https://github.com/rayray9999/Genfocus', description: 'AI depth-of-field and bokeh effects', icon: '📷', free: true, hasApi: false, tags: ['Image', 'Depth', 'Bokeh'] },
    { id: 29, name: 'AnyX / AniX', category: 'Image Editing', link: 'https://github.com/snowflakewang/AniX', description: 'AI style transfer between images', icon: '🎨', free: true, hasApi: false, tags: ['Image', 'Style Transfer', 'Open-Source'] },

    // --- Portrait/Character Video ---
    { id: 30, name: 'Flash Portrait', category: 'Portrait Video', link: 'https://github.com/Francis-Rings/FlashPortrait', description: 'Talking head animation from a single photo', icon: '🗣️', free: true, hasApi: false, tags: ['Portrait', 'Talking Head', 'Animation'] },
    { id: 31, name: 'StoryMem', category: 'Portrait Video', link: 'https://github.com/Kevin-thu/StoryMem', description: 'Consistent characters across video frames', icon: '📖', free: true, hasApi: false, tags: ['Portrait', 'Consistent', 'Story'] },
    { id: 32, name: 'InfCam', category: 'Portrait Video', link: 'https://github.com/emjay73/InfCam', description: 'AI camera motion control for video', icon: '🎥', free: true, hasApi: false, tags: ['Video', 'Camera', 'Motion'] },

    // --- Open LLMs ---
    { id: 33, name: 'Minimax M2.1', category: 'Open LLMs', link: 'https://huggingface.co/MiniMaxAI/MiniMax-M2.1', description: 'Multimodal reasoning LLM, open-source', icon: '🤖', free: true, hasApi: true, tags: ['LLM', 'Multimodal', 'Open-Source'] },

    // --- AI Photo Enhancement ---
    { id: 34, name: 'Remini', category: 'AI Photo Enhancement', link: 'https://remini.ai', description: 'Restore old photos and enhance faces with AI', icon: '✨', free: true, hasApi: false, tags: ['Photo', 'Enhance', 'Restore'] },
    { id: 35, name: 'VanceAI', category: 'AI Photo Enhancement', link: 'https://vanceai.com', description: 'AI image upscaler, denoiser, and sharpener', icon: '📐', free: true, hasApi: true, tags: ['Photo', 'Upscale', 'Denoise'] },
    { id: 36, name: 'Topaz Photo AI', category: 'AI Photo Enhancement', link: 'https://topazlabs.com', description: 'Professional noise removal, sharpening, upscaling', icon: '💎', free: false, hasApi: false, tags: ['Photo', 'Professional', 'Desktop'] },
    { id: 37, name: "Let's Enhance", category: 'AI Photo Enhancement', link: 'https://letsenhance.io', description: 'AI upscaling up to 16x resolution', icon: '🔍', free: true, hasApi: true, tags: ['Photo', 'Upscale', '16x'] },
    { id: 38, name: 'Fotor', category: 'AI Photo Enhancement', link: 'https://fotor.com', description: 'All-in-one online photo editor with AI tools', icon: '🖼️', free: true, hasApi: false, tags: ['Photo', 'Editor', 'All-in-One'] },
    { id: 39, name: 'BeFunky', category: 'AI Photo Enhancement', link: 'https://befunky.com', description: 'Photo editor, collage maker, and graphic designer', icon: '🎭', free: true, hasApi: false, tags: ['Photo', 'Collage', 'Design'] },
    { id: 40, name: 'PicWish', category: 'AI Photo Enhancement', link: 'https://picwish.com', description: 'AI background remover and photo enhancer', icon: '🪄', free: true, hasApi: true, tags: ['Photo', 'Background', 'Remove'] },
    { id: 41, name: 'Luminar Neo', category: 'AI Photo Enhancement', link: 'https://skylum.com/luminar', description: 'AI photo editor for creators and photographers', icon: '🌟', free: false, hasApi: false, tags: ['Photo', 'Pro', 'Desktop'] },
    { id: 42, name: 'Cutout.pro', category: 'AI Photo Enhancement', link: 'https://cutout.pro', description: 'AI cutout, bg removal, and face enhancement', icon: '✂️', free: true, hasApi: true, tags: ['Photo', 'Cutout', 'Background'] },
    { id: 43, name: 'HitPaw Photo Enhancer', category: 'AI Photo Enhancement', link: 'https://hitpaw.com/photo-enhancer.html', description: 'One-click AI enhancement with 4 AI models', icon: '🐾', free: false, hasApi: false, tags: ['Photo', 'One-Click', '4 Models'] },

    // --- Virtual Photo Booths ---
    { id: 44, name: 'Simple Booth', category: 'Photo Booths', link: 'https://simplebooth.com', description: 'Virtual and live photo booth for events', icon: '📷', free: false, hasApi: false, tags: ['Booth', 'Events', 'Live'] },
    { id: 45, name: 'Sparkbooth', category: 'Photo Booths', link: 'https://sparkbooth.com', description: 'Customizable photo booth software', icon: '✨', free: false, hasApi: false, tags: ['Booth', 'Software', 'Custom'] },
    { id: 46, name: 'dslrBooth', category: 'Photo Booths', link: 'https://dslrbooth.com', description: 'Professional DSLR photo booth with sharing', icon: '📸', free: false, hasApi: false, tags: ['Booth', 'DSLR', 'Pro'] },
    { id: 47, name: 'Snappic', category: 'Photo Booths', link: 'https://snappic.com', description: 'Photo booth platform with AI filters', icon: '🤳', free: false, hasApi: false, tags: ['Booth', 'AI Filters', 'Brand'] },
];

const CATEGORIES = [
    'All',
    'Text-to-Video',
    'Open-Source Video',
    'Specialized Video',
    'Blog to Video',
    '3D Generation',
    'Run AI Locally',
    'Open-Source Editors',
    'Image Editing',
    'Portrait Video',
    'Open LLMs',
    'AI Photo Enhancement',
    'Photo Booths',
];

export default function AIToolsDirectory() {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [filterType, setFilterType] = useState<'all' | 'free' | 'api'>('all');

    const filtered = AI_TOOLS.filter(tool => {
        const matchesSearch = !search ||
            tool.name.toLowerCase().includes(search.toLowerCase()) ||
            tool.description.toLowerCase().includes(search.toLowerCase()) ||
            tool.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;
        const matchesFilter = filterType === 'all' ||
            (filterType === 'free' && tool.free) ||
            (filterType === 'api' && tool.hasApi);
        return matchesSearch && matchesCategory && matchesFilter;
    });

    const categoryCount = (cat: string) =>
        cat === 'All' ? AI_TOOLS.length : AI_TOOLS.filter(t => t.category === cat).length;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl">
                            🧠
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white">AI Tools Directory</h2>
                            <p className="text-purple-200 mt-1">
                                {AI_TOOLS.length} tools for video generation, image editing, 3D, and local AI
                            </p>
                        </div>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-white">{AI_TOOLS.filter(t => t.category.includes('Video')).length}</div>
                            <div className="text-xs text-purple-200">Video Tools</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-white">{AI_TOOLS.filter(t => t.category.includes('Image')).length}</div>
                            <div className="text-xs text-purple-200">Image Tools</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-white">{AI_TOOLS.filter(t => t.free).length}</div>
                            <div className="text-xs text-purple-200">Free Tools</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-white">{AI_TOOLS.filter(t => t.hasApi).length}</div>
                            <div className="text-xs text-purple-200">With API</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-6 border-b border-gray-700 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search tools by name, description, or tag..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                        />
                    </div>

                    {/* Quick filter buttons */}
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterType === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            All Tools
                        </button>
                        <button
                            onClick={() => setFilterType('free')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterType === 'free' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            🆓 Free Only
                        </button>
                        <button
                            onClick={() => setFilterType('api')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterType === 'api' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            🔌 Has API
                        </button>
                    </div>

                    {/* Category tabs */}
                    <div className="flex gap-2 flex-wrap">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${activeCategory === cat
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                {cat} ({categoryCount(cat)})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tools Grid */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map(tool => (
                            <a
                                key={tool.id}
                                href={tool.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative p-5 bg-gray-750 hover:bg-gray-700 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20 hover:-translate-y-0.5"
                                style={{ backgroundColor: 'rgba(31, 41, 55, 0.8)' }}
                            >
                                {/* Badges */}
                                <div className="absolute top-3 right-3 flex gap-1.5">
                                    {tool.free && (
                                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-semibold border border-green-500/30">
                                            FREE
                                        </span>
                                    )}
                                    {tool.hasApi && (
                                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-semibold border border-blue-500/30">
                                            API
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gray-700 group-hover:bg-gray-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition">
                                        {tool.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-white group-hover:text-purple-300 transition truncate pr-16">
                                            {tool.name}
                                        </h4>
                                        <p className="text-xs text-purple-400 mt-0.5">{tool.category}</p>
                                        <p className="text-sm text-gray-400 mt-2 line-clamp-2">{tool.description}</p>
                                        <div className="flex flex-wrap gap-1 mt-3">
                                            {tool.tags.slice(0, 3).map(tag => (
                                                <span key={tag} className="text-[10px] bg-gray-700/80 text-gray-400 px-2 py-0.5 rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Hover action indicator */}
                                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition">
                                    <span className="text-xs text-purple-400 flex items-center gap-1">
                                        Visit ↗
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">🔍</div>
                            <p className="text-gray-400 text-lg">No tools match your search</p>
                            <button
                                onClick={() => { setSearch(''); setActiveCategory('All'); setFilterType('all'); }}
                                className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}

                    {/* Footer stats */}
                    <div className="mt-8 p-4 bg-gray-900/50 rounded-xl border border-gray-700 text-center">
                        <p className="text-gray-400 text-sm">
                            Showing <span className="text-white font-semibold">{filtered.length}</span> of{' '}
                            <span className="text-white font-semibold">{AI_TOOLS.length}</span> tools
                            {activeCategory !== 'All' && (
                                <span> in <span className="text-purple-400">{activeCategory}</span></span>
                            )}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                            Tools with API badges are integrated into the platform&apos;s backend failover system
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
