'use client';
import React from 'react';
import ServiceHub from './ServiceHub';

const services = [
    { name: 'Stirling-PDF', url: 'https://stirlingtools.com', description: 'Self-hosted PDF manipulation tool — merge, split, convert, OCR', icon: '📄', tags: ['PDF', 'Self-Hosted'], free: true },
    { name: 'CloudConvert', url: 'https://cloudconvert.com', description: 'Convert between 200+ file formats online', icon: '🔄', tags: ['Converter', 'Cloud'], free: true },
    { name: 'Zamzar', url: 'https://zamzar.com', description: 'Online file converter — documents, images, audio, video', icon: '⚡', tags: ['Converter', 'Cloud'], free: true },
    { name: 'Pandoc', url: 'https://pandoc.org', description: 'Universal document converter — Markdown, HTML, PDF, DOCX', icon: '📝', tags: ['Converter', 'Documents'], free: true },
    { name: 'FFmpeg', url: 'https://ffmpeg.org', description: 'The Swiss Army Knife of video/audio processing', icon: '🎬', tags: ['Video', 'Audio'], free: true },
    { name: 'HandBrake', url: 'https://handbrake.fr', description: 'Open-source video transcoder — convert video formats', icon: '🎥', tags: ['Video', 'Transcoder'], free: true },
    { name: '7-Zip', url: 'https://7-zip.org', description: 'High-compression file archiver — ZIP, 7Z, RAR, TAR', icon: '📦', tags: ['Archive', 'Compression'], free: true },
    { name: 'TinyPNG', url: 'https://tinypng.com', description: 'Smart PNG and JPEG compression — reduce file size up to 80%', icon: '🖼️', tags: ['Image', 'Compression'], free: true },
    { name: 'FileZilla', url: 'https://filezilla-project.org', description: 'FTP, FTPS, and SFTP client for file transfers', icon: '📂', tags: ['FTP', 'Transfer'], free: true },
    { name: 'ImageMagick', url: 'https://imagemagick.org', description: 'Command-line image processing — resize, convert, composite', icon: '🪄', tags: ['Image', 'CLI'], free: true },
];

export default function ConverterHub() {
    return <ServiceHub title="Converter & File Tools Hub" subtitle="Convert, compress, and process files of any format"
        gradient="from-teal-600 to-cyan-700" headerIcon="🔄" services={services} />;
}
