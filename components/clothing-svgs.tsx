// SVG Clothing Overlays for Pockets
// These are positioned to layer on top of og_pockets.png (base with teal hoodie)
// Coordinate system based on 400x500 viewBox matching the character proportions

import React from 'react'
import Image from 'next/image'

interface ClothingProps {
  color?: string
  secondaryColor?: string
}

// ==========================================
// PNG-BASED CLOTHING ITEMS
// ==========================================

// Santa Hat - Uses actual PNG image
export const SantaHatPNG: React.FC<ClothingProps> = () => (
  <div className="absolute inset-0 pointer-events-none">
    <div 
      className="absolute"
      style={{
        top: '-12%',
        left: '15%',
        width: '70%',
        height: '45%',
      }}
    >
      <Image
        src="/clothing/santa_hat.png"
        alt="Santa Hat"
        fill
        className="object-contain"
        style={{ transform: 'rotate(-5deg)' }}
      />
    </div>
  </div>
)

// ==========================================
// HATS - Layer on top of head (between ears)
// ==========================================

export const BeanieHat: React.FC<ClothingProps> = ({ color = '#ef4444' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Beanie body */}
    <ellipse cx="200" cy="72" rx="65" ry="35" fill={color} />
    <rect x="135" y="65" width="130" height="30" fill={color} />
    {/* Fold/cuff */}
    <rect x="130" y="85" width="140" height="18" fill={color} stroke="#00000030" strokeWidth="2" rx="4" />
    {/* Pom pom */}
    <circle cx="200" cy="45" r="18" fill={color} />
    <circle cx="195" cy="42" r="4" fill="#ffffff40" />
    {/* Texture lines */}
    <path d="M145 75 Q200 65 255 75" stroke="#00000020" strokeWidth="2" fill="none" />
    <path d="M150 60 Q200 50 250 60" stroke="#00000015" strokeWidth="2" fill="none" />
  </svg>
)

export const SantaHat: React.FC<ClothingProps> = ({ color = '#dc2626' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Hat base */}
    <path d="M120 95 Q200 20 280 95 Q260 60 200 10 Q140 60 120 95" fill={color} />
    {/* White trim */}
    <ellipse cx="200" cy="95" rx="80" ry="18" fill="#ffffff" />
    {/* Droopy part */}
    <path d="M200 10 Q280 30 290 80" stroke={color} strokeWidth="35" fill="none" strokeLinecap="round" />
    {/* Pom pom */}
    <circle cx="295" cy="85" r="20" fill="#ffffff" />
    <circle cx="290" cy="80" r="5" fill="#ffffff90" />
  </svg>
)

export const BaseballCap: React.FC<ClothingProps> = ({ color = '#3b82f6' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Cap dome */}
    <ellipse cx="200" cy="75" rx="70" ry="40" fill={color} />
    {/* Bill/brim */}
    <ellipse cx="200" cy="100" rx="85" ry="15" fill={color} />
    <path d="M130 100 Q200 130 270 100" fill={color} />
    {/* Bill shadow */}
    <path d="M140 105 Q200 125 260 105" fill="#00000030" />
    {/* Button on top */}
    <circle cx="200" cy="45" r="8" fill={color} stroke="#00000030" strokeWidth="2" />
    {/* Panel lines */}
    <path d="M200 45 L200 90" stroke="#00000015" strokeWidth="2" />
    <path d="M160 55 L175 90" stroke="#00000015" strokeWidth="2" />
    <path d="M240 55 L225 90" stroke="#00000015" strokeWidth="2" />
  </svg>
)

