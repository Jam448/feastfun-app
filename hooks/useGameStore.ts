'use client'

import { useState, useEffect } from 'react'

export type CosmeticType = 'skin' | 'trail' | 'emote'

export interface Cosmetic {
  id: string
  name: string
  type: CosmeticType
  cost: number
  color?: string
  description: string
}

export interface Challenge {
  id: string
  name: string
  description: string
  type: 'daily' | 'weekly'
  target: number
  progress: number
  reward: number
  completed: boolean
}

export interface GameState {
  bestScore: number
  crumbs: number
  ownedCosmetics: string[]
  selectedSkin: string
  selectedTrail: string
  selectedEmote: string
  completedChallenges: string[]
  dailyStreak: number
  lastPlayedDate: string
  soundEnabled: boolean
  hapticsEnabled: boolean
  totalRuns: number
  totalScore: number
}

const STORAGE_KEY = 'feastfun_game_state'

const DEFAULT_STATE: GameState = {
  bestScore: 0,
  crumbs: 0,
  ownedCosmetics: ['default_skin', 'default_trail'],
  selectedSkin: 'default_skin',
  selectedTrail: 'default_trail',
  selectedEmote: '',
  completedChallenges: [],
  dailyStreak: 0,
  lastPlayedDate: '',
  soundEnabled: true,
  hapticsEnabled: true,
  totalRuns: 0,
  totalScore: 0,
}

export const COSMETICS: Cosmetic[] = [
  { id: 'default_skin', name: 'Classic', type: 'skin', cost: 0, color: '#3b82f6', description: 'The OG' },
  { id: 'fire_skin', name: 'Firecracker', type: 'skin', cost: 500, color: '#ef4444', description: 'Blazing hot' },
  { id: 'ice_skin', name: 'Frosty', type: 'skin', cost: 500, color: '#06b6d4', description: 'Cool as ice' },
  { id: 'gold_skin', name: 'Golden', type: 'skin', cost: 1000, color: '#fbbf24', description: 'For winners' },
  { id: 'neon_skin', name: 'Neon', type: 'skin', cost: 1500, color: '#a855f7', description: 'Glow up' },
  { id: 'default_trail', name: 'Basic Trail', type: 'trail', cost: 0, description: 'Standard trail' },
  { id: 'star_trail', name: 'Starlight', type: 'trail', cost: 300, description: 'Leave stars behind' },
  { id: 'rainbow_trail', name: 'Rainbow', type: 'trail', cost: 800, description: 'Colorful path' },
  { id: 'wave_emote', name: 'Wave', type: 'emote', cost: 200, description: '👋' },
  { id: 'fire_emote', name: 'On Fire', type: 'emote', cost: 400, description: '🔥' },
]

const CHALLENGE_TEMPLATES = [
  { id: 'score_1000', name: 'Score 1000', description: 'Score 1000+ points in a run', type: 'daily', target: 1000, reward: 100 },
  { id: 'score_2000', name: 'Score 2000', description: 'Score 2000+ points in a run', type: 'daily', target: 2000, reward: 200 },
  { id: 'collect_20', name: 'Bite Collector', description: 'Collect 20 Good Bites in one run', type: 'daily', target: 20, reward: 150 },
  { id: 'combo_5', name: 'Combo Master', description: 'Reach a 5x combo multiplier', type: 'daily', target: 5, reward: 100 },
  { id: 'golden_3', name: 'Golden Hunter', description: 'Collect 3 Golden Bites in one run', type: 'daily', target: 3, reward: 200 },
  { id: 'perfect_run', name: 'Perfect Run', description: 'Complete a run without hitting hazards', type: 'daily', target: 1, reward: 300 },
  { id: 'dash_10', name: 'Dash Master', description: 'Use dash 10 times in one run', type: 'daily', target: 10, reward: 100 },
  { id: 'play_3', name: 'Daily Grind', description: 'Complete 3 runs today', type: 'daily', target: 3, reward: 150 },
  { id: 'survive_45', name: 'Survivor', description: 'Survive for 45+ seconds', type: 'daily', target: 45, reward: 100 },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Collect 30 bites in 30 seconds', type: 'daily', target: 30, reward: 250 },
  { id: 'week_score_10k', name: 'Weekly Warrior', description: 'Score 10,000+ total points this week', type: 'weekly', target: 10000, reward: 500 },
  { id: 'week_runs_15', name: 'Dedication', description: 'Complete 15 runs this week', type: 'weekly', target: 15, reward: 400 },
  { id: 'week_streak_5', name: 'Streak Master', description: 'Maintain a 5-day streak', type: 'weekly', target: 5, reward: 600 },
  { id: 'week_golden_15', name: 'Golden Week', description: 'Collect 15 Golden Bites this week', type: 'weekly', target: 15, reward: 700 },
  { id: 'week_perfect_3', name: 'Perfectionist', description: 'Complete 3 perfect runs this week', type: 'weekly', target: 3, reward: 800 },
]

