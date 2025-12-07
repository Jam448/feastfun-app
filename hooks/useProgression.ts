'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface Level {
  id: string
  level_number: number
  name: string
  description: string
  world: string
  target_score: number
  star_thresholds: { 1: number; 2: number; 3: number }
  unlock_cost: number
  rewards: { crumbs: number; items?: string[] }
}

export interface PlayerLevel {
  level_id: string
  unlocked: boolean
  completed: boolean
  stars_earned: number
  best_score: number
  times_played: number
}

export interface OutfitItem {
  id: string
  name: string
  slot: 'hat' | 'outfit' | 'accessory' | 'back'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  cost: number
  unlock_requirement: { level?: number; stars?: number }
  image_url: string
  stats: Record<string, number>
}

export interface PowerUpItem {
  id: string
  name: string
  type: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  cost: number
  effect_value: number
  duration_seconds: number
  description: string
  icon: string
}

export interface PlayerItem {
  item_id: string
  quantity: number
}

export function useProgression() {
  const [currentLevel, setCurrentLevel] = useState<number>(1)
  const [totalStars, setTotalStars] = useState<number>(0)
  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState<number>(1)
  const [crumbs, setCrumbs] = useState<number>(0)
  const [ownedOutfits, setOwnedOutfits] = useState<string[]>([])
  const [equippedOutfits, setEquippedOutfits] = useState<Record<string, string>>({})
  const [inventory, setInventory] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlayerData()
  }, [])

  const loadPlayerData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [progressData, outfitsData, itemsData, profileData] = await Promise.all([
        (supabase as any).from('player_levels').select('*').eq('player_id', user.id),
        (supabase as any).from('player_outfits').select('outfit_id, equipped').eq('player_id', user.id),
        (supabase as any).from('player_items').select('item_id, quantity').eq('player_id', user.id),
        (supabase as any).from('profiles').select('crumbs').eq('id', user.id).maybeSingle(),
      ])

      if (progressData.data) {
        const stars = progressData.data.reduce((sum: number, level: any) => sum + level.stars_earned, 0)
        setTotalStars(stars)

        const maxLevel = Math.max(...progressData.data.map((l: any) => l.unlocked ? 1 : 0))
        setHighestUnlockedLevel(maxLevel)
      }

      if (outfitsData.data) {
        const owned = outfitsData.data.map((o: any) => o.outfit_id)
        setOwnedOutfits(owned)

        const equipped: Record<string, string> = {}
        outfitsData.data.forEach((o: any) => {
          if (o.equipped) {
            equipped[o.outfit_id] = o.outfit_id
          }
        })
        setEquippedOutfits(equipped)
      }

      if (itemsData.data) {
        const inv = new Map<string, number>()
        itemsData.data.forEach((item: any) => {
          inv.set(item.item_id, item.quantity)
        })
        setInventory(inv)
      }

      if (profileData.data) {
        setCrumbs((profileData.data as any).crumbs || 0)
      }
    } catch (error) {
      console.error('Failed to load player data:', error)
    } finally {
      setLoading(false)
    }
  }

  const completeLevel = useCallback(async (levelId: string, score: number, starsEarned: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data: existingProgress } = await (supabase as any)
        .from('player_levels')
        .select('*')
        .eq('player_id', user.id)
        .eq('level_id', levelId)
        .maybeSingle()

      if (existingProgress) {
        if (score > existingProgress.best_score) {
          await (supabase as any)
            .from('player_levels')
            .update({
              completed: true,
              best_score: score,
              stars_earned: Math.max(starsEarned, existingProgress.stars_earned),
              times_played: existingProgress.times_played + 1,
              last_played_at: new Date().toISOString(),
            })
            .eq('player_id', user.id)
            .eq('level_id', levelId)
        } else {
          await (supabase as any)
            .from('player_levels')
            .update({
              times_played: existingProgress.times_played + 1,
              last_played_at: new Date().toISOString(),
            })
            .eq('player_id', user.id)
            .eq('level_id', levelId)
        }
      }

      await loadPlayerData()
      return true
    } catch (error) {
      console.error('Failed to complete level:', error)
      return false
    }
  }, [])

  const purchaseOutfit = useCallback(async (outfitId: string, cost: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      if (crumbs < cost) return false

      await (supabase as any).from('player_outfits').insert({
        player_id: user.id,
        outfit_id: outfitId,
        equipped: false,
      })

      await (supabase as any)
        .from('profiles')
        .update({ crumbs: crumbs - cost })
        .eq('id', user.id)

      await loadPlayerData()
      return true
    } catch (error) {
      console.error('Failed to purchase outfit:', error)
      return false
    }
  }, [crumbs])

  const equipOutfit = useCallback(async (outfitId: string, slot: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      await (supabase as any)
        .from('player_outfits')
        .update({ equipped: false })
        .eq('player_id', user.id)
        .eq('outfit_id', outfitId)
        .neq('outfit_id', outfitId)

      await (supabase as any)
        .from('player_outfits')
        .update({ equipped: true })
        .eq('player_id', user.id)
        .eq('outfit_id', outfitId)

      await loadPlayerData()
      return true
    } catch (error) {
      console.error('Failed to equip outfit:', error)
      return false
    }
  }, [])

  const purchaseItem = useCallback(async (itemId: string, cost: number, quantity: number = 1) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      if (crumbs < cost * quantity) return false

      const existingQty = inventory.get(itemId) || 0

      await (supabase as any)
        .from('player_items')
        .upsert({
          player_id: user.id,
          item_id: itemId,
          quantity: existingQty + quantity,
          updated_at: new Date().toISOString(),
        })

      await (supabase as any)
        .from('profiles')
        .update({ crumbs: crumbs - cost * quantity })
        .eq('id', user.id)

      await loadPlayerData()
      return true
    } catch (error) {
      console.error('Failed to purchase item:', error)
      return false
    }
  }, [crumbs, inventory])

  const useItem = useCallback(async (itemId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const existingQty = inventory.get(itemId) || 0
      if (existingQty <= 0) return false

      await (supabase as any)
        .from('player_items')
        .update({
          quantity: existingQty - 1,
          updated_at: new Date().toISOString(),
        })
        .eq('player_id', user.id)
        .eq('item_id', itemId)

      await loadPlayerData()
      return true
    } catch (error) {
      console.error('Failed to use item:', error)
      return false
    }
  }, [inventory])

  return {
    currentLevel,
    totalStars,
    highestUnlockedLevel,
    crumbs,
    ownedOutfits,
    equippedOutfits,
    inventory,
    loading,
    completeLevel,
    purchaseOutfit,
    equipOutfit,
    purchaseItem,
    useItem,
    refreshData: loadPlayerData,
  }
}