export const CrownHat: React.FC<ClothingProps> = ({ color = '#fbbf24' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Crown base */}
    <rect x="135" y="70" width="130" height="35" fill={color} rx="3" />
    {/* Crown points */}
    <polygon points="135,70 150,30 165,70" fill={color} />
    <polygon points="165,70 185,20 205,70" fill={color} />
    <polygon points="195,70 215,20 235,70" fill={color} />
    <polygon points="235,70 250,30 265,70" fill={color} />
    {/* Gems */}
    <circle cx="150" cy="45" r="6" fill="#ef4444" />
    <circle cx="200" cy="35" r="8" fill="#3b82f6" />
    <circle cx="250" cy="45" r="6" fill="#22c55e" />
    {/* Base jewels */}
    <circle cx="165" cy="85" r="5" fill="#ef4444" />
    <circle cx="200" cy="85" r="5" fill="#ffffff" />
    <circle cx="235" cy="85" r="5" fill="#ef4444" />
    {/* Shine */}
    <path d="M145 75 L255 75" stroke="#ffffff50" strokeWidth="3" />
  </svg>
)

export const CowboyHat: React.FC<ClothingProps> = ({ color = '#92400e' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Wide brim */}
    <ellipse cx="200" cy="95" rx="110" ry="25" fill={color} />
    {/* Crown indent */}
    <path d="M140 95 Q150 70 200 65 Q250 70 260 95" fill={color} />
    {/* Top of crown */}
    <ellipse cx="200" cy="55" rx="50" ry="20" fill={color} />
    <path d="M150 55 L150 75 Q200 90 250 75 L250 55" fill={color} />
    {/* Band */}
    <rect x="148" y="70" width="104" height="10" fill="#78350f" />
    {/* Band buckle */}
    <rect x="190" y="68" width="20" height="14" fill="#fbbf24" rx="2" />
    {/* Brim shadow */}
    <ellipse cx="200" cy="100" rx="100" ry="15" fill="#00000020" />
  </svg>
)

export const TopHat: React.FC<ClothingProps> = ({ color = '#1f2937' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Brim */}
    <ellipse cx="200" cy="90" rx="75" ry="15" fill={color} />
    {/* Cylinder */}
    <rect x="150" y="20" width="100" height="70" fill={color} />
    <ellipse cx="200" cy="20" rx="50" ry="12" fill={color} />
    {/* Band */}
    <rect x="150" y="70" width="100" height="12" fill="#dc2626" />
    {/* Shine */}
    <path d="M160 35 L160 75" stroke="#ffffff20" strokeWidth="8" />
  </svg>
)

export const HockeyHelmet: React.FC<ClothingProps> = ({ color = '#ffffff' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Helmet shell */}
    <ellipse cx="200" cy="70" rx="75" ry="50" fill={color} />
    {/* Face cage */}
    <ellipse cx="200" cy="110" rx="50" ry="30" fill="none" stroke="#666666" strokeWidth="3" />
    <line x1="160" y1="95" x2="160" y2="130" stroke="#666666" strokeWidth="3" />
    <line x1="180" y1="90" x2="180" y2="135" stroke="#666666" strokeWidth="3" />
    <line x1="200" y1="88" x2="200" y2="138" stroke="#666666" strokeWidth="3" />
    <line x1="220" y1="90" x2="220" y2="135" stroke="#666666" strokeWidth="3" />
    <line x1="240" y1="95" x2="240" y2="130" stroke="#666666" strokeWidth="3" />
    {/* Vents */}
    <rect x="170" y="45" width="15" height="6" fill="#333" rx="2" />
    <rect x="215" y="45" width="15" height="6" fill="#333" rx="2" />
  </svg>
)

// ==========================================
// SHIRTS/TOPS - Overlay on torso area
// ==========================================

