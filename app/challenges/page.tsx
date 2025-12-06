'use client'

import { useGameStore } from '@/hooks/useGameStore'
import { Trophy, Calendar, Clock, Sparkles, Check } from 'lucide-react'

export default function ChallengesPage() {
  const { challenges, state, mounted } = useGameStore()

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white" />
      </div>
    )
  }

  const dailyChallenges = challenges.filter(c => c.type === 'daily')
  const weeklyChallenges = challenges.filter(c => c.type === 'weekly')

  const renderChallenge = (challenge: typeof challenges[0]) => {
    const isCompleted = state.completedChallenges.includes(challenge.id)
    const progress = Math.min(100, (challenge.progress / challenge.target) * 100)

    return (
      <div
        key={challenge.id}
        className={`glass rounded-2xl p-4 shadow-lg ${
          isCompleted ? 'border-2 border-green-400' : ''
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">{challenge.name}</h3>
            <p className="text-sm text-gray-600">{challenge.description}</p>
          </div>
          {isCompleted && (
            <div className="ml-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{challenge.progress}/{challenge.target}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isCompleted
                  ? 'bg-green-500'
                  : 'bg-gradient-to-r from-primary-500 to-red-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-bold text-orange-700">+{challenge.reward}</span>
          </div>
          {isCompleted && (
            <span className="text-xs font-bold text-green-600">CLAIMED</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 safe-top">
      <div className="max-w-md mx-auto space-y-4">
        <div className="glass rounded-3xl p-6 shadow-2xl">
          <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-2">
            <Trophy className="w-8 h-8 text-primary-600" />
            Challenges
          </h1>
          <p className="text-gray-600">Complete challenges to earn crumbs</p>
        </div>

        <div className="glass rounded-3xl p-6 shadow-xl">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Daily Challenges
          </h2>
          <p className="text-sm text-gray-600 mb-4">Resets every day at midnight</p>
          <div className="space-y-3">
            {dailyChallenges.length > 0 ? (
              dailyChallenges.map(renderChallenge)
            ) : (
              <p className="text-center text-gray-500 py-4">No daily challenges available</p>
            )}
          </div>
        </div>

        <div className="glass rounded-3xl p-6 shadow-xl">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Weekly Challenges
          </h2>
          <p className="text-sm text-gray-600 mb-4">Resets every Monday</p>
          <div className="space-y-3">
            {weeklyChallenges.length > 0 ? (
              weeklyChallenges.map(renderChallenge)
            ) : (
              <p className="text-center text-gray-500 py-4">No weekly challenges available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
