'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { GameCanvas, GameResults } from '@/components/GameCanvas'
import { useGameStore, COSMETICS } from '@/hooks/useGameStore'
import { supabase } from '@/lib/supabase'
import { Trophy, Sparkles, Zap, Home, Play as PlayIcon, Medal, Crown, Calendar, Clock } from 'lucide-react'

interface LeaderboardEntry {
  player_id: string
  player_name: string
  best_score: number
  games_played: number
  best_combo: number
  total_golden: number
}

export default function PlayPage() {
  const router = useRouter()
  const { state, cosmetics, updateScore, updateChallengeProgress, completeChallenge, challenges, triggerHaptic, isLoaded } = useGameStore()
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu')
  const [results, setResults] = useState<GameResults | null>(null)
  const [rewards, setRewards] = useState<{ crumbs: number; challengeRewards: number }>({ crumbs: 0, challengeRewards: 0 })
  const [leaderboardTab, setLeaderboardTab] = useState<'weekly' | 'monthly' | 'alltime'>('weekly')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [playerRank, setPlayerRank] = useState<number | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [playerName, setPlayerName] = useState('')

  const selectedSkin = COSMETICS.find(c => c.id === state.selectedSkin)
  const playerColor = selectedSkin?.color || '#3b82f6'

  useEffect(() => {
    checkAuth()
    loadLeaderboard()
  }, [leaderboardTab])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsAuthenticated(!!user)
    if (user?.email) {
      setPlayerName(user.email.split('@')[0])
    }
  }

  const loadLeaderboard = async () => {
    try {
      const viewName = leaderboardTab === 'weekly' ? 'weekly_leaderboard' 
                     : leaderboardTab === 'monthly' ? 'monthly_leaderboard' 
                     : 'alltime_leaderboard'
      
      const { data, error } = await (supabase as any)
        .from(viewName)
        .select('*')
        .limit(10)

      if (error) {
        console.warn('Leaderboard not available:', error)
        return
      }

      setLeaderboard(data || [])

      // Get player rank if authenticated
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: rankData } = await (supabase as any)
          .rpc('get_player_rank', { p_player_id: user.id, p_timeframe: leaderboardTab })
        setPlayerRank(rankData)
      }
    } catch (error) {
      console.warn('Failed to load leaderboard:', error)
    }
  }

  const saveScore = async (gameResults: GameResults) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await (supabase as any).from('arcade_scores').insert({
        player_id: user.id,
        player_name: playerName || 'Anonymous',
        score: gameResults.score,
        good_bites: gameResults.goodBites,
        golden_bites: gameResults.goldenBites,
        max_combo: gameResults.maxCombo,
        hazards_hit: gameResults.hazardsHit,
      })

      // Refresh leaderboard
      await loadLeaderboard()
    } catch (error) {
      console.error('Failed to save score:', error)
    }
  }

  const handleGameEnd = async (gameResults: GameResults) => {
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

    // Save to leaderboard if authenticated
    await saveScore(gameResults)

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
      <div className="min-h-screen p-4 flex items-center justify-center safe-top">
        <div className="max-w-md w-full glass rounded-3xl p-6 card-elevated">
          <div className="text-center mb-5">
            <Trophy className="w-14 h-14 text-yellow-500 mx-auto mb-2" />
            <h2 className="text-5xl font-black text-white mb-1 animate-pop">{results.score}</h2>
            <p className="text-white/80">Final Score</p>
            {results.score > state.bestScore && (
              <p className="text-base font-bold text-yellow-300 mt-1">🎉 NEW BEST!</p>
            )}
            {playerRank && playerRank <= 10 && (
              <p className="text-base font-bold text-purple-300 mt-1">
                🏆 #{playerRank} on leaderboard!
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <Sparkles className="w-5 h-5 text-yellow-300 mx-auto mb-1" />
              <div className="text-xl font-black text-white">+{rewards.crumbs + rewards.challengeRewards}</div>
              <div className="text-xs text-white/70">Crumbs</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <Zap className="w-5 h-5 text-orange-300 mx-auto mb-1" />
              <div className="text-xl font-black text-white">x{results.maxCombo}</div>
              <div className="text-xs text-white/70">Max Combo</div>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-3 mb-5">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">Good Bites</span>
                <span className="font-bold text-white">{results.goodBites}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Golden</span>
                <span className="font-bold text-yellow-300">{results.goldenBites}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Hazards</span>
                <span className="font-bold text-red-300">{results.hazardsHit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Dashes</span>
                <span className="font-bold text-purple-300">{results.dashesUsed}</span>
              </div>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-3 mb-5 text-center">
              <p className="text-yellow-200 text-sm font-medium">
                Sign in to save your score to the leaderboard!
              </p>
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={handlePlayAgain}
              className="w-full bg-white text-red-600 font-black text-lg py-4 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <PlayIcon className="w-5 h-5" />
              Play Again
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800">
        <GameCanvas
          onGameEnd={handleGameEnd}
          playerColor={playerColor}
          triggerHaptic={triggerHaptic}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 safe-top">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="bg-white/20 p-2 rounded-xl active:scale-95 transition-all">
            <Home className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-2xl font-black text-white">Arcade Mode</h1>
          <div className="w-10" />
        </div>

        {/* Pockets & Play Button */}
        <div className="glass rounded-3xl p-6 mb-4 card-elevated text-center">
          <div className="relative w-24 h-24 mx-auto mb-3">
            <Image
              src="/santa_pockets.png"
              alt="Pockets"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">60 Second Sprint</h2>
          <p className="text-white/70 text-sm mb-4">Collect treats, avoid hazards!</p>

          <button
            onClick={() => setGameState('playing')}
            className="w-full bg-white text-red-600 font-black text-xl py-4 rounded-xl active:scale-95 transition-all card-elevated"
          >
            START GAME
          </button>

          {state.bestScore > 0 && (
            <p className="text-white/70 text-sm mt-3">
              Your Best: <span className="font-bold text-yellow-300">{state.bestScore}</span>
            </p>
          )}
        </div>

        {/* Quick Tips */}
        <div className="glass rounded-2xl p-4 mb-4">
          <h3 className="font-bold text-white mb-2">Quick Tips</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/10 rounded-lg p-2 flex items-center gap-2">
              <span>🎯</span>
              <span className="text-white/90">Hold to move</span>
            </div>
            <div className="bg-white/10 rounded-lg p-2 flex items-center gap-2">
              <span>⚡</span>
              <span className="text-white/90">Tap to dash</span>
            </div>
            <div className="bg-white/10 rounded-lg p-2 flex items-center gap-2">
              <span>🍰</span>
              <span className="text-white/90">Collect food</span>
            </div>
            <div className="bg-white/10 rounded-lg p-2 flex items-center gap-2">
              <span>⭐</span>
              <span className="text-white/90">Golden = 5x</span>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="glass rounded-2xl p-4 card-elevated">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              Leaderboard
            </h3>
          </div>

          {/* Tab Buttons */}
          <div className="flex gap-1 mb-3 bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setLeaderboardTab('weekly')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                leaderboardTab === 'weekly' 
                  ? 'bg-white text-red-600' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3" />
              Weekly
            </button>
            <button
              onClick={() => setLeaderboardTab('monthly')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                leaderboardTab === 'monthly' 
                  ? 'bg-white text-red-600' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Calendar className="w-3 h-3" />
              Monthly
            </button>
            <button
              onClick={() => setLeaderboardTab('alltime')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                leaderboardTab === 'alltime' 
                  ? 'bg-white text-red-600' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Trophy className="w-3 h-3" />
              All Time
            </button>
          </div>

          {/* Leaderboard List */}
          <div className="space-y-2">
            {leaderboard.length > 0 ? (
              leaderboard.slice(0, 5).map((entry, index) => (
                <div
                  key={entry.player_id}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    index === 0 ? 'bg-yellow-500/20 border border-yellow-400/30' :
                    index === 1 ? 'bg-gray-400/20 border border-gray-400/30' :
                    index === 2 ? 'bg-orange-600/20 border border-orange-500/30' :
                    'bg-white/5'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-sm ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-orange-400 text-orange-900' :
                    'bg-white/20 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{entry.player_name}</p>
                    <p className="text-white/50 text-xs">{entry.games_played} games</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-white">{entry.best_score.toLocaleString()}</p>
                    <p className="text-yellow-400 text-xs">x{entry.best_combo} combo</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-white/50">
                <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No scores yet!</p>
                <p className="text-xs">Be the first to play!</p>
              </div>
            )}
          </div>

          {playerRank && playerRank > 5 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-3 p-2 bg-purple-500/20 rounded-lg border border-purple-400/30">
                <div className="w-7 h-7 rounded-full bg-purple-400 text-purple-900 flex items-center justify-center font-black text-sm">
                  {playerRank}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">You</p>
                </div>
                <p className="font-black text-white">{state.bestScore.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}