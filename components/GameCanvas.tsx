'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ARCADE_ITEMS } from '@/lib/game-config'
import { GameHUD } from './GameHUD'
import { soundManager } from '@/lib/sound-manager'

interface GameCanvasProps {
  onGameEnd: (results: GameResults) => void
  playerColor: string
  triggerHaptic: (intensity: 'light' | 'medium' | 'heavy') => void
}

export interface GameResults {
  score: number
  goodBites: number
  goldenBites: number
  hazardsHit: number
  maxCombo: number
  dashesUsed: number
  survivalTime: number
}

interface GameObject {
  x: number
  y: number
  vx: number
  vy: number
  type: 'good' | 'golden' | 'hazard'
  size: number
  emoji: string
  color: string
  rotation: number
  rotationSpeed: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
  type: 'sparkle' | 'crumb' | 'star'
}

export function GameCanvas({ onGameEnd, playerColor, triggerHaptic }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(1)
  const [dashCooldown, setDashCooldown] = useState(0)
  const router = useRouter()

  const gameStateRef = useRef({
    playerX: 0,
    playerY: 0,
    targetX: 0,
    targetY: 0,
    objects: [] as GameObject[],
    particles: [] as Particle[],
    score: 0,
    combo: 1,
    comboStreak: 0,
    maxCombo: 1,
    goodBites: 0,
    goldenBites: 0,
    hazardsHit: 0,
    dashesUsed: 0,
    lastDash: 0,
    isDashing: false,
    dashCooldown: 3000,
    stunned: false,
    stunnedUntil: 0,
    gameTime: 0,
    lastSpawn: 0,
    isMouseDown: false,
    isMunching: false,
    munchEndTime: 0,
    playerAngle: 0,
    trailPoints: [] as { x: number; y: number; alpha: number }[],
  })

  const spawnParticles = (x: number, y: number, type: 'good' | 'golden' | 'hazard', count: number = 8) => {
    const state = gameStateRef.current
    const colors = type === 'golden' 
      ? ['#fbbf24', '#f59e0b', '#fcd34d', '#ffffff']
      : type === 'good'
      ? ['#34d399', '#10b981', '#6ee7b7', '#ffffff']
      : ['#ef4444', '#dc2626', '#f87171', '#7f1d1d']

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const speed = 3 + Math.random() * 4
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.5 + Math.random() * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 6,
        type: type === 'golden' ? 'star' : 'sparkle',
      })
    }
  }

  const dash = useCallback(() => {
    const now = Date.now()
    const state = gameStateRef.current

    if (now - state.lastDash < state.dashCooldown || state.stunned) return

    const dx = state.targetX - state.playerX
    const dy = state.targetY - state.playerY
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > 10) {
      const dashDistance = 100
      const normalizedDx = dx / distance
      const normalizedDy = dy / distance

      // Add trail effect
      for (let i = 0; i < 5; i++) {
        state.trailPoints.push({
          x: state.playerX + normalizedDx * (i * 15),
          y: state.playerY + normalizedDy * (i * 15),
          alpha: 0.6 - i * 0.1,
        })
      }

      state.playerX += normalizedDx * dashDistance
      state.playerY += normalizedDy * dashDistance

      state.playerX = Math.max(30, Math.min(state.playerX, 375 - 30))
      state.playerY = Math.max(30, Math.min(state.playerY, 667 - 30))

      state.isDashing = true
      state.dashesUsed++
      state.lastDash = now
      triggerHaptic('medium')
      soundManager.playMatch()

      setTimeout(() => {
        gameStateRef.current.isDashing = false
      }, 200)
    }
  }, [triggerHaptic])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size for mobile
    const dpr = window.devicePixelRatio || 1
    canvas.width = 375 * dpr
    canvas.height = 667 * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = '375px'
    canvas.style.height = '667px'

    const state = gameStateRef.current
    state.playerX = 375 / 2
    state.playerY = 667 / 2
    state.targetX = state.playerX
    state.targetY = state.playerY

    // Load Pockets image - CORRECT PATH
    const pocketsImage = new Image()
    pocketsImage.src = '/santa_pockets.png'
    let imageLoaded = false
    pocketsImage.onload = () => {
      imageLoaded = true
      console.log('Pockets image loaded!')
    }
    pocketsImage.onerror = () => {
      console.error('Failed to load Pockets image')
    }

    let animationId: number
    let startTime = Date.now()

    const handlePointer = (e: Event) => {
      e.preventDefault()
      state.isMouseDown = true

      const rect = canvas.getBoundingClientRect()
      const pe = e as PointerEvent | TouchEvent
      const touch = 'touches' in pe ? pe.touches[0] : pe as PointerEvent
      state.targetX = (touch.clientX - rect.left) * (375 / rect.width)
      state.targetY = (touch.clientY - rect.top) * (667 / rect.height)
    }

    const handleMove = (e: Event) => {
      if (!state.isMouseDown) return
      e.preventDefault()

      const rect = canvas.getBoundingClientRect()
      const pe = e as PointerEvent | TouchEvent
      const touch = 'touches' in pe ? pe.touches[0] : pe as PointerEvent
      state.targetX = (touch.clientX - rect.left) * (375 / rect.width)
      state.targetY = (touch.clientY - rect.top) * (667 / rect.height)
    }

    const handleUp = (e: Event) => {
      e.preventDefault()
      state.isMouseDown = false
    }

    const handleTap = (e: Event) => {
      e.preventDefault()
      dash()
    }

    canvas.addEventListener('pointerdown', handlePointer)
    canvas.addEventListener('pointermove', handleMove)
    canvas.addEventListener('pointerup', handleUp)
    canvas.addEventListener('click', handleTap)
    canvas.addEventListener('touchstart', handlePointer, { passive: false })
    canvas.addEventListener('touchmove', handleMove, { passive: false })
    canvas.addEventListener('touchend', handleUp, { passive: false })

    const spawnObject = () => {
      const elapsed = state.gameTime
      const rand = Math.random()
      let type: 'good' | 'golden' | 'hazard'
      let size: number
      let emoji: string
      let color: string

      const availableGoodCount = Math.min(6, Math.floor(elapsed / 8) + 2)
      const availableHazardCount = Math.min(4, Math.floor(elapsed / 12) + 1)
      const difficultyMultiplier = 1 + (elapsed / 60) * 0.6

      if (rand < 0.08) {
        type = 'golden'
        size = 22
        const goldenItem = ARCADE_ITEMS.goldenFoods[Math.floor(Math.random() * ARCADE_ITEMS.goldenFoods.length)]
        emoji = goldenItem.emoji
        color = goldenItem.color
      } else if (rand < 0.28 + (elapsed / 150)) {
        type = 'hazard'
        size = 20
        const hazardItem = ARCADE_ITEMS.hazards[Math.floor(Math.random() * availableHazardCount)]
        emoji = hazardItem.emoji
        color = hazardItem.color
      } else {
        type = 'good'
        size = 18
        const goodItem = ARCADE_ITEMS.goodFoods[Math.floor(Math.random() * availableGoodCount)]
        emoji = goodItem.emoji
        color = goodItem.color
      }

      const side = Math.floor(Math.random() * 4)
      let x, y, vx, vy

      const baseSpeed = 2.2 * difficultyMultiplier
      const speedVariation = 1.8 * difficultyMultiplier

      switch (side) {
        case 0:
          x = Math.random() * 375
          y = -50
          vx = (Math.random() - 0.5) * speedVariation * 1.5
          vy = baseSpeed + Math.random() * speedVariation
          break
        case 1:
          x = 375 + 50
          y = Math.random() * 667
          vx = -(baseSpeed + Math.random() * speedVariation)
          vy = (Math.random() - 0.5) * speedVariation * 1.5
          break
        case 2:
          x = Math.random() * 375
          y = 667 + 50
          vx = (Math.random() - 0.5) * speedVariation * 1.5
          vy = -(baseSpeed + Math.random() * speedVariation)
          break
        default:
          x = -50
          y = Math.random() * 667
          vx = baseSpeed + Math.random() * speedVariation
          vy = (Math.random() - 0.5) * speedVariation * 1.5
      }

      if (type === 'hazard') {
        vx *= 1.3
        vy *= 1.3
      } else if (type === 'golden') {
        vx *= 0.7
        vy *= 0.7
      }

      const rotation = Math.random() * Math.PI * 2
      const rotationSpeed = (Math.random() - 0.5) * 0.1

      state.objects.push({ x, y, vx, vy, type, size, emoji, color, rotation, rotationSpeed })
    }

    const gameLoop = () => {
      const now = Date.now()
      const elapsed = (now - startTime) / 1000
      const timeRemaining = Math.max(0, 60 - elapsed)

      state.gameTime = elapsed
      setTimeLeft(Math.ceil(timeRemaining))

      const dashCooldownRemaining = Math.max(0, state.dashCooldown - (now - state.lastDash))
      setDashCooldown(dashCooldownRemaining)

      if (timeRemaining <= 0) {
        soundManager.playWin()
        const results: GameResults = {
          score: state.score,
          goodBites: state.goodBites,
          goldenBites: state.goldenBites,
          hazardsHit: state.hazardsHit,
          maxCombo: state.maxCombo,
          dashesUsed: state.dashesUsed,
          survivalTime: 60,
        }
        onGameEnd(results)
        return
      }

      // Spawn objects
      const spawnInterval = Math.max(350, 750 - (elapsed * 6))
      if (now - state.lastSpawn > spawnInterval) {
        spawnObject()
        state.lastSpawn = now
      }

      // Update stunned state
      if (state.stunned && now > state.stunnedUntil) {
        state.stunned = false
      }

      if (state.isMunching && now > state.munchEndTime) {
        state.isMunching = false
      }

      // Move player
      if (!state.stunned && state.isMouseDown) {
        const dx = state.targetX - state.playerX
        const dy = state.targetY - state.playerY
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 3) {
          const speed = Math.min(7, distance * 0.12)
          state.playerX += (dx / distance) * speed
          state.playerY += (dy / distance) * speed
          state.playerAngle = Math.atan2(dy, dx)
        }
      }

      // Clamp player position
      const playerRadius = 30
      state.playerX = Math.max(playerRadius, Math.min(state.playerX, 375 - playerRadius))
      state.playerY = Math.max(playerRadius, Math.min(state.playerY, 667 - playerRadius))

      // Clear and draw background
      const gradient = ctx.createLinearGradient(0, 0, 0, 667)
      gradient.addColorStop(0, '#1e1b4b')
      gradient.addColorStop(0.3, '#312e81')
      gradient.addColorStop(0.7, '#4c1d95')
      gradient.addColorStop(1, '#701a75')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 375, 667)

      // Draw subtle grid pattern
      ctx.strokeStyle = 'rgba(255,255,255,0.03)'
      ctx.lineWidth = 1
      for (let i = 0; i < 375; i += 40) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, 667)
        ctx.stroke()
      }
      for (let i = 0; i < 667; i += 40) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(375, i)
        ctx.stroke()
      }

      // Update and draw particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.2 // gravity
        p.life -= 1 / 60 / p.maxLife

        if (p.life <= 0) {
          state.particles.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        
        if (p.type === 'star') {
          // Draw star shape
          ctx.beginPath()
          for (let j = 0; j < 5; j++) {
            const angle = (j * Math.PI * 2) / 5 - Math.PI / 2
            const r = j % 2 === 0 ? p.size : p.size / 2
            if (j === 0) ctx.moveTo(p.x + Math.cos(angle) * r, p.y + Math.sin(angle) * r)
            else ctx.lineTo(p.x + Math.cos(angle) * r, p.y + Math.sin(angle) * r)
          }
          ctx.closePath()
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }

      // Update trail points
      for (let i = state.trailPoints.length - 1; i >= 0; i--) {
        state.trailPoints[i].alpha -= 0.05
        if (state.trailPoints[i].alpha <= 0) {
          state.trailPoints.splice(i, 1)
        }
      }

      // Draw trail
      state.trailPoints.forEach(point => {
        ctx.save()
        ctx.globalAlpha = point.alpha
        ctx.fillStyle = '#a855f7'
        ctx.beginPath()
        ctx.arc(point.x, point.y, 15, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // Update and draw objects
      for (let index = state.objects.length - 1; index >= 0; index--) {
        const obj = state.objects[index]
        obj.x += obj.vx
        obj.y += obj.vy
        obj.rotation += obj.rotationSpeed

        if (obj.x < -70 || obj.x > 375 + 70 || obj.y < -70 || obj.y > 667 + 70) {
          state.objects.splice(index, 1)
          continue
        }

        const dx = obj.x - state.playerX
        const dy = obj.y - state.playerY
        const dist = Math.sqrt(dx * dx + dy * dy)

        const collisionRadius = obj.type === 'golden' ? 38 :
                               obj.type === 'hazard' ? 32 : 35

        if (dist < collisionRadius && !state.isDashing) {
          state.objects.splice(index, 1)
          spawnParticles(obj.x, obj.y, obj.type, obj.type === 'golden' ? 15 : 10)

          if (obj.type === 'good') {
            state.goodBites++
            state.comboStreak++
            if (state.comboStreak >= 3) {
              state.combo = Math.min(5, Math.floor(state.comboStreak / 3) + 1)
              state.maxCombo = Math.max(state.maxCombo, state.combo)
            }
            state.score += 10 * state.combo
            state.isMunching = true
            state.munchEndTime = now + 150
            soundManager.playMunch()
            triggerHaptic('light')
          } else if (obj.type === 'golden') {
            state.goldenBites++
            state.comboStreak += 3
            state.combo = Math.min(5, Math.floor(state.comboStreak / 3) + 1)
            state.maxCombo = Math.max(state.maxCombo, state.combo)
            state.score += 50 * state.combo
            state.isMunching = true
            state.munchEndTime = now + 200
            soundManager.playMunch()
            soundManager.playCombo(state.combo)
            triggerHaptic('heavy')
          } else if (obj.type === 'hazard') {
            state.hazardsHit++
            state.comboStreak = 0
            state.combo = 1
            state.stunned = true
            state.stunnedUntil = now + 600
            soundManager.playYuck()
            triggerHaptic('heavy')
          }

          setScore(state.score)
          setCombo(state.combo)
          continue
        }

        // Draw object with glow and rotation
        ctx.save()
        ctx.translate(obj.x, obj.y)
        ctx.rotate(obj.rotation)

        if (obj.type === 'golden') {
          ctx.shadowColor = '#fbbf24'
          ctx.shadowBlur = 20
        } else if (obj.type === 'hazard') {
          ctx.shadowColor = '#ef4444'
          ctx.shadowBlur = 10
        } else {
          ctx.shadowColor = '#34d399'
          ctx.shadowBlur = 8
        }

        ctx.font = `${obj.size * 2.5}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(obj.emoji, 0, 0)

        ctx.restore()
      }

      // Draw Pockets
      if (imageLoaded) {
        const baseSize = 60
        const munchScale = state.isMunching ? 1.15 : 1.0
        const dashScale = state.isDashing ? 1.2 : 1.0
        const stunnedScale = state.stunned ? 0.9 : 1.0
        const finalSize = baseSize * munchScale * dashScale * stunnedScale

        ctx.save()

        if (state.stunned) {
          ctx.globalAlpha = 0.5 + Math.sin(now / 50) * 0.2
          ctx.filter = 'hue-rotate(180deg) saturate(0.5)'
        } else if (state.isDashing) {
          ctx.shadowColor = '#a855f7'
          ctx.shadowBlur = 30
        } else if (state.isMunching) {
          ctx.shadowColor = '#fbbf24'
          ctx.shadowBlur = 20
        }

        // Slight rotation based on movement
        const targetRotation = state.isMouseDown ? Math.sin(now / 100) * 0.1 : 0
        ctx.translate(state.playerX, state.playerY)
        ctx.rotate(targetRotation)

        ctx.drawImage(
          pocketsImage,
          -finalSize / 2,
          -finalSize / 2,
          finalSize,
          finalSize
        )
        ctx.restore()
      } else {
        // Fallback circle with better styling
        ctx.save()
        const size = state.isDashing ? 35 : 30
        
        // Outer glow
        ctx.shadowColor = state.stunned ? '#ef4444' : '#a855f7'
        ctx.shadowBlur = 20
        
        ctx.beginPath()
        ctx.arc(state.playerX, state.playerY, size, 0, Math.PI * 2)
        
        const playerGradient = ctx.createRadialGradient(
          state.playerX, state.playerY, 0,
          state.playerX, state.playerY, size
        )
        playerGradient.addColorStop(0, state.stunned ? '#fca5a5' : '#c4b5fd')
        playerGradient.addColorStop(1, state.stunned ? '#ef4444' : '#7c3aed')
        ctx.fillStyle = playerGradient
        ctx.fill()
        
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 3
        ctx.stroke()
        ctx.restore()
      }

      animationId = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      cancelAnimationFrame(animationId)
      canvas.removeEventListener('pointerdown', handlePointer)
      canvas.removeEventListener('pointermove', handleMove)
      canvas.removeEventListener('pointerup', handleUp)
      canvas.removeEventListener('click', handleTap)
      canvas.removeEventListener('touchstart', handlePointer)
      canvas.removeEventListener('touchmove', handleMove)
      canvas.removeEventListener('touchend', handleUp)
    }
  }, [onGameEnd, playerColor, triggerHaptic, dash])

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative">
        <GameHUD
          timeLeft={timeLeft}
          score={score}
          combo={combo}
          dashCooldown={dashCooldown}
        />

        <canvas
          ref={canvasRef}
          className="rounded-2xl shadow-2xl border-4 border-white/20"
          style={{ 
            width: '375px', 
            height: '667px',
            touchAction: 'none',
            maxHeight: '85vh',
            maxWidth: '95vw',
          }}
        />

        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
          <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
            <p className="text-white/90 font-medium text-sm">Hold to move • Tap to dash</p>
          </div>
        </div>
      </div>
    </div>
  )
}