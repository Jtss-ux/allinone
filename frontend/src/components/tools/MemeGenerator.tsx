'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { mlApi, mlAssetUrl } from '@/config/api';

interface MemeTemplate {
  id: string;
  name: string;
  icon: string;
  topText: string;
  bottomText: string;
  defaultImage: string;
}

const memeTemplates: MemeTemplate[] = [
  { id: 'drake', name: 'Drake', icon: '👨🏿', topText: 'Thing I hate', bottomText: 'Thing I love', defaultImage: '' },
  { id: 'skibidi', name: 'Skibidi', icon: '🚽', topText: 'Brainrot', bottomText: 'Everything', defaultImage: '' },
  { id: 'sigma', name: 'Sigma Male', icon: '😎', topText: 'Being normal', bottomText: 'Being sigma', defaultImage: '' },
  { id: 'ohio', name: 'Ohio', icon: '🌽', topText: 'What happens in', bottomText: 'Stays in ohio', defaultImage: '' },
  { id: 'rizz', name: 'Rizz', icon: '✨', topText: 'No rizz', bottomText: 'Full rizz', defaultImage: '' },
  { id: 'chad', name: 'Chad', icon: '💪', topText: 'Average guy', bottomText: 'Chad', defaultImage: '' },
  { id: 'npc', name: 'NPC', icon: '🤖', topText: 'Real person', bottomText: 'NPC moment', defaultImage: '' },
  { id: 'based', name: 'Based', icon: '👍', topText: 'Unpopular opinion', bottomText: 'Based!', defaultImage: '' },
  { id: 'cringe', name: 'Cringe', icon: '😬', topText: 'My code', bottomText: 'My personality', defaultImage: '' },
  { id: 'amogus', name: 'Amogus', icon: '👽', topText: 'Sus', bottomText: 'AMOGUS', defaultImage: '' },
  { id: 'girlmath', name: 'Girl Math', icon: '🧮', topText: '$50?', bottomText: 'Free!', defaultImage: '' },
  { id: 'pookie', name: 'Pookie', icon: '🧸', topText: 'My crush', bottomText: 'My pookie', defaultImage: '' },
];

const textStyles = [
  { id: 'impact', name: 'Impact', font: 'Impact, sans-serif', effect: 'uppercase' },
  { id: 'classic', name: 'Classic', font: 'Arial Black, sans-serif', effect: 'uppercase' },
  { id: 'brainrot', name: 'Brainrot', font: 'Comic Sans MS, cursive', effect: 'lowercase' },
  { id: 'aesthetic', name: 'Aesthetic', font: 'Courier New, monospace', effect: 'lowercase' },
];

