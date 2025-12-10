'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { soundManager } from '@/lib/sound-manager'
import { Droplets, Zap, Shield, Flame } from 'lucide-react'

interface BaronVonCocoaProps {
  onVictory: (score: number, turnsRemaining: number) => void
  onDefeat: () => void
  maxTurns: number
}

const CANDY_TYPES = [
  { id: 'chocolate', emoji: '🍫', color: '#8B4513', name: 'Chocolate', isChocolate: true },
  { id: 'cocoa', emoji: '☕', color: '#4A2C2A', name: 'Cocoa', isChocolate: true },
  { id: 'truffle', emoji: '🟤', color: '#5D4037', name: 'Truffle', isChocolate: true },
  { id: 'cookie', emoji: '🍪', color: '#D2691E', name: 'Cookie', isChocolate: false },
  { id: 'cake', emoji: '🎂', color: '#FFB6C1', name: 'Cake', isChocolate: false },
  { id: 'marshmallow', emoji: '☁️', color: '#FFFFFF', name: 'Marshmallow', isChocolate: false },
]

interface GridCell {
  id: string
  type: typeof CANDY_TYPES[number]
  row: number
  col: number
  isMatched: boolean
  isFlooded: boolean
  isBomb: boolean // Marshmallow bomb blocker
  isNew: boolean
}

