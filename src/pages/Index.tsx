import { useState } from 'react';
import { Note, ErrorLog } from '@/types';
import { useNotes } from '@/hooks/useNotes';
import { useErrorLogs } from '@/hooks/useErrorLogs';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, AlertTriangle, Brain, Search } from 'lucide-react';
import { NoteForm } from '@/components/NoteForm';
import { NoteCard } from '@/components/NoteCard';
import { SearchAndFilters } from '@/components/SearchAndFilters';
import { ErrorLogForm } from '@/components/ErrorLogForm';
import { AIPanel } from '@/components/AIPanel';
import { ShareDialog } from '@/components/ShareDialog';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { 
    notes, 
    allTags, 
    allLanguages, 
    filters, 
    setFilters, 
    addNote, 
    updateNote, 
    deleteNote, 
    toggleFavorite 
  } = useNotes();
  
  const { errorLogs, addErrorLog, updateErrorLog, deleteErrorLog } = useErrorLogs();
  
  const [currentView, setCurrentView] = useState<'list' | 'note-form' | 'error-form'>('list');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingError, setEditingError] = useState<ErrorLog | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [shareNote, setShareNote] = useState<Note | null>(null);
  const { toast } = useToast();

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingNote) {
      updateNote(editingNote.id, noteData);
      toast({ title: "Note Updated", description: "Your note has been updated successfully." });
    } else {
      addNote(noteData);
      toast({ title: "Note Created", description: "Your note has been created successfully." });
    }
    setCurrentView('list');
    setEditingNote(null);
  };

  const handleSaveErrorLog = (logData: Omit<ErrorLog, 'id' | 'createdAt'>) => {
    if (editingError) {
      updateErrorLog(editingError.id, logData);
      toast({ title: "Error Log Updated", description: "Your error log has been updated successfully." });
    } else {
      addErrorLog(logData);
      toast({ title: "Error Log Created", description: "Your error log has been created successfully." });
    }
    setCurrentView('list');
    setEditingError(null);
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    toast({ title: "Note Deleted", description: "Your note has been deleted." });
  };

  const handleDeleteErrorLog = (id: string) => {
    deleteErrorLog(id);
    toast({ title: "Error Log Deleted", description: "Your error log has been deleted." });
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setCurrentView('note-form');
  };

  const handleEditErrorLog = (error: ErrorLog) => {
    setEditingError(error);
    setCurrentView('error-form');
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNotes(prev => 
      prev.find(n => n.id === note.id)
        ? prev.filter(n => n.id !== note.id)
        : [...prev, note]
    );
  };

  const handleClearSelection = () => {
    setSelectedNotes([]);
  };

  if (currentView === 'note-form') {
    return (
      <div className="min-h-screen bg-background p-4">
        <NoteForm
          note={editingNote || undefined}
          onSave={handleSaveNote}
          onCancel={() => {
            setCurrentView('list');
            setEditingNote(null);
          }}
        />
      </div>
    );
  }

  if (currentView === 'error-form') {
    return (
      <div className="min-h-screen bg-background p-4">
        <ErrorLogForm
          errorLog={editingError || undefined}
          onSave={handleSaveErrorLog}
          onCancel={() => {
            setCurrentView('list');
            setEditingError(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dev Notes Pad</h1>
              <p className="text-muted-foreground">Your personal code assistant</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCurrentView('note-form')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Note
              </Button>
              <Button
                onClick={() => setCurrentView('error-form')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Log Error
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filters */}
            <SearchAndFilters
              filters={filters}
              onFiltersChange={setFilters}
              allTags={allTags}
              allLanguages={allLanguages}
            />

            {/* Content Tabs */}
            <Tabs defaultValue="notes" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes ({notes.length})
                </TabsTrigger>
                <TabsTrigger value="errors" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Error Logs ({errorLogs.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="notes" className="space-y-4">
                {notes.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No notes found</h3>
                    <p className="text-muted-foreground mb-4">
                      Start building your knowledge base by creating your first note.
                    </p>
                    <Button onClick={() => setCurrentView('note-form')}>
                      Create First Note
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notes.map(note => (
                      <div key={note.id} className="relative">
                        <NoteCard
                          note={note}
                          onEdit={handleEditNote}
                          onDelete={handleDeleteNote}
                          onToggleFavorite={toggleFavorite}
                          onShare={(note) => setShareNote(note)}
                        />
                        <div className="absolute top-2 left-2">
                          <input
                            type="checkbox"
                            checked={selectedNotes.some(n => n.id === note.id)}
                            onChange={() => handleSelectNote(note)}
                            className="rounded"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="errors" className="space-y-4">
                {errorLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No error logs</h3>
                    <p className="text-muted-foreground mb-4">
                      Start logging errors and their solutions to build a troubleshooting knowledge base.
                    </p>
                    <Button onClick={() => setCurrentView('error-form')}>
                      Log First Error
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {errorLogs.map(error => (
                      <div key={error.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{error.title}</h3>
                            <div className="flex gap-2 mt-1">
                              {error.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditErrorLog(error)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteErrorLog(error.id)}
                              className="text-destructive"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm space-y-2">
                          <div>
                            <strong>Error:</strong>
                            <pre className="mt-1 p-2 bg-muted rounded text-xs font-mono">
                              {error.errorMessage.slice(0, 200)}...
                            </pre>
                          </div>
                          <div>
                            <strong>Solution:</strong>
                            <p className="mt-1 text-muted-foreground">
                              {error.fix.slice(0, 200)}...
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* AI Sidebar */}
          <div className="lg:col-span-1">
            <AIPanel
              selectedNotes={selectedNotes}
              onClearSelection={handleClearSelection}
            />
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <ShareDialog
        note={shareNote}
        isOpen={!!shareNote}
        onClose={() => setShareNote(null)}
        onUpdateNote={updateNote}
      />
    </div>
  );
};

export default Index;
