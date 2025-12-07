export type WorldName = 'Cookie Forest' | 'Candy Mountains' | 'Cocoa Castle'

export type LevelConfig = {
  levelNumber: number
  world: WorldName
  name: string
  description: string
  targetScore: number
  starThresholds: { 1: number; 2: number; 3: number }
  unlockCost: number
  rewards: { crumbs: number; items?: string[] }
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    levelNumber: 1,
    world: 'Cookie Forest',
    name: 'First Swipe',
    description: 'Warm up and learn the basics.',
    targetScore: 500,
    starThresholds: { 1: 400, 2: 700, 3: 1000 },
    unlockCost: 0,
    rewards: { crumbs:
