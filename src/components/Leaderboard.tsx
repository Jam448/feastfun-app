import { useState, useEffect } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { supabase, LeaderboardEntry } from '../lib/supabase';

interface LeaderboardProps {
  gameType: 'memory' | 'guess' | 'reaction';
  timeframe: 'daily' | 'weekly' | 'all';
}

export default function Leaderboard({ gameType, timeframe }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [gameType, timeframe]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('leaderboard_entries')
        .select('*')
        .eq('game_type', gameType);

      if (timeframe === 'daily') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('created_at', today.toISOString());
      } else if (timeframe === 'weekly') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('created_at', weekAgo.toISOString());
      }

      const orderColumn = gameType === 'reaction' ? 'score' : 'score';
      const ascending = gameType === 'reaction';

      const { data, error } = await query
        .order(orderColumn, { ascending })
        .limit(10);

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="text-yellow-500" size={24} />;
      case 2:
        return <Medal className="text-slate-400" size={24} />;
      case 3:
        return <Award className="text-orange-600" size={24} />;
      default:
        return <span className="text-slate-600 font-bold text-lg">{position}</span>;
    }
  };

  const formatScore = (score: number) => {
    if (gameType === 'reaction') {
      return `${score}ms`;
    }
    return score.toString();
  };

  const getScoreLabel = () => {
    switch (gameType) {
      case 'memory':
        return 'Moves';
      case 'guess':
        return 'Attempts';
      case 'reaction':
        return 'Time';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-slate-600">Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-4">
        Top Players - {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
      </h3>
      {entries.length === 0 ? (
        <p className="text-slate-600 text-center py-4">No entries yet. Be the first!</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                index < 3 ? 'bg-gradient-to-r from-orange-50 to-amber-50' : 'bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 flex justify-center">
                  {getPositionIcon(index + 1)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{entry.player_name}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-600">{formatScore(entry.score)}</p>
                <p className="text-xs text-slate-500">{getScoreLabel()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
