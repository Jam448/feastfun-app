'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/hooks/useGameStore'
import { useProgression } from '@/hooks/useProgression'
import { Character3D } from '@/components/Character3D'
import { ShoppingBag, Lock, Check, Sparkles, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type SlotType = 'hat' | 'outfit' | 'accessory' | 'back'

interface OutfitItem {
  id: string
  name: string
  slot: SlotType
  rarity: string
  cost: number
  unlock_requirement: { level?: number; stars?: number }
  image_url: string
  stats: Record<string, number>
}

export default function LockerPage() {
  const { state, triggerHaptic, isLoaded } = useGameStore()
  const { totalStars, crumbs, ownedOutfits, refreshData } = useProgression()
  const [selectedTab, setSelectedTab] = useState<SlotType>('hat')
  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOutfits()
  }, [])

  const loadOutfits = async () => {
    try {
      const { data, error } = await supabase
        .from('outfit_items')
        .select('*')
        .order('cost')

      if (error) throw error
      setOutfitItems(data || [])
    } catch (error) {
      console.error('Failed to load outfits:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white" />
      </div>
    )
  }

  const filteredOutfits = outfitItems.filter(o => o.slot === selectedTab)

  const handlePurchase = async (outfitId: string, cost: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('player_outfits').insert({
        player_id: user.id,
        outfit_id: outfitId,
        equipped: false,
      } as any)

      const { error: updateError } = await (supabase.from('profiles') as any).update({ crumbs: crumbs - cost }).eq('id', user.id)
      if (updateError) throw updateError

      await refreshData()
      await loadOutfits()
      triggerHaptic('heavy')
    } catch (error) {
      console.error('Purchase failed:', error)
      triggerHaptic('light')
    }
  }

  const handleEquip = async (outfitId: string, slot: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: currentEquipped } = await supabase
        .from('player_outfits')
        .select('outfit_id, outfit_items!inner(slot)')
        .eq('player_id', user.id)
        .eq('equipped', true)
        .eq('outfit_items.slot', slot)
        .maybeSingle()

      if (currentEquipped) {
        await (supabase.from('player_outfits') as any)
          .update({ equipped: false })
          .eq('player_id', user.id)
          .eq('outfit_id', (currentEquipped as any).outfit_id)
      }

      await (supabase.from('player_outfits') as any)
        .update({ equipped: true })
        .eq('player_id', user.id)
        .eq('outfit_id', outfitId)

      await refreshData()
      triggerHaptic('medium')
    } catch (error) {
      console.error('Equip failed:', error)
    }
  }

  const isOwned = (outfitId: string) => ownedOutfits.includes(outfitId)

  const canUnlock = (item: OutfitItem) => {
    const req = item.unlock_requirement
    if (!req.level && !req.stars) return true
    if (req.level && req.level > 1) return false
    if (req.stars && req.stars > totalStars) return false
    return true
  }

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-600',
  }

  return (
    <div className="min-h-screen p-4 safe-top pb-24">
      <div className="max-w-md mx-auto space-y-4">
        <div className="glass rounded-3xl p-6 shadow-2xl">
          <div className="flex justify-center mb-4">
            <Character3D size="medium" animate={true} showStats={true} />
          </div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-black text-white flex items-center gap-2">
              <ShoppingBag className="w-8 h-8 text-yellow-300" />
              Character
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full">
                <Star className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-black text-white">{totalStars}</span>
              </div>
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-black text-white">{crumbs}</span>
              </div>
            </div>
          </div>
          <p className="text-white/70 text-sm">Customize Pockets the Raccoon!</p>
        </div>

        <div className="glass rounded-2xl p-2 shadow-xl">
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setSelectedTab('hat')}
              className={`py-3 rounded-xl font-bold transition text-sm ${
                selectedTab === 'hat'
                  ? 'bg-white text-red-600'
                  : 'bg-transparent text-white hover:bg-white/10'
              }`}
            >
              Hats
            </button>
            <button
              onClick={() => setSelectedTab('outfit')}
              className={`py-3 rounded-xl font-bold transition text-sm ${
                selectedTab === 'outfit'
                  ? 'bg-white text-red-600'
                  : 'bg-transparent text-white hover:bg-white/10'
              }`}
            >
              Outfits
            </button>
            <button
              onClick={() => setSelectedTab('accessory')}
              className={`py-3 rounded-xl font-bold transition text-sm ${
                selectedTab === 'accessory'
                  ? 'bg-white text-red-600'
                  : 'bg-transparent text-white hover:bg-white/10'
              }`}
            >
              Items
            </button>
            <button
              onClick={() => setSelectedTab('back')}
              className={`py-3 rounded-xl font-bold transition text-sm ${
                selectedTab === 'back'
                  ? 'bg-white text-red-600'
                  : 'bg-transparent text-white hover:bg-white/10'
              }`}
            >
              Back
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredOutfits.map((item) => {
            const owned = isOwned(item.id)
            const unlockable = canUnlock(item)

            return (
              <div
                key={item.id}
                className={`glass rounded-2xl p-4 shadow-lg border-2 ${
                  owned ? 'border-green-400/50' : 'border-white/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl flex-shrink-0 bg-gradient-to-br ${rarityColors[item.rarity as keyof typeof rarityColors]} flex items-center justify-center text-3xl border-4 border-white/20 shadow-lg`}>
                    {item.slot === 'hat' && '🎩'}
                    {item.slot === 'outfit' && '👕'}
                    {item.slot === 'accessory' && '🎀'}
                    {item.slot === 'back' && '✨'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate flex items-center gap-2">
                      {item.name}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.rarity === 'legendary' ? 'bg-yellow-400 text-yellow-900' :
                        item.rarity === 'epic' ? 'bg-purple-400 text-purple-900' :
                        item.rarity === 'rare' ? 'bg-blue-400 text-blue-900' :
                        'bg-gray-400 text-gray-900'
                      }`}>
                        {item.rarity}
                      </span>
                    </h3>
                    {item.unlock_requirement.level && (
                      <p className="text-xs text-white/60">Unlock at Level {item.unlock_requirement.level}</p>
                    )}
                    {item.unlock_requirement.stars && (
                      <p className="text-xs text-white/60">Requires {item.unlock_requirement.stars} stars</p>
                    )}
                    {Object.keys(item.stats).length > 0 && (
                      <div className="text-xs text-yellow-300 mt-1">
                        {Object.entries(item.stats).map(([key, value]) => (
                          <span key={key} className="mr-2">+{(value * 100).toFixed(0)}% {key.replace('_', ' ')}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {owned ? (
                      <button
                        onClick={() => handleEquip(item.id, item.slot)}
                        className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-600 active:scale-95 transition flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Equip
                      </button>
                    ) : !unlockable ? (
                      <div className="bg-black/30 text-white/50 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1">
                        <Lock className="w-4 h-4" />
                        Locked
                      </div>
                    ) : item.cost === 0 ? (
                      <button
                        onClick={() => handlePurchase(item.id, item.cost)}
                        className="bg-white text-red-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-white/90 active:scale-95 transition"
                      >
                        Free
                      </button>
                    ) : crumbs >= item.cost ? (
                      <button
                        onClick={() => handlePurchase(item.id, item.cost)}
                        className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-xl font-bold text-sm hover:bg-yellow-300 active:scale-95 transition flex items-center gap-1 shadow-lg"
                      >
                        <Sparkles className="w-4 h-4" />
                        {item.cost}
                      </button>
                    ) : (
                      <div className="bg-black/30 text-white/50 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        {item.cost}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