export const HoodieShirt: React.FC<ClothingProps> = ({ color = '#ef4444' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Main body */}
    <path d="M100 180 Q90 250 100 340 L170 360 L170 400 L230 400 L230 360 L300 340 Q310 250 300 180 Q250 150 200 155 Q150 150 100 180" fill={color} />
    {/* Hood */}
    <path d="M130 180 Q130 140 200 130 Q270 140 270 180" fill={color} />
    {/* Hood opening */}
    <ellipse cx="200" cy="175" rx="45" ry="25" fill="#00000020" />
    {/* Center pocket */}
    <path d="M150 280 L150 330 Q200 340 250 330 L250 280 Q200 270 150 280" fill="#00000015" stroke="#00000020" strokeWidth="2" />
    {/* Drawstrings */}
    <line x1="175" y1="175" x2="175" y2="220" stroke="#ffffff80" strokeWidth="3" />
    <line x1="225" y1="175" x2="225" y2="220" stroke="#ffffff80" strokeWidth="3" />
    <circle cx="175" cy="222" r="5" fill="#ffffff80" />
    <circle cx="225" cy="222" r="5" fill="#ffffff80" />
    {/* Sleeve cuffs */}
    <ellipse cx="100" cy="340" rx="20" ry="8" fill={color} stroke="#00000020" strokeWidth="2" />
    <ellipse cx="300" cy="340" rx="20" ry="8" fill={color} stroke="#00000020" strokeWidth="2" />
  </svg>
)

export const BasketballJersey: React.FC<ClothingProps> = ({ color = '#7c3aed', secondaryColor = '#fbbf24' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Main jersey */}
    <path d="M110 170 Q100 250 110 340 L170 355 L170 390 L230 390 L230 355 L290 340 Q300 250 290 170 Q250 155 200 160 Q150 155 110 170" fill={color} />
    {/* Neck hole */}
    <ellipse cx="200" cy="168" rx="35" ry="18" fill="#00000030" />
    {/* Arm holes */}
    <ellipse cx="115" cy="200" rx="20" ry="35" fill="#00000030" />
    <ellipse cx="285" cy="200" rx="20" ry="35" fill="#00000030" />
    {/* Number */}
    <text x="200" y="290" textAnchor="middle" fontSize="60" fontWeight="bold" fill={secondaryColor} fontFamily="Arial">23</text>
    {/* Side stripes */}
    <rect x="110" y="200" width="12" height="130" fill={secondaryColor} />
    <rect x="278" y="200" width="12" height="130" fill={secondaryColor} />
    {/* Trim */}
    <path d="M165 168 Q200 155 235 168" stroke={secondaryColor} strokeWidth="5" fill="none" />
  </svg>
)

export const HockeyJersey: React.FC<ClothingProps> = ({ color = '#dc2626', secondaryColor = '#ffffff' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Main jersey */}
    <path d="M95 175 L80 340 L170 360 L170 400 L230 400 L230 360 L320 340 L305 175 Q250 155 200 160 Q150 155 95 175" fill={color} />
    {/* Sleeves */}
    <path d="M95 175 L50 250 L70 260 L95 200" fill={color} />
    <path d="M305 175 L350 250 L330 260 L305 200" fill={color} />
    {/* Sleeve stripes */}
    <rect x="50" y="230" width="45" height="10" fill={secondaryColor} />
    <rect x="305" y="230" width="45" height="10" fill={secondaryColor} />
    {/* Body stripes */}
    <rect x="95" y="280" width="210" height="15" fill={secondaryColor} />
    <rect x="95" y="310" width="210" height="8" fill={secondaryColor} />
    {/* Neck */}
    <ellipse cx="200" cy="170" rx="35" ry="15" fill="#00000030" />
    {/* Number */}
    <text x="200" y="260" textAnchor="middle" fontSize="50" fontWeight="bold" fill={secondaryColor} fontFamily="Arial">99</text>
  </svg>
)

export const TuxedoShirt: React.FC<ClothingProps> = ({ color = '#1f2937' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Jacket */}
    <path d="M100 175 Q90 250 100 360 L170 375 L170 410 L230 410 L230 375 L300 360 Q310 250 300 175 Q250 155 200 160 Q150 155 100 175" fill={color} />
    {/* White shirt underneath */}
    <path d="M170 175 L170 360 L230 360 L230 175 Q200 165 170 175" fill="#ffffff" />
    {/* Lapels */}
    <path d="M170 175 L140 200 L160 360 L170 360 Z" fill={color} />
    <path d="M230 175 L260 200 L240 360 L230 360 Z" fill={color} />
    {/* Bow tie */}
    <ellipse cx="200" cy="185" rx="20" ry="8" fill="#000000" />
    <rect x="195" y="180" width="10" height="10" fill="#000000" />
    {/* Buttons */}
    <circle cx="200" cy="250" r="5" fill="#1f2937" stroke="#ffffff30" />
    <circle cx="200" cy="290" r="5" fill="#1f2937" stroke="#ffffff30" />
    <circle cx="200" cy="330" r="5" fill="#1f2937" stroke="#ffffff30" />
    {/* Pocket square */}
    <path d="M120 210 L135 210 L130 230 L115 225 Z" fill="#dc2626" />
  </svg>
)

