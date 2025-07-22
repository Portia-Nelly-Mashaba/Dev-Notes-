import { useState } from 'react';
import { ErrorLog } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface ErrorLogFormProps {
  errorLog?: ErrorLog;
  onSave: (logData: Omit<ErrorLog, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const ErrorLogForm = ({ errorLog, onSave, onCancel }: ErrorLogFormProps) => {
  const [title, setTitle] = useState(errorLog?.title || '');
  const [errorMessage, setErrorMessage] = useState(errorLog?.errorMessage || '');
  const [fix, setFix] = useState(errorLog?.fix || '');
  const [stackTrace, setStackTrace] = useState(errorLog?.stackTrace || '');
  const [tags, setTags] = useState<string[]>(errorLog?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [context, setContext] = useState({
    file: errorLog?.context?.file || '',
    project: errorLog?.context?.project || '',
    screenshot: errorLog?.context?.screenshot || '',
  });

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
      errorMessage,
      fix,
      stackTrace: stackTrace || undefined,
      tags,
      context: context.file || context.project || context.screenshot ? context : undefined,
      relatedNoteId: errorLog?.relatedNoteId,
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{errorLog ? 'Edit Error Log' : 'Log New Error'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Error Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the error..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="error">Error Message</Label>
            <Textarea
              id="error"
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              placeholder="Paste the full error message here..."
              className="min-h-[120px] font-mono text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fix">Solution/Fix</Label>
            <Textarea
              id="fix"
              value={fix}
              onChange={(e) => setFix(e.target.value)}
              placeholder="Describe how you fixed this error..."
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stackTrace">Stack Trace (Optional)</Label>
            <Textarea
              id="stackTrace"
              value={stackTrace}
              onChange={(e) => setStackTrace(e.target.value)}
              placeholder="Paste the full stack trace here..."
              className="min-h-[100px] font-mono text-xs"
            />
          </div>

          {/* Context Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="file">File/Component</Label>
              <Input
                id="file"
                value={context.file}
                onChange={(e) => setContext(prev => ({ ...prev, file: e.target.value }))}
                placeholder="filename.js"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Input
                id="project"
                value={context.project}
                onChange={(e) => setContext(prev => ({ ...prev, project: e.target.value }))}
                placeholder="Project name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="screenshot">Screenshot URL</Label>
              <Input
                id="screenshot"
                value={context.screenshot}
                onChange={(e) => setContext(prev => ({ ...prev, screenshot: e.target.value }))}
                placeholder="https://..."
              />
            </div>
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
              {errorLog ? 'Update Error Log' : 'Save Error Log'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};