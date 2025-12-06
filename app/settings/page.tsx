'use client'

import { useState } from 'react'
import { useGameStore } from '@/hooks/useGameStore'
import { Settings as SettingsIcon, Volume2, VolumeX, Vibrate, Info, AlertTriangle, Check } from 'lucide-react'

export default function SettingsPage() {
  const { state, toggleSound, toggleHaptics, resetData, triggerHaptic, mounted } = useGameStore()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white" />
      </div>
    )
  }

  const handleReset = () => {
    resetData()
    setShowResetConfirm(false)
    setResetSuccess(true)
    setTimeout(() => setResetSuccess(false), 3000)
  }

  const handleToggleSound = () => {
    toggleSound()
    if (state.soundEnabled) {
      triggerHaptic('light')
    }
  }

  const handleToggleHaptics = () => {
    const wasEnabled = state.hapticsEnabled
    toggleHaptics()
    if (!wasEnabled) {
      setTimeout(() => triggerHaptic('medium'), 100)
    }
  }

  return (
    <div className="min-h-screen p-4 safe-top">
      <div className="max-w-md mx-auto space-y-4">
        <div className="glass rounded-3xl p-6 shadow-2xl">
          <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-primary-600" />
            Settings
          </h1>
          <p className="text-gray-600">Customize your experience</p>
        </div>

        {resetSuccess && (
          <div className="glass rounded-2xl p-4 shadow-xl border-2 border-green-400 bg-green-50">
            <div className="flex items-center gap-2 text-green-700">
              <Check className="w-5 h-5" />
              <span className="font-bold">Data reset successfully!</span>
            </div>
          </div>
        )}

        <div className="glass rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-xl font-black text-gray-900 mb-4">Audio & Haptics</h2>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {state.soundEnabled ? (
                <Volume2 className="w-6 h-6 text-primary-600" />
              ) : (
                <VolumeX className="w-6 h-6 text-gray-400" />
              )}
              <div>
                <p className="font-bold text-gray-900">Sound Effects</p>
                <p className="text-sm text-gray-600">Game audio</p>
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              className={`relative w-14 h-8 rounded-full transition ${
                state.soundEnabled ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  state.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Vibrate className={`w-6 h-6 ${state.hapticsEnabled ? 'text-primary-600' : 'text-gray-400'}`} />
                <div>
                  <p className="font-bold text-gray-900">Haptic Feedback</p>
                  <p className="text-sm text-gray-600">Vibration on actions</p>
                </div>
              </div>
              <button
                onClick={handleToggleHaptics}
                className={`relative w-14 h-8 rounded-full transition ${
                  state.hapticsEnabled ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    state.hapticsEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 shadow-xl">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            About
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Version</span>
              <span className="font-bold text-gray-900">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Runs</span>
              <span className="font-bold text-gray-900">{state.totalRuns}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Score</span>
              <span className="font-bold text-gray-900">{state.totalScore.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Best Score</span>
              <span className="font-bold text-primary-600">{state.bestScore}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Daily Streak</span>
              <span className="font-bold text-red-600">{state.dailyStreak} days</span>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 shadow-xl border-2 border-red-200">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Danger Zone
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            This will permanently delete all your progress, including scores, crumbs, cosmetics, and challenges.
          </p>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 active:scale-95 transition"
            >
              Reset All Data
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-bold text-red-700 text-center">
                Are you sure? This cannot be undone!
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="bg-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-400 active:scale-95 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 active:scale-95 transition"
                >
                  Yes, Reset
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-4 shadow-xl">
          <p className="text-xs text-gray-600 text-center">
            Made with ❤️ for mobile arcade fans
          </p>
        </div>
      </div>
    </div>
  )
}