export const LeatherJacket: React.FC<ClothingProps> = ({ color = '#1c1917' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Main jacket */}
    <path d="M95 175 Q85 250 95 355 L170 370 L170 405 L230 405 L230 370 L305 355 Q315 250 305 175 Q250 155 200 160 Q150 155 95 175" fill={color} />
    {/* Collar */}
    <path d="M150 175 L120 210 L150 200 L170 175" fill={color} stroke="#ffffff15" strokeWidth="2" />
    <path d="M250 175 L280 210 L250 200 L230 175" fill={color} stroke="#ffffff15" strokeWidth="2" />
    {/* Zipper */}
    <line x1="200" y1="180" x2="200" y2="370" stroke="#a8a29e" strokeWidth="4" />
    <rect x="194" y="180" width="12" height="15" fill="#a8a29e" rx="2" />
    {/* Pockets */}
    <path d="M110 260 L160 270 L155 310 L105 300 Z" fill="none" stroke="#ffffff15" strokeWidth="2" />
    <path d="M290 260 L240 270 L245 310 L295 300 Z" fill="none" stroke="#ffffff15" strokeWidth="2" />
    {/* Seam lines */}
    <path d="M150 200 L140 350" stroke="#ffffff10" strokeWidth="2" />
    <path d="M250 200 L260 350" stroke="#ffffff10" strokeWidth="2" />
  </svg>
)

export const SnowsuitTop: React.FC<ClothingProps> = ({ color = '#3b82f6' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Puffy body */}
    <ellipse cx="200" cy="270" rx="100" ry="90" fill={color} />
    {/* Puffy sleeves */}
    <ellipse cx="90" cy="250" rx="35" ry="50" fill={color} />
    <ellipse cx="310" cy="250" rx="35" ry="50" fill={color} />
    {/* Collar */}
    <ellipse cx="200" cy="175" rx="50" ry="25" fill={color} />
    {/* Zipper */}
    <line x1="200" y1="180" x2="200" y2="340" stroke="#fbbf24" strokeWidth="6" />
    <rect x="193" y="178" width="14" height="18" fill="#fbbf24" rx="3" />
    {/* Puff lines */}
    <path d="M120 220 Q200 200 280 220" stroke="#00000015" strokeWidth="3" fill="none" />
    <path d="M115 280 Q200 260 285 280" stroke="#00000015" strokeWidth="3" fill="none" />
    <path d="M120 340 Q200 320 280 340" stroke="#00000015" strokeWidth="3" fill="none" />
    {/* Cuffs */}
    <ellipse cx="70" cy="295" rx="18" ry="12" fill="#1e3a8a" />
    <ellipse cx="330" cy="295" rx="18" ry="12" fill="#1e3a8a" />
  </svg>
)

// ==========================================
// PANTS - Lower body area
// ==========================================

