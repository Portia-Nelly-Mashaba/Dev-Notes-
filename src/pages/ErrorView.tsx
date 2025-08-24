import { useParams, useNavigate } from 'react-router-dom';
import { useErrorLogs } from '@/hooks/useErrorLogs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Edit2, Calendar, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { format } from 'date-fns';

const ErrorView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { errorLogs } = useErrorLogs();

  const error = errorLogs.find(e => e.id === id);

  if (!error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error log not found</h2>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

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
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  {error.title}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(error.createdAt, 'MMM d, yyyy')}
                  </span>
                  {error.context?.project && (
                    <Badge variant="outline" className="text-xs">
                      {error.context.project}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => navigate(`/edit-error/${error.id}`)}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Tags */}
        {error.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {error.tags.map(tag => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Error Message */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Error Details
            </h2>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap font-mono text-sm bg-destructive/10 p-4 rounded-lg border border-destructive/20 overflow-auto">
              {error.errorMessage}
            </pre>
          </CardContent>
        </Card>

        {/* Stack Trace */}
        {error.stackTrace && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Stack Trace</h3>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap font-mono text-xs bg-muted p-4 rounded-lg border overflow-auto">
                {error.stackTrace}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Solution */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Solution
            </h3>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{error.fix}</p>
            </div>
          </CardContent>
        </Card>

        {/* Context Information */}
        {error.context && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Context</h3>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {error.context.file && (
                <div>
                  <span className="font-medium text-muted-foreground">File:</span>
                  <p className="font-mono text-sm">{error.context.file}</p>
                </div>
              )}
              {error.context.project && (
                <div>
                  <span className="font-medium text-muted-foreground">Project:</span>
                  <p>{error.context.project}</p>
                </div>
              )}
              {error.context.screenshot && (
                <div className="md:col-span-2">
                  <span className="font-medium text-muted-foreground">Screenshot:</span>
                  <img 
                    src={error.context.screenshot} 
                    alt="Error screenshot" 
                    className="mt-2 rounded-lg border max-w-full h-auto"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Related Note */}
        {error.relatedNoteId && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Related Note
              </h3>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => navigate(`/note/${error.relatedNoteId}`)}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                View Related Note
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Metadata</h3>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Created:</span>
              <p>{format(error.createdAt, 'PPpp')}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Error ID:</span>
              <p className="font-mono">{error.id}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ErrorView;