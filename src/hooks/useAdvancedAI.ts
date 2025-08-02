import { useState, useCallback } from 'react';
import { Note, ErrorLog } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CodeReview {
  suggestions: Array<{
    line: number;
    severity: 'error' | 'warning' | 'info';
    message: string;
    suggestion: string;
  }>;
  score: number;
  bestPractices: string[];
}

interface DependencyMap {
  nodes: Array<{
    id: string;
    label: string;
    type: 'note' | 'concept' | 'framework';
    size: number;
  }>;
  edges: Array<{
    source: string;
    target: string;
    strength: number;
  }>;
}

export const useAdvancedAI = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai-api-key') || '');
  const { toast } = useToast();

  const makeAIRequest = async (messages: any[], model = 'gpt-4.1-2025-04-14') => {
    if (!apiKey) throw new Error('OpenAI API key required');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) throw new Error('AI request failed');
    const data = await response.json();
    return data.choices[0].message.content;
  };

  const reviewCode = useCallback(async (code: string, language: string): Promise<CodeReview> => {
    setIsGenerating(true);
    try {
      const response = await makeAIRequest([
        {
          role: 'system',
          content: `You are a senior code reviewer. Analyze the ${language} code and return a JSON object with:
          - suggestions: array of {line, severity, message, suggestion}
          - score: code quality score 0-100
          - bestPractices: array of best practice recommendations
          Be constructive and specific.`
        },
        {
          role: 'user',
          content: `Review this ${language} code:\n\n${code}`
        }
      ]);
      
      return JSON.parse(response);
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey]);

  const generateDependencyMap = useCallback(async (notes: Note[]): Promise<DependencyMap> => {
    setIsGenerating(true);
    try {
      const notesData = notes.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content.slice(0, 500),
        tags: note.tags,
        language: note.language
      }));

      const response = await makeAIRequest([
        {
          role: 'system',
          content: `Analyze these code notes and create a dependency/relationship map. Return JSON with:
          - nodes: array of {id, label, type, size}
          - edges: array of {source, target, strength}
          Identify conceptual relationships, shared frameworks, and knowledge dependencies.`
        },
        {
          role: 'user',
          content: `Notes to analyze:\n${JSON.stringify(notesData, null, 2)}`
        }
      ]);
      
      return JSON.parse(response);
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey]);

  const findSimilarErrors = useCallback(async (errorMessage: string, errorLogs: ErrorLog[]): Promise<ErrorLog[]> => {
    setIsGenerating(true);
    try {
      const logsData = errorLogs.map(log => ({
        id: log.id,
        title: log.title,
        errorMessage: log.errorMessage,
        fix: log.fix
      }));

      const response = await makeAIRequest([
        {
          role: 'system',
          content: `Find the most similar error from the historical logs. Return an array of log IDs ranked by similarity, limit to top 3.`
        },
        {
          role: 'user',
          content: `Current error: ${errorMessage}\n\nHistorical logs:\n${JSON.stringify(logsData, null, 2)}`
        }
      ]);
      
      const similarIds = JSON.parse(response);
      return errorLogs.filter(log => similarIds.includes(log.id));
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey]);

  const generateDocumentation = useCallback(async (code: string, language: string): Promise<string> => {
    setIsGenerating(true);
    try {
      const response = await makeAIRequest([
        {
          role: 'system',
          content: `Generate comprehensive documentation for this ${language} code. Include:
          - Purpose and functionality
          - Parameters and return values
          - Usage examples
          - Edge cases and considerations
          Format as markdown.`
        },
        {
          role: 'user',
          content: code
        }
      ]);
      
      return response;
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey]);

  const generateRFC = useCallback(async (notes: Note[], title: string): Promise<string> => {
    setIsGenerating(true);
    try {
      const notesContent = notes.map(note => `${note.title}:\n${note.content}`).join('\n\n');
      
      const response = await makeAIRequest([
        {
          role: 'system',
          content: `Transform these technical notes into a professional RFC document with:
          - Summary
          - Motivation
          - Detailed Design
          - Drawbacks
          - Alternatives
          - Unresolved Questions
          Follow RFC 2119 conventions.`
        },
        {
          role: 'user',
          content: `RFC Title: ${title}\n\nNotes:\n${notesContent}`
        }
      ]);
      
      return response;
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey]);

  const generateWorkshop = useCallback(async (notes: Note[]): Promise<string> => {
    setIsGenerating(true);
    try {
      const notesContent = notes.map(note => ({
        title: note.title,
        content: note.content,
        language: note.language,
        type: note.type
      }));
      
      const response = await makeAIRequest([
        {
          role: 'system',
          content: `Create an interactive workshop/tutorial from these notes. Generate MDX content with:
          - Learning objectives
          - Step-by-step exercises
          - Code examples with explanations
          - Practice challenges
          - Summary and next steps
          Make it engaging and hands-on.`
        },
        {
          role: 'user',
          content: `Notes for workshop:\n${JSON.stringify(notesContent, null, 2)}`
        }
      ]);
      
      return response;
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey]);

  const generateADR = useCallback(async (decision: string, context: string): Promise<string> => {
    setIsGenerating(true);
    try {
      const response = await makeAIRequest([
        {
          role: 'system',
          content: `Generate an Architecture Decision Record (ADR) following the standard format:
          - Title
          - Status (Proposed/Accepted/Deprecated/Superseded)
          - Context
          - Decision
          - Consequences
          Be specific and include trade-offs.`
        },
        {
          role: 'user',
          content: `Decision: ${decision}\nContext: ${context}`
        }
      ]);
      
      return response;
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey]);

  return {
    apiKey,
    setApiKey,
    isGenerating,
    reviewCode,
    generateDependencyMap,
    findSimilarErrors,
    generateDocumentation,
    generateRFC,
    generateWorkshop,
    generateADR
  };
};