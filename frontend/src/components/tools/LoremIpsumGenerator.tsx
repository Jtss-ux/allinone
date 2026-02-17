'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, RefreshCw, AlignLeft, FileText, Type } from 'lucide-react';

const loremWords = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
];

export default function LoremIpsumGenerator() {
  const [paragraphs, setParagraphs] = useState(3);
  const [sentencesPerParagraph, setSentencesPerParagraph] = useState(5);
  const [wordsPerSentence, setWordsPerSentence] = useState(12);
  const [format, setFormat] = useState<'html' | 'plain'>('plain');
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);

  const generateWord = () => loremWords[Math.floor(Math.random() * loremWords.length)];

  const generateSentence = (isFirst: boolean) => {
    let sentence = '';
    const wordCount = wordsPerSentence + Math.floor(Math.random() * 5) - 2;
    
    for (let i = 0; i < wordCount; i++) {
      if (i === 0 && isFirst && startWithLorem) {
        sentence += 'Lorem ipsum';
        i++;
      } else {
        sentence += generateWord();
      }
      if (i < wordCount - 1) sentence += ' ';
    }
    
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
  };

  const generateParagraph = () => {
    let paragraph = '';
    for (let i = 0; i < sentencesPerParagraph; i++) {
      paragraph += generateSentence(i === 0);
      if (i < sentencesPerParagraph - 1) paragraph += ' ';
    }
    return paragraph;
  };

  const generate = useCallback(() => {
    let text = '';
    for (let i = 0; i < paragraphs; i++) {
      const paragraph = generateParagraph();
      if (format === 'html') {
        text += `<p>${paragraph}</p>`;
      } else {
        text += paragraph;
      }
      if (i < paragraphs - 1) {
        text += format === 'html' ? '\n\n' : '\n\n';
      }
    }
    setGeneratedText(text);
  }, [paragraphs, sentencesPerParagraph, wordsPerSentence, format, startWithLorem]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWordCount = () => generatedText.split(/\s+/).filter(w => w.length > 0).length;
  const getCharCount = () => generatedText.length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Lorem Ipsum Generator</h1>
        <p className="text-gray-400">Generate placeholder text for your designs</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Type className="w-5 h-5" />
            Settings
          </h2>

          {/* Paragraphs */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Paragraphs</span>
              <span className="text-white font-medium">{paragraphs}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={paragraphs}
              onChange={(e) => setParagraphs(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>

          {/* Sentences per paragraph */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Sentences/Paragraph</span>
              <span className="text-white font-medium">{sentencesPerParagraph}</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              value={sentencesPerParagraph}
              onChange={(e) => setSentencesPerParagraph(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>

          {/* Words per sentence */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Words/Sentence</span>
              <span className="text-white font-medium">{wordsPerSentence}</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              value={wordsPerSentence}
              onChange={(e) => setWordsPerSentence(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>

          {/* Format */}
          <div className="mb-5">
            <span className="text-gray-400 block mb-2">Format</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFormat('plain')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm transition ${
                  format === 'plain'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Plain Text
              </button>
              <button
                onClick={() => setFormat('html')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm transition ${
                  format === 'html'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                HTML
              </button>
            </div>
          </div>

          {/* Start with Lorem */}
          <label className="flex items-center gap-3 cursor-pointer mb-6">
            <input
              type="checkbox"
              checked={startWithLorem}
              onChange={(e) => setStartWithLorem(e.target.checked)}
              className="w-5 h-5 rounded border-gray-600 text-green-500 focus:ring-green-500 bg-gray-700"
            />
            <span className="text-gray-300">Start with "Lorem ipsum"</span>
          </label>

          {/* Generate Button */}
          <button
            onClick={generate}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
            Generate
          </button>
        </div>

        {/* Output Panel */}
        <div className="md:col-span-2 bg-gray-900 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlignLeft className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-white">Generated Text</h2>
            </div>
            {generatedText && (
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{getWordCount()} words</span>
                <span>{getCharCount()} chars</span>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 text-green-500 hover:text-green-400 transition"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>

          {generatedText ? (
            <div className="bg-gray-800 rounded-lg p-4 max-h-[500px] overflow-y-auto">
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                {format === 'html' ? (
                  <div dangerouslySetInnerHTML={{ __html: generatedText.replace(/</g, '&lt;').replace(/>/g, '&gt;') }} />
                ) : (
                  generatedText
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-500">Click "Generate" to create text</p>
            </div>
          )}
        </div>
      </div>

      {/* About Lorem Ipsum */}
      <div className="mt-8 bg-gray-900 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">What is Lorem Ipsum?</h3>
        <p className="text-gray-400 leading-relaxed">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. It has been the industry's 
          standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled 
          it to make a type specimen book. It has survived not only five centuries, but also the leap into 
          electronic typesetting, remaining essentially unchanged.
        </p>
      </div>
    </div>
  );
}