export const JeansPants: React.FC<ClothingProps> = ({ color = '#1e40af' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Waistband */}
    <rect x="140" y="350" width="120" height="20" fill={color} stroke="#00000030" strokeWidth="2" />
    {/* Left leg */}
    <path d="M140 370 L130 480 L175 480 L180 370 Z" fill={color} />
    {/* Right leg */}
    <path d="M220 370 L225 480 L270 480 L260 370 Z" fill={color} />
    {/* Crotch area */}
    <path d="M180 370 L200 420 L220 370" fill={color} />
    {/* Pocket outlines */}
    <path d="M145 375 L145 410 L170 405 L170 375" fill="none" stroke="#00000020" strokeWidth="2" />
    <path d="M255 375 L255 410 L230 405 L230 375" fill="none" stroke="#00000020" strokeWidth="2" />
    {/* Seams */}
    <line x1="152" y1="375" x2="152" y2="475" stroke="#00000015" strokeWidth="2" />
    <line x1="248" y1="375" x2="248" y2="475" stroke="#00000015" strokeWidth="2" />
    {/* Belt loops */}
    <rect x="150" y="350" width="8" height="25" fill={color} stroke="#00000030" />
    <rect x="190" y="350" width="8" height="25" fill={color} stroke="#00000030" />
    <rect x="242" y="350" width="8" height="25" fill={color} stroke="#00000030" />
  </svg>
)

export const Shorts: React.FC<ClothingProps> = ({ color = '#dc2626' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Waistband */}
    <rect x="135" y="350" width="130" height="18" fill={color} stroke="#00000030" strokeWidth="2" />
    <path d="M135 355 Q200 345 265 355" stroke="#ffffff30" strokeWidth="3" fill="none" />
    {/* Left leg */}
    <path d="M135 368 L125 430 L180 430 L185 368 Z" fill={color} />
    {/* Right leg */}
    <path d="M215 368 L220 430 L275 430 L265 368 Z" fill={color} />
    {/* Crotch */}
    <path d="M185 368 L200 400 L215 368" fill={color} />
    {/* Side stripes */}
    <rect x="125" y="380" width="12" height="45" fill="#ffffff" />
    <rect x="263" y="380" width="12" height="45" fill="#ffffff" />
  </svg>
)

export const BasketballShorts: React.FC<ClothingProps> = ({ color = '#7c3aed', secondaryColor = '#fbbf24' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Waistband */}
    <rect x="130" y="348" width="140" height="22" fill={color} />
    <rect x="130" y="348" width="140" height="8" fill={secondaryColor} />
    {/* Left leg */}
    <path d="M130 370 L115 455 L185 455 L190 370 Z" fill={color} />
    {/* Right leg */}
    <path d="M210 370 L215 455 L285 455 L270 370 Z" fill={color} />
    {/* Crotch */}
    <path d="M190 370 L200 420 L210 370" fill={color} />
    {/* Side trim */}
    <path d="M115 380 L115 450" stroke={secondaryColor} strokeWidth="8" />
    <path d="M285 380 L285 450" stroke={secondaryColor} strokeWidth="8" />
    {/* Logo area */}
    <circle cx="150" cy="410" r="15" fill={secondaryColor} />
  </svg>
)

export const SuitPants: React.FC<ClothingProps> = ({ color = '#1f2937' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Waistband */}
    <rect x="138" y="350" width="124" height="18" fill={color} />
    {/* Belt */}
    <rect x="138" y="352" width="124" height="12" fill="#1c1917" />
    <rect x="192" y="350" width="16" height="16" fill="#fbbf24" rx="2" />
    {/* Left leg */}
    <path d="M138 368 L128 485 L172 485 L178 368 Z" fill={color} />
    {/* Right leg */}
    <path d="M222 368 L228 485 L272 485 L262 368 Z" fill={color} />
    {/* Crotch */}
    <path d="M178 368 L200 415 L222 368" fill={color} />
    {/* Creases */}
    <line x1="150" y1="380" x2="150" y2="480" stroke="#ffffff10" strokeWidth="2" />
    <line x1="250" y1="380" x2="250" y2="480" stroke="#ffffff10" strokeWidth="2" />
  </svg>
)

