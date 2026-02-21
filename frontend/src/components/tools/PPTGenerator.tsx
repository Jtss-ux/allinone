'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';

// =============================================
// PPT TEMPLATES — including Whiteboard Master
// =============================================
const PPT_TEMPLATES = [
    {
        id: 'whiteboard',
        name: '📋 Realistic Whiteboard',
        description: 'Hand-drawn marker style on authentic whiteboard',
        promptPrefix: `Create a realistic whiteboard-style presentation slide. Visual Style: The background must be an authentic whiteboard with faint marker residue, smudges, and realistic light reflections. Writing should look like energetic hand-drawn marker ink in Black (main text), Blue (headers), Red (emphasis), Green (positive points). Use consistent handwritten font, hand-drawn diagrams, arrows, circles, and simple line-art icons.`,
        colors: { bg: '#f5f0e8', accent: '#2563eb', text: '#1a1a2e' },
    },
    {
        id: 'modern-dark',
        name: '🌙 Modern Dark',
        description: 'Sleek dark theme with gradient accents',
        promptPrefix: 'Create a sleek, modern dark-themed presentation slide with gradient blue-purple accents, clean sans-serif typography, and minimalist layout.',
        colors: { bg: '#0f172a', accent: '#8b5cf6', text: '#e2e8f0' },
    },
    {
        id: 'corporate',
        name: '🏢 Corporate Clean',
        description: 'Professional business presentation style',
        promptPrefix: 'Create a clean corporate presentation slide with professional blue color scheme, structured layout with clear hierarchy, and business-appropriate icons.',
        colors: { bg: '#ffffff', accent: '#1d4ed8', text: '#1e293b' },
    },
    {
        id: 'creative',
        name: '🎨 Creative Splash',
        description: 'Bold colors with artistic flair',
        promptPrefix: 'Create a vibrant creative presentation slide with bold colors, artistic elements, playful typography, and dynamic layout with visual energy.',
        colors: { bg: '#fef3c7', accent: '#f59e0b', text: '#1c1917' },
    },
    {
        id: 'minimalist',
        name: '⬜ Minimalist',
        description: 'Clean white with maximum whitespace',
        promptPrefix: 'Create an ultra-minimalist presentation slide with lots of whitespace, thin elegant typography, subtle gray accents, and clean geometric elements.',
        colors: { bg: '#ffffff', accent: '#6b7280', text: '#111827' },
    },
    {
        id: 'tech',
        name: '💻 Tech/Startup',
        description: 'Modern tech startup pitch deck style',
        promptPrefix: 'Create a modern tech startup presentation slide with neon-on-dark styling, code-inspired elements, geometric shapes, and futuristic feel.',
        colors: { bg: '#0a0a0a', accent: '#22d3ee', text: '#f0fdf4' },
    },
];

interface Slide {
    title: string;
    content: string[];
    notes: string;
    layout: string;
}

