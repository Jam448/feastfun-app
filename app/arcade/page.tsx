'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Home, Zap, Timer, Trophy, Star, Play } from 'lucide-react'

export default function ArcadePage() {
  const router = useRouter()
  const [highScore] = useState(12500)
  const [gamesPlayed] = useState(47)
  const [bestCombo] = useState(12)

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center safe-top pb-24">
      <div className="max-w-md w-full">
        <div className="glass rounded-3xl p-6 mb-4 card-elevated">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => router.push('/')}
              className="text-white/80 hover:text-white transition-colors"
            >
              <Home className="w-5 h-5" />
            </button>
            <div className="relative w-12 h-12">
              <Image
                src="/image copy.png"
                alt="Santa Pockets"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <h1 className="text-white font-black text-4xl mb-2 text-center">
            Arcade Mode
          </h1>
          <p className="text-white/70 text-center mb-2">
            Fast-paced treat collection!
          </p>
          <p className="text-white/60 text-center text-sm mb-6">
            Help Pockets gather holiday treats
          </p>

          <div className="space-y-3 mb-6">
            <div className="bg-white/10 rounded-xl p-4 flex items-center gap-3">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <Timer className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-white font-bold">60 Second Rush</div>
                <div className="text-white/60 text-sm">Score as much as you can</div>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4 flex items-center gap-3">
              <div className="bg-yellow-500/20 p-3 rounded-xl">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <div className="text-white font-bold">Power Dash</div>
                <div className="text-white/60 text-sm">Use dash to clear rows instantly</div>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4 flex items-center gap-3">
              <div className="bg-purple-500/20 p-3 rounded-xl">
                <Star className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="text-white font-bold">Combo Master</div>
                <div className="text-white/60 text-sm">Chain matches for huge bonuses</div>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-4 mb-6 border-2 border-yellow-300/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="text-white font-bold">Your Best</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-yellow-300 font-black text-2xl">{highScore.toLocaleString()}</div>
                <div className="text-white/60 text-xs">High Score</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-300 font-black text-2xl">{gamesPlayed}</div>
                <div className="text-white/60 text-xs">Games</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-300 font-black text-2xl">x{bestCombo}</div>
                <div className="text-white/60 text-xs">Best Combo</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/play')}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-5 rounded-2xl font-black text-2xl hover:scale-105 active:scale-95 transition-all card-elevated flex items-center justify-center gap-3"
          >
            <Play className="w-8 h-8 fill-white" />
            Start Game
          </button>
        </div>

        <div className="glass rounded-xl p-4 card-elevated">
          <h3 className="text-white font-bold mb-2 text-center">How to Play</h3>
          <ul className="text-white/70 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-yellow-300">•</span>
              <span>Hold screen to move Pockets around</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-300">•</span>
              <span>Collect desserts and golden stars</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-300">•</span>
              <span>Avoid non-food hazards like bats and socks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-300">•</span>
              <span>Tap to dash through obstacles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-300">•</span>
              <span>Chain matches quickly to build massive combos</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
