'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Match3Engine, Cell, Match } from '@/lib/match3-engine'
import { CHRISTMAS_FOODS } from '@/lib/game-config'

interface Match3GridProps {
  rows: number
  cols: number
  onScoreChange: (score: number) => void
  onMoveUsed: () => void
  onFoodCollected: (foodType: string, amount: number) => void
  isPaused: boolean
}

export function Match3Grid({
  rows,
  cols,
  onScoreChange,
  onMoveUsed,
  onFoodCollected,
  isPaused
}: Match3GridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<Match3Engine | null>(null)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<number>()

  const cellSize = 50
  const padding = 5

  useEffect(() => {
    engineRef.current = new Match3Engine(rows, cols)
    drawGrid()
  }, [rows, cols])

  const getFoodEmoji = (foodType: string): string => {
    return CHRISTMAS_FOODS.find(f => f.id === foodType)?.emoji || '🎁'
  }

  const getFoodColor = (foodType: string): string => {
    return CHRISTMAS_FOODS.find(f => f.id === foodType)?.color || '#22c55e'
  }

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current
    const engine = engineRef.current
    if (!canvas || !engine) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const grid = engine.getGrid()

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * (cellSize + padding) + padding
        const y = row * (cellSize + padding) + padding

        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
        ctx.fillRect(x, y, cellSize, cellSize)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, cellSize, cellSize)

        const cell = grid[row][col]
        if (cell) {
          if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
            ctx.fillRect(x, y, cellSize, cellSize)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
            ctx.lineWidth = 3
            ctx.strokeRect(x, y, cellSize, cellSize)
          }

          const emoji = getFoodEmoji(cell.foodType)
          ctx.font = 'bold 36px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
          ctx.shadowBlur = 4
          ctx.shadowOffsetX = 2
          ctx.shadowOffsetY = 2
          ctx.fillText(emoji, x + cellSize / 2, y + cellSize / 2)
          ctx.shadowColor = 'transparent'
          ctx.shadowBlur = 0
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
        }
      }
    }
  }, [rows, cols, selectedCell, cellSize, padding])

  useEffect(() => {
    drawGrid()
  }, [drawGrid])

  const processMatches = useCallback(async () => {
    const engine = engineRef.current
    if (!engine) return

    setIsAnimating(true)

    let totalScore = 0
    let hasMatches = true
    const collectedFoods: Record<string, number> = {}

    while (hasMatches) {
      const matches = engine.findMatches()
      if (matches.length === 0) {
        hasMatches = false
        break
      }

      for (const match of matches) {
        for (const cell of match.cells) {
          collectedFoods[cell.foodType] = (collectedFoods[cell.foodType] || 0) + 1
        }
      }

      const matchScore = matches.reduce((sum, match) => {
        const length = Math.min(match.length, 7)
        return sum + (length === 3 ? 100 : length === 4 ? 200 : length === 5 ? 500 : 1000)
      }, 0)

      totalScore += matchScore
      onScoreChange(matchScore)

      engine.removeMatches(matches)
      drawGrid()
      await new Promise(resolve => setTimeout(resolve, 300))

      engine.applyGravity()
      drawGrid()
      await new Promise(resolve => setTimeout(resolve, 300))

      engine.refillGrid()
      drawGrid()
      await new Promise(resolve => setTimeout(resolve, 300))

      engine.clearFallingFlags()
    }

    for (const [foodType, amount] of Object.entries(collectedFoods)) {
      onFoodCollected(foodType, amount)
    }

    setIsAnimating(false)
  }, [drawGrid, onScoreChange, onFoodCollected])

  const handleCellClick = useCallback(async (row: number, col: number) => {
    if (isPaused || isAnimating) return

    const engine = engineRef.current
    if (!engine) return

    if (!selectedCell) {
      setSelectedCell({ row, col })
      return
    }

    const rowDiff = Math.abs(selectedCell.row - row)
    const colDiff = Math.abs(selectedCell.col - col)

    if (rowDiff + colDiff === 1) {
      const result = engine.swap(selectedCell.row, selectedCell.col, row, col)

      if (result.valid) {
        onMoveUsed()
        drawGrid()
        await new Promise(resolve => setTimeout(resolve, 200))
        await processMatches()
      }
    }

    setSelectedCell(null)
    drawGrid()
  }, [selectedCell, isPaused, isAnimating, drawGrid, processMatches, onMoveUsed])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const col = Math.floor(x / (cellSize + padding))
    const row = Math.floor(y / (cellSize + padding))

    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      handleCellClick(row, col)
    }
  }

  const handleCanvasTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    const col = Math.floor(x / (cellSize + padding))
    const row = Math.floor(y / (cellSize + padding))

    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      handleCellClick(row, col)
    }
  }

  return (
    <canvas
      ref={canvasRef}
      width={cols * (cellSize + padding) + padding}
      height={rows * (cellSize + padding) + padding}
      onClick={handleCanvasClick}
      onTouchStart={handleCanvasTouch}
      className="mx-auto rounded-lg shadow-2xl cursor-pointer"
      style={{ touchAction: 'none' }}
    />
  )
}
