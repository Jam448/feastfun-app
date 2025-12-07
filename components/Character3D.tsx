'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface OutfitItem {
  id: string
  name: string
  slot: 'hat' | 'outfit' | 'accessory' | 'back'
  rarity: string
  image_url: string
  stats: Record<string, number>
}

interface EquippedOutfit {
  hat?: OutfitItem
  outfit?: OutfitItem
  accessory?: OutfitItem
  back?: OutfitItem
}

interface Character3DProps {
  size?: 'small' | 'medium' | 'large'
  animate?: boolean
  showStats?: boolean
}

export function Character3D({ size = 'medium', animate = true, showStats = false }: Character3DProps) {
  const [equipped, setEquipped] = useState<EquippedOutfit>({})
  const [loading, setLoading] = useState(true)
  const [totalStats, setTotalStats] = useState({
    score_boost: 0,
    combo_boost: 0,
    bonus_crumbs: 0,
  })

  useEffect(() => {
    loadEquippedOutfits()
  }, [])

  const loadEquippedOutfits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: playerOutfits, error } = await supabase
        .from('player_outfits')
        .select(`
          outfit_id,
          equipped,
          outfit_items (*)
        `)
        .eq('player_id', user.id)
        .eq('equipped', true)

      if (error) throw error

      const equippedItems: EquippedOutfit = {}
      let stats = { score_boost: 0, combo_boost: 0, bonus_crumbs: 0 }

      playerOutfits?.forEach((po: any) => {
        const item = po.outfit_items as OutfitItem
        if (item) {
          equippedItems[item.slot] = item

          if (item.stats) {
            stats.score_boost += item.stats.score_boost || 0
            stats.combo_boost += item.stats.combo_boost || 0
            stats.bonus_crumbs += item.stats.bonus_crumbs || 0
          }
        }
      })

      setEquipped(equippedItems)
      setTotalStats(stats)
    } catch (error) {
      console.error('Failed to load equipped outfits:', error)
    } finally {
      setLoading(false)
    }
  }

  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48',
    large: 'w-64 h-64',
  }

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-600',
  }

  const getRarityGlow = (rarity: string) => {
    const colors = {
      common: 'shadow-gray-400/50',
      rare: 'shadow-blue-400/50',
      epic: 'shadow-purple-400/50',
      legendary: 'shadow-yellow-400/50',
    }
    return colors[rarity as keyof typeof colors] || colors.common
  }

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`${sizeClasses[size]} relative ${animate ? 'animate-float' : ''}`}>
        <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
          {equipped.back && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ transform: 'translateZ(-20px)' }}
            >
              <div className={`text-6xl opacity-80 ${getRarityGlow(equipped.back.rarity)} animate-pulse`}>
                {equipped.back.slot === 'back' && '✨'}
              </div>
            </div>
          )}

          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: 'translateZ(0px)' }}
          >
            <img
              src="/santa_pockets.png"
              alt="Character"
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>

          {equipped.outfit && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ transform: 'translateZ(10px)' }}
            >
              <div className={`text-7xl ${getRarityGlow(equipped.outfit.rarity)}`}>
                {equipped.outfit.slot === 'outfit' && '👕'}
              </div>
            </div>
          )}

          {equipped.accessory && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ transform: 'translateZ(20px)' }}
            >
              <div className={`text-5xl ${getRarityGlow(equipped.accessory.rarity)}`}>
                {equipped.accessory.slot === 'accessory' && '🎀'}
              </div>
            </div>
          )}

          {equipped.hat && (
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4"
              style={{ transform: 'translateZ(30px) translateX(-50%)' }}
            >
              <div className={`text-6xl ${getRarityGlow(equipped.hat.rarity)} animate-bounce`}>
                {equipped.hat.slot === 'hat' && '🎩'}
              </div>
            </div>
          )}
        </div>
      </div>

      {showStats && (totalStats.score_boost > 0 || totalStats.combo_boost > 0 || totalStats.bonus_crumbs > 0) && (
        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 space-y-1">
          <div className="text-white text-sm font-semibold text-center mb-2">Character Bonuses</div>
          {totalStats.score_boost > 0 && (
            <div className="text-white text-xs flex items-center gap-2">
              <span className="text-yellow-400">⚡</span>
              <span>Score Boost: +{(totalStats.score_boost * 100).toFixed(0)}%</span>
            </div>
          )}
          {totalStats.combo_boost > 0 && (
            <div className="text-white text-xs flex items-center gap-2">
              <span className="text-orange-400">🔥</span>
              <span>Combo Boost: +{(totalStats.combo_boost * 100).toFixed(0)}%</span>
            </div>
          )}
          {totalStats.bonus_crumbs > 0 && (
            <div className="text-white text-xs flex items-center gap-2">
              <span className="text-yellow-300">🍪</span>
              <span>Bonus Crumbs: +{(totalStats.bonus_crumbs * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
