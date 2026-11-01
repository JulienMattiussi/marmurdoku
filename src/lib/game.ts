import { cellName } from '@/lib/geometry'
import type { Cell } from '@/lib/grid'
import type { Placements } from '@/lib/rules'
import { puzzleStatus, type Puzzle } from '@/lib/solver'

/**
 * What the player has done so far, everything the undo history keeps: who
 * stands where, crossed-out cells, and the positions noted for each suspect.
 * Who is picked in the cast is not part of it: undo never changes the pick.
 */
export interface GameState {
  placements: Placements
  /** Cells the player ruled out, by map coordinate ("B3"). */
  crosses: string[]
  /** Positions the player noted as possible, per suspect, by map coordinate. */
  notes: Record<string, string[]>
}

/** Placing on a cell, or noting it for the picked suspect. */
export type Mode = 'place' | 'note'

export const emptyGame = (): GameState => ({ placements: {}, crosses: [], notes: {} })

const personAt = (state: GameState, cell: Cell) =>
  Object.keys(state.placements).find((id) => cellName(state.placements[id]!) === cellName(cell))

/**
 * Puts a person on a cell, moving them if already placed and freeing the cell
 * first. The other suspects' notes on that row and column go: nobody else can
 * stand there any more. All of it is one move for undo.
 */
const put = (state: GameState, person: string, cell: Cell): GameState => {
  const placements = { ...state.placements }
  const occupant = personAt(state, cell)
  if (occupant) delete placements[occupant]
  placements[person] = cell
  const sameLine = (name: string) => {
    const col = name.charCodeAt(0) - 65
    const row = Number(name.slice(1)) - 1
    return row === cell.row || col === cell.col
  }
  const notes = Object.fromEntries(
    Object.entries(state.notes).map(([id, names]) => [
      id,
      id === person ? names : names.filter((name) => !sameLine(name)),
    ]),
  )
  return {
    placements,
    crosses: state.crosses.filter((name) => name !== cellName(cell)),
    notes,
  }
}

const toggleNote = (state: GameState, person: string, cell: Cell): GameState => {
  const name = cellName(cell)
  const current = state.notes[person] ?? []
  const notes = {
    ...state.notes,
    [person]: current.includes(name) ? current.filter((n) => n !== name) : [...current, name],
  }
  return { ...state, notes }
}

/**
 * Clicking a cell. With a suspect picked in "note" mode, notes or unnotes the
 * cell for them. Otherwise: empties the cell if taken (person or cross);
 * places the picked suspect; or crosses the cell out when nobody is picked,
 * which also clears every note on it.
 */
export const clickCell = (
  state: GameState,
  cell: Cell,
  selected: string | null,
  mode: Mode = 'place',
): GameState => {
  if (mode === 'note' && selected) return toggleNote(state, selected, cell)
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
  if (selected) return put(state, selected, cell)
  // A cross rules the cell out for everyone: its notes go with it, in the same move.
  const notes = Object.fromEntries(
    Object.entries(state.notes).map(([id, names]) => [id, names.filter((n) => n !== name)]),
  )
  return { ...state, crosses: [...state.crosses, name], notes }
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

/** What a click on a cell does: place or note for the picked suspect, cross out with nobody picked. */
export type Tool = Mode | 'cross'

/** What a click on a cell will do, for the cursor over the map and the toolbar. */
export const clickEffect = (selected: string | null, mode: Mode): Tool =>
  selected ? mode : 'cross'
