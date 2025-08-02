import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Brain, Clock, Tag, Zap } from 'lucide-react';
import { useNeuralSearch } from '@/hooks/useNeuralSearch';
import { Note } from '@/types';

interface NeuralSearchPanelProps {
  notes: Note[];
  onNoteSelect: (note: Note) => void;
}

export const NeuralSearchPanel: React.FC<NeuralSearchPanelProps> = ({ 
  notes, 
  onNoteSelect 
}) => {
  const { 
    query, 
    setQuery, 
    searchResults, 
    findSimilarNotes, 
    contextualSearch 
  } = useNeuralSearch(notes);
  
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [similarNotes, setSimilarNotes] = useState<any[]>([]);
  const [searchMode, setSearchMode] = useState<'intent' | 'similarity' | 'contextual'>('intent');

  useEffect(() => {
    if (selectedNote && searchMode === 'similarity') {
      const similar = findSimilarNotes(selectedNote);
      setSimilarNotes(similar);
    }
  }, [selectedNote, searchMode, findSimilarNotes]);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    onNoteSelect(note);
  };

  const getSearchPlaceholder = () => {
    switch (searchMode) {
      case 'intent':
        return "Ask naturally: 'How did I handle JWT auth in NestJS?'";
      case 'similarity':
        return "Find notes similar to selected note";
      case 'contextual':
        return "Search with current context (file: .tsx, project: react)";
      default:
        return "Search your knowledge base...";
    }
  };

  const renderSearchResults = () => {
    switch (searchMode) {
      case 'intent':
        return searchResults;
      case 'similarity':
        return similarNotes;
      case 'contextual':
        const context = {
          currentFile: 'component.tsx', // Mock current file
          activeProject: 'react-app'    // Mock active project
        };
        return contextualSearch(context);
      default:
        return [];
    }
  };

  const highlightText = (text: string, matches: any[] = []) => {
    if (!matches.length) return text;
    
    // Simple highlighting - in production would use proper match highlighting
    const searchTerms = query.toLowerCase().split(' ');
    let highlightedText = text;
    
    searchTerms.forEach(term => {
      if (term.length > 2) {
        const regex = new RegExp(`(${term})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
      }
    });
    
    return highlightedText;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Neural Search
          </CardTitle>
          
          {/* Search Mode Tabs */}
          <div className="flex gap-2">
            <Button
              variant={searchMode === 'intent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchMode('intent')}
            >
              <Zap className="h-4 w-4 mr-1" />
              Intent
            </Button>
            <Button
              variant={searchMode === 'similarity' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchMode('similarity')}
              disabled={!selectedNote}
            >
              <Search className="h-4 w-4 mr-1" />
              Similar
            </Button>
            <Button
              variant={searchMode === 'contextual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchMode('contextual')}
            >
              <Tag className="h-4 w-4 mr-1" />
              Context
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={getSearchPlaceholder()}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Context Info */}
            {searchMode === 'contextual' && (
              <div className="flex gap-2 text-xs">
                <Badge variant="outline">📄 component.tsx</Badge>
                <Badge variant="outline">⚛️ react-app</Badge>
              </div>
            )}

            {/* Search Results */}
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {renderSearchResults().map((result, index) => (
                  <div
                    key={result.note.id || index}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedNote?.id === result.note.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleNoteClick(result.note)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 
                        className="font-medium text-sm"
                        dangerouslySetInnerHTML={{ 
                          __html: highlightText(result.note.title, result.matches) 
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(result.score * 100)}%
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {result.note.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <p 
                      className="text-xs text-muted-foreground mb-2 line-clamp-2"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightText(result.note.content.slice(0, 150) + '...', result.matches) 
                      }}
                    />
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(result.note.createdAt).toLocaleDateString()}</span>
                      
                      {result.note.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Intent Detection */}
                    {searchMode === 'intent' && (result as any).intent && (
                      <div className="mt-2 flex gap-1">
                        {(result as any).intent.map((intent: string) => (
                          <Badge key={intent} variant="secondary" className="text-xs">
                            🧠 {intent}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {renderSearchResults().length === 0 && query && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No matching notes found</p>
                    <p className="text-xs mt-1">Try different keywords or search modes</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};