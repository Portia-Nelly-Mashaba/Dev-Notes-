import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useAdvancedAI } from '@/hooks/useAdvancedAI';
import { CodeEditor } from './CodeEditor';

interface CodeReviewerProps {
  code: string;
  language: string;
  onCodeChange: (code: string) => void;
}

interface ReviewSuggestion {
  line: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
}

export const CodeReviewer: React.FC<CodeReviewerProps> = ({ 
  code, 
  language, 
  onCodeChange 
}) => {
  const [review, setReview] = useState<{
    suggestions: ReviewSuggestion[];
    score: number;
    bestPractices: string[];
  } | null>(null);
  const { reviewCode, isGenerating } = useAdvancedAI();

  const handleReview = async () => {
    if (!code.trim()) return;

    try {
      const result = await reviewCode(code, language);
      setReview(result);
    } catch (error) {
      console.error('Code review failed:', error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'outline';
      default: return 'outline';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              AI Code Reviewer
            </span>
            <Button 
              onClick={handleReview} 
              disabled={isGenerating || !code.trim()}
              size="sm"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Review Code
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <CodeEditor
              value={code}
              onChange={onCodeChange}
              language={language}
              height="300px"
            />
          </div>

          {review && (
            <div className="space-y-4">
              {/* Score */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(review.score)}`}>
                    {review.score}/100
                  </div>
                  <div className="text-sm text-muted-foreground">Code Quality</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">Assessment</div>
                  <div className="text-sm text-muted-foreground">
                    {review.score >= 80 && "Excellent code quality with minimal issues"}
                    {review.score >= 60 && review.score < 80 && "Good code with some room for improvement"}
                    {review.score < 60 && "Code needs significant improvements"}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              {review.suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Suggestions ({review.suggestions.length})</h4>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {review.suggestions.map((suggestion, index) => (
                        <Alert key={index} className="border-l-4" style={{
                          borderLeftColor: 
                            suggestion.severity === 'error' ? '#ef4444' :
                            suggestion.severity === 'warning' ? '#f59e0b' : '#3b82f6'
                        }}>
                          <div className="flex items-start gap-3">
                            {getSeverityIcon(suggestion.severity)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={getSeverityColor(suggestion.severity) as any}>
                                  Line {suggestion.line}
                                </Badge>
                                <Badge variant="outline">
                                  {suggestion.severity.toUpperCase()}
                                </Badge>
                              </div>
                              <AlertDescription className="mb-2">
                                {suggestion.message}
                              </AlertDescription>
                              <div className="text-sm bg-muted p-2 rounded border-l-2 border-green-500">
                                <strong>Suggestion:</strong> {suggestion.suggestion}
                              </div>
                            </div>
                          </div>
                        </Alert>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Best Practices */}
              {review.bestPractices.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Best Practices</h4>
                  <div className="space-y-2">
                    {review.bestPractices.map((practice, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{practice}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};