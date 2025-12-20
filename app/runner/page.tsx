'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { RunnerGame, RunnerResults } from '@/components/RunnerGame'
import { Trophy, Sparkles, Zap, Home, Play as PlayIcon, MapPin, Cookie } from 'lucide-react'

export default function RunnerPage() {
  const router = useRouter()
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu')
  const [results, setResults] = useState<RunnerResults | null>(null)
  const [bestDistance, setBestDistance] = useState(0)
  const [bestScore, setBestScore] = useState(0)

  const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const patterns = { light: 10, medium: 25, heavy: 50 }
      navigator.vibrate(patterns[intensity])
    }
  }

  const handleGameEnd = (gameResults: RunnerResults) => {
    setResults(gameResults)
    
    if (gameResults.distance > bestDistance) {
      setBestDistance(gameResults.distance)
    }
    if (gameResults.score > bestScore) {
      setBestScore(gameResults.score)
    }
    
    setGameState('results')
  }

  const handlePlayAgain = () => {
    setGameState('playing')
    setResults(null)
  }

  if (gameState === 'results' && results) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="max-w-md w-full glass rounded-3xl p-6 card-elevated">
          <div className="text-center mb-5">
            <div className="text-6xl mb-3">💀</div>
            <h2 className="text-3xl font-black text-white mb-1">Run Over!</h2>
            <p className="text-white/70">Pockets got caught!</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <MapPin className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-2xl font-black text-white">{results.distance}m</div>
              <div className="text-xs text-white/70">Distance</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <Sparkles className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <div className="text-2xl font-black text-white">{results.score}</div>
              <div className="text-xs text-white/70">Score</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <Cookie className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <div className="text-2xl font-black text-white">{results.treatsCollected}</div>
              <div className="text-xs text-white/70">Treats</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <Zap className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <div className="text-2xl font-black text-white">{results.maxSpeed}</div>
              <div className="text-xs text-white/70">Max Speed</div>
            </div>
          </div>

          {/* Best scores */}
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-3 mb-5">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-yellow-300">Best Distance</div>
                <div className="font-black text-white">{bestDistance}m</div>
              </div>
              <Trophy className="w-8 h-8 text-yellow-400" />
              <div className="text-right">
                <div className="text-xs text-yellow-300">Best Score</div>
                <div className="font-black text-white">{bestScore}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handlePlayAgain}
              className="w-full bg-white text-purple-600 font-black text-lg py-4 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <PlayIcon className="w-5 h-5" />
              Run Again
            </button>
            <Link
              href="/"
              className="w-full bg-white/20 text-white font-bold py-3 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === 'playing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <RunnerGame
          onGameEnd={handleGameEnd}
          triggerHaptic={triggerHaptic}
        />
      </div>
    )
  }

  // Menu
  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 safe-top">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="bg-white/20 p-2 rounded-xl active:scale-95 transition-all">
            <Home className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-2xl font-black text-white">🏃 Treat Run</h1>
          <div className="w-10" />
        </div>

        {/* Main Card */}
        <div className="glass rounded-3xl p-6 mb-4 card-elevated text-center">
          <div className="relative w-28 h-28 mx-auto mb-4">
            <Image
              src="/santa_pockets.png"
              alt="Pockets"
              fill
              className="object-contain drop-shadow-2xl animate-bounce"
              priority
            />
          </div>
          
          <h2 className="text-3xl font-black text-white mb-2">Treat Run</h2>
          <p className="text-white/70 text-sm mb-6">
            Help Pockets escape while collecting treats!
          </p>

          <button
            onClick={() => setGameState('playing')}
            className="w-full bg-white text-purple-600 font-black text-xl py-4 rounded-xl active:scale-95 transition-all card-elevated mb-4"
          >
            🏃 START RUNNING
          </button>

          {bestDistance > 0 && (
            <div className="flex justify-center gap-4 text-sm">
              <div className="text-white/70">
                Best: <span className="text-yellow-400 font-bold">{bestDistance}m</span>
              </div>
              <div className="text-white/70">
                High Score: <span className="text-yellow-400 font-bold">{bestScore}</span>
              </div>
            </div>
          )}
        </div>

        {/* How to Play */}
        <div className="glass rounded-2xl p-4 mb-4">
          <h3 className="font-bold text-white mb-3">How to Play</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/10 rounded-lg p-3 flex items-center gap-2">
              <span className="text-2xl">👈👉</span>
              <span className="text-white/90">Swipe left/right to change lanes</span>
            </div>
            <div className="bg-white/10 rounded-lg p-3 flex items-center gap-2">
              <span className="text-2xl">👆</span>
              <span className="text-white/90">Swipe up to jump over obstacles</span>
            </div>
            <div className="bg-white/10 rounded-lg p-3 flex items-center gap-2">
              <span className="text-2xl">👇</span>
              <span className="text-white/90">Swipe down to slide under</span>
            </div>
            <div className="bg-white/10 rounded-lg p-3 flex items-center gap-2">
              <span className="text-2xl">🍪</span>
              <span className="text-white/90">Collect treats for points!</span>
            </div>
          </div>
        </div>

        {/* Obstacles & Treats */}
        <div className="glass rounded-2xl p-4">
          <h3 className="font-bold text-white mb-3">Watch Out For</h3>
          <div className="flex justify-around">
            <div className="text-center">
              <div className="text-3xl mb-1">🐕</div>
              <div className="text-xs text-white/70">Dogs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">🕳️</div>
              <div className="text-xs text-white/70">Potholes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">👵🧹</div>
              <div className="text-xs text-white/70">Old Ladies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">🚧</div>
              <div className="text-xs text-white/70">Barriers</div>
            </div>
          </div>
          
          <h3 className="font-bold text-white mb-3 mt-4">Collect These</h3>
          <div className="flex justify-around">
            <div className="text-center">
              <div className="text-3xl mb-1">🍪</div>
              <div className="text-xs text-yellow-400">+10</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">🍰</div>
              <div className="text-xs text-yellow-400">+15</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">🎂</div>
              <div className="text-xs text-yellow-400">+20</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">⭐</div>
              <div className="text-xs text-yellow-400">+50</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">💎</div>
              <div className="text-xs text-yellow-400">+75</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
