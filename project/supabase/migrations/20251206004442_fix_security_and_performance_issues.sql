/*
  # Fix Security and Performance Issues

  ## Performance Optimizations

  ### 1. Add Missing Foreign Key Indexes
  Adding indexes on foreign key columns to improve query performance:
  - `challenge_completions.challenge_id`
  - `daily_rewards.player_id`
  - `player_power_ups.power_up_id`
  - `user_cosmetics.cosmetic_id`

  ### 2. Optimize RLS Policies for Better Performance
  Updating all RLS policies to use `(select auth.uid())` instead of `auth.uid()` directly.
  This prevents re-evaluation of auth functions for each row, significantly improving query performance at scale.

  ### 3. Consolidate Multiple Permissive Policies
  Removing redundant overlapping policies:
  - Consolidating player_power_ups SELECT policies
  - Consolidating players SELECT policies

  ## Tables Modified
  - profiles
  - game_runs
  - user_cosmetics
  - challenge_completions
  - leaderboards
  - players
  - level_completions
  - monthly_leaderboards
  - player_power_ups
  - daily_rewards
  - game_sessions

  ## Security Notes
  - All RLS policies remain functionally identical but with optimized performance
  - No changes to access control logic
  - All foreign key relationships maintained
*/

-- ============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

-- Index for challenge_completions foreign key
CREATE INDEX IF NOT EXISTS idx_challenge_completions_challenge_id 
  ON challenge_completions(challenge_id);

-- Index for daily_rewards foreign key
CREATE INDEX IF NOT EXISTS idx_daily_rewards_player_id 
  ON daily_rewards(player_id);

-- Index for player_power_ups foreign key
CREATE INDEX IF NOT EXISTS idx_player_power_ups_power_up_id 
  ON player_power_ups(power_up_id);

-- Index for user_cosmetics foreign key
CREATE INDEX IF NOT EXISTS idx_user_cosmetics_cosmetic_id 
  ON user_cosmetics(cosmetic_id);

-- ============================================================================
-- 2. OPTIMIZE RLS POLICIES - PROFILES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================================
-- 3. OPTIMIZE RLS POLICIES - GAME_RUNS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own runs" ON game_runs;
DROP POLICY IF EXISTS "Users can insert own runs" ON game_runs;

CREATE POLICY "Users can read own runs"
  ON game_runs FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own runs"
  ON game_runs FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- 4. OPTIMIZE RLS POLICIES - USER_COSMETICS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own cosmetics" ON user_cosmetics;
DROP POLICY IF EXISTS "Users can unlock cosmetics" ON user_cosmetics;

CREATE POLICY "Users can read own cosmetics"
  ON user_cosmetics FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can unlock cosmetics"
  ON user_cosmetics FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- 5. OPTIMIZE RLS POLICIES - CHALLENGE_COMPLETIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own completions" ON challenge_completions;
DROP POLICY IF EXISTS "Users can insert completions" ON challenge_completions;

CREATE POLICY "Users can read own completions"
  ON challenge_completions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert completions"
  ON challenge_completions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- 6. OPTIMIZE RLS POLICIES - LEADERBOARDS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can update own leaderboard entries" ON leaderboards;
DROP POLICY IF EXISTS "Users can update leaderboard entries" ON leaderboards;

CREATE POLICY "Users can update own leaderboard entries"
  ON leaderboards FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- 7. OPTIMIZE RLS POLICIES - PLAYERS TABLE (CONSOLIDATE MULTIPLE SELECTS)
-- ============================================================================

DROP POLICY IF EXISTS "Players can read own data" ON players;
DROP POLICY IF EXISTS "Anyone can read player usernames for leaderboards" ON players;
DROP POLICY IF EXISTS "Players can update own data" ON players;

-- Combined policy that allows both: reading own data AND reading anyone's username for leaderboards
CREATE POLICY "Players can read data"
  ON players FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can update own data"
  ON players FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================================
-- 8. OPTIMIZE RLS POLICIES - LEVEL_COMPLETIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Players can read own completions" ON level_completions;
DROP POLICY IF EXISTS "Players can insert own completions" ON level_completions;
DROP POLICY IF EXISTS "Players can update own completions" ON level_completions;

CREATE POLICY "Players can read own completions"
  ON level_completions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = player_id);

CREATE POLICY "Players can insert own completions"
  ON level_completions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = player_id);

CREATE POLICY "Players can update own completions"
  ON level_completions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = player_id)
  WITH CHECK ((select auth.uid()) = player_id);

-- ============================================================================
-- 9. OPTIMIZE RLS POLICIES - MONTHLY_LEADERBOARDS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Players can upsert own leaderboard entry" ON monthly_leaderboards;
DROP POLICY IF EXISTS "Players can update own leaderboard entry" ON monthly_leaderboards;

CREATE POLICY "Players can upsert own leaderboard entry"
  ON monthly_leaderboards FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = player_id);

CREATE POLICY "Players can update own leaderboard entry"
  ON monthly_leaderboards FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = player_id)
  WITH CHECK ((select auth.uid()) = player_id);

-- ============================================================================
-- 10. OPTIMIZE RLS POLICIES - PLAYER_POWER_UPS TABLE (CONSOLIDATE)
-- ============================================================================

DROP POLICY IF EXISTS "Players can read own power ups" ON player_power_ups;
DROP POLICY IF EXISTS "Players can manage own power ups" ON player_power_ups;

-- Consolidated policies - separate by action instead of using FOR ALL
CREATE POLICY "Players can read own power ups"
  ON player_power_ups FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = player_id);

CREATE POLICY "Players can insert own power ups"
  ON player_power_ups FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = player_id);

CREATE POLICY "Players can update own power ups"
  ON player_power_ups FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = player_id)
  WITH CHECK ((select auth.uid()) = player_id);

CREATE POLICY "Players can delete own power ups"
  ON player_power_ups FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = player_id);

-- ============================================================================
-- 11. OPTIMIZE RLS POLICIES - DAILY_REWARDS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Players can read own rewards" ON daily_rewards;
DROP POLICY IF EXISTS "Players can claim own rewards" ON daily_rewards;

CREATE POLICY "Players can read own rewards"
  ON daily_rewards FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = player_id);

CREATE POLICY "Players can claim own rewards"
  ON daily_rewards FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = player_id);

-- ============================================================================
-- 12. OPTIMIZE RLS POLICIES - GAME_SESSIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Players can read own sessions" ON game_sessions;
DROP POLICY IF EXISTS "Players can insert own sessions" ON game_sessions;

CREATE POLICY "Players can read own sessions"
  ON game_sessions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = player_id);

CREATE POLICY "Players can insert own sessions"
  ON game_sessions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = player_id);
