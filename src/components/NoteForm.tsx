import { useState } from 'react';
import { Note } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { CodeEditor } from './CodeEditor';

interface NoteFormProps {
  note?: Note;
  onSave: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const NOTE_TYPES = [
  { value: 'snippet', label: 'Code Snippet' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'tool', label: 'Tool/Command' },
  { value: 'project', label: 'Project Starter' },
];

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'csharp', 'php', 'ruby', 'go',
  'rust', 'swift', 'kotlin', 'dart', 'html', 'css', 'scss', 'sql', 'bash', 'powershell'
];

export const NoteForm = ({ note, onSave, onCancel }: NoteFormProps) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [type, setType] = useState<Note['type']>(note?.type || 'snippet');
  const [language, setLanguage] = useState(note?.language || 'javascript');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [useCodeEditor, setUseCodeEditor] = useState(type === 'snippet');

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      content,
      type,
      language,
      tags,
      isFavorite: note?.isFavorite || false,
      sharedWith: note?.sharedWith || [],
    });
  };

  const handleTypeChange = (newType: Note['type']) => {
    setType(newType);
    setUseCodeEditor(newType === 'snippet');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{note ? 'Edit Note' : 'Create New Note'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Code Editor</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useCodeEditor}
                  onChange={(e) => setUseCodeEditor(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Use code editor</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            {useCodeEditor ? (
              <CodeEditor
                value={content}
                onChange={setContent}
                language={language}
                height="400px"
              />
            ) : (
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your note content..."
                className="min-h-[200px]"
                required
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {note ? 'Update Note' : 'Save Note'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};