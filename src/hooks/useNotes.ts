import { useState, useEffect, useMemo } from 'react';
import { Note, SearchFilters } from '@/types';

const STORAGE_KEY = 'devnotes-pad-notes';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({ query: '' });

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedNotes = JSON.parse(stored).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));
        setNotes(parsedNotes);
      } else {
        // Add dummy data if no stored notes
        const dummyNotes: Note[] = [
          {
            id: '1',
            title: 'React useEffect Hook Best Practices',
            content: `// Clean up subscriptions and event listeners
useEffect(() => {
  const subscription = dataService.subscribe(handleData);
  
  return () => {
    subscription.unsubscribe();
  };
}, []);

// Dependency array best practices
useEffect(() => {
  fetchUserData(userId);
}, [userId]); // Only re-run when userId changes`,
            type: 'snippet',
            language: 'javascript',
            tags: ['react', 'hooks', 'useEffect', 'cleanup'],
            isFavorite: true,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
          },
          {
            id: '2',
            title: 'PostgreSQL Performance Optimization',
            content: `-- Index optimization for complex queries
CREATE INDEX CONCURRENTLY idx_user_activity_date 
ON user_activity(user_id, created_at DESC);

-- Explain analyze for query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT u.name, COUNT(a.id) as activity_count
FROM users u 
LEFT JOIN user_activity a ON u.id = a.user_id 
WHERE u.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id, u.name
ORDER BY activity_count DESC;`,
            type: 'snippet',
            language: 'sql',
            tags: ['postgresql', 'performance', 'indexing', 'database'],
            isFavorite: false,
            createdAt: new Date('2024-01-10'),
            updatedAt: new Date('2024-01-12'),
          },
          {
            id: '3',
            title: 'Docker Multi-stage Build Tutorial',
            content: `# Multi-stage Dockerfile for Node.js app
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

# Benefits:
# - Smaller final image size
# - Security (no build tools in production)
# - Faster deployments`,
            type: 'tutorial',
            language: 'dockerfile',
            tags: ['docker', 'optimization', 'nodejs', 'deployment'],
            isFavorite: true,
            createdAt: new Date('2024-01-08'),
            updatedAt: new Date('2024-01-08'),
          },
          {
            id: '4',
            title: 'TypeScript Generic Utility Types',
            content: `// Useful TypeScript utility patterns
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Example usage
interface User {
  id: string;
  name: string;
  email: string;
  profile: {
    avatar: string;
    bio: string;
  };
}

type UserUpdate = Optional<User, 'id'>;
type PartialUser = DeepPartial<User>;`,
            type: 'snippet',
            language: 'typescript',
            tags: ['typescript', 'generics', 'utility-types', 'types'],
            isFavorite: false,
            createdAt: new Date('2024-01-05'),
            updatedAt: new Date('2024-01-07'),
          },
          {
            id: '5',
            title: 'API Authentication Microservice',
            content: `# JWT Authentication Service Architecture

## Overview
Centralized authentication service using JWT tokens with refresh token rotation.

## Tech Stack
- Node.js + Express
- Redis for session storage
- PostgreSQL for user data
- Docker containerization

## Key Features
- Token rotation every 15 minutes
- Blacklist for revoked tokens
- Rate limiting on login attempts
- Social OAuth integration

## Security Considerations
- HTTPS only in production
- Secure httpOnly cookies
- CSRF protection
- Input validation with Joi`,
            type: 'project',
            language: 'markdown',
            tags: ['authentication', 'microservices', 'jwt', 'security', 'nodejs'],
            isFavorite: true,
            createdAt: new Date('2024-01-03'),
            updatedAt: new Date('2024-01-04'),
          },
          {
            id: '6',
            title: 'Kubernetes Helm Chart Template',
            content: `# values.yaml
replicaCount: 3
image:
  repository: myapp
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: api.example.com
      paths: ["/"]

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi`,
            type: 'tool',
            language: 'yaml',
            tags: ['kubernetes', 'helm', 'devops', 'deployment'],
            isFavorite: false,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-02'),
          }
        ];
        setNotes(dummyNotes);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  }, [notes]);

  const addNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes(prev => [newNote, ...prev]);
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const toggleFavorite = (id: string) => {
    updateNote(id, { isFavorite: !notes.find(n => n.id === id)?.isFavorite });
  };

  // Search and filter logic
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesQuery = !filters.query || 
        note.title.toLowerCase().includes(filters.query.toLowerCase()) ||
        note.content.toLowerCase().includes(filters.query.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(filters.query.toLowerCase()));

      const matchesType = !filters.type || note.type === filters.type;
      const matchesLanguage = !filters.language || note.language === filters.language;
      const matchesTags = !filters.tags?.length || 
        filters.tags.some(tag => note.tags.includes(tag));
      const matchesFavorite = filters.isFavorite === undefined || 
        note.isFavorite === filters.isFavorite;

      return matchesQuery && matchesType && matchesLanguage && matchesTags && matchesFavorite;
    });
  }, [notes, filters]);

  // Get all unique tags and languages
  const allTags = useMemo(() => 
    [...new Set(notes.flatMap(note => note.tags))].sort(), 
    [notes]
  );

  const allLanguages = useMemo(() => 
    [...new Set(notes.map(note => note.language).filter(Boolean))].sort(), 
    [notes]
  );

  return {
    notes: filteredNotes,
    allNotes: notes,
    allTags,
    allLanguages,
    filters,
    setFilters,
    addNote,
    updateNote,
    deleteNote,
    toggleFavorite,
  };
};