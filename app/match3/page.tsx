'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { AdvancedMatch3Grid } from '@/components/AdvancedMatch3Grid'
import { Confetti } from '@/components/Confetti'
import { getLevelConfig, TREATS, TreatType } from '@/lib/level-configurations'
import { soundManager } from '@/lib/sound-manager'
import { useHaptics } from '@/hooks/useHaptics'
import { Star, Trophy, Heart, Coins, Volume2, VolumeX, ArrowLeft, Target, Vibrate, VibrateOff } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

function Match3GameContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const levelParam = searchParams?.get('level')
  const haptics = useHaptics()
  
  const [currentLevel, setCurrentLevel] = useState(levelParam ? parseInt(levelParam) : 1)
  const [score, setScore] = useState(0)
  const [movesLeft, setMovesLeft] = useState(0)
  const [lives, setLives] = useState(5)
  const [coins, setCoins] = useState(100)
  const [isPaused, setIsPaused] = useState(false)
  const [gameState, setGameState] = useState<'playing' | 'win' | 'lose'>('playing')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  const levelConfig = getLevelConfig(currentLevel)

  const toggleSound = () => {
    const newState = !soundEnabled
    setSoundEnabled(newState)
    soundManager.setEnabled(newState)
    haptics.onTap()
    if (newState) {
      soundManager.playClick()
    }
  }

  const toggleHaptics = () => {
    haptics.toggle()
  }

  useEffect(() => {
    if (!levelConfig) return
    setMovesLeft(levelConfig.moves)
    setScore(0)
    setGameState('playing')
    setShowConfetti(false)
  }, [currentLevel, levelConfig])

  // Trigger confetti on win
  useEffect(() => {
    if (gameState === 'win') {
      setShowConfetti(true)
      haptics.onLevelComplete()
    } else if (gameState === 'lose') {
      haptics.onLevelFail()
    }
  }, [gameState, haptics])

  const handleScoreChange = (points: number) => {
    setScore(prev => {
      const newScore = prev + points
      if (levelConfig && newScore >= levelConfig.objectives[0].target && movesLeft > 0) {
        setTimeout(() => setGameState('win'), 500)
      }
      return newScore
    })
  }

  const handleMoveUsed = () => {
    setMovesLeft(prev => {
      const newMoves = prev - 1
      if (newMoves === 0 && levelConfig) {
        setTimeout(() => {
          if (score >= levelConfig.objectives[0].target) {
            setGameState('win')
          } else {
            setGameState('lose')
          }
        }, 500)
      }
      return newMoves
    })
  }

  const getMoveCompletionBonus = (): number => {
    return movesLeft * 100
  }

  const getStarsEarned = (): number => {
    if (!levelConfig) return 0
    const totalScore = score + getMoveCompletionBonus()
    if (totalScore >= levelConfig.starThresholds[3]) return 3
    if (totalScore >= levelConfig.starThresholds[2]) return 2
    if (totalScore >= levelConfig.starThresholds[1]) return 1
    return 0
  }

  const getStarBonus = (stars: number): number => {
    if (stars === 3) return 1000
    if (stars === 2) return 500
    return 0
  }

  const getTotalScore = (): number => {
    const stars = getStarsEarned()
    return score + getMoveCompletionBonus() + getStarBonus(stars)
  }

  const handleNextLevel = () => {
    haptics.onTap()
    setShowConfetti(false)
    setCurrentLevel(prev => prev + 1)
  }

  const handleRetry = () => {
    if (!levelConfig) return
    haptics.onTap()
    setMovesLeft(levelConfig.moves)
    setScore(0)
    setGameState('playing')
    setLives(prev => Math.max(0, prev - 1))
  }

  if (!levelConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Level not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 flex flex-col safe-top pb-24">
      {/* Confetti on level complete */}
      <Confetti trigger={showConfetti} />

      {/* Header */}
      <div className="glass rounded-2xl p-4 sm:p-5 mb-4 card-elevated">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                haptics.onTap()
                router.push('/feast')
              }}
              className="text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95 p-2 -ml-2"
              title="Back to Level Select"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 hidden sm:block">
              <Image
                src="/santa_pockets.png"
                alt="Santa Pockets"
                fill
                className="object-contain drop-shadow-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 drop-shadow-lg" />
              <span className="text-white font-black text-lg sm:text-xl tracking-tight">Level {currentLevel}</span>
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2 items-center">
            <button
              onClick={toggleHaptics}
              className="text-white/80 hover:text-white transition-all p-2 hover:bg-white/10 rounded-lg active:scale-95"
              title={haptics.isEnabled ? 'Disable haptics' : 'Enable haptics'}
            >
              {haptics.isEnabled ? <Vibrate className="w-5 h-5" /> : <VibrateOff className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleSound}
              className="text-white/80 hover:text-white transition-all p-2 hover:bg-white/10 rounded-lg active:scale-95"
              title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-br from-red-500/20 to-red-600/10 px-2 sm:px-3 py-1.5 rounded-full border border-red-400/30">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
              <span className="text-white font-bold text-sm sm:text-base">{lives}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 px-2 sm:px-3 py-1.5 rounded-full border border-yellow-400/30">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
              <span className="text-white font-bold text-sm sm:text-base">{coins}</span>
            </div>
          </div>
        </div>

        {/* Objective Card */}
        <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl p-3 sm:p-4 mb-4 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-yellow-300" />
            <div className="text-white/90 text-sm font-bold">Objective</div>
          </div>
          <div className="text-white text-xs mb-2">{levelConfig.objectives[0].description}</div>
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="text-white/70 text-xs mb-1">Score</div>
              <div className="text-white font-black text-lg sm:text-xl">{score.toLocaleString()}</div>
            </div>
            <div className="flex-1">
              <div className="text-white/70 text-xs mb-1">Moves</div>
              <div className="text-white font-black text-lg sm:text-xl">{movesLeft}</div>
            </div>
          </div>
        </div>

        {/* Star Progress */}
        <div className="flex justify-center gap-2 mb-3">
          {[1, 2, 3].map(star => (
            <Star
              key={star}
              className={`w-7 h-7 sm:w-8 sm:h-8 transition-all duration-300 ${
                score >= (levelConfig.starThresholds as any)[star]
                  ? 'fill-yellow-300 text-yellow-300 scale-110 drop-shadow-lg'
                  : 'text-white/20'
              }`}
            />
          ))}
        </div>

        {/* Treats */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {levelConfig.treats.map((treatId: TreatType) => {
            const treat = TREATS[treatId]
            return (
              <div key={treatId} className="flex-shrink-0 bg-white/10 rounded-lg px-2 sm:px-3 py-2 border border-white/20">
                <div className="text-xl sm:text-2xl mb-1">{treat.emoji}</div>
                <div className="text-white/70 text-xs text-center whitespace-nowrap">{treat.name.split(' ')[0]}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center">
        {gameState === 'playing' ? (
          <AdvancedMatch3Grid
            rows={levelConfig.gridSize.rows}
            cols={levelConfig.gridSize.cols}
            treats={levelConfig.treats}
            onScoreChange={handleScoreChange}
            onMoveUsed={handleMoveUsed}
            isPaused={isPaused}
          />
        ) : gameState === 'win' ? (
          <div className="glass rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center card-elevated bg-gradient-to-br from-white/5 to-transparent">
            <div className="text-6xl sm:text-7xl mb-4 animate-bounce drop-shadow-2xl">🎉</div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 drop-shadow-lg">Level Complete!</h2>

            <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-2xl p-4 sm:p-5 mb-5 border border-white/20">
              <div className="text-white/80 text-sm font-medium mb-1">Base Score</div>
              <div className="text-white text-2xl sm:text-3xl font-black mb-4">{score.toLocaleString()}</div>

              {movesLeft > 0 && (
                <>
                  <div className="text-green-300 text-sm font-bold mb-1">
                    {movesLeft} Moves Remaining!
                  </div>
                  <div className="text-green-300 text-xl sm:text-2xl font-black mb-4">
                    +{getMoveCompletionBonus().toLocaleString()}
                  </div>
                </>
              )}

              {getStarBonus(getStarsEarned()) > 0 && (
                <>
                  <div className="text-yellow-300 text-sm font-bold mb-1">
                    {getStarsEarned()} Star Bonus!
                  </div>
                  <div className="text-yellow-300 text-xl sm:text-2xl font-black mb-4">
                    +{getStarBonus(getStarsEarned()).toLocaleString()}
                  </div>
                </>
              )}

              <div className="border-t border-white/30 pt-4">
                <div className="text-white/80 text-sm font-medium mb-1">Total Score</div>
                <div className="text-white text-3xl sm:text-4xl font-black drop-shadow-lg">
                  {getTotalScore().toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              {[1, 2, 3].map(star => (
                <Star
                  key={star}
                  className={`w-12 h-12 sm:w-14 sm:h-14 ${
                    getStarsEarned() >= star
                      ? 'fill-yellow-300 text-yellow-300 animate-bounce drop-shadow-lg'
                      : 'text-white/20'
                  }`}
                  style={{ animationDelay: `${star * 100}ms` }}
                />
              ))}
            </div>

            <button
              onClick={handleNextLevel}
              className="w-full bg-gradient-to-r from-white to-white/95 text-red-600 py-3 sm:py-4 rounded-2xl font-black text-lg sm:text-xl hover:from-white/95 hover:to-white/90 active:scale-95 transition-all card-elevated shadow-xl touch-manipulation"
            >
              Next Level
            </button>
          </div>
        ) : (
          <div className="glass rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center card-elevated bg-gradient-to-br from-white/5 to-transparent">
            <div className="text-6xl sm:text-7xl mb-4 drop-shadow-2xl">😢</div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 drop-shadow-lg">Level Failed</h2>
            <div className="bg-white/10 rounded-xl p-4 mb-3">
              <p className="text-white/80 text-lg sm:text-xl font-bold mb-1">Score: {score.toLocaleString()}</p>
              <p className="text-white/60 text-sm">
                Goal: {levelConfig.objectives[0].target.toLocaleString()} points
              </p>
            </div>

            {lives > 0 ? (
              <button
                onClick={handleRetry}
                className="w-full bg-gradient-to-r from-white to-white/95 text-red-600 py-3 sm:py-4 rounded-2xl font-black text-lg sm:text-xl hover:from-white/95 hover:to-white/90 active:scale-95 transition-all card-elevated shadow-xl touch-manipulation"
              >
                Retry ({lives} lives left)
              </button>
            ) : (
              <div className="text-white/80 bg-white/10 rounded-xl p-4">
                <p className="mb-2 text-lg font-bold">Out of lives!</p>
                <p className="text-sm text-white/60">Lives regenerate every 30 minutes</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Match3Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white" />
      </div>
    }>
      <Match3GameContent />
    </Suspense>
  )
}
