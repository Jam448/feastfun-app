'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { soundManager } from '@/lib/sound-manager'
import { Sparkles, Shield, Heart, Zap } from 'lucide-react'

interface BossArmorPiece {
  id: string
  name: string
  health: number
  maxHealth: number
  position: { x: number; y: number }
  size: { width: number; height: number }
  colorTrigger: string // Which candy color damages this piece
  emoji: string
  destroyed: boolean
}

interface GingerbreadGolemProps {
  onVictory: (score: number, turnsRemaining: number) => void
  onDefeat: () => void
  maxTurns: number
}

const CANDY_TYPES = [
  { id: 'cookie', emoji: '🍪', color: '#D2691E', name: 'Cookie' },
  { id: 'candy_cane', emoji: '🍬', color: '#FF6B6B', name: 'Candy Cane' },
  { id: 'gingerbread', emoji: '🧑‍🍳', color: '#8B4513', name: 'Gingerbread' },
  { id: 'star', emoji: '⭐', color: '#FFD700', name: 'Star' },
  { id: 'tree', emoji: '🎄', color: '#228B22', name: 'Tree' },
  { id: 'gift', emoji: '🎁', color: '#DC143C', name: 'Gift' },
]

const INITIAL_ARMOR: BossArmorPiece[] = [
  { id: 'head', name: 'Frosted Crown', health: 3, maxHealth: 3, position: { x: 50, y: 8 }, size: { width: 20, height: 12 }, colorTrigger: 'star', emoji: '👑', destroyed: false },
  { id: 'left_eye', name: 'Gumdrop Eye', health: 2, maxHealth: 2, position: { x: 38, y: 22 }, size: { width: 10, height: 10 }, colorTrigger: 'candy_cane', emoji: '🔴', destroyed: false },
  { id: 'right_eye', name: 'Gumdrop Eye', health: 2, maxHealth: 2, position: { x: 52, y: 22 }, size: { width: 10, height: 10 }, colorTrigger: 'candy_cane', emoji: '🔴', destroyed: false },
  { id: 'button1', name: 'Chocolate Button', health: 2, maxHealth: 2, position: { x: 45, y: 45 }, size: { width: 10, height: 10 }, colorTrigger: 'cookie', emoji: '🟤', destroyed: false },
  { id: 'button2', name: 'Chocolate Button', health: 2, maxHealth: 2, position: { x: 45, y: 58 }, size: { width: 10, height: 10 }, colorTrigger: 'cookie', emoji: '🟤', destroyed: false },
  { id: 'left_arm', name: 'Candy Cane Arm', health: 3, maxHealth: 3, position: { x: 18, y: 40 }, size: { width: 15, height: 25 }, colorTrigger: 'tree', emoji: '🦾', destroyed: false },
  { id: 'right_arm', name: 'Candy Cane Arm', health: 3, maxHealth: 3, position: { x: 67, y: 40 }, size: { width: 15, height: 25 }, colorTrigger: 'tree', emoji: '🦾', destroyed: false },
  { id: 'core', name: 'Gingerbread Heart', health: 4, maxHealth: 4, position: { x: 40, y: 70 }, size: { width: 20, height: 15 }, colorTrigger: 'gingerbread', emoji: '💔', destroyed: false },
]

interface GridCell {
  id: string
  type: typeof CANDY_TYPES[number]
  row: number
  col: number
  isMatched: boolean
  isNew: boolean
}

