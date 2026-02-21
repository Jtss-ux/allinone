'use client';

import React, { useState, useRef } from 'react';

interface EXIFData {
    [key: string]: string | number | undefined;
}

export default function EXIFViewer() {
    const [imageUrl, setImageUrl] = useState('');
    const [exifData, setExifData] = useState<EXIFData | null>(null);
    const [fileName, setFileName] = useState('');
    const [fileSize, setFileSize] = useState('');
    const [dimensions, setDimensions] = useState('');
    const [error, setError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        setError('');
        setExifData(null);
        setFileName(file.name);
        setFileSize(formatBytes(file.size));

        // Create image URL for preview
        const url = URL.createObjectURL(file);
        setImageUrl(url);

        // Load image to get dimensions
        const img = new Image();
        img.onload = () => setDimensions(`${img.width} × ${img.height}`);
        img.src = url;

        // Read EXIF from file bytes
        const buffer = await file.arrayBuffer();
        const data = extractBasicExif(new Uint8Array(buffer), file);
        setExifData(data);
    };

    const extractBasicExif = (bytes: Uint8Array, file: File): EXIFData => {
        const data: EXIFData = {
            'File Name': file.name,
            'File Size': formatBytes(file.size),
            'File Type': file.type,
            'Last Modified': new Date(file.lastModified).toLocaleString(),
        };

        // Check for JPEG EXIF marker
        if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
            data['Format'] = 'JPEG';

            // Search for EXIF APP1 marker (0xFFE1)
            let offset = 2;
            while (offset < bytes.length - 4) {
                if (bytes[offset] === 0xFF) {
                    const marker = bytes[offset + 1];
                    const segLen = (bytes[offset + 2] << 8) | bytes[offset + 3];

                    if (marker === 0xE1) {
                        // EXIF marker found
                        const exifStr = String.fromCharCode(...Array.from(bytes.slice(offset + 4, offset + 8)));
                        if (exifStr === 'Exif') {
                            data['EXIF'] = 'Present';
                            // Parse TIFF header
                            const tiffStart = offset + 10;
                            const isLittleEndian = bytes[tiffStart] === 0x49;
                            data['Byte Order'] = isLittleEndian ? 'Little Endian (Intel)' : 'Big Endian (Motorola)';

                            // Try to extract basic IFD0 tags
                            try {
                                const ifdOffset = readUint32(bytes, tiffStart + 4, isLittleEndian);
                                const numEntries = readUint16(bytes, tiffStart + ifdOffset, isLittleEndian);

                                for (let i = 0; i < Math.min(numEntries, 50); i++) {
                                    const entryOffset = tiffStart + ifdOffset + 2 + (i * 12);
                                    if (entryOffset + 12 > bytes.length) break;

                                    const tag = readUint16(bytes, entryOffset, isLittleEndian);
                                    const type = readUint16(bytes, entryOffset + 2, isLittleEndian);
                                    const count = readUint32(bytes, entryOffset + 4, isLittleEndian);

                                    const tagName = getTagName(tag);
                                    if (tagName && type === 2 && count < 256) {
                                        // ASCII string
                                        const valOffset = count <= 4 ? entryOffset + 8 : tiffStart + readUint32(bytes, entryOffset + 8, isLittleEndian);
                                        if (valOffset + count <= bytes.length) {
                                            const str = String.fromCharCode(...Array.from(bytes.slice(valOffset, valOffset + count - 1))).trim();
                                            if (str) data[tagName] = str;
                                        }
                                    } else if (tagName && (type === 3 || type === 4) && count === 1) {
                                        // SHORT or LONG
                                        const val = type === 3 ? readUint16(bytes, entryOffset + 8, isLittleEndian) : readUint32(bytes, entryOffset + 8, isLittleEndian);
                                        data[tagName] = val;
                                    }
                                }
                            } catch { /* best effort */ }
                        }
                        break;
                    }

                    offset += 2 + segLen;
                } else {
                    offset++;
                }
            }
        } else if (bytes[0] === 0x89 && bytes[1] === 0x50) {
            data['Format'] = 'PNG';
        } else if (bytes[0] === 0x47 && bytes[1] === 0x49) {
            data['Format'] = 'GIF';
        } else if (bytes[0] === 0x52 && bytes[1] === 0x49) {
            data['Format'] = 'WebP';
        }

        return data;
    };

    const readUint16 = (b: Uint8Array, o: number, le: boolean) => le ? b[o] | (b[o + 1] << 8) : (b[o] << 8) | b[o + 1];
    const readUint32 = (b: Uint8Array, o: number, le: boolean) => le ? b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24) : (b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3];

    const getTagName = (tag: number): string | null => {
        const tags: Record<number, string> = {
            0x010F: 'Camera Make', 0x0110: 'Camera Model', 0x0112: 'Orientation',
            0x011A: 'X Resolution', 0x011B: 'Y Resolution', 0x0128: 'Resolution Unit',
            0x0131: 'Software', 0x0132: 'Date/Time', 0x013B: 'Artist',
            0x8298: 'Copyright', 0x8769: 'EXIF IFD', 0x8825: 'GPS IFD',
            0x829A: 'Exposure Time', 0x829D: 'F-Number', 0x8827: 'ISO Speed',
            0x9003: 'Date Original', 0x9004: 'Date Digitized', 0x920A: 'Focal Length',
            0xA001: 'Color Space', 0xA002: 'Image Width', 0xA003: 'Image Height',
            0xA420: 'Image Unique ID', 0xA430: 'Owner Name', 0xA431: 'Serial Number',
            0xA432: 'Lens Info', 0xA433: 'Lens Make', 0xA434: 'Lens Model',
        };
        return tags[tag] || null;
    };

    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">📷</span>
                    <div>
                        <h3 className="text-xl font-semibold">EXIF Viewer</h3>
                        <p className="text-sm text-gray-400">Read metadata from images — camera info, dates, settings, and more</p>
                    </div>
                </div>

                {/* Upload */}
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-green-500 transition cursor-pointer mb-6"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                    <div className="text-4xl mb-2">📁</div>
                    <p className="text-gray-300">Drop an image or click to select</p>
                    <p className="text-xs text-gray-500 mt-1">Supports JPEG, PNG, GIF, WebP</p>
                </div>

                {imageUrl && (
                    <div className="mb-6">
                        <img src={imageUrl} alt="Preview" className="w-full max-h-64 object-contain rounded-lg bg-gray-900" />
                        {dimensions && <p className="text-xs text-gray-500 text-center mt-1">{dimensions}</p>}
                    </div>
                )}

                {exifData && (
                    <div className="bg-gray-900 rounded-lg overflow-hidden">
                        <div className="px-4 py-2 bg-gray-700 text-sm font-semibold">📋 Metadata ({Object.keys(exifData).length} properties)</div>
                        <div className="divide-y divide-gray-800">
                            {Object.entries(exifData).map(([key, value]) => (
                                <div key={key} className="flex justify-between px-4 py-2 text-sm hover:bg-gray-800 transition">
                                    <span className="text-gray-400">{key}</span>
                                    <span className="text-white font-mono">{String(value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {error && <div className="p-3 bg-red-900 text-red-100 rounded-lg text-sm">{error}</div>}
            </div>
        </div>
    );
}
