'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { backendApi } from '@/config/api';
import { jsPDF } from "jspdf";

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
    imageUrl?: string;
    isGeneratingImage?: boolean;
    imageError?: string;
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

    const generateImageForSlide = async (index: number) => {
        const slide = slides[index];
        if (!slide || slide.imageUrl || slide.isGeneratingImage) return;

        setSlides(prev => {
            const next = [...prev];
            next[index] = { ...next[index], isGeneratingImage: true, imageError: undefined };
            return next;
        });

        try {
            const prompt = getImagePrompt(slide);
            const response = await axios.post(backendApi('/api/image/generate'), {
                prompt,
                width: 1024,
                height: 576, // 16:9 aspect ratio
                num_inference_steps: 20,
                provider: 'midjourney'
            });

            if (response.data.success && response.data.imageUrl) {
                setSlides(prev => {
                    const next = [...prev];
                    next[index] = { ...next[index], imageUrl: response.data.imageUrl, isGeneratingImage: false };
                    return next;
                });
            } else {
                throw new Error('Failed to generate image');
            }
        } catch (err: any) {
            setSlides(prev => {
                const next = [...prev];
                next[index] = { ...next[index], imageError: err.message || 'Image generation failed', isGeneratingImage: false };
                return next;
            });
        }
    };

    React.useEffect(() => {
        if (slides.length > 0) {
            generateImageForSlide(currentSlide);
        }
    }, [currentSlide, slides.length]);

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

    const exportAsPDF = () => {
        const t = template;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'in', format: [10, 5.625] });

        slides.forEach((slide, i) => {
            if (i > 0) doc.addPage();
            // Background
            doc.setFillColor(t.colors.bg);
            doc.rect(0, 0, 10, 5.625, 'F');

            // Title
            doc.setTextColor(t.colors.accent);
            doc.setFontSize(28);
            doc.text(slide.title, 0.8, 1);

            // Line
            doc.setDrawColor(t.colors.accent);
            doc.setLineWidth(0.05);
            doc.line(0.8, 1.2, 9.2, 1.2);

            // Content
            doc.setTextColor(t.colors.text);
            doc.setFontSize(16);
            let y = 1.8;
            slide.content.forEach(point => {
                doc.text(`> ${point}`, 0.8, y);
                y += 0.4;
            });

            // Page Number
            doc.setFontSize(10);
            doc.text(`${i + 1} / ${slides.length}`, 9, 5.2);
        });

        doc.save(`${topic.replace(/[^a-z0-9]/gi, '_')}_presentation.pdf`);
    };

    const exportAsPPTX = async () => {
        const t = template;
        // Load pptxgenjs from CDN to bypass Next.js Webpack node:fs issues
        if (!(window as any).PptxGenJS) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = "https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js";
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        }
        const pptxgen = (window as any).PptxGenJS;
        let pptx = new pptxgen();
        pptx.layout = 'LAYOUT_16x9';

        slides.forEach((slide, i) => {
            let pptSlide = pptx.addSlide();
            pptSlide.background = { color: t.colors.bg.replace('#', '') };

            pptSlide.addText(slide.title, {
                x: 0.5, y: 0.5, w: 9, h: 1,
                fontSize: 32, color: t.colors.accent.replace('#', ''), bold: true
            });

            let shapeFormat = { x: 0.5, y: 1.4, w: 9, h: 0.05, fill: { color: t.colors.accent.replace('#', '') } };
            pptSlide.addShape(pptx.ShapeType.rect, shapeFormat);

            let contentText = slide.content.map(point => ({ text: point, options: { bullet: true } }));
            pptSlide.addText(contentText as any, {
                x: 0.5, y: 1.8, w: 9, h: 3,
                fontSize: 18, color: t.colors.text.replace('#', ''), align: 'left', valign: 'top'
            });

            pptSlide.addText(`${i + 1} / ${slides.length}`, {
                x: 8.5, y: 5.0, w: 1, h: 0.5, fontSize: 12, color: t.colors.text.replace('#', ''), align: 'right'
            });

            if (slide.notes) {
                pptSlide.addNotes(slide.notes);
            }
        });

        pptx.writeFile({ fileName: `${topic.replace(/[^a-z0-9]/gi, '_')}_presentation.pptx` });
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
                                    <button onClick={exportAsText} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition font-medium">
                                        ⬇️ .MD
                                    </button>
                                    <button onClick={exportAsHTML} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm transition font-medium">
                                        ⬇️ .HTML
                                    </button>
                                    <button onClick={exportAsPDF} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm transition font-medium">
                                        ⬇️ .PDF
                                    </button>
                                    <button onClick={exportAsPPTX} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 rounded text-sm transition font-medium">
                                        ⬇️ .PPTX
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
                                    className="rounded-xl overflow-hidden border-2 border-gray-600 relative bg-gray-900 min-h-[400px] md:min-h-[500px]"
                                >
                                    {/* Auto-generated Image Display Only */}
                                    <div className="w-full h-full relative flex items-center justify-center p-2 bg-black/40">
                                        {slides[currentSlide].imageUrl ? (
                                            <img
                                                src={slides[currentSlide].imageUrl}
                                                alt={slides[currentSlide].title}
                                                className="w-full h-auto object-contain max-h-[70vh] rounded drop-shadow-2xl"
                                            />
                                        ) : slides[currentSlide].isGeneratingImage ? (
                                            <div className="flex flex-col items-center justify-center text-gray-400 space-y-4 py-32">
                                                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                                <div className="text-sm font-medium animate-pulse">🖌️ AI is drawing the perfect scene...</div>
                                                <div className="text-xs opacity-60 text-center max-w-[80%]">Generating picture for: {slides[currentSlide].title}</div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-gray-500 py-32">
                                                <div className="text-4xl mb-4">🖼️</div>
                                                {slides[currentSlide].imageError ? (
                                                    <div className="text-center text-red-400 text-sm px-4">
                                                        <div className="font-bold mb-1">Generation failed</div>
                                                        <div className="text-xs opacity-70 mb-4">{slides[currentSlide].imageError}</div>
                                                        <button
                                                            onClick={() => generateImageForSlide(currentSlide)}
                                                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded mt-2 text-sm transition border border-gray-600 text-white"
                                                        >
                                                            Try Again
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => generateImageForSlide(currentSlide)}
                                                        className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium transition"
                                                    >
                                                        Generate Slide Image
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        <div className="absolute bottom-4 right-6 text-sm text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm z-10">
                                            {currentSlide + 1} / {slides.length}
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
