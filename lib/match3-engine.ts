import { CHRISTMAS_FOODS, MATCH_SCORES } from './game-config'

export type FoodType = typeof CHRISTMAS_FOODS[number]['id']
export type SpecialType = 'striped_h' | 'striped_v' | 'wrapped' | 'rainbow' | null

export interface Cell {
  id: string
  foodType: FoodType
  special: SpecialType
  row: number
  col: number
  matched: boolean
  falling: boolean
}

export interface Match {
  cells: Cell[]
  type: 'horizontal' | 'vertical' | 'both'
  length: number
}

export interface SwapResult {
  valid: boolean
  matches: Match[]
  score: number
}

export class Match3Engine {
  private grid: (Cell | null)[][] = []
  private rows: number
  private cols: number
  private nextId = 0

  constructor(rows: number, cols: number) {
    this.rows = rows
    this.cols = cols
    this.initializeGrid()
  }

  private getRandomFoodType(): FoodType {
    return CHRISTMAS_FOODS[Math.floor(Math.random() * CHRISTMAS_FOODS.length)].id
  }

  private createCell(row: number, col: number, foodType?: FoodType): Cell {
    return {
      id: `cell-${this.nextId++}`,
      foodType: foodType || this.getRandomFoodType(),
      special: null,
      row,
      col,
      matched: false,
      falling: false,
    }
  }

  initializeGrid(): void {
    this.grid = []
    for (let row = 0; row < this.rows; row++) {
      this.grid[row] = []
      for (let col = 0; col < this.cols; col++) {
        let cell: Cell
        let attempts = 0
        do {
          cell = this.createCell(row, col)
          attempts++
        } while (this.wouldCreateMatch(row, col, cell.foodType) && attempts < 10)

        this.grid[row][col] = cell
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

  getGrid(): (Cell | null)[][] {
    return this.grid
  }

  getCell(row: number, col: number): Cell | null {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return null
    }
    return this.grid[row][col]
  }

  canSwap(row1: number, col1: number, row2: number, col2: number): boolean {
    if (Math.abs(row1 - row2) + Math.abs(col1 - col2) !== 1) {
      return false
    }

    const cell1 = this.getCell(row1, col1)
    const cell2 = this.getCell(row2, col2)

    if (!cell1 || !cell2) return false

    this.grid[row1][col1] = cell2
    this.grid[row2][col2] = cell1
    cell1.row = row2
    cell1.col = col2
    cell2.row = row1
    cell2.col = col1

    const hasMatches = this.findMatches().length > 0

    this.grid[row1][col1] = cell1
    this.grid[row2][col2] = cell2
    cell1.row = row1
    cell1.col = col1
    cell2.row = row2
    cell2.col = col2

    return hasMatches
  }

  swap(row1: number, col1: number, row2: number, col2: number): SwapResult {
    const cell1 = this.getCell(row1, col1)
    const cell2 = this.getCell(row2, col2)

    if (!cell1 || !cell2) {
      return { valid: false, matches: [], score: 0 }
    }

    this.grid[row1][col1] = cell2
    this.grid[row2][col2] = cell1
    cell1.row = row2
    cell1.col = col2
    cell2.row = row1
    cell2.col = col1

    const matches = this.findMatches()

    if (matches.length === 0) {
      this.grid[row1][col1] = cell1
      this.grid[row2][col2] = cell2
      cell1.row = row1
      cell1.col = col1
      cell2.row = row2
      cell2.col = col2
      return { valid: false, matches: [], score: 0 }
    }

    const score = this.calculateScore(matches)
    return { valid: true, matches, score }
  }

  findMatches(): Match[] {
    const matches: Match[] = []
    const processed = new Set<string>()

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.grid[row][col]
        if (!cell || processed.has(cell.id)) continue

        const horizontalMatch = this.findHorizontalMatch(row, col)
        const verticalMatch = this.findVerticalMatch(row, col)

        if (horizontalMatch.length >= 3 && verticalMatch.length >= 3) {
          const combinedCells = [...new Set([...horizontalMatch, ...verticalMatch])]
          combinedCells.forEach(c => processed.add(c.id))
          matches.push({
            cells: combinedCells,
            type: 'both',
            length: combinedCells.length,
          })
        } else if (horizontalMatch.length >= 3) {
          horizontalMatch.forEach(c => processed.add(c.id))
          matches.push({
            cells: horizontalMatch,
            type: 'horizontal',
            length: horizontalMatch.length,
          })
        } else if (verticalMatch.length >= 3) {
          verticalMatch.forEach(c => processed.add(c.id))
          matches.push({
            cells: verticalMatch,
            type: 'vertical',
            length: verticalMatch.length,
          })
        }
      }
    }

    return matches
  }

