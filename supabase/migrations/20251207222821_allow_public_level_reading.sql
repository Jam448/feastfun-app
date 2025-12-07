/*
  # Allow Public Access to Game Content

  ## Overview
  Update RLS policies to allow unauthenticated users to view game content.
  This enables a better UX where users can explore levels before signing up.

  ## Changes
  1. **Update levels policy**
     - Allow both authenticated and anonymous users to read levels
     - This lets users browse the world map before creating an account
  
  2. **Update outfit_items and power_up_items policies**
     - Allow anonymous users to view available items
     - Encourages signups by showing what's available

  ## Security
  - Read-only access for game content tables
  - Write operations still require authentication
  - Player progress tables remain authenticated-only
*/

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Anyone can read levels" ON levels;

-- Create new policy that allows both authenticated and anonymous users
CREATE POLICY "Public can read levels"
  ON levels FOR SELECT
  TO authenticated, anon
  USING (true);

-- Update outfit items policy
DROP POLICY IF EXISTS "Anyone can read outfit items" ON outfit_items;

CREATE POLICY "Public can read outfit items"
  ON outfit_items FOR SELECT
  TO authenticated, anon
  USING (true);

-- Update power-up items policy
DROP POLICY IF EXISTS "Anyone can read power-up items" ON power_up_items;

CREATE POLICY "Public can read power-up items"
  ON power_up_items FOR SELECT
  TO authenticated, anon
  USING (true);
