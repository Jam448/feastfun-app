'use client'

import { useRouter } from 'next/navigation'
import { LevelMap } from '@/components/LevelMap'

type Level = {
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

export default function LevelsPage() {
  const router = useRouter()

  const onLevelSelect = (level: Level) => {
    router.push(`/match3?level=${level.level_number}`)
  }

  return <LevelMap onLevelSelect={onLevelSelect} />
}