export function BaronVonCocoaBattle({ onVictory, onDefeat, maxTurns }: BaronVonCocoaProps) {
  const [turnsLeft, setTurnsLeft] = useState(maxTurns)
  const [score, setScore] = useState(0)
  const [grid, setGrid] = useState<GridCell[][]>([])
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  
  // Flood mechanics
  const [floodLevel, setFloodLevel] = useState(0) // 0-6, each level floods one row from bottom
  const [cocoaCup, setCocoaCup] = useState(0) // Fill to 100 to win
  const [turnsSinceFlood, setTurnsSinceFlood] = useState(0)
  
  const [baronMessage, setBaronMessage] = useState<string | null>(null)
  const [baronPhase, setBaronPhase] = useState<'calm' | 'rising' | 'raging'>('calm')
  const [comboCount, setComboCount] = useState(0)
  const [showVictory, setShowVictory] = useState(false)
  const [showDefeat, setShowDefeat] = useState(false)
  const [chocolateMatched, setChocolateMatched] = useState(0)

  const ROWS = 7
  const COLS = 6
  const CUP_GOAL = 100
  const FLOOD_INTERVAL = 4 // Flood rises every X turns
  const MAX_FLOOD = 6 // Game over if flood reaches this

  // Initialize grid
  useEffect(() => {
    initializeGrid()
  }, [])

  // Update baron phase based on flood level
  useEffect(() => {
    if (floodLevel >= 4) {
      setBaronPhase('raging')
    } else if (floodLevel >= 2) {
      setBaronPhase('rising')
    } else {
      setBaronPhase('calm')
    }
  }, [floodLevel])

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

  const createCell = (row: number, col: number, isFlooded: boolean = false): GridCell => {
    // Slightly higher chance of chocolate types to help player
    const rand = Math.random()
    let type: typeof CANDY_TYPES[number]
    if (rand < 0.4) {
      // 40% chance of chocolate types
      const chocolateTypes = CANDY_TYPES.filter(t => t.isChocolate)
      type = chocolateTypes[Math.floor(Math.random() * chocolateTypes.length)]
    } else {
      type = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)]
    }
    
    return {
      id: `${row}-${col}-${Date.now()}-${Math.random()}`,
      type,
      row,
      col,
      isMatched: false,
      isFlooded,
      isBomb: false,
      isNew: false,
    }
  }

  // Apply flood to grid
  const applyFlood = useCallback((level: number, currentGrid: GridCell[][]) => {
    return currentGrid.map((row, rowIndex) => 
      row.map(cell => ({
        ...cell,
        isFlooded: rowIndex >= ROWS - level,
      }))
    )
  }, [])

  // Baron spawns marshmallow bombs
  const baronAttack = useCallback(() => {
    setBaronMessage("Catch these marshmallows! 💣")
    soundManager.playYuck()

    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => row.map(cell => ({ ...cell })))
      
      // Spawn 2-3 bombs in non-flooded area
      const numBombs = 2 + Math.floor(Math.random() * 2)
      let placed = 0
      let attempts = 0
      
      while (placed < numBombs && attempts < 50) {
        const maxRow = ROWS - floodLevel - 1
        if (maxRow < 0) break
        
        const row = Math.floor(Math.random() * (maxRow + 1))
        const col = Math.floor(Math.random() * COLS)
        
        if (!newGrid[row][col].isBomb && !newGrid[row][col].isFlooded) {
          newGrid[row][col] = {
            ...newGrid[row][col],
            isBomb: true,
            type: { id: 'bomb', emoji: '💣', color: '#333', name: 'Bomb', isChocolate: false },
          }
          placed++
        }
        attempts++
      }
      
      return newGrid
    })

    setTimeout(() => setBaronMessage(null), 1500)
  }, [floodLevel])

  // Find matches
  const findMatches = useCallback((currentGrid: GridCell[][]): Set<string> => {
    const matches = new Set<string>()

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS - 2; col++) {
        // Skip flooded cells
        if (currentGrid[row][col].isFlooded) continue
        
        const type = currentGrid[row][col].type.id
        if (type === 'bomb') continue // Bombs don't match
        
        if (
          !currentGrid[row][col + 1].isFlooded &&
          !currentGrid[row][col + 2].isFlooded &&
          currentGrid[row][col + 1].type.id === type &&
          currentGrid[row][col + 2].type.id === type
        ) {
          matches.add(`${row}-${col}`)
          matches.add(`${row}-${col + 1}`)
          matches.add(`${row}-${col + 2}`)
          if (col + 3 < COLS && !currentGrid[row][col + 3].isFlooded && currentGrid[row][col + 3].type.id === type) {
            matches.add(`${row}-${col + 3}`)
          }
        }
      }
    }

    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS - 2; row++) {
        if (currentGrid[row][col].isFlooded) continue
        
        const type = currentGrid[row][col].type.id
        if (type === 'bomb') continue
        
        if (
          !currentGrid[row + 1][col].isFlooded &&
          !currentGrid[row + 2][col].isFlooded &&
          currentGrid[row + 1][col].type.id === type &&
          currentGrid[row + 2][col].type.id === type
        ) {
          matches.add(`${row}-${col}`)
          matches.add(`${row + 1}-${col}`)
          matches.add(`${row + 2}-${col}`)
          if (row + 3 < ROWS && !currentGrid[row + 3][col].isFlooded && currentGrid[row + 3][col].type.id === type) {
            matches.add(`${row + 3}-${col}`)
          }
        }
      }
    }

    return matches
  }, [])

  // Process matches
  const processMatches = useCallback(async (currentGrid: GridCell[][]): Promise<{ 
    newGrid: GridCell[][], 
    hadMatches: boolean, 
    matchCount: number, 
    chocolateCount: number 
  }> => {
    const matches = findMatches(currentGrid)
    
    if (matches.size === 0) {
      return { newGrid: currentGrid, hadMatches: false, matchCount: 0, chocolateCount: 0 }
    }

    let chocolateCount = 0
    
    const newGrid = currentGrid.map(row => row.map(cell => {
      if (matches.has(`${cell.row}-${cell.col}`)) {
        if (cell.type.isChocolate) {
          chocolateCount++
        }
        return { ...cell, isMatched: true }
      }
      return cell
    }))

    return { newGrid, hadMatches: true, matchCount: matches.size, chocolateCount }
  }, [findMatches])

  // Apply gravity (only in non-flooded area)
  const applyGravityAndFill = useCallback((currentGrid: GridCell[][], currentFloodLevel: number): GridCell[][] => {
    const newGrid: GridCell[][] = Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
    const floodedRows = currentFloodLevel

    for (let col = 0; col < COLS; col++) {
      let writeRow = ROWS - floodedRows - 1
      
      // Keep flooded cells in place
      for (let row = ROWS - 1; row >= ROWS - floodedRows; row--) {
        if (row >= 0) {
          newGrid[row][col] = { ...currentGrid[row][col], row }
        }
      }
      
      // Move non-matched, non-flooded cells down
      for (let row = ROWS - floodedRows - 1; row >= 0; row--) {
        if (!currentGrid[row][col].isMatched && !currentGrid[row][col].isFlooded) {
          newGrid[writeRow][col] = {
            ...currentGrid[row][col],
            row: writeRow,
            isNew: false,
          }
          writeRow--
        }
      }

      // Fill empty spaces
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

  // Handle swap
  const handleSwap = useCallback(async (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    if (isAnimating) return

    // Can't swap flooded cells
    if (grid[fromRow][fromCol].isFlooded || grid[toRow][toCol].isFlooded) {
      soundManager.playWhoops()
      return
    }

    const rowDiff = Math.abs(fromRow - toRow)
    const colDiff = Math.abs(fromCol - toCol)
    if (!((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1))) {
      return
    }

    setIsAnimating(true)
    setSelectedCell(null)

    let newGrid = grid.map(row => row.map(cell => ({ ...cell })))
    const temp = { ...newGrid[fromRow][fromCol] }
    newGrid[fromRow][fromCol] = { ...newGrid[toRow][toCol], row: fromRow, col: fromCol }
    newGrid[toRow][toCol] = { ...temp, row: toRow, col: toCol }

    const { hadMatches, matchCount, chocolateCount } = await processMatches(newGrid)

    if (!hadMatches) {
      soundManager.playWhoops()
      setIsAnimating(false)
      return
    }

    soundManager.playChomp()
    setGrid(newGrid)

    let cascadeCount = 0
    let totalMatches = matchCount
    let totalChocolate = chocolateCount
    let currentGrid = newGrid

    while (true) {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const { newGrid: markedGrid, hadMatches: hasMatches, matchCount: newMatchCount, chocolateCount: newChocolate } = await processMatches(currentGrid)
      
      if (!hasMatches) break
      
      cascadeCount++
      totalMatches += newMatchCount
      totalChocolate += newChocolate
      setComboCount(cascadeCount)

      setGrid(markedGrid)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      currentGrid = applyGravityAndFill(markedGrid, floodLevel)
      setGrid(currentGrid)
      
      if (cascadeCount > 1) {
        soundManager.playCombo(Math.min(cascadeCount, 5))
      }
    }

    // Update cocoa cup with chocolate matches
    const cupIncrease = totalChocolate * 5 + (cascadeCount * 3)
    const newCupLevel = Math.min(CUP_GOAL, cocoaCup + cupIncrease)
    setCocoaCup(newCupLevel)
    setChocolateMatched(totalChocolate)
    setScore(prev => prev + totalMatches * 50 + totalChocolate * 100 + cascadeCount * 75)

    // Chocolate matches push back the flood
    if (totalChocolate >= 5) {
      const floodReduction = Math.floor(totalChocolate / 5)
      const newFloodLevel = Math.max(0, floodLevel - floodReduction)
      setFloodLevel(newFloodLevel)
      setGrid(prev => applyFlood(newFloodLevel, prev))
      setBaronMessage("No! My beautiful flood!")
      soundManager.playCombo(4)
      setTimeout(() => setBaronMessage(null), 1500)
    }

    // Check victory
    if (newCupLevel >= CUP_GOAL) {
      setShowVictory(true)
      soundManager.playWin()
      setTimeout(() => onVictory(score, turnsLeft), 2000)
      setIsAnimating(false)
      return
    }

    // Reduce turns
    const newTurnsLeft = turnsLeft - 1
    setTurnsLeft(newTurnsLeft)
    
    // Flood mechanics
    const newTurnsSinceFlood = turnsSinceFlood + 1
    setTurnsSinceFlood(newTurnsSinceFlood)

    if (newTurnsSinceFlood >= FLOOD_INTERVAL) {
      // Flood rises!
      const newFloodLevel = floodLevel + 1
      setFloodLevel(newFloodLevel)
      setTurnsSinceFlood(0)
      setBaronMessage("THE FLOOD RISES! 🌊")
      soundManager.playYuck()
      
      setGrid(prev => applyFlood(newFloodLevel, prev))
      
      setTimeout(() => setBaronMessage(null), 1500)

      // Check defeat by flood
      if (newFloodLevel >= MAX_FLOOD) {
        setShowDefeat(true)
        soundManager.playFail()
        setTimeout(() => onDefeat(), 1500)
        setIsAnimating(false)
        return
      }
    }

    // Baron attacks occasionally
    if (Math.random() < 0.25 && baronPhase !== 'calm') {
      setTimeout(() => baronAttack(), 800)
    }

    // Check defeat by turns
    if (newTurnsLeft <= 0) {
      soundManager.playFail()
      setTimeout(() => onDefeat(), 1500)
    }

    setComboCount(0)
    setChocolateMatched(0)
    setIsAnimating(false)
  }, [grid, isAnimating, processMatches, applyGravityAndFill, floodLevel, cocoaCup, turnsLeft, turnsSinceFlood, score, baronPhase, baronAttack, applyFlood, onVictory, onDefeat])

  const handleCellClick = (row: number, col: number) => {
    if (isAnimating) return
    if (grid[row][col].isFlooded) return

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

  const getBaronEmoji = () => {
    switch (baronPhase) {
      case 'calm': return '🎩'
      case 'rising': return '😈'
      case 'raging': return '👿'
      default: return '🎩'
    }
  }

  return (
    <div className="min-h-screen p-4 flex flex-col bg-gradient-to-b from-amber-950 to-stone-950">
      {/* Baron Area */}
      <div className="relative bg-gradient-to-b from-amber-900 via-stone-800 to-stone-900 rounded-3xl p-4 mb-4 overflow-hidden">
        {/* Stats */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-amber-400" />
            <span className="text-white font-bold text-sm">
              Flood: {floodLevel}/{MAX_FLOOD}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-300" />
            <span className="text-white font-bold text-sm">Turns: {turnsLeft}</span>
          </div>
        </div>

        {/* Cocoa Cup Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-white/70 mb-1">
            <span>☕ Cocoa Cup</span>
            <span>{cocoaCup}/{CUP_GOAL}</span>
          </div>
          <div className="h-4 bg-black/30 rounded-full overflow-hidden border-2 border-amber-600/50">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400"
              animate={{ width: `${(cocoaCup / CUP_GOAL) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-amber-300 mt-1 text-center">
            Match 🍫☕🟤 to fill the cup and drain the flood!
          </p>
        </div>

        {/* Flood timer */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-white/70 text-xs">Next flood in:</span>
          <div className="flex gap-1">
            {Array.from({ length: FLOOD_INTERVAL }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < FLOOD_INTERVAL - turnsSinceFlood 
                    ? 'bg-amber-500' 
                    : 'bg-red-500 animate-pulse'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Baron */}
        <div className="flex items-center justify-center">
          <motion.div
            className="text-6xl"
            animate={{
              y: baronPhase === 'raging' ? [0, -5, 0] : 0,
            }}
            transition={{ repeat: baronPhase === 'raging' ? Infinity : 0, duration: 0.3 }}
          >
            {getBaronEmoji()}
          </motion.div>
        </div>

        {/* Baron message */}
        <AnimatePresence>
          {baronMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-700 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg"
            >
              {baronMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chocolate matched feedback */}
        <AnimatePresence>
          {chocolateMatched > 0 && (
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 1.5, y: -30 }}
              className="absolute top-20 left-1/2 -translate-x-1/2 text-amber-300 font-black text-xl"
            >
              +{chocolateMatched * 5} ☕
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Game Grid */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className="grid gap-1 p-3 bg-gradient-to-br from-amber-800/30 to-stone-900/30 rounded-2xl backdrop-blur-md border-2 border-amber-600/30 relative overflow-hidden"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        >
          {/* Flood overlay */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-800/90 via-amber-700/70 to-transparent pointer-events-none z-10"
            animate={{ height: `${(floodLevel / ROWS) * 100}%` }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIzIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMikiLz48L3N2Zz4=')] opacity-30" />
          </motion.div>

          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <motion.div
                key={cell.id}
                className={`aspect-square rounded-xl flex items-center justify-center text-2xl cursor-pointer border-2 transition-all relative ${
                  cell.isFlooded
                    ? 'bg-amber-800/50 border-amber-600/50 cursor-not-allowed'
                    : selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                    ? 'bg-yellow-300 border-yellow-400 scale-110 z-20'
                    : cell.isBomb
                    ? 'bg-gray-700 border-gray-500'
                    : 'bg-white/90 border-white/50 hover:scale-105'
                } ${cell.isMatched ? 'opacity-0 scale-0' : ''}`}
                style={{ minWidth: '42px', minHeight: '42px' }}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                animate={{ 
                  opacity: cell.isMatched ? 0 : cell.isFlooded ? 0.5 : 1,
                  scale: cell.isMatched ? 0 : 1,
                }}
              >
                {!cell.isFlooded && cell.type.emoji}
                {cell.isFlooded && <span className="text-amber-300/50">〰️</span>}
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
            className="bg-amber-600 px-4 py-2 rounded-full"
          >
            <span className="text-white font-black">☕ x{comboCount + 1}!</span>
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
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-8 rounded-3xl text-center"
            >
              <div className="text-6xl mb-4">☕</div>
              <h2 className="text-4xl font-black text-white mb-2">VICTORY!</h2>
              <p className="text-white/90 text-lg">The cocoa flood recedes!</p>
              <p className="text-yellow-200 font-bold mt-4 text-2xl">{score.toLocaleString()} points</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Defeat Overlay */}
      <AnimatePresence>
        {showDefeat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-amber-950/90 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🌊</div>
              <h2 className="text-4xl font-black text-amber-300 mb-2">DROWNED!</h2>
              <p className="text-amber-200/80 text-lg">The cocoa flood claims another...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
