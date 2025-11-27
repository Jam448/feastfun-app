import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type LeaderboardEntry = {
  id: string;
  game_type: 'memory' | 'guess' | 'reaction';
  player_name: string;
  score: number;
  wallet_address?: string;
  created_at: string;
};

export type Reward = {
  id: string;
  title: string;
  description: string;
  reward_type: 'weekly' | 'monthly';
  prize_amount: string;
  start_date: string;
  end_date: string;
  game_type?: 'memory' | 'guess' | 'reaction' | 'all';
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type RewardWinner = {
  id: string;
  reward_id: string;
  leaderboard_entry_id: string;
  position: number;
  claimed: boolean;
  created_at: string;
};
