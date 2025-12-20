'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { soundManager } from '@/lib/sound-manager'

interface RunnerGameProps {
  onGameEnd: (results: RunnerResults) => void
  triggerHaptic: (intensity: 'light' | 'medium' | 'heavy') => void
}

export interface RunnerResults {
  score: number
  distance: number
  treatsCollected: number
  obstaclesAvoided: number
  maxSpeed: number
}

type Lane = 0 | 1 | 2 // Left, Middle, Right

interface GameObject {
  id: string
  lane: Lane
  y: number
  type: 'treat' | 'obstacle' | 'golden'
  emoji: string
  width: number
  height: number
  collected?: boolean
}

const TREATS = [
  { emoji: '🍪', points: 10 },
  { emoji: '🍰', points: 15 },
  { emoji: '🧁', points: 12 },
  { emoji: '🍩', points: 10 },
  { emoji: '🍫', points: 12 },
  { emoji: '🍬', points: 8 },
  { emoji: '🎂', points: 20 },
  { emoji: '🍭', points: 8 },
]

const GOLDEN_TREATS = [
  { emoji: '⭐', points: 50 },
  { emoji: '💎', points: 75 },
  { emoji: '🌟', points: 100 },
]

const OBSTACLES = [
  { emoji: '🐕', name: 'Dog' },
  { emoji: '🕳️', name: 'Pothole' },
  { emoji: '👵🧹', name: 'Old Lady' },
  { emoji: '🚧', name: 'Barrier' },
  { emoji: '🗑️', name: 'Trash Can' },
  { emoji: '🛒', name: 'Shopping Cart' },
]

const LANE_POSITIONS = [62, 187, 312] // X positions for 3 lanes in 375px width
const LANE_WIDTH = 100