export default function MemeGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate>(memeTemplates[0]);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [textStyle, setTextStyle] = useState('impact');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectTemplate = (template: MemeTemplate) => {
    setSelectedTemplate(template);
    setTopText(template.topText);
    setBottomText(template.bottomText);
    setGeneratedImage(null);
  };

  const generateMeme = async () => {
    if (!topText && !bottomText) {
      setError('Please add some text!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate image with meme text using AI
      const prompt = `${selectedTemplate.name} meme format: "${topText}" on top, "${bottomText}" on bottom. Classic meme style, white text with black outline, yellow background or original template. Viral meme template.`;
      
      const response = await axios.post(mlApi('/api/image/generate'), {
        prompt,
        negative_prompt: 'blurry, low quality, distorted, ugly, text overlay, watermark',
        num_inference_steps: 20
      });
      
      if (response.data.success) {
        setGeneratedImage(response.data.imageBase64);
      }
    } catch (err: any) {
      // Fallback: Create meme using canvas
      createMemeCanvas();
    } finally {
      setLoading(false);
    }
  };

  const createMemeCanvas = () => {
    // Create meme using canvas (client-side)
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Yellow background (classic meme style)
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw top text
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.font = 'bold 40px Impact, sans-serif';
      ctx.strokeText(topText.toUpperCase(), canvas.width / 2, 50);
      ctx.fillText(topText.toUpperCase(), canvas.width / 2, 50);
      
      // Draw bottom text
      ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 30);
      ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 30);
      
      setGeneratedImage(canvas.toDataURL());
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 p-6">
          <h3 className="text-2xl font-bold">🧠 Brainrot Meme Generator</h3>
          <p className="text-gray-200">Create viral brainrot memes with custom text!</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left Panel - Templates */}
          <div className="p-4 border-r border-gray-700">
            <h4 className="font-semibold mb-3">🎭 Choose Template</h4>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {memeTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => selectTemplate(template)}
                  className={`p-2 rounded-lg text-center transition ${
                    selectedTemplate.id === template.id 
                      ? 'bg-green-600 ring-2 ring-green-400' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{template.icon}</div>
                  <div className="text-xs truncate">{template.name}</div>
                </button>
              ))}
            </div>

            {/* Text Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Top Text</label>
                <input
                  type="text"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder="Top text..."
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bottom Text</label>
                <input
                  type="text"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder="Bottom text..."
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                />
              </div>

              {/* Text Style */}
              <div>
                <label className="block text-sm font-medium mb-2">Text Style</label>
                <div className="grid grid-cols-4 gap-2">
                  {textStyles.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setTextStyle(style.id)}
                      className={`p-2 rounded-lg text-center transition ${
                        textStyle === style.id 
                          ? 'bg-purple-600' 
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      <span 
                        className="text-lg block"
                        style={{ 
                          fontFamily: style.font,
                          textTransform: style.effect as any
                        }}
                      >
                        Aa
                      </span>
                      <span className="text-xs">{style.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateMeme}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 rounded-lg font-bold transition disabled:opacity-50"
              >
                {loading ? '⏳ Generating...' : '🎲 Generate Meme'}
              </button>

              {error && <div className="p-2 bg-red-900 text-red-100 rounded text-sm">{error}</div>}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="p-4">
            <h4 className="font-semibold mb-3">👁️ Preview</h4>
            
            {/* Meme Preview Canvas */}
            <div className="aspect-square bg-yellow-400 rounded-lg overflow-hidden relative">
              {generatedImage ? (
                <img src={generatedImage} alt="Meme" className="w-full h-full object-contain" />
              ) : topText || bottomText ? (
                <div className="w-full h-full flex flex-col justify-between p-4 text-center">
                  <div 
                    className="text-white drop-shadow-lg"
                    style={{ 
                      fontFamily: textStyles.find(s => s.id === textStyle)?.font,
                      textTransform: textStyles.find(s => s.id === textStyle)?.effect as any,
                      fontSize: '28px',
                      fontWeight: 'bold',
                      WebkitTextStroke: '2px black'
                    }}
                  >
                    {topText || 'TOP TEXT'}
                  </div>
                  <div className="text-6xl">{selectedTemplate.icon}</div>
                  <div 
                    className="text-white drop-shadow-lg"
                    style={{ 
                      fontFamily: textStyles.find(s => s.id === textStyle)?.font,
                      textTransform: textStyles.find(s => s.id === textStyle)?.effect as any,
                      fontSize: '28px',
                      fontWeight: 'bold',
                      WebkitTextStroke: '2px black'
                    }}
                  >
                    {bottomText || 'BOTTOM TEXT'}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <div className="text-center">
                    <div className="text-6xl mb-2">📝</div>
                    <p>Add text to preview</p>
                  </div>
                </div>
              )}
            </div>

            {/* Download */}
            {generatedImage && (
              <a
                href={generatedImage}
                download={`meme-${selectedTemplate.id}-${Date.now()}.png`}
                className="block w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-center transition"
              >
                ⬇️ Download Meme
              </a>
            )}
          </div>
        </div>

        {/* Quick Memes Section */}
        <div className="p-4 border-t border-gray-700">
          <h4 className="font-semibold mb-3">🔥 Trending Brainrot Templates</h4>
          <div className="flex flex-wrap gap-2">
            {memeTemplates.slice(0, 8).map(template => (
              <button
                key={template.id}
                onClick={() => selectTemplate(template)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-sm transition"
              >
                {template.icon} {template.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
