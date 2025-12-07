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
 * Build-safe with strict TS + untyped Supabase client.
 *
 * Expected table (can change later): player_progress
 * Expected columns: player_id, total_stars, crumbs, highest_unlocked_level
 */
export function useProgression(userId?: string): UseProgressionResult {
  const [totalStars, setTotalStars] = useState(0)
  const [crumbs, setCrumbs] = useState(0)
  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState(1)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    // no user -> default values
    if (!userId) {
      setTotalStars(0)
      setCrumbs(0)
      setHighestUnlockedLevel(1)
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      // NOTE: do NOT use `.returns<T>()` here because supabase is `any` in this project.
      const res = await (supabase as any)
        .from('player_progress')
        .select('total_stars, crumbs, highest_unlocked_level')
        .eq('player_id', userId)
        .maybeSingle()

      const data = (res?.data ?? null) as PlayerProgressRow | null
      const error = res?.error as any

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
