'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type PlayerProgressRow = {
  total_stars: number | null
  crumbs: number | null
  highest_unlocked_level: number | null
}

type UseProgressionResult = {
  totalStars: number
  crumbs: number
  highestUnlockedLevel: number
  loading: boolean
  refresh: () => Promise<void>
}

/**
 * Loads basic progression stats for the signed-in player.
 * This is intentionally typed to avoid `never` inference during Next build.
 *
 * Expected table: player_progress
 * Expected columns: player_id, total_stars, crumbs, highest_unlocked_level
 */
export function useProgression(userId?: string): UseProgressionResult {
  const [totalStars, setTotalStars] = useState(0)
  const [crumbs, setCrumbs] = useState(0)
  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState(1)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!userId) {
      setTotalStars(0)
      setCrumbs(0)
      setHighestUnlockedLevel(1)
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const { data, error } = await (supabase as any)
        .from('player_progress')
        .select('total_stars, crumbs, highest_unlocked_level')
        .eq('player_id', userId)
        .maybeSingle()
        .returns<PlayerProgressRow>()

      if (error) {
        console.error('useProgression: failed to load player_progress', error)
        setTotalStars(0)
        setCrumbs(0)
        setHighestUnlockedLevel(1)
        setLoading(false)
        return
      }

      setTotalStars(data?.total_stars ?? 0)
      setCrumbs(data?.crumbs ?? 0)
      setHighestUnlockedLevel(data?.highest_unlocked_level ?? 1)
      setLoading(false)
    } catch (err) {
      console.error('useProgression: unexpected error', err)
      setTotalStars(0)
      setCrumbs(0)
      setHighestUnlockedLevel(1)
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (cancelled) return
      await load()
    }

    run()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return {
    totalStars,
    crumbs,
    highestUnlockedLevel,
    loading,
    refresh: load,
  }
}