export function RunnerGame({ onGameEnd, triggerHaptic }: RunnerGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [distance, setDistance] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)

  const gameStateRef = useRef({
    playerLane: 1 as Lane,
    targetLane: 1 as Lane,
    playerX: LANE_POSITIONS[1],
    playerY: 550,
    isJumping: false,
    jumpVelocity: 0,
    isSliding: false,
    slideEndTime: 0,
    objects: [] as GameObject[],
    score: 0,
    distance: 0,
    treatsCollected: 0,
    obstaclesAvoided: 0,
    speed: 5,
    maxSpeed: 5,
    lastSpawnTime: 0,
    spawnInterval: 1500,
    groundOffset: 0,
    gameTime: 0,
    isInvincible: false,
    invincibleUntil: 0,
    combo: 1,
    lastTreatTime: 0,
  })

  // Touch/swipe handling
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)

  const switchLane = useCallback((direction: 'left' | 'right') => {
    const state = gameStateRef.current
    if (direction === 'left' && state.targetLane > 0) {
      state.targetLane = (state.targetLane - 1) as Lane
      triggerHaptic('light')
    } else if (direction === 'right' && state.targetLane < 2) {
      state.targetLane = (state.targetLane + 1) as Lane
      triggerHaptic('light')
    }
  }, [triggerHaptic])

  const jump = useCallback(() => {
    const state = gameStateRef.current
    if (!state.isJumping && !state.isSliding) {
      state.isJumping = true
      state.jumpVelocity = -18
      triggerHaptic('medium')
      soundManager.playClick()
    }
  }, [triggerHaptic])

  const slide = useCallback(() => {
    const state = gameStateRef.current
    if (!state.isJumping && !state.isSliding) {
      state.isSliding = true
      state.slideEndTime = Date.now() + 500
      triggerHaptic('light')
    }
  }, [triggerHaptic])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const dpr = window.devicePixelRatio || 1
    canvas.width = 375 * dpr
    canvas.height = 667 * dpr
    ctx.scale(dpr, dpr)

    const state = gameStateRef.current
    state.playerX = LANE_POSITIONS[1]

    // Load Pockets image
    const pocketsImg = new Image()
    pocketsImg.src = '/santa_pockets.png'
    let pocketsLoaded = false
    pocketsImg.onload = () => { pocketsLoaded = true }

    let animationId: number
    const startTime = Date.now()

    // Input handlers
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      if (!touchStartRef.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const deltaTime = Date.now() - touchStartRef.current.time

      const minSwipeDistance = 30
      const maxSwipeTime = 300

      if (deltaTime < maxSwipeTime) {
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
          // Horizontal swipe
          if (deltaX > 0) {
            switchLane('right')
          } else {
            switchLane('left')
          }
        } else if (Math.abs(deltaY) > minSwipeDistance) {
          // Vertical swipe
          if (deltaY < 0) {
            jump()
          } else {
            slide()
          }
        }
      }

      touchStartRef.current = null
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          switchLane('left')
          break
        case 'ArrowRight':
        case 'd':
          switchLane('right')
          break
        case 'ArrowUp':
        case 'w':
        case ' ':
          jump()
          break
        case 'ArrowDown':
        case 's':
          slide()
          break
      }
    }

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false })
    window.addEventListener('keydown', handleKeyDown)

    // Spawn objects
    const spawnObject = () => {
      const now = Date.now()
      const elapsed = state.gameTime

      // Determine what to spawn
      const rand = Math.random()
      const lane = Math.floor(Math.random() * 3) as Lane

      let obj: GameObject

      if (rand < 0.05) {
        // 5% golden treat
        const golden = GOLDEN_TREATS[Math.floor(Math.random() * GOLDEN_TREATS.length)]
        obj = {
          id: `${now}-${Math.random()}`,
          lane,
          y: -60,
          type: 'golden',
          emoji: golden.emoji,
          width: 50,
          height: 50,
        }
      } else if (rand < 0.35 + (elapsed / 200)) {
        // Increasing obstacle chance over time
        const obstacle = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)]
        obj = {
          id: `${now}-${Math.random()}`,
          lane,
          y: -60,
          type: 'obstacle',
          emoji: obstacle.emoji,
          width: 60,
          height: 60,
        }
      } else {
        // Treat
        const treat = TREATS[Math.floor(Math.random() * TREATS.length)]
        obj = {
          id: `${now}-${Math.random()}`,
          lane,
          y: -60,
          type: 'treat',
          emoji: treat.emoji,
          width: 45,
          height: 45,
        }
      }

      state.objects.push(obj)
    }

    // Game loop
    const gameLoop = () => {
      if (isGameOver) return

      const now = Date.now()
      state.gameTime = (now - startTime) / 1000

      // Increase speed over time
      state.speed = Math.min(15, 5 + state.gameTime / 10)
      state.maxSpeed = Math.max(state.maxSpeed, state.speed)

      // Update distance
      state.distance += state.speed / 60
      setDistance(Math.floor(state.distance))

      // Spawn objects
      const dynamicSpawnInterval = Math.max(600, 1500 - state.gameTime * 10)
      if (now - state.lastSpawnTime > dynamicSpawnInterval) {
        spawnObject()
        // Sometimes spawn multiple objects
        if (Math.random() < 0.3) {
          setTimeout(() => spawnObject(), 200)
        }
        state.lastSpawnTime = now
      }

      // Update player position (smooth lane switching)
      const targetX = LANE_POSITIONS[state.targetLane]
      const dx = targetX - state.playerX
      if (Math.abs(dx) > 1) {
        state.playerX += dx * 0.2
      } else {
        state.playerX = targetX
        state.playerLane = state.targetLane
      }

      // Update jump
      if (state.isJumping) {
        state.jumpVelocity += 1.2 // Gravity
        state.playerY += state.jumpVelocity
        if (state.playerY >= 550) {
          state.playerY = 550
          state.isJumping = false
          state.jumpVelocity = 0
        }
      }

      // Update slide
      if (state.isSliding && now > state.slideEndTime) {
        state.isSliding = false
      }

      // Update invincibility
      if (state.isInvincible && now > state.invincibleUntil) {
        state.isInvincible = false
      }

      // Update combo
      if (now - state.lastTreatTime > 2000) {
        state.combo = 1
      }

      // Clear canvas
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, 375, 667)

      // Draw scrolling background
      state.groundOffset = (state.groundOffset + state.speed) % 100

      // Draw road/path
      const gradient = ctx.createLinearGradient(0, 0, 375, 0)
      gradient.addColorStop(0, '#2d2d44')
      gradient.addColorStop(0.5, '#3d3d5c')
      gradient.addColorStop(1, '#2d2d44')
      ctx.fillStyle = gradient
      ctx.fillRect(20, 0, 335, 667)

      // Draw lane dividers
      ctx.strokeStyle = '#ffffff30'
      ctx.lineWidth = 3
      ctx.setLineDash([30, 20])
      
      for (let i = 1; i < 3; i++) {
        ctx.beginPath()
        ctx.moveTo(20 + (335 / 3) * i, -state.groundOffset)
        for (let y = -state.groundOffset; y < 700; y += 50) {
          ctx.lineTo(20 + (335 / 3) * i, y)
        }
        ctx.stroke()
      }
      ctx.setLineDash([])

      // Draw scrolling ground lines
      ctx.strokeStyle = '#ffffff15'
      ctx.lineWidth = 2
      for (let y = -state.groundOffset; y < 700; y += 100) {
        ctx.beginPath()
        ctx.moveTo(20, y)
        ctx.lineTo(355, y)
        ctx.stroke()
      }

      // Draw side buildings/scenery
      ctx.fillStyle = '#16213e'
      ctx.fillRect(0, 0, 20, 667)
      ctx.fillRect(355, 0, 20, 667)

      // Update and draw objects
      for (let i = state.objects.length - 1; i >= 0; i--) {
        const obj = state.objects[i]
        obj.y += state.speed

        // Remove off-screen objects
        if (obj.y > 700) {
          if (obj.type === 'obstacle' && !obj.collected) {
            state.obstaclesAvoided++
          }
          state.objects.splice(i, 1)
          continue
        }

        const objX = LANE_POSITIONS[obj.lane]

        // Check collision with player
        if (!obj.collected) {
          const playerWidth = state.isSliding ? 60 : 50
          const playerHeight = state.isSliding ? 30 : 70
          const playerTop = state.isSliding ? state.playerY + 40 : state.playerY

          const collisionX = Math.abs(objX - state.playerX) < (playerWidth / 2 + obj.width / 2 - 15)
          const collisionY = obj.y + obj.height / 2 > playerTop && obj.y - obj.height / 2 < playerTop + playerHeight

          if (collisionX && collisionY) {
            if (obj.type === 'obstacle') {
              // Check if jumping over or sliding under
              const canJumpOver = state.isJumping && state.playerY < 500
              const canSlideUnder = state.isSliding && obj.emoji !== '🕳️' // Can't slide over potholes

              if (!canJumpOver && !canSlideUnder && !state.isInvincible) {
                // Hit obstacle - game over
                soundManager.playYuck()
                triggerHaptic('heavy')
                setIsGameOver(true)
                
                const results: RunnerResults = {
                  score: state.score,
                  distance: Math.floor(state.distance),
                  treatsCollected: state.treatsCollected,
                  obstaclesAvoided: state.obstaclesAvoided,
                  maxSpeed: Math.floor(state.maxSpeed),
                }
                onGameEnd(results)
                return
              }
            } else {
              // Collect treat
              obj.collected = true
              state.treatsCollected++
              state.lastTreatTime = now
              
              const points = obj.type === 'golden' 
                ? GOLDEN_TREATS.find(t => t.emoji === obj.emoji)?.points || 50
                : TREATS.find(t => t.emoji === obj.emoji)?.points || 10

              state.score += points * state.combo
              state.combo = Math.min(5, state.combo + 0.5)

              setScore(state.score)
              soundManager.playMunch()
              triggerHaptic('light')

              if (obj.type === 'golden') {
                soundManager.playCombo(3)
                triggerHaptic('medium')
              }
            }
          }
        }

        // Draw object
        if (!obj.collected) {
          ctx.save()
          
          if (obj.type === 'golden') {
            ctx.shadowColor = '#ffd700'
            ctx.shadowBlur = 20
          } else if (obj.type === 'obstacle') {
            ctx.shadowColor = '#ff0000'
            ctx.shadowBlur = 10
          }

          ctx.font = `${obj.width}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(obj.emoji, objX, obj.y)
          
          ctx.restore()
        }
      }

      // Draw player (Pockets)
      ctx.save()
      
      const playerSize = state.isSliding ? 40 : 60
      const playerYOffset = state.isSliding ? 30 : 0
      
      if (state.isInvincible) {
        ctx.globalAlpha = 0.5 + Math.sin(now / 50) * 0.3
      }

      if (state.isJumping) {
        ctx.shadowColor = '#a855f7'
        ctx.shadowBlur = 20
      }

      if (pocketsLoaded) {
        ctx.drawImage(
          pocketsImg,
          state.playerX - playerSize / 2,
          state.playerY - playerSize / 2 + playerYOffset,
          playerSize,
          state.isSliding ? playerSize * 0.5 : playerSize
        )
      } else {
        // Fallback
        ctx.fillStyle = state.isInvincible ? '#fbbf24' : '#8b5cf6'
        ctx.beginPath()
        ctx.ellipse(
          state.playerX, 
          state.playerY + playerYOffset, 
          playerSize / 2, 
          state.isSliding ? playerSize / 4 : playerSize / 2,
          0, 0, Math.PI * 2
        )
        ctx.fill()
      }
      
      ctx.restore()

      // Draw combo indicator
      if (state.combo > 1) {
        ctx.fillStyle = '#fbbf24'
        ctx.font = 'bold 20px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(`x${state.combo.toFixed(1)} COMBO!`, 187, 100)
      }

      animationId = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      cancelAnimationFrame(animationId)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isGameOver, switchLane, jump, slide, onGameEnd, triggerHaptic])

  return (
    <div className="relative flex items-center justify-center">
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
          <span className="text-white font-bold">🏃 {distance}m</span>
        </div>
        <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
          <span className="text-yellow-400 font-bold">⭐ {score}</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="rounded-2xl shadow-2xl border-4 border-white/20"
        style={{
          width: '375px',
          height: '667px',
          touchAction: 'none',
        }}
      />

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
          <span className="text-white/80 text-sm">
            ← → Swipe to switch lanes • ↑ Jump • ↓ Slide
          </span>
        </div>
      </div>
    </div>
  )
}
