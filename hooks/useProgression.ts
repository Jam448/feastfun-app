'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useProgression() {
  const { user } = useAuth()
  const [totalStars, setTotalStars] = useState(0)
  const [crumbs, setCrumbs] = useState(0)
  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProgression = async () => {
      if (!user) {
        // Default values for non-logged-in users
        setTotalStars(0)
        setCrumbs(0)
        setHighestUnlockedLevel(1)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_progression')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading progression:', error)
        }

        if (data) {
          setTotalStars(data.total_stars || 0)
          setCrumbs(data.crumbs || 0)
          setHighestUnlockedLevel(data.highest_unlocked_level || 1)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProgression()
  }, [user])

  return { totalStars, crumbs, highestUnlockedLevel, loading }
}