'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { soundManager } from '@/lib/sound-manager'
import { Sparkles, Crown, Zap, Heart } from 'lucide-react'

interface QueenCarmellaProps {
  onVictory: (score: number, turnsRemaining: number) => void
  onDefeat: () => void
  maxTurns: number
}

const CANDY_TYPES = [
  { id: 'lollipop', emoji: '🍭', color: '#FF69B4', name: 'Lollipop' },
  { id: 'candy', emoji: '🍬', color: '#FF6B6B', name: 'Candy' },
  { id: 'chocolate', emoji: '🍫', color: '#8B4513', name: 'Chocolate' },
  { id: 'cake', emoji: '🍰', color: '#FFB6C1', name: 'Cake' },
  { id: 'donut', emoji: '🍩', color: '#DEB887', name: 'Donut' },
  { id: 'ice_cream', emoji: '🍦', color: '#FFFACD', name: 'Ice Cream' },
]

interface GridCell {
  id: string
  type: typeof CANDY_TYPES[number]
  row: number
  col: number
  isMatched: boolean
  isSticky: boolean // Caramel sticky tiles
  stickyTurns: number // How many matches needed to clear
  isNew: boolean
}

export function QueenCarmellaBattle({ onVictory, onDefeat, maxTurns }: QueenCarmellaProps) {
  const [turnsLeft, setTurnsLeft] = useState(maxTurns)
  const [score, setScore] = useState(0)
  const [grid, setGrid] = useState<GridCell[][]>([])
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  
  // Tug of war meter: -100 (Queen wins) to +100 (Player wins)
  const [tugMeter, setTugMeter] = useState(0)
  const [queenPower, setQueenPower] = useState(0) // Builds up for attacks
  const [queenStunned, setQueenStunned] = useState(false)
  const [stunTurns, setStunTurns] = useState(0)
  
  const [queenMessage, setQueenMessage] = useState<string | null>(null)
  const [queenEmotion, setQueenEmotion] = useState<'smug' | 'angry' | 'worried' | 'stunned'>('smug')
  const [comboCount, setComboCount] = useState(0)
  const [showVictory, setShowVictory] = useState(false)
  const [lastPush, setLastPush] = useState<number>(0)

  const ROWS = 6
  const COLS = 6
  const VICTORY_THRESHOLD = 100
  const DEFEAT_THRESHOLD = -100

  // Initialize grid
  useEffect(() => {
    initializeGrid()
  }, [])

  // Update queen emotion based on meter
  useEffect(() => {
    if (queenStunned) {
      setQueenEmotion('stunned')
    } else if (tugMeter > 50) {
      setQueenEmotion('worried')
    } else if (tugMeter < -30) {
      setQueenEmotion('smug')
    } else {
      setQueenEmotion('angry')
    }
  }, [tugMeter, queenStunned])

  const initializeGrid = () => {
    const newGrid: GridCell[][] = []
    for (let row = 0; row < ROWS; row++) {
      const newRow: GridCell[] = []
      for (let col = 0; col < COLS; col++) {
        newRow.push(createCell(row, col))
      }
      newGrid.push(newRow)
    }
    setGrid(newGrid)
  }

  const createCell = (row: number, col: number, isSticky: boolean = false): GridCell => {
    const type = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)]
    return {
      id: `${row}-${col}-${Date.now()}-${Math.random()}`,
      type,
      row,
      col,
      isMatched: false,
      isSticky,
      stickyTurns: isSticky ? 2 : 0,
      isNew: false,
    }
  }

  // Find matches
  const findMatches = useCallback((currentGrid: GridCell[][]): Set<string> => {
    const matches = new Set<string>()

    // Horizontal matches
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS - 2; col++) {
        const type = currentGrid[row][col].type.id
        if (
          currentGrid[row][col + 1].type.id === type &&
          currentGrid[row][col + 2].type.id === type
        ) {
          matches.add(`${row}-${col}`)
          matches.add(`${row}-${col + 1}`)
          matches.add(`${row}-${col + 2}`)
          if (col + 3 < COLS && currentGrid[row][col + 3].type.id === type) {
            matches.add(`${row}-${col + 3}`)
          }
          if (col + 4 < COLS && currentGrid[row][col + 4].type.id === type) {
            matches.add(`${row}-${col + 4}`)
          }
        }
      }
    }

    // Vertical matches
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS - 2; row++) {
        const type = currentGrid[row][col].type.id
        if (
          currentGrid[row + 1][col].type.id === type &&
          currentGrid[row + 2][col].type.id === type
        ) {
          matches.add(`${row}-${col}`)
          matches.add(`${row + 1}-${col}`)
          matches.add(`${row + 2}-${col}`)
          if (row + 3 < ROWS && currentGrid[row + 3][col].type.id === type) {
            matches.add(`${row + 3}-${col}`)
          }
          if (row + 4 < ROWS && currentGrid[row + 4][col].type.id === type) {
            matches.add(`${row + 4}-${col}`)
          }
        }
      }
    }

    return matches
  }, [])

  // Process matches
  const processMatches = useCallback(async (currentGrid: GridCell[][]): Promise<{ newGrid: GridCell[][], hadMatches: boolean, matchCount: number, bigMatch: boolean }> => {
    const matches = findMatches(currentGrid)
    
    if (matches.size === 0) {
      return { newGrid: currentGrid, hadMatches: false, matchCount: 0, bigMatch: false }
    }

    // Handle sticky tiles - reduce their counter instead of removing
    const newGrid = currentGrid.map(row => row.map(cell => {
      if (matches.has(`${cell.row}-${cell.col}`)) {
        if (cell.isSticky && cell.stickyTurns > 1) {
          // Reduce sticky counter
          return { ...cell, stickyTurns: cell.stickyTurns - 1, isMatched: false }
        }
        return { ...cell, isMatched: true }
      }
      return cell
    }))

    const bigMatch = matches.size >= 4

    return { newGrid, hadMatches: true, matchCount: matches.size, bigMatch }
  }, [findMatches])

  // Apply gravity and fill
  const applyGravityAndFill = useCallback((currentGrid: GridCell[][]): GridCell[][] => {
    const newGrid: GridCell[][] = Array(ROWS).fill(null).map(() => Array(COLS).fill(null))

    for (let col = 0; col < COLS; col++) {
      let writeRow = ROWS - 1
      
      for (let row = ROWS - 1; row >= 0; row--) {
        if (!currentGrid[row][col].isMatched) {
          newGrid[writeRow][col] = {
            ...currentGrid[row][col],
            row: writeRow,
            isNew: false,
          }
          writeRow--
        }
      }

      while (writeRow >= 0) {
        newGrid[writeRow][col] = {
          ...createCell(writeRow, col),
          isNew: true,
        }
        writeRow--
      }
    }

    return newGrid
  }, [])

  // Queen's attack - spawn sticky caramel tiles
  const queenAttack = useCallback(() => {
    setQueenMessage("Taste my CARAMEL! 🍯")
    soundManager.playYuck()

    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => row.map(cell => ({ ...cell })))
      
      // Spawn 2-4 sticky tiles randomly
      const numSticky = 2 + Math.floor(Math.random() * 3)
      let placed = 0
      let attempts = 0
      
      while (placed < numSticky && attempts < 50) {
        const row = Math.floor(Math.random() * ROWS)
        const col = Math.floor(Math.random() * COLS)
        
        if (!newGrid[row][col].isSticky) {
          newGrid[row][col] = {
            ...newGrid[row][col],
            isSticky: true,
            stickyTurns: 2,
          }
          placed++
        }
        attempts++
      }
      
      return newGrid
    })

    // Queen pushes meter
    const pushAmount = 15 + Math.floor(Math.random() * 10)
    setTugMeter(prev => Math.max(DEFEAT_THRESHOLD, prev - pushAmount))

    setTimeout(() => setQueenMessage(null), 1500)
  }, [])

  // Handle cell swap
  const handleSwap = useCallback(async (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    if (isAnimating) return

    const rowDiff = Math.abs(fromRow - toRow)
    const colDiff = Math.abs(fromCol - toCol)
    if (!((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1))) {
      return
    }

    setIsAnimating(true)
    setSelectedCell(null)

    // Swap cells
    let newGrid = grid.map(row => row.map(cell => ({ ...cell })))
    const temp = { ...newGrid[fromRow][fromCol] }
    newGrid[fromRow][fromCol] = { ...newGrid[toRow][toCol], row: fromRow, col: fromCol }
    newGrid[toRow][toCol] = { ...temp, row: toRow, col: toCol }

    const { hadMatches, matchCount, bigMatch } = await processMatches(newGrid)

    if (!hadMatches) {
      soundManager.playWhoops()
      setIsAnimating(false)
      return
    }

    soundManager.playChomp()
    setGrid(newGrid)

    // Process cascades
    let cascadeCount = 0
    let totalMatches = matchCount
    let currentGrid = newGrid
    let hadBigMatch = bigMatch

    while (true) {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const { newGrid: markedGrid, hadMatches: hasMatches, matchCount: newMatchCount, bigMatch: newBigMatch } = await processMatches(currentGrid)
      
      if (!hasMatches) break
      
      cascadeCount++
      totalMatches += newMatchCount
      hadBigMatch = hadBigMatch || newBigMatch
      setComboCount(cascadeCount)

      setGrid(markedGrid)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      currentGrid = applyGravityAndFill(markedGrid)
      setGrid(currentGrid)
      
      if (cascadeCount > 1) {
        soundManager.playCombo(Math.min(cascadeCount, 5))
      }
    }

    // Calculate push amount
    const basePush = totalMatches * 3
    const comboPush = cascadeCount * 5
    const bigMatchBonus = hadBigMatch ? 10 : 0
    const totalPush = basePush + comboPush + bigMatchBonus

    setLastPush(totalPush)
    setTugMeter(prev => Math.min(VICTORY_THRESHOLD, prev + totalPush))
    setScore(prev => prev + totalMatches * 50 + cascadeCount * 100)

    // Big matches stun the queen
    if (hadBigMatch && !queenStunned) {
      setQueenStunned(true)
      setStunTurns(2)
      setQueenMessage("Ugh! You'll pay for that!")
      soundManager.playCombo(4)
      setTimeout(() => setQueenMessage(null), 1500)
    }

    // Check victory
    if (tugMeter + totalPush >= VICTORY_THRESHOLD) {
      setShowVictory(true)
      soundManager.playWin()
      setTimeout(() => onVictory(score, turnsLeft), 2000)
      setIsAnimating(false)
      return
    }

    // Reduce turns
    const newTurnsLeft = turnsLeft - 1
    setTurnsLeft(newTurnsLeft)

    // Queen's turn (if not stunned)
    if (!queenStunned) {
      setQueenPower(prev => prev + 1)
      
      // Queen attacks every 2-3 turns
      if (queenPower >= 2) {
        setTimeout(() => {
          queenAttack()
          setQueenPower(0)
        }, 500)
      }
    } else {
      // Reduce stun
      const newStunTurns = stunTurns - 1
      setStunTurns(newStunTurns)
      if (newStunTurns <= 0) {
        setQueenStunned(false)
        setQueenMessage("I'm back, you pest!")
        setTimeout(() => setQueenMessage(null), 1500)
      }
    }

    // Check defeat
    if (tugMeter - 20 <= DEFEAT_THRESHOLD || newTurnsLeft <= 0) {
      soundManager.playFail()
      setTimeout(() => onDefeat(), 1500)
    }

    setComboCount(0)
    setIsAnimating(false)
  }, [grid, isAnimating, processMatches, applyGravityAndFill, turnsLeft, score, tugMeter, queenStunned, stunTurns, queenPower, queenAttack, onVictory, onDefeat])

  const handleCellClick = (row: number, col: number) => {
    if (isAnimating) return

    if (!selectedCell) {
      setSelectedCell({ row, col })
      soundManager.playClick()
      return
    }

    if (selectedCell.row === row && selectedCell.col === col) {
      setSelectedCell(null)
      return
    }

    handleSwap(selectedCell.row, selectedCell.col, row, col)
  }

  const getQueenEmoji = () => {
    switch (queenEmotion) {
      case 'smug': return '😏'
      case 'angry': return '😤'
      case 'worried': return '😰'
      case 'stunned': return '😵'
      default: return '👸'
    }
  }

  const meterPercentage = ((tugMeter + 100) / 200) * 100

  return (
    <div className="min-h-screen p-4 flex flex-col">
      {/* Queen Area */}
      <div className="relative bg-gradient-to-b from-pink-900 via-purple-800 to-purple-900 rounded-3xl p-4 mb-4 overflow-hidden">
        {/* Stats */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-300" />
            <span className="text-white font-bold text-sm">Queen Carmella</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-300" />
            <span className="text-white font-bold text-sm">Turns: {turnsLeft}</span>
          </div>
        </div>

        {/* Tug of War Meter */}
        <div className="relative h-8 bg-gradient-to-r from-pink-600 via-gray-600 to-green-600 rounded-full overflow-hidden mb-3 border-4 border-white/30">
          {/* Center marker */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white z-10" />
          
          {/* Player push indicator */}
          <motion.div
            className="absolute top-1 bottom-1 w-6 bg-white rounded-full shadow-lg flex items-center justify-center z-20"
            style={{ left: `calc(${meterPercentage}% - 12px)` }}
            animate={{ left: `calc(${meterPercentage}% - 12px)` }}
            transition={{ type: 'spring', damping: 15 }}
          >
            🦝
          </motion.div>
          
          {/* Labels */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white">
            👸
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white">
            🏆
          </div>
        </div>

        {/* Push feedback */}
        <AnimatePresence>
          {lastPush > 0 && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -20 }}
              exit={{ opacity: 0 }}
              className="absolute top-16 right-4 text-green-400 font-black text-xl"
            >
              +{lastPush} →
            </motion.div>
          )}
        </AnimatePresence>

        {/* Queen Character */}
        <div className="flex items-center justify-center gap-4">
          <motion.div
            className="text-7xl"
            animate={{
              scale: queenStunned ? [1, 0.9, 1] : 1,
              rotate: queenStunned ? [0, -5, 5, 0] : 0,
            }}
            transition={{ repeat: queenStunned ? Infinity : 0, duration: 0.5 }}
          >
            👸
          </motion.div>
          <div className="text-5xl">
            {getQueenEmoji()}
          </div>
        </div>

        {/* Stun indicator */}
        {queenStunned && (
          <div className="text-center mt-2">
            <span className="bg-yellow-500 text-black px-3 py-1 rounded-full font-bold text-sm">
              ⭐ STUNNED ({stunTurns} turns) ⭐
            </span>
          </div>
        )}

        {/* Queen power meter */}
        {!queenStunned && (
          <div className="mt-3">
            <div className="text-xs text-white/70 mb-1">Caramel Power:</div>
            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
                animate={{ width: `${(queenPower / 2) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Queen message */}
        <AnimatePresence>
          {queenMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-pink-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg"
            >
              {queenMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <div className="bg-white/10 rounded-xl px-3 py-2 mb-3 text-center">
        <p className="text-white text-sm">
          <span className="text-green-400 font-bold">Match candies</span> to push the meter right! 
          <span className="text-yellow-400 font-bold"> 4+ matches</span> stun the Queen!
        </p>
      </div>

      {/* Game Grid */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className="grid gap-1 p-3 bg-gradient-to-br from-pink-600/30 to-purple-800/30 rounded-2xl backdrop-blur-md border-2 border-pink-400/30"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <motion.div
                key={cell.id}
                className={`aspect-square rounded-xl flex items-center justify-center text-3xl cursor-pointer border-2 transition-all relative ${
                  selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                    ? 'bg-yellow-300 border-yellow-400 scale-110 z-10'
                    : cell.isSticky
                    ? 'bg-amber-200 border-amber-400'
                    : 'bg-white/90 border-white/50 hover:scale-105'
                } ${cell.isMatched ? 'opacity-0 scale-0' : ''}`}
                style={{ minWidth: '45px', minHeight: '45px' }}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                animate={{ 
                  y: 0, 
                  opacity: cell.isMatched ? 0 : 1, 
                  scale: cell.isMatched ? 0 : 1 
                }}
              >
                {cell.type.emoji}
                {cell.isSticky && (
                  <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cell.stickyTurns}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Score */}
      <div className="flex justify-center gap-4 mt-4">
        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
          <span className="text-white font-bold">Score: {score.toLocaleString()}</span>
        </div>
        {comboCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-pink-500 px-4 py-2 rounded-full"
          >
            <span className="text-white font-black">💕 x{comboCount + 1} COMBO!</span>
          </motion.div>
        )}
      </div>

      {/* Victory Overlay */}
      <AnimatePresence>
        {showVictory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="bg-gradient-to-br from-pink-400 via-purple-400 to-pink-500 p-8 rounded-3xl text-center"
            >
              <div className="text-6xl mb-4">👑</div>
              <h2 className="text-4xl font-black text-white mb-2">VICTORY!</h2>
              <p className="text-white/90 text-lg">Queen Carmella has been dethroned!</p>
              <p className="text-yellow-200 font-bold mt-4 text-2xl">{score.toLocaleString()} points</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}