/*
  # FeastFun Advanced Game System
  
  ## Overview
  Complete database schema for a match-3 food game with levels, seasons, monthly leaderboards, and rewards.
  
  ## New Tables
  
  ### `players`
  Player accounts and progression
  - `id` (uuid, primary key)
  - `username` (text, unique)
  - `email` (text, unique)
  - `avatar_url` (text)
  - `coins` (integer, premium currency)
  - `stars` (integer, total stars earned)
  - `current_level` (integer, highest unlocked level)
  - `lives` (integer, current lives, max 5)
  - `lives_updated_at` (timestamptz, for regeneration)
  - `daily_streak` (integer)
  - `last_login_date` (date)
  - `season_points` (integer, current season points)
  - `created_at` (timestamptz)
  
  ### `level_completions`
  Player progress per level
  - `id` (uuid, primary key)
  - `player_id` (uuid, FK to players)
  - `level_number` (integer)
  - `stars_earned` (integer, 0-3)
  - `high_score` (integer)
  - `times_played` (integer)
  - `completed_at` (timestamptz)
  - Unique: (player_id, level_number)
  
  ### `seasons`
  Seasonal themes and events
  - `id` (uuid, primary key)
  - `name` (text, e.g., "Halloween Harvest", "Winter Wonderland")
  - `theme_key` (text, e.g., "halloween", "christmas")
  - `start_date` (date)
  - `end_date` (date)
  - `is_active` (boolean)
  - `background_color` (text)
  - `accent_color` (text)
  - `created_at` (timestamptz)
  
  ### `monthly_leaderboards`
  Monthly competition rankings
  - `id` (uuid, primary key)
  - `player_id` (uuid, FK to players)
  - `month_key` (text, e.g., "2025-12")
  - `total_stars` (integer)
  - `total_score` (integer)
  - `levels_completed` (integer)
  - `rank` (integer)
  - `prize_tier` (text, nullable)
  - `updated_at` (timestamptz)
  - Unique: (player_id, month_key)
  
  ### `power_ups`
  Available power-up types
  - `id` (uuid, primary key)
  - `type` (text, e.g., "rainbow_blast", "row_clear", "column_clear")
  - `name` (text)
  - `description` (text)
  - `coin_cost` (integer)
  - `icon` (text)
  - `created_at` (timestamptz)
  
  ### `player_power_ups`
  Player inventory
  - `player_id` (uuid, FK to players)
  - `power_up_id` (uuid, FK to power_ups)
  - `quantity` (integer)
  - Primary key: (player_id, power_up_id)
  
  ### `daily_rewards`
  Daily login bonus tracking
  - `id` (uuid, primary key)
  - `player_id` (uuid, FK to players)
  - `day` (integer, 1-7)
  - `claimed_at` (timestamptz)
  - `reward_coins` (integer)
  - `reward_power_ups` (jsonb)
  
  ### `game_sessions`
  Individual game play sessions
  - `id` (uuid, primary key)
  - `player_id` (uuid, FK to players)
  - `level_number` (integer)
  - `score` (integer)
  - `moves_used` (integer)
  - `power_ups_used` (jsonb)
  - `completed` (boolean)
  - `stars_earned` (integer)
  - `created_at` (timestamptz)
  
  ## Security
  - RLS enabled on all tables
  - Players can read/update their own data
  - Public read access to leaderboards and seasons
  - Server-side validation for critical operations
*/

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  avatar_url text DEFAULT '',
  coins integer DEFAULT 100 NOT NULL,
  stars integer DEFAULT 0 NOT NULL,
  current_level integer DEFAULT 1 NOT NULL,
  lives integer DEFAULT 5 NOT NULL,
  lives_updated_at timestamptz DEFAULT now() NOT NULL,
  daily_streak integer DEFAULT 0 NOT NULL,
  last_login_date date,
  season_points integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read own data"
  ON players FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Players can update own data"
  ON players FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can read player usernames for leaderboards"
  ON players FOR SELECT
  TO authenticated
  USING (true);

-- Create level_completions table
CREATE TABLE IF NOT EXISTS level_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  level_number integer NOT NULL,
  stars_earned integer DEFAULT 0 NOT NULL,
  high_score integer DEFAULT 0 NOT NULL,
  times_played integer DEFAULT 0 NOT NULL,
  completed_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (player_id, level_number)
);

ALTER TABLE level_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read own completions"
  ON level_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Players can insert own completions"
  ON level_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can update own completions"
  ON level_completions FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

