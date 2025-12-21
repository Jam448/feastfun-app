// PNG-Based Clothing System for Pockets 2.0
// Only real PNG assets - positioned to overlay on pockets_base.png

'use client'

import React from 'react'
import Image from 'next/image'

interface ClothingProps {
  color?: string
}

// ==========================================
// HAT ITEMS
// ==========================================

export const SantaHatPNG: React.FC<ClothingProps> = () => (
  <div className="absolute inset-0 pointer-events-none overflow-visible">
    <div 
      className="absolute"
      style={{
        top: '-8%',
        left: '12%',
        width: '76%',
        height: '40%',
      }}
    >
      <Image
        src="/clothing/santa_hat.png"
        alt="Santa Hat"
        fill
        className="object-contain"
        style={{ transform: 'rotate(-3deg)' }}
        priority
      />
    </div>
  </div>
)

// ==========================================
// SHIRT ITEMS
// ==========================================

export const GreenHoodiePNG: React.FC<ClothingProps> = () => (
  <div className="absolute inset-0 pointer-events-none overflow-visible">
    <div 
      className="absolute"
      style={{
        top: '32%',
        left: '8%',
        width: '84%',
        height: '50%',
      }}
    >
      <Image
        src="/clothing/hoodie_green.png"
        alt="Green Hoodie"
        fill
        className="object-contain"
        priority
      />
    </div>
  </div>
)

// ==========================================
// COMPONENT MAPPING
// Only items with actual PNG assets
// ==========================================

export const CLOTHING_COMPONENTS: Record<string, React.FC<ClothingProps>> = {
  // Hats
  'hat_santa': SantaHatPNG,
  
  // Shirts
  'shirt_hoodie_green': GreenHoodiePNG,
}

export default CLOTHING_COMPONENTS