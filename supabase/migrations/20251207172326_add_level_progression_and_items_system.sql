/*
  # Add Level Progression and Items System

  ## Overview
  Transforms FeastFun into a progression-based game with level maps, character customization, and power-up items.

  ## New Tables

  ### 1. `levels`
  Defines all game levels with progression requirements
  - `id` (uuid, primary key) - Unique level identifier
  - `level_number` (integer, unique) - Sequential level number (1, 2, 3...)
  - `name` (text) - Level display name
  - `description` (text) - Level description
  - `world` (text) - World/area name (e.g., "Cookie Forest", "Candy Mountains")
  - `target_score` (integer) - Score required to complete
  - `star_thresholds` (jsonb) - Star requirements {1: 1000, 2: 2000, 3: 3000}
  - `unlock_cost` (integer) - Crumbs needed to unlock (0 for first level)
  - `rewards` (jsonb) - Rewards for completion {crumbs: 100, items: [...]}
  - `created_at` (timestamptz)

  ### 2. `player_levels`
  Tracks player progress through levels
  - `id` (uuid, primary key)
  - `player_id` (uuid, foreign key to auth.users)
  - `level_id` (uuid, foreign key to levels)
  - `unlocked` (boolean) - Whether player has unlocked this level
  - `completed` (boolean) - Whether player has beaten this level
  - `stars_earned` (integer) - Stars earned (0-3)
  - `best_score` (integer) - Best score achieved on this level
  - `times_played` (integer) - Number of attempts
  - `last_played_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 3. `outfit_items`
  Defines wearable items that change character appearance
  - `id` (uuid, primary key)
  - `name` (text) - Item name
  - `slot` (text) - Equipment slot: hat, outfit, accessory, back
  - `rarity` (text) - common, rare, epic, legendary
  - `cost` (integer) - Purchase cost in crumbs
  - `unlock_requirement` (jsonb) - Requirements: {level: 5, stars: 10}
  - `image_url` (text) - Visual asset reference
  - `stats` (jsonb) - Stat bonuses if any
  - `created_at` (timestamptz)

  ### 4. `player_outfits`
  Tracks which outfit items players own
  - `id` (uuid, primary key)
  - `player_id` (uuid, foreign key to auth.users)
  - `outfit_id` (uuid, foreign key to outfit_items)
  - `equipped` (boolean) - Whether currently worn
  - `acquired_at` (timestamptz)

  ### 5. `power_up_items`
  Defines usable power-ups that affect gameplay
  - `id` (uuid, primary key)
  - `name` (text) - Power-up name
  - `type` (text) - score_boost, time_freeze, combo_multiplier, shuffle, hint
  - `rarity` (text) - common, rare, epic, legendary
  - `cost` (integer) - Purchase cost in crumbs
  - `effect_value` (numeric) - Effect strength (e.g., 1.5 for 50% boost)
  - `duration_seconds` (integer) - How long effect lasts
  - `description` (text) - What it does
  - `icon` (text) - Icon reference
  - `created_at` (timestamptz)

  ### 6. `player_items`
  Tracks player inventory of power-up items
  - `id` (uuid, primary key)
  - `player_id` (uuid, foreign key to auth.users)
  - `item_id` (uuid, foreign key to power_up_items)
  - `quantity` (integer) - How many owned
  - `updated_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Players can only read/modify their own data
  - All users can read levels, outfit_items, and power_up_items (game content)

  ## Indexes
  - Foreign key indexes for optimal query performance
  - Composite indexes for common queries (player+level, player+equipped items)
*/

-- ============================================================================
-- CREATE TABLES
-- ============================================================================

-- Levels definition table
CREATE TABLE IF NOT EXISTS levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_number integer UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  world text NOT NULL DEFAULT 'Main',
  target_score integer NOT NULL DEFAULT 1000,
  star_thresholds jsonb NOT NULL DEFAULT '{"1": 1000, "2": 2000, "3": 3000}'::jsonb,
  unlock_cost integer NOT NULL DEFAULT 0,
  rewards jsonb NOT NULL DEFAULT '{"crumbs": 100}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Player level progression
