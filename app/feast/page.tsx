'use client'

import { useRouter } from 'next/navigation'
import { LevelMap } from '@/components/LevelMap'

export default function FeastLevelSelectPage() {
  const router = useRouter()
  
  const handleLevelSelect = (level: any) => {
    // Check if this is a boss level
    if (level.isBoss && level.bossId) {
      router.push(`/boss?boss=${level.bossId}`)
    } else {
      router.push(`/feastfun?level=${level.level_number}`)
    }
  }
  
  return <LevelMap onLevelSelect={handleLevelSelect} />
}
