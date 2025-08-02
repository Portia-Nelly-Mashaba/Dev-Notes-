import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { History, Search, Clock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useAdvancedAI } from '@/hooks/useAdvancedAI';
import { ErrorLog } from '@/types';

interface TimeMachineDebuggerProps {
  errorLogs: ErrorLog[];
}

export const TimeMachineDebugger: React.FC<TimeMachineDebuggerProps> = ({ errorLogs }) => {
  const [currentError, setCurrentError] = useState('');
  const [similarErrors, setSimilarErrors] = useState<ErrorLog[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { findSimilarErrors } = useAdvancedAI();

  const handleSearch = async () => {
    if (!currentError.trim()) return;

    setIsSearching(true);
    try {
      const similar = await findSimilarErrors(currentError, errorLogs);
      setSimilarErrors(similar);
    } catch (error) {
      console.error('Failed to find similar errors:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffWeeks === 1) return '1 week ago';
    if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
    if (diffMonths === 1) return '1 month ago';
    return `${diffMonths} months ago`;
  };

  const getSimilarityScore = (error: ErrorLog): number => {
    // Simple similarity calculation - in production would use proper algorithms
    const currentWords = currentError.toLowerCase().split(/\W+/);
    const errorWords = error.errorMessage.toLowerCase().split(/\W+/);
    
    const commonWords = currentWords.filter(word => 
      word.length > 3 && errorWords.includes(word)
    );
    
    return Math.min(100, (commonWords.length / Math.max(currentWords.length, errorWords.length)) * 100);
  };

  const generateInsights = (): string[] => {
    if (similarErrors.length === 0) return [];

    const insights = [];
    const totalSimilar = similarErrors.length;
    const recentErrors = similarErrors.filter(error => {
      const daysAgo = (Date.now() - error.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    });

    if (totalSimilar > 1) {
      insights.push(`You've encountered ${totalSimilar} similar errors before`);
    }

    if (recentErrors.length > 0) {
      insights.push(`${recentErrors.length} similar errors occurred in the last 30 days`);
    }

    const commonTags = new Map<string, number>();
    similarErrors.forEach(error => {
      error.tags.forEach(tag => {
        commonTags.set(tag, (commonTags.get(tag) || 0) + 1);
      });
    });

    const mostCommonTag = Array.from(commonTags.entries())
      .sort((a, b) => b[1] - a[1])[0];

    if (mostCommonTag) {
      insights.push(`Most common context: ${mostCommonTag[0]}`);
    }

    return insights;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-blue-500" />
          Time Machine Debugger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Error Message</label>
          <div className="flex gap-2">
            <Input
              placeholder="Paste your error message here..."
              value={currentError}
              onChange={(e) => setCurrentError(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              disabled={isSearching || !currentError.trim()}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Insights */}
        {similarErrors.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {generateInsights().map((insight, index) => (
                  <div key={index} className="text-sm">• {insight}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Similar Errors */}
        {similarErrors.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Similar Errors from Your Past</h4>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {similarErrors.map((error) => (
                  <Card key={error.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <h5 className="font-medium text-sm">{error.title}</h5>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {getSimilarityScore(error)}% match
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {getTimeAgo(error.createdAt)}
                            </div>
                          </div>
                        </div>

                        {/* Error Message */}
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded text-sm border-l-2 border-red-500">
                          <strong>Error:</strong>
                          <p className="mt-1 font-mono text-xs">{error.errorMessage}</p>
                        </div>

                        {/* Solution */}
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded text-sm border-l-2 border-green-500">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <strong>How you solved it:</strong>
                          </div>
                          <p className="text-sm">{error.fix}</p>
                        </div>

                        {/* Context */}
                        {error.context && (
                          <div className="text-xs text-muted-foreground space-y-1">
                            {error.context.file && (
                              <div>📄 File: {error.context.file}</div>
                            )}
                            {error.context.project && (
                              <div>📁 Project: {error.context.project}</div>
                            )}
                          </div>
                        )}

                        {/* Tags */}
                        <div className="flex gap-1 flex-wrap">
                          {error.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Stack Trace */}
                        {error.stackTrace && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              View Stack Trace
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded font-mono text-xs overflow-auto">
                              {error.stackTrace}
                            </pre>
                          </details>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Empty State */}
        {currentError && similarErrors.length === 0 && !isSearching && (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No similar errors found in your history</p>
            <p className="text-xs mt-1">This might be a new type of error to document!</p>
          </div>
        )}

        {!currentError && (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Paste an error message to find similar issues from your past</p>
            <p className="text-xs mt-1">Learn from your debugging history</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};