export default function PPTGenerator() {
    const [topic, setTopic] = useState('');
    const [numSlides, setNumSlides] = useState(8);
    const [selectedTemplate, setSelectedTemplate] = useState('whiteboard');
    const [loading, setLoading] = useState(false);
    const [slides, setSlides] = useState<Slide[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [error, setError] = useState('');
    const [provider, setProvider] = useState('');
    const [customInstructions, setCustomInstructions] = useState('');

    const template = PPT_TEMPLATES.find(t => t.id === selectedTemplate) || PPT_TEMPLATES[0];

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic for your presentation');
            return;
        }

        setLoading(true);
        setError('');
        setSlides([]);
        setCurrentSlide(0);

        try {
            const response = await axios.post(backendApi('/api/ppt/generate'), {
                topic,
                numSlides,
                template: selectedTemplate,
                customInstructions,
            });

            if (response.data.success && response.data.slides) {
                setSlides(response.data.slides);
                setProvider(response.data.provider || '');
            } else {
                setError(response.data.error || 'Failed to generate presentation');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to generate presentation');
        } finally {
            setLoading(false);
        }
    };

    const exportAsText = () => {
        let text = `# ${topic}\n\n`;
        slides.forEach((slide, i) => {
            text += `---\n## Slide ${i + 1}: ${slide.title}\n\n`;
            slide.content.forEach(point => {
                text += `• ${point}\n`;
            });
            if (slide.notes) text += `\nSpeaker Notes: ${slide.notes}\n`;
            text += '\n';
        });
        const blob = new Blob([text], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${topic.replace(/[^a-z0-9]/gi, '_')}_presentation.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportAsHTML = () => {
        const t = template;
        let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${topic}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', sans-serif; }
  .slide { width: 100%; min-height: 100vh; padding: 60px 80px; display: flex; flex-direction: column; justify-content: center; background: ${t.colors.bg}; color: ${t.colors.text}; page-break-after: always; }
  .slide h1 { font-size: 2.5em; color: ${t.colors.accent}; margin-bottom: 30px; border-bottom: 3px solid ${t.colors.accent}; padding-bottom: 15px; }
  .slide ul { font-size: 1.3em; list-style: none; }
  .slide li { margin: 15px 0; padding-left: 25px; position: relative; }
  .slide li::before { content: "▸"; position: absolute; left: 0; color: ${t.colors.accent}; font-weight: bold; }
  .slide-num { position: absolute; bottom: 20px; right: 40px; font-size: 0.9em; opacity: 0.5; }
  @media print { .slide { height: 100vh; } }
</style></head><body>`;

        slides.forEach((slide, i) => {
            html += `<div class="slide"><h1>${slide.title}</h1><ul>`;
            slide.content.forEach(point => { html += `<li>${point}</li>`; });
            html += `</ul><div class="slide-num">${i + 1} / ${slides.length}</div></div>`;
        });

        html += '</body></html>';
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${topic.replace(/[^a-z0-9]/gi, '_')}_presentation.html`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getImagePrompt = (slide: Slide) => {
        return `${template.promptPrefix}\nContent: Title: "${slide.title}". Layout: ${slide.layout || 'centered'}. Points: ${slide.content.join('; ')}`;
    };

    const copyPrompt = (slide: Slide) => {
        navigator.clipboard.writeText(getImagePrompt(slide));
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 p-6">
                    <div className="flex items-center gap-3">
                        <div className="text-4xl">📊</div>
                        <div>
                            <h3 className="text-2xl font-bold">AI Presentation Generator</h3>
                            <p className="text-sm text-gray-200">Generate professional slide decks with AI — includes whiteboard, corporate, and creative templates</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Topic */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Presentation Topic</label>
                        <textarea
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="E.g., Introduction to Machine Learning, Quarterly Business Review, Climate Change Awareness..."
                            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
                            rows={2}
                        />
                    </div>

                    {/* Template Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-3">Slide Template</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {PPT_TEMPLATES.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedTemplate(t.id)}
                                    className={`p-3 rounded-lg border-2 text-left transition ${selectedTemplate === t.id
                                            ? 'border-orange-500 bg-orange-500/10'
                                            : 'border-gray-600 hover:border-gray-500 bg-gray-700'
                                        }`}
                                >
                                    <div className="font-semibold text-sm">{t.name}</div>
                                    <div className="text-xs text-gray-400 mt-1">{t.description}</div>
                                    {/* Color preview */}
                                    <div className="flex gap-1 mt-2">
                                        <div className="w-4 h-4 rounded-full border border-gray-500" style={{ background: t.colors.bg }} />
                                        <div className="w-4 h-4 rounded-full" style={{ background: t.colors.accent }} />
                                        <div className="w-4 h-4 rounded-full" style={{ background: t.colors.text }} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Settings row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Number of Slides: {numSlides}</label>
                            <input
                                type="range"
                                min="4"
                                max="20"
                                value={numSlides}
                                onChange={(e) => setNumSlides(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Custom Instructions (optional)</label>
                            <input
                                type="text"
                                value={customInstructions}
                                onChange={(e) => setCustomInstructions(e.target.value)}
                                placeholder="E.g., Focus on statistics, add humor, make it suitable for students..."
                                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-900 text-red-100 rounded-lg text-sm">{error}</div>
                    )}

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition disabled:opacity-50 text-lg"
                    >
                        {loading ? '📊 Generating Presentation...' : '📊 Generate Presentation'}
                    </button>

                    {/* Slide Preview */}
                    {slides.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold">📊 Generated Slides ({slides.length})</h4>
                                <div className="flex gap-2">
                                    {provider && (
                                        <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-400">via {provider}</span>
                                    )}
                                    <button onClick={exportAsText} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition">
                                        ⬇️ Download .md
                                    </button>
                                    <button onClick={exportAsHTML} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm transition">
                                        ⬇️ Download .html
                                    </button>
                                </div>
                            </div>

                            {/* Slide navigator */}
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {slides.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentSlide(i)}
                                        className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition ${currentSlide === i ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            {/* Current slide preview */}
                            {slides[currentSlide] && (
                                <div
                                    className="rounded-xl overflow-hidden border-2 border-gray-600"
                                    style={{ background: template.colors.bg, color: template.colors.text }}
                                >
                                    <div className="aspect-[16/9] p-8 md:p-12 flex flex-col justify-center relative">
                                        <h2
                                            className="text-2xl md:text-3xl font-bold mb-6"
                                            style={{ color: template.colors.accent, borderBottom: `3px solid ${template.colors.accent}`, paddingBottom: '12px' }}
                                        >
                                            {slides[currentSlide].title}
                                        </h2>
                                        <ul className="space-y-3 text-base md:text-lg">
                                            {slides[currentSlide].content.map((point, pi) => (
                                                <li key={pi} className="flex items-start gap-3">
                                                    <span style={{ color: template.colors.accent }} className="font-bold mt-0.5">▸</span>
                                                    <span>{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="absolute bottom-4 right-6 text-sm opacity-40">
                                            {currentSlide + 1} / {slides.length}
                                        </div>
                                    </div>

                                    {/* Notes + Image Prompt */}
                                    <div className="bg-gray-900 p-4 border-t border-gray-700 space-y-3">
                                        {slides[currentSlide].notes && (
                                            <div>
                                                <span className="text-xs font-semibold text-gray-400">Speaker Notes:</span>
                                                <p className="text-sm text-gray-300 mt-1">{slides[currentSlide].notes}</p>
                                            </div>
                                        )}
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-gray-400">🎨 Image Gen Prompt (for Midjourney/DALL-E):</span>
                                                <button
                                                    onClick={() => copyPrompt(slides[currentSlide])}
                                                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition"
                                                >
                                                    📋 Copy Prompt
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 break-words">{getImagePrompt(slides[currentSlide]).substring(0, 200)}...</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="flex justify-between">
                                <button
                                    onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                                    disabled={currentSlide === 0}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 rounded-lg transition"
                                >
                                    ← Previous
                                </button>
                                <button
                                    onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                                    disabled={currentSlide === slides.length - 1}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 rounded-lg transition"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
