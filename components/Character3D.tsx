'use client'

import Image from 'next/image'

interface Character3DProps {
  size?: 'small' | 'medium' | 'large'
  animate?: boolean
  showStats?: boolean
}

export function Character3D({ 
  size = 'medium', 
  animate = true,
  showStats = false 
}: Character3DProps) {
  const sizeMap = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  }

  return (
    <div className={`relative ${sizeMap[size]}`}>
      <div className={animate ? 'animate-bounce' : ''}>
        <Image
          src="/santa_pockets.png"
          alt="Pockets the Raccoon"
          fill
          className="object-contain drop-shadow-2xl"
          priority
        />
      </div>
    </div>
  )
}