CREATE TABLE IF NOT EXISTS player_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id uuid NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  unlocked boolean NOT NULL DEFAULT false,
  completed boolean NOT NULL DEFAULT false,
  stars_earned integer NOT NULL DEFAULT 0,
  best_score integer NOT NULL DEFAULT 0,
  times_played integer NOT NULL DEFAULT 0,
  last_played_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(player_id, level_id)
);

-- Outfit items (cosmetic equipment)
CREATE TABLE IF NOT EXISTS outfit_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slot text NOT NULL CHECK (slot IN ('hat', 'outfit', 'accessory', 'back')),
  rarity text NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  cost integer NOT NULL DEFAULT 100,
  unlock_requirement jsonb NOT NULL DEFAULT '{}'::jsonb,
  image_url text NOT NULL DEFAULT '',
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Player outfit inventory
CREATE TABLE IF NOT EXISTS player_outfits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_id uuid NOT NULL REFERENCES outfit_items(id) ON DELETE CASCADE,
  equipped boolean NOT NULL DEFAULT false,
  acquired_at timestamptz DEFAULT now(),
  UNIQUE(player_id, outfit_id)
);

-- Power-up items (gameplay items)
CREATE TABLE IF NOT EXISTS power_up_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('score_boost', 'time_freeze', 'combo_multiplier', 'shuffle', 'hint', 'bomb', 'color_burst')),
  rarity text NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  cost integer NOT NULL DEFAULT 50,
  effect_value numeric NOT NULL DEFAULT 1.5,
  duration_seconds integer NOT NULL DEFAULT 10,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '⭐',
  created_at timestamptz DEFAULT now()
);

-- Player power-up inventory
CREATE TABLE IF NOT EXISTS player_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES power_up_items(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(player_id, item_id)
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_levels_level_number ON levels(level_number);
CREATE INDEX IF NOT EXISTS idx_levels_world ON levels(world);

CREATE INDEX IF NOT EXISTS idx_player_levels_player_id ON player_levels(player_id);
CREATE INDEX IF NOT EXISTS idx_player_levels_level_id ON player_levels(level_id);
CREATE INDEX IF NOT EXISTS idx_player_levels_player_unlocked ON player_levels(player_id, unlocked);

CREATE INDEX IF NOT EXISTS idx_outfit_items_slot ON outfit_items(slot);
CREATE INDEX IF NOT EXISTS idx_outfit_items_rarity ON outfit_items(rarity);

CREATE INDEX IF NOT EXISTS idx_player_outfits_player_id ON player_outfits(player_id);
CREATE INDEX IF NOT EXISTS idx_player_outfits_equipped ON player_outfits(player_id, equipped);

CREATE INDEX IF NOT EXISTS idx_power_up_items_type ON power_up_items(type);

CREATE INDEX IF NOT EXISTS idx_player_items_player_id ON player_items(player_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE power_up_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- Levels: Everyone can read game content
CREATE POLICY "Anyone can read levels"
  ON levels FOR SELECT
  TO authenticated
  USING (true);

-- Player Levels: Players manage their own progress
CREATE POLICY "Players can read own level progress"
  ON player_levels FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = player_id);

CREATE POLICY "Players can insert own level progress"
  ON player_levels FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = player_id);

CREATE POLICY "Players can update own level progress"
  ON player_levels FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = player_id)
  WITH CHECK ((select auth.uid()) = player_id);

-- Outfit Items: Everyone can read available items
CREATE POLICY "Anyone can read outfit items"
  ON outfit_items FOR SELECT
  TO authenticated
  USING (true);

-- Player Outfits: Players manage their own wardrobe
CREATE POLICY "Players can read own outfits"
  ON player_outfits FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = player_id);

CREATE POLICY "Players can acquire outfits"
  ON player_outfits FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = player_id);

CREATE POLICY "Players can equip/unequip outfits"
  ON player_outfits FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = player_id)
  WITH CHECK ((select auth.uid()) = player_id);

-- Power-up Items: Everyone can read available items
CREATE POLICY "Anyone can read power-up items"
  ON power_up_items FOR SELECT
  TO authenticated
  USING (true);

-- Player Items: Players manage their own inventory
CREATE POLICY "Players can read own items"
  ON player_items FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = player_id);

CREATE POLICY "Players can acquire items"
  ON player_items FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = player_id);

