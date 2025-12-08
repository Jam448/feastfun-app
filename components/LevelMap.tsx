'use client'

import { useState, useEffect } from 'react'
import { Star, Lock, Trophy, ChevronRight, Home } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { LEVEL_CONFIGS } from '@/lib/level-configurations'
import { AuthButton } from '@/components/AuthButton'
import Link from 'next/link'

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

      const { data: levelsData, error: levelsError } = await (supabase as any)
        .from('levels')
        .select('*')
        .order('level_number')

      if (levelsError) {
        console.warn('Failed to load levels from database, using local configs:', levelsError)
        const fallbackLevels = LEVEL_CONFIGS.map(config => ({
          id: `local-${config.levelNumber}`,
          level_number: config.levelNumber,
          name: `Level ${config.levelNumber}`,
          description: config.objectives[0]?.description || '',
          world: config.world,
          target_score: config.starThresholds[1],
          star_thresholds: config.starThresholds,
          unlock_cost: 0,
          rewards: { crumbs: 50 }
        }))
        setLevels(fallbackLevels)
      } else if (!levelsData || levelsData.length === 0) {
        const fallbackLevels = LEVEL_CONFIGS.map(config => ({
          id: `local-${config.levelNumber}`,
          level_number: config.levelNumber,
          name: `Level ${config.levelNumber}`,
          description: config.objectives[0]?.description || '',
          world: config.world,
          target_score: config.starThresholds[1],
          star_thresholds: config.starThresholds,
          unlock_cost: 0,
          rewards: { crumbs: 50 }
        }))
        setLevels(fallbackLevels)
      } else {
        setLevels(levelsData)
      }

      if (user) {
        const { data: progressData, error: progressError } = await (supabase as any)
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
      await (supabase as any).from('player_levels').insert({
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

  const isBossCompleted = (bossLevelNumber: number): boolean => {
    if (!isAuthenticated) return false
    const bossLevel = levels.find(l => l.level_number === bossLevelNumber)
    if (!bossLevel) return false
    const progress = playerProgress.get(bossLevel.id)
    return progress?.completed || false
  }

  const isWorldUnlocked = (world: string): boolean => {
    if (!isAuthenticated) return false
    
    switch (world) {
      case 'Cookie Forest':
        return true
      case 'Candy Mountains':
        return isBossCompleted(10)
      case 'Cocoa Castle':
        return isBossCompleted(20)
      default:
        return false
    }
  }

  const getRequiredBoss = (world: string): { level: number; name: string } | null => {
    switch (world) {
      case 'Candy Mountains':
        return { level: 10, name: 'Cookie Forest Boss (Level 10)' }
      case 'Cocoa Castle':
        return { level: 20, name: 'Candy Mountains Boss (Level 20)' }
      default:
        return null
    }
  }

  const worlds = ['Cookie Forest', 'Candy Mountains', 'Cocoa Castle']
  const worldColors = {
    'Cookie Forest': 'from-green-600 to-emerald-700',
    'Candy Mountains': 'from-pink-600 to-purple-700',
    'Cocoa Castle': 'from-amber-700 to-orange-800',
  }

  const worldDecorations = {
    'Cookie Forest': ['🎄', '🍪', '🥨', '🎅', '🌲', '❄️'],
    'Candy Mountains': ['🍬', '🍭', '🧸', '🍫', '⛰️', '🌸'],
    'Cocoa Castle': ['☕', '💋', '🏰', '🟫', '🍂', '✨'],
  }

  const worldDescriptions = {
    'Cookie Forest': 'Journey through the festive cookie-filled forest!',
    'Candy Mountains': 'Climb the sweet peaks of candy paradise!',
    'Cocoa Castle': 'Conquer the chocolate fortress!',
  }

  const filteredLevels = levels.filter((l) => l.world === selectedWorld)
  const worldUnlocked = isWorldUnlocked(selectedWorld)
  const requiredBoss = getRequiredBoss(selectedWorld)

  const canUnlock = (level: Level): boolean => {
    if (!isAuthenticated) return false
    if (!worldUnlocked) return false

    if (level.level_number === 1 || level.level_number === 11 || level.level_number === 21) {
      return true
    }
    
    const prevLevel = levels.find((l) => l.level_number === level.level_number - 1)
    if (!prevLevel) return false
    const prevProgress = playerProgress.get(prevLevel.id)
    return prevProgress?.completed || false
  }

  const handleLevelClick = async (level: Level) => {
    if (!isAuthenticated) return
    if (!worldUnlocked) return

    const progress = playerProgress.get(level.id)

    if (progress?.unlocked) {
      onLevelSelect(level)
    } else if (canUnlock(level)) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      try {
        await (supabase as any).from('player_levels').insert({
          player_id: user.id,
          level_id: level.id,
          unlocked: true,
          completed: false,
          stars_earned: 0,
          best_score: 0,
          times_played: 0,
        })

        await loadLevelsAndProgress()
        onLevelSelect(level)
      } catch (error) {
        console.error('Failed to unlock level:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-white/30 border-t-white mx-auto mb-4" />
          <p className="text-white font-bold text-lg">Loading World Map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/snowflakes.svg')] opacity-10 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto p-4">
        {/* Header with Home button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-all hover:scale-105 active:scale-95"
              title="Back to Home"
            >
              <Home className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg">World Map</h1>
          </div>
          <AuthButton />
        </div>

        {/* World Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
          {worlds.map((world) => {
            const unlocked = isWorldUnlocked(world)
            
            return (
              <button
                key={world}
                onClick={() => setSelectedWorld(world)}
                className={`px-6 py-3 rounded-xl font-black whitespace-nowrap transition-all shadow-lg relative ${
                  selectedWorld === world
                    ? unlocked || world === 'Cookie Forest'
                      ? 'bg-gradient-to-br from-white to-yellow-50 text-red-600 scale-105 border-2 border-yellow-300'
                      : 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-600 scale-105 border-2 border-gray-400'
                    : unlocked || world === 'Cookie Forest'
                    ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-2 border-white/20'
                    : 'bg-black/40 text-white/50 backdrop-blur-sm border-2 border-black/20'
                }`}
              >
                {(!unlocked && world !== 'Cookie Forest') && (
                  <Lock className="w-4 h-4 inline-block mr-2" />
                )}
                {world}
              </button>
            )
          })}
        </div>

        {/* World Content */}
        <div className={`bg-gradient-to-br ${worldColors[selectedWorld as keyof typeof worldColors]} rounded-3xl p-5 shadow-2xl border-4 border-white/20 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-[url('/sparkles.svg')] opacity-5 pointer-events-none" />

          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {worldDecorations[selectedWorld as keyof typeof worldDecorations].map((emoji, i) => (
              <div
                key={i}
                className="absolute text-4xl opacity-20 animate-float"
                style={{
                  left: `${(i * 17 + 5) % 95}%`,
                  top: `${(i * 23 + 10) % 85}%`,
                  animationDelay: `${i * 0.7}s`,
                  animationDuration: `${4 + i % 3}s`
                }}
              >
                {emoji}
              </div>
            ))}
          </div>

          <div className="relative z-10 mb-4 text-center">
            <h2 className="text-2xl font-black text-white drop-shadow-lg mb-1">{selectedWorld}</h2>
            <p className="text-white/90 font-semibold text-sm">
              {worldDescriptions[selectedWorld as keyof typeof worldDescriptions]}
            </p>
          </div>

          {/* Show login required message */}
          {!isAuthenticated && (
            <div className="relative z-10 bg-black/40 rounded-2xl p-8 text-center backdrop-blur-sm border-2 border-white/20">
              <Lock className="w-16 h-16 text-white/80 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-white mb-2">Sign In Required</h3>
              <p className="text-white/80 mb-4">
                Sign in to unlock levels and save your progress!
              </p>
              <AuthButton />
            </div>
          )}

          {/* Show world locked message */}
          {isAuthenticated && !worldUnlocked && requiredBoss && (
            <div className="relative z-10 bg-black/40 rounded-2xl p-8 text-center backdrop-blur-sm border-2 border-white/20">
              <Lock className="w-16 h-16 text-white/80 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-white mb-2">World Locked</h3>
              <p className="text-white/80 mb-4">
                Complete <span className="font-black text-yellow-300">{requiredBoss.name}</span> to unlock this world!
              </p>
              <button
                onClick={() => setSelectedWorld(requiredBoss.level <= 10 ? 'Cookie Forest' : 'Candy Mountains')}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-black hover:scale-105 transition-transform shadow-lg"
              >
                Go to {requiredBoss.level <= 10 ? 'Cookie Forest' : 'Candy Mountains'}
              </button>
            </div>
          )}

          {/* Show levels grid */}
          {isAuthenticated && worldUnlocked && (
            <div className="relative z-10 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filteredLevels.map((level) => {
                const progress = playerProgress.get(level.id)
                const isUnlocked = progress?.unlocked || canUnlock(level)
                const isCompleted = progress?.completed || false
                const stars = progress?.stars_earned || 0
                const canBeUnlocked = canUnlock(level)
                const isBossLevel = level.level_number % 10 === 0

                return (
                  <button
                    key={level.id}
                    onClick={() => handleLevelClick(level)}
                    disabled={!isUnlocked && !canBeUnlocked}
                    className={`relative aspect-square rounded-2xl p-3 flex flex-col items-center justify-center transition-all ${
                      isBossLevel ? 'col-span-2 row-span-2' : ''
                    } ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-white to-yellow-50 hover:scale-105 shadow-xl cursor-pointer border-4 border-white/60'
                        : canBeUnlocked
                        ? 'bg-gradient-to-br from-yellow-200/80 to-yellow-300/80 hover:scale-105 cursor-pointer border-4 border-yellow-400 border-dashed animate-pulse'
                        : 'bg-black/40 cursor-not-allowed opacity-60 border-4 border-black/20'
                    }`}
                  >
                    {isBossLevel && isUnlocked && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg border-2 border-white animate-bounce">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                    )}

                    {!isUnlocked && !canBeUnlocked && (
                      <Lock className="w-10 h-10 text-gray-400 mb-1" />
                    )}

                    {!isUnlocked && canBeUnlocked && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-br from-green-400 to-green-600 rounded-full p-1.5 shadow-lg border-2 border-white animate-bounce">
                        <ChevronRight className="w-5 h-5 text-white" />
                      </div>
                    )}

                    <div className={`${isBossLevel ? 'text-5xl' : 'text-3xl'} font-black mb-1 ${
                      isUnlocked ? 'text-red-600 drop-shadow-sm' : 'text-white drop-shadow-lg'
                    }`}>
                      {level.level_number}
                    </div>

                    <div className={`text-xs font-bold text-center mb-1 leading-tight ${
                      isUnlocked ? 'text-gray-700' : 'text-white/90'
                    }`}>
                      {level.name}
                    </div>

                    {isUnlocked && (
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= stars
                                ? 'text-yellow-400 fill-yellow-400 drop-shadow-md'
                                : 'text-gray-300 fill-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {isCompleted && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm px-3 py-1 rounded-full font-black shadow-lg border-2 border-white">
                        ✓
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {isAuthenticated && worldUnlocked && filteredLevels.length === 0 && (
            <div className="text-center text-white text-xl py-12 font-bold">
              No levels in this world yet!
            </div>
          )}
        </div>

        {/* Sign in prompt */}
        {!isAuthenticated && (
          <div className="mt-6 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 rounded-3xl p-6 text-center shadow-2xl border-4 border-white/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/sparkles.svg')] opacity-10 pointer-events-none" />
            <div className="relative z-10">
              <div className="text-5xl mb-4 animate-bounce">🔒</div>
              <h3 className="text-white font-black text-2xl mb-3 drop-shadow-lg">Save Your Progress!</h3>
              <p className="text-white font-semibold text-base mb-4 leading-relaxed">
                Sign in to unlock all features, save progress, earn rewards, and compete on leaderboards!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}