// src/lib/level-configurations.ts

export type WorldName = 'Cookie Forest' | 'Candy Mountains' | 'Cocoa Castle'

export type LevelConfig = {
  level_number: number
  world: WorldName
  name: string
  description: string
  target_score: number
  star_thresholds: { 1: number; 2: number; 3: number }
  unlock_cost: number
  rewards: { crumbs: number; items?: string[] }
  moves_limit?: number
  time_limit_seconds?: number
}

export const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: {
    level_number: 1,
    world: 'Cookie Forest',
    name: 'First Swipe',
    description: 'Learn the basics and grab your first stars.',
    target_score: 500,
    star_thresholds: { 1: 300, 2: 500, 3: 800 },
    unlock_cost: 0,
    rewards: { crumbs: 25 },
    moves_limit: 20,
  },
  2: {
    level_number: 2,
    world: 'Cookie Forest',
    name: 'Crumb Trail',
    description: 'Keep the combo going.',
    target_score: 800,
    star_thresholds: { 1: 500, 2: 800, 3: 1200 },
    unlock_cost: 0,
    rewards: { crumbs: 30 },
    moves_limit: 20,
  },
  3: {
    level_number: 3,
    world: 'Cookie Forest',
    name: 'Pocket Raid',
    description: 'Pockets is getting greedy.',
    target_score: 1100,
    star_thresholds: { 1: 700, 2: 1100, 3: 1600 },
    unlock_cost: 0,
    rewards: { crumbs: 35 },
    moves_limit: 22,
  },
  4: {
    level_number: 4,
    world: 'Cookie Forest',
    name: 'Sticky Situation',
    description: 'Watch for blockers.',
    target_score: 1400,
    star_thresholds: { 1: 900, 2: 1400, 3: 2000 },
    unlock_cost: 10,
    rewards: { crumbs: 40 },
    moves_limit: 24,
  },
  5: {
    level_number: 5,
    world: 'Cookie Forest',
    name: 'Boss Bite',
    description: 'First mini-boss level.',
    target_score: 1800,
    star_thresholds: { 1: 1200, 2: 1800, 3: 2600 },
    unlock_cost: 15,
    rewards: { crumbs: 60, items: ['trail_confetti'] },
    moves_limit: 25,
  },
}

/**
 * Returns a config for a given level number.
 * Falls back to a sensible generated config if not explicitly defined.
 */
export function getLevelConfig(levelNumber: number): LevelConfig {
  const defined = LEVEL_CONFIGS[levelNumber]
  if (defined) return defined

  const world: WorldName =
    levelNumber <= 20 ? 'Cookie Forest' : levelNumber <= 40 ? 'Candy Mountains' : 'Cocoa Castle'

  const baseTarget = 500 + levelNumber * 220
  const t1 = Math.max(200, Math.floor(baseTarget * 0.6))
  const t2 = Math.max(300, Math.floor(baseTarget * 1.0))
  const t3 = Math.max(400, Math.floor(baseTarget * 1.6))

  return {
    level_number: levelNumber,
    world,
    name: `Level ${levelNumber}`,
    description: 'A tasty challenge awaits.',
    target_score: baseTarget,
    star_thresholds: { 1: t1, 2: t2, 3: t3 },
    unlock_cost: levelNumber <= 5 ? 0 : Math.min(100, 5 + Math.floor(levelNumber * 1.5)),
    rewards: { crumbs: Math.min(250, 20 + levelNumber * 3) },
    moves_limit: 18 + Math.min(20, Math.floor(levelNumber / 2)),
  }
}
