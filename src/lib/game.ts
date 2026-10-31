import { cellName } from '@/lib/geometry'
import type { Cell } from '@/lib/grid'
import type { Placements } from '@/lib/rules'
import { puzzleStatus, type Puzzle } from '@/lib/solver'

/** What the player has done so far: who stands where, crossed-out cells, who is picked. */
export interface GameState {
  placements: Placements
  /** Cells the player ruled out, by map coordinate ("B3"). */
  crosses: string[]
  selected: string | null
}

export const emptyGame = (): GameState => ({ placements: {}, crosses: [], selected: null })

const personAt = (state: GameState, cell: Cell) =>
  Object.keys(state.placements).find((id) => cellName(state.placements[id]!) === cellName(cell))

/** Puts a person on a cell, moving them if already placed and freeing the cell first. */
const put = (state: GameState, person: string, cell: Cell): GameState => {
  const placements = { ...state.placements }
  const occupant = personAt(state, cell)
  if (occupant) delete placements[occupant]
  placements[person] = cell
  return {
    placements,
    crosses: state.crosses.filter((name) => name !== cellName(cell)),
    selected: null,
  }
}

/** Clicking a person in the cast picks them, or drops the pick if already picked. */
export const toggleSelection = (state: GameState, person: string): GameState => ({
  ...state,
  selected: state.selected === person ? null : person,
})

/**
 * Clicking a cell: empties it if taken (person or cross); otherwise places the
 * picked person, or crosses it out when nobody is picked.
 */
export const clickCell = (state: GameState, cell: Cell): GameState => {
  const name = cellName(cell)
  const occupant = personAt(state, cell)
  if (occupant) {
    const placements = { ...state.placements }
    delete placements[occupant]
    return { ...state, placements }
  }
  if (state.crosses.includes(name)) {
    return { ...state, crosses: state.crosses.filter((other) => other !== name) }
  }
  if (state.selected) return put(state, state.selected, cell)
  return { ...state, crosses: [...state.crosses, name] }
}

/** Dropping a dragged person on a cell replaces whatever was there. */
export const dropPerson = (state: GameState, person: string, cell: Cell): GameState =>
  put(state, person, cell)

/**
 * The verdict of the "Vérifier" button: everyone placed, one per row and per
 * column, on placeable cells, and every clue (the murder included) holding.
 * Judged on the rules rather than against data/solution.ts, so that any
 * placement the clues allow wins.
 */
export const isSolved = (puzzle: Puzzle, placements: Placements) => {
  const cells = puzzle.people.map((id) => placements[id])
  if (cells.some((cell) => !cell)) return false
  const placed = cells as Cell[]
  const distinct = (values: number[]) => new Set(values).size === values.length
  return (
    distinct(placed.map((cell) => cell.row)) &&
    distinct(placed.map((cell) => cell.col)) &&
    placed.every(({ row, col }) => puzzle.board.placeable[row]![col]) &&
    puzzleStatus(puzzle, placements) === 'ok'
  )
}