export function GingerbreadGolemBattle({ onVictory, onDefeat, maxTurns }: GingerbreadGolemProps) {
  const [armor, setArmor] = useState<BossArmorPiece[]>(INITIAL_ARMOR)
  const [turnsLeft, setTurnsLeft] = useState(maxTurns)
  const [score, setScore] = useState(0)
  const [grid, setGrid] = useState<GridCell[][]>([])
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [bossMessage, setBossMessage] = useState<string | null>(null)
  const [damageFlash, setDamageFlash] = useState<string | null>(null)
  const [bossShaking, setBossShaking] = useState(false)
  const [comboCount, setComboCount] = useState(0)
  const [lastDamage, setLastDamage] = useState<{ pieceId: string; amount: number } | null>(null)
  const [showVictory, setShowVictory] = useState(false)
  const [stompWarning, setStompWarning] = useState(false)

  const gridRef = useRef<HTMLDivElement>(null)
  const ROWS = 6
  const COLS = 6

  // Initialize grid
  useEffect(() => {
    initializeGrid()
  }, [])

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

  const createCell = (row: number, col: number): GridCell => {
    const type = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)]
    return {
      id: `${row}-${col}-${Date.now()}-${Math.random()}`,
      type,
      row,
      col,
      isMatched: false,
      isNew: false,
    }
  }

  // Check for matches
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
          // Check for 4+ matches
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

  // Process matches and damage boss
  const processMatches = useCallback(async (currentGrid: GridCell[][]): Promise<{ newGrid: GridCell[][], hadMatches: boolean, matchedTypes: Map<string, number> }> => {
    const matches = findMatches(currentGrid)
    
    if (matches.size === 0) {
      return { newGrid: currentGrid, hadMatches: false, matchedTypes: new Map() }
    }

    // Count matched types
    const matchedTypes = new Map<string, number>()
    matches.forEach(key => {
      const [row, col] = key.split('-').map(Number)
      const type = currentGrid[row][col].type.id
      matchedTypes.set(type, (matchedTypes.get(type) || 0) + 1)
    })

    // Mark matched cells
    const newGrid = currentGrid.map(row => row.map(cell => ({
      ...cell,
      isMatched: matches.has(`${cell.row}-${cell.col}`)
    })))

    return { newGrid, hadMatches: true, matchedTypes }
  }, [findMatches])

  // Apply gravity and fill
  const applyGravityAndFill = useCallback((currentGrid: GridCell[][]): GridCell[][] => {
    const newGrid: GridCell[][] = Array(ROWS).fill(null).map(() => Array(COLS).fill(null))

    for (let col = 0; col < COLS; col++) {
      let writeRow = ROWS - 1
      
      // Move non-matched cells down
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

      // Fill empty spaces with new cells
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

  // Damage armor pieces based on matches
  const damageArmor = useCallback((matchedTypes: Map<string, number>) => {
    let totalDamage = 0
    const newArmor = armor.map(piece => {
      if (piece.destroyed) return piece
      
      const damage = matchedTypes.get(piece.colorTrigger) || 0
      if (damage > 0) {
        totalDamage += damage
        const newHealth = Math.max(0, piece.health - damage)
        
        setLastDamage({ pieceId: piece.id, amount: damage })
        setDamageFlash(piece.id)
        setTimeout(() => setDamageFlash(null), 300)

        if (newHealth === 0) {
          soundManager.playCombo(3)
          setBossMessage(`${piece.name} destroyed!`)
          setTimeout(() => setBossMessage(null), 1500)
        } else {
          soundManager.playMatch()
        }

        return {
          ...piece,
          health: newHealth,
          destroyed: newHealth === 0,
        }
      }
      return piece
    })

    if (totalDamage > 0) {
      setBossShaking(true)
      setTimeout(() => setBossShaking(false), 500)
      setScore(prev => prev + totalDamage * 100)
    }

    setArmor(newArmor)
    return newArmor
  }, [armor])

  // Boss stomp attack
  const bossStompAttack = useCallback(() => {
    setStompWarning(false)
    setBossMessage("STOMP! 💥")
    setBossShaking(true)
    soundManager.playYuck()

    // Shuffle bottom row
    setGrid(prevGrid => {
      const newGrid = [...prevGrid.map(row => [...row])]
      const bottomRow = newGrid[ROWS - 1]
      
      // Fisher-Yates shuffle
      for (let i = bottomRow.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = { ...bottomRow[i], col: j }
        bottomRow[i] = { ...bottomRow[j], col: i }
        bottomRow[j] = temp
      }
      
      return newGrid
    })

    setTimeout(() => {
      setBossMessage(null)
      setBossShaking(false)
    }, 1000)
  }, [])

  // Handle cell swap
  const handleSwap = useCallback(async (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    if (isAnimating) return

    // Check if adjacent
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

    // Check for matches
    const { hadMatches, matchedTypes } = await processMatches(newGrid)

    if (!hadMatches) {
      // Swap back
      soundManager.playWhoops()
      setIsAnimating(false)
      return
    }

    soundManager.playChomp()
    setGrid(newGrid)

    // Process cascades
    let cascadeCount = 0
    let currentGrid = newGrid
    let allMatchedTypes = new Map(matchedTypes)

    while (true) {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const { newGrid: markedGrid, hadMatches: hasMatches, matchedTypes: newMatchedTypes } = await processMatches(currentGrid)
      
      if (!hasMatches) break
      
      cascadeCount++
      setComboCount(cascadeCount)
      
      // Merge matched types
      newMatchedTypes.forEach((count, type) => {
        allMatchedTypes.set(type, (allMatchedTypes.get(type) || 0) + count)
      })

      setGrid(markedGrid)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      currentGrid = applyGravityAndFill(markedGrid)
      setGrid(currentGrid)
      
      if (cascadeCount > 1) {
        soundManager.playCombo(Math.min(cascadeCount, 5))
      }
    }

    // Damage boss
    const newArmor = damageArmor(allMatchedTypes)

    // Check victory
    if (newArmor.every(piece => piece.destroyed)) {
      setShowVictory(true)
      soundManager.playWin()
      setTimeout(() => onVictory(score, turnsLeft), 2000)
      setIsAnimating(false)
      return
    }

    // Reduce turns
    const newTurnsLeft = turnsLeft - 1
    setTurnsLeft(newTurnsLeft)

    // Boss stomp every 3 turns
    if (newTurnsLeft > 0 && newTurnsLeft % 3 === 0) {
      setStompWarning(true)
      setTimeout(() => bossStompAttack(), 1000)
    }

    // Check defeat
    if (newTurnsLeft <= 0) {
      soundManager.playFail()
      setTimeout(() => onDefeat(), 1500)
    }

    setComboCount(0)
    setIsAnimating(false)
  }, [grid, isAnimating, processMatches, applyGravityAndFill, damageArmor, turnsLeft, score, onVictory, onDefeat, bossStompAttack])

  // Handle cell click
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

  // Calculate armor pieces remaining
  const armorRemaining = armor.filter(p => !p.destroyed).length
  const totalArmor = armor.length

  return (
    <div className="min-h-screen p-4 flex flex-col">
      {/* Boss Area */}
      <div className="relative bg-gradient-to-b from-amber-900 via-amber-800 to-amber-700 rounded-3xl p-4 mb-4 overflow-hidden">
        {/* Boss health indicator */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-yellow-300" />
            <span className="text-white font-bold text-sm">Armor: {armorRemaining}/{totalArmor}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-300" />
            <span className="text-white font-bold text-sm">Turns: {turnsLeft}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-black/30 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-green-500"
            initial={{ width: '100%' }}
            animate={{ width: `${((totalArmor - armorRemaining) / totalArmor) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Gingerbread Golem */}
        <div 
          className={`relative h-48 ${bossShaking ? 'animate-pulse' : ''}`}
          style={{ 
            transform: bossShaking ? 'translateX(-5px)' : 'none',
            transition: 'transform 0.1s'
          }}
        >
          {/* Boss body */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-8xl" style={{ filter: armorRemaining === 0 ? 'grayscale(100%)' : 'none' }}>
              🧑‍🍳
            </div>
          </div>

          {/* Armor pieces as overlays */}
          {armor.map(piece => (
            <motion.div
              key={piece.id}
              className={`absolute flex flex-col items-center justify-center rounded-lg ${
                piece.destroyed 
                  ? 'opacity-20' 
                  : damageFlash === piece.id 
                    ? 'bg-red-500/50' 
                    : 'bg-black/20'
              }`}
              style={{
                left: `${piece.position.x}%`,
                top: `${piece.position.y}%`,
                width: `${piece.size.width}%`,
                height: `${piece.size.height}%`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                scale: damageFlash === piece.id ? [1, 1.2, 1] : 1,
                opacity: piece.destroyed ? 0.2 : 1,
              }}
            >
              {!piece.destroyed && (
                <>
                  <span className="text-lg">{piece.emoji}</span>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: piece.maxHealth }).map((_, i) => (
                      <Heart
                        key={i}
                        className={`w-3 h-3 ${i < piece.health ? 'text-red-500 fill-red-500' : 'text-gray-600'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          ))}

          {/* Boss message */}
          <AnimatePresence>
            {bossMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-full font-black text-lg shadow-lg"
              >
                {bossMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stomp warning */}
          <AnimatePresence>
            {stompWarning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded-full font-black animate-pulse"
              >
                ⚠️ STOMP INCOMING!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Color guide */}
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {CANDY_TYPES.slice(0, 4).map(candy => {
            const targetPiece = armor.find(p => p.colorTrigger === candy.id && !p.destroyed)
            return (
              <div
                key={candy.id}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                  targetPiece ? 'bg-white/20 text-white' : 'bg-black/20 text-white/50'
                }`}
              >
                <span>{candy.emoji}</span>
                <span>→</span>
                <span>{targetPiece?.emoji || '✓'}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Game Grid */}
      <div className="flex-1 flex items-center justify-center">
        <div
          ref={gridRef}
          className="grid gap-1 p-3 bg-gradient-to-br from-amber-600/30 to-amber-800/30 rounded-2xl backdrop-blur-md border-2 border-amber-400/30"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <motion.div
                key={cell.id}
                className={`aspect-square rounded-xl flex items-center justify-center text-3xl cursor-pointer border-2 transition-all ${
                  selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                    ? 'bg-yellow-300 border-yellow-400 scale-110 z-10'
                    : 'bg-white/90 border-white/50 hover:scale-105'
                } ${cell.isMatched ? 'opacity-0 scale-0' : ''} ${cell.isNew ? 'animate-bounce' : ''}`}
                style={{ minWidth: '45px', minHeight: '45px' }}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                initial={cell.isNew ? { y: -50, opacity: 0 } : false}
                animate={{ y: 0, opacity: cell.isMatched ? 0 : 1, scale: cell.isMatched ? 0 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {cell.type.emoji}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Score & Combo */}
      <div className="flex justify-center gap-4 mt-4">
        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
          <span className="text-white font-bold">Score: {score.toLocaleString()}</span>
        </div>
        {comboCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-orange-500 px-4 py-2 rounded-full"
          >
            <span className="text-white font-black">🔥 x{comboCount + 1} COMBO!</span>
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
              className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 p-8 rounded-3xl text-center"
            >
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-4xl font-black text-white mb-2">VICTORY!</h2>
              <p className="text-white/90 text-lg">The Gingerbread Golem crumbles!</p>
              <p className="text-yellow-200 font-bold mt-4 text-2xl">{score.toLocaleString()} points</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
