'use client'

import React from 'react'
import Image from 'next/image'
import { PlayerOutfit } from '@/lib/wardrobe'
import CLOTHING_COMPONENTS from '@/components/clothing-svgs'

interface PocketsAvatarProps {
  outfit: PlayerOutfit
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZE_MAP = {
  sm: { width: 80, height: 100 },
  md: { width: 120, height: 150 },
  lg: { width: 180, height: 225 },
  xl: { width: 260, height: 325 },
}

export function PocketsAvatar({ 
  outfit, 
  size = 'lg',
  className = '',
}: PocketsAvatarProps) {
  const dimensions = SIZE_MAP[size]
  
  // Render clothing layers on top of base
  const renderClothing = () => {
    const layers: React.ReactNode[] = []
    
    // Order matters for layering!
    // 1. Shirt (behind other items, on body)
    if (outfit.shirt && outfit.shirt !== 'shirt_none') {
      const Component = CLOTHING_COMPONENTS[outfit.shirt]
      if (Component) {
        layers.push(
          <div key="shirt" className="absolute inset-0" style={{ zIndex: 20 }}>
            <Component />
          </div>
        )
      }
    }
    
    // 2. Pants
    if (outfit.pants && outfit.pants !== 'pants_none') {
      const Component = CLOTHING_COMPONENTS[outfit.pants]
      if (Component) {
        layers.push(
          <div key="pants" className="absolute inset-0" style={{ zIndex: 25 }}>
            <Component />
          </div>
        )
      }
    }
    
    // 3. Shoes
    if (outfit.shoes && outfit.shoes !== 'shoes_none') {
      const Component = CLOTHING_COMPONENTS[outfit.shoes]
      if (Component) {
        layers.push(
          <div key="shoes" className="absolute inset-0" style={{ zIndex: 30 }}>
            <Component />
          </div>
        )
      }
    }
    
    // 4. Accessories
    if (outfit.accessory && outfit.accessory !== 'acc_none') {
      const Component = CLOTHING_COMPONENTS[outfit.accessory]
      if (Component) {
        layers.push(
          <div key="accessory" className="absolute inset-0" style={{ zIndex: 35 }}>
            <Component />
          </div>
        )
      }
    }
    
    // 5. Hat (on top of everything)
    if (outfit.hat && outfit.hat !== 'hat_none') {
      const Component = CLOTHING_COMPONENTS[outfit.hat]
      if (Component) {
        layers.push(
          <div key="hat" className="absolute inset-0" style={{ zIndex: 40 }}>
            <Component />
          </div>
        )
      }
    }
    
    return layers
  }

  return (
    <div 
      className={`relative ${className}`}
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      {/* Base naked Pockets 2.0 */}
      <Image
        src="/pockets_base.png"
        alt="Pockets"
        fill
        className="object-contain drop-shadow-lg"
        style={{ zIndex: 10 }}
        priority
      />
      
      {/* Clothing layers */}
      {renderClothing()}
    </div>
  )
}

export default PocketsAvatar