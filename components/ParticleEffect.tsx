'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  color: string
  rotation: number
  rotationSpeed: number
}

interface ParticleEffectProps {
  trigger: number
  x: number
  y: number
  type?: 'sparkle' | 'stars' | 'confetti'
  count?: number
}

export function ParticleEffect({ trigger, x, y, type = 'sparkle', count = 20 }: ParticleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    if (trigger === 0) return

    const colors = type === 'confetti'
      ? ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F']
      : type === 'stars'
      ? ['#FFD700', '#FFA500', '#FFE4B5', '#FFFF00']
      : ['#FFFFFF', '#E3F2FD', '#BBDEFB', '#90CAF9']

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5)
      const speed = Math.random() * 5 + 2

      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 6 + 2,
        life: 1,
        maxLife: Math.random() * 60 + 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      })
    }
  }, [trigger, x, y, type, count])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()

    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += 0.2
        particle.vx *= 0.99
        particle.life--
        particle.rotation += particle.rotationSpeed

        if (particle.life <= 0) return false

        const alpha = particle.life / particle.maxLife

        ctx.save()
        ctx.translate(particle.x, particle.y)
        ctx.rotate(particle.rotation)
        ctx.globalAlpha = alpha

        if (type === 'sparkle') {
          ctx.fillStyle = particle.color
          ctx.beginPath()
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = '#FFFFFF'
          ctx.beginPath()
          ctx.arc(0, 0, particle.size * 0.5, 0, Math.PI * 2)
          ctx.fill()
        } else if (type === 'stars') {
          ctx.fillStyle = particle.color
          ctx.beginPath()
          for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
            const x = Math.cos(angle) * particle.size
            const y = Math.sin(angle) * particle.size
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)

            const innerAngle = angle + Math.PI / 5
            const innerX = Math.cos(innerAngle) * particle.size * 0.5
            const innerY = Math.sin(innerAngle) * particle.size * 0.5
            ctx.lineTo(innerX, innerY)
          }
          ctx.closePath()
          ctx.fill()
        } else {
          ctx.fillStyle = particle.color
          ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
        }

        ctx.restore()

        return true
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [type])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
    />
  )
}
