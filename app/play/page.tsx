'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { GameCanvas, GameResults } from '@/components/GameCanvas'
import { useGameStore, COSMETICS } from '@/hooks/useGameStore'
import { Trophy, Sparkles, Zap, Home, Play as PlayIcon } from 'lucide-react'

export default function PlayPage() {
  const router = useRouter()
  const { state, cosmetics, updateScore, updateChallengeProgress, completeChallenge, challenges, triggerHaptic, isLoaded } = useGameStore()
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu')
  const [results, setResults] = useState<GameResults | null>(null)
  const [rewards, setRewards] = useState<{ crumbs: number; challengeRewards: number }>({ crumbs: 0, challengeRewards: 0 })

  const selectedSkin = COSMETICS.find(c => c.id === state.selectedSkin)
  const playerColor = selectedSkin?.color || '#3b82f6'

  const handleGameEnd = (gameResults: GameResults) => {
    console.log('[Analytics] run_started', { score: gameResults.score })

    const { crumbsEarned } = updateScore(gameResults.score)

    let totalChallengeRewards = 0

    challenges.forEach(challenge => {
      if (challenge.completed && !state.completedChallenges.includes(challenge.id)) {
        const reward = completeChallenge(challenge.id)
        totalChallengeRewards += reward
      }
    })

    challenges.forEach(challenge => {
      switch (challenge.id.split('_')[0]) {
        case 'score':
          if (gameResults.score >= challenge.target) {
            updateChallengeProgress(challenge.id, gameResults.score)
          }
          break
        case 'collect':
          updateChallengeProgress(challenge.id, gameResults.goodBites)
          break
        case 'combo':
          updateChallengeProgress(challenge.id, gameResults.maxCombo)
          break
        case 'golden':
          updateChallengeProgress(challenge.id, gameResults.goldenBites)
          break
        case 'perfect':
          if (gameResults.hazardsHit === 0) {
            updateChallengeProgress(challenge.id, 1)
          }
          break
        case 'dash':
          updateChallengeProgress(challenge.id, gameResults.dashesUsed)
          break
        case 'play':
          updateChallengeProgress(challenge.id, 1)
          break
        case 'survive':
          updateChallengeProgress(challenge.id, Math.floor(gameResults.survivalTime))
          break
      }
    })

    setResults(gameResults)
    setRewards({ crumbs: crumbsEarned, challengeRewards: totalChallengeRewards })
    setGameState('results')
  }

  const handlePlayAgain = () => {
    setGameState('playing')
    setResults(null)
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white" />
      </div>
    )
  }

  if (gameState === 'results' && results) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="max-w-md w-full glass rounded-3xl p-8 card-elevated">
          <div className="text-center mb-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-3" />
            <h2 className="text-5xl font-black text-white mb-2 animate-pop">{results.score}</h2>
            <p className="text-white/80 text-lg">Final Score</p>
            {results.score > state.bestScore && (
              <p className="text-base font-bold text-yellow-300 mt-2">🎉 NEW BEST SCORE!</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white/20 rounded-2xl p-4 text-center">
              <Sparkles className="w-6 h-6 text-yellow-300 mx-auto mb-2" />
              <div className="text-2xl font-black text-white">+{rewards.crumbs + rewards.challengeRewards}</div>
              <div className="text-sm text-white/70">Crumbs</div>
            </div>
            <div className="bg-white/20 rounded-2xl p-4 text-center">
              <Zap className="w-6 h-6 text-yellow-300 mx-auto mb-2" />
              <div className="text-2xl font-black text-white">x{results.maxCombo}</div>
              <div className="text-sm text-white/70">Max Combo</div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Good Bites</span>
              <span className="font-bold text-white text-lg">{results.goodBites}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Golden Bites</span>
              <span className="font-bold text-white text-lg">{results.goldenBites}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Hazards Hit</span>
              <span className="font-bold text-white text-lg">{results.hazardsHit}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Dashes Used</span>
              <span className="font-bold text-white text-lg">{results.dashesUsed}</span>
            </div>
          </div>

          {rewards.challengeRewards > 0 && (
            <div className="bg-white/20 border-2 border-yellow-300 rounded-2xl p-4 mb-6">
              <p className="text-base font-bold text-yellow-300 text-center">
                🏆 Challenge bonus: +{rewards.challengeRewards} Crumbs!
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handlePlayAgain}
              className="w-full bg-white text-red-600 font-black text-xl py-5 rounded-2xl hover:bg-white/95 active:scale-95 transition-all flex items-center justify-center gap-2 card-elevated"
            >
              <PlayIcon className="w-6 h-6" />
              Play Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-white/20 text-white font-bold text-base py-4 rounded-2xl hover:bg-white/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === 'playing') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GameCanvas
          onGameEnd={handleGameEnd}
          playerColor={playerColor}
          triggerHaptic={triggerHaptic}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 flex items-center justify-center safe-top">
      <div className="max-w-md w-full glass rounded-3xl p-8 card-elevated text-center">
        <div className="mb-4 flex justify-center">
          <div className="relative w-32 h-32">
            <Image
              src="/santa_pockets.png"
              alt="Santa Pockets the Raccoon"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>
        <h1 className="text-4xl font-black text-white mb-2">Arcade Mode</h1>
        <p className="text-white/80 text-lg mb-2">60 Second Sprint</p>
        <p className="text-white/60 text-sm mb-8">Help Pockets collect treats!</p>

        <div className="bg-white/10 rounded-2xl p-6 mb-8">
          <h2 className="font-bold text-white text-lg mb-4">How to Play:</h2>
          <ul className="text-left text-base text-white/90 space-y-3">
            <li className="flex items-start gap-2">
              <span>🎯</span>
              <span>Hold screen to move Pockets</span>
            </li>
            <li className="flex items-start gap-2">
              <span>⚡</span>
              <span>Tap to dash through obstacles</span>
            </li>
            <li className="flex items-start gap-2">
              <span>🍰</span>
              <span>Collect desserts for points</span>
            </li>
            <li className="flex items-start gap-2">
              <span>⭐</span>
              <span>Grab golden stars for bonus points</span>
            </li>
            <li className="flex items-start gap-2">
              <span>🏏</span>
              <span>Avoid non-food items like bats & socks</span>
            </li>
            <li className="flex items-start gap-2">
              <span>🔥</span>
              <span>Build combos for multipliers</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => {
            setGameState('playing')
            console.log('[Analytics] run_started')
          }}
          className="w-full bg-white text-red-600 font-black text-2xl py-6 rounded-2xl hover:bg-white/95 active:scale-95 transition-all mb-4 card-elevated"
        >
          START GAME
        </button>

        <button
          onClick={() => router.push('/')}
          className="text-white/80 hover:text-white font-medium text-base"
        ><button
  onClick={() => router.push('/levels')}
  className="w-full bg-white/20 text-white font-bold text-xl py-4 rounded-2xl hover:bg-white/25 active:scale-95 transition-all mb-3"
>
  🌍 World Map (Levels)
</button>

          Back to Home
        </button>
      </div>
    </div>
  )
}
