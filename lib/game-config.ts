// Christmas-themed foods for match-3 game
export const CHRISTMAS_FOODS = [
  { id: 'candy_cane', emoji: '🍬', color: '#ef4444', name: 'Candy Cane' },
  { id: 'gingerbread', emoji: '🍪', color: '#92400e', name: 'Gingerbread' },
  { id: 'santa_hat', emoji: '🎅', color: '#dc2626', name: 'Santa Hat' },
  { id: 'snowflake', emoji: '❄️', color: '#60a5fa', name: 'Snowflake' },
  { id: 'gift', emoji: '🎁', color: '#22c55e', name: 'Gift' },
  { id: 'ornament', emoji: '🎄', color: '#10b981', name: 'Ornament' },
]

// Arcade game items (Christmas theme)
export const ARCADE_ITEMS = {
  goodFoods: [
    { emoji: '🍬', color: '#22c55e', name: 'Candy Cane', points: 10 },
    { emoji: '🍪', color: '#fbbf24', name: 'Gingerbread', points: 10 },
    { emoji: '🎂', color: '#ec4899', name: 'Cake', points: 10 },
    { emoji: '🍩', color: '#f97316', name: 'Donut', points: 10 },
    { emoji: '🧁', color: '#a855f7', name: 'Cupcake', points: 10 },
    { emoji: '🍰', color: '#06b6d4', name: 'Pie', points: 10 },
  ],
  goldenFoods: [
    { emoji: '⭐', color: '#fbbf24', name: 'Golden Star', points: 50 },
    { emoji: '🌟', color: '#facc15', name: 'Shining Star', points: 50 },
  ],
  hazards: [
    { emoji: '🏏', color: '#ef4444', name: 'Baseball Bat', points: 0 },
    { emoji: '🧦', color: '#8b5cf6', name: 'Smelly Sock', points: 0 },
    { emoji: '🪨', color: '#78716c', name: 'Rock', points: 0 },
    { emoji: '🔨', color: '#dc2626', name: 'Hammer', points: 0 },
  ],
}

// Special foods created from matches
export const SPECIAL_FOODS = {
  striped_horizontal: { emoji: '➡️', effect: 'clearRow', color: '#3b82f6' },
  striped_vertical: { emoji: '⬇️', effect: 'clearColumn', color: '#3b82f6' },
  wrapped: { emoji: '💥', effect: 'explode3x3', color: '#a855f7' },
  rainbow: { emoji: '🌈', effect: 'clearAllOfType', color: '#ec4899' },
}

// Level objectives
export type LevelObjective = {
  type: 'score' | 'collect' | 'clear' | 'special'
  target: number
  description: string
  foodType?: string
}

// Level definitions (30 Christmas levels)
export const LEVELS = [
  // Tutorial levels (1-5)
  {
    level: 1,
    gridSize: { rows: 8, cols: 7 },
    maxMoves: 25,
    objectives: [
      { type: 'score' as const, target: 1000, description: 'Score 1,000 points' }
    ],
    starThresholds: [1000, 2000, 3500],
    difficulty: 'easy' as const,
  },
  {
    level: 2,
    gridSize: { rows: 8, cols: 7 },
    maxMoves: 22,
    objectives: [
      { type: 'score' as const, target: 1500, description: 'Score 1,500 points' }
    ],
    starThresholds: [1500, 2500, 4000],
    difficulty: 'easy' as const,
  },
  {
    level: 3,
    gridSize: { rows: 8, cols: 7 },
    maxMoves: 20,
    objectives: [
      { type: 'score' as const, target: 2000, description: 'Score 2,000 points' }
    ],
    starThresholds: [2000, 3500, 5500],
    difficulty: 'easy' as const,
  },
  {
    level: 4,
    gridSize: { rows: 8, cols: 7 },
    maxMoves: 20,
    objectives: [
      { type: 'score' as const, target: 2500, description: 'Score 2,500 points' }
    ],
    starThresholds: [2500, 4000, 6500],
    difficulty: 'easy' as const,
  },
  {
    level: 5,
    gridSize: { rows: 8, cols: 7 },
    maxMoves: 20,
    objectives: [
      { type: 'score' as const, target: 3000, description: 'Score 3,000 points' }
    ],
    starThresholds: [3000, 5000, 8000],
    difficulty: 'easy' as const,
  },
  // Regular levels (6-15)
  ...Array.from({ length: 10 }, (_, i) => {
    const level = i + 6
    const baseTarget = 4000 + level * 500
    return {
      level,
      gridSize: { rows: 9, cols: 7 },
      maxMoves: 20,
      objectives: [
        {
          type: 'score' as const,
          target: baseTarget,
          description: `Score ${baseTarget.toLocaleString()} points`
        }
      ],
      starThresholds: [
        baseTarget,
        Math.floor(baseTarget * 1.5),
        Math.floor(baseTarget * 2.2)
      ],
      difficulty: 'medium' as const,
    }
  }),
  // Hard levels (16-30)
  ...Array.from({ length: 15 }, (_, i) => {
    const level = i + 16
    const baseTarget = 10000 + level * 700
    return {
      level,
      gridSize: { rows: 9, cols: 7 },
      maxMoves: Math.max(12, 18 - Math.floor(i / 5)),
      objectives: [
        {
          type: 'score' as const,
          target: baseTarget,
          description: `Score ${baseTarget.toLocaleString()} points`
        }
      ],
      starThresholds: [
        baseTarget,
        Math.floor(baseTarget * 1.4),
        Math.floor(baseTarget * 2.0)
      ],
      difficulty: 'hard' as const,
    }
  })
]

// Get level configuration
export function getLevelConfig(levelNumber: number) {
  return LEVELS.find(l => l.level === levelNumber) || LEVELS[0]
}

// Power-up definitions
export const POWER_UPS = {
  rainbow_blast: {
    id: 'rainbow_blast',
    name: 'Rainbow Blast',
    description: 'Clear all treats of one type',
    icon: '🌈',
    coinCost: 100,
  },
  row_clear: {
    id: 'row_clear',
    name: 'Row Blaster',
    description: 'Clear an entire row',
    icon: '➡️',
    coinCost: 50,
  },
  column_clear: {
    id: 'column_clear',
    name: 'Column Crusher',
    description: 'Clear an entire column',
    icon: '⬇️',
    coinCost: 50,
  },
  bomb: {
    id: 'bomb',
    name: 'Holiday Bomb',
    description: 'Destroy 3x3 area',
    icon: '💣',
    coinCost: 75,
  },
  shuffle: {
    id: 'shuffle',
    name: 'Shuffle Board',
    description: 'Rearrange all treats',
    icon: '🔀',
    coinCost: 80,
  },
}

// Match scores (base points per candy in match)
export const MATCH_SCORES = {
  3: 60,
  4: 120,
  5: 200,
  6: 400,
  7: 800,
}

// Points per remaining move at level completion
export const MOVE_COMPLETION_BONUS = 100

// Lives configuration
export const LIVES_CONFIG = {
  max: 5,
  regenTimeMinutes: 30,
}
