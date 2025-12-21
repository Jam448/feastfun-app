'use client'

import React from 'react'
import Image from 'next/image'
import { PlayerOutfit } from '@/lib/wardrobe'
import CLOTHING_COMPONENTS from '@/components/clothing-svgs'

interface PocketsAvatarProps {
  outfit: PlayerOutfit
  colors?: Record<string, string>
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  animate?: boolean
}

const SIZE_MAP = {
  sm: { width: 80, height: 100 },
  md: { width: 120, height: 150 },
  lg: { width: 160, height: 200 },
  xl: { width: 240, height: 300 },
}

export function PocketsAvatar({ 
  outfit, 
  colors = {}, 
  size = 'lg',
  className = '',
  animate = false 
}: PocketsAvatarProps) {
  const dimensions = SIZE_MAP[size]
  
  // Get components for each slot - order matters for layering!
  const renderClothing = () => {
    const layers: React.ReactNode[] = []
    
    // 1. Cape/Backpack (behind body) - zIndex: 5
    if (outfit.accessory && ['acc_cape', 'acc_backpack'].includes(outfit.accessory)) {
      const Component = CLOTHING_COMPONENTS[outfit.accessory]
      if (Component) {
        layers.push(
          <div key="accessory-back" className="absolute inset-0" style={{ zIndex: 5 }}>
            <Component color={colors[outfit.accessory]} />
          </div>
        )
      }
    }
    
    // 2. Pants - zIndex: 20
    if (outfit.pants && outfit.pants !== 'pants_none') {
      const Component = CLOTHING_COMPONENTS[outfit.pants]
      if (Component) {
        layers.push(
          <div key="pants" className="absolute inset-0" style={{ zIndex: 20 }}>
            <Component color={colors[outfit.pants]} />
          </div>
        )
      }
    }
    
    // 3. Shoes - zIndex: 10 (but visually in front due to position)
    if (outfit.shoes && outfit.shoes !== 'shoes_none') {
      const Component = CLOTHING_COMPONENTS[outfit.shoes]
      if (Component) {
        layers.push(
          <div key="shoes" className="absolute inset-0" style={{ zIndex: 25 }}>
            <Component color={colors[outfit.shoes]} />
          </div>
        )
      }
    }
    
    // 4. Shirt - zIndex: 30
    if (outfit.shirt && outfit.shirt !== 'shirt_none') {
      const Component = CLOTHING_COMPONENTS[outfit.shirt]
      if (Component) {
        layers.push(
          <div key="shirt" className="absolute inset-0" style={{ zIndex: 30 }}>
            <Component color={colors[outfit.shirt]} />
          </div>
        )
      }
    }
    
    // 5. Front accessories (glasses, chain, bowtie, scarf) - zIndex: 40
    if (outfit.accessory && !['acc_cape', 'acc_backpack', 'acc_none'].includes(outfit.accessory)) {
      const Component = CLOTHING_COMPONENTS[outfit.accessory]
      if (Component) {
        layers.push(
          <div key="accessory-front" className="absolute inset-0" style={{ zIndex: 40 }}>
            <Component color={colors[outfit.accessory]} />
          </div>
        )
      }
    }
    
    // 6. Hat - zIndex: 50
    if (outfit.hat && outfit.hat !== 'hat_none') {
      const Component = CLOTHING_COMPONENTS[outfit.hat]
      if (Component) {
        layers.push(
          <div key="hat" className="absolute inset-0" style={{ zIndex: 50 }}>
            <Component color={colors[outfit.hat]} />
          </div>
        )
      }
    }
    
    return layers
  }

  return (
    <div 
      className={`relative ${animate ? 'animate-bounce' : ''} ${className}`}
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      {/* Base Pockets image */}
      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        <Image
          src="/og_pockets.png"
          alt="Pockets"
          fill
          className="object-contain drop-shadow-lg"
          priority
        />
      </div>
      
      {/* Clothing layers */}
      {renderClothing()}
    </div>
  )
}

// Preview component for showing single items
interface ClothingPreviewProps {
  itemId: string
  color?: string
  size?: number
}

export function ClothingPreview({ itemId, color, size = 80 }: ClothingPreviewProps) {
  const Component = CLOTHING_COMPONENTS[itemId]
  
  if (!Component) {
    return (
      <div 
        className="flex items-center justify-center bg-white/10 rounded-lg"
        style={{ width: size, height: size }}
      >
        <span className="text-2xl">❓</span>
      </div>
    )
  }
  
  return (
    <div 
      className="relative"
      style={{ width: size, height: size * 1.25 }}
    >
      <Component color={color} />
    </div>
  )
}

export default PocketsAvatar
