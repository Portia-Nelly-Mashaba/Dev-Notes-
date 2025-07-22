import { useState, useEffect, useMemo } from 'react';
import { Note, SearchFilters } from '@/types';

const STORAGE_KEY = 'devnotes-pad-notes';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({ query: '' });

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedNotes = JSON.parse(stored).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));
        setNotes(parsedNotes);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  }, [notes]);

  const addNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes(prev => [newNote, ...prev]);
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const toggleFavorite = (id: string) => {
    updateNote(id, { isFavorite: !notes.find(n => n.id === id)?.isFavorite });
  };

  // Search and filter logic
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesQuery = !filters.query || 
        note.title.toLowerCase().includes(filters.query.toLowerCase()) ||
        note.content.toLowerCase().includes(filters.query.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(filters.query.toLowerCase()));

      const matchesType = !filters.type || note.type === filters.type;
      const matchesLanguage = !filters.language || note.language === filters.language;
      const matchesTags = !filters.tags?.length || 
        filters.tags.some(tag => note.tags.includes(tag));
      const matchesFavorite = filters.isFavorite === undefined || 
        note.isFavorite === filters.isFavorite;

      return matchesQuery && matchesType && matchesLanguage && matchesTags && matchesFavorite;
    });
  }, [notes, filters]);

  // Get all unique tags and languages
  const allTags = useMemo(() => 
    [...new Set(notes.flatMap(note => note.tags))].sort(), 
    [notes]
  );

  const allLanguages = useMemo(() => 
    [...new Set(notes.map(note => note.language).filter(Boolean))].sort(), 
    [notes]
  );

  return {
    notes: filteredNotes,
    allNotes: notes,
    allTags,
    allLanguages,
    filters,
    setFilters,
    addNote,
    updateNote,
    deleteNote,
    toggleFavorite,
  };
};