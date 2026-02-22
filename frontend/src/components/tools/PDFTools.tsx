'use client';

import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { toast } from 'react-hot-toast';

export default function PDFTools() {
  const [mode, setMode] = useState<'merge' | 'split' | 'compress'>('merge');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [pageRange, setPageRange] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setResult(null);
    }
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      toast.error('Please select at least 2 PDF files');
      return;
    }

    setLoading(true);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      // @ts-ignore - pdf-lib returns Uint8Array which is compatible with Blob
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResult(url);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      toast.error('Error merging PDFs');
    }
    setLoading(false);
  };

  const splitPDF = async () => {
    if (files.length === 0) {
      toast.error('Please select a PDF file');
      return;
    }

    setLoading(true);
    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = pdf.getPages();

      // For demo, split into individual pages
      const splitPdfs: string[] = [];

      for (let i = 0; i < pages.length; i++) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(copiedPage);
        const pdfBytes = await newPdf.save();
        // @ts-ignore - pdf-lib returns Uint8Array which is compatible with Blob
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        splitPdfs.push(URL.createObjectURL(blob));
      }

      setResult(splitPdfs[0]); // Show first page for demo
    } catch (error) {
      console.error('Error splitting PDF:', error);
    }
    setLoading(false);
  };

  const compressPDF = async () => {
    if (files.length === 0) {
      toast.error('Please select a PDF file');
      return;
    }

    setLoading(true);
    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);

      // Compress by saving with optimization
      const compressedBytes = await pdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });
      // @ts-ignore - pdf-lib returns Uint8Array which is compatible with Blob
      const blob = new Blob([compressedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResult(url);
    } catch (error) {
      console.error('Error compressing PDF:', error);
    }
    setLoading(false);
  };

  const processPDF = () => {
    if (mode === 'merge') mergePDFs();
    else if (mode === 'split') splitPDF();
    else if (mode === 'compress') compressPDF();
  };

  const downloadResult = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `processed-${Date.now()}.pdf`;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-pink-600 p-4">
          <h3 className="text-2xl font-bold">📄 PDF Tools</h3>
          <p className="text-gray-200">Merge, split, and compress PDF files</p>
        </div>

        {/* Mode Selection */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'merge', icon: '➕', label: 'Merge' },
            { id: 'split', icon: '✂️', label: 'Split' },
            { id: 'compress', icon: '📦', label: 'Compress' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setMode(tab.id as any); setFiles([]); setResult(null); }}
              className={`flex-1 p-4 text-center font-semibold transition ${mode === tab.id ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
            >
              <span className="block text-2xl mb-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block w-full p-8 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-red-500 transition">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                multiple={mode === 'merge'}
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="text-4xl mb-2">📁</div>
              <p className="text-gray-400">
                {mode === 'merge' ? 'Select multiple PDF files' : 'Select a PDF file'}
              </p>
              <p className="text-sm text-gray-500">PDF files only</p>
            </label>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Selected Files:</h4>
              <ul className="space-y-1">
                {files.map((file, index) => (
                  <li key={index} className="text-sm text-gray-300 flex justify-between">
                    <span>{file.name}</span>
                    <span>{(file.size / 1024).toFixed(1)} KB</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Process Button */}
          <button
            onClick={processPDF}
            disabled={files.length === 0 || loading}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg font-bold transition disabled:opacity-50"
          >
            {loading ? '⏳ Processing...' : `📄 ${mode === 'merge' ? 'Merge' : mode === 'split' ? 'Split' : 'Compress'} PDF`}
          </button>

          {/* Result */}
          {result && (
            <div className="bg-green-900/30 border border-green-600 p-4 rounded-lg">
              <p className="text-green-400 font-semibold mb-2">✅ PDF processed successfully!</p>
              <button
                onClick={downloadResult}
                className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
              >
                ⬇️ Download PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
