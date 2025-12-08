'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { AdvancedMatch3Engine, Cell, SpecialType, FOOD_EMOJIS } from '@/lib/advanced-match3-engine'
import { soundManager } from '@/lib/sound-manager'
import { Sparkles, Zap } from 'lucide-react'
import { TreatType } from '@/lib/level-configurations'

interface AdvancedMatch3GridProps {
  rows?: number
  cols?: number
  treats?: TreatType[]
  onScoreChange: (score: number) => void
  onMoveUsed: () => void
  isPaused: boolean
}

// Haptic feedback helper
const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    const patterns = { light: 10, medium: 25, heavy: 50 }
    navigator.vibrate(patterns[intensity])
  }
}

// Grid cell size constants
const CELL_SIZE = 48 // Base cell size in px
const CELL_GAP = 6   // Gap between cells

export function AdvancedMatch3Grid({
  rows = 8,
  cols = 8,
  treats = [],
  onScoreChange,
  onMoveUsed,
  isPaused,
}: AdvancedMatch3GridProps) {
  const [engine] = useState(() => new AdvancedMatch3Engine(rows, cols, treats))
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
  const [matchedCells, setMatchedCells] = useState<Set<string>>(new Set())
  const [fallingCells, setFallingCells] = useState<Map<string, { fromRow: number; toRow: number }>>(new Map())
  
  const gridRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number; row: number; col: number } | null>(null)

  // Calculate grid dimensions
  const gridWidth = cols * CELL_SIZE + (cols - 1) * CELL_GAP
  const gridHeight = rows * CELL_SIZE + (rows - 1) * CELL_GAP

  // Touch/swipe handling for mobile
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
      // Determine swipe direction
      let targetRow = row
      let targetCol = col
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        targetCol = deltaX > 0 ? col + 1 : col - 1
      } else {
        // Vertical swipe
        targetRow = deltaY > 0 ? row + 1 : row - 1
      }
      
      // Validate target is in bounds
      if (targetRow >= 0 && targetRow < rows && targetCol >= 0 && targetCol < cols) {
        handleSwap(row, col, targetRow, targetCol)
      }
    } else {
      // Tap - use click logic
      handleCellClick(row, col)
    }
    
    touchStartRef.current = null
  }, [isPaused, isAnimating, rows, cols])

  const handleSwap = async (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
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
    
    const result = engine.swap(fromRow, fromCol, toRow, toCol)

    if (!result.isValid) {
      soundManager.playWhoops()
      triggerHaptic('light')
      setInvalidMove(true)
      setHintMessage('No matches! Try another move.')
      setTimeout(() => {
        setInvalidMove(false)
        setHintMessage('')
      }, 800)
      setIsAnimating(false)
      return
    }

    soundManager.playChomp()
    triggerHaptic('medium')

    // Mark matched cells for pop animation
    if (result.matchedPositions) {
      const matched = new Set<string>()
      result.matchedPositions.forEach(([r, c]: [number, number]) => {
        matched.add(`${r}-${c}`)
      })
      setMatchedCells(matched)
    }

    await new Promise(resolve => setTimeout(resolve, 150))
    setGrid([...engine.getGrid()])
    
    // Clear matched cells after animation
    setTimeout(() => setMatchedCells(new Set()), 300)
    
    await new Promise(resolve => setTimeout(resolve, 400))

    if (result.score > 0) {
      onScoreChange(result.score)
      setLastScore(result.score)
      setShowScorePopup(true)
      setTimeout(() => setShowScorePopup(false), 1000)
    }

    // Big combo effects
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

    await new Promise(resolve => setTimeout(resolve, 300))
    setGrid([...engine.getGrid()])
    setIsAnimating(false)
  }

  const handleCellClick = async (row: number, col: number) => {
    if (isPaused || isAnimating) return

    const cell = engine.getCell(row, col)
    if (!cell) return

    // Special tile activation
    if (cell.specialType !== 'none') {
      setIsAnimating(true)
      triggerHaptic('heavy')
      const result = engine.activateSpecial(row, col)

      await new Promise(resolve => setTimeout(resolve, 300))
      setGrid([...engine.getGrid()])
      await new Promise(resolve => setTimeout(resolve, 600))

      if (result.score > 0) {
        onScoreChange(result.score)
        setLastScore(result.score)
        setShowScorePopup(true)
        setTimeout(() => setShowScorePopup(false), 1000)
      }

      onMoveUsed()

      await new Promise(resolve => setTimeout(resolve, 400))
      setIsAnimating(false)
      return
    }

    // Selection logic
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

    // Attempt swap
    await handleSwap(selectedCell.row, selectedCell.col, row, col)
  }

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

  const getCellTransform = (cell: Cell | null, row: number, col: number): string => {
    if (!cell) return 'scale(0)'
    
    const isMatched = matchedCells.has(`${row}-${col}`)
    const isSelected = selectedCell?.row === row && selectedCell?.col === col
    const falling = fallingCells.get(`${row}-${col}`)
    
    let transform = 'translate3d(0, 0, 0)'
    
    if (falling) {
      const fallDistance = (falling.toRow - falling.fromRow) * (CELL_SIZE + CELL_GAP)
      transform = `translate3d(0, ${-fallDistance}px, 0)`
    }
    
    if (isMatched) {
      transform += ' scale(1.15)'
    } else if (isSelected) {
      transform += ' scale(1.1)'
    } else if (cell.isFalling || cell.isNew) {
      // New tiles animate in from top
      transform = 'translate3d(0, -100px, 0) scale(0.8)'
    }
    
    return transform
  }

  const getCellStyle = (cell: Cell | null, row: number, col: number): React.CSSProperties => {
    const isMatched = matchedCells.has(`${row}-${col}`)
    const isSelected = selectedCell?.row === row && selectedCell?.col === col
    const isAdjacent = selectedCell &&
      Math.abs(selectedCell.row - row) + Math.abs(selectedCell.col - col) === 1

    return {
      width: CELL_SIZE,
      height: CELL_SIZE,
      transform: getCellTransform(cell, row, col),
      transition: isMatched 
        ? 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s ease-out'
        : 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
      opacity: cell?.isBeingEaten ? 0 : 1,
      zIndex: isSelected ? 10 : isAdjacent ? 5 : 1,
    }
  }

  const getCellClassName = (cell: Cell | null, row: number, col: number) => {
    if (!cell) return 'opacity-0'

    const isSelected = selectedCell?.row === row && selectedCell?.col === col
    const isAdjacent = selectedCell &&
      Math.abs(selectedCell.row - row) + Math.abs(selectedCell.col - col) === 1
    const isMatched = matchedCells.has(`${row}-${col}`)
    const isSpecial = cell.specialType !== 'none'

    const classes = [
      'relative flex items-center justify-center',
      'text-3xl sm:text-4xl',
      'rounded-xl cursor-pointer',
      'border-2 select-none',
      'will-change-transform', // GPU acceleration hint
    ]

    // Background
    if (isSpecial) {
      classes.push('bg-gradient-to-br from-yellow-300 via-yellow-100 to-white')
      classes.push('shadow-lg shadow-yellow-400/30')
      classes.push('animate-glow-pulse')
    } else {
      classes.push('bg-gradient-to-br from-white to-gray-50')
      classes.push('shadow-md')
    }

    // Selection states
    if (isSelected) {
      classes.push('ring-4 ring-yellow-400 ring-offset-2 border-yellow-300')
    } else if (isAdjacent) {
      classes.push('ring-2 ring-green-400/70 border-green-300/70')
    } else {
      classes.push('border-white/40')
    }

    // Match animation
    if (isMatched) {
      classes.push('animate-tile-pop')
    }

    return classes.join(' ')
  }

  return (
    <div className="relative select-none" ref={gridRef}>
      {/* Big Combo Overlay */}
      {bigComboAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 text-white px-10 py-6 rounded-3xl font-black text-4xl animate-combo-pop shadow-2xl border-4 border-yellow-300">
            <div className="text-center">
              <div className="text-5xl mb-2">✨</div>
              <div className="text-2xl">{bigComboAnimation.type} COMBO!</div>
              <div className="text-6xl my-2">{bigComboAnimation.size}</div>
              <div className="text-xl">PIECE MATCH!</div>
            </div>
          </div>
        </div>
      )}

      {/* Score Popup */}
      {showScorePopup && !bigComboAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 text-white px-6 py-3 rounded-2xl font-black text-3xl animate-score-pop shadow-2xl border-4 border-white/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              +{lastScore}
            </div>
            {comboCount > 0 && (
              <div className="text-lg font-bold mt-1">
                🔥 COMBO x{comboCount + 1}!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hint Message */}
      {hintMessage && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className={`px-6 py-3 rounded-2xl font-bold text-lg shadow-2xl border-4 ${
            invalidMove
              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white animate-shake border-red-300'
              : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-300'
          }`}>
            {invalidMove ? '❌' : '💡'} {hintMessage}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!selectedCell && !isAnimating && (
        <div className="absolute -top-2 left-0 right-0 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 text-white px-3 py-2 rounded-xl text-center text-sm font-bold shadow-lg border-2 border-blue-300 z-20">
          <div className="flex items-center justify-center gap-2">
            🎯 <span>Tap or swipe candies to match!</span>
          </div>
        </div>
      )}

      {selectedCell && !isAnimating && (
        <div className="absolute -top-2 left-0 right-0 bg-gradient-to-r from-green-500 via-green-600 to-green-500 text-white px-3 py-2 rounded-xl text-center text-sm font-bold shadow-lg border-2 border-green-300 z-20 animate-pulse">
          <div className="flex items-center justify-center gap-2">
            ✨ <span>Now tap adjacent candy to swap!</span>
          </div>
        </div>
      )}

      {/* Game Grid */}
      <div
        className={`
          grid place-items-center p-3 sm:p-4 
          bg-gradient-to-br from-white/20 to-white/10 
          rounded-2xl backdrop-blur-md shadow-xl 
          border-2 border-white/30 mt-12
          ${boardShake ? 'animate-board-shake' : ''}
        `}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${rows}, ${CELL_SIZE}px)`,
          gap: CELL_GAP,
          touchAction: 'none', // Prevent scroll/pinch on game board
          width: gridWidth + 24, // Add padding
          height: gridHeight + 24 + 48, // Add padding + instruction bar space
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={cell?.id || `${rowIndex}-${colIndex}`}
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
                    <div className="absolute -top-1 -right-1 text-xs bg-gradient-to-br from-yellow-300 to-orange-400 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg border border-white pointer-events-none">
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
      <div className="mt-4 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl p-4 backdrop-blur-md shadow-xl border-2 border-white/30">
        <div className="text-white space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="font-bold text-sm">Match Types</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/10 rounded-lg p-2">
              <div className="font-bold">🟦 2x2 Box</div>
              <div className="text-yellow-300">15pts each</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="font-bold">🔷 Diagonal</div>
              <div className="text-yellow-300">20pts each</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="font-bold">➖ Row/Col</div>
              <div className="text-yellow-300">10pts each</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="font-bold">🔥 Combos</div>
              <div className="text-orange-300">Score x1.5+</div>
            </div>
          </div>
          <div className="pt-2 border-t border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3 h-3 text-yellow-300" />
              <div className="font-semibold text-xs">Special Candies</div>
            </div>
            <div className="text-xs bg-white/10 rounded-lg p-2">
              ═ Striped • ✨ Wrapped • 💥 Color Bomb
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
