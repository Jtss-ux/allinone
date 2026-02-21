'use client';

import React, { useState } from 'react';

const DEFAULT_MD = `# Welcome to Markdown Editor

Write your **markdown** here and see the preview on the right!

## Features
- **Bold**, *italic*, and ~~strikethrough~~
- Lists and checklists
- Code blocks
- Tables
- And more!

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

> This is a blockquote — great for callouts!

| Feature | Status |
|---------|--------|
| Bold    | ✅     |
| Italic  | ✅     |
| Code    | ✅     |
`;

// Simple markdown to HTML converter (no external deps)
function markdownToHtml(md: string): string {
    let html = md;

    // Code blocks (fenced)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
        return `<pre style="background:#1a1a2e;padding:12px;border-radius:8px;overflow-x:auto;margin:8px 0"><code class="lang-${lang}">${escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code style="background:#333;padding:2px 6px;border-radius:4px;font-size:0.9em">$1</code>');

    // Headers
    html = html.replace(/^######\s+(.+)$/gm, '<h6 style="font-size:0.85em;font-weight:600;margin:12px 0 6px">$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5 style="font-size:0.95em;font-weight:600;margin:12px 0 6px">$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4 style="font-size:1.05em;font-weight:600;margin:14px 0 6px">$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3 style="font-size:1.15em;font-weight:600;margin:16px 0 8px">$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2 style="font-size:1.3em;font-weight:700;margin:18px 0 8px;border-bottom:1px solid #444;padding-bottom:4px">$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1 style="font-size:1.6em;font-weight:700;margin:20px 0 10px">$1</h1>');

    // Bold + italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // Blockquotes
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote style="border-left:3px solid #4ade80;padding:8px 16px;margin:8px 0;color:#aaa;background:#1a1a2e;border-radius:4px">$1</blockquote>');

    // Tables
    html = html.replace(/^(\|.+\|)\n\|[-|: ]+\|\n((?:\|.+\|\n?)*)/gm, (_m, header, body) => {
        const headers = header.split('|').filter((c: string) => c.trim()).map((c: string) =>
            `<th style="border:1px solid #444;padding:6px 12px;text-align:left">${c.trim()}</th>`
        ).join('');
        const rows = body.trim().split('\n').map((row: string) => {
            const cells = row.split('|').filter((c: string) => c.trim()).map((c: string) =>
                `<td style="border:1px solid #444;padding:6px 12px">${c.trim()}</td>`
            ).join('');
            return `<tr>${cells}</tr>`;
        }).join('');
        return `<table style="border-collapse:collapse;margin:8px 0;width:100%"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    });

    // Unordered lists
    html = html.replace(/^[-*]\s+(.+)$/gm, '<li style="margin-left:20px;list-style:disc">$1</li>');

    // Horizontal rules
    html = html.replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid #444;margin:16px 0">');

    // Links
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#4ade80;text-decoration:underline" target="_blank">$1</a>');

    // Paragraphs (newlines)
    html = html.replace(/\n\n/g, '<br/><br/>');
    html = html.replace(/\n/g, '<br/>');

    return html;
}

function escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default function MarkdownEditor() {
    const [markdown, setMarkdown] = useState(DEFAULT_MD);
    const [view, setView] = useState<'split' | 'edit' | 'preview'>('split');

    const copyMarkdown = () => {
        navigator.clipboard.writeText(markdown);
    };

    const downloadMarkdown = () => {
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.md';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-180px)]">
            <div className="bg-gray-800 rounded-lg overflow-hidden h-full flex flex-col">
                {/* Toolbar */}
                <div className="flex items-center justify-between p-3 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">📝</span>
                        <h3 className="font-semibold">Markdown Editor</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* View toggles */}
                        <div className="flex bg-gray-700 rounded-lg">
                            {(['edit', 'split', 'preview'] as const).map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setView(v)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${view === v ? 'bg-green-600 text-white' : 'text-gray-300 hover:text-white'
                                        }`}
                                >
                                    {v === 'edit' ? '✏️ Edit' : v === 'split' ? '📐 Split' : '👁️ Preview'}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={copyMarkdown}
                            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs transition"
                        >
                            📋 Copy
                        </button>
                        <button
                            onClick={downloadMarkdown}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs transition"
                        >
                            ⬇️ Download .md
                        </button>
                    </div>
                </div>

                {/* Editor + Preview */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Editor */}
                    {(view === 'edit' || view === 'split') && (
                        <div className={`${view === 'split' ? 'w-1/2 border-r border-gray-700' : 'w-full'} h-full`}>
                            <textarea
                                value={markdown}
                                onChange={(e) => setMarkdown(e.target.value)}
                                className="w-full h-full p-4 bg-gray-900 text-gray-200 font-mono text-sm resize-none focus:outline-none"
                                placeholder="Write your markdown here..."
                                spellCheck={false}
                            />
                        </div>
                    )}

                    {/* Preview */}
                    {(view === 'preview' || view === 'split') && (
                        <div className={`${view === 'split' ? 'w-1/2' : 'w-full'} h-full overflow-y-auto`}>
                            <div
                                className="p-6 text-gray-200 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }}
                            />
                        </div>
                    )}
                </div>

                {/* Status bar */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-gray-700 text-xs text-gray-500">
                    <span>{markdown.length} characters • {markdown.split('\n').length} lines</span>
                    <span>Markdown</span>
                </div>
            </div>
        </div>
    );
}
