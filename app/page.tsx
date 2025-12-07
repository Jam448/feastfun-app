'use client'

import { useGameStore } from '@/hooks/useGameStore'
import { useProgression } from '@/hooks/useProgression'
import { Character3D } from '@/components/Character3D'
import { AuthButton } from '@/components/AuthButton'
import Link from 'next/link'
import { Play, Trophy, Star, Zap, Map, Sparkles, Gift, Calendar } from 'lucide-react'

export default function HomePage() {
  const { state, isLoaded } = useGameStore()
  const { totalStars, crumbs, highestUnlockedLevel, loading } = useProgression()

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-red-700 to-red-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-white/30 border-t-white mx-auto mb-4" />
          <p className="text-white font-bold text-lg">Loading FeastFun...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/snowflakes.svg')] opacity-10 pointer-events-none" />

      <div className="relative z-10 p-4 pb-24 max-w-lg mx-auto">
        <div className="flex justify-end mb-3">
          <AuthButton />
        </div>

        <div className="relative glass-card rounded-3xl p-6 mb-5 overflow-hidden border-2 border-white/30 shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-400/20 rounded-full blur-3xl" />

          <div className="relative z-10 text-center">
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <Character3D size="medium" animate={true} showStats={false} />
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <Gift className="w-8 h-8 text-yellow-300 drop-shadow-lg" />
                </div>
              </div>
            </div>

            <h1 className="text-6xl font-black text-white mb-1 tracking-tight drop-shadow-lg bg-gradient-to-b from-white to-red-100 bg-clip-text text-transparent">
              FeastFun
            </h1>
            <p className="text-2xl text-white/95 font-bold mb-1 drop-shadow-md">Christmas Edition</p>
            <p className="text-sm text-white/80 font-medium mb-5">featuring Pockets the Raccoon!</p>

            <div className="flex gap-2 justify-center flex-wrap">
              <div className="glass-stat px-5 py-3 rounded-full backdrop-blur-md border border-white/30 shadow-lg">
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-300 fill-yellow-300 drop-shadow-md" />
                  <div className="text-left">
                    <div className="text-white font-black text-xl leading-none">{totalStars}</div>
                    <div className="text-white/80 text-xs font-medium">Stars</div>
                  </div>
                </div>
              </div>

              <div className="glass-stat px-5 py-3 rounded-full backdrop-blur-md border border-white/30 shadow-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-300 drop-shadow-md" />
                  <div className="text-left">
                    <div className="text-white font-black text-xl leading-none">{crumbs}</div>
                    <div className="text-white/80 text-xs font-medium">Crumbs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Link href="/feast" className="block w-full mb-4">
          <button className="game-button-primary w-full bg-gradient-to-br from-white via-red-50 to-white hover:from-red-50 hover:via-white hover:to-red-50 text-red-600 font-black text-xl py-6 rounded-2xl shadow-2xl transition-all duration-200 active:scale-95 border-4 border-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 via-yellow-400/20 to-yellow-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-1 left-1 right-1 h-8 bg-white/50 rounded-t-xl" />
            <div className="relative z-10 flex items-center justify-center gap-3">
              <Map className="w-12 h-12 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-2xl leading-none mb-1">Level Map</div>
                <div className="text-sm font-semibold text-red-500/80">3 Worlds • 30 Levels</div>
              </div>
            </div>
          </button>
        </Link>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <Link href="/arcade">
            <button className="game-button-secondary w-full bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-black text-base py-6 rounded-2xl shadow-xl transition-all duration-200 active:scale-95 border-2 border-orange-300/50 relative overflow-hidden group">
              <div className="absolute top-1 left-1 right-1 h-6 bg-white/20 rounded-t-xl" />
              <div className="relative z-10">
                <Zap className="w-10 h-10 mx-auto mb-2 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                <div className="text-lg">Arcade</div>
                <div className="text-xs font-semibold text-white/90 mt-1">Endless Mode</div>
              </div>
            </button>
          </Link>

          <Link href="/play">
            <button className="game-button-secondary w-full bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-black text-base py-6 rounded-2xl shadow-xl transition-all duration-200 active:scale-95 border-2 border-green-300/50 relative overflow-hidden group">
              <div className="absolute top-1 left-1 right-1 h-6 bg-white/20 rounded-t-xl" />
              <div className="relative z-10">
                <Play className="w-10 h-10 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-lg">Runner</div>
                <div className="text-xs font-semibold text-white/90 mt-1">Classic Mode</div>
              </div>
            </button>
          </Link>
        </div>

        {state.totalRuns > 0 && (
          <div className="glass-card rounded-2xl p-5 mb-5 border-2 border-white/20 shadow-xl">
            <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-300 fill-yellow-300" />
              Your Progress
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm border border-white/20">
                <div className="text-3xl font-black text-white mb-1">{state.bestScore}</div>
                <div className="text-xs text-white/80 font-semibold">Best Score</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm border border-white/20">
                <div className="text-3xl font-black text-white mb-1">{state.crumbs}</div>
                <div className="text-xs text-white/80 font-semibold">Crumbs</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm border border-white/20">
                <div className="text-3xl font-black text-white mb-1">{state.dailyStreak}</div>
                <div className="text-xs text-white/80 font-semibold">Day Streak</div>
              </div>
            </div>
          </div>
        )}

        <div className="glass-card rounded-2xl p-5 border-2 border-white/20 shadow-xl">
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="font-black text-white text-base mb-3 flex items-center gap-2">
                <Map className="w-5 h-5 text-green-400" />
                Match-3 Mode
              </h3>
              <ul className="space-y-2 text-sm text-white/90">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span className="font-medium">Match 3+ treats to score</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 font-bold">★</span>
                  <span className="font-medium">Earn up to 3 stars per level</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 font-bold">⚡</span>
                  <span className="font-medium">Complete objectives & progress</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="font-black text-white text-base mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-400" />
                Arcade Mode
              </h3>
              <ul className="space-y-2 text-sm text-white/90">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">🍪</span>
                  <span className="font-medium">Collect yummy treats</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">⚠</span>
                  <span className="font-medium">Avoid obstacles & bad items</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">⚡</span>
                  <span className="font-medium">Use dash to dodge</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
