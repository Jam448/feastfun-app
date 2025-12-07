export type TreatType =
  | 'choc_chip' | 'gingerbread' | 'sugar_tree' | 'snickerdoodle' | 'oatmeal' | 'peanut_butter'
  | 'candy_bar' | 'wrapped_candy' | 'candy_cane' | 'lollipop' | 'gummy' | 'jellybean'
  | 'hershey_kiss' | 'truffle' | 'brownie' | 'hot_chocolate' | 'cocoa_powder' | 'chocolate_bar'

export interface TreatDefinition {
  id: TreatType
  name: string
  emoji: string
  color: string
  world: 'Cookie Forest' | 'Candy Mountains' | 'Cocoa Castle'
}

export const TREATS: Record<TreatType, TreatDefinition> = {
  choc_chip: {
    id: 'choc_chip',
    name: 'Chocolate Chip Cookie',
    emoji: '🍪',
    color: '#8B4513',
    world: 'Cookie Forest'
  },
  gingerbread: {
    id: 'gingerbread',
    name: 'Gingerbread Man',
    emoji: '🧑‍🍳',
    color: '#CD853F',
    world: 'Cookie Forest'
  },
  sugar_tree: {
    id: 'sugar_tree',
    name: 'Christmas Tree Cookie',
    emoji: '🎄',
    color: '#228B22',
    world: 'Cookie Forest'
  },
  snickerdoodle: {
    id: 'snickerdoodle',
    name: 'Snickerdoodle',
    emoji: '🥨',
    color: '#DEB887',
    world: 'Cookie Forest'
  },
  oatmeal: {
    id: 'oatmeal',
    name: 'Oatmeal Cookie',
    emoji: '🥐',
    color: '#D2691E',
    world: 'Cookie Forest'
  },
  peanut_butter: {
    id: 'peanut_butter',
    name: 'Peanut Butter Cookie',
    emoji: '🥜',
    color: '#CD853F',
    world: 'Cookie Forest'
  },
  candy_bar: {
    id: 'candy_bar',
    name: 'Candy Bar',
    emoji: '🍫',
    color: '#8B4513',
    world: 'Candy Mountains'
  },
  wrapped_candy: {
    id: 'wrapped_candy',
    name: 'Wrapped Candy',
    emoji: '🍬',
    color: '#FF69B4',
    world: 'Candy Mountains'
  },
  candy_cane: {
    id: 'candy_cane',
    name: 'Candy Cane',
    emoji: '🍭',
    color: '#DC143C',
    world: 'Candy Mountains'
  },
  lollipop: {
    id: 'lollipop',
    name: 'Lollipop',
    emoji: '🍡',
    color: '#FF1493',
    world: 'Candy Mountains'
  },
  gummy: {
    id: 'gummy',
    name: 'Gummy Bear',
    emoji: '🧸',
    color: '#FFD700',
    world: 'Candy Mountains'
  },
  jellybean: {
    id: 'jellybean',
    name: 'Jellybeans',
    emoji: '🫘',
    color: '#00CED1',
    world: 'Candy Mountains'
  },
  hershey_kiss: {
    id: 'hershey_kiss',
    name: 'Chocolate Kiss',
    emoji: '💋',
    color: '#8B4513',
    world: 'Cocoa Castle'
  },
  truffle: {
    id: 'truffle',
    name: 'Chocolate Truffle',
    emoji: '⚫',
    color: '#3E2723',
    world: 'Cocoa Castle'
  },
  brownie: {
    id: 'brownie',
    name: 'Brownie',
    emoji: '🟫',
    color: '#5D4037',
    world: 'Cocoa Castle'
  },
  hot_chocolate: {
    id: 'hot_chocolate',
    name: 'Hot Chocolate',
    emoji: '☕',
    color: '#6F4E37',
    world: 'Cocoa Castle'
  },
  cocoa_powder: {
    id: 'cocoa_powder',
    name: 'Cocoa Powder',
    emoji: '🍂',
    color: '#654321',
    world: 'Cocoa Castle'
  },
  chocolate_bar: {
    id: 'chocolate_bar',
    name: 'Chocolate Bar',
    emoji: '🍫',
    color: '#7B3F00',
    world: 'Cocoa Castle'
  }
}

