// Wardrobe System for Pockets 2.0
// Only items with actual PNG assets

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type SlotType = 'hat' | 'shirt' | 'pants' | 'shoes' | 'accessory'

export interface WardrobeItem {
  id: string
  name: string
  slot: SlotType
  rarity: Rarity
  emoji: string
  description: string
  unlockMethod: 'default' | 'purchase' | 'achievement' | 'event' | 'level'
  price?: number
  hasPNG: boolean
}

export interface PlayerOutfit {
  hat: string | null
  shirt: string | null
  pants: string | null
  shoes: string | null
  accessory: string | null
}

export const RARITY_CONFIG: Record<Rarity, { color: string; bgColor: string; label: string }> = {
  common: { color: '#9ca3af', bgColor: 'bg-gray-500/20', label: 'Common' },
  uncommon: { color: '#22c55e', bgColor: 'bg-green-500/20', label: 'Uncommon' },
  rare: { color: '#3b82f6', bgColor: 'bg-blue-500/20', label: 'Rare' },
  epic: { color: '#a855f7', bgColor: 'bg-purple-500/20', label: 'Epic' },
  legendary: { color: '#f59e0b', bgColor: 'bg-yellow-500/20', label: 'Legendary' },
}

// ==========================================
// HATS
// ==========================================
export const HATS: WardrobeItem[] = [
  {
    id: 'hat_none',
    name: 'No Hat',
    slot: 'hat',
    rarity: 'common',
    emoji: '🚫',
    description: 'No hat equipped',
    unlockMethod: 'default',
    hasPNG: false,
  },
  {
    id: 'hat_santa',
    name: 'Santa Hat',
    slot: 'hat',
    rarity: 'legendary',
    emoji: '🎅',
    description: 'Ho ho ho! The classic Christmas look',
    unlockMethod: 'default',
    hasPNG: true,
  },
]

// ==========================================
// SHIRTS
// ==========================================
export const SHIRTS: WardrobeItem[] = [
  {
    id: 'shirt_none',
    name: 'No Shirt',
    slot: 'shirt',
    rarity: 'common',
    emoji: '🚫',
    description: 'Just fur',
    unlockMethod: 'default',
    hasPNG: false,
  },
  {
    id: 'shirt_hoodie_green',
    name: 'Green Hoodie',
    slot: 'shirt',
    rarity: 'uncommon',
    emoji: '🧥',
    description: 'Cozy green hoodie with front pocket',
    unlockMethod: 'default',
    hasPNG: true,
  },
]

// ==========================================
// PANTS (empty for now)
// ==========================================
export const PANTS: WardrobeItem[] = [
  {
    id: 'pants_none',
    name: 'No Pants',
    slot: 'pants',
    rarity: 'common',
    emoji: '🚫',
    description: 'Natural look',
    unlockMethod: 'default',
    hasPNG: false,
  },
]

// ==========================================
// SHOES (empty for now)
// ==========================================
export const SHOES: WardrobeItem[] = [
  {
    id: 'shoes_none',
    name: 'No Shoes',
    slot: 'shoes',
    rarity: 'common',
    emoji: '🚫',
    description: 'Bare paws',
    unlockMethod: 'default',
    hasPNG: false,
  },
]

// ==========================================
// ACCESSORIES (empty for now)
// ==========================================
export const ACCESSORIES: WardrobeItem[] = [
  {
    id: 'acc_none',
    name: 'No Accessory',
    slot: 'accessory',
    rarity: 'common',
    emoji: '🚫',
    description: 'Nothing extra',
    unlockMethod: 'default',
    hasPNG: false,
  },
]

// All items combined
export const ALL_WARDROBE_ITEMS: WardrobeItem[] = [
  ...HATS,
  ...SHIRTS,
  ...PANTS,
  ...SHOES,
  ...ACCESSORIES,
]

// Get items by slot
export const getItemsBySlot = (slot: SlotType): WardrobeItem[] => {
  switch (slot) {
    case 'hat': return HATS
    case 'shirt': return SHIRTS
    case 'pants': return PANTS
    case 'shoes': return SHOES
    case 'accessory': return ACCESSORIES
  }
}

// Get item by ID
export const getItemById = (id: string): WardrobeItem | undefined => {
  return ALL_WARDROBE_ITEMS.find(item => item.id === id)
}

// Default outfit - naked Pockets
export const DEFAULT_OUTFIT: PlayerOutfit = {
  hat: 'hat_none',
  shirt: 'shirt_none',
  pants: 'pants_none',
  shoes: 'shoes_none',
  accessory: 'acc_none',
}

// Outfit sets (empty for now)
export const OUTFIT_SETS: any[] = []