export function useGameStore() {
  const [state, setState] = useState<GameState>(DEFAULT_STATE)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setState(JSON.parse(saved))
      }
      setMounted(true)
      loadChallenges()
    }
  }, [])

  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state, mounted])

  const loadChallenges = () => {
    const today = new Date().toISOString().split('T')[0]
    const dayOfWeek = new Date().getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date()
    monday.setDate(monday.getDate() + mondayOffset)
    const weekKey = monday.toISOString().split('T')[0]

    const dailyTemplates = CHALLENGE_TEMPLATES.filter(c => c.type === 'daily')
    const weeklyTemplates = CHALLENGE_TEMPLATES.filter(c => c.type === 'weekly')

    const seed = parseInt(today.replace(/-/g, '')) % dailyTemplates.length
    const activeDailies = [
      dailyTemplates[seed % dailyTemplates.length],
      dailyTemplates[(seed + 1) % dailyTemplates.length],
      dailyTemplates[(seed + 2) % dailyTemplates.length],
    ]

    const allChallenges: Challenge[] = [
      ...activeDailies.map(t => ({
        ...t,
        id: `${t.id}_${today}`,
        type: 'daily' as const,
        progress: 0,
        completed: false,
      })),
      ...weeklyTemplates.map(t => ({
        ...t,
        id: `${t.id}_${weekKey}`,
        type: 'weekly' as const,
        progress: 0,
        completed: false,
      })),
    ]

    setChallenges(allChallenges)
  }

  const updateScore = (score: number) => {
    const crumbsEarned = Math.floor(score / 200)
    const today = new Date().toISOString().split('T')[0]

    let newStreak = state.dailyStreak
    if (state.lastPlayedDate !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      newStreak = state.lastPlayedDate === yesterdayStr ? state.dailyStreak + 1 : 1
    }

    console.log('[Analytics] run_ended', { score, crumbsEarned, streak: newStreak })

    setState(prev => ({
      ...prev,
      bestScore: Math.max(prev.bestScore, score),
      crumbs: prev.crumbs + crumbsEarned,
      dailyStreak: newStreak,
      lastPlayedDate: today,
      totalRuns: prev.totalRuns + 1,
      totalScore: prev.totalScore + score,
    }))

    return { crumbsEarned, newStreak }
  }

  const purchaseCosmetic = (cosmeticId: string) => {
    const cosmetic = COSMETICS.find(c => c.id === cosmeticId)
    if (!cosmetic || state.crumbs < cosmetic.cost || state.ownedCosmetics.includes(cosmeticId)) {
      return false
    }

    console.log('[Analytics] cosmetic_purchased', { cosmeticId, cost: cosmetic.cost })

    setState(prev => ({
      ...prev,
      crumbs: prev.crumbs - cosmetic.cost,
      ownedCosmetics: [...prev.ownedCosmetics, cosmeticId],
    }))

    return true
  }

  const selectCosmetic = (cosmeticId: string, type: CosmeticType) => {
    if (!state.ownedCosmetics.includes(cosmeticId)) return

    if (type === 'skin') {
      setState(prev => ({ ...prev, selectedSkin: cosmeticId }))
    } else if (type === 'trail') {
      setState(prev => ({ ...prev, selectedTrail: cosmeticId }))
    } else if (type === 'emote') {
      setState(prev => ({ ...prev, selectedEmote: cosmeticId }))
    }
  }

  const completeChallenge = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId)
    if (!challenge || state.completedChallenges.includes(challengeId)) return 0

    console.log('[Analytics] challenge_completed', { challengeId, reward: challenge.reward })

    setState(prev => ({
      ...prev,
      crumbs: prev.crumbs + challenge.reward,
      completedChallenges: [...prev.completedChallenges, challengeId],
    }))

    return challenge.reward
  }

  const updateChallengeProgress = (challengeId: string, progress: number) => {
    setChallenges(prev =>
      prev.map(c =>
        c.id === challengeId && !state.completedChallenges.includes(challengeId)
          ? { ...c, progress: Math.max(c.progress, progress), completed: progress >= c.target }
          : c
      )
    )
  }

  const toggleSound = () => {
    setState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))
  }

  const toggleHaptics = () => {
    setState(prev => ({ ...prev, hapticsEnabled: !prev.hapticsEnabled }))
  }

  const resetData = () => {
    console.log('[Analytics] data_reset')
    setState(DEFAULT_STATE)
    setChallenges([])
    loadChallenges()
  }

  const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!state.hapticsEnabled) return
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 50,
      }
      navigator.vibrate(patterns[intensity])
    }
  }

  return {
    state,
    challenges,
    cosmetics: COSMETICS,
    updateScore,
    purchaseCosmetic,
    selectCosmetic,
    completeChallenge,
    updateChallengeProgress,
    toggleSound,
    toggleHaptics,
    resetData,
    triggerHaptic,
    mounted,
  }
}