CREATE POLICY "Players can use/update items"
  ON player_items FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = player_id)
  WITH CHECK ((select auth.uid()) = player_id);

-- ============================================================================
-- INSERT INITIAL GAME CONTENT
-- ============================================================================

-- Insert 30 levels across 3 worlds
INSERT INTO levels (level_number, name, description, world, target_score, star_thresholds, unlock_cost, rewards)
VALUES
  -- Cookie Forest (Levels 1-10)
  (1, 'Cookie Crumbs', 'Start your sweet adventure!', 'Cookie Forest', 500, '{"1": 500, "2": 1000, "3": 1500}'::jsonb, 0, '{"crumbs": 50, "items": []}'::jsonb),
  (2, 'Gingerbread Grove', 'Match through the gingerbread trees', 'Cookie Forest', 800, '{"1": 800, "2": 1600, "3": 2400}'::jsonb, 0, '{"crumbs": 75, "items": []}'::jsonb),
  (3, 'Frosting Falls', 'Watch out for slippery frosting!', 'Cookie Forest', 1200, '{"1": 1200, "2": 2400, "3": 3600}'::jsonb, 50, '{"crumbs": 100, "items": []}'::jsonb),
  (4, 'Candy Cane Path', 'Navigate the peppermint trail', 'Cookie Forest', 1500, '{"1": 1500, "2": 3000, "3": 4500}'::jsonb, 100, '{"crumbs": 125, "items": []}'::jsonb),
  (5, 'Chocolate Chip Challenge', 'A tough cookie to crack!', 'Cookie Forest', 2000, '{"1": 2000, "2": 4000, "3": 6000}'::jsonb, 150, '{"crumbs": 150, "items": []}'::jsonb),
  (6, 'Marshmallow Meadow', 'Bounce through the fluffy clouds', 'Cookie Forest', 2500, '{"1": 2500, "2": 5000, "3": 7500}'::jsonb, 200, '{"crumbs": 200, "items": []}'::jsonb),
  (7, 'Sprinkle Storm', 'Colorful chaos awaits!', 'Cookie Forest', 3000, '{"1": 3000, "2": 6000, "3": 9000}'::jsonb, 250, '{"crumbs": 250, "items": []}'::jsonb),
  (8, 'Wafer Wonderland', 'Crispy layers of fun', 'Cookie Forest', 3500, '{"1": 3500, "2": 7000, "3": 10500}'::jsonb, 300, '{"crumbs": 300, "items": []}'::jsonb),
  (9, 'Sugar Rush Rapids', 'Fast-paced matching madness', 'Cookie Forest', 4000, '{"1": 4000, "2": 8000, "3": 12000}'::jsonb, 400, '{"crumbs": 400, "items": []}'::jsonb),
  (10, 'Cookie Forest Boss', 'Defeat the Gingerbread Giant!', 'Cookie Forest', 5000, '{"1": 5000, "2": 10000, "3": 15000}'::jsonb, 500, '{"crumbs": 1000, "items": []}'::jsonb),
  
  -- Candy Mountains (Levels 11-20)
  (11, 'Gumdrop Gateway', 'Enter the mountain range', 'Candy Mountains', 5500, '{"1": 5500, "2": 11000, "3": 16500}'::jsonb, 600, '{"crumbs": 500, "items": []}'::jsonb),
  (12, 'Lollipop Ledge', 'Balance on the swirly sticks', 'Candy Mountains', 6000, '{"1": 6000, "2": 12000, "3": 18000}'::jsonb, 700, '{"crumbs": 550, "items": []}'::jsonb),
  (13, 'Jellybean Junction', 'Match the rainbow beans', 'Candy Mountains', 6500, '{"1": 6500, "2": 13000, "3": 19500}'::jsonb, 800, '{"crumbs": 600, "items": []}'::jsonb),
  (14, 'Taffy Twist', 'Stretch your matching skills', 'Candy Mountains', 7000, '{"1": 7000, "2": 14000, "3": 21000}'::jsonb, 900, '{"crumbs": 650, "items": []}'::jsonb),
  (15, 'Rock Candy Ridge', 'Crystal clear challenges', 'Candy Mountains', 8000, '{"1": 8000, "2": 16000, "3": 24000}'::jsonb, 1000, '{"crumbs": 700, "items": []}'::jsonb),
  (16, 'Bubblegum Bluff', 'Pop your way to the top', 'Candy Mountains', 9000, '{"1": 9000, "2": 18000, "3": 27000}'::jsonb, 1200, '{"crumbs": 800, "items": []}'::jsonb),
  (17, 'Mint Mountain Peak', 'Cool and refreshing matches', 'Candy Mountains', 10000, '{"1": 10000, "2": 20000, "3": 30000}'::jsonb, 1400, '{"crumbs": 900, "items": []}'::jsonb),
  (18, 'Caramel Canyons', 'Sticky situations ahead', 'Candy Mountains', 11000, '{"1": 11000, "2": 22000, "3": 33000}'::jsonb, 1600, '{"crumbs": 1000, "items": []}'::jsonb),
  (19, 'Licorice Labyrinth', 'Find your way through the twists', 'Candy Mountains', 12000, '{"1": 12000, "2": 24000, "3": 36000}'::jsonb, 1800, '{"crumbs": 1200, "items": []}'::jsonb),
  (20, 'Candy Mountains Boss', 'Face the Sugar Dragon!', 'Candy Mountains', 15000, '{"1": 15000, "2": 30000, "3": 45000}'::jsonb, 2000, '{"crumbs": 2500, "items": []}'::jsonb),
  
  -- Cocoa Castle (Levels 21-30)
  (21, 'Castle Courtyard', 'Enter the chocolate fortress', 'Cocoa Castle', 16000, '{"1": 16000, "2": 32000, "3": 48000}'::jsonb, 2500, '{"crumbs": 1500, "items": []}'::jsonb),
  (22, 'Truffle Tower', 'Scale the rich chocolate heights', 'Cocoa Castle', 17000, '{"1": 17000, "2": 34000, "3": 51000}'::jsonb, 3000, '{"crumbs": 1600, "items": []}'::jsonb),
  (23, 'Mocha Moat', 'Cross the coffee-flavored waters', 'Cocoa Castle', 18000, '{"1": 18000, "2": 36000, "3": 54000}'::jsonb, 3500, '{"crumbs": 1700, "items": []}'::jsonb),
  (24, 'Fudge Fort', 'Defend against the sweet invaders', 'Cocoa Castle', 19000, '{"1": 19000, "2": 38000, "3": 57000}'::jsonb, 4000, '{"crumbs": 1800, "items": []}'::jsonb),
  (25, 'Brownie Battlements', 'Match on the castle walls', 'Cocoa Castle', 20000, '{"1": 20000, "2": 40000, "3": 60000}'::jsonb, 4500, '{"crumbs": 2000, "items": []}'::jsonb),
  (26, 'Cocoa Corridor', 'Navigate the royal hallways', 'Cocoa Castle', 22000, '{"1": 22000, "2": 44000, "3": 66000}'::jsonb, 5000, '{"crumbs": 2200, "items": []}'::jsonb),
  (27, 'Ganache Garden', 'Match in the elegant grounds', 'Cocoa Castle', 24000, '{"1": 24000, "2": 48000, "3": 72000}'::jsonb, 5500, '{"crumbs": 2400, "items": []}'::jsonb),
  (28, 'Throne Room Trial', 'Prove your matching mastery', 'Cocoa Castle', 26000, '{"1": 26000, "2": 52000, "3": 78000}'::jsonb, 6000, '{"crumbs": 2600, "items": []}'::jsonb),
  (29, 'Royal Treasury', 'Guard the precious treats', 'Cocoa Castle', 28000, '{"1": 28000, "2": 56000, "3": 84000}'::jsonb, 7000, '{"crumbs": 3000, "items": []}'::jsonb),
  (30, 'Cocoa Castle Boss', 'Challenge the Chocolate King!', 'Cocoa Castle', 35000, '{"1": 35000, "2": 70000, "3": 105000}'::jsonb, 8000, '{"crumbs": 5000, "items": []}'::jsonb)
