import { useState, useEffect, useMemo } from 'react';
import { Note, ErrorLog } from '@/types';

interface KarmaMetrics {
  totalPoints: number;
  level: number;
  timeSaved: number; // in minutes
  notesCreated: number;
  errorsFixed: number;
  knowledgeShared: number;
  consistency: number; // daily usage streak
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  {
    id: 'first-note',
    title: 'Knowledge Seeker',
    description: 'Created your first note',
    icon: '📝',
    rarity: 'common'
  },
  {
    id: 'error-solver',
    title: 'Bug Whisperer',
    description: 'Logged and solved 10 errors',
    icon: '🐛',
    rarity: 'rare'
  },
  {
    id: 'streak-7',
    title: 'Consistent Learner',
    description: '7-day learning streak',
    icon: '🔥',
    rarity: 'rare'
  },
  {
    id: 'code-reviewer',
    title: 'Quality Guardian',
    description: 'Used AI code review 25 times',
    icon: '👨‍💻',
    rarity: 'epic'
  },
  {
    id: 'knowledge-master',
    title: 'Knowledge Master',
    description: 'Created 100+ notes',
    icon: '🧠',
    rarity: 'legendary'
  }
];

export const useKarmaSystem = (notes: Note[], errorLogs: ErrorLog[]) => {
  const [metrics, setMetrics] = useState<KarmaMetrics>(() => {
    const stored = localStorage.getItem('karma-metrics');
    return stored ? JSON.parse(stored) : {
      totalPoints: 0,
      level: 1,
      timeSaved: 0,
      notesCreated: 0,
      errorsFixed: 0,
      knowledgeShared: 0,
      consistency: 0,
      achievements: []
    };
  });

  // Calculate current metrics
  const currentMetrics = useMemo(() => {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentNotes = notes.filter(note => note.createdAt >= monthAgo);
    const recentErrors = errorLogs.filter(log => log.createdAt >= monthAgo);
    
    // Calculate points
    let points = 0;
    points += notes.length * 10; // 10 points per note
    points += errorLogs.length * 25; // 25 points per error logged
    points += recentNotes.length * 5; // Bonus for recent activity
    
    // Estimate time saved (based on note usage and error fixes)
    const timeSaved = 
      (notes.length * 15) + // 15 min saved per note on average
      (errorLogs.length * 60); // 1 hour saved per error documented

    // Calculate level (square root scaling)
    const level = Math.floor(Math.sqrt(points / 100)) + 1;

    return {
      totalPoints: points,
      level,
      timeSaved,
      notesCreated: notes.length,
      errorsFixed: errorLogs.length,
      knowledgeShared: 0, // Would be calculated from shares
      consistency: calculateStreak(notes),
      achievements: checkAchievements(notes, errorLogs, metrics.achievements)
    };
  }, [notes, errorLogs, metrics.achievements]);

  // Calculate daily usage streak
  const calculateStreak = (notes: Note[]): number => {
    if (!notes.length) return 0;

    const sortedNotes = [...notes].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) { // Check last 30 days
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const hasActivity = sortedNotes.some(note => {
        const noteDate = new Date(note.createdAt);
        return noteDate >= dayStart && noteDate <= dayEnd;
      });

      if (hasActivity) {
        streak++;
      } else if (i > 0) {
        break; // Streak broken
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  // Check for new achievements
  const checkAchievements = (
    notes: Note[], 
    errorLogs: ErrorLog[], 
    existing: Achievement[]
  ): Achievement[] => {
    const existingIds = existing.map(a => a.id);
    const newAchievements = [...existing];

    ACHIEVEMENTS.forEach(template => {
      if (existingIds.includes(template.id)) return;

      let unlocked = false;

      switch (template.id) {
        case 'first-note':
          unlocked = notes.length >= 1;
          break;
        case 'error-solver':
          unlocked = errorLogs.length >= 10;
          break;
        case 'streak-7':
          unlocked = calculateStreak(notes) >= 7;
          break;
        case 'code-reviewer':
          // Would track AI code review usage
          unlocked = false;
          break;
        case 'knowledge-master':
          unlocked = notes.length >= 100;
          break;
      }

      if (unlocked) {
        newAchievements.push({
          ...template,
          unlockedAt: new Date()
        });
      }
    });

    return newAchievements;
  };

  // Update metrics when data changes
  useEffect(() => {
    setMetrics(currentMetrics);
    localStorage.setItem('karma-metrics', JSON.stringify(currentMetrics));
  }, [currentMetrics]);

  // Get user's rank compared to typical developers
  const getRank = (): string => {
    const { level } = currentMetrics;
    if (level >= 50) return 'Legendary Developer';
    if (level >= 30) return 'Expert Developer';
    if (level >= 20) return 'Senior Developer';
    if (level >= 10) return 'Mid-level Developer';
    if (level >= 5) return 'Junior Developer';
    return 'Apprentice Developer';
  };

  // Get insights about productivity
  const getInsights = (): string[] => {
    const insights = [];
    const { timeSaved, consistency, notesCreated } = currentMetrics;

    if (timeSaved > 0) {
      insights.push(`Your notes have saved you ${Math.round(timeSaved / 60)} hours this month!`);
    }

    if (consistency >= 7) {
      insights.push(`Amazing! You've maintained a ${consistency}-day learning streak 🔥`);
    }

    if (notesCreated >= 50) {
      insights.push(`You're building an impressive knowledge base with ${notesCreated} notes!`);
    }

    const avgNotesPerWeek = notesCreated / Math.max(1, Math.ceil(Date.now() / (7 * 24 * 60 * 60 * 1000)));
    if (avgNotesPerWeek > 3) {
      insights.push(`You're creating ${avgNotesPerWeek.toFixed(1)} notes per week - great momentum!`);
    }

    return insights;
  };

  return {
    metrics: currentMetrics,
    getRank,
    getInsights,
    achievements: currentMetrics.achievements.slice(-5) // Recent achievements
  };
};