  private findHorizontalMatch(row: number, col: number): Cell[] {
    const cell = this.grid[row][col]
    if (!cell) return []

    const matches: Cell[] = [cell]
    const foodType = cell.foodType

    for (let c = col - 1; c >= 0; c--) {
      const other = this.grid[row][c]
      if (other?.foodType === foodType) {
        matches.unshift(other)
      } else {
        break
      }
    }

    for (let c = col + 1; c < this.cols; c++) {
      const other = this.grid[row][c]
      if (other?.foodType === foodType) {
        matches.push(other)
      } else {
        break
      }
    }

    return matches
  }

  private findVerticalMatch(row: number, col: number): Cell[] {
    const cell = this.grid[row][col]
    if (!cell) return []

    const matches: Cell[] = [cell]
    const foodType = cell.foodType

    for (let r = row - 1; r >= 0; r--) {
      const other = this.grid[r][col]
      if (other?.foodType === foodType) {
        matches.unshift(other)
      } else {
        break
      }
    }

    for (let r = row + 1; r < this.rows; r++) {
      const other = this.grid[r][col]
      if (other?.foodType === foodType) {
        matches.push(other)
      } else {
        break
      }
    }

    return matches
  }

  private calculateScore(matches: Match[]): number {
    let totalScore = 0
    for (const match of matches) {
      const length = Math.min(match.length, 7)
      totalScore += MATCH_SCORES[length as keyof typeof MATCH_SCORES] || MATCH_SCORES[7]
    }
    return totalScore
  }

  removeMatches(matches: Match[]): void {
    for (const match of matches) {
      for (const cell of match.cells) {
        this.grid[cell.row][cell.col] = null
      }
    }
  }

  applyGravity(): boolean {
    let moved = false

    for (let col = 0; col < this.cols; col++) {
      let writeRow = this.rows - 1
      for (let row = this.rows - 1; row >= 0; row--) {
        const cell = this.grid[row][col]
        if (cell) {
          if (row !== writeRow) {
            this.grid[writeRow][col] = cell
            this.grid[row][col] = null
            cell.row = writeRow
            cell.falling = true
            moved = true
          }
          writeRow--
        }
      }
    }

    return moved
  }

  refillGrid(): void {
    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        if (!this.grid[row][col]) {
          this.grid[row][col] = this.createCell(row, col)
          this.grid[row][col]!.falling = true
        }
      }
    }
  }

  clearFallingFlags(): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.grid[row][col]
        if (cell) {
          cell.falling = false
        }
      }
    }
  }

  hasValidMoves(): boolean {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (col < this.cols - 1 && this.canSwap(row, col, row, col + 1)) {
          return true
        }
        if (row < this.rows - 1 && this.canSwap(row, col, row + 1, col)) {
          return true
        }
      }
    }
    return false
  }

  shuffle(): void {
    const cells: Cell[] = []
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.grid[row][col]
        if (cell) {
          cells.push(cell)
        }
      }
    }

    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[cells[i], cells[j]] = [cells[j], cells[i]]
    }

    let index = 0
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (cells[index]) {
          this.grid[row][col] = cells[index]
          cells[index].row = row
          cells[index].col = col
          index++
        }
      }
    }
  }
}
