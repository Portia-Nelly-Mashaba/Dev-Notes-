import { Note } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Edit2, Trash2, Share2, Calendar, Code2 } from 'lucide-react';
import { format } from 'date-fns';
import { CodeEditor } from './CodeEditor';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onShare?: (note: Note) => void;
  showFullContent?: boolean;
}

export const NoteCard = ({ 
  note, 
  onEdit, 
  onDelete, 
  onToggleFavorite, 
  onShare,
  showFullContent = false 
}: NoteCardProps) => {
  const isCodeSnippet = note.type === 'snippet' && note.content.includes('\n');
  const previewContent = showFullContent ? note.content : note.content.slice(0, 200);

  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg line-clamp-1">{note.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFavorite(note.id)}
                className="h-8 w-8 p-0"
              >
                <Star
                  className={`h-4 w-4 ${
                    note.isFavorite 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-muted-foreground'
                  }`}
                />
              </Button>
            </div>
            
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

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(note)}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            {onShare && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShare(note)}
                className="h-8 w-8 p-0"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(note.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Content Preview */}
        <div className="mb-4">
          {isCodeSnippet && showFullContent ? (
            <CodeEditor
              value={note.content}
              onChange={() => {}}
              language={note.language}
              height="200px"
              readOnly
            />
          ) : (
            <div className="text-sm text-muted-foreground">
              <pre className="whitespace-pre-wrap font-mono text-xs bg-muted p-3 rounded border overflow-hidden">
                {previewContent}
                {!showFullContent && note.content.length > 200 && '...'}
              </pre>
            </div>
          )}
        </div>

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Shared indicator */}
        {note.sharedWith && note.sharedWith.length > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Share2 className="h-3 w-3" />
            Shared with {note.sharedWith.length} user(s)
          </div>
        )}
      </CardContent>
    </Card>
  );
};