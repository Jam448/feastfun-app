export type FoodType = 'candy_cane' | 'gingerbread' | 'cookie' | 'cupcake' | 'pudding' | 'pie'

export type SpecialType =
  | 'none'
  | 'striped_horizontal'
  | 'striped_vertical'
  | 'wrapped'
  | 'color_bomb'
  | 'rainbow'

export interface Cell {
  id: string
  row: number
  col: number
  foodType: FoodType
  specialType: SpecialType
  isMatched: boolean
  isFalling: boolean
  isNew: boolean
  isBeingEaten: boolean
}

export interface Match {
  cells: Cell[]
  type: 'horizontal' | 'vertical' | 'L' | 'T' | 'plus' | 'box' | 'diagonal'
  length: number
}

export interface MoveResult {
  isValid: boolean
  matches: Match[]
  score: number
  cascade: boolean
  specialsCreated: SpecialType[]
  matchInfo?: {
    largestMatch: number
    totalMatches: number
    matchTypes: string[]
  }
}

const FOOD_EMOJIS: Record<FoodType, string> = {
  candy_cane: '🍬',
  gingerbread: '🍪',
  cookie: '🥠',
  cupcake: '🧁',
  pudding: '🍮',
  pie: '🥧',
}

export class AdvancedMatch3Engine {
  private grid: (Cell | null)[][]
  private rows: number
  private cols: number
  private comboMultiplier: number = 1

  constructor(rows: number = 8, cols: number = 8) {
    this.rows = rows
    this.cols = cols
    this.grid = []
    this.initializeGrid()
  }

  private generateRandomFood(): FoodType {
    const foods: FoodType[] = ['candy_cane', 'gingerbread', 'cookie', 'cupcake', 'pudding', 'pie']
    return foods[Math.floor(Math.random() * foods.length)]
  }

  private createCell(row: number, col: number, foodType?: FoodType, specialType: SpecialType = 'none'): Cell {
    return {
      id: `${row}-${col}-${Date.now()}-${Math.random()}`,
      row,
      col,
      foodType: foodType || this.generateRandomFood(),
      specialType,
      isMatched: false,
      isFalling: false,
      isNew: false,
      isBeingEaten: false,
    }
  }

