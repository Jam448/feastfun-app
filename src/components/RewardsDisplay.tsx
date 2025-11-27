import { useState, useEffect } from 'react';
import { Gift, Calendar, Trophy } from 'lucide-react';
import { supabase, Reward } from '../lib/supabase';

export default function RewardsDisplay() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveRewards();
  }, []);

  const fetchActiveRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .order('end_date', { ascending: true });

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getGameName = (gameType?: string) => {
    if (!gameType || gameType === 'all') return 'All Games';
    switch (gameType) {
      case 'memory':
        return 'Turkey Memory';
      case 'guess':
        return 'Feast Fortune';
      case 'reaction':
        return 'Turkey Speed Test';
      default:
        return gameType;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-slate-600">Loading rewards...</p>
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <Gift className="mx-auto text-slate-400 mb-3" size={48} />
        <p className="text-slate-600">No active rewards at this time. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Trophy className="text-orange-500" />
        Active Rewards
      </h2>
      {rewards.map((reward) => (
        <div
          key={reward.id}
          className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{reward.title}</h3>
              <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full mt-2">
                {reward.reward_type.toUpperCase()}
              </span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-orange-600">{reward.prize_amount}</p>
            </div>
          </div>

          <p className="text-slate-700 mb-4">{reward.description}</p>

          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>Ends: {formatDate(reward.end_date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy size={16} />
              <span>{getGameName(reward.game_type)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
