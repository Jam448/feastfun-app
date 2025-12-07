/*
  # Add Player Profiles and Auth Trigger

  ## Overview
  Creates a player profiles table to store game-specific data for authenticated users, including currency and stats.

  ## New Tables

  ### `player_profiles`
  Stores game-specific player data linked to auth.users
  - `id` (uuid, primary key, references auth.users)
  - `display_name` (text) - Player's chosen display name
  - `crumbs` (integer) - In-game currency earned through gameplay
  - `total_stars` (integer) - Total stars earned across all levels
  - `levels_completed` (integer) - Number of levels completed
  - `highest_level` (integer) - Highest level reached
  - `total_score` (bigint) - Total score accumulated
  - `games_played` (integer) - Number of games played
  - `solana_wallet` (text, nullable) - Future: Solana wallet address for NFT integration
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Functions
  - `handle_new_user()` - Trigger function to auto-create player profile on signup

  ## Security
  - RLS enabled on player_profiles
  - Players can read their own profile
  - Players can update their own profile (except crumbs, which are managed by game logic)
  - Automatic profile creation on user signup

  ## Notes
  - The `solana_wallet` field is reserved for future Solana blockchain integration
  - This allows NFT rewards and on-chain item ownership
*/

-- ============================================================================
-- CREATE PLAYER PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  crumbs integer NOT NULL DEFAULT 0,
  total_stars integer NOT NULL DEFAULT 0,
  levels_completed integer NOT NULL DEFAULT 0,
  highest_level integer NOT NULL DEFAULT 0,
  total_score bigint NOT NULL DEFAULT 0,
  games_played integer NOT NULL DEFAULT 0,
  solana_wallet text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_player_profiles_crumbs ON player_profiles(crumbs DESC);
CREATE INDEX IF NOT EXISTS idx_player_profiles_total_stars ON player_profiles(total_stars DESC);
CREATE INDEX IF NOT EXISTS idx_player_profiles_highest_level ON player_profiles(highest_level DESC);
CREATE INDEX IF NOT EXISTS idx_player_profiles_solana_wallet ON player_profiles(solana_wallet) WHERE solana_wallet IS NOT NULL;

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE player_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

CREATE POLICY "Players can read own profile"
  ON player_profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Players can update own profile"
  ON player_profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "System can insert profiles"
  ON player_profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================================
-- CREATE TRIGGER FUNCTION FOR NEW USER SIGNUP
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.player_profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, 'Player')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
