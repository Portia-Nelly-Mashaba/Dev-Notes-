import { useState } from 'react';
import { Note, AIGeneratedContent } from '@/types';

export const useAI = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai-api-key') || '');

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('openai-api-key', key);
  };

  const generateSummary = async (notes: Note[]): Promise<string> => {
    if (!apiKey) throw new Error('OpenAI API key required');
    
    setIsGenerating(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that summarizes development notes and creates learning paths. Be concise and practical.'
            },
            {
              role: 'user',
              content: `Summarize these development notes and create a learning path:\n\n${notes.map(note => `Title: ${note.title}\nContent: ${note.content}\nTags: ${note.tags.join(', ')}`).join('\n\n')}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate summary');
      
      const data = await response.json();
      return data.choices[0].message.content;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMindMap = async (notes: Note[]): Promise<string> => {
    if (!apiKey) throw new Error('OpenAI API key required');
    
    setIsGenerating(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Create a Mermaid.js mind map diagram from development notes. Return only the mermaid syntax.'
            },
            {
              role: 'user',
              content: `Create a mind map from these notes:\n\n${notes.map(note => `${note.title}: ${note.content.slice(0, 200)}...`).join('\n')}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.5,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate mind map');
      
      const data = await response.json();
      return data.choices[0].message.content;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    apiKey,
    saveApiKey,
    isGenerating,
    generateSummary,
    generateMindMap,
  };
};