export const SnowPants: React.FC<ClothingProps> = ({ color = '#1e40af' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Puffy waist */}
    <ellipse cx="200" cy="365" rx="70" ry="25" fill={color} />
    {/* Left leg - puffy */}
    <ellipse cx="155" cy="420" rx="35" ry="50" fill={color} />
    <ellipse cx="150" cy="475" rx="30" ry="20" fill={color} />
    {/* Right leg - puffy */}
    <ellipse cx="245" cy="420" rx="35" ry="50" fill={color} />
    <ellipse cx="250" cy="475" rx="30" ry="20" fill={color} />
    {/* Suspender clips */}
    <rect x="155" y="345" width="15" height="20" fill="#fbbf24" rx="3" />
    <rect x="230" y="345" width="15" height="20" fill="#fbbf24" rx="3" />
    {/* Puff lines */}
    <path d="M130 400 Q155 390 180 400" stroke="#00000015" strokeWidth="2" fill="none" />
    <path d="M220 400 Q245 390 270 400" stroke="#00000015" strokeWidth="2" fill="none" />
  </svg>
)

// ==========================================
// SHOES - Feet area  
// ==========================================

export const SneakerShoes: React.FC<ClothingProps> = ({ color = '#ffffff' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Left shoe */}
    <ellipse cx="145" cy="488" rx="35" ry="12" fill={color} />
    <path d="M115 480 Q110 488 115 495 L175 495 Q180 488 175 480 L145 475 Z" fill={color} />
    <path d="M115 485 L175 485" stroke="#00000020" strokeWidth="2" />
    <circle cx="130" cy="480" r="4" fill="#333" />
    <circle cx="145" cy="478" r="4" fill="#333" />
    <circle cx="160" cy="480" r="4" fill="#333" />
    {/* Right shoe */}
    <ellipse cx="255" cy="488" rx="35" ry="12" fill={color} />
    <path d="M225 480 Q220 488 225 495 L285 495 Q290 488 285 480 L255 475 Z" fill={color} />
    <path d="M225 485 L285 485" stroke="#00000020" strokeWidth="2" />
    <circle cx="240" cy="480" r="4" fill="#333" />
    <circle cx="255" cy="478" r="4" fill="#333" />
    <circle cx="270" cy="480" r="4" fill="#333" />
  </svg>
)

export const BootShoes: React.FC<ClothingProps> = ({ color = '#78350f' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Left boot */}
    <path d="M125 450 L120 495 L175 495 L170 450 Z" fill={color} />
    <rect x="120" y="445" width="55" height="15" fill={color} stroke="#00000030" strokeWidth="2" />
    <ellipse cx="147" cy="495" rx="30" ry="8" fill="#1c1917" />
    {/* Right boot */}
    <path d="M230 450 L225 495 L280 495 L275 450 Z" fill={color} />
    <rect x="225" y="445" width="55" height="15" fill={color} stroke="#00000030" strokeWidth="2" />
    <ellipse cx="252" cy="495" rx="30" ry="8" fill="#1c1917" />
    {/* Laces */}
    <path d="M135 455 L160 455 M135 465 L160 465 M135 475 L160 475" stroke="#1c1917" strokeWidth="2" />
    <path d="M240 455 L265 455 M240 465 L265 465 M240 475 L265 475" stroke="#1c1917" strokeWidth="2" />
  </svg>
)

export const DressShoes: React.FC<ClothingProps> = ({ color = '#1c1917' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Left shoe */}
    <ellipse cx="147" cy="490" rx="38" ry="10" fill={color} />
    <path d="M115 482 Q147 475 180 482 L180 490 Q147 497 115 490 Z" fill={color} />
    <path d="M120 486 L175 486" stroke="#ffffff20" strokeWidth="2" />
    {/* Right shoe */}
    <ellipse cx="253" cy="490" rx="38" ry="10" fill={color} />
    <path d="M220 482 Q253 475 285 482 L285 490 Q253 497 220 490 Z" fill={color} />
    <path d="M225 486 L280 486" stroke="#ffffff20" strokeWidth="2" />
  </svg>
)

