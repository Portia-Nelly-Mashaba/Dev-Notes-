import { useState } from 'react';
import { Note } from '@/types';
import { useAI } from '@/hooks/useAI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Lightbulb, Map, Key, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIPanelProps {
  selectedNotes: Note[];
  onClearSelection?: () => void;
}

export const AIPanel = ({ selectedNotes, onClearSelection }: AIPanelProps) => {
  const { apiKey, saveApiKey, isGenerating, generateSummary, generateMindMap } = useAI();
  const [tempApiKey, setTempApiKey] = useState('');
  const [result, setResult] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey);
  const { toast } = useToast();

  const handleSaveApiKey = () => {
    if (tempApiKey.trim()) {
      saveApiKey(tempApiKey.trim());
      setShowApiKeyInput(false);
      toast({
        title: "API Key Saved",
        description: "OpenAI API key has been saved locally.",
      });
    }
  };

  const handleGenerateSummary = async () => {
    if (!selectedNotes.length) {
      toast({
        title: "No Notes Selected",
        description: "Please select some notes to generate a summary.",
        variant: "destructive",
      });
      return;
    }

    try {
      const summary = await generateSummary(selectedNotes);
      setResult(summary);
      toast({
        title: "Summary Generated",
        description: "AI summary has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate summary",
        variant: "destructive",
      });
    }
  };

  const handleGenerateMindMap = async () => {
    if (!selectedNotes.length) {
      toast({
        title: "No Notes Selected",
        description: "Please select some notes to generate a mind map.",
        variant: "destructive",
      });
      return;
    }

    try {
      const mindMap = await generateMindMap(selectedNotes);
      setResult(mindMap);
      toast({
        title: "Mind Map Generated",
        description: "AI mind map has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate mind map",
        variant: "destructive",
      });
    }
  };

  if (showApiKeyInput) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            OpenAI API Key Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              To use AI features, please enter your OpenAI API key. It will be stored locally in your browser.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="sk-..."
            />
          </div>
          
          <Button onClick={handleSaveApiKey} disabled={!tempApiKey.trim()}>
            Save API Key
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Assistant
        </CardTitle>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{selectedNotes.length} notes selected</span>
          {selectedNotes.length > 0 && onClearSelection && (
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              Clear Selection
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* AI Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={handleGenerateSummary}
            disabled={isGenerating || !selectedNotes.length}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Lightbulb className="h-4 w-4" />
            )}
            Generate Summary
          </Button>
          
          <Button
            onClick={handleGenerateMindMap}
            disabled={isGenerating || !selectedNotes.length}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Map className="h-4 w-4" />
            )}
            Create Mind Map
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-2">
            <Label>AI Generated Content</Label>
            <Textarea
              value={result}
              readOnly
              className="min-h-[200px]"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(result)}
            >
              Copy to Clipboard
            </Button>
          </div>
        )}

        {/* API Key Management */}
        <div className="pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowApiKeyInput(true)}
            className="text-muted-foreground"
          >
            Change API Key
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};