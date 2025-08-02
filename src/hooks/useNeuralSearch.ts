import { useState, useEffect, useMemo } from 'react';
import { Note } from '@/types';
import Fuse from 'fuse.js';

interface SearchResult {
  note: Note;
  score: number;
  matches?: any[];
}

export const useNeuralSearch = (notes: Note[]) => {
  const [query, setQuery] = useState('');
  const [isEmbeddingSearch, setIsEmbeddingSearch] = useState(false);
  
  // Fuzzy search setup
  const fuse = useMemo(() => new Fuse(notes, {
    keys: [
      { name: 'title', weight: 0.3 },
      { name: 'content', weight: 0.5 },
      { name: 'tags', weight: 0.2 }
    ],
    threshold: 0.3,
    includeScore: true,
    includeMatches: true
  }), [notes]);

  // Enhanced intent-based search
  const searchByIntent = useMemo(() => {
    if (!query.trim()) return [];
    
    const intentPatterns = {
      temporal: /\b(last|previous|recent|ago|month|week|year|yesterday)\b/i,
      framework: /\b(react|vue|angular|nestjs|laravel|django|spring)\b/i,
      action: /\b(how|what|where|when|why|implement|setup|configure|debug|fix)\b/i,
      auth: /\b(jwt|auth|login|token|session|oauth|passport)\b/i,
      database: /\b(sql|mongodb|postgres|mysql|redis|database|db)\b/i,
      api: /\b(api|rest|graphql|endpoint|route|controller)\b/i
    };

    let enhancedQuery = query;
    let searchBoosts: any = {};

    // Detect patterns and boost relevant fields
    Object.entries(intentPatterns).forEach(([intent, pattern]) => {
      if (pattern.test(query)) {
        switch (intent) {
          case 'temporal':
            // Boost recent notes
            searchBoosts.createdAt = 'desc';
            break;
          case 'framework':
            // Boost language/tag matches
            searchBoosts.language = true;
            searchBoosts.tags = true;
            break;
          case 'auth':
            enhancedQuery += ' authentication authorization security';
            break;
          case 'database':
            enhancedQuery += ' persistence storage data model';
            break;
          case 'api':
            enhancedQuery += ' http request response server';
            break;
        }
      }
    });

    // Use enhanced query for fuzzy search
    const results = fuse.search(enhancedQuery);
    
    return results.map(result => ({
      note: result.item,
      score: 1 - (result.score || 0),
      matches: result.matches,
      intent: Object.keys(searchBoosts)
    }));
  }, [query, fuse]);

  // Semantic similarity (mock implementation - would use actual embeddings in production)
  const findSimilarNotes = (targetNote: Note, limit = 5): SearchResult[] => {
    const similarities = notes
      .filter(note => note.id !== targetNote.id)
      .map(note => {
        let score = 0;
        
        // Tag similarity
        const commonTags = note.tags.filter(tag => targetNote.tags.includes(tag));
        score += commonTags.length * 0.3;
        
        // Language similarity
        if (note.language === targetNote.language) score += 0.2;
        
        // Type similarity
        if (note.type === targetNote.type) score += 0.1;
        
        // Content keywords similarity (basic)
        const targetWords = targetNote.content.toLowerCase().split(/\W+/);
        const noteWords = note.content.toLowerCase().split(/\W+/);
        const commonWords = targetWords.filter(word => 
          word.length > 3 && noteWords.includes(word)
        );
        score += commonWords.length * 0.02;

        return { note, score, matches: [] };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return similarities;
  };

  // Context-aware search based on current activity
  const contextualSearch = (context: {
    currentFile?: string;
    recentNotes?: Note[];
    activeProject?: string;
  }) => {
    let contextQuery = query;
    
    if (context.currentFile) {
      const fileExt = context.currentFile.split('.').pop();
      const langMap: Record<string, string> = {
        'js': 'javascript',
        'ts': 'typescript',
        'py': 'python',
        'php': 'php',
        'java': 'java',
        'cpp': 'cpp',
        'rb': 'ruby'
      };
      
      if (fileExt && langMap[fileExt]) {
        contextQuery += ` ${langMap[fileExt]}`;
      }
    }

    if (context.activeProject) {
      contextQuery += ` ${context.activeProject}`;
    }

    return fuse.search(contextQuery).map(result => ({
      note: result.item,
      score: 1 - (result.score || 0),
      matches: result.matches
    }));
  };

  return {
    query,
    setQuery,
    searchResults: searchByIntent,
    findSimilarNotes,
    contextualSearch,
    isEmbeddingSearch,
    setIsEmbeddingSearch
  };
};