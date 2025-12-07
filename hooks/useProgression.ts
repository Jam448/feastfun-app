// hooks/useProgression.ts
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type PlayerProgressRow = {
  total_stars: number | null
  crumbs: number | null
  highest_unlocked_level: number | null
}

export function useProgression(userId?: string) {
  const [totalStars, setTotalStars] = useState(0)
  const [crumbs, setCrumbs] = useState(0)
  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setTotalStars(0)
      setCrumbs(0)
      setHighestUnlockedLevel(1)
      setLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      setLoading(true)

      const { data, error } = await (supabase as any)
        .from('player_progress')
        .select('total_stars, crumbs, highest_unlocked_level')
        .eq('player_id', userId)
        .maybeSingle()
        .returns<PlayerProgressRow>()

      if (cancelled) return

      if (error) {
        console.error('Failed to load player_progress:', error)
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
    }

    load()

    return () => {
      cancelled = true
    }
  }, [userId])

  return { totalStars, crumbs, highestUnlockedLevel, loading }
}
