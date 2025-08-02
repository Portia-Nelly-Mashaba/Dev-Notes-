import { useState, useCallback } from 'react';
import { Octokit } from '@octokit/rest';
import { Note } from '@/types';

interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

interface Issue {
  id: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: string[];
  url: string;
}

export const useGitHubIntegration = () => {
  const [config, setConfig] = useState<GitHubConfig>(() => {
    const stored = localStorage.getItem('github-config');
    return stored ? JSON.parse(stored) : { token: '', owner: '', repo: '' };
  });
  
  const [isConnected, setIsConnected] = useState(!!config.token);
  const [isLoading, setIsLoading] = useState(false);

  const octokit = config.token ? new Octokit({ auth: config.token }) : null;

  // Save GitHub configuration
  const saveConfig = useCallback((newConfig: GitHubConfig) => {
    setConfig(newConfig);
    localStorage.setItem('github-config', JSON.stringify(newConfig));
    setIsConnected(!!newConfig.token);
  }, []);

  // Create GitHub issue from note
  const createIssue = useCallback(async (note: Note, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<Issue | null> => {
    if (!octokit || !config.owner || !config.repo) return null;

    setIsLoading(true);
    try {
      const labels = [
        'dev-notes',
        note.type,
        `priority-${priority}`,
        ...note.tags.slice(0, 3) // Limit to 3 tags
      ];

      const body = `
## Note Details
- **Type**: ${note.type}
- **Language**: ${note.language}
- **Created**: ${note.createdAt.toLocaleDateString()}

## Content
${note.content}

---
*Auto-generated from Dev Notes Pad*
`;

      const response = await octokit.rest.issues.create({
        owner: config.owner,
        repo: config.repo,
        title: note.title,
        body,
        labels
      });

      return {
        id: response.data.number,
        title: response.data.title,
        body: response.data.body || '',
        state: response.data.state as 'open' | 'closed',
        labels: response.data.labels.map(l => typeof l === 'string' ? l : l.name || ''),
        url: response.data.html_url
      };
    } catch (error) {
      console.error('Failed to create GitHub issue:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [octokit, config]);

  // Monitor TODOs and FIXMEs in notes
  const monitorTodos = useCallback((notes: Note[]) => {
    const todoPattern = /(?:TODO|FIXME|HACK|BUG):\s*(.+)(?:\s*(?:deadline|due):\s*(\d{4}-\d{2}-\d{2}))?/gi;
    const todos: Array<{
      note: Note;
      task: string;
      deadline?: Date;
      type: 'TODO' | 'FIXME' | 'HACK' | 'BUG';
    }> = [];

    notes.forEach(note => {
      let match;
      while ((match = todoPattern.exec(note.content)) !== null) {
        todos.push({
          note,
          task: match[1].trim(),
          deadline: match[2] ? new Date(match[2]) : undefined,
          type: match[0].split(':')[0].trim() as any
        });
      }
    });

    // Check for approaching deadlines
    const now = new Date();
    const urgentTodos = todos.filter(todo => {
      if (!todo.deadline) return false;
      const daysUntilDeadline = Math.ceil((todo.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDeadline <= 3 && daysUntilDeadline >= 0;
    });

    return { allTodos: todos, urgentTodos };
  }, []);

  // Auto-create issues for urgent TODOs
  const createUrgentIssues = useCallback(async (urgentTodos: any[]) => {
    if (!octokit) return [];

    const createdIssues = [];
    
    for (const todo of urgentTodos) {
      try {
        const issue = await createIssue(todo.note, 'high');
        if (issue) {
          createdIssues.push({ todo, issue });
        }
      } catch (error) {
        console.error('Failed to create urgent issue:', error);
      }
    }

    return createdIssues;
  }, [createIssue, octokit]);

  // Generate commit message from note
  const generateCommitMessage = useCallback((note: Note, changeType: 'feat' | 'fix' | 'docs' | 'refactor' = 'feat'): string => {
    const scope = note.language || note.type;
    const description = note.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    
    // Follow conventional commits format
    return `${changeType}(${scope}): ${description}

${note.content.slice(0, 200)}${note.content.length > 200 ? '...' : ''}

Tags: ${note.tags.join(', ')}`;
  }, []);

  // Sync notes as documentation
  const syncToRepository = useCallback(async (notes: Note[], branch = 'main') => {
    if (!octokit || !config.owner || !config.repo) return false;

    setIsLoading(true);
    try {
      // Create docs folder structure
      const docsPath = 'docs/dev-notes';
      const filesByType = notes.reduce((acc, note) => {
        const type = note.type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(note);
        return acc;
      }, {} as Record<string, Note[]>);

      for (const [type, typeNotes] of Object.entries(filesByType)) {
        const content = typeNotes.map(note => `
## ${note.title}

**Language**: ${note.language}  
**Tags**: ${note.tags.join(', ')}  
**Created**: ${note.createdAt.toLocaleDateString()}

${note.content}

---
`).join('\n');

        const filePath = `${docsPath}/${type}.md`;
        
        try {
          // Try to get existing file
          const { data: existingFile } = await octokit.rest.repos.getContent({
            owner: config.owner,
            repo: config.repo,
            path: filePath,
            ref: branch
          });

          // Update existing file
          await octokit.rest.repos.createOrUpdateFileContents({
            owner: config.owner,
            repo: config.repo,
            path: filePath,
            message: `docs: update ${type} notes`,
            content: Buffer.from(content).toString('base64'),
            sha: Array.isArray(existingFile) ? undefined : existingFile.sha,
            branch
          });
        } catch (error: any) {
          if (error.status === 404) {
            // Create new file
            await octokit.rest.repos.createOrUpdateFileContents({
              owner: config.owner,
              repo: config.repo,
              path: filePath,
              message: `docs: add ${type} notes`,
              content: Buffer.from(content).toString('base64'),
              branch
            });
          } else {
            throw error;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to sync to repository:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [octokit, config]);

  return {
    config,
    isConnected,
    isLoading,
    saveConfig,
    createIssue,
    monitorTodos,
    createUrgentIssues,
    generateCommitMessage,
    syncToRepository
  };
};