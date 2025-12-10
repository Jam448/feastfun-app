'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { GingerbreadGolemBattle } from '@/components/GingerbreadGolemBattle'
import { QueenCarmellaBattle } from '@/components/QueenCarmellaBattle'
import { BaronVonCocoaBattle } from '@/components/BaronVonCocoaBattle'
import { StoryModal, BOSS_STORIES } from '@/components/StoryModal'
import { supabase } from '@/lib/supabase'
import { soundManager } from '@/lib/sound-manager'
import { Home, ArrowLeft } from 'lucide-react'

function BossLevelContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bossId = searchParams?.get('boss') || 'gingerbread_golem'
  
  const [phase, setPhase] = useState<'intro' | 'battle' | 'victory' | 'defeat'>('intro')
  const [showIntroStory, setShowIntroStory] = useState(true)
  const [showVictoryStory, setShowVictoryStory] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [turnsRemaining, setTurnsRemaining] = useState(0)

  const getBossConfig = (id: string) => {
    switch (id) {
      case 'gingerbread_golem':
        return {
          level: 10,
          maxTurns: 25,
          introStory: BOSS_STORIES.gingerbread_golem_intro,
          victoryStory: BOSS_STORIES.gingerbread_golem_victory,
          world: 'Cookie Forest',
          nextWorld: 'Candy Mountains',
          component: 'golem',
        }
      case 'queen_carmella':
        return {
          level: 20,
          maxTurns: 30,
          introStory: BOSS_STORIES.queen_carmella_intro,
          victoryStory: BOSS_STORIES.queen_carmella_victory,
          world: 'Candy Mountains',
          nextWorld: 'Cocoa Castle',
          component: 'queen',
        }
      case 'baron_von_cocoa':
        return {
          level: 30,
          maxTurns: 35,
          introStory: BOSS_STORIES.baron_von_cocoa_intro,
          victoryStory: BOSS_STORIES.baron_von_cocoa_victory,
          world: 'Cocoa Castle',
          nextWorld: null,
          component: 'baron',
        }
      default:
        return {
          level: 10,
          maxTurns: 25,
          introStory: BOSS_STORIES.gingerbread_golem_intro,
          victoryStory: BOSS_STORIES.gingerbread_golem_victory,
          world: 'Cookie Forest',
          nextWorld: 'Candy Mountains',
          component: 'golem',
        }
    }
  }

  const config = getBossConfig(bossId)

  const handleIntroComplete = () => {
    setShowIntroStory(false)
    setPhase('battle')
  }

  const handleVictory = async (score: number, turns: number) => {
    setFinalScore(score)
    setTurnsRemaining(turns)
    setPhase('victory')
    
    // Save progress to database
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: levelData } = await (supabase as any)
          .from('levels')
          .select('id')
          .eq('level_number', config.level)
          .single()

        if (levelData) {
          const stars = turns >= 15 ? 3 : turns >= 8 ? 2 : 1
          
          const { data: existingProgress } = await (supabase as any)
            .from('player_levels')
            .select('*')
            .eq('player_id', user.id)
            .eq('level_id', levelData.id)
            .single()

          if (existingProgress) {
            await (supabase as any)
              .from('player_levels')
              .update({
                completed: true,
                stars_earned: Math.max(existingProgress.stars_earned, stars),
                best_score: Math.max(existingProgress.best_score, score),
                times_played: existingProgress.times_played + 1,
              })
              .eq('player_id', user.id)
              .eq('level_id', levelData.id)
          } else {
            await (supabase as any)
              .from('player_levels')
              .insert({
                player_id: user.id,
                level_id: levelData.id,
                unlocked: true,
                completed: true,
                stars_earned: stars,
                best_score: score,
                times_played: 1,
              })
          }

          // Unlock next world's first level
          if (config.nextWorld) {
            const nextLevelNumber = config.level + 1
            const { data: nextLevelData } = await (supabase as any)
              .from('levels')
              .select('id')
              .eq('level_number', nextLevelNumber)
              .single()

            if (nextLevelData) {
              const { data: nextProgress } = await (supabase as any)
                .from('player_levels')
                .select('*')
                .eq('player_id', user.id)
                .eq('level_id', nextLevelData.id)
                .single()

              if (!nextProgress) {
                await (supabase as any)
                  .from('player_levels')
                  .insert({
                    player_id: user.id,
                    level_id: nextLevelData.id,
                    unlocked: true,
                    completed: false,
                    stars_earned: 0,
                    best_score: 0,
                    times_played: 0,
                  })
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to save boss progress:', error)
    }

    // Show victory story
    setTimeout(() => {
      setShowVictoryStory(true)
    }, 2000)
  }

  const handleVictoryStoryComplete = () => {
    setShowVictoryStory(false)
    router.push('/feast')
  }

  const handleDefeat = () => {
    setPhase('defeat')
  }

  const handleRetry = () => {
    setPhase('intro')
    setShowIntroStory(true)
    setFinalScore(0)
    setTurnsRemaining(0)
  }

  const renderBattleComponent = () => {
    switch (config.component) {
      case 'golem':
        return (
          <GingerbreadGolemBattle
            onVictory={handleVictory}
            onDefeat={handleDefeat}
            maxTurns={config.maxTurns}
          />
        )
      case 'queen':
        return (
          <QueenCarmellaBattle
            onVictory={handleVictory}
            onDefeat={handleDefeat}
            maxTurns={config.maxTurns}
          />
        )
      case 'baron':
        return (
          <BaronVonCocoaBattle
            onVictory={handleVictory}
            onDefeat={handleDefeat}
            maxTurns={config.maxTurns}
          />
        )
      default:
        return null
    }
  }

  const getBackgroundGradient = () => {
    switch (config.component) {
      case 'golem':
        return 'from-amber-900 via-orange-900 to-red-900'
      case 'queen':
        return 'from-pink-900 via-purple-900 to-fuchsia-900'
      case 'baron':
        return 'from-amber-950 via-stone-900 to-stone-950'
      default:
        return 'from-amber-900 via-orange-900 to-red-900'
    }
  }

  const getDefeatMessage = () => {
    switch (config.component) {
      case 'golem':
        return "You cannot crumble what centuries have hardened!"
      case 'queen':
        return "Sweetness always wins in the end, dear..."
      case 'baron':
        return "The flood claims all who oppose me!"
      default:
        return "Try again..."
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="bg-white/20 p-2 rounded-xl active:scale-95 transition-all"
          >
            <Home className="w-5 h-5 text-white" />
          </Link>
          <Link
            href="/feast"
            className="bg-white/20 p-2 rounded-xl active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
        </div>
        <div className="text-white font-black text-lg">
          👑 BOSS BATTLE
        </div>
        <div className="w-20" />
      </div>

      {/* Intro Story */}
      <StoryModal
        isOpen={showIntroStory && phase === 'intro'}
        onComplete={handleIntroComplete}
        story={config.introStory}
      />

      {/* Victory Story */}
      <StoryModal
        isOpen={showVictoryStory}
        onComplete={handleVictoryStoryComplete}
        story={config.victoryStory}
      />

      {/* Battle Phase */}
      {phase === 'battle' && renderBattleComponent()}

      {/* Defeat Screen */}
      {phase === 'defeat' && (
        <div className="flex items-center justify-center min-h-[80vh] p-4">
          <div className="glass rounded-3xl p-8 max-w-md w-full text-center card-elevated">
            <div className="text-7xl mb-4">💀</div>
            <h2 className="text-3xl font-black text-white mb-2">Defeated!</h2>
            <p className="text-white/80 mb-6">
              {config.introStory.bossName} was too powerful...
            </p>
            <p className="text-yellow-300 mb-6 italic">
              "{getDefeatMessage()}"
            </p>
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-white text-red-600 font-black text-lg py-4 rounded-xl active:scale-95 transition-all"
              >
                Try Again
              </button>
              <Link
                href="/feast"
                className="block w-full bg-white/20 text-white font-bold py-3 rounded-xl active:scale-95 transition-all"
              >
                Back to World Map
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BossLevelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-900 via-orange-900 to-red-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto mb-4" />
          <p className="text-white font-bold">Preparing Boss Battle...</p>
        </div>
      </div>
    }>
      <BossLevelContent />
    </Suspense>
  )
}