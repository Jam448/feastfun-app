'use client'

import { Timer, Zap, Star } from 'lucide-react'

interface GameHUDProps {
  timeLeft: number
  score: number
  combo: number
  dashCooldown: number
  maxDashCooldown?: number
}

export function GameHUD({ timeLeft, score, combo, dashCooldown, maxDashCooldown = 2000 }: GameHUDProps) {
  const dashProgress = Math.max(0, 100 - (dashCooldown / maxDashCooldown) * 100)
  const comboProgress = Math.min(100, (combo / 10) * 100)

  return (
    <div className="fixed top-0 left-0 right-0 p-4 safe-top z-10">
      <div className="max-w-md mx-auto">
        <div className="glass rounded-2xl p-4 card-elevated">
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Timer className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl font-black text-white">{timeLeft}s</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              </div>
              <div className="text-2xl font-black text-white">{score}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-4 h-4 text-yellow-300" />
              </div>
              <div className="text-2xl font-black text-white">x{combo}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white/70">Combo Meter</span>
                <span className="text-xs text-white/70">{combo}/10</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-red-500 transition-all duration-300"
                  style={{ width: `${comboProgress}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white/70">Dash Ready</span>
                <span className="text-xs text-white/70">
                  {dashCooldown > 0 ? `${(dashCooldown / 1000).toFixed(1)}s` : 'Ready!'}
                </span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-100"
                  style={{ width: `${dashProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
