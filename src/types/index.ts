export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'snippet' | 'tutorial' | 'tool' | 'project';
  language: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  sharedWith?: string[];
}

export interface ErrorLog {
  id: string;
  title: string;
  errorMessage: string;
  fix: string;
  stackTrace?: string;
  relatedNoteId?: string;
  tags: string[];
  createdAt: Date;
  context?: {
    file?: string;
    project?: string;
    screenshot?: string;
  };
}

export interface AIGeneratedContent {
  id: string;
  type: 'summary' | 'mindmap' | 'learning-path';
  sourceNoteIds: string[];
  content: string;
  createdAt: Date;
}

export type SearchFilters = {
  query: string;
  type?: Note['type'];
  language?: string;
  tags?: string[];
  isFavorite?: boolean;
};