  private initializeGrid(): void {
    this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null))

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        let foodType: FoodType
        let attempts = 0

        do {
          foodType = this.generateRandomFood()
          attempts++
        } while (attempts < 10 && this.wouldCreateMatch(row, col, foodType))

        this.grid[row][col] = this.createCell(row, col, foodType)
      }
    }
  }

  private wouldCreateMatch(row: number, col: number, foodType: FoodType): boolean {
    let horizontalCount = 1
    for (let c = col - 1; c >= 0 && this.grid[row]?.[c]?.foodType === foodType; c--) {
      horizontalCount++
    }
    for (let c = col + 1; c < this.cols && this.grid[row]?.[c]?.foodType === foodType; c++) {
      horizontalCount++
    }
    if (horizontalCount >= 3) return true

    let verticalCount = 1
    for (let r = row - 1; r >= 0 && this.grid[r]?.[col]?.foodType === foodType; r--) {
      verticalCount++
    }
    for (let r = row + 1; r < this.rows && this.grid[r]?.[col]?.foodType === foodType; r++) {
      verticalCount++
    }
    if (verticalCount >= 3) return true

    return false
  }

  canSwap(row1: number, col1: number, row2: number, col2: number): boolean {
    const cell1 = this.grid[row1]?.[col1]
    const cell2 = this.grid[row2]?.[col2]

    if (!cell1 || !cell2) return false

    const rowDiff = Math.abs(row1 - row2)
    const colDiff = Math.abs(col1 - col2)

    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
  }

  swap(row1: number, col1: number, row2: number, col2: number): MoveResult {
    if (!this.canSwap(row1, col1, row2, col2)) {
      return { isValid: false, matches: [], score: 0, cascade: false, specialsCreated: [] }
    }

    const temp = this.grid[row1][col1]
    this.grid[row1][col1] = this.grid[row2][col2]
    this.grid[row2][col2] = temp

    if (this.grid[row1][col1]) {
      this.grid[row1][col1]!.row = row1
      this.grid[row1][col1]!.col = col1
    }
    if (this.grid[row2][col2]) {
      this.grid[row2][col2]!.row = row2
      this.grid[row2][col2]!.col = col2
    }

    const initialMatches = this.findAllMatches()

    if (initialMatches.length === 0) {
      const temp = this.grid[row1][col1]
      this.grid[row1][col1] = this.grid[row2][col2]
      this.grid[row2][col2] = temp

      if (this.grid[row1][col1]) {
        this.grid[row1][col1]!.row = row1
        this.grid[row1][col1]!.col = col1
      }
      if (this.grid[row2][col2]) {
        this.grid[row2][col2]!.row = row2
        this.grid[row2][col2]!.col = col2
      }

      return { isValid: false, matches: [], score: 0, cascade: false, specialsCreated: [] }
    }

    this.comboMultiplier = 1
    const result = this.processAllMatches()

    return result
  }

  private processAllMatches(): MoveResult {
    let totalScore = 0
    const allSpecialsCreated: SpecialType[] = []
    let iterations = 0
    const maxIterations = 20
    let hadCascade = false
    let largestMatch = 0
    let totalMatches = 0
    const matchTypes: string[] = []

    while (iterations < maxIterations) {
      const matches = this.findAllMatches()

      if (matches.length === 0) {
        break
      }

      if (iterations > 0) {
        hadCascade = true
        this.comboMultiplier += 0.5
      }

      const cellsToRemove = new Set<string>()
      const specialsToCreate: Array<{ row: number; col: number; foodType: FoodType; special: SpecialType }> = []

      for (const match of matches) {
        largestMatch = Math.max(largestMatch, match.length)
        totalMatches++

        if (match.length >= 5) {
          matchTypes.push(`${match.length}-piece`)
        }

        let baseScore = 0

        if (match.length === 3) {
          baseScore = 60
        } else if (match.length === 4) {
          baseScore = 120
        } else if (match.length === 5) {
          baseScore = 200
        } else if (match.length === 6) {
          baseScore = 400
        } else {
          baseScore = 800
        }

        if (match.type === 'box') {
          baseScore = Math.floor(baseScore * 1.5)
        } else if (match.type === 'diagonal') {
          baseScore = Math.floor(baseScore * 2.0)
        } else if (match.type === 'L' || match.type === 'T' || match.type === 'plus') {
          baseScore = Math.floor(baseScore * 1.75)
        }

        const score = Math.floor(baseScore * this.comboMultiplier)
        totalScore += score

        const special = this.determineSpecialCandy(match)
        if (special !== 'none' && match.cells.length > 0) {
          allSpecialsCreated.push(special)
          const centerCell = match.cells[Math.floor(match.cells.length / 2)]
          specialsToCreate.push({
            row: centerCell.row,
            col: centerCell.col,
            foodType: centerCell.foodType,
            special
          })
        }

        for (const cell of match.cells) {
          cellsToRemove.add(`${cell.row}-${cell.col}`)
        }
      }

      for (const special of specialsToCreate) {
        cellsToRemove.delete(`${special.row}-${special.col}`)
      }

      for (const cellKey of cellsToRemove) {
        const [row, col] = cellKey.split('-').map(Number)
        if (this.grid[row]?.[col]) {
          this.grid[row][col]!.isBeingEaten = true
        }
      }

      for (const cellKey of cellsToRemove) {
        const [row, col] = cellKey.split('-').map(Number)
        if (this.grid[row]?.[col]) {
          this.grid[row][col] = null
        }
      }

      for (const special of specialsToCreate) {
        this.createSpecialAtPosition(special.row, special.col, special.foodType, special.special)
      }

      this.applyGravity()
      this.fillEmpty()

      iterations++
    }

    if (iterations >= maxIterations) {
      console.warn('Max cascade iterations reached')
    }

    return {
      isValid: true,
      matches: [],
      score: Math.floor(totalScore),
      cascade: hadCascade,
      specialsCreated: allSpecialsCreated,
      matchInfo: {
        largestMatch,
        totalMatches,
        matchTypes
      }
    }
  }

  private determineSpecialCandy(match: Match): SpecialType {
    if (match.length >= 5) {
      return 'color_bomb'
    }

    if (match.type === 'box') {
      return 'wrapped'
    }

    if (match.type === 'diagonal' && match.length >= 5) {
      return 'color_bomb'
    }

    if (match.type === 'diagonal' && match.length === 4) {
      return 'wrapped'
    }

    if (match.type === 'L' || match.type === 'T' || match.type === 'plus') {
      return 'wrapped'
    }

    if (match.length === 4) {
      return match.type === 'horizontal' ? 'striped_horizontal' : 'striped_vertical'
    }

    return 'none'
  }

  private createSpecialAtPosition(row: number, col: number, foodType: FoodType, specialType: SpecialType): void {
    this.grid[row][col] = this.createCell(row, col, foodType, specialType)
  }

  private findAllMatches(): Match[] {
    const matches: Match[] = []
    const processed = new Set<string>()

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.grid[row]?.[col]
        if (!cell || processed.has(cell.id)) continue

        const boxMatch = this.findBoxMatch(row, col)
        const diagonalMatch = this.findDiagonalMatch(row, col)
        const horizontalMatch = this.findHorizontalMatch(row, col)
        const verticalMatch = this.findVerticalMatch(row, col)
        const lShapeMatch = this.findLShapeMatch(row, col)
        const tShapeMatch = this.findTShapeMatch(row, col)
        const plusMatch = this.findPlusMatch(row, col)

        if (plusMatch.length >= 5) {
          matches.push({ cells: plusMatch, type: 'plus', length: plusMatch.length })
          plusMatch.forEach(c => processed.add(c.id))
        } else if (tShapeMatch.length >= 5) {
          matches.push({ cells: tShapeMatch, type: 'T', length: tShapeMatch.length })
          tShapeMatch.forEach(c => processed.add(c.id))
        } else if (lShapeMatch.length >= 5) {
          matches.push({ cells: lShapeMatch, type: 'L', length: lShapeMatch.length })
          lShapeMatch.forEach(c => processed.add(c.id))
        } else if (diagonalMatch.length >= 4) {
          matches.push({ cells: diagonalMatch, type: 'diagonal', length: diagonalMatch.length })
          diagonalMatch.forEach(c => processed.add(c.id))
        } else if (boxMatch.length >= 4) {
          matches.push({ cells: boxMatch, type: 'box', length: boxMatch.length })
          boxMatch.forEach(c => processed.add(c.id))
        } else {
          if (horizontalMatch.length >= 3) {
            matches.push({ cells: horizontalMatch, type: 'horizontal', length: horizontalMatch.length })
            horizontalMatch.forEach(c => processed.add(c.id))
          }
          if (verticalMatch.length >= 3) {
            matches.push({ cells: verticalMatch, type: 'vertical', length: verticalMatch.length })
            verticalMatch.forEach(c => processed.add(c.id))
          }
        }
      }
    }

    return matches
  }

  private findHorizontalMatch(row: number, col: number): Cell[] {
    const cell = this.grid[row]?.[col]
    if (!cell) return []

    const matches: Cell[] = [cell]
    const foodType = cell.foodType

    for (let c = col - 1; c >= 0; c--) {
      const other = this.grid[row]?.[c]
      if (other?.foodType === foodType) {
        matches.unshift(other)
      } else {
        break
      }
    }

    for (let c = col + 1; c < this.cols; c++) {
      const other = this.grid[row]?.[c]
      if (other?.foodType === foodType) {
        matches.push(other)
      } else {
        break
      }
    }

    return matches
  }

  private findVerticalMatch(row: number, col: number): Cell[] {
    const cell = this.grid[row]?.[col]
    if (!cell) return []

    const matches: Cell[] = [cell]
    const foodType = cell.foodType

    for (let r = row - 1; r >= 0; r--) {
      const other = this.grid[r]?.[col]
      if (other?.foodType === foodType) {
        matches.unshift(other)
      } else {
        break
      }
    }

    for (let r = row + 1; r < this.rows; r++) {
      const other = this.grid[r]?.[col]
      if (other?.foodType === foodType) {
        matches.push(other)
      } else {
        break
      }
    }

    return matches
  }

  private findLShapeMatch(row: number, col: number): Cell[] {
    const horizontal = this.findHorizontalMatch(row, col)
    const vertical = this.findVerticalMatch(row, col)

    if (horizontal.length >= 3 && vertical.length >= 3) {
      const combined = new Set([...horizontal, ...vertical])
      return Array.from(combined)
    }

    return []
  }

  private findTShapeMatch(row: number, col: number): Cell[] {
    const horizontal = this.findHorizontalMatch(row, col)
    const vertical = this.findVerticalMatch(row, col)

    if (horizontal.length >= 3 && vertical.length >= 3) {
      const cell = this.grid[row]?.[col]
      if (cell && horizontal.includes(cell) && vertical.includes(cell)) {
        const combined = new Set([...horizontal, ...vertical])
        return Array.from(combined)
      }
    }

    return []
  }

  private findPlusMatch(row: number, col: number): Cell[] {
    const horizontal = this.findHorizontalMatch(row, col)
    const vertical = this.findVerticalMatch(row, col)

    if (horizontal.length >= 3 && vertical.length >= 3 && horizontal.length + vertical.length >= 7) {
      const combined = new Set([...horizontal, ...vertical])
      return Array.from(combined)
    }

    return []
  }

  private findBoxMatch(row: number, col: number): Cell[] {
    const cell = this.grid[row]?.[col]
    if (!cell) return []

    const foodType = cell.foodType
    const matches: Cell[] = []

    if (row + 1 < this.rows && col + 1 < this.cols) {
      const topLeft = this.grid[row]?.[col]
      const topRight = this.grid[row]?.[col + 1]
      const bottomLeft = this.grid[row + 1]?.[col]
      const bottomRight = this.grid[row + 1]?.[col + 1]

      if (
        topLeft?.foodType === foodType &&
        topRight?.foodType === foodType &&
        bottomLeft?.foodType === foodType &&
        bottomRight?.foodType === foodType
      ) {
        matches.push(topLeft, topRight, bottomLeft, bottomRight)
      }
    }

    return matches
  }

  private findDiagonalMatch(row: number, col: number): Cell[] {
    const cell = this.grid[row]?.[col]
    if (!cell) return []

    const foodType = cell.foodType
    let matches: Cell[] = []

    const downRight: Cell[] = [cell]
    for (let i = 1; i < 5; i++) {
      const r = row + i
      const c = col + i
      if (r >= this.rows || c >= this.cols) break
      const other = this.grid[r]?.[c]
      if (other?.foodType === foodType) {
        downRight.push(other)
      } else {
        break
      }
    }
    if (downRight.length >= 4) {
      matches = downRight
    }

    const downLeft: Cell[] = [cell]
    for (let i = 1; i < 5; i++) {
      const r = row + i
      const c = col - i
      if (r >= this.rows || c < 0) break
      const other = this.grid[r]?.[c]
      if (other?.foodType === foodType) {
        downLeft.push(other)
      } else {
        break
      }
    }
    if (downLeft.length >= 4 && downLeft.length > matches.length) {
      matches = downLeft
    }

    const upRight: Cell[] = [cell]
    for (let i = 1; i < 5; i++) {
      const r = row - i
      const c = col + i
      if (r < 0 || c >= this.cols) break
      const other = this.grid[r]?.[c]
      if (other?.foodType === foodType) {
        upRight.push(other)
      } else {
        break
      }
    }
    if (upRight.length >= 4 && upRight.length > matches.length) {
      matches = upRight
    }

    const upLeft: Cell[] = [cell]
    for (let i = 1; i < 5; i++) {
      const r = row - i
      const c = col - i
      if (r < 0 || c < 0) break
      const other = this.grid[r]?.[c]
      if (other?.foodType === foodType) {
        upLeft.push(other)
      } else {
        break
      }
    }
    if (upLeft.length >= 4 && upLeft.length > matches.length) {
      matches = upLeft
    }

    return matches
  }

  private applyGravity(): void {
    for (let col = 0; col < this.cols; col++) {
      let emptyRow = this.rows - 1

      for (let row = this.rows - 1; row >= 0; row--) {
        if (this.grid[row][col] !== null) {
          if (row !== emptyRow) {
            this.grid[emptyRow][col] = this.grid[row][col]
            if (this.grid[emptyRow][col]) {
              this.grid[emptyRow][col]!.row = emptyRow
              this.grid[emptyRow][col]!.isFalling = true
            }
            this.grid[row][col] = null
          }
          emptyRow--
        }
      }
    }
  }

  private fillEmpty(): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.grid[row][col] === null) {
          const cell = this.createCell(row, col)
          cell.isNew = true
          this.grid[row][col] = cell
        }
      }
    }
  }

  activateSpecial(row: number, col: number): { score: number; affectedCells: Cell[] } {
    const cell = this.grid[row]?.[col]
    if (!cell || cell.specialType === 'none') {
      return { score: 0, affectedCells: [] }
    }

    const affectedCells: Cell[] = []
    let score = 0

    switch (cell.specialType) {
      case 'striped_horizontal':
        for (let c = 0; c < this.cols; c++) {
          const targetCell = this.grid[row][c]
          if (targetCell) {
            affectedCells.push(targetCell)
            this.grid[row][c] = null
          }
        }
        score = this.cols * 20
        break

      case 'striped_vertical':
        for (let r = 0; r < this.rows; r++) {
          const targetCell = this.grid[r][col]
          if (targetCell) {
            affectedCells.push(targetCell)
            this.grid[r][col] = null
          }
        }
        score = this.rows * 20
        break

      case 'wrapped':
        for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
          for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
            const targetCell = this.grid[r][c]
            if (targetCell) {
              affectedCells.push(targetCell)
              this.grid[r][c] = null
            }
          }
        }
        score = affectedCells.length * 30
        break

      case 'color_bomb':
        const targetType = cell.foodType
        for (let r = 0; r < this.rows; r++) {
          for (let c = 0; c < this.cols; c++) {
            const targetCell = this.grid[r][c]
            if (targetCell && targetCell.foodType === targetType) {
              affectedCells.push(targetCell)
              this.grid[r][c] = null
            }
          }
        }
        score = affectedCells.length * 50
        break
    }

    this.applyGravity()
    this.fillEmpty()

    return { score, affectedCells }
  }

  getGrid(): (Cell | null)[][] {
    return this.grid
  }

  getCell(row: number, col: number): Cell | null {
    return this.grid[row]?.[col] || null
  }

  hasAvailableMoves(): boolean {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (col < this.cols - 1) {
          let temp = this.grid[row][col]
          this.grid[row][col] = this.grid[row][col + 1]
          this.grid[row][col + 1] = temp

          const hasMatch = this.findAllMatches().length > 0

          temp = this.grid[row][col]
          this.grid[row][col] = this.grid[row][col + 1]
          this.grid[row][col + 1] = temp

          if (hasMatch) return true
        }

        if (row < this.rows - 1) {
          let temp = this.grid[row][col]
          this.grid[row][col] = this.grid[row + 1][col]
          this.grid[row + 1][col] = temp

          const hasMatch = this.findAllMatches().length > 0

          temp = this.grid[row][col]
          this.grid[row][col] = this.grid[row + 1][col]
          this.grid[row + 1][col] = temp

          if (hasMatch) return true
        }
      }
    }

    return false
  }
}

export { FOOD_EMOJIS }