export type ObjectiveType = 'score' | 'collect' | 'clear_blockers' | 'special_matches'

export interface LevelObjective {
  type: ObjectiveType
  target: number
  treatType?: TreatType
  description: string
}

export interface LevelConfiguration {
  levelNumber: number
  world: 'Cookie Forest' | 'Candy Mountains' | 'Cocoa Castle'
  gridSize: { rows: number; cols: number }
  moves: number
  treats: TreatType[]
  objectives: LevelObjective[]
  blockers?: number
  specialTreats?: boolean
  starThresholds: { 1: number; 2: number; 3: number }
}

export const LEVEL_CONFIGS: LevelConfiguration[] = [
  {
    levelNumber: 1,
    world: 'Cookie Forest',
    gridSize: { rows: 8, cols: 8 },
    moves: 25,
    treats: ['choc_chip', 'gingerbread', 'sugar_tree', 'snickerdoodle'],
    objectives: [
      { type: 'score', target: 500, description: 'Score 500 points' }
    ],
    blockers: 0,
    specialTreats: false,
    starThresholds: { 1: 500, 2: 800, 3: 1200 }
  },
  {
    levelNumber: 2,
    world: 'Cookie Forest',
    gridSize: { rows: 8, cols: 8 },
    moves: 20,
    treats: ['choc_chip', 'gingerbread', 'sugar_tree', 'snickerdoodle'],
    objectives: [
      { type: 'collect', target: 15, treatType: 'sugar_tree', description: 'Collect 15 Christmas Tree Cookies' }
    ],
    blockers: 0,
    specialTreats: false,
    starThresholds: { 1: 600, 2: 1000, 3: 1500 }
  },
  {
    levelNumber: 3,
    world: 'Cookie Forest',
    gridSize: { rows: 8, cols: 8 },
    moves: 20,
    treats: ['choc_chip', 'gingerbread', 'sugar_tree', 'snickerdoodle', 'oatmeal'],
    objectives: [
      { type: 'score', target: 1200, description: 'Score 1200 points' }
    ],
    blockers: 5,
    specialTreats: false,
    starThresholds: { 1: 800, 2: 1300, 3: 2000 }
  },
  {
    levelNumber: 4,
    world: 'Cookie Forest',
    gridSize: { rows: 8, cols: 8 },
    moves: 18,
    treats: ['choc_chip', 'gingerbread', 'sugar_tree', 'snickerdoodle', 'oatmeal'],
    objectives: [
      { type: 'collect', target: 20, treatType: 'gingerbread', description: 'Collect 20 Gingerbread Men' }
    ],
    blockers: 8,
    specialTreats: true,
    starThresholds: { 1: 900, 2: 1500, 3: 2300 }
  },
  {
    levelNumber: 5,
    world: 'Cookie Forest',
    gridSize: { rows: 8, cols: 8 },
    moves: 18,
    treats: ['choc_chip', 'gingerbread', 'sugar_tree', 'snickerdoodle', 'oatmeal', 'peanut_butter'],
    objectives: [
      { type: 'score', target: 2000, description: 'Score 2000 points' }
    ],
    blockers: 10,
    specialTreats: true,
    starThresholds: { 1: 1100, 2: 1800, 3: 2700 }
  },
  {
    levelNumber: 6,
    world: 'Cookie Forest',
    gridSize: { rows: 8, cols: 8 },
    moves: 16,
    treats: ['choc_chip', 'gingerbread', 'sugar_tree', 'snickerdoodle', 'oatmeal', 'peanut_butter'],
    objectives: [
      { type: 'collect', target: 25, treatType: 'choc_chip', description: 'Collect 25 Chocolate Chip Cookies' }
    ],
    blockers: 12,
    specialTreats: true,
    starThresholds: { 1: 1000, 2: 1700, 3: 2600 }
  },
  {
    levelNumber: 7,
    world: 'Cookie Forest',
    gridSize: { rows: 8, cols: 8 },
    moves: 16,
    treats: ['choc_chip', 'gingerbread', 'sugar_tree', 'snickerdoodle', 'oatmeal', 'peanut_butter'],
    objectives: [
      { type: 'special_matches', target: 5, description: 'Make 5 special matches (4+ in a row)' }
    ],
    blockers: 15,
    specialTreats: true,
    starThresholds: { 1: 1000, 2: 1700, 3: 2700 }
  },
  {
    levelNumber: 8,
    world: 'Cookie Forest',
    gridSize: { rows: 8, cols: 8 },
    moves: 15,
    treats: ['choc_chip', 'gingerbread', 'sugar_tree', 'snickerdoodle', 'oatmeal', 'peanut_butter'],
    objectives: [
      { type: 'score', target: 3500, description: 'Score 3500 points' }
    ],
    blockers: 18,
    specialTreats: true,
    starThresholds: { 1: 950, 2: 1600, 3: 2500 }
  },
  {
    levelNumber: 9,
    world: 'Cookie Forest',
    gridSize: { rows: 8, cols: 8 },
    moves: 15,
    treats: ['choc_chip', 'gingerbread', 'sugar_tree', 'snickerdoodle', 'oatmeal', 'peanut_butter'],
    objectives: [
      { type: 'clear_blockers', target: 20, description: 'Clear 20 blockers' }
    ],
    blockers: 20,
    specialTreats: true,
    starThresholds: { 1: 950, 2: 1600, 3: 2600 }
  },
  {
    levelNumber: 10,
    world: 'Cookie Forest',
    gridSize: { rows: 8, cols: 8 },
    moves: 20,
    treats: ['choc_chip', 'gingerbread', 'sugar_tree', 'snickerdoodle', 'oatmeal', 'peanut_butter'],
    objectives: [
      { type: 'score', target: 5000, description: 'BOSS: Score 5000 points!' }
    ],
    blockers: 25,
    specialTreats: true,
    starThresholds: { 1: 1300, 2: 2200, 3: 3500 }
  },
  {
    levelNumber: 11,
    world: 'Candy Mountains',
    gridSize: { rows: 8, cols: 8 },
    moves: 20,
    treats: ['candy_bar', 'wrapped_candy', 'candy_cane', 'lollipop'],
    objectives: [
      { type: 'score', target: 5500, description: 'Score 5500 points' }
    ],
    blockers: 15,
    specialTreats: true,
    starThresholds: { 1: 1400, 2: 2400, 3: 3800 }
  },
  {
    levelNumber: 12,
    world: 'Candy Mountains',
    gridSize: { rows: 8, cols: 8 },
    moves: 18,
    treats: ['candy_bar', 'wrapped_candy', 'candy_cane', 'lollipop'],
    objectives: [
      { type: 'collect', target: 30, treatType: 'candy_cane', description: 'Collect 30 Candy Canes' }
    ],
    blockers: 18,
    specialTreats: true,
    starThresholds: { 1: 1200, 2: 2100, 3: 3400 }
  },
  {
    levelNumber: 13,
    world: 'Candy Mountains',
    gridSize: { rows: 8, cols: 8 },
    moves: 18,
    treats: ['candy_bar', 'wrapped_candy', 'candy_cane', 'lollipop', 'gummy'],
    objectives: [
      { type: 'score', target: 6500, description: 'Score 6500 points' }
    ],
    blockers: 20,
    specialTreats: true,
    starThresholds: { 1: 1300, 2: 2300, 3: 3700 }
  },
  {
    levelNumber: 14,
    world: 'Candy Mountains',
    gridSize: { rows: 8, cols: 8 },
    moves: 16,
    treats: ['candy_bar', 'wrapped_candy', 'candy_cane', 'lollipop', 'gummy'],
    objectives: [
      { type: 'special_matches', target: 8, description: 'Make 8 special matches' }
    ],
    blockers: 22,
    specialTreats: true,
    starThresholds: { 1: 1100, 2: 2000, 3: 3300 }
  },
  {
    levelNumber: 15,
    world: 'Candy Mountains',
    gridSize: { rows: 8, cols: 8 },
    moves: 16,
    treats: ['candy_bar', 'wrapped_candy', 'candy_cane', 'lollipop', 'gummy', 'jellybean'],
    objectives: [
      { type: 'score', target: 8000, description: 'Score 8000 points' }
    ],
    blockers: 25,
    specialTreats: true,
    starThresholds: { 1: 1200, 2: 2100, 3: 3500 }
  },
  {
    levelNumber: 16,
    world: 'Candy Mountains',
    gridSize: { rows: 8, cols: 8 },
    moves: 15,
    treats: ['candy_bar', 'wrapped_candy', 'candy_cane', 'lollipop', 'gummy', 'jellybean'],
    objectives: [
      { type: 'collect', target: 35, treatType: 'wrapped_candy', description: 'Collect 35 Wrapped Candies' }
    ],
    blockers: 28,
    specialTreats: true,
    starThresholds: { 1: 1000, 2: 1900, 3: 3200 }
  },
  {
    levelNumber: 17,
    world: 'Candy Mountains',
    gridSize: { rows: 8, cols: 8 },
    moves: 15,
    treats: ['candy_bar', 'wrapped_candy', 'candy_cane', 'lollipop', 'gummy', 'jellybean'],
    objectives: [
      { type: 'clear_blockers', target: 30, description: 'Clear 30 blockers' }
    ],
    blockers: 30,
    specialTreats: true,
    starThresholds: { 1: 1100, 2: 2000, 3: 3400 }
  },
  {
    levelNumber: 18,
    world: 'Candy Mountains',
    gridSize: { rows: 8, cols: 8 },
    moves: 14,
    treats: ['candy_bar', 'wrapped_candy', 'candy_cane', 'lollipop', 'gummy', 'jellybean'],
    objectives: [
      { type: 'score', target: 11000, description: 'Score 11000 points' }
    ],
    blockers: 32,
    specialTreats: true,
    starThresholds: { 1: 1000, 2: 1800, 3: 3100 }
  },
  {
    levelNumber: 19,
    world: 'Candy Mountains',
    gridSize: { rows: 8, cols: 8 },
    moves: 14,
    treats: ['candy_bar', 'wrapped_candy', 'candy_cane', 'lollipop', 'gummy', 'jellybean'],
    objectives: [
      { type: 'special_matches', target: 10, description: 'Make 10 special matches' }
    ],
    blockers: 35,
    specialTreats: true,
    starThresholds: { 1: 1050, 2: 1900, 3: 3300 }
  },
  {
    levelNumber: 20,
    world: 'Candy Mountains',
    gridSize: { rows: 8, cols: 8 },
    moves: 22,
    treats: ['candy_bar', 'wrapped_candy', 'candy_cane', 'lollipop', 'gummy', 'jellybean'],
    objectives: [
      { type: 'score', target: 15000, description: 'BOSS: Score 15000 points!' }
    ],
    blockers: 40,
    specialTreats: true,
    starThresholds: { 1: 1600, 2: 2900, 3: 4800 }
  },
  {
    levelNumber: 21,
    world: 'Cocoa Castle',
    gridSize: { rows: 8, cols: 8 },
    moves: 18,
    treats: ['hershey_kiss', 'truffle', 'brownie', 'hot_chocolate'],
    objectives: [
      { type: 'score', target: 16000, description: 'Score 16000 points' }
    ],
    blockers: 35,
    specialTreats: true,
    starThresholds: { 1: 1400, 2: 2600, 3: 4400 }
  },
  {
    levelNumber: 22,
    world: 'Cocoa Castle',
    gridSize: { rows: 8, cols: 8 },
    moves: 16,
    treats: ['hershey_kiss', 'truffle', 'brownie', 'hot_chocolate'],
    objectives: [
      { type: 'collect', target: 40, treatType: 'hershey_kiss', description: 'Collect 40 Chocolate Kisses' }
    ],
    blockers: 38,
    specialTreats: true,
    starThresholds: { 1: 1200, 2: 2300, 3: 4000 }
  },
  {
    levelNumber: 23,
    world: 'Cocoa Castle',
    gridSize: { rows: 8, cols: 8 },
    moves: 16,
    treats: ['hershey_kiss', 'truffle', 'brownie', 'hot_chocolate', 'cocoa_powder'],
    objectives: [
      { type: 'score', target: 18000, description: 'Score 18000 points' }
    ],
    blockers: 40,
    specialTreats: true,
    starThresholds: { 1: 1300, 2: 2500, 3: 4300 }
  },
  {
    levelNumber: 24,
    world: 'Cocoa Castle',
    gridSize: { rows: 8, cols: 8 },
    moves: 15,
    treats: ['hershey_kiss', 'truffle', 'brownie', 'hot_chocolate', 'cocoa_powder'],
    objectives: [
      { type: 'clear_blockers', target: 40, description: 'Clear 40 blockers' }
    ],
    blockers: 40,
    specialTreats: true,
    starThresholds: { 1: 1200, 2: 2300, 3: 4100 }
  },
  {
    levelNumber: 25,
    world: 'Cocoa Castle',
    gridSize: { rows: 8, cols: 8 },
    moves: 15,
    treats: ['hershey_kiss', 'truffle', 'brownie', 'hot_chocolate', 'cocoa_powder', 'chocolate_bar'],
    objectives: [
      { type: 'score', target: 20000, description: 'Score 20000 points' }
    ],
    blockers: 42,
    specialTreats: true,
    starThresholds: { 1: 1250, 2: 2400, 3: 4200 }
  },
  {
    levelNumber: 26,
    world: 'Cocoa Castle',
    gridSize: { rows: 8, cols: 8 },
    moves: 14,
    treats: ['hershey_kiss', 'truffle', 'brownie', 'hot_chocolate', 'cocoa_powder', 'chocolate_bar'],
    objectives: [
      { type: 'special_matches', target: 12, description: 'Make 12 special matches' }
    ],
    blockers: 45,
    specialTreats: true,
    starThresholds: { 1: 1100, 2: 2200, 3: 3900 }
  },
  {
    levelNumber: 27,
    world: 'Cocoa Castle',
    gridSize: { rows: 8, cols: 8 },
    moves: 14,
    treats: ['hershey_kiss', 'truffle', 'brownie', 'hot_chocolate', 'cocoa_powder', 'chocolate_bar'],
    objectives: [
      { type: 'collect', target: 45, treatType: 'hot_chocolate', description: 'Collect 45 Hot Chocolates' }
    ],
    blockers: 48,
    specialTreats: true,
    starThresholds: { 1: 1150, 2: 2300, 3: 4100 }
  },
  {
    levelNumber: 28,
    world: 'Cocoa Castle',
    gridSize: { rows: 8, cols: 8 },
    moves: 13,
    treats: ['hershey_kiss', 'truffle', 'brownie', 'hot_chocolate', 'cocoa_powder', 'chocolate_bar'],
    objectives: [
      { type: 'score', target: 26000, description: 'Score 26000 points' }
    ],
    blockers: 50,
    specialTreats: true,
    starThresholds: { 1: 1050, 2: 2100, 3: 3800 }
  },
  {
    levelNumber: 29,
    world: 'Cocoa Castle',
    gridSize: { rows: 8, cols: 8 },
    moves: 13,
    treats: ['hershey_kiss', 'truffle', 'brownie', 'hot_chocolate', 'cocoa_powder', 'chocolate_bar'],
    objectives: [
      { type: 'clear_blockers', target: 50, description: 'Clear 50 blockers' }
    ],
    blockers: 50,
    specialTreats: true,
    starThresholds: { 1: 1100, 2: 2200, 3: 4000 }
  },
  {
    levelNumber: 30,
    world: 'Cocoa Castle',
    gridSize: { rows: 8, cols: 8 },
    moves: 25,
    treats: ['hershey_kiss', 'truffle', 'brownie', 'hot_chocolate', 'cocoa_powder', 'chocolate_bar'],
    objectives: [
      { type: 'score', target: 35000, description: 'FINAL BOSS: Score 35000 points!' }
    ],
    blockers: 55,
    specialTreats: true,
    starThresholds: { 1: 2000, 2: 3800, 3: 6500 }
  }
]

export function getLevelConfig(levelNumber: number): LevelConfiguration | undefined {
  return LEVEL_CONFIGS.find(config => config.levelNumber === levelNumber)
}

export function getTreatsByWorld(world: 'Cookie Forest' | 'Candy Mountains' | 'Cocoa Castle'): TreatDefinition[] {
  return Object.values(TREATS).filter(treat => treat.world === world)
}