export const IceSkates: React.FC<ClothingProps> = ({ color = '#ffffff' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Left boot */}
    <path d="M125 455 L120 490 L175 490 L170 455 Z" fill={color} />
    <rect x="122" y="450" width="52" height="12" fill={color} stroke="#00000020" strokeWidth="2" />
    {/* Left blade */}
    <rect x="115" y="492" width="65" height="4" fill="#c0c0c0" rx="2" />
    <rect x="110" y="495" width="75" height="3" fill="#e5e5e5" />
    {/* Right boot */}
    <path d="M225 455 L220 490 L275 490 L270 455 Z" fill={color} />
    <rect x="222" y="450" width="52" height="12" fill={color} stroke="#00000020" strokeWidth="2" />
    {/* Right blade */}
    <rect x="215" y="492" width="65" height="4" fill="#c0c0c0" rx="2" />
    <rect x="210" y="495" width="75" height="3" fill="#e5e5e5" />
    {/* Laces */}
    <path d="M135 460 L155 460 M135 470 L155 470 M135 480 L155 480" stroke="#333" strokeWidth="2" />
    <path d="M235 460 L255 460 M235 470 L255 470 M235 480 L255 480" stroke="#333" strokeWidth="2" />
  </svg>
)

// ==========================================
// ACCESSORIES
// ==========================================

export const Sunglasses: React.FC<ClothingProps> = ({ color = '#1c1917' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Bridge */}
    <path d="M175 142 Q200 138 225 142" stroke={color} strokeWidth="4" fill="none" />
    {/* Left lens */}
    <ellipse cx="155" cy="145" rx="28" ry="20" fill={color} />
    <ellipse cx="155" cy="145" rx="24" ry="16" fill="#00000080" />
    {/* Right lens */}
    <ellipse cx="245" cy="145" rx="28" ry="20" fill={color} />
    <ellipse cx="245" cy="145" rx="24" ry="16" fill="#00000080" />
    {/* Temples (arms) */}
    <path d="M127 142 L100 135" stroke={color} strokeWidth="4" />
    <path d="M273 142 L300 135" stroke={color} strokeWidth="4" />
    {/* Shine */}
    <ellipse cx="145" cy="140" rx="8" ry="5" fill="#ffffff30" />
    <ellipse cx="235" cy="140" rx="8" ry="5" fill="#ffffff30" />
  </svg>
)

export const GoldChain: React.FC<ClothingProps> = ({ color = '#fbbf24' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Chain */}
    <path d="M150 175 Q145 200 160 220 Q200 240 240 220 Q255 200 250 175" 
          stroke={color} strokeWidth="6" fill="none" />
    {/* Chain links effect */}
    <path d="M150 175 Q145 200 160 220 Q200 240 240 220 Q255 200 250 175" 
          stroke="#ffffff40" strokeWidth="2" fill="none" strokeDasharray="8 4" />
    {/* Pendant */}
    <circle cx="200" cy="235" r="15" fill={color} />
    <text x="200" y="241" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#78350f">$</text>
  </svg>
)

export const BowTie: React.FC<ClothingProps> = ({ color = '#dc2626' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Left wing */}
    <ellipse cx="170" cy="178" rx="25" ry="12" fill={color} />
    {/* Right wing */}
    <ellipse cx="230" cy="178" rx="25" ry="12" fill={color} />
    {/* Center knot */}
    <ellipse cx="200" cy="178" rx="10" ry="8" fill={color} stroke="#00000030" strokeWidth="2" />
    {/* Fabric texture */}
    <path d="M150 175 L170 178 L150 181" stroke="#00000020" strokeWidth="1" fill="none" />
    <path d="M250 175 L230 178 L250 181" stroke="#00000020" strokeWidth="1" fill="none" />
  </svg>
)

