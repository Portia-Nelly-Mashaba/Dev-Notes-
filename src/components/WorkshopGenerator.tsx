import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, BookOpen, Play, Download, Share } from 'lucide-react';
import { useAdvancedAI } from '@/hooks/useAdvancedAI';
import { Note } from '@/types';

interface WorkshopGeneratorProps {
  selectedNotes: Note[];
  onClearSelection?: () => void;
}

export const WorkshopGenerator: React.FC<WorkshopGeneratorProps> = ({ 
  selectedNotes, 
  onClearSelection 
}) => {
  const [workshop, setWorkshop] = useState<string>('');
  const [workshopTitle, setWorkshopTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateWorkshop } = useAdvancedAI();

  const handleGenerate = async () => {
    if (selectedNotes.length === 0) return;

    setIsGenerating(true);
    try {
      const generated = await generateWorkshop(selectedNotes);
      setWorkshop(generated);
      
      // Auto-generate title from notes
      const topics = Array.from(new Set(selectedNotes.flatMap(note => note.tags)))
        .slice(0, 3)
        .join(', ');
      setWorkshopTitle(`Workshop: ${topics || 'Development Guide'}`);
    } catch (error) {
      console.error('Failed to generate workshop:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportWorkshop = () => {
    const content = `# ${workshopTitle}\n\n${workshop}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workshopTitle.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareWorkshop = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: workshopTitle,
          text: 'Check out this development workshop!',
          url: window.location.href
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${workshopTitle}\n\n${workshop}`);
      alert('Workshop copied to clipboard!');
    }
  };

  const parseWorkshopSections = (content: string) => {
    if (!content) return [];
    
    const sections = content.split(/^##\s+/m).filter(Boolean);
    return sections.map((section, index) => {
      const [title, ...bodyParts] = section.split('\n');
      const body = bodyParts.join('\n').trim();
      return {
        id: index,
        title: title.trim(),
        content: body,
        type: detectSectionType(title, body)
      };
    });
  };

  const detectSectionType = (title: string, content: string): 'objective' | 'exercise' | 'code' | 'theory' | 'challenge' => {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('objective') || lowerTitle.includes('goal')) return 'objective';
    if (lowerTitle.includes('exercise') || lowerTitle.includes('practice')) return 'exercise';
    if (lowerTitle.includes('challenge') || lowerTitle.includes('quiz')) return 'challenge';
    if (content.includes('```')) return 'code';
    return 'theory';
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'objective': return '🎯';
      case 'exercise': return '💻';
      case 'code': return '📝';
      case 'challenge': return '🧩';
      default: return '📚';
    }
  };

  const sections = parseWorkshopSections(workshop);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-green-500" />
          Workshop Generator
        </CardTitle>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{selectedNotes.length} notes selected</span>
          <div className="flex gap-2">
            {onClearSelection && (
              <Button variant="ghost" size="sm" onClick={onClearSelection}>
                Clear Selection
              </Button>
            )}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || selectedNotes.length === 0}
              size="sm"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Generate Workshop
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Selected Notes Preview */}
        {selectedNotes.length > 0 && !workshop && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Selected Notes:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedNotes.map(note => (
                <Badge key={note.id} variant="outline" className="text-xs">
                  {note.title}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Workshop Content */}
        {workshop && (
          <div className="space-y-4">
            {/* Workshop Title */}
            <div className="space-y-2">
              <Input
                value={workshopTitle}
                onChange={(e) => setWorkshopTitle(e.target.value)}
                placeholder="Workshop Title"
                className="font-medium"
              />
              <div className="flex gap-2">
                <Button onClick={exportWorkshop} size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button onClick={shareWorkshop} size="sm" variant="outline">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Workshop Tabs */}
            <Tabs defaultValue="structured" className="w-full">
              <TabsList>
                <TabsTrigger value="structured">Structured View</TabsTrigger>
                <TabsTrigger value="markdown">Markdown</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="structured" className="space-y-4">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {sections.map(section => (
                      <Card key={section.id} className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <span>{getSectionIcon(section.type)}</span>
                            {section.title}
                            <Badge variant="secondary" className="text-xs">
                              {section.type}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {section.type === 'code' ? (
                            <pre className="bg-muted p-3 rounded text-sm font-mono overflow-auto">
                              {section.content}
                            </pre>
                          ) : (
                            <div className="text-sm whitespace-pre-wrap">
                              {section.content}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="markdown">
                <ScrollArea className="h-96">
                  <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded">
                    {`# ${workshopTitle}\n\n${workshop}`}
                  </pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="preview">
                <ScrollArea className="h-96">
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ 
                      __html: workshop.replace(/\n/g, '<br>').replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
                    }}
                  />
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Empty State */}
        {selectedNotes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select notes to generate an interactive workshop</p>
            <p className="text-xs mt-1">Transform your knowledge into structured learning content</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};