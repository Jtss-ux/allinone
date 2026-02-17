'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Download, Upload, FileText, Clock, Save } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes);
        setNotes(parsed);
        if (parsed.length > 0) {
          setCurrentNote(parsed[0]);
        }
      } catch (e) {
        console.error('Error loading notes:', e);
      }
    }
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('notes', JSON.stringify(notes));
    }
  }, [notes]);

  // Auto-save current note
  useEffect(() => {
    if (currentNote && isDirty) {
      const timer = setTimeout(() => {
        saveCurrentNote();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentNote, isDirty]);

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setCurrentNote(newNote);
    setIsDirty(false);
  };

  const saveCurrentNote = () => {
    if (!currentNote) return;

    const updatedNotes = notes.map(note =>
      note.id === currentNote.id
        ? { ...currentNote, updatedAt: Date.now() }
        : note
    );
    setNotes(updatedNotes);
    setIsDirty(false);
  };

  const updateCurrentNote = (updates: Partial<Note>) => {
    if (!currentNote) return;
    setCurrentNote({ ...currentNote, ...updates });
    setIsDirty(true);
  };

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    
    if (currentNote?.id === id) {
      setCurrentNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
    }

    if (updatedNotes.length === 0) {
      localStorage.removeItem('notes');
    }
  };

  const exportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importNotes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedNotes = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedNotes)) {
          setNotes([...importedNotes, ...notes]);
          alert(`Imported ${importedNotes.length} notes successfully!`);
        }
      } catch (error) {
        alert('Error importing notes. Please check the file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Notes</h2>
            <button
              onClick={createNewNote}
              className="p-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No notes found</p>
              {notes.length === 0 && (
                <button
                  onClick={createNewNote}
                  className="mt-4 text-green-500 hover:text-green-400"
                >
                  Create your first note
                </button>
              )}
            </div>
          ) : (
            filteredNotes.map(note => (
              <div
                key={note.id}
                onClick={() => {
                  saveCurrentNote();
                  setCurrentNote(note);
                  setIsDirty(false);
                }}
                className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition ${
                  currentNote?.id === note.id ? 'bg-gray-800 border-l-4 border-l-green-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">
                      {note.title || 'Untitled Note'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {note.content || 'No content'}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      {formatDate(note.updatedAt)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteNote(note.id, e)}
                    className="p-1 text-gray-600 hover:text-red-500 transition ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Import/Export */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <button
              onClick={exportNotes}
              disabled={notes.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-gray-300 text-sm transition"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 text-sm cursor-pointer transition">
              <Upload className="w-4 h-4" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importNotes}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-gray-950">
        {currentNote ? (
          <>
            {/* Editor Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <input
                type="text"
                value={currentNote.title}
                onChange={(e) => updateCurrentNote({ title: e.target.value })}
                placeholder="Note title"
                className="flex-1 bg-transparent text-xl font-semibold text-white placeholder-gray-600 focus:outline-none"
              />
              {isDirty && (
                <div className="flex items-center gap-2 text-sm text-green-500">
                  <Save className="w-4 h-4" />
                  Saving...
                </div>
              )}
            </div>

            {/* Editor Content */}
            <textarea
              value={currentNote.content}
              onChange={(e) => updateCurrentNote({ content: e.target.value })}
              placeholder="Start typing your note..."
              className="flex-1 p-4 bg-transparent text-gray-300 placeholder-gray-600 resize-none focus:outline-none"
              style={{ minHeight: '400px' }}
            />

            {/* Editor Footer */}
            <div className="p-3 border-t border-gray-800 text-sm text-gray-500 flex items-center justify-between">
              <div>
                Created: {formatDate(currentNote.createdAt)}
              </div>
              <div>
                {currentNote.content.length} characters | {
                  currentNote.content.split(/\s+/).filter(w => w.length > 0).length
                } words
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Select a note or create a new one</p>
              <button
                onClick={createNewNote}
                className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition"
              >
                Create Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
