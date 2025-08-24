import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNotes } from '@/hooks/useNotes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CodeEditor } from '@/components/CodeEditor';
import { ArrowLeft, Edit2, Star, Share2, Calendar, Code2, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { ShareDialog } from '@/components/ShareDialog';
import { useState } from 'react';

const NoteView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { allNotes, updateNote, toggleFavorite } = useNotes();
  const [shareNote, setShareNote] = useState<any>(null);

  const note = allNotes.find(n => n.id === id);

  if (!note) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Note not found</h2>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const isCodeSnippet = note.type === 'snippet' && note.content.includes('\n');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">{note.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {note.type}
                  </Badge>
                  {note.language && (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <Code2 className="h-3 w-3" />
                      {note.language}
                    </Badge>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(note.updatedAt, 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(note.id)}
                className="flex items-center gap-2"
              >
                <Star
                  className={`h-4 w-4 ${
                    note.isFavorite 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-muted-foreground'
                  }`}
                />
                {note.isFavorite ? 'Favorited' : 'Add to Favorites'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShareNote(note)}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share to Blog
              </Button>

              <Button
                size="sm"
                onClick={() => navigate(`/edit-note/${note.id}`)}
                className="flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-6">
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-2">Content</h2>
                {note.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {note.sharedWith && note.sharedWith.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Share2 className="h-4 w-4" />
                  Shared with {note.sharedWith.length} user(s)
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {isCodeSnippet ? (
              <div className="rounded-lg overflow-hidden border">
                <CodeEditor
                  value={note.content}
                  onChange={() => {}}
                  language={note.language}
                  height="400px"
                  readOnly
                />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg border overflow-auto">
                  {note.content}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Metadata</h3>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Created:</span>
              <p>{format(note.createdAt, 'PPpp')}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Last Updated:</span>
              <p>{format(note.updatedAt, 'PPpp')}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Type:</span>
              <p className="capitalize">{note.type}</p>
            </div>
            {note.language && (
              <div>
                <span className="font-medium text-muted-foreground">Language:</span>
                <p>{note.language}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blog Link */}
        <div className="mt-6 p-4 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Want to share this with the community?
          </p>
          <Link to="/blog">
            <Button variant="outline">
              View Community Blog
            </Button>
          </Link>
        </div>
      </main>

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

export default NoteView;