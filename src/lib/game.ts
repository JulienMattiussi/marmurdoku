import { cellName } from '@/lib/geometry'
import type { Cell } from '@/lib/grid'
import type { Placements } from '@/lib/rules'
import { brokenClues, type ClueRef, type Puzzle } from '@/lib/solver'

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

/** What the cross card carries when dragged, in place of a suspect's id. */
export const CROSS = 'cross'

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

/** Crosses a cell out over whoever stood there; a cross rules the cell out for everyone, so its notes go too. */
const crossOut = (state: GameState, cell: Cell): GameState => {
  const name = cellName(cell)
  const placements = { ...state.placements }
  const occupant = personAt(state, cell)
  if (occupant) delete placements[occupant]
  return {
    placements,
    crosses: state.crosses.includes(name) ? state.crosses : [...state.crosses, name],
    notes: Object.fromEntries(
      Object.entries(state.notes).map(([id, names]) => [id, names.filter((n) => n !== name)]),
    ),
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
 * cell for them. With a suspect picked otherwise: takes them off if they stand
 * there, else places them, over whatever was there. With nobody picked: clears
 * the cross, or crosses the cell out over whoever stood there, which also
 * clears every note on it.
 */
export const clickCell = (
  state: GameState,
  cell: Cell,
  selected: string | null,
  mode: Mode = 'place',
): GameState => {
  if (mode === 'note' && selected) return toggleNote(state, selected, cell)
  const name = cellName(cell)
  if (selected) {
    if (personAt(state, cell) !== selected) return put(state, selected, cell)
    const placements = { ...state.placements }
    delete placements[selected]
    return { ...state, placements }
  }
  if (state.crosses.includes(name)) {
    return { ...state, crosses: state.crosses.filter((other) => other !== name) }
  }
  return crossOut(state, cell)
}

/** Dropping a dragged person, or the cross, on a cell replaces whatever was there. */
export const dropOn = (state: GameState, dragged: string, cell: Cell): GameState =>
  dragged === CROSS ? crossOut(state, cell) : put(state, dragged, cell)

/** The board rules a check names when broken, before the clues. */
const ONE_PER_LINE = 'Exactement une personne par ligne et par colonne'
const STANDING = 'Chacun se tient sur le sol ou sur un meuble où il peut s’asseoir ou s’allonger'

/**
 * What the "Vérifier" button finds wrong in a complete placement: the board
 * rules (one per row and column, on placeable cells), then every clue the
 * murder included. Judged on the rules rather than against data/solution.ts,
 * so that any placement the clues allow wins.
 */
export const brokenRules = (puzzle: Puzzle, placements: Placements): ClueRef[] => {
  const placed = puzzle.people.flatMap((id) => placements[id] ?? [])
  const distinct = (values: number[]) => new Set(values).size === values.length
  const board = [
    {
      text: ONE_PER_LINE,
      holds: distinct(placed.map((cell) => cell.row)) && distinct(placed.map((cell) => cell.col)),
    },
    { text: STANDING, holds: placed.every(({ row, col }) => puzzle.board.placeable[row]![col]) },
  ]
  return [
    ...board.filter(({ holds }) => !holds).map(({ text }) => ({ text })),
    ...brokenClues(puzzle, placements),
  ]
}

/** What a click on a cell does: place or note for the picked suspect, cross out with nobody picked. */
export type Tool = Mode | 'cross'

/** What a click on a cell will do, for the cursor over the map and the toolbar. */
export const clickEffect = (selected: string | null, mode: Mode): Tool =>
  selected ? mode : 'cross'
