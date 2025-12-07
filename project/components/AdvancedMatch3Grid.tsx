'use client'

import { useEffect, useState, useRef } from 'react'
import { AdvancedMatch3Engine, Cell, SpecialType, FOOD_EMOJIS } from '@/lib/advanced-match3-engine'
import { soundManager } from '@/lib/sound-manager'
import { Sparkles, Zap } from 'lucide-react'

interface AdvancedMatch3GridProps {
  rows?: number
  cols?: number
  onScoreChange: (score: number) => void
  onMoveUsed: () => void
  isPaused: boolean
}

export function AdvancedMatch3Grid({
  rows = 8,
  cols = 8,
  onScoreChange,
  onMoveUsed,
  isPaused,
}: AdvancedMatch3GridProps) {
  const [engine] = useState(() => new AdvancedMatch3Engine(rows, cols))
  const [grid, setGrid] = useState<(Cell | null)[][]>(() => engine.getGrid())
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [comboCount, setComboCount] = useState(0)
  const [lastScore, setLastScore] = useState(0)
  const [showScorePopup, setShowScorePopup] = useState(false)
  const [invalidMove, setInvalidMove] = useState(false)
  const [hintMessage, setHintMessage] = useState('')
  const [bigComboAnimation, setBigComboAnimation] = useState<{ size: number; type: string } | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const handleCellClick = async (row: number, col: number) => {
    if (isPaused || isAnimating) return

    const cell = engine.getCell(row, col)
    if (!cell) return

    if (cell.specialType !== 'none') {
      setIsAnimating(true)
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

    if (!selectedCell) {
      soundManager.playClick()
      setSelectedCell({ row, col })
      return
    }

    if (selectedCell.row === row && selectedCell.col === col) {
      soundManager.playClick()
      setSelectedCell(null)
      return
    }

    if (!engine.canSwap(selectedCell.row, selectedCell.col, row, col)) {
      soundManager.playWhoops()
      setInvalidMove(true)
      setHintMessage('Select an adjacent candy!')
      setTimeout(() => {
        setInvalidMove(false)
        setHintMessage('')
      }, 800)
      setSelectedCell(null)
      return
    }

    setIsAnimating(true)
    const result = engine.swap(selectedCell.row, selectedCell.col, row, col)

    if (!result.isValid) {
      soundManager.playWhoops()
      setInvalidMove(true)
      setHintMessage('No matches! Try another move.')
      setTimeout(() => {
        setInvalidMove(false)
        setHintMessage('')
      }, 800)
      setSelectedCell(null)
      setIsAnimating(false)
      return
    }

    soundManager.playChomp()

    await new Promise(resolve => setTimeout(resolve, 300))
    setGrid([...engine.getGrid()])
    await new Promise(resolve => setTimeout(resolve, 600))

    setSelectedCell(null)

    if (result.score > 0) {
      onScoreChange(result.score)
      setLastScore(result.score)
      setShowScorePopup(true)
      setTimeout(() => setShowScorePopup(false), 1000)
    }

    if (result.matchInfo && result.matchInfo.largestMatch >= 4) {
      const matchType = result.matchInfo.largestMatch >= 7 ? 'MEGA' :
                       result.matchInfo.largestMatch >= 5 ? 'SUPER' : 'BIG'
      setBigComboAnimation({
        size: result.matchInfo.largestMatch,
        type: matchType
      })
      setTimeout(() => setBigComboAnimation(null), 1500)
    }

    if (result.cascade) {
      const newCombo = comboCount + 1
      setComboCount(newCombo)
      soundManager.playCombo(Math.min(newCombo, 5))
    } else {
      setComboCount(0)
    }

    onMoveUsed()

    await new Promise(resolve => setTimeout(resolve, 400))
    setGrid([...engine.getGrid()])
    setIsAnimating(false)
  }

  const getSpecialIndicator = (specialType: SpecialType) => {
    switch (specialType) {
      case 'striped_horizontal':
        return '═'
      case 'striped_vertical':
        return '║'
      case 'wrapped':
        return '✨'
      case 'color_bomb':
        return '💥'
      case 'rainbow':
        return '🌈'
      default:
        return null
    }
  }

  const getCellClassName = (cell: Cell | null, row: number, col: number) => {
    if (!cell) return 'opacity-0'

    const baseClasses = 'relative flex items-center justify-center text-4xl rounded-2xl cursor-pointer transform hover:scale-105 active:scale-95 border-2'

    const isSelected = selectedCell?.row === row && selectedCell?.col === col
    const selectedClasses = isSelected ? 'ring-4 ring-yellow-400 ring-offset-2 scale-110 shadow-2xl border-yellow-300 z-10' : 'border-white/30'

    const isAdjacent = selectedCell &&
      Math.abs(selectedCell.row - row) + Math.abs(selectedCell.col - col) === 1
    const adjacentClasses = isAdjacent ? 'ring-2 ring-green-400 ring-offset-1 border-green-300' : ''

    const eatenClasses = cell.isBeingEaten ? 'animate-crumble' : ''

    const fallingClasses = cell.isFalling || cell.isNew ? 'animate-bounce-in' : 'transition-all duration-300'

    const specialClasses = cell.specialType !== 'none' ? 'shadow-xl' : 'shadow-lg'

    const bgClasses = cell.specialType !== 'none'
      ? 'bg-gradient-to-br from-yellow-300 via-yellow-100 to-white'
      : 'bg-gradient-to-br from-white to-gray-50'

    return `${baseClasses} ${selectedClasses} ${adjacentClasses} ${eatenClasses} ${fallingClasses} ${specialClasses} ${bgClasses}`
  }

  return (
    <div className="relative" ref={gridRef}>
      {bigComboAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 text-white px-12 py-8 rounded-3xl font-black text-5xl animate-pop shadow-2xl border-4 border-yellow-300">
            <div className="text-center">
              <div className="text-6xl mb-2 animate-bounce">✨</div>
              <div className="text-3xl">{bigComboAnimation.type} COMBO!</div>
              <div className="text-7xl my-2 animate-pulse">{bigComboAnimation.size}</div>
              <div className="text-2xl">PIECE MATCH!</div>
            </div>
          </div>
        </div>
      )}

      {showScorePopup && !bigComboAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 text-white px-8 py-4 rounded-3xl font-black text-4xl animate-pop shadow-2xl border-4 border-white/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 animate-spin" />
              +{lastScore}
            </div>
            {comboCount > 0 && (
              <div className="text-xl font-bold mt-1 animate-pulse">
                🔥 COMBO x{comboCount + 1}!
              </div>
            )}
          </div>
        </div>
      )}

      {hintMessage && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className={`px-8 py-4 rounded-3xl font-bold text-xl shadow-2xl border-4 ${
            invalidMove
              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white animate-shake border-red-300'
              : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-300'
          }`}>
            {invalidMove ? '❌' : '💡'} {hintMessage}
          </div>
        </div>
      )}

      {!selectedCell && !isAnimating && (
        <div className="absolute -top-2 left-0 right-0 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 text-white px-4 py-3 rounded-2xl text-center text-sm font-bold shadow-xl border-2 border-blue-300 z-20">
          <div className="flex items-center justify-center gap-2">
            🎯 <span>Tap a candy, then tap an adjacent one to swap!</span>
          </div>
        </div>
      )}

      {selectedCell && !isAnimating && (
        <div className="absolute -top-2 left-0 right-0 bg-gradient-to-r from-green-500 via-green-600 to-green-500 text-white px-4 py-3 rounded-2xl text-center text-sm font-bold shadow-xl border-2 border-green-300 z-20 animate-pulse">
          <div className="flex items-center justify-center gap-2">
            ✨ <span>Now tap a candy next to the highlighted one!</span>
          </div>
        </div>
      )}

      <div
        className="grid gap-2 p-4 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl backdrop-blur-md shadow-xl border-2 border-white/30 mt-12"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={cell?.id || `${rowIndex}-${colIndex}`}
              className={getCellClassName(cell, rowIndex, colIndex)}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              style={{
                aspectRatio: '1',
                minWidth: '40px',
                minHeight: '40px',
              }}
            >
              {cell && (
                <>
                  <span className="relative z-10 drop-shadow-lg">
                    {FOOD_EMOJIS[cell.foodType]}
                  </span>
                  {cell.specialType !== 'none' && (
                    <div className="absolute -top-1 -right-1 text-sm bg-gradient-to-br from-yellow-300 to-orange-400 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold shadow-lg border-2 border-white animate-pulse">
                      {getSpecialIndicator(cell.specialType)}
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-6 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl p-5 backdrop-blur-md shadow-xl border-2 border-white/30">
        <div className="text-white space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            <span className="font-bold text-lg">Match Types</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
              <div className="font-bold">🟦 2x2 Box</div>
              <div className="text-yellow-300">15pts each</div>
            </div>
            <div className="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
              <div className="font-bold">🔷 Diagonal</div>
              <div className="text-yellow-300">20pts each</div>
            </div>
            <div className="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
              <div className="font-bold">➖ Row/Col</div>
              <div className="text-yellow-300">10pts each</div>
            </div>
            <div className="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
              <div className="font-bold">🔥 Combos</div>
              <div className="text-orange-300">Score x1.5+</div>
            </div>
          </div>
          <div className="pt-3 border-t border-white/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-300" />
              <div className="font-semibold">Special Candies</div>
            </div>
            <div className="text-sm bg-white/10 rounded-xl p-2 backdrop-blur-sm">
              ═ Striped • ✨ Wrapped • 💥 Color Bomb
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
