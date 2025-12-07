/*
  # Remove Unused Database Indexes

  ## Overview
  Removes indexes that are not being used to improve write performance and reduce storage overhead.

  ## Changes Made
  
  ### Indexes Removed
  
  1. **level_completions table**
     - `idx_level_completions_player` - Unused index on player_id
     - `idx_level_completions_level` - Unused index on level_number
  
  2. **monthly_leaderboards table**
     - `idx_monthly_leaderboards_month` - Unused index on month_key, total_score
     - `idx_monthly_leaderboards_player` - Unused index on player_id
  
  3. **game_sessions table**
     - `idx_game_sessions_player` - Unused index on player_id
  
  4. **seasons table**
     - `idx_seasons_active` - Unused index on is_active, start_date
  
  5. **challenge_completions table**
     - `idx_challenge_completions_challenge_id` - Unused index on challenge_id
  
  6. **daily_rewards table**
     - `idx_daily_rewards_player_id` - Unused index on player_id
  
  7. **player_power_ups table**
     - `idx_player_power_ups_power_up_id` - Unused index on power_up_id
  
  8. **user_cosmetics table**
     - `idx_user_cosmetics_cosmetic_id` - Unused index on cosmetic_id
  
  9. **game_runs table**
     - `idx_game_runs_user_id` - Unused index on user_id
     - `idx_game_runs_created_at` - Unused index on created_at
  
  10. **leaderboards table**
      - `idx_leaderboards_period_score` - Unused index on period, score

  ## Performance Impact
  - Improved INSERT/UPDATE/DELETE performance on affected tables
  - Reduced storage requirements
  - Indexes can be recreated if query patterns change in the future

  ## Security Notes
  - No security implications from removing unused indexes
  - RLS policies remain unchanged and fully functional
*/

-- Drop unused indexes on level_completions
DROP INDEX IF EXISTS idx_level_completions_player;
DROP INDEX IF EXISTS idx_level_completions_level;

-- Drop unused indexes on monthly_leaderboards
DROP INDEX IF EXISTS idx_monthly_leaderboards_month;
DROP INDEX IF EXISTS idx_monthly_leaderboards_player;

-- Drop unused indexes on game_sessions
DROP INDEX IF EXISTS idx_game_sessions_player;

-- Drop unused indexes on seasons
DROP INDEX IF EXISTS idx_seasons_active;

-- Drop unused indexes on challenge_completions
DROP INDEX IF EXISTS idx_challenge_completions_challenge_id;

-- Drop unused indexes on daily_rewards
DROP INDEX IF EXISTS idx_daily_rewards_player_id;

-- Drop unused indexes on player_power_ups
DROP INDEX IF EXISTS idx_player_power_ups_power_up_id;

-- Drop unused indexes on user_cosmetics
DROP INDEX IF EXISTS idx_user_cosmetics_cosmetic_id;

-- Drop unused indexes on game_runs
DROP INDEX IF EXISTS idx_game_runs_user_id;
DROP INDEX IF EXISTS idx_game_runs_created_at;

-- Drop unused indexes on leaderboards
DROP INDEX IF EXISTS idx_leaderboards_period_score;
