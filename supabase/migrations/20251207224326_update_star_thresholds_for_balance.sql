/*
  # Update Star Thresholds for Better Game Balance

  ## Overview
  The original star thresholds scaled too aggressively, making it nearly impossible
  to earn 3 stars even with skilled play. This migration recalculates all thresholds
  based on realistic scoring:

  - 1 star: ~50-80 points per move (basic 3-matches)
  - 2 stars: ~80-120 points per move (some combos and 4-matches)
  - 3 stars: ~120-200 points per move (excellent combos and specials)

  ## Scoring System Reference
  - 3-match: 60 base points
  - 4-match: 120 base points
  - 5-match: 200 base points
  - 6-match: 400 base points
  - 7+ match: 800 base points
  - Combo multiplier increases score progressively

  ## Changes Made
  Updates all 30 levels with properly scaled star thresholds that maintain
  consistent difficulty progression while remaining achievable.
*/

-- Update Cookie Forest levels (1-10)
UPDATE levels SET star_thresholds = '{"1": 500, "2": 800, "3": 1200}'::jsonb WHERE level_number = 1;
UPDATE levels SET star_thresholds = '{"1": 600, "2": 1000, "3": 1500}'::jsonb WHERE level_number = 2;
UPDATE levels SET star_thresholds = '{"1": 800, "2": 1300, "3": 2000}'::jsonb WHERE level_number = 3;
UPDATE levels SET star_thresholds = '{"1": 900, "2": 1500, "3": 2300}'::jsonb WHERE level_number = 4;
UPDATE levels SET star_thresholds = '{"1": 1100, "2": 1800, "3": 2700}'::jsonb WHERE level_number = 5;
UPDATE levels SET star_thresholds = '{"1": 1000, "2": 1700, "3": 2600}'::jsonb WHERE level_number = 6;
UPDATE levels SET star_thresholds = '{"1": 1000, "2": 1700, "3": 2700}'::jsonb WHERE level_number = 7;
UPDATE levels SET star_thresholds = '{"1": 950, "2": 1600, "3": 2500}'::jsonb WHERE level_number = 8;
UPDATE levels SET star_thresholds = '{"1": 950, "2": 1600, "3": 2600}'::jsonb WHERE level_number = 9;
UPDATE levels SET star_thresholds = '{"1": 1300, "2": 2200, "3": 3500}'::jsonb WHERE level_number = 10;

-- Update Candy Mountains levels (11-20)
UPDATE levels SET star_thresholds = '{"1": 1400, "2": 2400, "3": 3800}'::jsonb WHERE level_number = 11;
UPDATE levels SET star_thresholds = '{"1": 1200, "2": 2100, "3": 3400}'::jsonb WHERE level_number = 12;
UPDATE levels SET star_thresholds = '{"1": 1300, "2": 2300, "3": 3700}'::jsonb WHERE level_number = 13;
UPDATE levels SET star_thresholds = '{"1": 1100, "2": 2000, "3": 3300}'::jsonb WHERE level_number = 14;
UPDATE levels SET star_thresholds = '{"1": 1200, "2": 2100, "3": 3500}'::jsonb WHERE level_number = 15;
UPDATE levels SET star_thresholds = '{"1": 1000, "2": 1900, "3": 3200}'::jsonb WHERE level_number = 16;
UPDATE levels SET star_thresholds = '{"1": 1100, "2": 2000, "3": 3400}'::jsonb WHERE level_number = 17;
UPDATE levels SET star_thresholds = '{"1": 1000, "2": 1800, "3": 3100}'::jsonb WHERE level_number = 18;
UPDATE levels SET star_thresholds = '{"1": 1050, "2": 1900, "3": 3300}'::jsonb WHERE level_number = 19;
UPDATE levels SET star_thresholds = '{"1": 1600, "2": 2900, "3": 4800}'::jsonb WHERE level_number = 20;

-- Update Cocoa Castle levels (21-30)
UPDATE levels SET star_thresholds = '{"1": 1400, "2": 2600, "3": 4400}'::jsonb WHERE level_number = 21;
UPDATE levels SET star_thresholds = '{"1": 1200, "2": 2300, "3": 4000}'::jsonb WHERE level_number = 22;
UPDATE levels SET star_thresholds = '{"1": 1300, "2": 2500, "3": 4300}'::jsonb WHERE level_number = 23;
UPDATE levels SET star_thresholds = '{"1": 1200, "2": 2300, "3": 4100}'::jsonb WHERE level_number = 24;
UPDATE levels SET star_thresholds = '{"1": 1250, "2": 2400, "3": 4200}'::jsonb WHERE level_number = 25;
UPDATE levels SET star_thresholds = '{"1": 1100, "2": 2200, "3": 3900}'::jsonb WHERE level_number = 26;
UPDATE levels SET star_thresholds = '{"1": 1150, "2": 2300, "3": 4100}'::jsonb WHERE level_number = 27;
UPDATE levels SET star_thresholds = '{"1": 1050, "2": 2100, "3": 3800}'::jsonb WHERE level_number = 28;
UPDATE levels SET star_thresholds = '{"1": 1100, "2": 2200, "3": 4000}'::jsonb WHERE level_number = 29;
UPDATE levels SET star_thresholds = '{"1": 2000, "2": 3800, "3": 6500}'::jsonb WHERE level_number = 30;
