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
  })

  const dash = useCallback(() => {
    const now = Date.now()
    const state = gameStateRef.current

    if (now - state.lastDash < state.dashCooldown || state.stunned) return

    const dx = state.targetX - state.playerX
    const dy = state.targetY - state.playerY
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > 10) {
      const dashDistance = 80
      const normalizedDx = dx / distance
      const normalizedDy = dy / distance

      state.playerX += normalizedDx * dashDistance
      state.playerY += normalizedDy * dashDistance

      state.playerX = Math.max(30, Math.min(state.playerX, 375 - 30))
      state.playerY = Math.max(30, Math.min(state.playerY, 667 - 30))

      state.isDashing = true
      state.dashesUsed++
      state.lastDash = now
      triggerHaptic('medium')

      setTimeout(() => {
        gameStateRef.current.isDashing = false
      }, 150)
    }
  }, [triggerHaptic])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 375
    canvas.height = 667

    const state = gameStateRef.current
    state.playerX = canvas.width / 2
    state.playerY = canvas.height / 2
    state.targetX = state.playerX
    state.targetY = state.playerY

    const pocketsImage = new Image()
    pocketsImage.src = '/image copy copy.png'
    let imageLoaded = false
    pocketsImage.onload = () => {
      imageLoaded = true
    }
    pocketsImage.crossOrigin = 'anonymous'

    let animationId: number
    let startTime = Date.now()

    const handlePointer = (e: Event) => {
      e.preventDefault()
      state.isMouseDown = true

      const rect = canvas.getBoundingClientRect()
      const pe = e as PointerEvent | TouchEvent
      const touch = 'touches' in pe ? pe.touches[0] : pe as PointerEvent
      state.targetX = (touch.clientX - rect.left) * (canvas.width / rect.width)
      state.targetY = (touch.clientY - rect.top) * (canvas.height / rect.height)
    }

    const handleMove = (e: Event) => {
      if (!state.isMouseDown) return
      e.preventDefault()

      const rect = canvas.getBoundingClientRect()
      const pe = e as PointerEvent | TouchEvent
      const touch = 'touches' in pe ? pe.touches[0] : pe as PointerEvent
      state.targetX = (touch.clientX - rect.left) * (canvas.width / rect.width)
      state.targetY = (touch.clientY - rect.top) * (canvas.height / rect.height)
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

      const difficultyMultiplier = 1 + (elapsed / 60) * 0.5

      if (rand < 0.08) {
        type = 'golden'
        size = 20
        const goldenItem = ARCADE_ITEMS.goldenFoods[Math.floor(Math.random() * ARCADE_ITEMS.goldenFoods.length)]
        emoji = goldenItem.emoji
        color = goldenItem.color
      } else if (rand < 0.30 + (elapsed / 120)) {
        type = 'hazard'
        size = 18
        const hazardItem = ARCADE_ITEMS.hazards[Math.floor(Math.random() * availableHazardCount)]
        emoji = hazardItem.emoji
        color = hazardItem.color
      } else {
        type = 'good'
        size = 16
        const goodItem = ARCADE_ITEMS.goodFoods[Math.floor(Math.random() * availableGoodCount)]
        emoji = goodItem.emoji
        color = goodItem.color
      }

      const side = Math.floor(Math.random() * 4)
      let x, y, vx, vy

      const baseSpeed = 2.5 * difficultyMultiplier
      const speedVariation = 1.5 * difficultyMultiplier

      switch (side) {
        case 0:
          x = Math.random() * canvas.width
          y = -40
          vx = (Math.random() - 0.5) * speedVariation * 1.5
          vy = baseSpeed + Math.random() * speedVariation
          break
        case 1:
          x = canvas.width + 40
          y = Math.random() * canvas.height
          vx = -(baseSpeed + Math.random() * speedVariation)
          vy = (Math.random() - 0.5) * speedVariation * 1.5
          break
        case 2:
          x = Math.random() * canvas.width
          y = canvas.height + 40
          vx = (Math.random() - 0.5) * speedVariation * 1.5
          vy = -(baseSpeed + Math.random() * speedVariation)
          break
        default:
          x = -40
          y = Math.random() * canvas.height
          vx = baseSpeed + Math.random() * speedVariation
          vy = (Math.random() - 0.5) * speedVariation * 1.5
      }

      if (type === 'hazard') {
        vx *= 1.2
        vy *= 1.2
      } else if (type === 'golden') {
        vx *= 0.8
        vy *= 0.8
      }

      state.objects.push({ x, y, vx, vy, type, size, emoji, color })
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

      const spawnInterval = Math.max(400, 800 - (elapsed * 8))
      if (now - state.lastSpawn > spawnInterval) {
        spawnObject()
        state.lastSpawn = now
      }

      if (state.stunned && now > state.stunnedUntil) {
        state.stunned = false
      }

      if (state.isMunching && now > state.munchEndTime) {
        state.isMunching = false
      }

      if (!state.stunned && state.isMouseDown) {
        const dx = state.targetX - state.playerX
        const dy = state.targetY - state.playerY
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 3) {
          const speed = Math.min(8, distance * 0.15)
          state.playerX += (dx / distance) * speed
          state.playerY += (dy / distance) * speed
        }
      }

      const playerRadius = 30
      state.playerX = Math.max(playerRadius, Math.min(state.playerX, canvas.width - playerRadius))
      state.playerY = Math.max(playerRadius, Math.min(state.playerY, canvas.height - playerRadius))

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#1e3a8a')
      gradient.addColorStop(0.5, '#7c3aed')
      gradient.addColorStop(1, '#c026d3')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let index = state.objects.length - 1; index >= 0; index--) {
        const obj = state.objects[index]
        obj.x += obj.vx
        obj.y += obj.vy

        if (obj.x < -60 || obj.x > canvas.width + 60 || obj.y < -60 || obj.y > canvas.height + 60) {
          state.objects.splice(index, 1)
          continue
        }

        const dx = obj.x - state.playerX
        const dy = obj.y - state.playerY
        const dist = Math.sqrt(dx * dx + dy * dy)

        const collisionRadius = obj.type === 'golden' ? 35 :
                               obj.type === 'hazard' ? 30 : 32

        if (dist < collisionRadius && !state.isDashing) {
          state.objects.splice(index, 1)

          if (obj.type === 'good') {
            state.goodBites++
            state.comboStreak++
            if (state.comboStreak >= 5) {
              state.combo = Math.min(5, Math.floor(state.comboStreak / 5) + 1)
              state.maxCombo = Math.max(state.maxCombo, state.combo)
            }
            state.score += 10 * state.combo
            state.isMunching = true
            state.munchEndTime = now + 150
            soundManager.playMunch()
            triggerHaptic('light')
          } else if (obj.type === 'golden') {
            state.goldenBites++
            state.score += 50 * state.combo
            state.isMunching = true
            state.munchEndTime = now + 150
            soundManager.playMunch()
            triggerHaptic('heavy')
          } else if (obj.type === 'hazard') {
            state.hazardsHit++
            state.comboStreak = 0
            state.combo = 1
            state.stunned = true
            state.stunnedUntil = now + 500
            soundManager.playYuck()
            triggerHaptic('heavy')
          }

          setScore(state.score)
          setCombo(state.combo)
          continue
        }

        ctx.save()

        if (obj.type === 'golden') {
          ctx.shadowColor = obj.color
          ctx.shadowBlur = 12
        }

        ctx.font = `${obj.size * 2.2}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(obj.emoji, obj.x, obj.y)

        ctx.restore()
      }

      if (imageLoaded) {
        const baseSize = 55
        const playerSize = state.isDashing ? baseSize * 1.15 : baseSize
        const munchScale = state.isMunching ? 1.1 : 1.0
        const finalSize = playerSize * munchScale

        ctx.save()
        ctx.imageSmoothingEnabled = false

        if (state.stunned) {
          ctx.globalAlpha = 0.5
          ctx.filter = 'grayscale(100%) brightness(0.8)'
        } else if (state.isDashing) {
          ctx.shadowColor = '#a855f7'
          ctx.shadowBlur = 25
        }

        if (state.isMunching) {
          ctx.shadowColor = '#fbbf24'
          ctx.shadowBlur = 15
        }

        ctx.drawImage(
          pocketsImage,
          state.playerX - finalSize / 2,
          state.playerY - finalSize / 2,
          finalSize,
          finalSize
        )
        ctx.restore()
      } else {
        ctx.beginPath()
        ctx.arc(state.playerX, state.playerY, state.isDashing ? 30 : 25, 0, Math.PI * 2)
        ctx.fillStyle = state.stunned ? '#gray' : (state.isDashing ? '#a855f7' : playerColor)
        ctx.fill()
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 3
        ctx.stroke()
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
    <div className="relative w-full h-full">
      <GameHUD
        timeLeft={timeLeft}
        score={score}
        combo={combo}
        dashCooldown={dashCooldown}
      />

      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none"
        style={{ touchAction: 'none' }}
      />

      <div className="fixed bottom-24 left-0 right-0 text-center z-10 pointer-events-none">
        <div className="glass px-6 py-3 rounded-full inline-block card-elevated">
          <p className="text-white font-medium">Hold to move • Tap to dash</p>
        </div>
      </div>
    </div>
  )
}
