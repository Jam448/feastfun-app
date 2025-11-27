/*
  # Create Leaderboards and Rewards System

  1. New Tables
    - `leaderboard_entries`
      - `id` (uuid, primary key)
      - `game_type` (text) - 'memory', 'guess', or 'reaction'
      - `player_name` (text) - player's chosen name
      - `score` (integer) - score value (moves for memory, attempts for guess, time for reaction)
      - `created_at` (timestamptz) - when score was submitted
      - `wallet_address` (text, optional) - Solana wallet for rewards
    
    - `rewards`
      - `id` (uuid, primary key)
      - `title` (text) - reward name
      - `description` (text) - reward details
      - `reward_type` (text) - 'weekly' or 'monthly'
      - `prize_amount` (text) - prize description (e.g., "100 $FEAST")
      - `start_date` (timestamptz) - when reward period starts
      - `end_date` (timestamptz) - when reward period ends
      - `game_type` (text, nullable) - specific game or null for all games
      - `is_active` (boolean) - whether reward is currently active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `reward_winners`
      - `id` (uuid, primary key)
      - `reward_id` (uuid, foreign key to rewards)
      - `leaderboard_entry_id` (uuid, foreign key to leaderboard_entries)
      - `position` (integer) - 1st, 2nd, 3rd place, etc.
      - `claimed` (boolean) - whether winner claimed reward
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public can read leaderboards and active rewards
    - Only authenticated admins can manage rewards
    - Anyone can submit leaderboard entries
*/

-- Create leaderboard_entries table
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type text NOT NULL CHECK (game_type IN ('memory', 'guess', 'reaction')),
  player_name text NOT NULL,
  score integer NOT NULL,
  wallet_address text,
  created_at timestamptz DEFAULT now()
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  reward_type text NOT NULL CHECK (reward_type IN ('weekly', 'monthly')),
  prize_amount text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  game_type text CHECK (game_type IN ('memory', 'guess', 'reaction', 'all')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reward_winners table
CREATE TABLE IF NOT EXISTS reward_winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id uuid REFERENCES rewards(id) ON DELETE CASCADE,
  leaderboard_entry_id uuid REFERENCES leaderboard_entries(id) ON DELETE CASCADE,
  position integer NOT NULL,
  claimed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_winners ENABLE ROW LEVEL SECURITY;

-- Leaderboard policies (anyone can read and insert)
CREATE POLICY "Anyone can view leaderboard entries"
  ON leaderboard_entries FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can submit leaderboard entries"
  ON leaderboard_entries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Rewards policies (anyone can read active rewards)
CREATE POLICY "Anyone can view active rewards"
  ON rewards FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can manage rewards"
  ON rewards FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Winner policies (anyone can read)
CREATE POLICY "Anyone can view reward winners"
  ON reward_winners FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only authenticated users can manage winners"
  ON reward_winners FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_game_score ON leaderboard_entries(game_type, score);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created ON leaderboard_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rewards_active ON rewards(is_active, end_date);
CREATE INDEX IF NOT EXISTS idx_rewards_game_type ON rewards(game_type);
