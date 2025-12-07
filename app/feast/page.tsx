'use client'

import { useRouter } from 'next/navigation'
import { LevelMap } from '@/components/LevelMap'

export default function FeastLevelSelectPage() {
  const router = useRouter()

  const handleLevelSelect = (level: any) => {
    router.push(`/match3?level=${level.level_number}`)
  }

  return <LevelMap onLevelSelect={handleLevelSelect} />
}
