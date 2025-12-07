'use client'

import { useGameStore } from '@/hooks/useGameStore'
import { useProgression } from '@/hooks/useProgression'
import { Character3D } from '@/components/Character3D'
import { AuthButton } from '@/components/AuthButton'
import Link from 'next/link'
import { Play, Trophy, Star, Zap, Map, Sparkles } from 'lucide-react'

export default function HomePage() {
  const { state, isLoaded } = useGameStore()
  const { totalStars, crumbs, highestUnlockedLevel, loading } = useProgression()

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 safe-top pb-24">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex justify-end mb-4">
          <AuthButton />
        </div>
        <div className="glass rounded-3xl p-8 card-elevated text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="mb-6 flex justify-center">
              <Character3D size="medium" animate={true} showStats={false} />
            </div>
            <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
              FeastFun
            </h1>
            <p className="text-xl text-white/90 font-medium mb-2">Christmas Edition</p>
            <p className="text-sm text-white/70 mb-4">featuring Pockets the Raccoon!</p>
            <div className="mt-6 flex gap-3 justify-center">
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                <span className="text-white font-bold">{totalStars} Stars</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-white font-bold">{crumbs} Crumbs</span>
              </div>
            </div>
          </div>
        </div>

        <Link href="/feast" className="w-full">
          <button className="group w-full bg-white hover:bg-white/95 text-red-600 font-black text-lg py-8 rounded-2xl card-elevated transition-all duration-200 active:scale-95 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-50" />
            <div className="relative z-10">
              <Map className="w-10 h-10 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div>Level Map</div>
              <div className="text-xs font-normal text-red-500 mt-1">30 Festive Levels</div>
            </div>
          </button>
        </Link>

        <div className="grid grid-cols-2 gap-4">
          <Link href="/arcade">
            <button className="group w-full bg-white/10 hover:bg-white/15 text-white font-black text-lg py-8 rounded-2xl card-elevated transition-all duration-200 active:scale-95 border-2 border-white/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
              <div className="relative z-10">
                <Zap className="w-10 h-10 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div>Arcade</div>
                <div className="text-xs font-normal text-white/70 mt-1">Bonus Mode</div>
              </div>
            </button>
          </Link>

          <Link href="/play">
            <button className="group w-full bg-white/10 hover:bg-white/15 text-white font-black text-lg py-8 rounded-2xl card-elevated transition-all duration-200 active:scale-95 border-2 border-white/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
              <div className="relative z-10">
                <Play className="w-10 h-10 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div>Play</div>
                <div className="text-xs font-normal text-white/70 mt-1">Runner</div>
              </div>
            </button>
          </Link>
        </div>

        {state.totalRuns > 0 && (
          <div className="glass rounded-2xl p-6 card-elevated">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-300" />
              Your Progress
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-black text-white">{state.bestScore}</div>
                <div className="text-sm text-white/70 mt-1">Best Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-white">{state.crumbs}</div>
                <div className="text-sm text-white/70 mt-1">Crumbs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-white">{state.dailyStreak}</div>
                <div className="text-sm text-white/70 mt-1">Streak</div>
              </div>
            </div>
          </div>
        )}

        <div className="glass rounded-2xl p-6 card-elevated space-y-4">
          <div>
            <h3 className="font-bold text-white text-base mb-2">🎮 Match-3 Mode</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-white">•</span>
                <span>Match 3 or more treats to score points</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white">•</span>
                <span>Earn up to 3 stars per level</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white">•</span>
                <span>Complete objectives within move limit</span>
              </li>
            </ul>
          </div>

          <div className="border-t border-white/20 pt-4">
            <h3 className="font-bold text-white text-base mb-2">⚡ Arcade Mode</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-white">•</span>
                <span>Collect yummy desserts for points</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white">•</span>
                <span>Avoid non-food items like bats and socks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white">•</span>
                <span>Use dash to phase through obstacles</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
