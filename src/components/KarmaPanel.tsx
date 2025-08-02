import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Clock, BookOpen, Bug, Share, Flame, Star } from 'lucide-react';
import { useKarmaSystem } from '@/hooks/useKarmaSystem';
import { Note, ErrorLog } from '@/types';

interface KarmaPanelProps {
  notes: Note[];
  errorLogs: ErrorLog[];
}

export const KarmaPanel: React.FC<KarmaPanelProps> = ({ notes, errorLogs }) => {
  const { metrics, getRank, getInsights, achievements } = useKarmaSystem(notes, errorLogs);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'epic': return 'bg-gradient-to-r from-purple-400 to-pink-500';
      case 'rare': return 'bg-gradient-to-r from-blue-400 to-cyan-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const progressToNextLevel = () => {
    const currentLevelPoints = Math.pow(metrics.level - 1, 2) * 100;
    const nextLevelPoints = Math.pow(metrics.level, 2) * 100;
    const progress = ((metrics.totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Developer Karma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Level & Rank */}
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                Level {metrics.level}
              </div>
              <Badge variant="secondary" className="mb-3">
                {getRank()}
              </Badge>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{metrics.totalPoints} XP</span>
                  <span>{Math.pow(metrics.level, 2) * 100} XP</span>
                </div>
                <Progress value={progressToNextLevel()} className="h-2" />
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <div className="text-xl font-semibold">{Math.round(metrics.timeSaved / 60)}h</div>
                <div className="text-xs text-muted-foreground">Time Saved</div>
              </div>
              
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <BookOpen className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <div className="text-xl font-semibold">{metrics.notesCreated}</div>
                <div className="text-xs text-muted-foreground">Notes Created</div>
              </div>

              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Bug className="h-6 w-6 mx-auto mb-2 text-red-500" />
                <div className="text-xl font-semibold">{metrics.errorsFixed}</div>
                <div className="text-xs text-muted-foreground">Errors Fixed</div>
              </div>

              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Flame className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <div className="text-xl font-semibold">{metrics.consistency}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-2 rounded-lg border"
                  >
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getRarityColor(achievement.rarity)}`}
                    >
                      <span className="text-lg">{achievement.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{achievement.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {achievement.description}
                      </div>
                    </div>
                    <Badge 
                      variant={achievement.rarity === 'legendary' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {achievement.rarity}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Productivity Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {getInsights().map((insight, index) => (
              <div key={index} className="text-sm p-2 bg-muted/50 rounded border-l-4 border-primary">
                {insight}
              </div>
            ))}
            {getInsights().length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">
                Keep creating notes to unlock insights! 🚀
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};