-- Create seasons table
CREATE TABLE IF NOT EXISTS seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  theme_key text UNIQUE NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean DEFAULT false NOT NULL,
  background_color text DEFAULT '#f97316',
  accent_color text DEFAULT '#ef4444',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view seasons"
  ON seasons FOR SELECT
  TO authenticated
  USING (true);

-- Create monthly_leaderboards table
CREATE TABLE IF NOT EXISTS monthly_leaderboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  month_key text NOT NULL,
  total_stars integer DEFAULT 0 NOT NULL,
  total_score integer DEFAULT 0 NOT NULL,
  levels_completed integer DEFAULT 0 NOT NULL,
  rank integer DEFAULT 0 NOT NULL,
  prize_tier text,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (player_id, month_key)
);

ALTER TABLE monthly_leaderboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboards"
  ON monthly_leaderboards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can upsert own leaderboard entry"
  ON monthly_leaderboards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can update own leaderboard entry"
  ON monthly_leaderboards FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

-- Create power_ups table
CREATE TABLE IF NOT EXISTS power_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  coin_cost integer DEFAULT 50 NOT NULL,
  icon text DEFAULT '⚡',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE power_ups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view power ups"
  ON power_ups FOR SELECT
  TO authenticated
  USING (true);

-- Create player_power_ups table
CREATE TABLE IF NOT EXISTS player_power_ups (
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  power_up_id uuid REFERENCES power_ups(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 0 NOT NULL,
  PRIMARY KEY (player_id, power_up_id)
);

ALTER TABLE player_power_ups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read own power ups"
  ON player_power_ups FOR SELECT
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Players can manage own power ups"
  ON player_power_ups FOR ALL
  TO authenticated
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

-- Create daily_rewards table
CREATE TABLE IF NOT EXISTS daily_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  day integer NOT NULL,
  claimed_at timestamptz DEFAULT now() NOT NULL,
  reward_coins integer DEFAULT 0 NOT NULL,
  reward_power_ups jsonb DEFAULT '[]'::jsonb
);

ALTER TABLE daily_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read own rewards"
  ON daily_rewards FOR SELECT
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Players can claim own rewards"
  ON daily_rewards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  level_number integer NOT NULL,
  score integer DEFAULT 0 NOT NULL,
  moves_used integer DEFAULT 0 NOT NULL,
  power_ups_used jsonb DEFAULT '[]'::jsonb,
  completed boolean DEFAULT false NOT NULL,
  stars_earned integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read own sessions"
  ON game_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Players can insert own sessions"
  ON game_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_level_completions_player ON level_completions(player_id);
CREATE INDEX IF NOT EXISTS idx_level_completions_level ON level_completions(level_number);
CREATE INDEX IF NOT EXISTS idx_monthly_leaderboards_month ON monthly_leaderboards(month_key, total_score DESC);
CREATE INDEX IF NOT EXISTS idx_monthly_leaderboards_player ON monthly_leaderboards(player_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_player ON game_sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_seasons_active ON seasons(is_active, start_date);

-- Insert default power-ups
INSERT INTO power_ups (type, name, description, coin_cost, icon) VALUES
  ('rainbow_blast', 'Rainbow Blast', 'Clear all food of one type', 100, '🌈'),
  ('row_clear', 'Row Blaster', 'Clear an entire row', 50, '➡️'),
  ('column_clear', 'Column Crusher', 'Clear an entire column', 50, '⬇️'),
  ('bomb', 'Food Bomb', 'Destroy surrounding foods', 75, '💣'),
  ('shuffle', 'Shuffle Board', 'Rearrange all foods', 80, '🔀')
ON CONFLICT DO NOTHING;

-- Insert initial seasons
INSERT INTO seasons (name, theme_key, start_date, end_date, is_active, background_color, accent_color) VALUES
  ('Classic Feast', 'classic', '2025-01-01', '2025-12-31', true, '#f97316', '#ef4444'),
  ('Winter Wonderland', 'winter', '2025-12-01', '2026-02-28', false, '#60a5fa', '#3b82f6'),
  ('Spring Harvest', 'spring', '2026-03-01', '2026-05-31', false, '#4ade80', '#22c55e'),
  ('Summer BBQ', 'summer', '2026-06-01', '2026-08-31', false, '#fbbf24', '#f59e0b'),
  ('Halloween Treats', 'halloween', '2026-10-01', '2026-10-31', false, '#a855f7', '#9333ea'),
  ('Holiday Feast', 'christmas', '2026-12-01', '2026-12-31', false, '#ef4444', '#22c55e')
ON CONFLICT DO NOTHING;
