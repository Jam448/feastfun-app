'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, Check, HardHat, Shirt, Footprints, Gem } from 'lucide-react'
import {
  WardrobeItem,
  PlayerOutfit,
  SlotType,
  RARITY_CONFIG,
  getItemsBySlot,
  getItemById,
  DEFAULT_OUTFIT,
} from '@/lib/wardrobe'
import { PocketsAvatar } from '@/components/PocketsAvatar'

export default function LockerPage() {
  const [activeSlot, setActiveSlot] = useState<SlotType>('hat')
  const [currentOutfit, setCurrentOutfit] = useState<PlayerOutfit>(DEFAULT_OUTFIT)
  const [previewOutfit, setPreviewOutfit] = useState<PlayerOutfit | null>(null)

  const handleItemSelect = (item: WardrobeItem) => {
    const newOutfit = { ...currentOutfit, [item.slot]: item.id }
    setCurrentOutfit(newOutfit)
    setPreviewOutfit(null)
  }

  const getSlotIcon = (slot: SlotType) => {
    switch (slot) {
      case 'hat': return <HardHat className="w-4 h-4" />
      case 'shirt': return <Shirt className="w-4 h-4" />
      case 'pants': return <span className="text-sm">👖</span>
      case 'shoes': return <Footprints className="w-4 h-4" />
      case 'accessory': return <Gem className="w-4 h-4" />
    }
  }

  const getSlotItemCount = (slot: SlotType): number => {
    return getItemsBySlot(slot).filter(item => item.hasPNG).length
  }

  const displayOutfit = previewOutfit || currentOutfit

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4 safe-top">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="bg-white/20 p-2 rounded-xl active:scale-95 transition-all">
            <Home className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-2xl font-black text-white">👕 Locker Room</h1>
          <div className="w-10" />
        </div>

        {/* Character Preview */}
        <div className="glass rounded-3xl p-6 mb-4 card-elevated">
          <div className="flex justify-center mb-4">
            <PocketsAvatar 
              outfit={displayOutfit}
              size="xl"
            />
          </div>

          {/* Current outfit summary */}
          <div className="flex justify-center gap-2 flex-wrap">
            {(['hat', 'shirt', 'pants', 'shoes', 'accessory'] as SlotType[]).map(slot => {
              const itemId = currentOutfit[slot]
              const item = itemId ? getItemById(itemId) : null
              const hasItem = item && !item.id.includes('_none')
              
              return (
                <div
                  key={slot}
                  className={`px-2 py-1 rounded-lg text-xs ${
                    hasItem
                      ? RARITY_CONFIG[item!.rarity].bgColor + ' text-white'
                      : 'bg-white/10 text-white/40'
                  }`}
                >
                  {hasItem ? item!.emoji : '🚫'}
                </div>
              )
            })}
          </div>
        </div>

        {/* Slot Tabs */}
        <div className="flex gap-1 mb-3 bg-white/10 rounded-xl p-1">
          {(['hat', 'shirt', 'pants', 'shoes', 'accessory'] as SlotType[]).map(slot => {
            const itemCount = getSlotItemCount(slot)
            return (
              <button
                key={slot}
                onClick={() => setActiveSlot(slot)}
                className={`flex-1 py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                  activeSlot === slot
                    ? 'bg-white text-purple-600'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1">
                  {getSlotIcon(slot)}
                  <span className="capitalize hidden sm:inline">{slot}</span>
                </span>
                {itemCount > 0 && (
                  <span className={`text-[10px] ${activeSlot === slot ? 'text-purple-400' : 'text-white/50'}`}>
                    {itemCount} item{itemCount !== 1 ? 's' : ''}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Items Grid */}
        <div className="glass rounded-2xl p-4 card-elevated">
          <h3 className="font-bold text-white mb-3 capitalize flex items-center gap-2">
            {getSlotIcon(activeSlot)}
            {activeSlot}s
          </h3>
          
          <div className="grid grid-cols-3 gap-3">
            {getItemsBySlot(activeSlot).map(item => {
              const equipped = currentOutfit[activeSlot] === item.id
              const isNone = item.id.includes('_none')
              const rarityConfig = RARITY_CONFIG[item.rarity]

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleItemSelect(item)}
                  onMouseEnter={() => setPreviewOutfit({ ...currentOutfit, [item.slot]: item.id })}
                  onMouseLeave={() => setPreviewOutfit(null)}
                  onTouchStart={() => setPreviewOutfit({ ...currentOutfit, [item.slot]: item.id })}
                  onTouchEnd={() => setPreviewOutfit(null)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-4 rounded-xl transition-all ${
                    equipped
                      ? 'bg-green-500/30 border-2 border-green-400 shadow-lg shadow-green-500/20'
                      : isNone
                      ? 'bg-white/5 border border-white/10'
                      : `${rarityConfig.bgColor} border border-white/20 hover:border-white/40`
                  }`}
                >
                  {/* Rarity indicator */}
                  {!isNone && (
                    <div
                      className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: rarityConfig.color }}
                    />
                  )}

                  {/* Item emoji */}
                  <div className="text-3xl mb-2">{item.emoji}</div>
                  
                  {/* Item name */}
                  <p className="text-white text-xs font-medium truncate">{item.name}</p>
                  
                  {/* Rarity label for non-none items */}
                  {!isNone && (
                    <p 
                      className="text-[10px] mt-1 font-semibold"
                      style={{ color: rarityConfig.color }}
                    >
                      {rarityConfig.label}
                    </p>
                  )}

                  {/* Equipped checkmark */}
                  {equipped && (
                    <div className="absolute -top-1 -left-1 bg-green-500 rounded-full p-1 shadow-lg">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Empty state for slots with no items */}
          {getItemsBySlot(activeSlot).filter(i => i.hasPNG).length === 0 && (
            <div className="mt-4 text-center py-4 bg-white/5 rounded-lg">
              <p className="text-white/50 text-sm">No {activeSlot} items yet!</p>
              <p className="text-white/30 text-xs mt-1">More coming soon...</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-white">2</p>
            <p className="text-white/50 text-xs">Items Available</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-yellow-400">🎅🧥</p>
            <p className="text-white/50 text-xs">Collected</p>
          </div>
        </div>
      </div>
    </div>
  )
}