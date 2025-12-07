'use client'

import { useState, useEffect } from 'react'
import { Star, Lock, Trophy, ChevronRight } from 'lucide-react'
import { Bolt Database } from '@/lib/supabase'
import { LEVEL_CONFIGS, getLevelConfig } from '@/lib/level-configurations'
import { AuthButton } from '@/components/AuthButton'

interface Level {
  id: string
  level_number: number
  name: string
  description: string
  world: string
  target_score: number
  star_thresholds: { 1: number; 2: number; 3: number }
  unlock_cost: number
  rewards: { crumbs: number; items?: string[] }
}

interface PlayerLevel {
  level_id: string
  unlocked: boolean
  completed: boolean
  stars_earned: number
  best_score: number
  times_played: number
}

interface LevelMapProps {
  onLevelSelect: (level: Level) => void
}

export function LevelMap({ onLevelSelect }: LevelMapProps) {
  const [levels, setLevels] = useState<Level[]>([])
  const [playerProgress, setPlayerProgress] = useState<Map<string, PlayerLevel>>(new Map())
  const [loading, setLoading] = useState(true)
  const [selectedWorld, setSelectedWorld] = useState<string>('Cookie Forest')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    loadLevelsAndProgress()
  }, [])

  const loadLevelsAndProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)

      const { data: levelsData, error: levelsError } = await (Bolt Database as any)
        .from('levels')
        .select('*')
        .order('level_number')

      if (levelsError) throw levelsError

      setLevels(levelsData || [])

      if (user) {
        const { data: progressData, error: progressError } = await (Bolt Database as any)
          .from('player_levels')
          .select('*')
          .eq('player_id', user.id)

        if (progressError) throw progressError

        const progressMap = new Map<string, PlayerLevel>()
        progressData?.forEach((p: any) => {
          progressMap.set(p.level_id, p)
        })

        if (levelsData && levelsData.length > 0 && progressData?.length === 0) {
          await unlockFirstLevel(levelsData[0].id, user?.id)
          progressMap.set(levelsData[0].id, {
            level_id: levelsData[0].id,
            unlocked: true,
            completed: false,
            stars_earned: 0,
            best_score: 0,
            times_played: 0,
          })
        }

        setPlayerProgress(progressMap)
      }
    } catch (error) {
      console.error('Failed to load levels:', error)
    } finally {
      setLoading(false)
    }
  }

  const unlockFirstLevel = async (levelId: string, userId?: string) => {
    if (!userId) return

    try {
      await (Bolt Database as any).from('player_levels').insert({
        player_id: userId,
        level_id: levelId,
        unlocked: true,
        completed: false,
        stars_earned: 0,
        best_score: 0,
        times_played: 0,
      })
    } catch (error) {
      console.error('Failed to unlock first level:', error)
    }
  }

  const worlds = ['Cookie Forest', 'Candy Mountains', 'Cocoa Castle']
  const worldColors = {
    'Cookie Forest': 'from-green-600 to-emerald-700',
    'Candy Mountains': 'from-pink-600 to-purple-700',
    'Cocoa Castle': 'from-amber-700 to-orange-800',
  }

  const filteredLevels = levels.filter((l) => l.world === selectedWorld)

  const canUnlock = (level: Level): boolean => {
    if (!isAuthenticated) return level.level_number === 1

    if (level.level_number === 1) return true
    const prevLevel = levels.find((l) => l.level_number === level.level_number - 1)
    if (!prevLevel) return false
    const prevProgress = playerProgress.get(prevLevel.id)
    return prevProgress?.completed || false
  }

  const handleLevelClick = async (level: Level) => {
    if (!isAuthenticated) {
      onLevelSelect(level)
      return
    }

    const progress = playerProgress.get(level.id)

    if (progress?.unlocked) {
      onLevelSelect(level)
    } else if (canUnlock(level)) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      try {
        await (Bolt Database as any).from('player_levels').insert({
          player_id: user.id,
          level_id: level.id,
          unlocked: true,
          completed: false,
          stars_earned: 0,
          best_score: 0,
          times_played: 0,
        })

        await loadLevelsAndProgress()
      } catch (error) {
        console.error('Failed to unlock level:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading levels...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-white">Level Map</h1>
          <AuthButton />
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {worlds.map((world) => (
            <button
              key={world}
              onClick={() => setSelectedWorld(world)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                selectedWorld === world
                  ? 'bg-white text-red-600 scale-105'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {world}
            </button>
          ))}
        </div>

        <div className={`bg-gradient-to-br ${worldColors[selectedWorld as keyof typeof worldColors]} rounded-2xl p-6 shadow-2xl`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredLevels.map((level, index) => {
              const progress = playerProgress.get(level.id)
              const isUnlocked = !isAuthenticated || progress?.unlocked || level.level_number === 1
              const isCompleted = progress?.completed || false
              const stars = progress?.stars_earned || 0
              const canBeUnlocked = canUnlock(level)
              const isBossLevel = level.level_number % 10 === 0

              return (
                <button
                  key={level.id}
                  onClick={() => handleLevelClick(level)}
                  disabled={!isUnlocked && !canBeUnlocked}
                  className={`relative aspect-square rounded-xl p-4 flex flex-col items-center justify-center transition-all ${
                    isBossLevel ? 'col-span-2' : ''
                  } ${
                    isUnlocked
                      ? 'bg-white hover:scale-105 shadow-lg cursor-pointer'
                      : canBeUnlocked
                      ? 'bg-white/50 hover:scale-105 cursor-pointer border-2 border-yellow-400 border-dashed'
                      : 'bg-black/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  {isBossLevel && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2">
                      <Trophy className="w-5 h-5 text-yellow-900" />
                    </div>
                  )}

                  {!isUnlocked && !canBeUnlocked && (
                    <Lock className="w-8 h-8 text-gray-400 mb-2" />
                  )}

                  {!isUnlocked && canBeUnlocked && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                      <ChevronRight className="w-4 h-4 text-yellow-900" />
                    </div>
                  )}

                  <div className={`text-2xl font-bold mb-1 ${isUnlocked ? 'text-red-600' : 'text-white'}`}>
                    {level.level_number}
                  </div>

                  <div className={`text-xs font-semibold text-center mb-2 ${isUnlocked ? 'text-gray-700' : 'text-white/70'}`}>
                    {level.name}
                  </div>

                  {isUnlocked && isAuthenticated && (
                    <div className="flex gap-1">
                      {[1, 2, 3].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {isCompleted && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      ✓
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {filteredLevels.length === 0 && (
            <div className="text-center text-white text-xl py-12">
              No levels in this world yet!
            </div>
          )}
        </div>

        {!isAuthenticated && (
          <div className="mt-6 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-2xl p-6 text-center shadow-xl border-2 border-white/30">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="text-white font-bold text-xl mb-2">Save Your Progress!</h3>
            <p className="text-white/90 text-sm mb-4">
              Sign in to unlock all features, save progress, earn rewards, and compete on leaderboards!
            </p>
            <p className="text-white/80 text-xs mb-4">
              Future: Connect Solana wallet for NFT rewards and exclusive items
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
