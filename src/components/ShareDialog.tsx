import { useState } from 'react';
import { Note } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Copy, Share2, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareDialogProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
}

export const ShareDialog = ({ note, isOpen, onClose, onUpdateNote }: ShareDialogProps) => {
  const [newEmail, setNewEmail] = useState('');
  const { toast } = useToast();

  if (!note) return null;

  const shareUrl = `${window.location.origin}/shared/${note.id}`;
  const sharedWith = note.sharedWith || [];

  const handleAddEmail = () => {
    const email = newEmail.trim();
    if (email && !sharedWith.includes(email)) {
      const updatedSharedWith = [...sharedWith, email];
      onUpdateNote(note.id, { sharedWith: updatedSharedWith });
      setNewEmail('');
      toast({
        title: "User Added",
        description: `Note shared with ${email}`,
      });
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    const updatedSharedWith = sharedWith.filter(email => email !== emailToRemove);
    onUpdateNote(note.id, { 
      sharedWith: updatedSharedWith.length ? updatedSharedWith : undefined 
    });
    toast({
      title: "Access Removed",
      description: `Removed sharing with ${emailToRemove}`,
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied",
      description: "Share link copied to clipboard",
    });
  };

  const handleCopyNote = () => {
    const noteText = `# ${note.title}\n\n${note.content}\n\n**Tags:** ${note.tags.join(', ')}\n**Language:** ${note.language}`;
    navigator.clipboard.writeText(noteText);
    toast({
      title: "Note Copied",
      description: "Note content copied to clipboard",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Note
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Note Info */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">{note.title}</h4>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline">{note.type}</Badge>
              <Badge variant="secondary">{note.language}</Badge>
            </div>
          </div>

          {/* Share Actions */}
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="w-full justify-start"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Share Link
            </Button>
            
            <Button
              variant="outline"
              onClick={handleCopyNote}
              className="w-full justify-start"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Note Content
            </Button>
          </div>

          {/* Email Sharing */}
          <div className="space-y-3">
            <Label>Share with specific users</Label>
            <div className="flex gap-2">
              <Input
                placeholder="email@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
              />
              <Button onClick={handleAddEmail} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Shared With List */}
            {sharedWith.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Shared with ({sharedWith.length})
                </Label>
                <div className="space-y-1">
                  {sharedWith.map(email => (
                    <div key={email} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEmail(email)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};