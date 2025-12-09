'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { AdvancedMatch3Engine, Cell, SpecialType, FOOD_EMOJIS } from '@/lib/advanced-match3-engine'
import { soundManager } from '@/lib/sound-manager'
import { Sparkles } from 'lucide-react'
import { TreatType } from '@/lib/level-configurations'

interface AdvancedMatch3GridProps {
  rows?: number
  cols?: number
  treats?: TreatType[]
  onScoreChange: (score: number) => void
  onMoveUsed: () => void
  isPaused: boolean
}

interface AnimatingCell {
  id: string
  fromRow: number
  fromCol: number
  toRow: number
  toCol: number
  progress: number
  type: 'swap' | 'fall' | 'appear'
}

interface CrumbParticle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  emoji: string
  scale: number
  opacity: number
  rotation: number
}

const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    const patterns = { light: 10, medium: 25, heavy: 50 }
    navigator.vibrate(patterns[intensity])
  }
}

export function AdvancedMatch3Grid({
  rows = 8,
  cols = 8,
  treats = [],
  onScoreChange,
  onMoveUsed,
  isPaused,
}: AdvancedMatch3GridProps) {
  const engineRef = useRef<AdvancedMatch3Engine | null>(null)
  
  if (!engineRef.current) {
    engineRef.current = new AdvancedMatch3Engine(rows, cols, treats)
  }
  
  const engine = engineRef.current
  
  const [grid, setGrid] = useState<(Cell | null)[][]>(() => engine.getGrid())
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [comboCount, setComboCount] = useState(0)
  const [lastScore, setLastScore] = useState(0)
  const [showScorePopup, setShowScorePopup] = useState(false)
  const [invalidMove, setInvalidMove] = useState(false)
  const [hintMessage, setHintMessage] = useState('')
  const [bigComboAnimation, setBigComboAnimation] = useState<{ size: number; type: string } | null>(null)
  const [boardShake, setBoardShake] = useState(false)
  
  // Animation states
  const [swappingCells, setSwappingCells] = useState<{from: {row: number, col: number}, to: {row: number, col: number}, progress: number} | null>(null)
  const [crumblingCells, setCrumblingCells] = useState<Set<string>>(new Set())
  const [fallingCells, setFallingCells] = useState<Map<string, {fromRow: number, progress: number}>>(new Map())
  const [particles, setParticles] = useState<CrumbParticle[]>([])

  const gridRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number; row: number; col: number } | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Spawn crumb particles when cells are matched
  const spawnCrumbs = useCallback((row: number, col: number, emoji: string) => {
    const newParticles: CrumbParticle[] = []
    const cellSize = gridRef.current ? gridRef.current.offsetWidth / cols : 40
    const baseX = col * cellSize + cellSize / 2
    const baseY = row * cellSize + cellSize / 2

    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.5
      const speed = 2 + Math.random() * 3
      newParticles.push({
        id: `${row}-${col}-${i}-${Date.now()}`,
        x: baseX,
        y: baseY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        emoji,
        scale: 0.5 + Math.random() * 0.3,
        opacity: 1,
        rotation: Math.random() * 360,
      })
    }
    setParticles(prev => [...prev, ...newParticles])
  }, [cols])

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return

    const animate = () => {
      setParticles(prev => {
        const updated = prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.3, // gravity
          opacity: p.opacity - 0.03,
          rotation: p.rotation + 5,
          scale: p.scale * 0.97,
        })).filter(p => p.opacity > 0)
        
        return updated
      })
    }

    const frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [particles])

  const refreshGrid = useCallback(() => {
    const newGrid = engine.getGrid().map(row => row.map(cell => cell ? { ...cell } : null))
    setGrid(newGrid)
  }, [engine])

  const handleTouchStart = useCallback((e: React.TouchEvent, row: number, col: number) => {
    if (isPaused || isAnimating) return
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, row, col }
  }, [isPaused, isAnimating])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || isPaused || isAnimating) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    const { row, col } = touchStartRef.current

    const minSwipeDistance = 30

    if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
      let targetRow = row
      let targetCol = col

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        targetCol = deltaX > 0 ? col + 1 : col - 1
      } else {
        targetRow = deltaY > 0 ? row + 1 : row - 1
      }

      if (targetRow >= 0 && targetRow < rows && targetCol >= 0 && targetCol < cols) {
        handleSwap(row, col, targetRow, targetCol)
      }
    } else {
      handleCellClick(row, col)
    }

    touchStartRef.current = null
  }, [isPaused, isAnimating, rows, cols])

  const animateSwap = async (fromRow: number, fromCol: number, toRow: number, toCol: number): Promise<void> => {
    return new Promise((resolve) => {
      setSwappingCells({ from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol }, progress: 0 })
      
      let progress = 0
      const animate = () => {
        progress += 0.08
        if (progress >= 1) {
          setSwappingCells(null)
          resolve()
          return
        }
        setSwappingCells({ from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol }, progress })
        requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)
    })
  }

  const animateCrumble = async (matchedPositions: {row: number, col: number, emoji: string}[]): Promise<void> => {
    return new Promise((resolve) => {
      const posSet = new Set(matchedPositions.map(p => `${p.row}-${p.col}`))
      setCrumblingCells(posSet)
      
      // Spawn particles for each matched cell
      matchedPositions.forEach(pos => {
        spawnCrumbs(pos.row, pos.col, pos.emoji)
      })

      setTimeout(() => {
        setCrumblingCells(new Set())
        resolve()
      }, 300)
    })
  }

  const animateFall = async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(resolve, 250)
    })
  }

  const handleSwap = useCallback(async (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    if (!engine.canSwap(fromRow, fromCol, toRow, toCol)) {
      soundManager.playWhoops()
      triggerHaptic('light')
      setInvalidMove(true)
      setHintMessage('Select an adjacent candy!')
      setTimeout(() => {
        setInvalidMove(false)
        setHintMessage('')
      }, 800)
      return
    }

    setIsAnimating(true)
    setSelectedCell(null)

    // Get the cells before swap for animation
    const cell1 = engine.getCell(fromRow, fromCol)
    const cell2 = engine.getCell(toRow, toCol)

    // Animate the swap visually
    await animateSwap(fromRow, fromCol, toRow, toCol)

    // Execute the swap in the engine
    const result = engine.swap(fromRow, fromCol, toRow, toCol)

    if (!result.isValid) {
      // Swap back animation
      await animateSwap(toRow, toCol, fromRow, fromCol)
      
      soundManager.playWhoops()
      triggerHaptic('light')
      setInvalidMove(true)
      setHintMessage('No matches! Try another move.')
      setTimeout(() => {
        setInvalidMove(false)
        setHintMessage('')
      }, 800)
      setIsAnimating(false)
      refreshGrid()
      return
    }

    // Play match sound
    soundManager.playChomp()
    triggerHaptic('medium')

    // Get matched cells for crumble animation
    const currentGrid = engine.getGrid()
    const matchedPositions: {row: number, col: number, emoji: string}[] = []
    
    // Find cells that were matched (they'll be new or different)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const oldCell = grid[r]?.[c]
        const newCell = currentGrid[r]?.[c]
        if (oldCell && newCell && oldCell.id !== newCell.id) {
          matchedPositions.push({ row: r, col: c, emoji: FOOD_EMOJIS[oldCell.foodType] })
        }
      }
    }

    // Animate crumbling
    if (matchedPositions.length > 0) {
      await animateCrumble(matchedPositions)
    }

    // Update grid to show new state
    refreshGrid()

    // Animate falling
    await animateFall()

    // Show score
    if (result.score > 0) {
      onScoreChange(result.score)
      setLastScore(result.score)
      setShowScorePopup(true)
      setTimeout(() => setShowScorePopup(false), 1000)
    }

    // Big combo animation
    if (result.matchInfo && result.matchInfo.largestMatch >= 4) {
      const matchType = result.matchInfo.largestMatch >= 7 ? 'MEGA' :
                       result.matchInfo.largestMatch >= 5 ? 'SUPER' : 'BIG'
      setBigComboAnimation({ size: result.matchInfo.largestMatch, type: matchType })
      setBoardShake(true)
      triggerHaptic('heavy')
      setTimeout(() => {
        setBigComboAnimation(null)
        setBoardShake(false)
      }, 1500)
    }

    // Handle cascade/combo display
    if (result.cascade) {
      const newCombo = comboCount + 1
      setComboCount(newCombo)
      soundManager.playCombo(Math.min(newCombo, 5))
      if (newCombo >= 2) {
        setBoardShake(true)
        triggerHaptic('medium')
        setTimeout(() => setBoardShake(false), 300)
      }
    } else {
      setComboCount(0)
    }

    onMoveUsed()
    setIsAnimating(false)
    
  }, [engine, refreshGrid, onScoreChange, onMoveUsed, comboCount, grid, rows, spawnCrumbs])

  const handleCellClick = useCallback(async (row: number, col: number) => {
    if (isPaused || isAnimating) return

    const cell = engine.getCell(row, col)
    if (!cell) return

    // Handle special candy activation
    if (cell.specialType !== 'none') {
      setIsAnimating(true)
      triggerHaptic('heavy')
      
      const result = engine.activateSpecial(row, col)
      
      refreshGrid()

      if (result.score > 0) {
        onScoreChange(result.score)
        setLastScore(result.score)
        setShowScorePopup(true)
        setTimeout(() => setShowScorePopup(false), 1000)
      }

      onMoveUsed()

      setTimeout(() => {
        setIsAnimating(false)
      }, 300)
      return
    }

    // Handle normal selection
    if (!selectedCell) {
      soundManager.playClick()
      triggerHaptic('light')
      setSelectedCell({ row, col })
      return
    }

    if (selectedCell.row === row && selectedCell.col === col) {
      soundManager.playClick()
      setSelectedCell(null)
      return
    }

    // Try to swap
    await handleSwap(selectedCell.row, selectedCell.col, row, col)
  }, [isPaused, isAnimating, engine, selectedCell, refreshGrid, onScoreChange, onMoveUsed, handleSwap])

  const getSpecialIndicator = (specialType: SpecialType) => {
    switch (specialType) {
      case 'striped_horizontal': return '═'
      case 'striped_vertical': return '║'
      case 'wrapped': return '✨'
      case 'color_bomb': return '💥'
      case 'rainbow': return '🌈'
      default: return null
    }
  }

  const getCellStyle = (cell: Cell | null, row: number, col: number): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      aspectRatio: '1',
      transition: 'transform 0.15s ease-out, opacity 0.2s ease-out',
    }

    // Check if this cell is being swapped
    if (swappingCells) {
      const { from, to, progress } = swappingCells
      const easeProgress = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      
      if (row === from.row && col === from.col) {
        const dx = (to.col - from.col) * 100 * easeProgress
        const dy = (to.row - from.row) * 100 * easeProgress
        return {
          ...baseStyle,
          transform: `translate(${dx}%, ${dy}%) scale(1.1)`,
          zIndex: 10,
        }
      }
      if (row === to.row && col === to.col) {
        const dx = (from.col - to.col) * 100 * easeProgress
        const dy = (from.row - to.row) * 100 * easeProgress
        return {
          ...baseStyle,
          transform: `translate(${dx}%, ${dy}%) scale(1.1)`,
          zIndex: 10,
        }
      }
    }

    // Check if this cell is crumbling
    if (crumblingCells.has(`${row}-${col}`)) {
      return {
        ...baseStyle,
        transform: 'scale(0) rotate(180deg)',
        opacity: 0,
      }
    }

    return baseStyle
  }

  const getCellClassName = (cell: Cell | null, row: number, col: number) => {
    if (!cell) return 'opacity-0'

    const isSelected = selectedCell?.row === row && selectedCell?.col === col
    const isAdjacent = selectedCell &&
      Math.abs(selectedCell.row - row) + Math.abs(selectedCell.col - col) === 1
    const isSpecial = cell.specialType !== 'none'
    const isCrumbling = crumblingCells.has(`${row}-${col}`)

    const classes = [
      'relative flex items-center justify-center',
      'text-2xl sm:text-3xl',
      'rounded-xl cursor-pointer',
      'border-2 select-none',
    ]

    if (isCrumbling) {
      classes.push('transition-all duration-300')
    }

    if (isSpecial) {
      classes.push('bg-gradient-to-br from-yellow-300 via-yellow-100 to-white')
      classes.push('shadow-lg shadow-yellow-400/30')
      classes.push('animate-pulse')
    } else {
      classes.push('bg-gradient-to-br from-white to-gray-50')
      classes.push('shadow-md')
    }

    if (isSelected) {
      classes.push('ring-4 ring-yellow-400 ring-offset-2 border-yellow-300 scale-110 z-10')
    } else if (isAdjacent) {
      classes.push('ring-2 ring-green-400/70 border-green-300/70 scale-105')
    } else {
      classes.push('border-white/40 hover:scale-105')
    }

    return classes.join(' ')
  }

  return (
    <div className="relative select-none w-full max-w-md mx-auto" ref={gridRef}>
      {/* Particles overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute text-lg"
            style={{
              left: p.x,
              top: p.y,
              transform: `scale(${p.scale}) rotate(${p.rotation}deg)`,
              opacity: p.opacity,
              transition: 'none',
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      {/* Big Combo Overlay */}
      {bigComboAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 text-white px-8 py-5 rounded-3xl font-black text-3xl animate-bounce shadow-2xl border-4 border-yellow-300">
            <div className="text-center">
              <div className="text-4xl mb-2">✨</div>
              <div className="text-xl">{bigComboAnimation.type} COMBO!</div>
              <div className="text-5xl my-2">{bigComboAnimation.size}</div>
              <div className="text-lg">PIECE MATCH!</div>
            </div>
          </div>
        </div>
      )}

      {/* Score Popup */}
      {showScorePopup && !bigComboAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 text-white px-5 py-3 rounded-2xl font-black text-2xl animate-bounce shadow-2xl border-4 border-white/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              +{lastScore}
            </div>
            {comboCount > 0 && (
              <div className="text-base font-bold mt-1">
                🔥 COMBO x{comboCount + 1}!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hint/Error Message */}
      {hintMessage && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className={`px-5 py-3 rounded-2xl font-bold text-base shadow-2xl border-4 ${
            invalidMove
              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white border-red-300'
              : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-300'
          }`}>
            {invalidMove ? '❌' : '💡'} {hintMessage}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!selectedCell && !isAnimating && (
        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 text-white px-3 py-2 rounded-xl text-center text-sm font-bold shadow-lg border-2 border-blue-300 mb-3">
          🎯 Tap or swipe candies to match!
        </div>
      )}

      {selectedCell && !isAnimating && (
        <div className="bg-gradient-to-r from-green-500 via-green-600 to-green-500 text-white px-3 py-2 rounded-xl text-center text-sm font-bold shadow-lg border-2 border-green-300 mb-3 animate-pulse">
          ✨ Now tap adjacent candy to swap!
        </div>
      )}

      {/* Game Grid */}
      <div
        className={`
          grid gap-1 p-3
          bg-gradient-to-br from-white/20 to-white/10
          rounded-2xl backdrop-blur-md shadow-xl
          border-2 border-white/30
          ${boardShake ? 'animate-pulse' : ''}
        `}
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          touchAction: 'none',
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}-${cell?.id || 'empty'}`}
              className={getCellClassName(cell, rowIndex, colIndex)}
              style={getCellStyle(cell, rowIndex, colIndex)}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              onTouchStart={(e) => handleTouchStart(e, rowIndex, colIndex)}
              onTouchEnd={handleTouchEnd}
            >
              {cell && (
                <>
                  <span className="relative z-10 drop-shadow-md pointer-events-none">
                    {FOOD_EMOJIS[cell.foodType]}
                  </span>
                  {cell.specialType !== 'none' && (
                    <div className="absolute -top-1 -right-1 text-xs bg-gradient-to-br from-yellow-300 to-orange-400 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-lg border border-white pointer-events-none">
                      {getSpecialIndicator(cell.specialType)}
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Match Types Legend */}
      <div className="mt-3 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl p-3 backdrop-blur-md shadow-xl border-2 border-white/30">
        <div className="text-white">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="font-bold text-sm">Match Types</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="font-bold">🟦</div>
              <div className="text-yellow-300">2x2</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="font-bold">🔷</div>
              <div className="text-yellow-300">Diagonal</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="font-bold">➖</div>
              <div className="text-yellow-300">Line</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <div className="font-bold">🔥</div>
              <div className="text-orange-300">Combo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}