export const Scarf: React.FC<ClothingProps> = ({ color = '#22c55e' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Wrap around neck */}
    <ellipse cx="200" cy="175" rx="55" ry="22" fill={color} />
    <ellipse cx="200" cy="175" rx="40" ry="12" fill="#00000020" />
    {/* Hanging end */}
    <path d="M160 185 L150 280 L175 285 L180 190" fill={color} />
    {/* Fringe */}
    <line x1="152" y1="280" x2="148" y2="300" stroke={color} strokeWidth="4" />
    <line x1="160" y1="282" x2="158" y2="302" stroke={color} strokeWidth="4" />
    <line x1="168" y1="284" x2="168" y2="304" stroke={color} strokeWidth="4" />
    {/* Stripe pattern */}
    <rect x="152" y="210" width="26" height="8" fill="#ffffff40" />
    <rect x="152" y="240" width="26" height="8" fill="#ffffff40" />
    <rect x="152" y="270" width="26" height="8" fill="#ffffff40" />
  </svg>
)

export const Cape: React.FC<ClothingProps> = ({ color = '#dc2626' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Cape body - behind character */}
    <path d="M130 175 Q80 300 100 450 L200 430 L300 450 Q320 300 270 175 Q200 160 130 175" 
          fill={color} opacity="0.9" />
    {/* Inner shadow */}
    <path d="M150 190 Q110 300 125 420 L200 405 L275 420 Q290 300 250 190" 
          fill="#00000020" />
    {/* Collar */}
    <path d="M140 175 L160 190 L200 185 L240 190 L260 175 Q200 160 140 175" fill={color} />
    {/* Clasp */}
    <circle cx="200" cy="178" r="10" fill="#fbbf24" />
    <circle cx="200" cy="178" r="6" fill="#b45309" />
  </svg>
)

export const Backpack: React.FC<ClothingProps> = ({ color = '#3b82f6' }) => (
  <svg viewBox="0 0 400 500" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Main bag - behind character */}
    <rect x="155" y="200" width="90" height="120" rx="15" fill={color} opacity="0.85" />
    {/* Top flap */}
    <path d="M155 200 Q200 180 245 200 L245 230 Q200 215 155 230 Z" fill={color} />
    {/* Straps (visible parts) */}
    <path d="M165 200 L150 175" stroke={color} strokeWidth="12" strokeLinecap="round" />
    <path d="M235 200 L250 175" stroke={color} strokeWidth="12" strokeLinecap="round" />
    {/* Front pocket */}
    <rect x="170" y="250" width="60" height="50" rx="8" fill="#00000020" />
    {/* Zipper */}
    <line x1="200" y1="255" x2="200" y2="295" stroke="#fbbf24" strokeWidth="3" />
    <circle cx="200" cy="295" r="5" fill="#fbbf24" />
  </svg>
)

// ==========================================
// MAPPING FOR DYNAMIC RENDERING
// ==========================================

export const CLOTHING_COMPONENTS: Record<string, React.FC<ClothingProps>> = {
  // Hats
  'hat_beanie': BeanieHat,
  'hat_santa': SantaHatPNG,  // Using PNG version!
  'hat_cap': BaseballCap,
  'hat_crown': CrownHat,
  'hat_cowboy': CowboyHat,
  'hat_tophat': TopHat,
  'hat_hockey_helmet': HockeyHelmet,
  
  // Shirts
  'shirt_hoodie': HoodieShirt,
  'shirt_basketball': BasketballJersey,
  'shirt_hockey': HockeyJersey,
  'shirt_tuxedo': TuxedoShirt,
  'shirt_leather': LeatherJacket,
  'shirt_snowsuit_top': SnowsuitTop,
  
  // Pants
  'pants_jeans': JeansPants,
  'pants_shorts': Shorts,
  'pants_basketball': BasketballShorts,
  'pants_suit': SuitPants,
  'pants_snowsuit': SnowPants,
  
  // Shoes
  'shoes_sneakers': SneakerShoes,
  'shoes_boots': BootShoes,
  'shoes_dress': DressShoes,
  'shoes_skates': IceSkates,
  
  // Accessories
  'acc_glasses': Sunglasses,
  'acc_necklace': GoldChain,
  'acc_bowtie': BowTie,
  'acc_scarf': Scarf,
  'acc_cape': Cape,
  'acc_backpack': Backpack,
}

export default CLOTHING_COMPONENTS