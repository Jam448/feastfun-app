'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Star, Trophy, Heart, Coins, Home, Lock, Bell, Crown } from 'lucide-react'

export default function FeastLevelSelectPage() {
  const router = useRouter()
  const [lives, setLives] = useState(5)
  const [coins, setCoins] = useState(100)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [hasNotifications] = useState(true)

  const levels = Array.from({ length: 30 }, (_, i) => {
    const level = i + 1
    const isUnlocked = level <= currentLevel
    const stars = isUnlocked && level < currentLevel ? Math.floor(Math.random() * 3) + 1 : 0
    return { level, isUnlocked, stars }
  })

  const handlePlayLevel = (level: number) => {
    if (level <= currentLevel) {
      router.push(`/match3?level=${level}`)
    }
  }

  return (
    <div className="min-h-screen p-4 safe-top pb-24">
      <div className="glass rounded-2xl p-5 mb-4 card-elevated">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95"
            >
              <Home className="w-6 h-6" />
            </button>
            <div className="relative w-12 h-12">
              <Image
                src="/image copy copy.png"
                alt="Santa Pockets"
                fill
                className="object-contain drop-shadow-lg"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-xl tracking-tight">Feast Fun</span>
            </div>
          </div>
          <button className="relative text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95">
            <Bell className="w-6 h-6" />
            {hasNotifications && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-orange-400 animate-pulse" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 bg-gradient-to-br from-red-500/20 to-red-600/10 px-4 py-3 rounded-xl border border-red-400/30">
            <Heart className="w-6 h-6 text-red-400 drop-shadow-lg" />
            <div>
              <div className="text-white font-black text-xl">{lives}</div>
              <div className="text-white/70 text-xs font-medium">Lives</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 px-4 py-3 rounded-xl border border-yellow-400/30">
            <Coins className="w-6 h-6 text-yellow-300 drop-shadow-lg" />
            <div>
              <div className="text-white font-black text-xl">{coins}</div>
              <div className="text-white/70 text-xs font-medium">Coins</div>
            </div>
          </div>
        </div>
      </div>

      {hasNotifications && (
        <div className="glass rounded-2xl p-5 mb-4 border-2 border-yellow-300/40 card-elevated bg-gradient-to-br from-yellow-500/10 to-transparent animate-pulse">
          <div className="flex items-start gap-3">
            <div className="text-4xl drop-shadow-lg">🎉</div>
            <div className="flex-1">
              <h3 className="text-white font-black text-lg mb-1">Daily Bonus Available!</h3>
              <p className="text-white/80 text-sm mb-3">Claim your free coins and power-ups</p>
              <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-orange-900 px-6 py-2.5 rounded-xl font-black text-sm hover:from-yellow-300 hover:to-yellow-400 active:scale-95 transition-all shadow-lg">
                Claim Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-white font-black text-2xl mb-3 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-300" />
          Level Map
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {levels.map(({ level, isUnlocked, stars }) => (
            <button
              key={level}
              onClick={() => handlePlayLevel(level)}
              disabled={!isUnlocked}
              className={`
                glass rounded-2xl p-5 card-elevated transition-all relative
                ${isUnlocked
                  ? 'hover:scale-110 active:scale-95 border-2 border-white/30 hover:border-white/50'
                  : 'opacity-40 cursor-not-allowed'
                }
              `}
            >
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-white/50" />
                </div>
              )}

              <div className={`text-center ${!isUnlocked ? 'blur-sm' : ''}`}>
                <div className="text-white font-black text-3xl mb-2 drop-shadow-lg">{level}</div>

                <div className="flex justify-center gap-1">
                  {[1, 2, 3].map(starNum => (
                    <Star
                      key={starNum}
                      className={`w-5 h-5 ${
                        stars >= starNum
                          ? 'fill-yellow-300 text-yellow-300 drop-shadow-lg'
                          : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-5 card-elevated">
        <h3 className="text-white font-black text-lg mb-3 flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-300" />
          Pro Tips
        </h3>
        <ul className="text-white/80 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-yellow-300 font-bold">•</span>
            <span>Match 4+ candies to create special power-ups</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-300 font-bold">•</span>
            <span>Combine special candies for mega combos</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-300 font-bold">•</span>
            <span>Complete levels with fewer moves for more stars</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
