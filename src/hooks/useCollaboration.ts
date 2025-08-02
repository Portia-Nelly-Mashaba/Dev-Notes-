import { useState, useEffect, useCallback } from 'react';
import { Note } from '@/types';

interface CollaborationSession {
  id: string;
  name: string;
  participants: Participant[];
  sharedNotes: string[];
  isActive: boolean;
  createdAt: Date;
}

interface Participant {
  id: string;
  name: string;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
  isOnline: boolean;
}

interface LiveEdit {
  noteId: string;
  content: string;
  lastModified: Date;
  modifiedBy: string;
}

export const useCollaboration = () => {
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);
  const [liveEdits, setLiveEdits] = useState<Map<string, LiveEdit>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  // Mock WebSocket connection (in real app would use Liveblocks/Yjs)
  const mockConnection = {
    send: (data: any) => {
      console.log('Mock sending:', data);
      // Simulate receiving data back
      setTimeout(() => {
        if (data.type === 'cursor_move') {
          // Simulate other user's cursor
          updateParticipantCursor('user-2', { x: data.x + 10, y: data.y + 10 });
        }
      }, 100);
    },
    on: (event: string, callback: Function) => {
      // Mock event listener
    }
  };

  // Create collaboration session
  const createSession = useCallback((name: string, noteIds: string[]): CollaborationSession => {
    const session: CollaborationSession = {
      id: crypto.randomUUID(),
      name,
      participants: [{
        id: 'current-user',
        name: 'You',
        isOnline: true
      }],
      sharedNotes: noteIds,
      isActive: true,
      createdAt: new Date()
    };

    setSessions(prev => [...prev, session]);
    setCurrentSession(session);
    setIsConnected(true);

    return session;
  }, []);

  // Join existing session
  const joinSession = useCallback((sessionId: string, userName: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return false;

    const updatedSession = {
      ...session,
      participants: [
        ...session.participants,
        {
          id: crypto.randomUUID(),
          name: userName,
          isOnline: true
        }
      ]
    };

    setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));
    setCurrentSession(updatedSession);
    setIsConnected(true);

    return true;
  }, [sessions]);

  // Leave session
  const leaveSession = useCallback(() => {
    setCurrentSession(null);
    setIsConnected(false);
    setLiveEdits(new Map());
  }, []);

  // Share note with session
  const shareNote = useCallback((noteId: string) => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      sharedNotes: [...currentSession.sharedNotes, noteId]
    };

    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
  }, [currentSession]);

  // Handle live editing
  const updateLiveEdit = useCallback((noteId: string, content: string, userId: string) => {
    const liveEdit: LiveEdit = {
      noteId,
      content,
      lastModified: new Date(),
      modifiedBy: userId
    };

    setLiveEdits(prev => new Map(prev.set(noteId, liveEdit)));

    // Send to other participants
    mockConnection.send({
      type: 'live_edit',
      noteId,
      content,
      userId
    });
  }, []);

  // Handle cursor movement
  const updateCursor = useCallback((x: number, y: number) => {
    if (!currentSession) return;

    mockConnection.send({
      type: 'cursor_move',
      x,
      y,
      userId: 'current-user'
    });
  }, [currentSession]);

  // Update participant cursor
  const updateParticipantCursor = useCallback((participantId: string, position: { x: number; y: number }) => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      participants: currentSession.participants.map(p =>
        p.id === participantId ? { ...p, cursor: position } : p
      )
    };

    setCurrentSession(updatedSession);
  }, [currentSession]);

  // Generate session invite link
  const generateInviteLink = useCallback((sessionId: string): string => {
    return `${window.location.origin}?join=${sessionId}`;
  }, []);

  // Handle session comments/discussions
  const addComment = useCallback((noteId: string, comment: string, line?: number) => {
    // In real implementation, this would sync comments across participants
    console.log('Adding comment:', { noteId, comment, line });
  }, []);

  // Voice/video call integration (mock)
  const startVoiceCall = useCallback(() => {
    console.log('Starting voice call...');
    // Would integrate with WebRTC or service like Daily.co
  }, []);

  // Screen sharing (mock)
  const startScreenShare = useCallback(() => {
    console.log('Starting screen share...');
    // Would use WebRTC screen capture API
  }, []);

  // Check if note is being edited by someone else
  const isNoteBeingEdited = useCallback((noteId: string): boolean => {
    const liveEdit = liveEdits.get(noteId);
    if (!liveEdit) return false;
    
    // Consider "being edited" if modified within last 5 seconds
    const timeDiff = Date.now() - liveEdit.lastModified.getTime();
    return timeDiff < 5000;
  }, [liveEdits]);

  // Get who is editing a note
  const getNoteEditor = useCallback((noteId: string): string | null => {
    const liveEdit = liveEdits.get(noteId);
    return liveEdit?.modifiedBy || null;
  }, [liveEdits]);

  return {
    sessions,
    currentSession,
    isConnected,
    liveEdits,
    createSession,
    joinSession,
    leaveSession,
    shareNote,
    updateLiveEdit,
    updateCursor,
    generateInviteLink,
    addComment,
    startVoiceCall,
    startScreenShare,
    isNoteBeingEdited,
    getNoteEditor
  };
};