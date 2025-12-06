'use client'

import { useState } from 'react'
import { useGameStore, COSMETICS, CosmeticType } from '@/hooks/useGameStore'
import { ShoppingBag, Lock, Check, Sparkles } from 'lucide-react'

export default function LockerPage() {
  const { state, purchaseCosmetic, selectCosmetic, triggerHaptic, mounted } = useGameStore()
  const [selectedTab, setSelectedTab] = useState<CosmeticType>('skin')

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white" />
      </div>
    )
  }

  const filteredCosmetics = COSMETICS.filter(c => c.type === selectedTab)

  const handlePurchase = (cosmeticId: string) => {
    const success = purchaseCosmetic(cosmeticId)
    if (success) {
      triggerHaptic('heavy')
    } else {
      triggerHaptic('light')
    }
  }

  const handleEquip = (cosmeticId: string, type: CosmeticType) => {
    selectCosmetic(cosmeticId, type)
    triggerHaptic('medium')
  }

  const isOwned = (cosmeticId: string) => state.ownedCosmetics.includes(cosmeticId)
  const isEquipped = (cosmeticId: string, type: CosmeticType) => {
    if (type === 'skin') return state.selectedSkin === cosmeticId
    if (type === 'trail') return state.selectedTrail === cosmeticId
    if (type === 'emote') return state.selectedEmote === cosmeticId
    return false
  }

  return (
    <div className="min-h-screen p-4 safe-top">
      <div className="max-w-md mx-auto space-y-4">
        <div className="glass rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-8 h-8 text-primary-600" />
              Locker
            </h1>
            <div className="flex items-center gap-1 bg-orange-100 px-4 py-2 rounded-full">
              <Sparkles className="w-5 h-5 text-orange-600" />
              <span className="text-lg font-black text-orange-700">{state.crumbs}</span>
            </div>
          </div>
          <p className="text-gray-600">Unlock and equip cosmetics</p>
        </div>

        <div className="glass rounded-2xl p-2 shadow-xl">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab('skin')}
              className={`flex-1 py-3 rounded-xl font-bold transition ${
                selectedTab === 'skin'
                  ? 'bg-gradient-to-r from-primary-500 to-red-500 text-white'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              Skins
            </button>
            <button
              onClick={() => setSelectedTab('trail')}
              className={`flex-1 py-3 rounded-xl font-bold transition ${
                selectedTab === 'trail'
                  ? 'bg-gradient-to-r from-primary-500 to-red-500 text-white'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              Trails
            </button>
            <button
              onClick={() => setSelectedTab('emote')}
              className={`flex-1 py-3 rounded-xl font-bold transition ${
                selectedTab === 'emote'
                  ? 'bg-gradient-to-r from-primary-500 to-red-500 text-white'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              Emotes
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredCosmetics.map((cosmetic) => {
            const owned = isOwned(cosmetic.id)
            const equipped = isEquipped(cosmetic.id, cosmetic.type)

            return (
              <div
                key={cosmetic.id}
                className={`glass rounded-2xl p-4 shadow-lg ${
                  equipped ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {cosmetic.type === 'skin' && cosmetic.color && (
                    <div
                      className="w-16 h-16 rounded-full flex-shrink-0 border-4 border-white shadow-lg"
                      style={{ backgroundColor: cosmetic.color }}
                    />
                  )}
                  {cosmetic.type === 'emote' && (
                    <div className="w-16 h-16 rounded-full flex-shrink-0 border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center text-3xl">
                      {cosmetic.description}
                    </div>
                  )}
                  {cosmetic.type === 'trail' && (
                    <div className="w-16 h-16 rounded-full flex-shrink-0 border-4 border-white shadow-lg bg-gradient-to-r from-purple-400 to-pink-400" />
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{cosmetic.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{cosmetic.description}</p>
                  </div>

                  <div className="flex-shrink-0">
                    {equipped ? (
                      <div className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Equipped
                      </div>
                    ) : owned ? (
                      <button
                        onClick={() => handleEquip(cosmetic.id, cosmetic.type)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-600 active:scale-95 transition"
                      >
                        Equip
                      </button>
                    ) : cosmetic.cost === 0 ? (
                      <div className="bg-gray-300 text-gray-600 px-4 py-2 rounded-xl font-bold text-sm">
                        Free
                      </div>
                    ) : state.crumbs >= cosmetic.cost ? (
                      <button
                        onClick={() => handlePurchase(cosmetic.id)}
                        className="bg-gradient-to-r from-primary-500 to-red-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:shadow-lg active:scale-95 transition flex items-center gap-1"
                      >
                        <Sparkles className="w-4 h-4" />
                        {cosmetic.cost}
                      </button>
                    ) : (
                      <div className="bg-gray-200 text-gray-500 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1">
                        <Lock className="w-4 h-4" />
                        {cosmetic.cost}
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
