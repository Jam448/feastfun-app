'use client'

import { useEffect, useState, useCallback } from 'react'

interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  drift: number
  size: number
}

interface ConfettiProps {
  trigger: boolean
  duration?: number
  pieceCount?: number
  colors?: string[]
}

const DEFAULT_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E9', // Light Blue
  '#F8B500', // Gold
  '#FF69B4', // Pink
]

export function Confetti({
  trigger,
  duration = 3000,
  pieceCount = 50,
  colors = DEFAULT_COLORS,
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  const [isActive, setIsActive] = useState(false)

  const generatePieces = useCallback(() => {
    const newPieces: ConfettiPiece[] = []
    for (let i = 0; i < pieceCount; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100, // percentage across screen
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5, // stagger start
        drift: (Math.random() - 0.5) * 200, // horizontal drift
        size: Math.random() * 8 + 6, // 6-14px
      })
    }
    return newPieces
  }, [pieceCount, colors])

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true)
      setPieces(generatePieces())

      // Clean up after animation completes
      const timer = setTimeout(() => {
        setIsActive(false)
        setPieces([])
      }, duration + 500)

      return () => clearTimeout(timer)
    }
  }, [trigger, isActive, generatePieces, duration])

  if (!isActive || pieces.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            width: piece.size,
            height: piece.size * 0.6,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${duration / 1000}s`,
            '--confetti-drift': `${piece.drift}px`,
            borderRadius: '2px',
            transform: `rotate(${Math.random() * 360}deg)`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

// Simplified star burst for special moments
export function StarBurst({ 
  trigger, 
  x, 
  y,
  count = 8,
}: { 
  trigger: boolean
  x: number
  y: number
  count?: number
}) {
  const [stars, setStars] = useState<Array<{ id: number; angle: number; delay: number }>>([])
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true)
      const newStars = Array.from({ length: count }, (_, i) => ({
        id: i,
        angle: (360 / count) * i,
        delay: i * 0.05,
      }))
      setStars(newStars)

      const timer = setTimeout(() => {
        setIsActive(false)
        setStars([])
      }, 600)

      return () => clearTimeout(timer)
    }
  }, [trigger, isActive, count])

  if (!isActive) return null

  return (
    <div 
      className="fixed pointer-events-none z-50"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          style={{
            animation: `star-burst 0.5s ease-out forwards`,
            animationDelay: `${star.delay}s`,
            transform: `rotate(${star.angle}deg) translateX(0)`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes star-burst {
          0% {
            transform: rotate(var(--angle)) translateX(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: rotate(var(--angle)) translateX(60px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
