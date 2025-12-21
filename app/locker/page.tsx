'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, Lock, Check, Sparkles, Crown, ShoppingBag, 
  Shirt, HardHat, Footprints, Gem, Star
} from 'lucide-react'
import {
  WardrobeItem,
  PlayerOutfit,
  SlotType,
  Rarity,
  RARITY_CONFIG,
  HATS,
  SHIRTS,
  PANTS,
  SHOES,
  ACCESSORIES,
  OUTFIT_SETS,
  getItemById,
  DEFAULT_OUTFIT,
} from '@/lib/wardrobe'
import { PocketsAvatar } from '@/components/PocketsAvatar'
import { supabase } from '@/lib/supabase'

export default function LockerPage() {
  const [activeSlot, setActiveSlot] = useState<SlotType>('hat')
  const [currentOutfit, setCurrentOutfit] = useState<PlayerOutfit>(DEFAULT_OUTFIT)
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({})
  const [ownedItems, setOwnedItems] = useState<Set<string>>(new Set(['hat_none', 'hat_beanie', 'shirt_none', 'shirt_tee', 'shirt_hoodie', 'pants_none', 'pants_jeans', 'shoes_none', 'shoes_sneakers', 'acc_none', 'acc_glasses']))
  const [playerCrumbs, setPlayerCrumbs] = useState(500)
  const [showPurchaseModal, setShowPurchaseModal] = useState<WardrobeItem | null>(null)
  const [previewOutfit, setPreviewOutfit] = useState<PlayerOutfit | null>(null)
  const [showSets, setShowSets] = useState(false)

  useEffect(() => {
    loadPlayerWardrobe()
  }, [])

  const loadPlayerWardrobe = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load from Supabase (you'd create this table)
      const { data } = await (supabase as any)
        .from('player_wardrobe')
        .select('*')
        .eq('player_id', user.id)
        .single()

      if (data) {
        setCurrentOutfit(data.current_outfit || DEFAULT_OUTFIT)
        setOwnedItems(new Set([...ownedItems, ...(data.owned_items || [])]))
        setSelectedColors(data.selected_colors || {})
        setPlayerCrumbs(data.crumbs || 0)
      }
    } catch (error) {
      console.warn('Could not load wardrobe:', error)
    }
  }

  const saveOutfit = async (outfit: PlayerOutfit) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await (supabase as any)
        .from('player_wardrobe')
        .upsert({
          player_id: user.id,
          current_outfit: outfit,
          owned_items: Array.from(ownedItems),
          selected_colors: selectedColors,
          updated_at: new Date().toISOString(),
        })
    } catch (error) {
      console.error('Failed to save outfit:', error)
    }
  }

  const getItemsForSlot = (slot: SlotType): WardrobeItem[] => {
    switch (slot) {
      case 'hat': return HATS
      case 'shirt': return SHIRTS
      case 'pants': return PANTS
      case 'shoes': return SHOES
      case 'accessory': return ACCESSORIES
    }
  }

  const handleItemSelect = (item: WardrobeItem) => {
    if (!ownedItems.has(item.id)) {
      // Show purchase modal
      setShowPurchaseModal(item)
      return
    }

    const newOutfit = { ...currentOutfit, [item.slot]: item.id }
    setCurrentOutfit(newOutfit)
    saveOutfit(newOutfit)
  }

  const handlePurchase = async (item: WardrobeItem) => {
    if (!item.price || playerCrumbs < item.price) return

    // Deduct crumbs
    const newCrumbs = playerCrumbs - item.price
    setPlayerCrumbs(newCrumbs)

    // Add to owned items
    const newOwned = new Set(ownedItems)
    newOwned.add(item.id)
    setOwnedItems(newOwned)

    // Equip immediately
    const newOutfit = { ...currentOutfit, [item.slot]: item.id }
    setCurrentOutfit(newOutfit)

    setShowPurchaseModal(null)

    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await (supabase as any)
          .from('player_wardrobe')
          .upsert({
            player_id: user.id,
            current_outfit: newOutfit,
            owned_items: Array.from(newOwned),
            crumbs: newCrumbs,
            updated_at: new Date().toISOString(),
          })
      }
    } catch (error) {
      console.error('Failed to save purchase:', error)
    }
  }

  const handleColorSelect = (itemId: string, color: string) => {
    const newColors = { ...selectedColors, [itemId]: color }
    setSelectedColors(newColors)
  }

  const handleSetEquip = (setItems: PlayerOutfit) => {
    // Check if all items are owned
    const allOwned = Object.values(setItems).every(id => id && ownedItems.has(id))
    if (!allOwned) return

    setCurrentOutfit(setItems)
    saveOutfit(setItems)
  }

  const isItemLocked = (item: WardrobeItem): boolean => {
    if (ownedItems.has(item.id)) return false
    if (item.unlockMethod === 'default') return false
    if (item.unlockMethod === 'achievement') return true // Check achievements
    if (item.unlockMethod === 'event') return true // Check events
    if (item.unlockMethod === 'level') return true // Check level
    return false
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

  const getCurrentItemForSlot = (slot: SlotType): WardrobeItem | undefined => {
    const itemId = currentOutfit[slot]
    return itemId ? getItemById(itemId) : undefined
  }

  // Display outfit with preview if hovering
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
          <div className="bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-400/30">
            <span className="text-yellow-300 font-bold text-sm">🍪 {playerCrumbs.toLocaleString()}</span>
          </div>
        </div>

        {/* Character Preview with actual clothing */}
        <div className="glass rounded-3xl p-6 mb-4 card-elevated">
          <div className="flex justify-center mb-4">
            <PocketsAvatar 
              outfit={displayOutfit}
              colors={selectedColors}
              size="xl"
            />
          </div>

          {/* Current Outfit Summary */}
          <div className="flex justify-center gap-2 flex-wrap">
            {(['hat', 'shirt', 'pants', 'shoes', 'accessory'] as SlotType[]).map(slot => {
              const item = getCurrentItemForSlot(slot)
              return (
                <div
                  key={slot}
                  onClick={() => { setActiveSlot(slot); setShowSets(false); }}
                  className={`px-3 py-2 rounded-lg text-xs cursor-pointer transition-all hover:scale-105 ${
                    activeSlot === slot && !showSets
                      ? 'bg-white text-purple-600 font-bold'
                      : item && item.id !== `${slot}_none` && item.id !== 'acc_none'
                        ? RARITY_CONFIG[item.rarity].bgColor + ' text-white'
                        : 'bg-white/10 text-white/70'
                  }`}
                >
                  <span>{item?.emoji || '❌'}</span>
                  <span className="ml-1 capitalize">{slot}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Slot Tabs */}
        <div className="flex gap-1 mb-3 bg-white/10 rounded-xl p-1 overflow-x-auto">
          {(['hat', 'shirt', 'pants', 'shoes', 'accessory'] as SlotType[]).map(slot => (
            <button
              key={slot}
              onClick={() => { setActiveSlot(slot); setShowSets(false); }}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                activeSlot === slot && !showSets
                  ? 'bg-white text-purple-600'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {getSlotIcon(slot)}
              <span className="hidden sm:inline capitalize">{slot}</span>
            </button>
          ))}
          <button
            onClick={() => setShowSets(true)}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              showSets
                ? 'bg-yellow-400 text-yellow-900'
                : 'text-yellow-400 hover:text-yellow-300'
            }`}
          >
            <Star className="w-4 h-4" />
            <span className="hidden sm:inline">Sets</span>
          </button>
        </div>

        {/* Items Grid or Sets */}
        {showSets ? (
          <div className="glass rounded-2xl p-4 card-elevated">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              Outfit Sets
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {OUTFIT_SETS.map(set => {
                const allOwned = Object.values(set.items).every(
                  id => id && ownedItems.has(id)
                )
                const rarityConfig = RARITY_CONFIG[set.rarity]

                return (
                  <button
                    key={set.id}
                    onClick={() => allOwned && handleSetEquip(set.items as PlayerOutfit)}
                    disabled={!allOwned}
                    className={`p-3 rounded-xl text-left transition-all ${
                      allOwned
                        ? `${rarityConfig.bgColor} border border-white/20 hover:scale-[1.02] active:scale-[0.98]`
                        : 'bg-white/5 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: rarityConfig.color }} className="font-bold text-sm">
                        {set.name}
                      </span>
                      {!allOwned && <Lock className="w-3 h-3 text-white/50" />}
                    </div>
                    <p className="text-white/50 text-xs">{set.description}</p>
                    <div className="flex gap-1 mt-2">
                      {Object.values(set.items).map((id, i) => {
                        const item = getItemById(id!)
                        return (
                          <span key={i} className="text-sm">
                            {item?.emoji}
                          </span>
                        )
                      })}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-4 card-elevated">
            <div className="grid grid-cols-3 gap-2">
              {getItemsForSlot(activeSlot).map(item => {
                const owned = ownedItems.has(item.id)
                const equipped = currentOutfit[activeSlot] === item.id
                const locked = isItemLocked(item)
                const rarityConfig = RARITY_CONFIG[item.rarity]

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleItemSelect(item)}
                    onMouseEnter={() => {
                      // Preview this item on the avatar
                      setPreviewOutfit({ ...currentOutfit, [item.slot]: item.id })
                    }}
                    onMouseLeave={() => setPreviewOutfit(null)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative p-3 rounded-xl transition-all ${
                      equipped
                        ? 'bg-green-500/30 border-2 border-green-400'
                        : owned
                        ? `${rarityConfig.bgColor} border border-white/20`
                        : 'bg-white/5 border border-white/10'
                    } ${locked ? 'opacity-50' : ''}`}
                  >
                    {/* Rarity indicator */}
                    <div
                      className="absolute top-1 right-1 w-2 h-2 rounded-full"
                      style={{ backgroundColor: rarityConfig.color }}
                    />

                    {/* Item emoji */}
                    <div className="text-3xl mb-1">{item.emoji}</div>

                    {/* Item name */}
                    <p className="text-white text-xs font-medium truncate">{item.name}</p>

                    {/* Status indicators */}
                    {equipped && (
                      <div className="absolute -top-1 -left-1 bg-green-500 rounded-full p-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}

                    {locked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                        <Lock className="w-6 h-6 text-white/70" />
                      </div>
                    )}

                    {!owned && !locked && item.price && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                        🍪 {item.price}
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {showPurchaseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPurchaseModal(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-3xl p-6 max-w-sm w-full"
            >
              <div className="text-center">
                <div className="text-6xl mb-3">{showPurchaseModal.emoji}</div>
                <h2 className="text-2xl font-black text-white mb-1">{showPurchaseModal.name}</h2>
                <p className="text-white/70 text-sm mb-4">{showPurchaseModal.description}</p>

                <div
                  className="inline-block px-3 py-1 rounded-full text-sm font-bold mb-4"
                  style={{
                    backgroundColor: RARITY_CONFIG[showPurchaseModal.rarity].color + '30',
                    color: RARITY_CONFIG[showPurchaseModal.rarity].color,
                  }}
                >
                  {RARITY_CONFIG[showPurchaseModal.rarity].label}
                </div>

                {showPurchaseModal.price && (
                  <div className="bg-white/10 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Price:</span>
                      <span className="text-yellow-400 font-black text-xl">
                        🍪 {showPurchaseModal.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-white/70">Your Balance:</span>
                      <span className={`font-bold ${playerCrumbs >= showPurchaseModal.price ? 'text-green-400' : 'text-red-400'}`}>
                        🍪 {playerCrumbs.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPurchaseModal(null)}
                    className="flex-1 bg-white/20 text-white font-bold py-3 rounded-xl active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  {showPurchaseModal.price && (
                    <button
                      onClick={() => handlePurchase(showPurchaseModal)}
                      disabled={playerCrumbs < showPurchaseModal.price}
                      className={`flex-1 font-bold py-3 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 ${
                        playerCrumbs >= showPurchaseModal.price
                          ? 'bg-yellow-400 text-yellow-900'
                          : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingBag className="w-5 h-5" />
                      Buy
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}