ON CONFLICT (level_number) DO NOTHING;

-- Insert starter outfit items
INSERT INTO outfit_items (name, slot, rarity, cost, unlock_requirement, image_url, stats)
VALUES
  ('Classic Cap', 'hat', 'common', 0, '{}'::jsonb, '/outfits/classic-cap.png', '{}'::jsonb),
  ('Chef Hat', 'hat', 'common', 200, '{"level": 3}'::jsonb, '/outfits/chef-hat.png', '{}'::jsonb),
  ('Santa Hat', 'hat', 'rare', 500, '{"level": 5, "stars": 10}'::jsonb, '/outfits/santa-hat.png', '{}'::jsonb),
  ('Crown', 'hat', 'epic', 1500, '{"level": 15, "stars": 30}'::jsonb, '/outfits/crown.png', '{"bonus_crumbs": 0.1}'::jsonb),
  ('Diamond Crown', 'hat', 'legendary', 5000, '{"level": 30, "stars": 90}'::jsonb, '/outfits/diamond-crown.png', '{"bonus_crumbs": 0.25}'::jsonb),
  
  ('Classic Apron', 'outfit', 'common', 0, '{}'::jsonb, '/outfits/classic-apron.png', '{}'::jsonb),
  ('Baker Outfit', 'outfit', 'common', 300, '{"level": 4}'::jsonb, '/outfits/baker-outfit.png', '{}'::jsonb),
  ('Elf Suit', 'outfit', 'rare', 700, '{"level": 8}'::jsonb, '/outfits/elf-suit.png', '{}'::jsonb),
  ('Candy Armor', 'outfit', 'epic', 2000, '{"level": 20}'::jsonb, '/outfits/candy-armor.png', '{"combo_boost": 0.1}'::jsonb),
  ('Royal Robe', 'outfit', 'legendary', 6000, '{"level": 30}'::jsonb, '/outfits/royal-robe.png', '{"combo_boost": 0.2, "bonus_crumbs": 0.15}'::jsonb),
  
  ('Cookie Necklace', 'accessory', 'common', 150, '{"level": 2}'::jsonb, '/outfits/cookie-necklace.png', '{}'::jsonb),
  ('Candy Cane', 'accessory', 'rare', 400, '{"level": 6}'::jsonb, '/outfits/candy-cane.png', '{}'::jsonb),
  ('Golden Spatula', 'accessory', 'epic', 1000, '{"level": 12}'::jsonb, '/outfits/golden-spatula.png', '{"score_boost": 0.05}'::jsonb),
  ('Magic Whisk', 'accessory', 'legendary', 3000, '{"level": 25}'::jsonb, '/outfits/magic-whisk.png', '{"score_boost": 0.15}'::jsonb),
  
  ('Cookie Wings', 'back', 'rare', 800, '{"level": 10}'::jsonb, '/outfits/cookie-wings.png', '{}'::jsonb),
  ('Sprinkle Trail', 'back', 'epic', 1800, '{"level": 18}'::jsonb, '/outfits/sprinkle-trail.png', '{}'::jsonb),
  ('Angel Wings', 'back', 'legendary', 4000, '{"level": 28}'::jsonb, '/outfits/angel-wings.png', '{"score_boost": 0.1}'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert power-up items
INSERT INTO power_up_items (name, type, rarity, cost, effect_value, duration_seconds, description, icon)
VALUES
  ('Sugar Rush', 'score_boost', 'common', 50, 1.5, 10, 'Increases score by 50% for 10 seconds', '⚡'),
  ('Time Freeze', 'time_freeze', 'rare', 100, 1.0, 5, 'Freezes the timer for 5 seconds', '❄️'),
  ('Mega Combo', 'combo_multiplier', 'epic', 150, 2.0, 15, 'Doubles combo multiplier for 15 seconds', '🔥'),
  ('Shuffle', 'shuffle', 'common', 30, 1.0, 0, 'Shuffles the board instantly', '🔀'),
  ('Hint', 'hint', 'common', 20, 1.0, 0, 'Reveals a possible match', '💡'),
  ('Cookie Bomb', 'bomb', 'rare', 80, 3.0, 0, 'Clears a 3x3 area', '💣'),
  ('Rainbow Burst', 'color_burst', 'epic', 120, 1.0, 0, 'Clears all treats of one color', '🌈')
ON CONFLICT DO NOTHING;